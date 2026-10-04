/* LOWLIFE — Order tracker (talk to the kitchen), Booking, Floor plan, Confirmation */
(function () {
  const LL = window.LL;
  const esc = LL.esc;

  LL.ago = (t) => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (s < 60) return s < 10 ? 'JUST NOW' : s + ' SEC AGO';
    return Math.round(s / 60) + ' MIN AGO';
  };

  // ------------------------------------------------------------ ORDER TRACKER ---
  LL.itemProgress = (i) => {
    const labels = LL.STAGES[i.station];
    if (i.st === -1) return { label: i.station === 'kitchen' ? 'ON HOLD' : 'QUEUED', segs: '<i></i><i></i><i></i><i></i>', cls: 'hold' };
    const segs = [0, 1, 2, 3].map((k) => `<i class="${k < i.st || i.st === 4 ? 'done' : k === i.st ? 'cur' : ''}"></i>`).join('');
    return { label: labels[i.st], segs, cls: i.st === 4 ? 'served' : '' };
  };

  LL.chatHTML = () => {
    const S = LL.state;
    const msgs = LL.myThread();
    const who = { kitchen: 'KITCHEN · CHEF RAVI', server: 'SERVER · MAYA', guest: 'YOU' };
    return `
    <div class="card chat">
      <div class="between center chat-h"><span class="d chat-t">TALK TO THE KITCHEN</span><span class="lbl row center gap8">${LL.liveDot}ON THE PASS</span></div>
      <div class="chat-log" id="chat-log">
        ${msgs.length ? msgs.map((m) => m.from === 'system' || m.kind === 'alert'
          ? `<div class="msg sys mono">${esc(m.text)}</div>`
          : `<div class="msg ${m.from === 'guest' ? 'me' : 'them'}"><span class="mw mono">${who[m.from] || m.from}</span><span class="mbub">${esc(m.text)}</span></div>`).join('')
          : `<div class="empty-sm mu">Allergy? Change of heart? Want it spicier?<br>Say it here — the kitchen sees it instantly.</div>`}
      </div>
      <div class="row fw gap8 quick">${LL.QUICK_MSGS.map((q) => `<button class="chip sm" data-act="quickMsg" data-v="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <div class="chat-in">
        <input id="chat-input" data-bind="chat" data-enter="sendChat" value="${esc(LL.form.chat || '')}" placeholder="Message the kitchen…" aria-label="Message the kitchen" autocomplete="off">
        <button class="btn btn-ac btn-sm" data-act="sendChat">SEND</button>
      </div>
    </div>`;
  };

  LL.tabHTML = () => {
    const S = LL.state;
    const t = LL.tab();
    const last = S.receipts[0];
    if (!t.lines.length) {
      return `<div class="card tab"><span class="lbl">YOUR TAB</span>${last ? `<div class="d tab-h">TAB<br><span class="ac">CLOSED.</span></div><p class="mu sm-t">${LL.money(last.total)} paid${last.earned ? ` · +${last.earned} pts earned` : ''}.</p>` : '<p class="mu">Nothing on your tab yet.</p>'}<a class="btn btn-line" href="#/menu">ORDER MORE →</a></div>`;
    }
    return `
    <div class="card tab">
      <div class="between baseline"><span class="d tab-h2">YOUR TAB</span><span class="lbl">${esc(LL.tableName(S.table))}</span></div>
      <div class="tab-lines">${t.lines.map((l) => `<div class="between"><span>${l.qty} × ${esc(l.name)}</span><span class="mono">${LL.money(l.qty * l.price)}</span></div>`).join('')}</div>
      <div class="col gap8"><span class="lbl">TIP THE KITCHEN</span>
        <div class="tips mono">${[15, 18, 22].map((p) => `<button class="${S.tipCustom == null && S.tipPct === p ? 'on' : ''}" data-act="setTip" data-v="${p}">${p}%</button>`).join('')}<button class="${S.tipCustom != null ? 'on' : ''}" data-act="openModal" data-type="tip">${S.tipCustom != null ? LL.money(S.tipCustom) : 'CUSTOM'}</button></div>
      </div>
      <div class="col gap10 mu tab-t">
        <div class="between"><span>Subtotal</span><span class="mono">${LL.money(t.subtotal)}</span></div>
        <div class="between"><span>Tax</span><span class="mono">${LL.money(t.tax)}</span></div>
        <div class="between"><span>Kitchen tip</span><span class="mono">${LL.money(t.tip)}</span></div>
        ${t.disc ? `<div class="between ac"><span>Regular reward −10%</span><span class="mono">−${LL.money(t.disc)}</span></div>` : ''}
      </div>
      <div class="between baseline tab-tot"><span class="d">TOTAL</span><span class="mono">${LL.money(t.total)}</span></div>
      <button class="btn btn-ac" data-act="openModal" data-type="pay">PAY NOW →</button>
      <button class="btn btn-line btn-sm ${S.billAsked ? 'off' : ''}" data-act="askBill">${S.billAsked ? 'BILL ON ITS WAY ✓' : 'BRING THE BILL TO MY TABLE'}</button>
      ${S.user ? `<span class="mu sm-t center-t">You’ll earn <b class="ac">+${Math.round(t.subtotal)} pts</b> toward Inner Circle.</span>` : `<span class="mu sm-t center-t"><button class="linkbtn" data-act="openModal" data-type="signin">Sign in</button> to earn points and get 10% off.</span>`}
    </div>`;
  };

  LL.pages.order = () => {
    const S = LL.state;
    const orders = LL.myOrders();
    const where = S.table || (S.booked && S.booked.table);
    if (!orders.length) {
      return `
      <section class="wrap sec">
        <div class="d h-menu">NOTHING ON<br>THE PASS.</div>
        <p class="mu empty-p">${S.table ? `You’re at <b class="tx">${esc(LL.tableName(S.table))}</b>. ` : ''}Build a tray and send it — then watch it move through the kitchen here, and message the chefs directly.</p>
        <div class="row gap10 fw"><a class="btn btn-ac" href="#/menu">ORDER FROM YOUR SEAT →</a>${S.table ? '' : '<button class="btn btn-line" data-act="openModal" data-type="table">SET MY TABLE</button>'}</div>
      </section>
      <section class="wrap"><div class="chat-solo">${LL.chatHTML()}</div></section>`;
    }
    return `
    <section class="wrap menu-head">
      <div class="d h-menu">YOUR ORDER</div>
      <div class="menu-meta">
        <button class="seatchip lg" data-act="openModal" data-type="table"><span class="livedot"></span><span>${esc(LL.tableName(where))}</span><span class="mu">CHANGE</span></button>
        <div class="row center gap10 lbl">${LL.liveDot}LIVE FROM THE KITCHEN PASS</div>
      </div>
    </section>
    <section class="wrap order-body">
      <div class="col gap16 tickets">
        ${orders.map((o) => {
          const held = o.items.some((i) => i.st === -1);
          const done = LL.orderDone(o);
          const eta = LL.etaMins(o);
          return `
          <article class="card ticket ${done ? 'done' : ''}">
            <header class="between center wrapx">
              <div class="row center gap12 fw"><span class="d tk-id">#${esc(o.id)}</span><span class="lbl" data-since="${o.t}">SENT ${LL.ago(o.t)}</span></div>
              <div class="row gap8 fw">
                ${o.pre ? '<span class="tg hot">PRE-ORDER · HELD TILL CHECK-IN</span>' : ''}
                ${o.course === 'hold' ? '<span class="tg">FOOD ON HOLD</span>' : ''}
                ${(o.allergies || []).map((a) => `<span class="tg red">${esc(a)}</span>`).join('')}
                ${o.paid ? '<span class="tg">PAID ✓</span>' : ''}
              </div>
            </header>
            <div class="tk-items">
              ${o.items.map((i) => { const p = LL.itemProgress(i); return `
              <div class="tk-item ${p.cls}">
                <div class="between wrapx gap12"><span class="tk-n">${i.qty} × ${esc(i.name)}${i.mods ? `<span class="mu sm-t"> · ${esc(i.mods)}</span>` : ''}</span><span class="stg mono ${i.st === 4 ? 'ac' : ''}">${p.label}</span></div>
                <div class="prog">${p.segs}</div>
              </div>`; }).join('')}
            </div>
            <footer class="between center wrapx gap12">
              <span class="mono sm ${done ? 'ac' : 'mu'}">${done ? 'EVERYTHING’S ON YOUR TABLE ✓' : held && eta === 0 ? 'WAITING FOR YOU TO FIRE THE FOOD' : `ETA ~${eta} MIN`}</span>
              ${held && !o.pre ? `<button class="btn btn-ac btn-sm" data-act="fire" data-id="${o.id}">FIRE THE FOOD NOW →</button>` : ''}
              ${o.pre && S.table !== (S.booked && S.booked.table) ? `<button class="btn btn-ac btn-sm" data-act="checkInBooked">I’M HERE — CHECK IN →</button>` : ''}
            </footer>
          </article>`; }).join('')}
        <a class="btn btn-line" href="#/menu">+ ORDER MORE</a>
      </div>
      <div class="col gap16 order-side">
        ${LL.chatHTML()}
        <div class="card svc">
          <span class="lbl">NEED SOMETHING ELSE?</span>
          <div class="grid2 gap8">
            <button class="chip" data-act="service" data-v="server">CALL A SERVER</button>
            <button class="chip" data-act="service" data-v="water">WATER</button>
            <button class="chip" data-act="service" data-v="cutlery">CUTLERY / NAPKINS</button>
            <button class="chip" data-act="service" data-v="clean">CLEAR PLATES</button>
          </div>
        </div>
        ${LL.tabHTML()}
      </div>
    </section>`;
  };

  // ------------------------------------------------------------------ BOOKING ---
  LL.dateStr = (n) => { const d = LL.DAYS.find((x) => x.n === n); return `${d.w[0]}${d.w.slice(1).toLowerCase()} ${String(n).padStart(2, '0')} Oct`; };

  LL.pages.book = () => {
    const S = LL.state;
    const b = S.booking;
    const day = LL.DAYS.find((d) => d.n === b.day);
    return `
    <section class="wrap book-head"><div class="d h-book">GET A TABLE BEFORE<br><span class="ac">SOMEONE ELSE DOES.</span></div></section>
    <section class="wrap book-body">
      <div class="col gap48">
        <div class="party-row">
          <div class="col gap14">
            <span class="lbl">HOW MANY OF YOU</span>
            <div class="row center gap24">
              <button class="rnd" data-act="bkParty" data-d="-1" aria-label="Fewer">−</button>
              <span class="d party-n">${b.party}</span>
              <button class="rnd ac-b" data-act="bkParty" data-d="1" aria-label="More">+</button>
            </div>
          </div>
          <div class="mu party-note">Parties of 9+ go through <a href="#/private">Private Events</a>. We hold tables for 15 minutes, then they go to the walk-in queue. No hard feelings.</div>
        </div>

        <div class="col gap14">
          <div class="between"><span class="lbl">PICK A NIGHT — OCTOBER</span><span class="lbl hide-m">← →</span></div>
          <div class="days">
            ${LL.DAYS.map((d) => `
            <button class="day ${d.n === b.day ? 'on' : ''} ${d.closed ? 'closed' : ''}" ${d.closed ? 'disabled' : `data-act="bkDay" data-n="${d.n}"`}>
              <span class="mono">${d.w}</span><span class="d day-n">${String(d.n).padStart(2, '0')}</span>
              ${d.closed ? '<span class="mono tiny">CLOSED</span>' : d.note ? `<span class="mono tiny ${d.hot && d.n !== b.day ? 'ac' : ''}">${d.note}</span>` : `<span class="dot ${d.dot === 'mu' ? 'mu' : ''}"></span>`}
            </button>`).join('')}
          </div>
        </div>

        <div class="col gap14">
          <span class="lbl">WHAT TIME · ${day.w} ${String(day.n).padStart(2, '0')}</span>
          <div class="times mono">
            ${LL.TIMES.map((t) => { const s = LL.slot(b.day, t); return s.ok
              ? `<button class="time ${b.time === t ? 'on' : ''}" data-act="bkTime" data-t="${t}">${t}${s.left && b.time !== t ? `<span class="left">${s.left} LEFT</span>` : ''}</button>`
              : `<span class="time gone">${t}</span>`; }).join('')}
          </div>
        </div>

        <div class="col gap14">
          <span class="lbl">WHERE DO YOU WANT TO BE</span>
          <div class="zones">
            ${LL.BOOK_ZONES.map((z) => { const Z = LL.ZONES[z]; const on = b.zone === z; return `
            <button class="zone ${on ? 'on' : ''}" data-act="bkZone" data-z="${z}">
              <span class="ph-s ph zone-img"></span>
              <span class="d zone-n ${on ? 'ac' : ''}">${esc(Z.name.toUpperCase())}${on ? ' ✓' : ''}</span>
              <span class="mu sm-t">${esc(Z.blurb)}</span>
            </button>`; }).join('')}
          </div>
        </div>
      </div>

      <div class="col gap14">
        <div class="live-card">
          <span class="row center gap10 mono live-l"><span class="dotbl"></span>LIVE · ${day.w}</span>
          <span class="d live-n" data-live="seats">${LL.seatsLeft()}</span>
          <span class="d live-s">TABLES LEFT AT ${esc(b.time)}</span>
          <span class="live-p">37 people are looking at ${LL.DAYNAME[day.w]} right now.</span>
        </div>
        <div class="card yn">
          <span class="lbl">YOUR NIGHT</span>
          <div class="between"><span class="mu">Party</span><span>${b.party} people</span></div>
          <div class="between"><span class="mu">When</span><span>${LL.dateStr(b.day)} · ${esc(b.time)} PM</span></div>
          <div class="between"><span class="mu">Where</span><span>${esc(b.table ? LL.tableName(b.table) : LL.ZONES[b.zone].name)}</span></div>
          <div class="between"><span class="mu">Deposit</span><span>$10 pp · back as credit</span></div>
          <button class="btn btn-line" data-act="bkMap">PICK EXACT TABLE ON MAP</button>
          <button class="btn btn-ac" data-act="bkContinue">CONTINUE →</button>
        </div>
      </div>
    </section>`;
  };

  // --------------------------------------------------------------- FLOOR PLAN ---
  LL.ZONE_COPY = {
    bar: 'Front-row to the shakers. Quick drinks, quicker conversation. Limited elbow room, unlimited charm.',
    booth: 'Oxblood velvet, 3 metres from the decks, eye contact with the bar. You’ll need to shout a bit. Worth it.',
    floor: 'Right in the middle of everything. Good for people-watching and being watched.',
    chef: 'Watch the line work. The chefs will talk to you. Tasting menu, pairings optional.',
    terrace: 'Heaters on, smokers OK, a little quieter. Bring a jacket anyway.',
  };

  LL.holdLeft = () => {
    const u = LL.holdUntil || 0;
    const s = Math.max(0, Math.ceil((u - Date.now()) / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  LL.mapDetail = () => {
    const S = LL.state;
    const id = S.booking.table;
    if (!id) return `<div class="card pick-hint"><span class="d">TAP A FREE TABLE.</span><span class="mu">Outlined circles are free. Dashed ones are being booked right now. Hatched are gone.</span></div>`;
    const z = LL.tableZone(id);
    const cap = LL.tableCap(id);
    return `
    <div class="ph map-photo">[ PHOTO — ${esc(LL.tableName(id).toUpperCase())} FROM SEAT VIEW ]</div>
    <div class="between baseline wrapx"><span class="d map-t">${esc(LL.tableName(id).toUpperCase())}</span><span class="mono ac sm">${cap[0] === cap[1] ? cap[0] : cap[0] + '–' + cap[1]} SEAT${cap[1] > 1 ? 'S' : ''}</span></div>
    <span class="mu">${esc(LL.ZONE_COPY[z])}</span>
    <div class="grid2 gap10">
      <div class="mini"><span class="lbl">MIN SPEND</span><span class="mono mv">$${LL.tableMin(id)}</span></div>
      <div class="mini hl"><span class="lbl ac">HELD FOR YOU</span><span class="mono mv" data-live="hold">${LL.holdLeft()}</span></div>
    </div>
    <button class="btn btn-ac" data-act="lockIn">LOCK IN ${esc(LL.tableName(id).toUpperCase())} →</button>`;
  };

  LL.pages.map = () => {
    const S = LL.state;
    const b = S.booking;
    return `
    <section class="wrap map-head">
      <div class="d h-map">PICK YOUR SPOT.</div>
      <div class="legend mono">
        <span><i class="lg free"></i>FREE</span><span><i class="lg held"></i>BEING BOOKED</span><span><i class="lg taken"></i>TAKEN</span><span class="tx"><i class="lg sel"></i>YOURS</span>
      </div>
    </section>
    <section class="wrap map-body">
      <div class="floor-wrap" id="floor-wrap">
        <div class="floor" id="floor">
          <div class="fgrid"></div>
          <div class="fzone bar-z mono">THE BAR</div>
          <div class="fzone chef-z mono">CHEF’S COUNTER · OPEN KITCHEN</div>
          <div class="fterrace"></div><div class="flab" style="left:660px;top:46px">TERRACE ☾</div>
          <div class="flab" style="left:226px;top:144px">MAIN FLOOR</div>
          <div class="fdj mono">DJ ♫</div>
          ${LL.TABLES.map((t) => { const s = LL.floorState(t.id); return `<button class="tb ${s}" data-act="pickTable" data-id="${t.id}" data-tbl="${t.id}" style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;border-radius:${t.r}">${s === 'held' ? 'HELD' : t.id}</button>`; }).join('')}
          <div class="flive mono">${LL.liveDot}LIVE · UPDATES EVERY FEW SECONDS</div>
        </div>
      </div>
      <div class="col gap16 map-side" data-region="mapdetail">${LL.mapDetail()}</div>
    </section>
    <section class="wrap"><div class="between wrapx gap12 map-foot mu sm-t"><span>${b.party} people · ${LL.dateStr(b.day)} · ${esc(b.time)} PM</span><a href="#/book" class="linkbtn">← CHANGE DETAILS</a></div></section>`;
  };

  LL.after.map = () => {
    const wrap = document.getElementById('floor-wrap');
    const fl = document.getElementById('floor');
    if (!wrap || !fl) return;
    const fit = () => {
      const s = Math.min(1, wrap.clientWidth / 900);
      fl.style.transform = `scale(${s})`;
      wrap.style.height = 580 * s + 'px';
    };
    fit();
    if (LL._ro) LL._ro.disconnect();
    LL._ro = new ResizeObserver(fit);
    LL._ro.observe(wrap);
  };

  // ------------------------------------------------------------ CONFIRMATION ---
  LL.pages.booked = () => {
    const S = LL.state;
    const bk = S.booked;
    if (!bk) return `<section class="wrap sec"><div class="d h-xl">NO BOOKING YET.</div><a class="btn btn-ac" href="#/book">GET A TABLE →</a></section>`;
    const tn = LL.tableName(bk.table);
    const checked = S.table === bk.table;
    const nm = (S.user ? S.user.name : bk.name || 'Guest').split(' ');
    const short = nm.length > 1 ? nm[0][0] + '. ' + nm.slice(1).join(' ') : nm[0];
    const d = LL.DAYS.find((x) => x.n === bk.day);
    const pre = [
      { id: 'bad-decisions', q: bk.party, label: `${bk.party} × BAD DECISIONS`, p: bk.party * 17 },
      { id: 'petnat', q: 1, label: 'BOTTLE · PET-NAT', p: 62 },
      { id: 'oysters12', q: 1, label: 'OYSTERS × 12', p: 44 },
    ];
    return `
    <section class="wrap conf">
      <div>
        <div class="mono ac conf-ref">CONFIRMATION · ${esc(bk.ref)}</div>
        <div class="d h-conf">YOU’RE<br><span class="ac">IN.</span></div>
        <p class="mu conf-p">${esc(tn)} is yours ${LL.DAYNAME[d.w]} at ${esc(bk.time)}. We’ll text a reminder at 5PM. Running late? Hit “I’m late” and we’ll hold it 15 more.</p>
        <div class="row gap10 fw">
          ${checked ? `<a class="btn btn-ac" href="#/menu">ORDER FROM YOUR TABLE →</a>` : `<button class="btn btn-ac" data-act="checkInBooked">I’M HERE — CHECK IN</button>`}
          <button class="btn btn-line" data-act="addCal">ADD TO CALENDAR</button>
          <a class="btn btn-line" href="#/visit">DIRECTIONS</a>
          <a class="btn btn-ghost mu" href="#/book">MODIFY</a>
          ${checked ? '' : '<button class="btn btn-ghost mu" data-act="imLate">I’M LATE</button>'}
        </div>
      </div>
      <div class="ticketc">
        <div class="tc-top">
          <div class="between mono tc-r"><span>LOWLIFE · ADMIT ${bk.party}</span><span>${d.w} ${String(bk.day).padStart(2, '0')}.10</span></div>
          <div class="d tc-big">${esc(tn.toUpperCase())}<br>${esc(bk.time)} PM</div>
          <div class="tc-grid mono"><div><div class="o6">NAME</div>${esc(short.toUpperCase())}</div><div><div class="o6">PARTY</div>${bk.party} PPL</div><div><div class="o6">DEPOSIT</div>$${bk.party * 10} PAID</div></div>
        </div>
        <div class="tc-bot">
          <span class="notch l"></span><span class="notch r"></span>
          <div class="mono">SHOW AT THE DOOR<br>SKIP THE QUEUE</div>
          <div class="qr">${LL.qr(bk.ref)}</div>
        </div>
      </div>
    </section>
    <section class="wrap pre">
      <div><div class="d pre-h">SKIP THE BAR QUEUE.</div><div class="mu pre-p">Pre-order the first round. It’ll be on the table when you sit down.</div></div>
      <div class="pre-grid">
        ${pre.map((p) => `
        <button class="pre-card" data-act="preAdd" data-id="${p.id}" data-q="${p.q}">
          <span class="ph-s ph thumb64"></span>
          <span class="col gap6 tl"><span class="d pre-n">${esc(p.label)}</span><span class="mono ac sm">+ $${p.p}</span></span>
        </button>`).join('')}
      </div>
    </section>`;
  };
})();
