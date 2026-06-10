/**
 * Last Call 公式サイト — main.js
 * 設計書: DESIGN.md 参照
 *
 * モジュール一覧:
 *  1. NAV：スクロール背景変化 + ハンバーガー
 *  2. HERO：パラックス + タイトル stagger + フェードイン
 *  3. FADE IN：Intersection Observer
 *  4. TRAILER：COMING SOON ↔ 再生ボタン切替 + YouTube モーダル
 *  5. CAST MODAL：キャストカードのモーダル表示
 *  6. LIGHTBOX：ギャラリーライトボックス
 *
 * 依存ライブラリ：なし（vanilla JS / ES2020）
 */

'use strict';

/* ============================================================
   ユーティリティ
============================================================ */

/** 要素が取れなければ何もしない安全な querySelector */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** 画像の読み込み成否でプレースホルダーを切り替える */
function handleImgPlaceholder(imgEl, placeholderEl) {
  if (!imgEl || !placeholderEl) return;
  const toggle = () => {
    const loaded = imgEl.naturalWidth > 0;
    imgEl.style.display          = loaded ? '' : 'none';
    placeholderEl.style.display  = loaded ? 'none' : '';
  };
  if (imgEl.complete) { toggle(); }
  else {
    imgEl.addEventListener('load',  toggle);
    imgEl.addEventListener('error', toggle);
  }
}

