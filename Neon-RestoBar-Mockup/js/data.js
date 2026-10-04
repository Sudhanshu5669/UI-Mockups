/* LOWLIFE — static data (menu, floor plan, events, rewards) */
(function () {
  const LL = (window.LL = window.LL || {});

  LL.TAX = 0.0887;
  LL.HEAT = ['MILD', 'LOUD', 'UNHINGED'];

  LL.CATS = [
    { id: 'small', name: 'Small plates' },
    { id: 'raw', name: 'Raw bar' },
    { id: 'fried', name: 'Fried & filthy' },
    { id: 'sweets', name: 'Sweets' },
    { id: 'cocktails', name: 'Cocktails' },
    { id: 'zero', name: 'Zero-proof' },
  ];

  const dbl = { id: 'double', name: 'Make it a double', price: 6 };
  const smoke = { id: 'smoke', name: 'Smoke the glass', price: 2 };

  // station: 'kitchen' | 'bar'   mins: realistic minutes to table
  LL.MENU = [
    { id: 'wings', cat: 'small', name: 'Burnt Honey Wings', price: 14, tag: '🌶 LOUD', shot: 'WINGS, GLAZE CLOSE-UP', desc: 'Six wings, gochujang butter, sesame, scallion.', long: 'Six wings lacquered in burnt honey and gochujang butter, finished with sesame and scallion. Messy by design.', spicy: true, allergens: ['SOY', 'SESAME'], heat: true, addons: [{ id: 'ranch', name: 'Burnt-lime ranch', price: 2 }], pair: 'neon-gimlet', station: 'kitchen', mins: 14 },
    { id: 'sliders', cat: 'small', name: 'Wagyu Smash Sliders', price: 18, tag: '#1 AFTER MIDNIGHT', shot: 'SLIDERS, CHEESE PULL', desc: 'Two per order. Black garlic aioli, pickled shallot.', long: 'Two per order. Black garlic aioli, pickled shallot, American cheese that refuses to apologise.', spicy: true, allergens: ['BEEF', 'DAIRY'], heat: true, addons: [{ id: 'truffle', name: 'Truffle cheese', price: 4 }, { id: 'patty', name: 'Extra patty', price: 6 }, { id: 'jalap', name: 'Pickled jalapeños', price: 1 }], pair: 'bad-decisions', station: 'kitchen', mins: 12 },
    { id: 'crudo', cat: 'small', name: 'Yuzu Tuna Crudo', price: 19, tag: 'GF', shot: 'CRUDO, TOP-DOWN', desc: 'Chili oil, crispy shallot, finger lime.', long: 'Sushi-grade tuna, yuzu, chili oil, crispy shallot and finger lime. Cold, bright, dangerous.', gf: true, allergens: ['FISH'], addons: [{ id: 'roe', name: 'Salmon roe', price: 5 }], pair: 'sbagliato', station: 'kitchen', mins: 8 },
    { id: 'corn', cat: 'small', name: 'Charred Corn Ribs', price: 12, tag: 'VEG · GF', shot: 'CORN RIBS, CHAR', desc: 'Miso butter, lime, cotija, tajín.', long: 'Corn ribs charred hard, brushed with miso butter, lime, cotija and tajín.', veg: true, gf: true, allergens: ['DAIRY', 'SOY'], pair: 'shiso', station: 'kitchen', mins: 11 },
    { id: 'bao', cat: 'small', name: 'Hot Honey Chicken Bao', price: 15, tag: 'NEW', shot: 'BAO, HAND-HELD', desc: 'Buttermilk thigh, kewpie slaw, pickles.', long: 'Buttermilk fried thigh, hot honey, kewpie slaw and pickles in a pillowy bao.', spicy: true, allergens: ['GLUTEN', 'DAIRY', 'EGG'], heat: true, pair: 'velvet', station: 'kitchen', mins: 13 },
    { id: 'burrata', cat: 'small', name: 'Smoked Burrata', price: 16, tag: 'VEG', shot: 'BURRATA, CHARRED BREAD', desc: 'Charred bread, chili honey, basil oil.', long: 'Smoked burrata, charred sourdough, chili honey and basil oil.', veg: true, allergens: ['DAIRY', 'GLUTEN'], pair: 'sbagliato', station: 'kitchen', mins: 9 },

    { id: 'oysters6', cat: 'raw', name: 'Oysters × 6', price: 22, tag: 'GF', shot: 'OYSTERS ON ICE', desc: 'Half dozen, mignonette, hot sauce, lemon.', long: 'Half a dozen cold, briny oysters. Mignonette, house hot sauce, lemon.', gf: true, allergens: ['SHELLFISH'], pair: 'clean-slate', station: 'kitchen', mins: 6 },
    { id: 'oysters12', cat: 'raw', name: 'Oysters × 12', price: 44, tag: 'FOR THE TABLE', shot: 'OYSTER TOWER', desc: 'A full dozen. Share, or don’t.', long: 'A full dozen. Share, or don’t.', gf: true, allergens: ['SHELLFISH'], pair: 'petnat', station: 'kitchen', mins: 7 },
    { id: 'tartare', cat: 'raw', name: 'Steak Tartare Toast', price: 17, tag: '', shot: 'TARTARE, YOLK', desc: 'Hand-cut beef, cured yolk, capers, rye.', long: 'Hand-cut beef tartare, cured yolk, capers and shallot on griddled rye.', allergens: ['BEEF', 'GLUTEN', 'EGG'], pair: 'velvet', station: 'kitchen', mins: 8 },
    { id: 'scallop', cat: 'raw', name: 'Scallop Ceviche', price: 18, tag: '🌶 LOUD', shot: 'CEVICHE, LIME', desc: 'Leche de tigre, habanero, cucumber, corn nuts.', long: 'Raw scallop in leche de tigre with habanero, cucumber and crunchy corn nuts.', gf: true, spicy: true, allergens: ['SHELLFISH'], pair: 'neon-gimlet', station: 'kitchen', mins: 8 },
    { id: 'cones', cat: 'raw', name: 'Tuna Tartare Cones', price: 16, tag: '', shot: 'CONES IN A ROW', desc: 'Sesame cones, ponzu, avocado, nori.', long: 'Crisp sesame cones filled with tuna tartare, ponzu, avocado and nori.', allergens: ['FISH', 'SESAME', 'SOY'], pair: 'shiso', station: 'kitchen', mins: 8 },

    { id: 'fries', cat: 'fried', name: 'Filthy Truffle Fries', price: 11, tag: 'VEG', shot: 'FRIES IN PAPER CONE', desc: 'Parmesan snow, truffle salt, aioli.', long: 'Shoestring fries under a blizzard of parmesan, truffle salt and aioli.', veg: true, allergens: ['DAIRY', 'EGG'], addons: [{ id: 'parm', name: 'Extra parm snow', price: 2 }], pair: 'sbagliato', station: 'kitchen', mins: 9 },
    { id: 'skins', cat: 'fried', name: 'Chicken Skin Crackling', price: 9, tag: 'GF', shot: 'CRACKLING PILE', desc: 'Salt, vinegar, smoked paprika.', long: 'Crisp chicken skin, salt, vinegar and smoked paprika. Bar snack royalty.', gf: true, allergens: [], pair: 'old-fashioned', station: 'kitchen', mins: 8 },
    { id: 'mac', cat: 'fried', name: 'Mac & Cheese Bites', price: 12, tag: 'VEG', shot: 'MAC BITES, CHEESE PULL', desc: 'Three-cheese centre, hot honey dip.', long: 'Three-cheese macaroni, breaded and fried, with a hot honey dip.', veg: true, allergens: ['GLUTEN', 'DAIRY'], pair: 'neon-gimlet', station: 'kitchen', mins: 10 },
    { id: 'calamari', cat: 'fried', name: 'Calamari, ’Nduja Mayo', price: 15, tag: '🌶 LOUD', shot: 'CALAMARI, LEMON', desc: 'Rice-flour dusted, lemon, ’nduja mayo.', long: 'Rice-flour calamari, lemon and a fiery ’nduja mayo.', spicy: true, allergens: ['SHELLFISH', 'EGG'], heat: true, pair: 'sbagliato', station: 'kitchen', mins: 10 },
    { id: 'rings', cat: 'fried', name: 'Onion Ring Tower', price: 10, tag: 'VEG', shot: 'RINGS ON A SPIKE', desc: 'Beer batter, smoky ketchup.', long: 'Beer-battered onion rings stacked high with smoky ketchup.', veg: true, allergens: ['GLUTEN'], pair: 'clean-slate', station: 'kitchen', mins: 9 },
    { id: 'pickles', cat: 'fried', name: 'Fried Pickles, Ranch', price: 9, tag: 'VEG', shot: 'PICKLES, DIP', desc: 'Dill chips, buttermilk ranch.', long: 'Crunchy dill pickle chips with buttermilk ranch.', veg: true, allergens: ['GLUTEN', 'DAIRY'], pair: 'ginger', station: 'kitchen', mins: 8 },

    { id: 'churros', cat: 'sweets', name: 'Midnight Churros', price: 10, tag: 'AFTER 12', shot: 'CHURROS, DARK CHOC', desc: 'Cinnamon sugar, salted chocolate dip.', long: 'Hot churros, cinnamon sugar and a salted dark-chocolate dip.', veg: true, allergens: ['GLUTEN', 'DAIRY', 'EGG'], pair: 'espresso', station: 'kitchen', mins: 9 },
    { id: 'brownie', cat: 'sweets', name: 'Miso Caramel Brownie', price: 11, tag: 'VEG', shot: 'BROWNIE, SMOKE', desc: 'Warm, miso caramel, vanilla salt.', long: 'Warm fudge brownie, miso caramel, flaky vanilla salt.', veg: true, allergens: ['GLUTEN', 'DAIRY', 'EGG', 'SOY'], pair: 'espresso', station: 'kitchen', mins: 7 },
    { id: 'affogato', cat: 'sweets', name: 'Negroni Affogato', price: 13, tag: '21+', shot: 'AFFOGATO POUR', desc: 'Vanilla gelato drowned in a Negroni.', long: 'Vanilla gelato drowned tableside in a bittersweet Negroni.', veg: true, gf: true, allergens: ['DAIRY'], station: 'bar', mins: 4 },
    { id: 'swirl', cat: 'sweets', name: 'Lowlife Swirl', price: 8, tag: 'VEG', shot: 'SOFT-SERVE, NEON', desc: 'Olive-oil soft serve, sea salt, honeycomb.', long: 'Olive-oil soft serve, sea salt and honeycomb crunch.', veg: true, allergens: ['DAIRY', 'GLUTEN'], station: 'kitchen', mins: 5 },

    { id: 'bad-decisions', cat: 'cocktails', name: 'Bad Decisions', price: 17, tag: 'HIT 01', shot: 'SMOKING COUPE', desc: 'Mezcal, passionfruit, ancho chili, lime, smoke', long: 'Mezcal, passionfruit, ancho chili, lime, smoke. The reason you’ll text your ex-self.', spicy: true, gf: true, veg: true, addons: [dbl, smoke], station: 'bar', mins: 5 },
    { id: 'velvet', cat: 'cocktails', name: 'Velvet Underground', price: 18, tag: 'HIT 02', shot: 'ROCKS, BIG CUBE', desc: 'Rye, black cherry, cacao nib, bitters', long: 'Rye, black cherry, cacao nib and bitters over one big cube.', gf: true, veg: true, addons: [dbl], station: 'bar', mins: 5 },
    { id: 'neon-gimlet', cat: 'cocktails', name: 'Neon Gimlet', price: 16, tag: 'HIT 03', shot: 'GLOWING GREEN', desc: 'Gin, makrut lime leaf, cucumber, salt', long: 'Gin, makrut lime leaf, cucumber and salt. Glows under blacklight. Probably.', gf: true, veg: true, addons: [dbl], station: 'bar', mins: 4 },
    { id: 'sbagliato', cat: 'cocktails', name: 'Negroni Sbagliato', price: 15, tag: '', shot: 'SBAGLIATO, ORANGE', desc: 'Campari, sweet vermouth, prosecco, orange', long: 'Campari, sweet vermouth, prosecco and orange. Bubbly mistakes are the best ones.', gf: true, veg: true, station: 'bar', mins: 4 },
    { id: 'old-fashioned', cat: 'cocktails', name: 'Torched Old Fashioned', price: 17, tag: '', shot: 'TORCH, ORANGE PEEL', desc: 'Bourbon, demerara, orange oils, flame', long: 'Bourbon, demerara and bitters. Orange peel torched over the glass.', gf: true, veg: true, addons: [dbl, smoke], station: 'bar', mins: 5 },
    { id: 'espresso', cat: 'cocktails', name: 'Espresso Martini', price: 16, tag: '', shot: 'MARTINI, FOAM', desc: 'Vodka, cold brew, coffee liqueur, sea salt', long: 'Vodka, cold brew, coffee liqueur and sea salt with a thick foam.', gf: true, veg: true, station: 'bar', mins: 4 },
    { id: 'petnat', cat: 'cocktails', name: 'Pet-Nat, Bottle', price: 62, tag: 'BOTTLE', shot: 'BOTTLE IN ICE BUCKET', desc: 'Funky, cloudy, very drinkable. Serves 3–4.', long: 'A funky, cloudy pét-nat. Serves 3–4 and arrives in an ice bucket.', gf: true, veg: true, station: 'bar', mins: 4 },

    { id: 'clean-slate', cat: 'zero', name: 'Clean Slate', price: 11, tag: '0%', shot: 'HIGHBALL, ICE', desc: 'Zero-proof: yuzu, verjus, tonic, shiso', long: 'Zero-proof: yuzu, verjus, tonic and shiso. Tastes like a decision you’ll remember.', gf: true, veg: true, station: 'bar', mins: 4 },
    { id: 'shiso', cat: 'zero', name: 'Shiso Spritz', price: 10, tag: '0%', shot: 'SPRITZ, GREEN', desc: 'Shiso, cucumber, lime, soda', long: 'Shiso, cucumber, lime and soda. Crisp.', gf: true, veg: true, station: 'bar', mins: 3 },
    { id: 'tea', cat: 'zero', name: 'Smoked Tea Highball', price: 10, tag: '0%', shot: 'HIGHBALL, SMOKE', desc: 'Lapsang, honey, lemon, soda', long: 'Lapsang souchong, honey, lemon and soda.', gf: true, veg: true, station: 'bar', mins: 3 },
    { id: 'ginger', cat: 'zero', name: 'Ginger Riot', price: 9, tag: '0%', shot: 'GINGER, FIRE', desc: 'House ginger beer, chili, lime', long: 'House-brewed ginger beer with chili and lime.', gf: true, veg: true, spicy: true, station: 'bar', mins: 3 },
    { id: 'reward-shots', cat: 'reward', name: 'Round of Shots (reward)', price: 0, tag: '', shot: 'SHOTS', desc: 'Redeemed with points.', long: '', station: 'bar', mins: 3 },
  ];

  LL.dish = (id) => LL.MENU.find((d) => d.id === id);
  LL.HITS = ['bad-decisions', 'velvet', 'neon-gimlet', 'clean-slate'];

  // ---- Floor plan -----------------------------------------------------------
  LL.TABLES = [
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: 'S' + (i + 1), x: 64 + i * 62, y: 92, w: 32, h: 32, r: '50%', z: 'bar' })),
    ...[0, 1, 2, 3].map((i) => ({ id: 'B' + (i + 1), x: 40, y: 168 + i * 92, w: 96, h: 72, r: '14px', z: 'booth' })),
    ...[0, 1, 2].flatMap((c) => [0, 1].map((r) => ({ id: 'T' + (c * 2 + r + 1), x: 200 + c * 118, y: 180 + r * 112, w: 68, h: 68, r: '50%', z: 'floor' }))),
    ...[0, 1, 2, 3, 4].map((i) => ({ id: 'C' + (i + 1), x: 226 + i * 66, y: 484, w: 32, h: 32, r: '50%', z: 'chef' })),
    ...[[660, 86], [760, 86], [660, 196], [760, 196]].map(([x, y], i) => ({ id: 'P' + (i + 1), x, y, w: 76, h: 76, r: '12px', z: 'terrace' })),
    { id: 'P5', x: 660, y: 316, w: 176, h: 76, r: '14px', z: 'terrace' },
    { id: 'P6', x: 660, y: 412, w: 176, h: 76, r: '14px', z: 'terrace' },
  ];

  LL.ZONES = {
    bar: { name: 'Bar stools', blurb: 'Front-row to the shakers', cap: [1, 2], min: 0, label: 'Bar stool' },
    booth: { name: 'Velvet booth', blurb: 'Closest to the DJ', cap: [4, 5], min: 160, label: 'Booth' },
    floor: { name: 'Main floor', blurb: 'Right in the noise', cap: [2, 4], min: 60, label: 'Table' },
    chef: { name: 'Chef’s counter', blurb: 'Tasting · $65 pp', cap: [1, 2], min: 65, label: 'Chef’s counter' },
    terrace: { name: 'Terrace', blurb: 'Heaters on · smokers OK', cap: [2, 4], min: 80, label: 'Terrace' },
  };
  LL.BOOK_ZONES = ['bar', 'booth', 'terrace', 'chef'];

  LL.tableZone = (id) => (LL.TABLES.find((t) => t.id === id) || {}).z;
  LL.tableName = (id) => {
    if (!id) return '—';
    const z = LL.tableZone(id);
    const n = id.slice(1);
    const Z = LL.ZONES[z];
    return Z ? `${Z.label} ${n.padStart(2, '0')}` : id;
  };
  LL.tableCap = (id) => {
    if (id === 'P5' || id === 'P6') return [6, 8];
    const z = LL.tableZone(id);
    return LL.ZONES[z] ? LL.ZONES[z].cap : [1, 4];
  };
  LL.tableMin = (id) => (id === 'P5' || id === 'P6' ? 240 : (LL.ZONES[LL.tableZone(id)] || { min: 0 }).min);

  // ---- Booking calendar (week of Mon 05 Oct) -------------------------------------
  LL.DAYS = [
    { n: 5, w: 'MON', closed: true },
    { n: 6, w: 'TUE', dot: 'ac' },
    { n: 7, w: 'WED', dot: 'ac' },
    { n: 8, w: 'THU', dot: 'mu' },
    { n: 9, w: 'FRI', note: 'DJ NIGHT' },
    { n: 10, w: 'SAT', note: '3 LEFT', hot: true },
    { n: 11, w: 'SUN', dot: 'ac' },
    { n: 12, w: 'MON', closed: true },
  ];
  LL.DAYNAME = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };
  LL.TIMES = ['6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30'];
  LL.slot = (day, t) => {
    const i = LL.TIMES.indexOf(t);
    if (day === 9) return { ok: ![0, 1, 3, 6].includes(i), left: i === 5 ? 2 : 0 };
    const h = (day * 7 + i * 5) % 6;
    return { ok: h !== 0, left: h === 1 ? 2 : 0 };
  };

  // ---- Events ------------------------------------------------------------------
  LL.EVENTS = [
    { id: 'kaya', d: '09', m: 'OCT', w: 'FRI', type: 'DJ', title: 'DJ KAYA — DISCO AFTER DARK', meta: 'DISCO · BOOGIE · 10PM–3AM', cta: 'GUESTLIST', free: true },
    { id: 'marlo', d: '10', m: 'OCT', w: 'SAT', type: 'DJ', title: 'HOUSE PARTY: MARLO B2B ITO', meta: 'HOUSE · 10PM–3AM · $15', cta: 'TICKETS' },
    { id: 'mezcal', d: '14', m: 'OCT', w: 'WED', type: 'TASTINGS', title: 'MEZCAL TASTING WITH ALMA', meta: '6 POURS · 7PM · 24 SEATS', cta: 'BOOK $45' },
    { id: 'quiz', d: '16', m: 'OCT', w: 'THU', type: 'QUIZ', title: 'LOUD QUIZ (LOSERS BUY)', meta: 'TEAMS OF 6 · 8PM · FREE', cta: 'ENTER', free: true },
    { id: 'exits', d: '17', m: 'OCT', w: 'FRI', type: 'LIVE', title: 'LIVE: THE SOFT EXITS', meta: 'SOUL · NEO-JAZZ · 9PM', cta: 'TICKETS' },
  ];

  // ---- Rewards -----------------------------------------------------------------
  LL.REWARDS = [
    { id: 'shots', name: 'ROUND OF SHOTS', pts: 500 },
    { id: 'skip', name: 'SKIP-THE-LINE PASS', pts: 800 },
    { id: 'name', name: 'NAME A COCKTAIL', pts: 2000 },
    { id: 'room', name: 'BACK ROOM FOR 2HRS', pts: 5000 },
  ];
  LL.USUALS = [
    { label: 'Wings, Sliders, Fries', date: '27 SEP', total: '$58.40', items: [['wings', 1], ['sliders', 1], ['fries', 1]] },
    { label: 'Crudo, Corn Ribs, Bao ×2', date: '19 SEP', total: '$61.00', items: [['crudo', 1], ['corn', 1], ['bao', 2]] },
    { label: 'Midnight Churros ×3', date: '02 SEP', total: '$30.00', items: [['churros', 3]] },
  ];

  LL.FAQ = [
    { q: 'DRESS CODE?', a: 'Come as you are. Unless you are wearing a backpack. Lose the backpack.' },
    { q: 'DO YOU TAKE WALK-INS?', a: 'Always. Grab any free table and order straight from your phone — or take a stool at the bar. Bookings get priority on booths after 9PM.' },
    { q: 'IS THE KITCHEN REALLY OPEN TIL 1?', a: 'Yes. Last food orders at 12:45AM. The bar keeps going until 3AM on Fridays and Saturdays.' },
    { q: 'HOW DOES ORDERING FROM MY TABLE WORK?', a: 'Sit anywhere, set your table, build your tray and hit Send. It goes straight to the kitchen pass — and you can message the chefs directly if you need to tweak anything.' },
    { q: 'ACCESSIBILITY & DIETARY', a: 'Step-free entrance on Wire St. Every dish is tagged VEG / GF / spicy, and you can flag allergies on every order — the kitchen sees them in red.' },
  ];

  LL.QUICK_MSGS = ['Rush it, please', 'Hold the fries?', 'Allergy update', 'Need cutlery', 'Change spice level', 'All good — thanks!'];
  LL.ALLERGIES = ['NUTS', 'SHELLFISH', 'GLUTEN', 'DAIRY', 'EGGS', 'SESAME'];
})();
