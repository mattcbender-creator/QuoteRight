/**
 * Pricing regression tests for the QuoteRight POC.
 *
 *   node test/pricing.test.mjs
 *
 * These run the real calc() out of index.html in a headless browser rather
 * than re-implementing the maths here — a test that reimplements the formula
 * only proves the reimplementation agrees with itself.
 *
 * The fixture that matters is REFERENCE: five real lines from a working
 * electrician's Estimator_2023.xlsx, which must reconcile to his spreadsheet
 * to the cent. If we hand a contractor his own numbers back and they don't
 * match the sheet he already trusts, he won't use the app twice.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const APP = 'file://' + resolve(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = Math.abs(got - want) < 0.005;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}: ${got}${ok ? '' : `  (expected ${want})`}`);
  ok ? pass++ : fail++;
};
const checkIs = (name, got, want) => {
  const ok = got === want;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}: ${got}${ok ? '' : `  (expected ${want})`}`);
  ok ? pass++ : fail++;
};

const browser = await chromium.launch({ executablePath: CHROME });
const page = await (await browser.newContext()).newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await page.goto(APP);
await page.waitForTimeout(400);

const r = await page.evaluate(() => {
  const out = {};

  // Five real lines from Estimator_2023.xlsx. All-in installed unit prices
  // plus an ESA permit passed through at cost. Complexity and buffer are
  // deliberately set high: neither may touch unit prices or a permit.
  const ref = { id:'t', rate:95, cx:1.5, buffer:true, type:'custom', groups:[{
    n:'Kitchen', d:'', labor:[], mats:[],
    units:[['receptacles 15a - new location installed',12,65],
           ['pot light IC slim LED 4inch white 3000k.',18,130],
           ['switches - new location installed',8,65],
           ['circuits to panel 20a includes breaker',4,230]],
    pass:[['ESA permit.',450]] }] };
  out.ref = calc(ref);

  // Build-up work must still get the full risk layer.
  const build = { id:'t2', rate:95, cx:1.5, buffer:true, type:'custom', groups:[{
    n:'Bath', d:'', labor:[['Demo',10]], mats:[['Tile',1000,'x']], pass:[] }] };
  out.build = calc(build);

  // Mixed job: the uplift applies to the build-up half only.
  const mixed = { id:'t3', rate:95, cx:1.5, buffer:true, type:'custom', groups:[{
    n:'Mixed', d:'', labor:[['Demo',10]], mats:[],
    units:[['Recep',10,65]], pass:[['Permit',450]] }] };
  out.mixed = calc(mixed);
  out.mixedItems = clientItems(mixed);
  out.mixedMilestones = milestoneRows(out.mixed);

  // Margin appears only once he tells us what a unit price costs him.
  const before = DB.profile.unitCost;
  DB.profile.unitCost = 60;
  out.refWithCost = calc(ref);
  DB.profile.unitCost = before;

  // No tax configured => no tax line, total equals subtotal.
  const beforeTax = DB.profile.tax;
  DB.profile.tax = { label:'None', rate:0 };
  out.refNoTax = calc(ref);
  DB.profile.tax = beforeTax;

  return out;
});

console.log('\nREFERENCE — five real lines from Estimator_2023.xlsx');
check('units total',                r.ref.units,   4560);
check('pass-through at cost',       r.ref.passT,   450);
check('no complexity on unit work', r.ref.cxAdd,   0);
check('no contingency on unit work',r.ref.cont,    0);
check('subtotal matches his sheet', r.ref.preTax,  5010);
check('HST 13% matches his sheet',  r.ref.tax,     651.30);
check('grand total matches sheet',  r.ref.total,   5661.30);
checkIs('margin hidden while unit cost unset', r.ref.costKnown, false);
checkIs('margin is null, not a guess',         r.ref.margin,    null);

console.log('\nBUILD-UP — risk layer still applies');
check('labour 10h @ $95',      r.build.labour, 950);
check('materials +20% markup', r.build.matSell, 1300);
check('complexity uplift x1.5',r.build.cxAdd,  1125);
check('contingency 25%',       r.build.cont,   843.75);
checkIs('contingency pct',     r.build.pct,    25);
checkIs('margin known here',   r.build.costKnown, true);

console.log('\nMIXED — uplift touches build-up only');
check('uplift is half of labour, nothing else', r.mixed.cxAdd, 475);
check('units untouched', r.mixed.units, 650);
check('permit untouched', r.mixed.passT, 450);

console.log('\nCLIENT SHEET must foot exactly');
const secSum = r.mixedItems.reduce((s,i)=>s+i.a, 0);
check('sections + contingency = subtotal', secSum + Math.round(r.mixed.cont), Math.round(r.mixed.preTax));
check('milestones sum to the total', r.mixedMilestones.reduce((s,m)=>s+m.a,0), Math.round(r.mixed.total));

console.log('\nSETTINGS affect the maths');
checkIs('margin appears once unit cost is set', r.refWithCost.costKnown, true);
check('no tax configured => total equals subtotal', r.refNoTax.total, r.refNoTax.preTax);
check('no tax configured => tax is zero', r.refNoTax.tax, 0);

console.log('\nRUNTIME');
checkIs('no page errors', pageErrors.length, 0);
if (pageErrors.length) pageErrors.forEach(e => console.log('    ' + e));

await browser.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
