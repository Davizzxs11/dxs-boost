// Efeitos das páginas estáticas (Minha conta e Baixar), iguais aos das páginas React:
// menu com o nome da conta, barra de progresso, transição entre páginas e entradas.
// Se algo aqui falhar, a página continua funcionando: o conta.js não depende deste arquivo.
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // menu: nome da conta logada neste navegador e menu do celular
  try {
    const user = localStorage.getItem('dxs-conta-nome'), who = $('#nav-user');
    if (user && who) {
      who.classList.add('who'); who.title = 'Minha conta'; who.textContent = '';
      const av = document.createElement('span'); av.className = 'av'; av.textContent = user.charAt(0).toUpperCase();
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = user;
      who.append(av, nm);
    }
  } catch { }
  const burger = $('nav.top .burger'), panel = $('.menu-panel');
  if (burger && panel) {
    burger.onclick = () => { const open = panel.hidden; panel.hidden = !open; burger.textContent = open ? '✕' : '☰'; burger.setAttribute('aria-expanded', open); };
    panel.onclick = () => { panel.hidden = true; burger.textContent = '☰'; burger.setAttribute('aria-expanded', 'false'); };
  }
  // ver a senha
  $$('[data-eye]').forEach((b) => b.addEventListener('click', () => {
    const input = document.getElementById(b.dataset.eye), show = input.type === 'password';
    input.type = show ? 'text' : 'password'; b.textContent = show ? 'Ocultar' : 'Ver'; b.setAttribute('aria-pressed', show);
  }));

  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const nav = $('nav.top');
  ScrollTrigger.create({ start: 40, end: 'max', onToggle: (s) => nav.classList.toggle('solid', s.isActive) });
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  if (!reduce) $$('.bg i').forEach((o, i) => gsap.to(o, { y: (i + 1) * -140, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } }));

  // saindo para outra página do site: o véu escurece antes de trocar
  const veil = $('.veil');
  addEventListener('pageshow', (e) => { if (e.persisted && veil) gsap.set(veil, { opacity: 0 }); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !veil || reduce || a.target || a.hasAttribute('download') || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.startsWith('/downloads/')) return;
    if (url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) return;
    e.preventDefault(); veil.style.animation = 'none';
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'power2.in', onComplete: () => { location.href = a.href; } });
  });

  // título que entra palavra por palavra
  $$('[data-split]').forEach((el) => {
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.append(' '); else { const s = document.createElement('span'); s.className = 'wd'; s.textContent = p; frag.append(s); } });
        node.replaceWith(frag);
      } else if (node.nodeName !== 'BR') { const s = document.createElement('span'); s.className = 'wd'; node.replaceWith(s); s.append(node); }
    });
    if (!reduce) gsap.from($$('.wd', el), { y: 80, rotateX: -70, opacity: 0, transformOrigin: '50% 100%', stagger: .08, duration: 1, ease: 'power3.out', delay: .2 });
  });

  if (!reduce) {
    // Minha conta: o cartão entra girando e depois só inclina de leve com o mouse
    const wrap = $('.panel-wrap'), card = $('.panel-wrap .card');
    if (wrap && card) {
      gsap.from(wrap, { transformPerspective: 1400, rotateY: -25, rotateX: 10, y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: .3 });
      if (matchMedia('(hover: hover)').matches) {
        const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
        card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          rx((.5 - y) * 5); ry((x - .5) * 6); card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%'); });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); });
      }
    }
    // Baixar: as barras do X chegam girando e se cruzam, depois o botão sobe
    if ($('.xmark')) {
      gsap.timeline({ delay: .2 })
        .from('.xmark .a', { x: -400, rotate: -200, opacity: 0, duration: 1, ease: 'power4.out' }, 0)
        .from('.xmark .b', { x: 400, rotate: 200, opacity: 0, duration: 1, ease: 'power4.out' }, 0)
        .fromTo('.xmark', { scale: 1 }, { scale: 1.12, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out' }, .9)
        .from('.dl h2, .get', { y: 40, opacity: 0, scale: .9, stagger: .08, duration: .7, ease: 'back.out(1.7)' }, .7)
        .from('.meta > *', { y: 20, opacity: 0, stagger: .07, duration: .5, ease: 'power2.out' }, .9);
    }
    if ($('.how')) {
      const how = gsap.timeline({ scrollTrigger: { trigger: '.how', start: 'top 75%', end: 'center 45%', scrub: 1 } });
      how.to('.how .line', { scaleX: 1, ease: 'none', duration: 1 }, 0);
      $$('.how .s').forEach((s, i) => how.from(s, { y: 50, opacity: 0, duration: .3, ease: 'power2.out' }, i * .4));
    }
    // revelação suave do resto
    const items = $$('[data-reveal]');
    if (items.length) {
      gsap.set(items, { opacity: 0, y: 46 });
      ScrollTrigger.batch(items, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, stagger: .09, duration: .9, ease: 'power3.out', overwrite: true }) });
    }
  }
  addEventListener('load', () => ScrollTrigger.refresh());
})();
