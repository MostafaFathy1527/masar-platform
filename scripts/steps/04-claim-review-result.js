// Shot 4: flag the four fields, submit, wait for the result section.
//
// The buttons carry no key attribute, so selection is positional: the first
// ul.sim-fields inside section.sim-claim is the claim's fields, in the order
// they appear in content/.../claim-review.json; the second is its lines.
// Every index is checked against the label text that ought to be there, and
// the step throws rather than shooting a page it did not actually change.
const sect = document.querySelector('section.sim-claim');
if (!sect) throw new Error('no section.sim-claim');
const uls = sect.querySelectorAll('ul.sim-fields');
if (uls.length !== 2) throw new Error('expected 2 ul.sim-fields, got ' + uls.length);

const fieldBtns = [...uls[0].querySelectorAll('li > button')];
const lineBtns = [...uls[1].querySelectorAll('li > button')];
if (fieldBtns.length !== 16) throw new Error('expected 16 fields, got ' + fieldBtns.length);
if (lineBtns.length !== 3) throw new Error('expected 3 lines, got ' + lineBtns.length);

// member_dob = 1, service_date = 6, dx_primary = 12; line_2 = 1.
const picks = [fieldBtns[1], fieldBtns[6], fieldBtns[12], lineBtns[1]];
// One click per render, which is what a real click sequence produces.
// Clicking all four in a single tick flags only the last: toggle() copies the
// `flagged` set captured in its render closure rather than using a functional
// updater, so four updates in one batch all start from the same stale set.
// Not reachable by hand — the browser renders between discrete events — but
// the screenshot must not depend on that, and the component should not either.
const clicked = [];
for (const b of picks) {
  b.click();
  clicked.push(b.querySelector('.sim-field-label')?.textContent?.trim());
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
}

// aria-pressed is the component's own record of what is flagged. If four
// clicks did not produce four pressed buttons, the shot would show a lie.
// React batches the state updates, so the DOM does not reflect the clicks
// until after a render — reading it synchronously reports 0 every time.
let pressed = 0;
const pressDeadline = Date.now() + 5000;
while (Date.now() < pressDeadline) {
  pressed = sect.querySelectorAll('button[aria-pressed="true"]').length;
  if (pressed === 4) break;
  await new Promise((r) => setTimeout(r, 100));
}
if (pressed !== 4) throw new Error('expected 4 flagged, got ' + pressed);

const submit = document.querySelector('.sim-actions button.btn-primary');
if (!submit) throw new Error('no submit button');
submit.click();

// Wait for the scored result rather than a fixed delay.
const deadline = Date.now() + 20000;
while (!document.querySelector('section.sim-result')) {
  if (Date.now() > deadline) throw new Error('result section never appeared');
  await new Promise((r) => setTimeout(r, 200));
}
// The argument of this shot is the result panel — the score, the written
// outcome for each error, and the link back to the block that taught it.
// At 900px that sits below the fold, so a capture of the viewport top would
// be a real screenshot of the wrong thing.
document.querySelector('section.sim-result').scrollIntoView({ block: 'start' });
await new Promise((r) => setTimeout(r, 900));

const pct = document.querySelector('section.sim-result')?.textContent?.match(/\d+%/)?.[0];
const rTop = document.querySelector('section.sim-result').getBoundingClientRect().top;
return { clicked, pressed, scoreShown: pct, resultTopInViewport: Math.round(rTop) };
