(() => {
  'use strict';
  const $=id=>document.getElementById(id), config=window.DXS_LICENSE_CONFIG||{}, storage='dxs-license-access-v1';
  const accessPattern=/^[A-Za-z0-9_-]{43}$/, pcPattern=/^DXS-[A-F0-9]{64}$/;
  const page=document.body.dataset.page;

  // Na página de pagamento, o link "recuperar" leva junto o código do PC e o código do app.
  if(page==='checkout') {
    const link=()=>document.querySelectorAll('a[data-recover]').forEach(a=>{a.href='/recuperar/'+location.hash;});
    link(); window.addEventListener('hashchange',link);
    return;
  }
  if(page!=='recover') return;

  const configured=(()=>{try{return new URL(config.apiUrl).protocol==='https:';}catch{return false;}})();
  const notice=(text,type='')=>{const box=$('notice');box.textContent=text;box.className='notice '+type;box.hidden=false;};
  const quiet=()=>{$('notice').hidden=true;};
  const fmt=(seconds,time)=>{const d=new Date(seconds*1000);return time?d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):d.toLocaleDateString('pt-BR');};
  const show=step=>['step-email','step-code','step-choose','step-done'].forEach(id=>{$(id).hidden=id!==step;});
  async function api(path,body) {
    if(!configured)throw Error('A recuperação está indisponível no momento. Tente de novo em alguns minutos.');
    let r;
    try{r=await fetch(config.apiUrl.replace(/\/$/,'')+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000),credentials:'omit',redirect:'error'});}
    catch{throw Error('Sem resposta do serviço. Confira sua internet e tente de novo.');}
    let data;try{data=await r.json();}catch{throw Error('Não foi possível consultar o serviço. Tente novamente.');}
    if(!r.ok)throw Error(data.error||'Não foi possível concluir. Tente novamente.');
    return data;
  }
  function download(text,name) {
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain'})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function randomAccess() {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  // O DXS Boost 0.9.2 abre esta página com #pc=...&ac=... e ativa sozinho.
  // Sem #ac (versões anteriores ou link digitado), a página cria o código para colar no app.
  const h=new URLSearchParams(location.hash.slice(1));
  const incomingAccess=accessPattern.test(h.get('ac')||'')?h.get('ac'):null;
  const access=incomingAccess||randomAccess();
  let device=null,email=null,token=null,busy=false,resendAt=0;
  if(pcPattern.test(h.get('pc')||'')) {$('pc').value=h.get('pc');$('pc').readOnly=true;$('pc-from-app').hidden=false;$('pc-help').hidden=true;}
  try{const saved=JSON.parse(localStorage.getItem(storage));if(saved?.email)$('email').value=saved.email;}catch{}
  if(!configured)notice('A recuperação está indisponível no momento. Tente de novo em alguns minutos ou fale com o suporte.','error');

  function cooldown() {
    const left=Math.ceil((resendAt-Date.now())/1000), b=$('resend');
    if(left>0){b.disabled=true;b.textContent='Reenviar em '+left+'s';}
    else{b.disabled=busy;b.textContent='Reenviar código';}
  }
  setInterval(cooldown,1000);
  async function action(fn) {
    if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{await fn();}catch(e){notice(e.message||'Não foi possível concluir.','error');}
    finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);cooldown();}
  }

  $('send').onclick=()=>action(async()=>{
    const pc=$('pc').value.trim().toUpperCase(), mail=$('email').value.trim().toLowerCase();
    if(!pcPattern.test(pc))throw Error('Copie o código completo do PC em Minha licença, dentro do DXS Boost.');
    if(!mail || !$('email').checkValidity())throw Error('Informe o e-mail usado na compra.');
    await api('/v1/recovery/start',{email:mail});
    device=pc;email=mail;resendAt=Date.now()+60000;
    $('sent-to').textContent=mail;$('code').value='';
    show('step-code');$('code').focus();
    notice('Se este e-mail tem uma compra, o código chega em instantes. Olhe também o spam e a aba Promoções.');
  });
  $('resend').onclick=()=>action(async()=>{
    await api('/v1/recovery/start',{email});
    resendAt=Date.now()+60000;
    notice('Pedimos um novo código. Use sempre o e-mail mais recente: o anterior deixa de valer.');
  });
  $('change-email').onclick=()=>{show('step-email');quiet();$('email').focus();};
  $('code').addEventListener('input',()=>{const v=$('code').value.replace(/\D/g,'').slice(0,6);if(v!==$('code').value)$('code').value=v;});
  $('code').addEventListener('keydown',e=>{if(e.key==='Enter')$('confirm').click();});

  async function confirm(extra={}) {
    const code=$('code').value.replace(/\D/g,'');
    if(code.length!==6)throw Error('Digite os 6 números que chegaram no e-mail.');
    const data=await api('/v1/recovery/confirm',{email,code,device,access,...extra});
    if(data.status==='choose' && Array.isArray(data.options))return choose(data.options);
    if(data.status!=='active' || data.device!==device || !/^DXS1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(data.license||''))throw Error('Resposta inesperada do serviço. Tente novamente.');
    done(data);
  }
  $('confirm').onclick=()=>action(()=>confirm());

  function choose(options) {
    const list=$('choices');list.replaceChildren();
    options.filter(o=>/^[a-f0-9]{16}$/.test(o?.ref||'')).forEach((o,i)=>{
      const label=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span');
      label.className='check choice';input.type='radio';input.name='choice';input.value=o.ref;input.checked=i===0;
      text.textContent='PC terminado em '+String(o.pc||'').replace(/[^A-F0-9]/g,'')+' · comprada em '+fmt(o.bought)+' · vale até '+fmt(o.expires);
      label.append(input,text);list.append(label);
    });
    show('step-choose');
    notice('Este e-mail tem mais de uma licença ativa. Escolha qual vem para este PC. O código do PC fica em Minha licença, no app.');
  }
  $('choose').onclick=()=>action(()=>{
    const picked=document.querySelector('input[name=choice]:checked');
    if(!picked)throw Error('Escolha uma das licenças.');
    return confirm({choice:picked.value});
  });

  function done(data) {
    token=data.license;
    try{localStorage.setItem(storage,JSON.stringify({access,device,email}));}catch{}
    $('done-expiry').textContent=fmt(data.expires,true);
    $('done-auto').hidden=!incomingAccess;$('done-manual').hidden=!!incomingAccess;
    $('new-access').textContent=access;
    show('step-done');quiet();
  }
  $('copy-access').onclick=()=>{
    const pick=()=>{const r=document.createRange();r.selectNodeContents($('new-access'));const s=getSelection();s.removeAllRanges();s.addRange(r);notice('Código selecionado. Copie com Ctrl+C.');};
    try{navigator.clipboard.writeText(access).then(()=>notice('Código copiado. Cole no DXS Boost em Ativar com código.','success'),pick);}catch{pick();}
  };
  $('download-license').onclick=()=>{if(token)download(token+'\n','DXSBoost.dxslicense');};
})();
