/**
 * Last Call 公式サイト — main.js
 * 更新: 2026-05-21（クオリティアップ版）
 *
 * モジュール:
 *  0. SMOOTH SCROLL — lerpベース慣性スクロール
 *  1. LOADER        — ローディング画面の退場
 *  2. CUSTOM CURSOR — dot + ring, lerp追従
 *  3. NAV           — スクロール背景変化 + ハンバーガー
 *  4. HERO          — パラックス + stagger + フェードイン
 *  5. REVEAL        — Intersection Observer (fade-in / clip-path reveal)
 *  6. TRAILER       — COMING SOON ↔ 再生ボタン + YouTube モーダル
 *  7. CAST MODAL    — キャストカードのモーダル
 *  8. LIGHTBOX      — ギャラリーライトボックス
 *
 * 依存ライブラリ: なし (vanilla JS / ES2020)
 */

'use strict';

/* ────────────────────────────────────────────────
   ユーティリティ
──────────────────────────────────────────────── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

/** 画像ロード状態でプレースホルダー切替 */
function imgPlaceholder(img, ph) {
  if (!img || !ph) return;
  const sync = () => {
    const ok = img.naturalWidth > 0;
    img.style.display = ok ? '' : 'none';
    ph.style.display  = ok ? 'none' : '';
  };
  img.complete ? sync() : (img.onload = img.onerror = sync);
}

/* ────────────────────────────────────────────────
   0. SMOOTH SCROLL（lerp慣性）
   note: `scroll-behavior: smooth` は CSS から外してここで管理
──────────────────────────────────────────────── */
(function initSmoothScroll() {
  // アンカーリンクのデフォルトを上書き
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.documentElement;
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 64; // nav高さ分オフセット
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
})();

/* ────────────────────────────────────────────────
   1. LOADER
──────────────────────────────────────────────── */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  document.body.classList.add('loading');

  // プログレスバーのアニメが終わったら退場
  // ── 最低でも 1.6s、かつ DOMContentLoaded 後
  const dismiss = () => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    // アニメ完了後に DOM から除去（メモリ節約）
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  };

  const delay = Math.max(1600, performance.now());
  setTimeout(dismiss, 1800 - (performance.now() < 1800 ? performance.now() : 0));
})();

/* ────────────────────────────────────────────────
   2. CUSTOM CURSOR
──────────────────────────────────────────────── */
(function initCursor() {
  const dot  = $('#cursor');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  // タッチデバイスは無効化
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mx = 0, my = 0; // マウス座標
  let rx = 0, ry = 0; // ring 座標（遅延追従）
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // ドットは即時追従
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  }, { passive: true });

  // ring は rAF ループで lerp 追従
  const tick = () => {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  // ホバー時にカーソル拡大
  document.querySelectorAll('a, button, [role="button"], [tabindex="0"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // ウィンドウ外に出たら非表示
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ────────────────────────────────────────────────
   3. NAV
──────────────────────────────────────────────── */
(function initNav() {
  const nav       = $('#nav');
  const hamburger = $('#navHamburger');
  const menu      = $('#navMenu');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!hamburger || !menu) return;
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__link', menu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      menu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ────────────────────────────────────────────────
   4. HERO
──────────────────────────────────────────────── */
(function initHero() {
  /* パラックス */
  const parallax = $('#heroParallax');
  if (parallax) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) return;
      parallax.style.transform = `translateY(${window.scrollY * 0.36}px)`;
    }, { passive: true });
  }

  /* キャッチコピー */
  const catchEl = $('#heroCatch');
  if (catchEl) setTimeout(() => catchEl.classList.add('appear'), 400);

  /* タイトル文字 stagger */
  const titleEl = $('#heroTitle');
  if (titleEl) {
    const text = titleEl.textContent.trim();
    titleEl.innerHTML = text.split('').map((ch, i) =>
      `<span class="char" style="transition-delay:${0.55 + i * 0.075}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
    setTimeout(() => $$('.char', titleEl).forEach(el => el.classList.add('appear')), 200);
  }

  /* 区切り線 */
  const ruleEl = $('.hero__rule');
  if (ruleEl) setTimeout(() => ruleEl.classList.add('appear'), 950);

  /* meta・actions */
  const metaEl    = $('.hero__meta');
  const actionsEl = $('.hero__actions');
  if (metaEl)    setTimeout(() => metaEl.classList.add('appear'),    1050);
  if (actionsEl) setTimeout(() => actionsEl.classList.add('appear'), 1300);
})();

/* ────────────────────────────────────────────────
   5. REVEAL — Intersection Observer
   .fade-in  : opacity + translateY
   .reveal   : clip-path inset
──────────────────────────────────────────────── */
(function initReveal() {
  const targets = $$('.fade-in, .reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.07 });

  targets.forEach(el => observer.observe(el));
})();

/* ────────────────────────────────────────────────
   6. TRAILER
──────────────────────────────────────────────── */
(function initTrailer() {
  const section   = $('.trailer');
  if (!section) return;
  const tid       = section.dataset.trailerId || '';
  const comingEl  = $('#trailerComing');
  const playBtn   = $('#trailerPlay');
  const ytModal   = $('#ytModal');
  const ytBackdrop= $('#ytBackdrop');
  const ytClose   = $('#ytClose');
  const ytIframe  = $('#ytIframe');

  if (tid) {
    if (comingEl) comingEl.hidden = true;
    if (playBtn)  playBtn.hidden  = false;
  }

  const openYT  = () => {
    if (!ytModal || !ytIframe) return;
    ytIframe.src = `https://www.youtube.com/embed/${tid}?autoplay=1&rel=0`;
    ytModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    ytClose?.focus();
  };
  const closeYT = () => {
    if (!ytModal || !ytIframe) return;
    ytIframe.src = '';
    ytModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };

  playBtn?.addEventListener('click',   openYT);
  ytClose?.addEventListener('click',   closeYT);
  ytBackdrop?.addEventListener('click', closeYT);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ytModal && !ytModal.hasAttribute('hidden')) closeYT();
  });
})();

