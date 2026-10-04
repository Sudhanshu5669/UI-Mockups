/* LOWLIFE — router, actions, render loop */
(function () {
  const LL = window.LL;
  const $ = (id) => document.getElementById(id);
  const S = () => LL.state;
  const A = (LL.acts = {});

  // ------------------------------------------------------------------ routing ---
  const ROUTES = {
    '': ['home', 'home', 'home'],
    menu: ['menu', 'menu', 'menu'],
    dish: ['dish', 'menu', 'menu'],
    send: ['send', 'menu', 'menu'],
    order: ['order', 'menu', 'order'],
    book: ['book', 'book', 'book'],
    booked: ['booked', 'book', 'book'],
    events: ['events', 'events', ''],
    private: ['private', 'private', ''],
    rewards: ['rewards', 'rewards', 'rewards'],
    visit: ['visit', 'visit', ''],
    kitchen: ['kitchen', '', ''],
  };
  LL.parseRoute = () => {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    let name = parts[0] || '';
    if (name === 'book' && parts[1] === 'map') return { page: 'map', nav: 'book', tab: 'book', arg: null, key: 'map' };
    const r = ROUTES[name] || ROUTES[''];
    return { page: r[0], nav: r[1], tab: r[2], arg: parts[1] || null, key: r[0] + (parts[1] || '') };
  };
  const TITLES = { home: 'Home', menu: 'Menu', dish: 'Dish', send: 'Send to kitchen', order: 'Your order', book: 'Book a table', map: 'Pick your spot', booked: 'You’re in', events: 'Events', private: 'Private events', rewards: 'Rewards', visit: 'Visit', kitchen: 'Kitchen pass' };

  // ------------------------------------------------------------------- render ---
  let curKey = null;
  function restoreFocus(snap) {
    if (!snap || !snap.id) return;
    const n = $(snap.id);
    if (!n) return;
    n.focus();
    try { n.setSelectionRange(snap.s, snap.e); } catch (e) {}
  }
  function snapFocus() {
    const a = document.activeElement;
    return a && a.id && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
  }

  LL.render = (opts = {}) => {
    const R = LL.parseRoute();
    const st = S();
    const changed = R.key !== curKey;
    const snap = snapFocus();
    const root = document.documentElement;
    root.dataset.mode = st.mode;
    document.body.dataset.route = R.page;

    $('nav').innerHTML = LL.navHTML(R.nav);
    $('tabbar').innerHTML = LL.tabbarHTML(R.tab);

    // tick updates only touch live pages so typing elsewhere isn't disturbed
    const livePage = R.page === 'order' || R.page === 'kitchen';
    if (!opts.tick || livePage) {
      const y = window.scrollY;
      $('page').innerHTML = (LL.pages[R.page] || LL.pages.home)(R.arg) + (R.page === 'kitchen' ? '' : LL.footerHTML());
      if (changed) { window.scrollTo(0, 0); $('page').classList.remove('fade'); void $('page').offsetWidth; $('page').classList.add('fade'); document.title = `LOWLIFE — ${TITLES[R.page] || ''}`; }
      else window.scrollTo(0, y);
      if (LL.after[R.page]) LL.after[R.page]();
      const log = $('chat-log');
      if (log) log.scrollTop = log.scrollHeight;
    }
    curKey = R.key;

    $('drawer').innerHTML = LL.drawerHTML();
    document.body.classList.toggle('lock', !!(LL.ui.tray || LL.ui.modal || LL.ui.menu));
    if (!opts.tick || LL.ui.modal) $('modal').innerHTML = LL.modalHTML();
    $('tweaks').innerHTML = LL.tweaksHTML();
    restoreFocus(snap);
  };

  LL.subscribe((o) => LL.render(o));
  window.addEventListener('hashchange', () => {
    LL.ui.tray = false; LL.ui.menu = false; LL.ui.modal = null; LL.ui.paying = null;
    LL.render();
  });

  // ------------------------------------------------------------- input binding ---
  document.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.bind;
    if (!k) return;
    if (k.startsWith('priv.')) LL.privState()[k.slice(5)] = e.target.value;
    else if (k === 'dfNote') LL.dishState(LL.parseRoute().arg).note = e.target.value;
    else LL.form[k] = e.target.value;
  });
  document.addEventListener('keydown', (e) => {
    const en = e.target.dataset && e.target.dataset.enter;
    if (e.key === 'Enter' && en && A[en]) { e.preventDefault(); A[en](e.target, e); }
    if (e.key === 'Escape' && (LL.ui.modal || LL.ui.tray || LL.ui.menu)) { LL.ui.modal = null; LL.ui.tray = false; LL.ui.menu = false; LL.render(); }
  });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = A[el.dataset.act];
    if (!fn) return;
    if (!(el.tagName === 'A' && el.getAttribute('href'))) e.preventDefault();
    fn(el, e);
  });

  const go = (h) => { if (location.hash === h) LL.render(); else location.hash = h; };
  const commit = (o) => LL.commit(o);
  const where = () => S().table || (S().booked && S().booked.table);

  // -------------------------------------------------------------- shell actions ---
  A.openTray = () => { LL.ui.tray = true; LL.render(); };
  A.closeTray = (el, e) => { if (el.dataset.bg && e.target !== el) return; LL.ui.tray = false; LL.render(); };
  A.openMenu = () => { LL.ui.menu = true; LL.render(); };
  A.closeMenu = () => { LL.ui.menu = false; LL.render(); };
  A.openModal = (el) => { LL.ui.menu = false; LL.ui.tray = false; LL.ui.modal = { type: el.dataset.type, id: el.dataset.id }; LL.render(); };
  A.closeModal = (el, e) => { if (!el.dataset.force && e.target !== el) return; LL.ui.modal = null; LL.ui.paying = null; LL.render(); };
  A.toggleTweaks = () => { LL.ui.tweaks = !LL.ui.tweaks; LL.render(); };
  A.setMode = (el) => { S().mode = el.dataset.v; commit(); };
  A.setLive = (el) => { S().live = el.dataset.v === '1'; commit(); };
  A.setSpeed = (el) => { S().speed = parseFloat(el.dataset.v); commit(); };
  A.resetDemo = () => { LL.form = {}; LL.dishForm = null; LL.ui.tweaks = false; LL.resetDemo(); LL.toast('DEMO DATA RESET', '↺'); go('#/'); };
  A.join = () => {
    const v = (LL.form.joinEmail || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) return LL.toast('ENTER A VALID EMAIL', '!');
    LL.form.joinEmail = '';
    LL.toast('YOU’RE ON THE SECRET LIST', '✓');
    LL.render();
  };

  // ---------------------------------------------------------------- tray / menu ---
  A.qty = (el) => { LL.changeQty(el.dataset.key, parseInt(el.dataset.d, 10)); commit(); };
  A.quickAdd = (el) => { const d = LL.addToTray(el.dataset.id, { heat: 'LOUD' }); LL.toast(`${d.name.toUpperCase()} ADDED TO TRAY`); commit(); };
  A.addDish = (el) => { const d = LL.addToTray(el.dataset.id); LL.toast(`${d.name.toUpperCase()} ADDED TO TRAY`); commit(); };
  A.setCat = (el) => { LL.form.cat = el.dataset.id; LL.render(); };
  A.gotoCat = (el) => { LL.form.cat = el.dataset.id; };
  A.toggleDiet = (el) => { const d = LL.dietOn(); d[el.dataset.k] = !d[el.dataset.k]; LL.render(); };
  A.clearDiet = () => { LL.form.diet = { veg: false, gf: false, spicy: false }; LL.render(); };

  // -------------------------------------------------------------------- tables ---
  A.setTable = (el) => {
    const had = S().orders.some((o) => o.guest === S().guest && o.pre);
    LL.checkIn(el.dataset.id);
    LL.ui.modal = null;
    LL.toast(`YOU’RE AT ${LL.tableName(el.dataset.id).toUpperCase()}${had ? ' · PRE-ORDER FIRED' : ''}`, '✓');
    commit();
  };
  A.scanQR = () => A.setTable({ dataset: { id: S().booked ? S().booked.table : 'T4' } });
  A.checkInBooked = () => {
    if (!S().booked) return;
    const onConf = LL.parseRoute().page === 'booked';
    A.setTable({ dataset: { id: S().booked.table } });
    if (onConf) go('#/menu');
  };

  // --------------------------------------------------------------------- dish ---
  A.dfThumb = (el) => { LL.dishState(LL.parseRoute().arg).thumb = +el.dataset.i; LL.render(); };
  A.dfHeat = (el) => { LL.dishState(LL.parseRoute().arg).heat = el.dataset.v; LL.render(); };
  A.dfAddon = (el) => { const f = LL.dishState(LL.parseRoute().arg); const i = f.addons.indexOf(el.dataset.id); i < 0 ? f.addons.push(el.dataset.id) : f.addons.splice(i, 1); LL.render(); };
  A.dfPair = () => { const f = LL.dishState(LL.parseRoute().arg); f.pair = !f.pair; LL.render(); };
  A.dfQty = (el) => { const f = LL.dishState(LL.parseRoute().arg); f.qty = Math.max(1, Math.min(12, f.qty + parseInt(el.dataset.d, 10))); LL.render(); };
  A.dfAdd = () => {
    const id = LL.parseRoute().arg;
    const d = LL.dish(id);
    const f = LL.dishState(id);
    LL.addToTray(id, { heat: f.heat, addons: f.addons, qty: f.qty, note: f.note.trim() });
    if (f.pair && d.pair) LL.addToTray(d.pair);
    LL.toast(`${d.name.toUpperCase()}${f.pair ? ' + DRINK' : ''} ADDED TO TRAY`);
    LL.dishForm = null;
    commit();
    go('#/menu');
  };

  // --------------------------------------------------------------------- send ---
  A.sendMode = (el) => { if (el.classList.contains('dis')) return; LL.form.sendMode = el.dataset.v; LL.render(); };
  A.setCourse = (el) => { if (el.classList.contains('dis')) return; LL.form.course = el.dataset.v; LL.render(); };
  A.toggleAllergy = (el) => { const a = LL.form.allergies || (LL.form.allergies = []); const i = a.indexOf(el.dataset.v); i < 0 ? a.push(el.dataset.v) : a.splice(i, 1); LL.render(); };
  A.sendOrder = () => {
    const F = LL.form, st = S();
    const mode = F.sendMode || (st.table ? 'table' : st.booked ? 'pre' : 'table');
    if (mode === 'table' && !st.table) { LL.toast('SET YOUR TABLE FIRST', '!'); LL.ui.modal = { type: 'table' }; return LL.render(); }
    if (mode === 'pre' && !st.booked) return LL.toast('BOOK A TABLE FIRST', '!');
    const both = st.tray.some((i) => i.station === 'kitchen') && st.tray.some((i) => i.station === 'bar');
    const o = LL.sendTray({ name: (F.sendName !== undefined ? F.sendName : st.user ? st.user.name : '').trim(), course: both ? F.course : 'now', allergies: F.allergies || [], note: (F.sendNote || '').trim(), pre: mode === 'pre' });
    F.allergies = []; F.sendNote = ''; F.course = 'now'; F.sendMode = undefined;
    LL.toast(`${o.id} ${o.pre ? 'PRE-ORDER SAVED' : 'SENT TO THE KITCHEN'}`, '✓');
    commit();
    go('#/order');
  };

  // -------------------------------------------------------------------- order ---
  A.sendChat = () => { const t = (LL.form.chat || '').trim(); if (!t) return; LL.say(t); LL.form.chat = ''; commit(); };
  A.quickMsg = (el) => { LL.say(el.dataset.v); commit(); };
  A.fire = (el) => { LL.fireOrder(el.dataset.id); LL.toast('FOOD FIRED — CHEFS ARE ON IT', '🔥'); commit(); };
  A.service = (el) => {
    const v = el.dataset.v;
    if (v === 'server') LL.say('CALLED A SERVER', { kind: 'alert' });
    else LL.say({ water: 'Could we get water for the table, please?', cutlery: 'Could we get cutlery and napkins, please?', clean: 'Could you clear our plates when you get a sec?' }[v]);
    LL.toast(v === 'server' ? 'SERVER ON THEIR WAY' : 'REQUEST SENT', '✓');
    commit();
  };
  A.askBill = () => { S().billAsked = true; LL.say('BILL REQUESTED', { kind: 'alert' }); LL.toast('BILL ON ITS WAY', '✓'); commit(); };
  A.setTip = (el) => { S().tipPct = parseInt(el.dataset.v, 10); S().tipCustom = null; commit(); };
  A.setCustomTip = () => {
    const v = parseFloat(LL.form.tipAmt);
    if (isNaN(v) || v < 0) return LL.toast('ENTER AN AMOUNT', '!');
    S().tipCustom = v; LL.ui.modal = null; commit();
  };
  A.doPay = () => {
    if (LL.ui.paying) return;
    LL.ui.paying = {};
    LL.render();
    setTimeout(() => { const r = LL.payTab(); LL.ui.paying = Object.assign({ done: true }, r || { total: 0, earned: 0 }); commit(); }, 900);
  };

  // ------------------------------------------------------------------ booking ---
  const BK = () => S().booking;
  const fits = (id, party) => LL.tableCap(id)[1] >= party;
  const hold = () => { LL.holdUntil = Date.now() + 10 * 60 * 1000; };
  A.bkParty = (el) => {
    const b = BK(), n = b.party + parseInt(el.dataset.d, 10);
    if (n > 8) return LL.toast('PARTIES OF 9+ → PRIVATE EVENTS', '!');
    if (n < 1) return;
    b.party = n;
    if (b.table && !fits(b.table, n)) b.table = null;
    commit();
  };
  A.bkDay = (el) => { BK().day = +el.dataset.n; if (!LL.slot(BK().day, BK().time).ok) BK().time = LL.TIMES.find((t) => LL.slot(BK().day, t).ok); commit(); };
  A.bkTime = (el) => { BK().time = el.dataset.t; commit(); };
  A.bkZone = (el) => { const b = BK(); b.zone = el.dataset.z; if (b.table && LL.tableZone(b.table) !== b.zone) b.table = null; commit(); };
  A.bkMap = () => { go('#/book/map'); };
  A.bkContinue = () => {
    const b = BK();
    if (!b.table) {
      const c = LL.TABLES.find((t) => t.z === b.zone && LL.floorState(t.id) === 'free' && fits(t.id, b.party));
      if (!c) { LL.toast('NOTHING FREE THERE — TRY THE MAP', '!'); return go('#/book/map'); }
      b.table = c.id; hold();
    }
    commit({ silent: true });
    go('#/book/map');
  };
  A.pickTable = (el) => {
    const id = el.dataset.id, b = BK();
    const s = LL.floorState(id);
    if (s === 'sel') return;
    if (s !== 'free') return LL.toast('SOMEONE’S ON THAT ONE', '✕');
    if (!fits(id, b.party)) return LL.toast(`${LL.tableName(id).toUpperCase()} SEATS UP TO ${LL.tableCap(id)[1]}`, '!');
    b.table = id;
    if (LL.BOOK_ZONES.includes(LL.tableZone(id))) b.zone = LL.tableZone(id);
    hold();
    commit();
  };
  A.lockIn = () => {
    const b = BK();
    if (!b.table) return;
    S().booked = { ...b, ref: `LL-10${String(b.day).padStart(2, '0')}-${b.table}`, name: (S().user && S().user.name) || 'Guest' };
    LL.toast('TABLE LOCKED IN', '✓');
    commit();
    go('#/booked');
  };
  A.addCal = () => {
    const bk = S().booked;
    const [h, m] = bk.time.split(':').map(Number);
    const pad = (n) => String(n).padStart(2, '0');
    const H = h < 12 ? h + 12 : h;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LOWLIFE//Prototype//EN', 'BEGIN:VEVENT', `UID:${bk.ref}@lowlife.bar`, `DTSTART:2026-10-${pad(bk.day)}T${pad(H)}${pad(m)}00`.replace(/-/g, ''), `DTEND:2026-10-${pad(bk.day)}T${pad(Math.min(23, H + 2))}${pad(m)}00`.replace(/-/g, ''), `SUMMARY:LOWLIFE — ${LL.tableName(bk.table)} for ${bk.party}`, 'LOCATION:88 Wire St\\, Downtown', `DESCRIPTION:Booking ${bk.ref}. Show the QR at the door.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'lowlife-booking.ics';
    document.body.appendChild(a); a.click(); a.remove();
    LL.toast('CALENDAR EVENT SAVED', '✓');
  };
  A.imLate = () => { LL.toast('WE’LL HOLD IT 15 MORE MINUTES', '✓'); };
  A.preAdd = (el) => { const d = LL.addToTray(el.dataset.id, { qty: +el.dataset.q }); LL.toast(`${el.dataset.q > 1 ? el.dataset.q + ' × ' : ''}${d.name.toUpperCase()} ADDED`); commit(); };

  // ------------------------------------------------------------ events/private ---
  A.setEv = (el) => { LL.form.evType = el.dataset.v; LL.render(); };
  A.glStep = (el) => { LL.form.glN = Math.max(1, Math.min(10, (LL.form.glN || 2) + parseInt(el.dataset.d, 10))); LL.render(); };
  A.confirmGuestlist = (el) => {
    const e = LL.EVENTS.find((x) => x.id === el.dataset.id);
    const n = LL.form.glN || 2;
    LL.ui.modal = null;
    LL.toast(`${e.title.split(' —')[0].split(':')[0]} · ${n} GUEST${n > 1 ? 'S' : ''} ✓`, '✓');
    LL.render();
  };
  A.privSpace = (el) => { LL.privState().space = el.dataset.id; LL.render(); };
  A.privOcc = (el) => { LL.privState().occasion = el.dataset.v; LL.render(); };
  A.privSend = () => {
    const p = LL.privState();
    const err = {};
    if (!p.date.trim()) err.date = 'REQUIRED';
    if (!/^\d+$/.test(p.guests.replace(/[~\s]/g, ''))) err.guests = 'A NUMBER';
    if (!p.name.trim()) err.name = 'REQUIRED';
    if (!/^\S+@\S+\.\S+$/.test(p.email.trim())) err.email = 'INVALID';
    p.err = err;
    if (Object.keys(err).length) { LL.toast('A FEW FIELDS NEED LOVE', '!'); return LL.render(); }
    p.sent = true;
    LL.render();
    window.scrollTo({ top: document.querySelector('.priv-form').offsetTop - 120, behavior: 'smooth' });
  };
  A.privReset = () => { LL.form.priv = null; LL.render(); };

  // ------------------------------------------------------------------ rewards ---
  A.signIn = () => {
    const name = (LL.form.siName || 'Jordan Reyes').trim() || 'Jordan Reyes';
    S().user = { name, phone: LL.form.siPhone || '' };
    LL.ui.modal = null;
    LL.toast(`WELCOME BACK, ${name.split(' ')[0].toUpperCase()}`, '✓');
    commit();
  };
  A.signOut = () => { S().user = null; LL.toast('SIGNED OUT', '✓'); commit(); };
  A.redeem = (el) => {
    const r = LL.REWARDS.find((x) => x.id === el.dataset.id);
    if (S().points < r.pts) return;
    S().points -= r.pts;
    if (r.id === 'shots') { LL.addToTray('reward-shots', { reward: true }); LL.toast('ROUND OF SHOTS ADDED TO TRAY — FREE', '🥃'); }
    else LL.toast('SKIP-THE-LINE PASS SAVED — SHOW AT THE DOOR', '✓');
    commit();
  };
  A.reorder = (el) => {
    LL.USUALS[+el.dataset.i].items.forEach(([id, q]) => LL.addToTray(id, { qty: q, heat: 'LOUD' }));
    LL.toast('YOUR USUAL IS IN THE TRAY', '+');
    LL.ui.tray = true;
    commit();
  };
  A.faq = (el) => { const i = +el.dataset.i; LL.form.faq = LL.form.faq === i ? -1 : i; LL.render(); };
  A.directions = () => LL.toast('DIRECTIONS TO 88 WIRE ST (DEMO)', '➜');
  A.ride = () => LL.toast('RIDE REQUESTED (DEMO)', '➜');

  // ------------------------------------------------------------------ kitchen ---
  A.setKF = (el) => { LL.form.kf = el.dataset.v; LL.render(); };
  A.kAdvance = (el) => { LL.advanceItem(el.dataset.o, el.dataset.i); commit(); };
  A.kBump = (el) => { LL.bumpOrder(el.dataset.o); commit(); };
  A.kFire = (el) => { LL.fireOrder(el.dataset.o); commit(); };
  A.kThread = (el) => { LL.form.kthread = el.dataset.g; LL.render(); };
  function kReply(text) {
    const g = LL.form.kthread;
    if (!g || !text) return;
    const ms = S().msgs.filter((m) => m.guest === g);
    const tbl = (ms.find((m) => m.table) || {}).table;
    S().msgs.forEach((m) => { if (m.guest === g && m.from === 'guest') m.handled = true; });
    LL.say(text, { from: 'kitchen', guest: g, table: tbl });
    commit();
  }
  A.kSend = () => { const t = (LL.form.kmsg || '').trim(); LL.form.kmsg = ''; kReply(t); };
  A.kQuick = (el) => kReply(el.dataset.v);

  // -------------------------------------------------------------------- tickers ---
  function patchLive() {
    document.querySelectorAll('[data-since]').forEach((n) => { n.textContent = (n.closest('.kt') ? '' : 'SENT ') + LL.ago(+n.dataset.since); });
    document.querySelectorAll('[data-live=hold]').forEach((n) => { n.textContent = LL.holdLeft(); });
    document.querySelectorAll('[data-live=seats]').forEach((n) => { n.textContent = LL.seatsLeft(); });
  }
  setInterval(() => {
    LL.tick();
    patchLive();
    const b = S().booking;
    if (b.table && LL.holdUntil && Date.now() > LL.holdUntil && LL.parseRoute().page === 'map') {
      b.table = null; LL.holdUntil = 0;
      LL.toast('HOLD EXPIRED — PICK AGAIN', '!');
      commit();
    }
  }, 1000);
  setInterval(() => {
    if (!LL.floorTick()) return;
    document.querySelectorAll('[data-tbl]').forEach((n) => {
      const s = LL.floorState(n.dataset.tbl);
      n.className = 'tb ' + s;
      n.textContent = s === 'held' ? 'HELD' : n.dataset.tbl;
    });
    patchLive();
  }, 1900);

  // -------------------------------------------------------------------- boot ---
  window.addEventListener('DOMContentLoaded', () => {
    if (!LL.holdUntil) hold();
    LL.render();
  });
})();
