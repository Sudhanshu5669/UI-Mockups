/* LOWLIFE — Events, Private, Rewards, Visit, Kitchen (staff) */
(function () {
  const LL = window.LL;
  const esc = LL.esc;

  // ------------------------------------------------------------------ EVENTS ---
  LL.pages.events = () => {
    const f = LL.form.evType || 'ALL';
    const list = LL.EVENTS.filter((e) => f === 'ALL' || e.type === f);
    return `
    <section class="wrap menu-head ev-head">
      <div class="d h-ev">LOUD<br>NIGHTS.</div>
      <div class="row gap8 fw evchips">${['ALL', 'DJ', 'LIVE', 'TASTINGS', 'QUIZ'].map((c) => `<button class="chip ${f === c ? 'on' : ''}" data-act="setEv" data-v="${c}">${c}</button>`).join('')}</div>
    </section>
    <section class="wrap">
      <div class="ph ev-hero">
        <span class="ev-ph">[ PHOTO — DJ BOOTH, HANDS UP, STROBE ]</span>
        <div class="ev-grad">
          <div>
            <div class="row center gap10 mono ac ev-now">${LL.liveDot}THIS FRIDAY · 10PM–3AM</div>
            <div class="d ev-t">DJ KAYA:<br>DISCO AFTER DARK</div>
          </div>
          <div class="col gap10 end-a">
            <span class="mono mu">FREE BEFORE 11 · $15 AFTER</span>
            <button class="btn btn-ac" data-act="openModal" data-type="guestlist" data-id="kaya">GET ON THE GUESTLIST →</button>
          </div>
        </div>
      </div>
    </section>
    <section class="wrap ev-list">
      ${list.length ? list.map((e) => `
      <button class="ev-row" data-act="openModal" data-type="guestlist" data-id="${e.id}">
        <div class="row baseline gap10"><span class="d ev-d">${e.d}</span><span class="mono ev-m">${e.m}<br>${e.w}</span></div>
        <span class="d ev-title">${esc(e.title)}</span>
        <span class="mono ev-meta">${esc(e.meta)}</span>
        <span class="ev-cta">${esc(e.cta)}</span>
      </button>`).join('') : '<div class="empty">Nothing scheduled in that lane.</div>'}
    </section>`;
  };

  // ----------------------------------------------------------------- PRIVATE ---
  LL.PRIV = [
    { id: 'chef', name: 'CHEF’S COUNTER', sub: 'Tasting menu + pairings', g: '8–12', shot: 'CHEF’S COUNTER' },
    { id: 'back', name: 'THE BACK ROOM', sub: 'Own bar, own speakers, own door', g: '20–45', shot: 'THE BACK ROOM, RED LIGHT' },
    { id: 'buyout', name: 'FULL BUYOUT', sub: 'Launches, wraps, after-parties', g: '60–180', shot: 'FULL VENUE BUYOUT' },
  ];
  LL.privState = () => LL.form.priv || (LL.form.priv = { space: 'back', occasion: 'PRODUCT LAUNCH', date: '', guests: '', budget: '$3–5k', name: '', email: '', vibe: '', err: {}, sent: false });

  LL.pages.private = () => {
    const p = LL.privState();
    const e = p.err || {};
    const fld = (k, label, ph, extra = '') => `<label class="field ${e[k] ? 'bad' : ''}"><span class="lbl">${label}${e[k] ? ` · <span class="red">${e[k]}</span>` : ''}</span><input id="pv-${k}" data-bind="priv.${k}" value="${esc(p[k])}" placeholder="${ph}" ${extra}></label>`;
    return `
    <section class="wrap sec-top"><div class="d h-priv">THE WHOLE PLACE.<br><span class="ac">ALL YOURS.</span></div></section>
    <section class="wrap priv-cards">
      ${LL.PRIV.map((s) => `
      <button class="pcard ${p.space === s.id ? 'on' : ''}" data-act="privSpace" data-id="${s.id}">
        <div class="ph pc-img">[ ${esc(s.shot)} ]</div>
        <div class="between end pc-b"><div class="tl"><div class="d pc-n ${p.space === s.id ? 'ac' : ''}">${s.name}${p.space === s.id ? ' ✓' : ''}</div><div class="mu sm-t">${s.sub}</div></div><span class="mono tr">${s.g}<br><span class="mu tiny">GUESTS</span></span></div>
      </button>`).join('')}
    </section>
    <section class="wrap">
      <div class="card priv-form">
        ${p.sent ? `
        <div class="col gap16 sent">
          <span class="lbl ac">ENQUIRY SENT</span>
          <div class="d h-sec2">GOT IT, ${esc((p.name || 'FRIEND').split(' ')[0].toUpperCase())}.</div>
          <p class="mu">Our events lead will reply to <b class="tx">${esc(p.email)}</b> within 24 hours with a proposal, menu and a straight-up price.</p>
          <button class="btn btn-line" data-act="privReset">SEND ANOTHER</button>
        </div>` : `
        <div class="col gap16">
          <div class="d h-sec2">TELL US WHAT YOU’RE PLANNING.</div>
          <span class="mu">Our events lead replies within 24 hours with a proposal, menu and a straight-up price. No “contact for pricing” runaround.</span>
          <div class="col gap12 perks"><span><i class="ac">✶</i>Custom cocktail named after you</span><span><i class="ac">✶</i>Bring your DJ or use ours</span><span><i class="ac">✶</i>Minimum spends from $1,200</span></div>
        </div>
        <div class="col gap22">
          <div class="col gap12"><span class="lbl">WHAT’S THE OCCASION</span>
            <div class="row fw gap8">${['BIRTHDAY', 'PRODUCT LAUNCH', 'CORPORATE', 'WEDDING AFTER-PARTY', 'SOMETHING WEIRD'].map((o) => `<button class="chip ${p.occasion === o ? 'on' : ''}" data-act="privOcc" data-v="${o}">${o}</button>`).join('')}</div>
          </div>
          <div class="grid3 gap12">
            ${fld('date', 'DATE', 'Thu 22 Oct')}
            ${fld('guests', 'GUESTS', '~40', 'inputmode="numeric"')}
            <label class="field"><span class="lbl">BUDGET</span><select id="pv-budget" data-bind="priv.budget">${['Under $3k', '$3–5k', '$5–10k', '$10k+'].map((b) => `<option ${p.budget === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label>
          </div>
          <div class="grid2 gap12">${fld('name', 'NAME', 'Sam Okafor', 'autocomplete="name"')}${fld('email', 'EMAIL', 'sam@studiofern.co', 'type="email" autocomplete="email"')}</div>
          <label class="field tall"><span class="lbl">THE VIBE</span><textarea id="pv-vibe" data-bind="priv.vibe" rows="3" placeholder="Sneaker launch. Secret party that accidentally got press.">${esc(p.vibe)}</textarea></label>
          <button class="btn btn-ac self-s hov-tilt" data-act="privSend">SEND ENQUIRY →</button>
        </div>`}
      </div>
    </section>`;
  };

  // ----------------------------------------------------------------- REWARDS ---
  LL.pages.rewards = () => {
    const S = LL.state;
    if (!S.user) {
      return `
      <section class="wrap sec-top">
        <div class="mono lbl">LOWLIFE MEMBERS</div>
        <div class="d h-reward">HEY,<br><span class="ac">STRANGER.</span></div>
        <p class="mu empty-p">Points on every tab. A free round at 500. Skip-the-line at 800. 10% off once you’re a Regular. Your usuals, one tap away.</p>
        <button class="btn btn-ac" data-act="openModal" data-type="signin">SIGN IN / JOIN →</button>
      </section>`;
    }
    const pts = S.points;
    const pct = Math.min(100, Math.round((pts / 2000) * 100));
    const first = S.user.name.split(' ')[0].toUpperCase();
    const bk = S.booked;
    return `
    <section class="wrap rew-top">
      <div>
        <div class="mono lbl rew-l">MEMBER SINCE MAR 2024 · 31 VISITS</div>
        <div class="d h-reward">HEY,<br>${esc(first)}.</div>
      </div>
      <div class="memcard">
        <div class="memcard-ll d">LL</div>
        <div class="between mono mc-t"><span>LOWLIFE MEMBERS</span><span>TIER 2 / 3</span></div>
        <div><div class="d mc-n">REGULAR</div><div class="mono mc-p">${pts.toLocaleString()} PTS</div></div>
        <div class="col gap8"><div class="bar"><div style="width:${pct}%"></div></div><div class="between mono tiny2"><span>${Math.max(0, 2000 - pts).toLocaleString()} PTS TO INNER CIRCLE</span><span>2,000</span></div></div>
      </div>
    </section>
    <section class="wrap rew-grid">
      <div class="card pad26 col gap16">
        <span class="lbl">UP NEXT</span>
        ${bk ? `<span class="d next-n">${esc(LL.DAYS.find((d) => d.n === bk.day).w)} ${String(bk.day).padStart(2, '0')} · ${esc(bk.time)}PM<br>${esc(LL.tableName(bk.table).toUpperCase())}</span>
        <span class="mu sm-t">${bk.party} guests · DJ Kaya · $${bk.party * 10} deposit as credit</span>
        <div class="row gap8 fw"><a class="btn btn-ac btn-sm" href="#/booked">VIEW TICKET</a><a class="btn btn-line btn-sm" href="#/book">CHANGE</a></div>`
        : `<span class="d next-n">NO BOOKING<br>YET.</span><span class="mu sm-t">Walk-ins welcome — or grab a booth before someone else does.</span><div class="row gap8"><a class="btn btn-ac btn-sm" href="#/book">BOOK A TABLE →</a></div>`}
      </div>
      <div class="card pad26 col gap6">
        <span class="lbl mb10">SPEND YOUR POINTS</span>
        ${LL.REWARDS.map((r) => { const can = pts >= r.pts && (r.id === 'shots' || r.id === 'skip'); const aff = pts >= r.pts; return `
        <div class="rw ${aff ? '' : 'dim'}"><span class="d rw-n">${r.name}</span>${can ? `<button class="pillbtn" data-act="redeem" data-id="${r.id}">${r.pts.toLocaleString()} · REDEEM</button>` : `<span class="pillbtn off">${r.pts.toLocaleString()}</span>`}</div>`; }).join('')}
      </div>
      <div class="card pad26 col gap6">
        <span class="lbl mb10">YOUR USUALS</span>
        ${LL.USUALS.map((u) => `
        <div class="usual"><span class="ph-s ph thumb48"></span><div class="grow col gap4"><span class="un">${esc(u.label)}</span><span class="mono mu sm">${u.date} · ${u.total}</span></div><button class="pillbtn line" data-act="reorder" data-i="${LL.USUALS.indexOf(u)}">REORDER</button></div>`).join('')}
        <div class="row between mu sm-t top-line"><span>Lifetime</span><span class="mono">${S.receipts.length ? S.receipts.length + ' tab(s) this session' : '31 visits'}</span></div>
        <button class="linkbtn tl" data-act="signOut">SIGN OUT</button>
      </div>
    </section>`;
  };

  // ------------------------------------------------------------------- VISIT ---
  LL.pages.visit = () => {
    const open = LL.form.faq === undefined ? 0 : LL.form.faq;
    return `
    <section class="wrap sec-top"><div class="d h-priv">FIND US.<br><span class="ac">WE’RE THE LOUD ONE.</span></div></section>
    <section class="wrap visit-grid">
      <div class="ph visit-map">
        <span class="vm-l">[ MAP — DARK STYLE, 88 WIRE ST ]</span>
        <div class="vm-pin"><span class="d pin">LOWLIFE</span>${LL.liveDot}</div>
        <div class="row gap8 vm-b"><button class="btn btn-tx btn-sm" data-act="directions">DIRECTIONS</button><button class="btn btn-ghost btn-sm solid" data-act="ride">CALL A RIDE</button></div>
      </div>
      <div class="card pad32 col gap22">
        <div class="between center"><span class="lbl">HOURS</span><span class="row center gap8 mono ac sm">${LL.liveDot}OPEN NOW</span></div>
        <div class="hours">
          <div class="mu"><span>Monday</span><span>Closed (recovering)</span></div>
          <div><span>Tue – Thu</span><span class="mono">5PM – 1AM</span></div>
          <div class="today"><span>Fri – Sat · today</span><span class="mono">5PM – 3AM</span></div>
          <div><span>Sunday</span><span class="mono">4PM – 12AM</span></div>
        </div>
        <div class="grid2 gap20 top-line addr">
          <div><div class="lbl mb10">ADDRESS</div>88 Wire St<br>Downtown<br>Side door after 11</div>
          <div><div class="lbl mb10">TALK TO US</div>(555) 014-0300<br>hi@lowlife.bar<br>@lowlife.bar</div>
        </div>
      </div>
    </section>
    <section class="wrap faq">
      <div class="d h-faq">THINGS PEOPLE ASK.</div>
      <div class="faq-list">
        ${LL.FAQ.map((f, i) => `
        <div class="qa ${open === i ? 'open' : ''}">
          <button class="d q" data-act="faq" data-i="${i}"><span>${f.q}</span><span class="${open === i ? 'ac' : ''}">${open === i ? '−' : '+'}</span></button>
          ${open === i ? `<div class="mu a">${esc(f.a)}</div>` : ''}
        </div>`).join('')}
      </div>
    </section>`;
  };

  // ----------------------------------------------------------------- KITCHEN ---
  LL.pages.kitchen = () => {
    const S = LL.state;
    const filt = LL.form.kf || 'ALL';
    const all = S.orders.filter((o) => !LL.orderDone(o) || Date.now() - Math.max(...o.items.map((i) => i.at)) < 20000).sort((a, b) => a.t - b.t);
    const keep = (i) => filt === 'ALL' || (filt === 'BAR' && i.station === 'bar') || (filt === 'KITCHEN' && i.station === 'kitchen') || (filt === 'HELD' && i.st === -1);
    const list = all.filter((o) => o.items.some(keep));
    const cnt = (fn) => S.orders.reduce((n, o) => n + o.items.filter((i) => i.st < 4 && fn(i)).length, 0);
    // threads
    const gids = [...new Set(S.msgs.map((m) => m.guest))];
    const threads = gids.map((g) => {
      const ms = S.msgs.filter((m) => m.guest === g);
      const last = ms[ms.length - 1];
      const tbl = (ms.find((m) => m.table) || {}).table;
      return { g, tbl, last, unread: ms.some((m) => m.from === 'guest' && !m.handled), alerts: ms.some((m) => m.kind === 'alert' && !m.handled) };
    }).sort((a, b) => b.last.t - a.last.t);
    const sel = LL.form.kthread && threads.find((t) => t.g === LL.form.kthread) ? LL.form.kthread : (threads.find((t) => t.unread) || threads[0] || {}).g;
    LL.form.kthread = sel;
    const thread = sel ? S.msgs.filter((m) => m.guest === sel) : [];
    const selT = threads.find((t) => t.g === sel);
    return `
    <section class="wrap kds-head">
      <div><div class="mono lbl ac">STAFF VIEW · LOWLIFE PASS</div><div class="d h-kds">KITCHEN PASS</div></div>
      <div class="row gap16 fw kds-ctl">
        <div class="kstats mono"><span><b>${cnt((i) => i.station === 'kitchen' && i.st >= 0)}</b> FOOD</span><span><b>${cnt((i) => i.station === 'bar')}</b> BAR</span><span><b class="${cnt((i) => i.st === -1) ? 'ac' : ''}">${cnt((i) => i.st === -1)}</b> HELD</span></div>
        <div class="seg">${['ALL', 'KITCHEN', 'BAR', 'HELD'].map((f) => `<button class="${filt === f ? 'on' : ''}" data-act="setKF" data-v="${f}">${f}</button>`).join('')}</div>
        <div class="seg"><button class="${S.live ? 'on' : ''}" data-act="setLive" data-v="1">AUTO-ADVANCE</button><button class="${S.live ? '' : 'on'}" data-act="setLive" data-v="0">MANUAL</button></div>
      </div>
    </section>
    <section class="wrap kds-body">
      <div class="kds-grid">
        ${list.length ? list.map((o) => {
          const age = (Date.now() - o.t) / 1000;
          const heat = age > 240 ? 'late' : age > 120 ? 'warn' : '';
          return `
          <article class="kt ${heat} ${o.pre ? 'pre' : ''}">
            <header class="between center">
              <span class="d kt-tbl">${o.pre ? 'PRE · ' : ''}${esc(o.table || '—')}</span>
              <span class="mono sm" data-since="${o.t}">${LL.ago(o.t)}</span>
            </header>
            <div class="mono sm mu between"><span>#${esc(o.id)} · ${esc(o.name.toUpperCase())}</span>${o.course === 'hold' ? '<span class="ac">HOLD FOOD</span>' : ''}</div>
            ${(o.allergies || []).length ? `<div class="alg">⚠ ALLERGY: ${o.allergies.map(esc).join(' · ')}</div>` : ''}
            ${o.note ? `<div class="knote">“${esc(o.note)}”</div>` : ''}
            <div class="kt-items">
              ${o.items.filter(keep).map((i) => { const p = LL.itemProgress(i); return `
              <div class="ki ${p.cls}">
                <div class="grow col gap4"><span class="kn">${i.qty} × ${esc(i.name)}</span>${i.mods || i.note ? `<span class="mono tiny mu">${esc(i.mods)}${i.note ? ' · “' + esc(i.note) + '”' : ''}</span>` : ''}<div class="prog sm">${p.segs}</div></div>
                <div class="col gap6 end-a"><span class="mono tiny ${i.st === 4 ? 'ac' : 'mu'}">${i.station === 'bar' ? 'BAR · ' : ''}${p.label}</span>${i.st < 4 ? `<button class="kb" data-act="kAdvance" data-o="${o.id}" data-i="${i.id}">${i.st === -1 ? 'FIRE' : 'NEXT ▸'}</button>` : ''}</div>
              </div>`; }).join('')}
            </div>
            <footer class="row gap8"><button class="btn btn-ac btn-sm grow" data-act="kBump" data-o="${o.id}">BUMP ALL ✓</button>${o.items.some((i) => i.st === -1) && !o.pre ? `<button class="btn btn-line btn-sm" data-act="kFire" data-o="${o.id}">FIRE HELD</button>` : ''}</footer>
          </article>`; }).join('') : '<div class="empty">Pass is clear. Go wipe something.</div>'}
      </div>
      <aside class="card kchat">
        <div class="between center"><span class="d chat-t">MESSAGES</span><span class="lbl">${threads.filter((t) => t.unread).length} UNREAD</span></div>
        <div class="kthreads">${threads.length ? threads.map((t) => `<button class="kth ${t.g === sel ? 'on' : ''}" data-act="kThread" data-g="${t.g}"><span class="d">${esc(t.tbl || '—')}</span><span class="grow tl sm-t mu ell">${esc(t.last.text)}</span>${t.unread ? '<i class="udot"></i>' : ''}</button>`).join('') : '<div class="empty-sm mu">No messages yet.</div>'}</div>
        ${sel ? `
        <div class="chat-log" id="chat-log">${thread.map((m) => m.from === 'system' || m.kind === 'alert' ? `<div class="msg sys mono">${m.kind === 'alert' ? '🔔 ' : ''}${esc(m.text)}</div>` : `<div class="msg ${m.from === 'guest' ? 'them' : 'me'}"><span class="mw mono">${m.from === 'guest' ? 'TABLE ' + esc(selT && selT.tbl || '') : m.from.toUpperCase()}</span><span class="mbub">${esc(m.text)}</span></div>`).join('')}</div>
        <div class="row fw gap8 quick">${['On it', 'Flagged to chef', 'Sending that over', '5 more minutes'].map((q) => `<button class="chip sm" data-act="kQuick" data-v="${esc(q)}">${q}</button>`).join('')}</div>
        <div class="chat-in"><input id="k-input" data-bind="kmsg" data-enter="kSend" value="${esc(LL.form.kmsg || '')}" placeholder="Reply to table ${esc(selT && selT.tbl || '')}…" autocomplete="off"><button class="btn btn-ac btn-sm" data-act="kSend">SEND</button></div>` : ''}
      </aside>
    </section>`;
  };
})();
