// Password gate for the whole site, run by Vercel before any file is served.
// The password is the APP_PASSWORD environment variable in the Vercel project settings.
// Changing it signs everyone out. Opening /logout signs the current browser out.

export const config = { matcher: '/:path*' };

const COOKIE = 'dc_pass';
const MAX_AGE = 60 * 60 * 24 * 30; // stay signed in for 30 days
const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' };

// Let the request through to the static files (what next() in @vercel/functions returns)
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1', ...NOINDEX } });

async function tokenFor(password) {
  const bytes = new TextEncoder().encode('deep-clean:' + password);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Compare without stopping at the first difference, so timing says nothing about the token
function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookie(request, name) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

// Only ever send people back to a path on this site
function safePath(p) {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\') ? p : '/';
}

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page({ status = 401, message = '', next = '/', form = true }) {
  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>The Unreachables</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@800&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" rel="stylesheet">
<style>
:root{--void:#0a1d4a;--enamel:#f1e9d6;--sky:#8fd0ff;--btn:#0b4ea6;--btn-hover:#1462c4;--ink:#f1e9d6;--muted:#b9c7e4;--bad:#ff8a9c}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{display:flex;align-items:center;justify-content:center;padding:24px 16px;color:var(--ink);
  font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif;
  background:radial-gradient(ellipse at 50% 120%, #1a3a86 0%, var(--void) 60%) fixed, var(--void)}
main{width:100%;max-width:400px}
h1{font-family:"Jost",system-ui,sans-serif;font-weight:800;font-size:clamp(40px,12vw,60px);line-height:.9;letter-spacing:-.025em;
  margin:0 0 14px;color:var(--enamel);text-shadow:0 0 38px rgba(143,208,255,.28)}
h1 .the{display:block;font-size:.42em;letter-spacing:.02em;margin:0 0 .12em .04em;color:var(--sky)}
p{margin:0 0 24px;font-size:17px;line-height:1.5;color:var(--muted)}
label{display:block;margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--sky)}
input{width:100%;font:inherit;font-size:18px;padding:14px 18px;border-radius:14px;color:var(--ink);
  background:rgba(241,233,214,.07);border:1.5px solid rgba(241,233,214,.22);outline:none}
input:focus{border-color:var(--sky);box-shadow:0 0 0 3px rgba(143,208,255,.25)}
.err{margin:10px 0 0;font-size:15px;font-weight:600;color:var(--bad)}
button{margin-top:18px;width:100%;border:0;border-radius:999px;padding:16px 30px;font:inherit;font-weight:800;font-size:19px;color:#fff;cursor:pointer;background:var(--btn);
  box-shadow:0 0 0 1.5px rgba(143,208,255,.45), 0 8px 28px rgba(4,14,40,.55)}
button:hover{background:var(--btn-hover)}
button:focus-visible{outline:3px solid var(--sky);outline-offset:3px}
</style>
</head>
<body>
<main>
  <h1><span class="the">The</span> Unreachables</h1>
  ${form ? `<p>This preview is private. Enter the password to play.</p>
  <form method="post" action="/__pass">
    <input type="hidden" name="next" value="${escape(next)}">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus${message ? ' aria-describedby="err" aria-invalid="true"' : ''}>
    ${message ? `<p class="err" id="err" role="alert">${escape(message)}</p>` : ''}
    <button type="submit">Let me in</button>
  </form>` : `<p>${escape(message)}</p>`}
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...NOINDEX },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const password = process.env.APP_PASSWORD;

  // Stay locked if the password has not been set up, rather than falling open
  if (!password) return page({ status: 503, form: false, message: 'This site is locked until a password is set up.' });

  const token = await tokenFor(password);

  if (url.pathname === '/logout') {
    return new Response(null, {
      status: 303,
      headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`, 'Cache-Control': 'no-store' },
    });
  }

  if (url.pathname === '/__pass' && request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const next = safePath(form && form.get('next'));
    const tried = form ? String(form.get('password') || '') : '';
    if (tried && same(await tokenFor(tried), token)) {
      return new Response(null, {
        status: 303,
        headers: { Location: next, 'Set-Cookie': `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`, 'Cache-Control': 'no-store' },
      });
    }
    return page({ next, message: 'That password did not work. Try again.' });
  }

  if (same(cookie(request, COOKIE), token)) return pass();

  return page({ next: url.pathname + url.search });
}
