# LOWLIFE — Neon Noir (interactive prototype)

Clickable prototype built from the Claude Design project "Restaurant & Bar Website UI"
(`LOWLIFE A - Neon Noir`). No build step, no dependencies.

    open index.html          # or: python3 -m http.server  →  http://localhost:8000

## What changed vs. the design canvas
- Home delivery / pickup removed. **Menu = order from your seat**: set your table, build a tray,
  send it to the kitchen, then track each item and message the chefs directly.
- Bag/checkout became **Tray → Send to kitchen → Your order** (tab + pay at the table).
- Pre-order from a booking is held until you check in.
- Accent is fixed lime (theme toggle: dark/light, in the TWEAKS panel).

## Screens (hash routes)
`#/` home · `#/menu` · `#/dish/:id` · `#/send` · `#/order` · `#/book` · `#/book/map` · `#/booked` ·
`#/events` · `#/private` · `#/rewards` · `#/visit` · `#/kitchen` (staff pass — open in a 2nd tab to play kitchen)

State lives in localStorage and syncs across tabs. TWEAKS → reset demo data.
`design-source/` holds the original files pulled from Claude Design, for reference only.
