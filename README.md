# Day Clock

A 24-hour clock that colors itself in based on your daily schedule.

## What it does

- Add a time block (start, end, label, color)
- The clock face fills in that section with your chosen color
- The hour hand shows the current time and moves on its own
- Everything is saved in your browser, so it's still there next time you open the page

## How to use it

1. Open `index.html` in any browser
2. Enter a start and end time in 24-hour format (e.g. `14:30`)
3. Type a label (e.g. "Class", "Work", "Sleep")
4. Pick a color
5. Click **Add to clock**

Remove a block anytime with the **Remove** button next to it.

## Files

| File | What it's for |
|---|---|
| `index.html` | Page structure |
| `style.css` | Look and feel |
| `script.js` | Clock logic, form handling, saving data |

## Notes

- No install, no server, no build step — just open `index.html`.
- Data is stored locally in your browser (`localStorage`). It won't sync across devices or browsers.
- Times that cross midnight (e.g. `22:00` to `02:00`) are handled fine.