/* ────────────────────────────────────────────────
   7. CAST MODAL
──────────────────────────────────────────────── */
(function initCastModal() {
  const cards   = $$('.cast__card');
  const modal   = $('#castModal');
  const backdrop= $('#modalBackdrop');
  const closeBtn= $('#modalClose');
  const imgEl   = $('#modalImg');
  const phEl    = $('#modalPlaceholder');
  const roleEl  = $('#modalRole');
  const nameEl  = $('#modalName');
  const commentEl = $('#modalComment');
  if (!modal || !cards.length) return;

  let last = null;

  const open = card => {
    last = card;
    const { name='', role='', img='', comment='' } = card.dataset;
    roleEl.textContent    = role;
    nameEl.textContent    = name;
    commentEl.textContent = comment;
    if (phEl) phEl.textContent = name.charAt(0) || '？';

    if (img) {
      imgEl.src = img;
      imgEl.alt = name;
      imgEl.style.display = '';
      phEl && (phEl.style.display = '');
      imgPlaceholder(imgEl, phEl);
    } else {
      imgEl.style.display = 'none';
      phEl && (phEl.style.display = '');
    }
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn?.focus(), 50);
  };

  const close = () => {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    last?.focus();
  };

  cards.forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
    imgPlaceholder(card.querySelector('.cast__img'), card.querySelector('.cast__placeholder'));
  });

  closeBtn?.addEventListener('click',  close);
  backdrop?.addEventListener('click',  close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) close();
  });
})();

/* ────────────────────────────────────────────────
   8. LIGHTBOX
──────────────────────────────────────────────── */
(function initLightbox() {
  const items    = $$('.gallery__item');
  const lb       = $('#lightbox');
  const backdrop = $('#lbBackdrop');
  const imgEl    = $('#lbImg');
  const prevBtn  = $('#lbPrev');
  const nextBtn  = $('#lbNext');
  const closeBtn = $('#lbClose');
  const counter  = $('#lbCounter');
  if (!lb || !items.length) return;

  const srcs = items.map(item => item.dataset.src || item.querySelector('img')?.src || '');
  let cur = 0;

  const show = idx => {
    cur = Math.max(0, Math.min(srcs.length - 1, idx));
    imgEl.src = srcs[cur];
    imgEl.alt = `スチール写真 ${cur + 1}`;
    if (counter) counter.textContent = `${cur + 1} / ${srcs.length}`;
    if (prevBtn) prevBtn.style.opacity = cur === 0 ? '0.25' : '1';
    if (nextBtn) nextBtn.style.opacity = cur === srcs.length - 1 ? '0.25' : '1';
  };

  const open  = i => { show(i); lb.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; closeBtn?.focus(); };
  const close = ()  => { lb.setAttribute('hidden',''); document.body.style.overflow = ''; };

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });

  prevBtn?.addEventListener('click', () => show(cur - 1));
  nextBtn?.addEventListener('click', () => show(cur + 1));
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (lb.hasAttribute('hidden')) return;
    if (e.key === 'ArrowLeft')  show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'Escape')     close();
  });

  // スワイプ
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? show(cur + 1) : show(cur - 1);
  }, { passive: true });
})();