/* ============================================================
   1. NAV：スクロール背景変化 & ハンバーガー
============================================================ */
(function initNav() {
  const nav       = $('#nav');
  const hamburger = $('#navHamburger');
  const menu      = $('#navMenu');
  if (!nav) return;

  // スクロールで .scrolled を付与
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ハンバーガー
  if (!hamburger || !menu) return;
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // メニューリンク押下で閉じる
  $$('.nav__link', menu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      menu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ============================================================
   2. HERO：パラックス + タイトル stagger + 各要素フェード
============================================================ */
(function initHero() {
  /* ─ パラックス背景 ─ */
  const parallax = $('#heroParallax');
  if (parallax) {
    const hero = parallax.closest('.hero');
    const onScroll = () => {
      if (window.scrollY > window.innerHeight) return; // ヒーロー範囲外はスキップ
      parallax.style.transform = `translateY(${window.scrollY * 0.38}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─ キャッチコピー フェードイン ─ */
  const catchEl = $('#heroCatch');
  if (catchEl) {
    requestAnimationFrame(() =>
      setTimeout(() => catchEl.classList.add('appear'), 300)
    );
  }

  /* ─ タイトル stagger（文字ごと） ─ */
  const titleEl = $('#heroTitle');
  if (titleEl) {
    const text = titleEl.textContent.trim();
    // 半角スペースは &nbsp; として保持
    titleEl.innerHTML = text
      .split('')
      .map((ch, i) =>
        `<span class="char" style="transition-delay:${0.5 + i * 0.08}s">${
          ch === ' ' ? '&nbsp;' : ch
        }</span>`
      )
      .join('');

    // 次フレームで appear クラス付与
    requestAnimationFrame(() =>
      setTimeout(() => {
        $$('.char', titleEl).forEach(el => el.classList.add('appear'));
      }, 100)
    );
  }

  /* ─ meta・actions フェードイン ─ */
  const metaEl    = $('.hero__meta');
  const actionsEl = $('.hero__actions');
  [metaEl, actionsEl].forEach(el => {
    if (el) setTimeout(() => el.classList.add('appear'), 800);
  });
})();

/* ============================================================
   3. FADE IN：Intersection Observer
============================================================ */
(function initFadeIn() {
  const targets = $$('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. TRAILER：COMING SOON ↔ 再生ボタン切替 + YouTube モーダル
   HTML 側の data-trailer-id="" を動画 ID に書き換えるだけで切替
============================================================ */
(function initTrailer() {
  const section     = $('.trailer');
  if (!section) return;
  const trailerId   = section.dataset.trailerId || '';
  const comingEl    = $('#trailerComing');
  const playBtn     = $('#trailerPlay');
  const ytModal     = $('#ytModal');
  const ytBackdrop  = $('#ytBackdrop');
  const ytClose     = $('#ytClose');
  const ytIframe    = $('#ytIframe');

  // 動画 ID がある → 再生ボタン表示 / COMING SOON 非表示
  if (trailerId) {
    if (comingEl) comingEl.hidden = true;
    if (playBtn)  playBtn.hidden  = false;
  }

  // モーダルを開く
  function openYT() {
    if (!ytModal || !ytIframe) return;
    ytIframe.src = `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`;
    ytModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (ytClose) ytClose.focus();
  }

  // モーダルを閉じる
  function closeYT() {
    if (!ytModal || !ytIframe) return;
    ytIframe.src = '';
    ytModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  if (playBtn)     playBtn.addEventListener('click',   openYT);
  if (ytClose)     ytClose.addEventListener('click',   closeYT);
  if (ytBackdrop)  ytBackdrop.addEventListener('click', closeYT);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ytModal && !ytModal.hasAttribute('hidden')) closeYT();
  });
})();

/* ============================================================
   5. CAST MODAL
============================================================ */
(function initCastModal() {
  const cards       = $$('.cast__card');
  const modal       = $('#castModal');
  const backdrop    = $('#modalBackdrop');
  const closeBtn    = $('#modalClose');
  const imgEl       = $('#modalImg');
  const placeholder = $('#modalPlaceholder');
  const roleEl      = $('#modalRole');
  const nameEl      = $('#modalName');
  const commentEl   = $('#modalComment');
  if (!modal || !cards.length) return;

  let lastFocused = null;

  function openModal(card) {
    lastFocused = card;
    const { name = '', role = '', img = '', comment = '' } = card.dataset;

    roleEl.textContent    = role;
    nameEl.textContent    = name;
    commentEl.textContent = comment;

    // 1文字目をプレースホルダーに
    if (placeholder) placeholder.textContent = name.charAt(0) || '？';

    if (img) {
      imgEl.src = img;
      imgEl.alt = name;
      imgEl.style.display      = '';
      placeholder.style.display = '';
      handleImgPlaceholder(imgEl, placeholder);
    } else {
      imgEl.style.display       = 'none';
      placeholder.style.display = '';
    }

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn?.focus(), 50);
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lastFocused?.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click',   () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  closeBtn?.addEventListener('click',  closeModal);
  backdrop?.addEventListener('click',  closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });

  // キャストカードの初期プレースホルダー処理
  cards.forEach(card => {
    handleImgPlaceholder(
      card.querySelector('.cast__img'),
      card.querySelector('.cast__placeholder')
    );
  });
})();

/* ============================================================
   6. LIGHTBOX
============================================================ */
(function initLightbox() {
  const items     = $$('.gallery__item');
  const lightbox  = $('#lightbox');
  const backdrop  = $('#lbBackdrop');
  const imgEl     = $('#lbImg');
  const prevBtn   = $('#lbPrev');
  const nextBtn   = $('#lbNext');
  const closeBtn  = $('#lbClose');
  const counterEl = $('#lbCounter');
  if (!lightbox || !items.length) return;

  // 全画像の src を配列で管理
  const srcs = items.map(item =>
    item.dataset.src || item.querySelector('img')?.src || ''
  );
  let current = 0;

  function show(index) {
    current = Math.max(0, Math.min(srcs.length - 1, index));
    imgEl.src = srcs[current];
    imgEl.alt = `スチール写真 ${current + 1}`;
    if (counterEl) counterEl.textContent = `${current + 1} / ${srcs.length}`;
    if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = current === srcs.length - 1 ? '0.3' : '1';
  }

  function open(index) {
    show(index);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function close() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click',   () => open(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  prevBtn?.addEventListener('click',  () => show(current - 1));
  nextBtn?.addEventListener('click',  () => show(current + 1));
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Escape')     close();
  });

  // タッチスワイプ
  let tx = 0;
  lightbox.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? show(current + 1) : show(current - 1);
  }, { passive: true });
})();
