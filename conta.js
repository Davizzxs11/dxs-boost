// Página Minha conta: entrar, criar conta, código do e-mail, esqueci a senha e assinatura.
(() => {
  'use strict';
  const config = window.DXS_LICENSE_CONFIG || {};
  // Endereço fixo de reserva: um licensing-config.js antigo no cache não pode desligar as contas.
  const api = String(config.accountApi || 'https://dxs-contas.dxs-contas.workers.dev').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);
  const KEY = 'dxs-conta';
  const views = ['loading', 'signin', 'code', 'forgot', 'account'];
  let signup = false, codeMode = 'verify', codeEmail = '', poll = null, busy = false;

  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { } }
  };
  function view(name) { views.forEach(v => { $('view-' + v).hidden = v !== name; }); }
  function notice(text, ok) { const n = $('notice'); n.hidden = !text; n.textContent = text || ''; n.classList.toggle('ok', !!ok); }
  async function call(method, path, body) {
    if (!api) throw new Error('As contas estão sendo ligadas. Volte em alguns minutos.');
    const headers = { 'Content-Type': 'application/json' }, token = store.get();
    if (token) headers.Authorization = 'Bearer ' + token;
    let r;
    try { r = await fetch(api + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' }); }
    catch { throw new Error('Sem conexão com o servidor do DXS. Confira a internet e tente de novo.'); }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && data.code !== 'credenciais' && path !== '/v1/auth/handoff/use') { store.set(null); }
    if (!r.ok) { const e = new Error(data.error || 'Não deu certo. Tente de novo.'); e.code = data.code; e.status = r.status; throw e; }
    return data;
  }
  async function work(fn) {
    if (busy) return; busy = true; notice('');
    document.querySelectorAll('.card button').forEach(b => b.disabled = true);
    try { await fn(); }
    catch (e) { notice(e.message); if (e.status === 401 && !store.get()) showSignin(); }
    finally { busy = false; document.querySelectorAll('.card button').forEach(b => b.disabled = false); }
  }
  const date = (s) => new Date(s * 1000).toLocaleDateString('pt-BR');

  function paintTabs() {
    $('tab-login').classList.toggle('active', !signup); $('tab-signup').classList.toggle('active', signup);
    $('signin').textContent = signup ? 'Criar conta →' : 'Entrar →';
    $('signin-title').textContent = signup ? 'Comece com 7 dias grátis.' : 'Bem-vindo de volta.';
    $('signin-eyebrow').textContent = signup ? '01 / CRIE SUA CONTA' : '01 / ENTRE NA SUA CONTA';
    $('terms-row').hidden = !signup; $('forgot').parentElement.hidden = signup;
    $('password').autocomplete = signup ? 'new-password' : 'current-password';
  }
  function showSignin() { stopPoll(); view('signin'); paintTabs(); }
  function showCode(mode, email) {
    codeMode = mode; codeEmail = email; view('code'); $('code').value = ''; $('newpass').value = '';
    $('newpass-row').hidden = mode !== 'reset';
    $('code-title').textContent = mode === 'reset' ? 'Crie uma senha nova.' : 'Confirme seu e-mail.';
    $('code-text').textContent = 'Enviamos um código de 6 números para ' + email + '. Confira também o spam.';
    $('code').focus();
  }
  function showAccount(a) {
    view('account');
    const labels = { teste: 'Teste grátis', pago: 'Assinatura ativa', cortesia: 'Acesso cortesia', nenhum: 'Sem assinatura' };
    $('acc-plan').textContent = labels[a.plan] || 'Sua conta';
    const now = Date.now() / 1000;
    $('acc-until').textContent = a.until && a.until > now
      ? (a.plan === 'teste' ? 'O teste vai até ' + date(a.until) + '. Depois, R$ 10 por mês.' : 'Vale até ' + date(a.until) + '.')
      : (a.trialUsed ? 'Seu teste grátis acabou. Assine para continuar usando o DXS Boost.' : 'Entre no app para começar seus 7 dias grátis.');
    $('acc-email').textContent = a.email;
    $('acc-pc').textContent = a.pc ? 'PC conectado: ' + a.pc.name + '. A conta funciona em um PC por vez.' : 'Nenhum PC conectado ainda. Baixe o app e entre com esta conta.';
    const card = a.subscription && a.subscription.status === 'authorized';
    $('cancel-area').hidden = !card;
    $('pay-card').hidden = card;
    if (a.pix) showPix(a.pix); else $('pix').hidden = true;
    if (a.plan === 'pago' && !a.pix) stopPoll();
  }
  function showPix(p) {
    $('pix').hidden = false; $('pix-code').textContent = p.qr;
    if (p.image) { $('pix-qr').src = 'data:image/png;base64,' + p.image; $('pix-qr').hidden = false; }
    startPoll();
  }
  function startPoll(ms = 4000, minutes = 20) {
    stopPoll(); const until = Date.now() + minutes * 60000;
    poll = setInterval(async () => {
      if (Date.now() > until) return stopPoll();
      try {
        const before = $('acc-plan').textContent;
        const { account } = await call('GET', '/v1/me'); showAccount(account);
        if (account.plan === 'pago' && before !== 'Assinatura ativa') { notice('Pagamento confirmado. O DXS Boost já está liberado.', true); stopPoll(); }
      } catch { }
    }, ms);
  }
  function stopPoll() { if (poll) clearInterval(poll); poll = null; }
  async function load() {
    const { account } = await call('GET', '/v1/me'); showAccount(account);
    const q = new URLSearchParams(location.search);
    if (q.get('pagamento') === 'cartao' && account.plan !== 'pago') { notice('Recebemos sua assinatura. Assim que o Mercado Pago aprovar, a conta libera sozinha.', true); startPoll(5000, 10); }
  }

  $('tab-login').onclick = () => { signup = false; paintTabs(); notice(''); };
  $('tab-signup').onclick = () => { signup = true; paintTabs(); notice(''); };
  $('signin').onclick = () => work(async () => {
    const email = $('email').value.trim(), password = $('password').value;
    if (!email || !password) throw new Error('Preencha o e-mail e a senha.');
    if (signup) {
      if (password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
      if (!$('terms').checked) throw new Error('Para criar a conta, concorde com os termos.');
      await call('POST', '/v1/auth/signup', { email, password }); showCode('verify', email); return;
    }
    try {
      const r = await call('POST', '/v1/auth/login', { email, password, client: 'web' });
      store.set(r.token); $('password').value = ''; showAccount(r.account);
    } catch (e) { if (e.code === 'confirmar') { showCode('verify', email); notice(e.message, true); } else throw e; }
  });
  $('confirm').onclick = () => work(async () => {
    const code = $('code').value.replace(/\D/g, '');
    if (code.length !== 6) throw new Error('Digite os 6 números do código.');
    let r;
    if (codeMode === 'reset') {
      const password = $('newpass').value; if (password.length < 8) throw new Error('A senha nova precisa ter pelo menos 8 caracteres.');
      r = await call('POST', '/v1/auth/reset', { email: codeEmail, code, password, client: 'web' });
    } else r = await call('POST', '/v1/auth/verify', { email: codeEmail, code, client: 'web' });
    store.set(r.token); showAccount(r.account);
    notice(codeMode === 'reset' ? 'Senha trocada. Entre no app de novo com a senha nova.' : 'Conta confirmada. Baixe o app e entre com ela para começar os 7 dias grátis.', true);
  });
  $('resend').onclick = () => work(async () => {
    await call('POST', codeMode === 'reset' ? '/v1/auth/forgot' : '/v1/auth/resend', { email: codeEmail });
    notice('Código reenviado. Pode levar um minuto para chegar.', true);
  });
  $('code-back').onclick = (e) => { e.preventDefault(); notice(''); showSignin(); };
  $('forgot').onclick = (e) => { e.preventDefault(); notice(''); $('forgot-email').value = $('email').value.trim(); view('forgot'); $('forgot-email').focus(); };
  $('forgot-back').onclick = (e) => { e.preventDefault(); notice(''); showSignin(); };
  $('forgot-send').onclick = () => work(async () => {
    const email = $('forgot-email').value.trim(); if (!email) throw new Error('Digite o e-mail da conta.');
    await call('POST', '/v1/auth/forgot', { email }); showCode('reset', email);
  });
  $('pay-card').onclick = () => work(async () => { const r = await call('POST', '/v1/billing/card'); location.href = r.url; });
  $('pay-pix').onclick = () => work(async () => { const r = await call('POST', '/v1/billing/pix'); showPix(r.pix); });
  $('pix-copy').onclick = async () => { try { await navigator.clipboard.writeText($('pix-code').textContent); notice('Código Pix copiado.', true); } catch { notice('Selecione o código acima e copie.'); } };
  $('cancel').onclick = (e) => { e.preventDefault(); if (confirm('Cancelar a renovação no cartão? O mês já pago continua valendo.')) work(async () => { const r = await call('POST', '/v1/billing/cancel'); showAccount(r.account); notice('Renovação cancelada. Seu acesso vale até o fim do período pago.', true); }); };
  $('logout').onclick = () => work(async () => { try { await call('POST', '/v1/auth/logout'); } catch { } store.set(null); showSignin(); });
  ['email', 'password'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('signin').click(); }));
  $('code').addEventListener('keydown', e => { if (e.key === 'Enter') $('confirm').click(); });

  // Entrada vinda do app (#entrar=passe de uso único) ou link de criar conta (#criar).
  (async () => {
    const hash = location.hash;
    if (hash === '#criar') signup = true;
    const m = /^#entrar=([A-Za-z0-9_-]{20,100})$/.exec(hash);
    if (m || hash) history.replaceState(null, '', location.pathname + location.search);
    if (m) { try { const r = await call('POST', '/v1/auth/handoff/use', { code: m[1] }); store.set(r.token); } catch (e) { notice(e.message); } }
    if (!store.get()) return showSignin();
    try { await load(); } catch (e) { if (!store.get()) showSignin(); else { view('account'); notice(e.message); } }
  })();
})();
