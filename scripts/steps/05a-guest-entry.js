// Shot 5, part A: enter as a guest so an attempt can be created.
//
// /api/attempt requires a signed-in learner (the attempt row has to belong to
// someone). Guest entry is a plain POST form so it works without JavaScript;
// posting it with fetch from here sets the same session cookie, without a
// navigation that would destroy this evaluation context.
// There is no GET /api/me. The data-export route is the honest probe: it is
// guarded by the same requireUser() the attempt route uses, so a 200 means a
// real session exists rather than merely that a cookie was set.
const before = await fetch('/api/me/export').then((r) => r.status);

const res = await fetch('/api/demo', { method: 'POST' });
if (!res.ok) throw new Error('guest entry returned ' + res.status);

const me = await fetch('/api/me/export');
if (!me.ok) throw new Error('/api/me/export after guest entry returned ' + me.status);
const body = await me.json().catch(() => null);

// The account created here is deleted at the end of the session. Guests are
// purged after 7 days anyway, but "created to exercise something, removed in
// the same sitting" is the rule, and a retention policy is not a licence to
// leave rows behind.
return { exportBefore: before, exportAfter: me.status, email: body?.user?.email ?? body?.email ?? null };
