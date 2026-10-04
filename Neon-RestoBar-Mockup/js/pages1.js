/* LOWLIFE — Home, Menu, Dish, Send-to-kitchen */
(function () {
  const LL = window.LL;
  const esc = LL.esc;
  LL.pages = LL.pages || {};
  LL.after = LL.after || {};

  // ---------------------------------------------------------------- HOME ------
  LL.pages.home = () => {
    const S = LL.state;
    const marqText = 'NEGRONI SBAGLIATO ✶ ORDER FROM YOUR SEAT ✶ DJ KAYA FRI ✶ KITCHEN TIL 1AM ✶ BAD DECISIONS ✶ ';
    const m = `<span>${marqText.repeat(2)}</span>`;
    return `
    <section class="wrap statusrow mono">
      <div class="row center gap12 tx">${LL.liveDot}OPEN NOW — KITCHEN TIL 1AM · BAR TIL 3AM</div>
      <div class="hide-m">88 WIRE ST · DOWNTOWN · EST. 2019</div>
    </section>

    <section class="wrap hero d">
      <div>Drink like</div>
      <div class="hero-mid"><span>nobody’s</span><span class="ph pill-photo">[ PHOTO — NEGRONI POUR, BACKLIT ]</span></div>
      <div class="hero-end">
        <span class="ac">watching.</span>
        <div class="hero-side">
          <p>Small plates, loud cocktails and a sound system that’s had complaints. Walk-ins welcome. Regrets not.</p>
          <div class="row gap10 fw">
            <a class="btn btn-ac hov-tilt" href="#/book">BOOK A TABLE →</a>
            <a class="btn btn-line" href="#/menu">ORDER TO YOUR TABLE</a>
          </div>
        </div>
      </div>
    </section>

    <section class="wrap hero-photo-wrap">
      <div class="ph hero-photo">[ HERO PHOTO — BARTENDER TORCHING AN OLD FASHIONED, CROWD BLURRED, NEON BACKLIGHT ]
        <div class="sticker"><span class="mono">TONIGHT · 10PM</span><span class="d">DJ KAYA<br>DISCO</span><span class="mono">FREE B4 11</span></div>
      </div>
    </section>

    <div class="marq"><div class="marq-in">${m}${m}</div></div>

    <section class="wrap sec">
      <div class="between end sec-head">
        <div class="d h-xl">The hits</div>
        <div class="lbl hide-m">SIGNATURES · ALL $16–18 · <a href="#/menu">FULL BAR MENU →</a></div>
      </div>
      <div class="hits">
        ${LL.HITS.map((id, i) => { const h = LL.dish(id); return `
        <a class="hit" href="#/dish/${h.id}">
          <div class="ph hit-img"><span class="d hit-n ac">0${i + 1}</span><span>[ COCKTAIL — ${esc(h.shot)} ]</span></div>
          <div class="between baseline"><span class="d hit-name">${esc(h.name)}</span><span class="mono">${LL.p(h.price)}</span></div>
          <span class="mu sm-t">${esc(h.desc)}</span>
        </a>`; }).join('')}
      </div>
    </section>

    <section class="wrap tri">
      <a class="tcard big" href="#/menu">
        <span class="lbl">01 — ORDER</span>
        <div><div class="d tc-h">ORDER FROM<br>YOUR SEAT</div><div class="tc-p">Sit anywhere, tap your table, order straight to the kitchen. Last food orders 12:45AM.</div></div>
      </a>
      <a class="tcard" href="#/book">
        <span class="lbl">02 — BOOK</span>
        <div><div class="d tc-h2"><span data-live="seats">${LL.seatsLeft()}</span> SEATS<br>LEFT TONIGHT</div><div class="tc-p">Pick your exact booth on the floor plan.</div></div>
      </a>
      <a class="tcard" href="#/private">
        <span class="lbl">03 — PRIVATE</span>
        <div><div class="d tc-h2">TAKE OVER<br>THE BACK ROOM</div><div class="tc-p">12 to 180 guests. Bar tab or open bar.</div></div>
      </a>
    </section>
    ${S.table ? '' : ''}`;
  };

  // ---------------------------------------------------------------- MENU ------
  LL.dietOn = () => LL.form.diet || (LL.form.diet = { veg: false, gf: false, spicy: false });
  LL.dishCard = (d) => {
    const q = LL.trayCount(d.id);
    return `
    <a class="dish" href="#/dish/${d.id}">
      <div class="ph dish-img">[ ${esc(d.shot)} ]
        ${d.tag ? `<span class="tagpill">${esc(d.tag)}</span>` : ''}
        ${q ? `<span class="inq">${q} IN TRAY</span>` : ''}
      </div>
      <div class="dish-body">
        <span class="d dish-name">${esc(d.name)}</span>
        <span class="dish-desc">${esc(d.desc)}</span>
        <div class="between center dish-foot">
          <span class="mono price">${LL.p(d.price)}</span>
          <button class="plus" data-act="quickAdd" data-id="${d.id}" aria-label="Add ${esc(d.name)}">+</button>
        </div>
      </div>
    </a>`;
  };

  LL.pages.menu = () => {
    const S = LL.state;
    const cat = LL.form.cat || 'small';
    const diet = LL.dietOn();
    const list = LL.MENU.filter((d) => d.cat === cat && (!diet.veg || d.veg) && (!diet.gf || d.gf) && (!diet.spicy || d.spicy));
    const n = LL.cartCount();
    const where = S.table ? LL.tableName(S.table) : null;
    return `
    <section class="wrap menu-head">
      <div class="d h-menu">THE MENU</div>
      <div class="menu-meta">
        ${where
          ? `<button class="seatchip lg" data-act="openModal" data-type="table"><span class="livedot"></span><span>SEATED · ${esc(where)}</span><span class="mu">CHANGE</span></button>`
          : `<button class="btn btn-ac" data-act="openModal" data-type="table">SET MY TABLE →</button>`}
        <div class="row center gap10 lbl">${LL.liveDot}KITCHEN OPEN · ~14 MIN TO YOUR TABLE</div>
      </div>
    </section>

    <section class="wrap">
      <div class="filterbar">
        <div class="row gap8 fw cats">
          ${LL.CATS.map((c) => `<button class="chip ${c.id === cat ? 'on' : ''}" data-act="setCat" data-id="${c.id}">${esc(c.name.toUpperCase())} · ${LL.MENU.filter((d) => d.cat === c.id).length}</button>`).join('')}
        </div>
        <div class="row gap16 diet mono">
          <button class="${diet.veg ? 'on' : ''}" data-act="toggleDiet" data-k="veg">${diet.veg ? '☒' : '☐'} VEG</button>
          <button class="${diet.gf ? 'on' : ''}" data-act="toggleDiet" data-k="gf">${diet.gf ? '☒' : '☐'} GF</button>
          <button class="${diet.spicy ? 'on' : ''}" data-act="toggleDiet" data-k="spicy">${diet.spicy ? '☒' : '☐'} SPICY</button>
        </div>
      </div>
    </section>

    <section class="wrap menu-body">
      <div class="dishes">
        ${list.length ? list.map(LL.dishCard).join('') : `<div class="empty">Nothing here matches those filters.<br><button class="linkbtn" data-act="clearDiet">CLEAR FILTERS</button></div>`}
      </div>
      <aside class="side"><div class="card side-in" data-region="tray">${LL.trayHTML()}</div></aside>
    </section>

    <div class="mobbar ${n ? 'show' : ''}">
      <button class="mb" data-act="openTray"><span>VIEW TRAY · ${n}</span><span class="mono">${LL.money(LL.trayTotal())}</span></button>
    </div>`;
  };

  // ---------------------------------------------------------------- DISH ------
  LL.dishState = (id) => {
    if (!LL.dishForm || LL.dishForm.id !== id) LL.dishForm = { id, heat: 'LOUD', addons: [], qty: 1, pair: false, note: '', thumb: 0 };
    return LL.dishForm;
  };
  LL.dishUnit = (d, f) => d.price + (d.addons || []).filter((a) => f.addons.includes(a.id)).reduce((n, a) => n + a.price, 0);

  LL.pages.dish = (id) => {
    const d = LL.dish(id);
    if (!d) return `<section class="wrap sec"><div class="d h-xl">NOT ON THE MENU.</div><a class="btn btn-ac" href="#/menu">BACK TO THE MENU →</a></section>`;
    const f = LL.dishState(id);
    const cat = LL.CATS.find((c) => c.id === d.cat);
    const pair = d.pair && LL.dish(d.pair);
    const total = LL.dishUnit(d, f) * f.qty + (f.pair && pair ? pair.price : 0);
    const thumbs = ['HERO', 'SIDE ANGLE', 'DETAIL', '▶ 0:12'];
    const allergy = (d.allergens || []).map((a) => `<span class="tg">${esc(a)}</span>`).join('');
    const words = d.name.split(' ');
    const title = words.length > 2 ? words.slice(0, -1).join(' ') + '<br>' + words.slice(-1) : d.name;
    return `
    <section class="wrap crumbs lbl"><a href="#/menu">MENU</a> / <a href="#/menu" data-act="gotoCat" data-id="${d.cat}">${esc(cat.name.toUpperCase())}</a> / <span class="tx">${esc(d.name.toUpperCase())}</span></section>
    <section class="wrap dish-page">
      <div class="gal">
        <div class="ph gal-main">[ ${f.thumb ? esc(thumbs[f.thumb]) + ' — ' : 'HERO — '}${esc(d.shot)} ]
          ${d.tag ? `<span class="sticker-tag">${esc(d.tag)}</span>` : ''}
          <a class="back-x" href="#/menu" aria-label="Back">✕</a>
        </div>
        <div class="thumbs">${thumbs.map((t, i) => `<button class="ph-s ph th ${f.thumb === i ? 'on' : ''}" data-act="dfThumb" data-i="${i}" aria-label="${esc(t)}">${i === 3 ? '▶ 0:12' : ''}</button>`).join('')}</div>
      </div>
      <div class="dish-info">
        <div class="row gap8 fw">
          ${d.veg ? '<span class="tg">VEG</span>' : ''}${d.gf ? '<span class="tg">GF</span>' : ''}${allergy}
          ${d.spicy ? '<span class="tg hot">🌶 CAN GO LOUD</span>' : ''}
        </div>
        <div class="d h-dish">${title}</div>
        <div class="row baseline gap16 fw"><span class="mono big-p">${LL.p(d.price)}</span><span class="mu dd">${esc(d.long)}</span></div>

        ${d.heat ? `
        <div class="col gap12"><span class="lbl">CHOOSE YOUR HEAT</span>
          <div class="seg3">${LL.HEAT.map((h) => `<button class="${f.heat === h ? 'on' : ''}" data-act="dfHeat" data-v="${h}">${h}</button>`).join('')}</div>
        </div>` : ''}

        ${(d.addons || []).length ? `
        <div class="col gap12"><span class="lbl">MAKE IT WORSE (BETTER)</span>
          <div class="addons">${d.addons.map((a) => { const on = f.addons.includes(a.id); return `
            <button class="addon" data-act="dfAddon" data-id="${a.id}"><span class="row center gap12"><span class="cb ${on ? 'on' : ''}">${on ? '✓' : ''}</span>${esc(a.name)}</span><span class="mono mu">+$${a.price}</span></button>`; }).join('')}</div>
        </div>` : ''}

        ${pair ? `
        <button class="pair ${f.pair ? 'on' : ''}" data-act="dfPair">
          <span class="ph-s ph pair-img"></span>
          <div class="grow col gap6 tl"><span class="lbl ac">THE BAR SAYS DRINK THIS</span><span class="d pair-n">${esc(pair.name)} — ${esc(pair.desc)}</span></div>
          <span class="pair-p mono">${f.pair ? '✓ ADDED' : '+ $' + pair.price}</span>
        </button>` : ''}

        <label class="field"><span class="lbl">NOTE FOR THE KITCHEN (OPTIONAL)</span><input id="df-note" data-bind="dfNote" value="${esc(f.note)}" placeholder="No cilantro, extra crispy…"></label>

        <div class="row gap12 buyrow">
          <span class="bigstep">${LL.stepper('df', f.qty, 'dfQty')}</span>
          <button class="btn btn-ac grow between" data-act="dfAdd"><span>ADD TO TRAY</span><span class="mono">${LL.money(total)}</span></button>
        </div>
      </div>
    </section>`;
  };

  // ---------------------------------------------------------------- SEND ------
  LL.pages.send = () => {
    const S = LL.state;
    const F = LL.form;
    if (!S.tray.length) {
      return `<section class="wrap sec"><div class="d h-xl">TRAY’S EMPTY.</div><p class="mu">Add a few things from the menu, then come back to send it to the kitchen.</p><div class="row gap10 fw"><a class="btn btn-ac" href="#/menu">BROWSE THE MENU →</a>${LL.activeCount() ? '<a class="btn btn-line" href="#/order">TRACK YOUR ORDER</a>' : ''}</div></section>`;
    }
    const mode = F.sendMode || (S.table ? 'table' : S.booked ? 'pre' : 'table');
    const course = F.course || 'now';
    const allergies = F.allergies || [];
    const hasFood = S.tray.some((i) => i.station === 'kitchen');
    const hasBar = S.tray.some((i) => i.station === 'bar');
    const name = F.sendName !== undefined ? F.sendName : S.user ? S.user.name : '';
    const eta = Math.max(...S.tray.map((i) => i.mins));
    const sub = LL.trayTotal();
    const radio = (on) => `<span class="radio ${on ? 'on' : ''}"></span>`;
    return `
    <section class="wrap send-head">
      <div class="d h-send">SEND IT IN.</div>
      <div class="steps mono"><span class="mu">01 TRAY ✓</span><span class="ac cur">02 DETAILS</span><span class="mu">03 SENT</span></div>
    </section>
    <section class="wrap send-body">
      <div class="col gap44">
        <div class="col gap16">
          <span class="d h-sec">WHERE ARE YOU?</span>
          <div class="grid2">
            <button class="opt ${mode === 'table' ? 'on' : ''}" data-act="sendMode" data-v="table">
              <span class="row between center opt-t">At my table ${radio(mode === 'table')}</span>
              <span class="mu opt-d">${S.table ? `${esc(LL.tableName(S.table))} — straight to the pass.` : 'Set your table number so the kitchen knows where to send it.'}</span>
              ${S.table ? '' : '<span class="ac mono sm">NO TABLE SET</span>'}
            </button>
            <button class="opt ${mode === 'pre' ? 'on' : ''} ${S.booked ? '' : 'dis'}" data-act="sendMode" data-v="pre">
              <span class="row between center opt-t">Pre-order ${radio(mode === 'pre')}</span>
              <span class="mu opt-d">${S.booked ? `For ${esc(LL.tableName(S.booked.table))}, Fri ${S.booked.day} Oct · ${esc(S.booked.time)} PM. Held until you check in.` : 'Book a table first and you can pre-order the first round.'}</span>
            </button>
          </div>
          ${mode === 'table' ? `<button class="seatchip lg" data-act="openModal" data-type="table">${S.table ? `<span class="livedot"></span><span>${esc(LL.tableName(S.table))}</span><span class="mu">CHANGE</span>` : '<span>SET YOUR TABLE</span><span class="ac">→</span>'}</button>` : ''}
        </div>

        <div class="col gap16">
          <span class="d h-sec">WHEN SHOULD IT LAND?</span>
          <div class="grid2">
            <button class="opt ${course === 'now' ? 'on' : ''}" data-act="setCourse" data-v="now">
              <span class="row between center opt-t">All at once ${radio(course === 'now')}</span>
              <span class="mu opt-d">Everything goes on the fire now. Comes out as it’s ready.</span>
            </button>
            <button class="opt ${course === 'hold' ? 'on' : ''} ${hasFood && hasBar ? '' : 'dis'}" data-act="setCourse" data-v="hold">
              <span class="row between center opt-t">Drinks first ${radio(course === 'hold')}</span>
              <span class="mu opt-d">${hasFood && hasBar ? 'Drinks now. Food waits until you tap FIRE from your order screen.' : 'Add at least one drink and one dish to stagger them.'}</span>
            </button>
          </div>
        </div>

        <div class="col gap16">
          <span class="d h-sec">WHO’S HUNGRY?</span>
          <label class="field"><span class="lbl">NAME FOR THE TICKET</span><input id="send-name" data-bind="sendName" value="${esc(name)}" placeholder="Jordan" autocomplete="name"></label>
          <div class="col gap10"><span class="lbl">ANYTHING THE KITCHEN SHOULD KNOW? (SHOWS IN RED)</span>
            <div class="row fw gap8">${LL.ALLERGIES.map((a) => `<button class="chip ${allergies.includes(a) ? 'on' : ''}" data-act="toggleAllergy" data-v="${a}">${a}</button>`).join('')}</div>
          </div>
          <label class="field"><span class="lbl">NOTE FOR THE KITCHEN</span><textarea id="send-note" data-bind="sendNote" rows="2" placeholder="Share plates in the middle, please.">${esc(F.sendNote || '')}</textarea></label>
        </div>
      </div>

      <aside class="card sum">
        <span class="d sum-h">ORDER #LL-${S.seq}</span>
        <div class="sum-lines">
          ${S.tray.map((i) => `<div class="between"><span>${i.qty} × ${esc(i.name)}${i.mods ? `<span class="mu sm-t"> · ${esc(i.mods)}</span>` : ''}</span><span class="mono">${LL.money(i.qty * i.price)}</span></div>`).join('')}
        </div>
        <div class="col gap10 mu sum-t">
          <div class="between"><span>Subtotal</span><span class="mono">${LL.money(sub)}</span></div>
          <div class="between"><span>Tax (on your tab)</span><span class="mono">${LL.money(sub * LL.TAX)}</span></div>
          <div class="between"><span>Est. to table</span><span class="mono">~${eta} MIN</span></div>
        </div>
        <div class="between baseline sum-tot"><span class="d">ON YOUR TAB</span><span class="mono">${LL.money(sub)}</span></div>
        <button class="btn btn-ac" data-act="sendOrder">${mode === 'pre' ? 'SEND PRE-ORDER →' : 'SEND TO KITCHEN →'}</button>
        <span class="mu sm-t center-t">No payment now. Settle up from your table whenever you’re ready${S.user ? ' — you’ll earn points on the lot' : ''}.</span>
      </aside>
    </section>`;
  };
})();
