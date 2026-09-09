// Shot 5, part B: start the exam, answer every item, submit, and frame the
// per-objective breakdown. Assumes 05a-guest-entry.js has run in this browser.
//
// The answers are deliberately arbitrary — the shot is of the breakdown, not
// the score. What matters is that every item is answered, so the breakdown has
// something to report on each objective rather than a row of zeroes.

// Signed out, AttemptRunner renders the guest form instead of a start button.
// Failing here means the session from part A did not carry over, and the shot
// would otherwise be of a login prompt.
if (document.querySelector('.assess-start form[action="/api/demo"]')) {
  throw new Error('not signed in — guest form is showing, run 05a first');
}
const startBtn = document.querySelector('.assess-start button.btn-primary');
if (!startBtn) throw new Error('no start button');
startBtn.click();

const waitFor = async (sel, ms, what) => {
  const end = Date.now() + ms;
  while (!document.querySelector(sel)) {
    if (Date.now() > end) throw new Error('timed out waiting for ' + what);
    await new Promise((r) => setTimeout(r, 200));
  }
  return document.querySelector(sel);
};

await waitFor('section.assess ol.assess-items li', 20000, 'the started attempt');
// 16 = the EXAM blueprint in scripts/seed-assessment.mts, eight objectives at
// two items each. This assertion is what caught the page telling the learner
// there were nine: it checked the page against the blueprint instead of
// against the page's own copy.
const items = [...document.querySelectorAll('section.assess > ol.assess-items > li')];
if (items.length !== 16) throw new Error('expected 16 exam items, got ' + items.length);

// One click per render. toggle() reads the response map from its render
// closure, so a burst of clicks in a single tick keeps only the last.
let answered = 0;
for (const li of items) {
  const opt = li.querySelector('ul li button');
  if (!opt) throw new Error('item with no options');
  opt.click();
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
  if (li.querySelector('button[aria-pressed="true"]')) answered += 1;
}
if (answered !== items.length) throw new Error('expected ' + items.length + ' answered, got ' + answered);

document.querySelector('.assess-actions button.btn-primary').click();
await waitFor('section.assess-review', 25000, 'the review section');

// The argument of this shot is the objective breakdown and the weakest list,
// not the score line above them. Frame those.
const objectives = document.querySelector('ul.assess-objectives');
if (!objectives) throw new Error('no objective breakdown rendered');
const weakest = document.querySelector('.assess-weakest');
document.querySelector('section.assess-review').scrollIntoView({ block: 'start' });
await new Promise((r) => setTimeout(r, 900));

return {
  items: items.length,
  answered,
  objectiveRows: objectives.querySelectorAll('li').length,
  weakestShown: !!weakest,
  reviewTop: Math.round(document.querySelector('section.assess-review').getBoundingClientRect().top),
};
