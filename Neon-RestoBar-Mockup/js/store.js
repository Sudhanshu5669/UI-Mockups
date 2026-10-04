/* LOWLIFE — state, persistence, order lifecycle + kitchen simulation */
(function () {
  const LL = window.LL;
  const KEY = 'lowlife-proto-v1';
  const uid = () => Math.random().toString(36).slice(2, 9);
  LL.uid = uid;

  // item stages: -1 HELD · 0 RECEIVED · 1 COOKING · 2 PLATING · 3 ON ITS WAY · 4 SERVED
  LL.STAGES = {
    kitchen: ['RECEIVED', 'ON THE FIRE', 'PLATING', 'ON ITS WAY', 'SERVED'],
    bar: ['RECEIVED', 'SHAKING', 'GARNISH', 'ON ITS WAY', 'SERVED'],
  };
  // demo-scaled seconds spent in stages 0..3
  LL.DUR = { bar: [3, 7, 4, 5], kitchen: [4, 16, 6, 6] };

  const defaults = () => ({
    mode: 'dark',
    live: true,
    speed: 1,
    guest: 'g_' + uid(),
    user: null,
    points: 1240,
    table: null,
    tray: [],
    orders: [],
    msgs: [],
    booking: { party: 4, day: 9, time: '9:30', zone: 'booth', table: null },
    booked: null,
    tipPct: 18,
    tipCustom: null,
    seq: 2741,
    lastSpawn: 0,
    billAsked: false,
    seeded: false,
    receipts: [],
  });

  function parse(raw) {
    try {
      const s = JSON.parse(raw);
      return Object.assign(defaults(), s);
    } catch (e) {
      return null;
    }
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    return (raw && parse(raw)) || defaults();
  }
  LL.state = load();

  const listeners = [];
  LL.subscribe = (fn) => listeners.push(fn);
  LL.save = () => { try { localStorage.setItem(KEY, JSON.stringify(LL.state)); } catch (e) {} };
  LL.commit = (opts) => { LL.save(); listeners.forEach((fn) => fn(opts || {})); };
  LL.resetDemo = () => {
    try { localStorage.removeItem(KEY); } catch (e) {}
    const keepMode = LL.state.mode;
    LL.state = defaults();
    LL.state.mode = keepMode;
    seedKitchen();
    LL.commit({ full: true });
  };

  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    const s = parse(e.newValue);
    if (!s) return;
    // keep this tab's identity (guest id) so "my orders" stay mine
    LL.state = Object.assign(s, { guest: LL.state.guest });
    listeners.forEach((fn) => fn({ remote: true }));
  });

  // ---- formatting ---------------------------------------------------------------
  LL.money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(2);
  LL.p = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  LL.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- tray ---------------------------------------------------------------------
  LL.cartCount = () => LL.state.tray.reduce((n, i) => n + i.qty, 0);
  LL.trayTotal = () => LL.state.tray.reduce((n, i) => n + i.qty * i.price, 0);

  LL.addToTray = (dishId, o = {}) => {
    const d = LL.dish(dishId);
    if (!d) return null;
    const heat = d.heat ? (o.heat || 'LOUD') : null;
    const addIds = (o.addons || []).slice().sort();
    const addons = (d.addons || []).filter((a) => addIds.includes(a.id));
    const price = d.price + addons.reduce((n, a) => n + a.price, 0);
    const mods = [heat, ...addons.map((a) => '+ ' + a.name)].filter(Boolean).join(' · ');
    const key = [dishId, heat, addIds.join('+'), o.note || '', o.reward ? 'r' : '', o.pre ? 'p' : ''].join('|');
    const qty = o.qty || 1;
    const ex = LL.state.tray.find((i) => i.key === key);
    if (ex) ex.qty += qty;
    else LL.state.tray.push({ key, dishId, name: d.name, price: o.reward ? 0 : price, qty, mods, note: o.note || '', station: d.station, mins: d.mins, reward: !!o.reward });
    return d;
  };
  LL.changeQty = (key, delta) => {
    const t = LL.state.tray;
    const i = t.findIndex((x) => x.key === key);
    if (i < 0) return;
    t[i].qty += delta;
    if (t[i].qty <= 0) t.splice(i, 1);
  };
  LL.trayCount = (dishId) => LL.state.tray.filter((i) => i.dishId === dishId).reduce((n, i) => n + i.qty, 0);

  // ---- orders -------------------------------------------------------------------
  LL.myOrders = () => LL.state.orders.filter((o) => o.guest === LL.state.guest);
  LL.myOpenOrders = () => LL.myOrders().filter((o) => !o.paid);
  LL.activeCount = () => LL.myOpenOrders().reduce((n, o) => n + o.items.filter((i) => i.st < 4).length, 0);

  LL.sendTray = ({ name, course, allergies, note, pre }) => {
    const S = LL.state;
    if (!S.tray.length) return null;
    const now = Date.now();
    const hold = course === 'hold';
    const order = {
      id: 'LL-' + S.seq++,
      guest: S.guest,
      table: pre ? (S.booked && S.booked.table) : S.table,
      pre: !!pre,
      name: name || (S.user && S.user.name) || 'Guest',
      allergies: allergies || [],
      note: note || '',
      course: hold ? 'hold' : 'now',
      t: now,
      paid: false,
      items: [],
    };
    S.tray.forEach((i) => {
      const held = pre || (hold && i.station === 'kitchen');
      order.items.push({ id: uid(), dishId: i.dishId, name: i.name, qty: i.qty, price: i.price, mods: i.mods, note: i.note, station: i.station, mins: i.mins, reward: i.reward, st: held ? -1 : 0, at: now });
    });
    S.orders.unshift(order);
    S.tray = [];
    S.msgs.push({ id: uid(), t: now, from: 'system', kind: 'sent', text: `ORDER ${order.id} SENT — ${order.items.reduce((n, i) => n + i.qty, 0)} ITEMS`, table: order.table, guest: S.guest, handled: true });
    return order;
  };

  LL.checkIn = (tableId) => {
    const S = LL.state;
    S.table = tableId;
    const now = Date.now();
    S.orders.forEach((o) => {
      if (o.guest !== S.guest || !o.pre) return;
      o.pre = false;
      o.table = tableId;
      o.items.forEach((i) => {
        if (i.st === -1 && !(o.course === 'hold' && i.station === 'kitchen')) { i.st = 0; i.at = now; }
      });
    });
  };

  LL.fireOrder = (orderId) => {
    const o = LL.state.orders.find((x) => x.id === orderId);
    if (!o) return;
    const now = Date.now();
    o.items.forEach((i) => { if (i.st === -1) { i.st = 0; i.at = now; } });
    LL.state.msgs.push({ id: uid(), t: now, from: 'system', kind: 'fire', text: `FIRE THE FOOD — ${o.id}`, table: o.table, guest: o.guest, handled: true });
  };
  LL.advanceItem = (orderId, itemId) => {
    const o = LL.state.orders.find((x) => x.id === orderId);
    const it = o && o.items.find((i) => i.id === itemId);
    if (!it || it.st >= 4) return;
    it.st = it.st < 0 ? 0 : it.st + 1;
    it.at = Date.now();
  };
  LL.bumpOrder = (orderId) => {
    const o = LL.state.orders.find((x) => x.id === orderId);
    if (!o) return;
    const now = Date.now();
    o.items.forEach((i) => { if (i.st >= 0 && i.st < 4) { i.st = 4; i.at = now; } });
  };
  LL.orderDone = (o) => o.items.every((i) => i.st === 4);

  LL.etaMins = (o) => {
    let m = 0;
    o.items.forEach((i) => {
      if (i.st < 0 || i.st >= 4) return;
      const d = LL.DUR[i.station];
      const total = d.reduce((a, b) => a + b, 0);
      const done = d.slice(0, i.st).reduce((a, b) => a + b, 0) + Math.min(d[i.st], (Date.now() - i.at) / 1000 / LL.state.speed);
      m = Math.max(m, Math.ceil(i.mins * Math.max(0, 1 - done / total)));
    });
    return m;
  };

  // ---- tab ----------------------------------------------------------------------
  LL.tab = () => {
    const S = LL.state;
    const lines = [];
    LL.myOpenOrders().forEach((o) => o.items.forEach((i) => lines.push({ ...i, order: o.id })));
    const subtotal = lines.reduce((n, i) => n + i.qty * i.price, 0);
    const tax = subtotal * LL.TAX;
    const tipBase = S.tipCustom != null ? S.tipCustom : subtotal * (S.tipPct / 100);
    const tip = lines.length ? tipBase : 0;
    const disc = S.user ? subtotal * 0.1 : 0;
    return { lines, subtotal, tax, tip, disc, total: subtotal + tax + tip - disc };
  };
  LL.payTab = () => {
    const S = LL.state;
    const t = LL.tab();
    if (!t.lines.length) return null;
    const earned = Math.round(t.subtotal);
    S.orders.forEach((o) => { if (o.guest === S.guest && !o.paid) o.paid = true; });
    if (S.user) S.points += earned;
    S.receipts.unshift({ t: Date.now(), total: t.total, table: S.table, earned: S.user ? earned : 0 });
    S.billAsked = false;
    S.msgs.push({ id: uid(), t: Date.now(), from: 'system', kind: 'paid', text: `TAB CLOSED · ${LL.money(t.total)}`, table: S.table, guest: S.guest, handled: true });
    return { total: t.total, earned: S.user ? earned : 0 };
  };

  // ---- chat / service -----------------------------------------------------------
  LL.say = (text, o = {}) => {
    const S = LL.state;
    S.msgs.push({ id: uid(), t: Date.now(), from: o.from || 'guest', kind: o.kind || 'msg', text, table: o.table !== undefined ? o.table : S.table || (S.booked && S.booked.table), guest: o.guest || S.guest, handled: o.from && o.from !== 'guest' });
  };
  LL.thread = (guest) => LL.state.msgs.filter((m) => m.guest === guest);
  LL.myThread = () => LL.thread(LL.state.guest);

  function replyFor(text) {
    const t = text.toLowerCase();
    if (/allerg|nut|gluten|dairy|shellfish|sesame|egg/.test(t)) return ['kitchen', 'Flagged on your ticket — Chef Ravi is checking it right now. Nothing touches your plate that shouldn’t.'];
    if (/rush|hurry|fast|asap|quick/.test(t)) return ['kitchen', 'On it — bumping you up the pass.'];
    if (/cutlery|napkin|water|fork|knife|plate|glass/.test(t)) return ['server', 'Sending someone over with that now.'];
    if (/spice|heat|loud|mild|unhinged/.test(t)) return ['kitchen', 'Heat adjusted. Chef says you’ll live.'];
    if (/hold|without|no |remove|skip|cancel/.test(t)) return ['kitchen', 'No problem — amended. Anything else?'];
    if (/thank|good|great|perfect|love/.test(t)) return ['kitchen', 'Anytime. Enjoy it.'];
    return ['kitchen', 'Got it — we’re on it.'];
  }

  // ---- simulation ---------------------------------------------------------------
  const SEED_TABLES = ['T4', 'S3', 'P1', 'C2', 'B3', 'T1', 'P5', 'S6'];
  const SEED_NAMES = ['Priya', 'Marcus', 'Dee', 'Tomás', 'Hana', 'Kofi', 'Alex', 'Noor'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeSeed(ageSec, advance) {
    const S = LL.state;
    const now = Date.now();
    const n = 2 + Math.floor(Math.random() * 3);
    const items = [];
    const used = new Set();
    for (let k = 0; k < n; k++) {
      const d = pick(LL.MENU);
      if (used.has(d.id)) continue;
      used.add(d.id);
      const st = advance ? Math.min(3, Math.floor(Math.random() * 3) + (d.station === 'bar' ? 1 : 0)) : 0;
      items.push({ id: uid(), dishId: d.id, name: d.name, qty: 1 + (Math.random() < 0.3 ? 1 : 0), price: d.price, mods: d.heat ? 'LOUD' : '', note: '', station: d.station, mins: d.mins, st, at: now - Math.random() * 3000 });
    }
    const tbl = pick(SEED_TABLES);
    const flagged = Math.random() < 0.25;
    return { id: 'LL-' + S.seq++, guest: 'seed_' + uid(), seed: true, table: tbl, pre: false, name: pick(SEED_NAMES), allergies: flagged ? [pick(LL.ALLERGIES)] : [], note: '', course: 'now', t: now - ageSec * 1000, paid: false, items };
  }
  function seedKitchen() {
    const S = LL.state;
    if (S.seeded) return;
    S.seeded = true;
    [150, 95, 40].forEach((age) => S.orders.push(makeSeed(age, true)));
    S.msgs.push({ id: uid(), t: Date.now() - 70000, from: 'guest', kind: 'msg', text: 'Can we get the wings extra crispy?', table: S.orders[0].table, guest: S.orders[0].guest, handled: true });
    S.msgs.push({ id: uid(), t: Date.now() - 55000, from: 'kitchen', kind: 'msg', text: 'Extra crispy, noted.', table: S.orders[0].table, guest: S.orders[0].guest, handled: true });
  }
  seedKitchen();

  LL.tick = () => {
    const S = LL.state;
    const now = Date.now();
    let changed = false;
    if (S.live) {
      S.orders.forEach((o) => o.items.forEach((i) => {
        if (i.st < 0 || i.st >= 4) return;
        const dur = (LL.DUR[i.station][i.st] * 1000) / S.speed;
        if (now - i.at >= dur) { i.st++; i.at = now; changed = true; }
      }));
      // other tables keep ordering so the pass looks alive
      const open = S.orders.filter((o) => o.seed && !LL.orderDone(o)).length;
      if (open < 4 && now - S.lastSpawn > 40000) {
        S.lastSpawn = now;
        S.orders.push(makeSeed(0, false));
        changed = true;
      }
      // clear old finished seed tickets
      const before = S.orders.length;
      S.orders = S.orders.filter((o) => !(o.seed && LL.orderDone(o) && now - Math.max(...o.items.map((i) => i.at)) > 25000));
      if (S.orders.length !== before) changed = true;
      // auto-reply when no human has answered
      S.msgs.slice().forEach((m) => {
        if (m.from !== 'guest' || m.handled || now - m.t < 4500) return;
        m.handled = true;
        const [from, text] = m.kind === 'alert' ? ['server', 'Coming right over.'] : replyFor(m.text);
        S.msgs.push({ id: uid(), t: now, from, kind: 'msg', text, table: m.table, guest: m.guest, handled: true });
        changed = true;
      });
    }
    if (changed) LL.commit({ tick: true });
  };

  // ---- floor plan (ephemeral, per tab) ------------------------------------------
  const taken = ['S2', 'S3', 'S6', 'B1', 'T2', 'T5', 'C1', 'C2', 'C4', 'P2', 'P5'];
  const held = ['T3', 'S7'];
  LL.floor = LL.TABLES.map((t) => ({ id: t.id, s: taken.includes(t.id) ? 'taken' : held.includes(t.id) ? 'held' : 'free' }));
  LL.floorState = (id) => {
    if (LL.state.booking.table === id) return 'sel';
    return LL.floor.find((t) => t.id === id).s;
  };
  LL.seatsLeft = () => Math.max(4, LL.floor.filter((t) => t.s === 'free').length);
  LL.floorTick = () => {
    if (!LL.state.live) return false;
    const pool = LL.floor.filter((t) => t.id !== LL.state.booking.table);
    const t = pool[Math.floor(Math.random() * pool.length)];
    t.s = { free: 'held', held: 'taken', taken: 'free' }[t.s];
    return true;
  };
})();
