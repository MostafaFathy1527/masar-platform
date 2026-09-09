// Screenshot capture via the DevTools protocol.
// Chrome --headless --screenshot does NOT lay out RTL at a narrow viewport correctly:
// it renders wider than --window-size and clips the capture. Emulation.setDeviceMetricsOverride does.
// Usage: start chrome --headless=new --remote-debugging-port=9333, then:
//   node scripts/shot.mjs <url> <outfile> <width> <height> <dpr> [steps.js]
// steps.js, if given, is evaluated in the page after load and before the capture.
// It runs as an async function body and must resolve before the shot is taken —
// a capture that fires mid-transition is the same class of lie as a clipped one.
import fs from 'node:fs';
const [,, url, out, w, h, dpr, stepsFile] = process.argv;
const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const target = list.find(t => t.type === 'page') || list[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pend.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
  setTimeout(() => { if (pend.has(i)) { pend.delete(i); rej(new Error('timeout: ' + method)); } }, 30000);
});
await new Promise(r => ws.addEventListener('open', r, { once: true }));
await send('Page.enable');
const em = await send('Emulation.setDeviceMetricsOverride',
  { width:+w, height:+h, deviceScaleFactor:+dpr, mobile:+w < 768, screenWidth:+w, screenHeight:+h });
if (em.error) console.log('emulation error:', em.error);
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 10000));
if (stepsFile) {
  await send('Runtime.enable');
  const src = fs.readFileSync(stepsFile, 'utf-8');
  const r = await send('Runtime.evaluate', {
    expression: `(async () => { ${src} })()`,
    awaitPromise: true, returnByValue: true,
  });
  const ex = r.result?.exceptionDetails;
  if (ex) { console.log('steps threw:', ex.exception?.description || ex.text); process.exit(1); }
  // The steps report what they actually did. A step file that silently matched
  // nothing would otherwise produce a screenshot of an untouched page.
  console.log('steps:', JSON.stringify(r.result?.result?.value));
}
const shot = await send('Page.captureScreenshot', { format: 'png' });
if (shot.error) { console.log('capture error:', JSON.stringify(shot.error)); process.exit(1); }
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out, fs.statSync(out).size, 'bytes');
process.exit(0);
