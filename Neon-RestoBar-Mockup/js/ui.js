/* LOWLIFE — shared UI pieces */
(function () {
  const LL = window.LL;
  const esc = LL.esc;

  LL.ui = { tray: false, modal: null, tweaks: false, menu: false, paying: null, lastCount: null };
  LL.form = {};

  LL.liveDot = '<span class="livedot"></span>';
  LL.ph = (label, cls = '', style = '') => `<div class="ph ${cls}" style="${style}">${label ? `[ ${esc(label)} ]` : ''}</div>`;

  LL.toast = (text, plus = '+1') => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-ic">${esc(plus)}</span>${esc(text)}`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3900);
  };

  const NAV = [['menu', 'Menu'], ['book', 'Book'], ['events', 'Events'], ['private', 'Private'], ['rewards', 'Rewards'], ['visit', 'Visit']];
  LL.NAV = NAV;

  LL.navHTML = (active) => {
    const S = LL.state;
    const n = LL.cartCount();
    const bump = LL.ui.lastCount !== null && LL.ui.lastCount !== n ? ' bump' : '';
    LL.ui.lastCount = n;
    const act = LL.activeCount();
    return `
    <div class="nav">
      <a href="#/" class="logo"><span class="d">LOWLIFE</span><span class="mono ac">TIL 3AM</span></a>
      <nav class="links">${NAV.map(([k, l]) => `<a href="#/${k}" class="${k === active ? 'on' : ''}">${l}</a>`).join('')}</nav>
      <div class="navr">
        ${S.user ? `<a href="#/rewards" class="nl hide-m">${esc(S.user.name.split(' ')[0])}</a>` : `<button class="nl hide-m" data-act="openModal" data-type="signin">Sign in</button>`}
        ${S.table ? `<a class="seatpill hide-m" href="#/order"><span class="livedot"></span>${esc(LL.tableName(S.table))}${act ? ` · ${act} ON THE PASS` : ''}</a>` : ''}
        <button class="trayp" data-act="openTray" aria-label="Open tray"><span>TRAY</span><span class="badge${bump}">${n}</span></button>
        <button class="burger" data-act="openMenu" aria-label="Menu">☰</button>
      </div>
    </div>`;
  };

  LL.tabbarHTML = (active) => {
    const act = LL.activeCount();
    const tabs = [['', 'HOME', ''], ['menu', 'MENU', 'menu'], ['book', 'BOOK', 'book'], ['order', 'ORDER', 'order'], ['rewards', 'ME', 'rewards']];
    return tabs.map(([href, l, k]) => `<a href="#/${href}" class="${(k === active || (!k && active === 'home')) ? 'on' : ''}">${l}${k === 'order' && act ? ' <i></i>' : ''}</a>`).join('');
  };

  // ---- stepper ---------------------------------------------------------------
  LL.stepper = (key, n, act = 'qty') => `<span class="step"><button data-act="${act}" data-key="${esc(key)}" data-d="-1" aria-label="Less">−</button><b>${n}</b><button data-act="${act}" data-key="${esc(key)}" data-d="1" aria-label="More">+</button></span>`;

  // ---- tray -------------------------------------------------------------------
  LL.trayHTML = () => {
    const S = LL.state;
    const items = S.tray;
    const n = LL.cartCount();
    const open = LL.activeCount();
    const where = S.table ? LL.tableName(S.table) : S.booked ? 'PRE-ORDER · ' + LL.tableName(S.booked.table) : null;
    const hasCocktail = items.some((i) => LL.dish(i.dishId) && LL.dish(i.dishId).cat === 'cocktails');
    const sub = LL.trayTotal();
    return `
    <div class="tray">
      <div class="between baseline"><span class="d tray-h">YOUR TRAY</span><span class="mono mu sm">${n} ITEM${n === 1 ? '' : 'S'}</span></div>
      <button class="seatchip ${where ? '' : 'warn'}" data-act="openModal" data-type="table">
        ${where ? `<span class="livedot"></span><span>${esc(where)}</span><span class="mu">CHANGE</span>` : `<span>WHERE ARE YOU SITTING?</span><span class="ac">SET TABLE →</span>`}
      </button>
      <div class="tray-list">
        ${items.length ? items.map((i) => `
          <div class="tray-row">
            <span class="ph-s ph thumb"></span>
            <div class="grow col gap4"><span class="tn">${esc(i.name)}</span><span class="tm">${esc(i.reward ? 'REWARD · FREE' : i.mods || LL.p(i.price))}</span></div>
            ${LL.stepper(i.key, i.qty)}
          </div>`).join('') : `<div class="empty-sm">Nothing yet.<br><span class="mu">Tap a + to start your order.</span></div>`}
      </div>
      ${items.length && !hasCocktail ? `
      <div class="barsays">
        <div class="col gap4"><span class="lbl ac">THE BAR SAYS</span><span class="bs-t">Add a Neon Gimlet to the table?</span></div>
        <button class="plus-pill" data-act="addDish" data-id="neon-gimlet">+ $16</button>
      </div>` : ''}
      <div class="tray-tot">
        <div class="between mu"><span>Subtotal</span><span class="mono">${LL.money(sub)}</span></div>
        <div class="between mu"><span>Service</span><span class="mono">ON YOUR TAB</span></div>
        <div class="between tot"><span>Total</span><span class="mono">${LL.money(sub)}</span></div>
      </div>
      <a class="btn btn-ac ${items.length ? '' : 'off'}" href="#/send" data-act="closeTray" ${items.length ? '' : 'aria-disabled="true"'}>SEND TO KITCHEN →</a>
      ${open ? `<a class="link-line" href="#/order" data-act="closeTray">TRACK YOUR ORDER · ${open} ON THE PASS →</a>` : ''}
    </div>`;
  };

  LL.drawerHTML = () => (LL.ui.tray ? `
    <div class="dback" data-act="closeTray" data-bg="1"></div>
    <aside class="dpanel" role="dialog" aria-label="Your tray">
      <button class="x" data-act="closeTray" aria-label="Close">✕</button>
      ${LL.trayHTML()}
    </aside>` : '');

  // ---- footer ---------------------------------------------------------------
  LL.footerHTML = () => `
    <footer class="foot">
      <div class="wrap foot-in">
        <div>
          <div class="d foot-logo">LOWLIFE</div>
          <div class="join">
            <input id="join-email" class="join-in" type="email" placeholder="Email for secret menu drops" data-bind="joinEmail" value="${esc(LL.form.joinEmail || '')}" aria-label="Email">
            <button class="btn btn-tx btn-sm" data-act="join">JOIN</button>
          </div>
        </div>
        <div class="fcol"><span class="lbl">VISIT</span><span>88 Wire St</span><span>Downtown</span><span>(555) 014-0300</span></div>
        <div class="fcol"><span class="lbl">HOURS</span><span>Tue–Thu 5PM–1AM</span><span>Fri–Sat 5PM–3AM</span><span>Sun 4PM–12AM</span></div>
        <div class="fcol"><span class="lbl">FOLLOW</span><span>Instagram</span><span>TikTok</span><span>Spotify playlists</span><a class="stafflink" href="#/kitchen">STAFF · KITCHEN SCREEN →</a></div>
      </div>
    </footer>`;

  // ---- QR (decorative) --------------------------------------------------------
  LL.qr = (seed) => {
    let h = 2166136261;
    for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const N = 25;
    let r = '';
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="var(--on)"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (!inF && rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    return `<svg viewBox="-1 -1 27 27" fill="var(--ac)" shape-rendering="crispEdges" aria-label="QR code">${r}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
  };

  // ---- tweaks -----------------------------------------------------------------
  LL.tweaksHTML = () => {
    const S = LL.state;
    const seg = (act, val, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${String(v) === String(val) ? 'on' : ''}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div>`;
    return `
    <button class="tw-btn" data-act="toggleTweaks" aria-label="Tweaks">TWEAKS</button>
    ${LL.ui.tweaks ? `
    <div class="tw-panel">
      <div class="between"><span class="lbl">TWEAKS</span><button class="tw-x" data-act="toggleTweaks">✕</button></div>
      <div class="tw-row"><span>Theme</span>${seg('setMode', S.mode, [['dark', 'DARK'], ['light', 'LIGHT']])}</div>
      <div class="tw-row"><span>Live data</span>${seg('setLive', S.live ? 1 : 0, [[1, 'ON'], [0, 'OFF']])}</div>
      <div class="tw-row"><span>Kitchen speed</span>${seg('setSpeed', S.speed, [[1, '1×'], [2.5, '2.5×'], [6, '6×']])}</div>
      <a class="tw-link" href="#/kitchen" data-act="toggleTweaks">OPEN KITCHEN SCREEN (STAFF) →</a>
      <button class="tw-link" data-act="resetDemo">RESET DEMO DATA</button>
    </div>` : ''}`;
  };

  // ---- modals ---------------------------------------------------------------
  LL.modalHTML = () => {
    const m = LL.ui.modal;
    const S = LL.state;
    if (LL.ui.menu) {
      return `<div class="mback menu-full"><button class="x" data-act="closeMenu" data-force="1" aria-label="Close">✕</button>
        <div class="menu-links">${[['', 'Home'], ...NAV].map(([k, l]) => `<a href="#/${k}" data-act="closeMenu" data-force="1" class="d">${l}</a>`).join('')}
        <a href="#/order" data-act="closeMenu" data-force="1" class="d ac">Your order</a></div>
        <div class="mono mu sm" style="padding:0 var(--pad)">${S.user ? esc(S.user.name) : '<button class="linkbtn" data-act="openModal" data-type="signin">SIGN IN</button>'}</div></div>`;
    }
    if (!m) return '';
    let body = '';
    if (m.type === 'table') {
      const groups = ['bar', 'booth', 'floor', 'chef', 'terrace'];
      body = `
        <span class="lbl">NO TABLE YET</span>
        <div class="d mh">WHERE ARE YOU SITTING?</div>
        <p class="mu">Every table has a number on it. Tap yours — your order goes straight to the kitchen with it.</p>
        <button class="btn btn-ac" data-act="scanQR">SCAN TABLE QR (DEMO)</button>
        <div class="tgroups">${groups.map((z) => `
          <div class="tgroup"><span class="lbl">${esc(LL.ZONES[z].name.toUpperCase())}</span>
            <div class="row fw gap8">${LL.TABLES.filter((t) => t.z === z).map((t) => `<button class="chip ${S.table === t.id ? 'on' : ''}" data-act="setTable" data-id="${t.id}">${t.id}</button>`).join('')}</div>
          </div>`).join('')}</div>`;
    } else if (m.type === 'signin') {
      body = `
        <span class="lbl">LOWLIFE MEMBERS</span>
        <div class="d mh">SIGN IN.</div>
        <p class="mu">Points on every tab, a reward at 500, and your usuals one tap away.</p>
        <label class="field"><span class="lbl">NAME</span><input id="si-name" data-bind="siName" value="${esc(LL.form.siName || 'Jordan Reyes')}" autocomplete="name"></label>
        <label class="field"><span class="lbl">PHONE</span><input id="si-phone" data-bind="siPhone" value="${esc(LL.form.siPhone || '(555) 201-8800')}" inputmode="tel"></label>
        <button class="btn btn-ac" data-act="signIn">CONTINUE →</button>`;
    } else if (m.type === 'guestlist') {
      const e = LL.EVENTS.find((x) => x.id === m.id);
      body = `
        <span class="lbl ac">${esc(e.type)} · ${esc(e.d)} ${esc(e.m)}</span>
        <div class="d mh sm2">${esc(e.title)}</div>
        <p class="mu">${esc(e.meta)}</p>
        <label class="field"><span class="lbl">NAME</span><input id="gl-name" data-bind="glName" value="${esc(LL.form.glName || (S.user ? S.user.name : ''))}" placeholder="Your name"></label>
        <div class="row between center"><span class="lbl">GUESTS</span>${LL.stepper('gl', LL.form.glN || 2, 'glStep')}</div>
        <button class="btn btn-ac" data-act="confirmGuestlist" data-id="${e.id}">${esc(e.cta)} →</button>`;
    } else if (m.type === 'tip') {
      body = `
        <span class="lbl">TIP THE KITCHEN</span>
        <div class="d mh">CUSTOM TIP</div>
        <label class="field"><span class="lbl">AMOUNT ($)</span><input id="tip-amt" data-bind="tipAmt" value="${esc(LL.form.tipAmt || '')}" inputmode="decimal" placeholder="0.00"></label>
        <button class="btn btn-ac" data-act="setCustomTip">APPLY</button>`;
    } else if (m.type === 'pay') {
      const t = LL.tab();
      const p = LL.ui.paying;
      body = p && p.done ? `
        <span class="lbl ac">PAID · THANK YOU</span>
        <div class="d mh big">TAB<br><span class="ac">CLOSED.</span></div>
        <p class="mu">${LL.money(p.total)} paid.${p.earned ? ` You earned <b class="ac">+${p.earned} pts</b> toward Inner Circle.` : ' Sign in next time to earn points.'}</p>
        <button class="btn btn-ac" data-act="closeModal" data-force="1">DONE</button>` : `
        <span class="lbl">SETTLE UP · ${esc(LL.tableName(S.table))}</span>
        <div class="d mh">${LL.money(t.total)}</div>
        <div class="paylines mu">
          <div class="between"><span>Subtotal</span><span class="mono">${LL.money(t.subtotal)}</span></div>
          <div class="between"><span>Tax</span><span class="mono">${LL.money(t.tax)}</span></div>
          <div class="between"><span>Kitchen tip</span><span class="mono">${LL.money(t.tip)}</span></div>
          ${t.disc ? `<div class="between ac"><span>Regular reward −10%</span><span class="mono">−${LL.money(t.disc)}</span></div>` : ''}
        </div>
        <button class="btn btn-tx" data-act="doPay" ${p ? 'disabled' : ''}> PAY</button>
        <button class="btn btn-ac" data-act="doPay" ${p ? 'disabled' : ''}>${p ? 'PROCESSING…' : 'PAY WITH CARD →'}</button>`;
    }
    return `<div class="mback" data-act="closeModal"><div class="mbox" role="dialog"><button class="x" data-act="closeModal" data-force="1" aria-label="Close">✕</button>${body}</div></div>`;
  };
})();
