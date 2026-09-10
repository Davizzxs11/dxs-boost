(() => {
  'use strict';
  const $=id=>document.getElementById(id), config=window.DXS_LICENSE_CONFIG||{}, storage='dxs-license-access-v1';
  const accessPattern=/^[A-Za-z0-9_-]{43}$/, pcPattern=/^DXS-[A-F0-9]{64}$/;
  let current=null, busy=false, token=null;
  const notice=(text,type='')=>{const box=$('notice');box.textContent=text;box.className='notice '+type;box.hidden=false;};
  try {current=JSON.parse(localStorage.getItem(storage));}catch{}
  const configured=(()=>{try{return new URL(config.apiUrl).protocol==='https:';}catch{return false;}})();
  async function api(path,body) {
    if(!configured)throw Error('A ativação online ainda está em preparação. Nenhuma cobrança foi iniciada.');
    const r=await fetch(config.apiUrl.replace(/\/$/,'')+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(90000),credentials:'omit',redirect:'error'});
    let data;try{data=await r.json();}catch{throw Error('Não foi possível consultar o serviço. Tente novamente.');}
    if(!r.ok)throw Error(data.error||'Não foi possível concluir. Tente novamente.');return data;
  }
  function download(text,name,type='text/plain') {
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function save(order) {localStorage.setItem(storage,JSON.stringify(order));current=order;}
  async function action(fn) {
    if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{await fn();}catch(e){notice(e.message||'Não foi possível concluir.','error');}
    finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  if(!configured)notice('A ativação online está em preparação. O teste gratuito v0.8.2 continua disponível na página de download.');
  if(document.body.dataset.page==='checkout') {
    let incomingAccess=null;
    function receivePC(){
      const h=new URLSearchParams(location.hash.slice(1));
      const fragment=h.get('pc');
      if(fragment && pcPattern.test(fragment) && !$('pc').readOnly)$('pc').value=fragment;
      const ac=h.get('ac');
      if(ac && accessPattern.test(ac))incomingAccess=ac;
    }
    receivePC();window.addEventListener('hashchange',receivePC);
    if(current && accessPattern.test(current.access||'')) {
      $('saved').hidden=false;
      $('saved-text').textContent='Você já tem um código de acesso salvo neste navegador. Consulte a compra antes de criar outra assinatura.';
    }
    $('prepare').addEventListener('click',()=>{
      const device=$('pc').value.trim().toUpperCase(),email=$('email').value.trim().toLowerCase();
      if(!pcPattern.test(device))return notice('Copie o código completo em Minha licença, dentro do DXS Boost.','error');
      if(!$('email').checkValidity() || !email)return notice('Informe seu e-mail.','error');
      if(current && !incomingAccess && (current.device!==device || current.email!==email))return notice('Já existe uma compra salva. Abra Minha licença e consulte-a; para outra compra, use um perfil separado do navegador.','error');
      try {
        if(!current || (incomingAccess && current.access!==incomingAccess)) {
          const access=incomingAccess||btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
          save({access,device,email});
        }
        $('access-code').textContent=current.access;$('backup').hidden=false;$('pc').readOnly=true;$('email').readOnly=true;
        if(incomingAccess){const r=$('access-code').previousElementSibling;if(r)r.style.display='none';$('access-code').style.display='none';$('save-code').style.display='none';const t=document.querySelector('.check span');if(t)t.innerHTML='Concordo com a cobrança de R$ 10 e com os <a href="/termos">termos</a>. No cartão a assinatura renova todo mês; no Pix vale um mês.';}
        notice(incomingAccess?'Tudo pronto. O DXS Boost já guardou seu código e vai ativar sozinho assim que a cobrança for aprovada. Pode seguir para o pagamento.':'Guarde o código de acesso antes de continuar. Cole esse código no app para ativar e receber as renovações.');
      } catch {notice('Permita o armazenamento local neste navegador para guardar o acesso à compra. Nenhuma cobrança foi iniciada.','error');}
    });
    $('save-code').onclick=()=>download('DXS Boost — código de acesso privado\n\n'+current.access+'\n\nPC: '+current.device+'\nAtive no app: Minha licença > Ativar com código. As renovações chegam com internet.\nConsulta e arquivo: https://dxsboost.com.br/minha-licenca/\nNão compartilhe este código.\n','DXS-Guarde-seu-codigo.txt');
    $('consent').onchange=()=>{if($('consent').checked)notice('Tudo certo. Escolha como pagar: cartão (renova sozinho) ou Pix (um mês).');};
    $('pay').onclick=()=>action(async()=>{
      if(!$('consent').checked)throw Error('Confirme que guardou seu código e aceita a assinatura mensal.');
      const result=await api('/v1/checkout',{...current,consent:true});
      const target=new URL(result.checkout);
      if(target.protocol!=='https:' || !['www.mercadopago.com.br','mercadopago.com.br'].includes(target.hostname))throw Error('O endereço do pagamento não pôde ser validado.');
      location.assign(target.href);
    });

    let pixTimer=null;
    function aguardarPix() {
      if(pixTimer)return;
      const inicio=Date.now();
      const tick=async()=>{
        try {
          const data=await api('/v1/license/status',{access:current.access});
          if(data.status==='active') {
            clearInterval(pixTimer);pixTimer=null;
            $('pix-status').className='notice success';
            $('pix-status').textContent='Pagamento confirmado. Pode voltar para o DXS Boost: ele ativa sozinho em até um minuto. Se preferir, baixe o arquivo em Minha licença.';
            return;
          }
        } catch {}
        // Nunca conclui pelo tempo: só o serviço confirma o pagamento.
        if(Date.now()-inicio>30*60*1000) {
          clearInterval(pixTimer);pixTimer=null;
          $('pix-status').textContent='Ainda sem confirmação. Se você já pagou, abra Minha licença e consulte com calma; a cobrança não se perde.';
        }
      };
      pixTimer=setInterval(tick,6000);tick();
    }
    function mostrarPix(dados) {
      $('pix-code').textContent=dados.qr;
      // A imagem vem do serviço; o formato é conferido antes de virar data: URL.
      if(typeof dados.imagem==='string' && /^[A-Za-z0-9+/=\s]{100,400000}$/.test(dados.imagem)) {
        $('pix-qr').src='data:image/png;base64,'+dados.imagem.replace(/\s+/g,'');
        $('pix-qr').hidden=false;
      }
      $('pix').hidden=false;
      document.querySelectorAll('#backup button').forEach(b=>b.hidden=true);
      aguardarPix();
    }
    $('pix-copy').onclick=()=>{
      const texto=$('pix-code').textContent;
      const selecionar=()=>{const r=document.createRange();r.selectNodeContents($('pix-code'));const sel=getSelection();sel.removeAllRanges();sel.addRange(r);notice('Selecionei o código. Copie com Ctrl+C e cole no Pix Copia e Cola do seu banco.');};
      try{navigator.clipboard.writeText(texto).then(()=>notice('Código Pix copiado. Cole em Pix Copia e Cola no app do seu banco.','success'),selecionar);}catch{selecionar();}
    };
    $('pay-pix').onclick=()=>action(async()=>{
      if(!$('consent').checked)throw Error('Confirme que aceita a cobrança de R$ 10 antes de continuar.');
      const result=await api('/v1/checkout/pix',{...current,consent:true});
      if(typeof result.qr!=='string' || result.qr.length<20 || result.qr.length>2000)throw Error('Não foi possível gerar o código Pix. Tente novamente.');
      mostrarPix(result);
      notice('Pague R$ 10 pelo QR Code ou pelo Pix Copia e Cola. Não feche esta página.');
    });
  }
  if(document.body.dataset.page==='license') {
    if(current?.access)$('access').value=current.access;
    $('consult').onclick=()=>action(async()=>{
      const access=$('access').value.trim();if(!accessPattern.test(access))throw Error('Cole o código de acesso guardado durante a compra.');
      token=null;$('license-result').hidden=true;
      const data=await api('/v1/license/status',{access});
      try{save({...current,access,device:data.device});}catch{}
      if(data.status==='active' && /^DXS1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(data.license||'')) {
        token=data.license;$('license-result').hidden=false;
        $('expiry').textContent=new Date(data.expires*1000).toLocaleString('pt-BR');
        $('licensed-pc').textContent=data.device;
        notice('Pagamento confirmado pelo serviço. Sua licença está disponível.','success');
      } else if(data.status==='expired')notice('O período pago terminou. Se houve uma nova cobrança, aguarde a confirmação e consulte novamente.');
      else notice('Ainda não encontramos uma cobrança aprovada para esta compra. Se acabou de pagar, aguarde e consulte novamente.');
    });
    $('download-license').onclick=()=>{if(token)download(token+'\n','DXSBoost.dxslicense');};
    $('forget').onclick=()=>{if(confirm('Você guardou seu código? Isso remove somente o acesso deste navegador e não cancela a assinatura.')){localStorage.removeItem(storage);current=null;$('access').value='';token=null;$('license-result').hidden=true;notice('Acesso removido deste navegador. Sua assinatura não foi cancelada.');}};
    // Não usar status=approved, authorized ou outros parâmetros como confirmação.
    if(location.search)history.replaceState(null,'',location.pathname+location.hash);
  }
})();
