/**
 * Last Call 公式サイト — main.js
 * ・スクロールでナビ背景を変化
 * ・Intersection Observer によるフェードインアニメーション
 * ・キャストカードのモーダル表示
 * ・ギャラリーのライトボックス
 * ・ハンバーガーメニュー（SP）
 * 依存ライブラリ：なし（vanilla JS）
 */

'use strict';

/* ============================================================
   ユーティリティ
============================================================ */

/** 要素が画像を読み込めているか判定し、失敗時にプレースホルダーを表示 */
function hidePlaceholderIfImgLoaded(imgEl, placeholderEl) {
  const showOrHide = () => {
    if (imgEl.naturalWidth > 0) {
      placeholderEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
    }
  };
  if (imgEl.complete) {
    showOrHide();
  } else {
    imgEl.addEventListener('load',  () => { placeholderEl.style.display = 'none'; });
    imgEl.addEventListener('error', () => { imgEl.style.display = 'none'; });
  }
}

/* ============================================================
   1. ナビゲーション：スクロールで背景変化 & ハンバーガー
============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('navHamburger');
  const menu = document.getElementById('navMenu');
  if (!nav) return;

  // スクロール時に .scrolled クラスをトグル
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初期状態

  // ハンバーガーメニュー開閉
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      // スクロール抑止
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // メニューリンクをクリックしたら閉じる
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ============================================================
   2. Intersection Observer：フェードインアニメーション
============================================================ */
(function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // 一度だけ発火
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px', // 少し手前でトリガー
    threshold: 0.1
  });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   3. キャストモーダル
============================================================ */
(function initCastModal() {
  const cards   = document.querySelectorAll('.cast__card');
  const modal   = document.getElementById('castModal');
  const backdrop= document.getElementById('modalBackdrop');
  const closeBtn= document.getElementById('modalClose');
  const imgEl   = document.getElementById('modalImg');
  const placeholderEl = document.getElementById('modalPlaceholder');
  const roleEl  = document.getElementById('modalRole');
  const nameEl  = document.getElementById('modalName');
  const commentEl = document.getElementById('modalComment');
  if (!modal || !cards.length) return;

  let lastFocused = null;

  /** モーダルを開く */
  function openModal(card) {
    lastFocused = card;

    // data属性から値を取得
    const name    = card.dataset.name    || '';
    const role    = card.dataset.role    || '';
    const imgSrc  = card.dataset.img     || '';
    const comment = card.dataset.comment || '';

    // モーダルに値をセット
    roleEl.textContent    = role;
    nameEl.textContent    = name;
    commentEl.textContent = comment;
    placeholderEl.textContent = name.charAt(0) || '？';

    if (imgSrc) {
      imgEl.src = imgSrc;
      imgEl.alt = name;
      imgEl.style.display = '';
      placeholderEl.style.display = '';
      hidePlaceholderIfImgLoaded(imgEl, placeholderEl);
    } else {
      imgEl.style.display = 'none';
      placeholderEl.style.display = '';
    }

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // フォーカスをモーダルへ
    setTimeout(() => closeBtn.focus(), 50);
  }

  /** モーダルを閉じる */
  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    // フォーカスを元の位置へ
    if (lastFocused) lastFocused.focus();
  }

  // カードクリック & キーボード
  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // 閉じるボタン
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Escape で閉じる
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
})();

/* ============================================================
   4. ギャラリーライトボックス
============================================================ */
(function initLightbox() {
  const items     = document.querySelectorAll('.gallery__item');
  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lbBackdrop');
  const imgEl     = document.getElementById('lbImg');
  const prevBtn   = document.getElementById('lbPrev');
  const nextBtn   = document.getElementById('lbNext');
  const closeBtn  = document.getElementById('lbClose');
  const counterEl = document.getElementById('lbCounter');
  if (!lightbox || !items.length) return;

  // ギャラリーの全画像srcを配列で管理
  const srcs = Array.from(items).map(item => item.dataset.src || item.querySelector('img')?.src || '');
  let current = 0;

  /** ライトボックスを開く */
  function open(index) {
    current = index;
    showImage();
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /** 画像を表示 */
  function showImage() {
    imgEl.src = srcs[current];
    imgEl.alt = `ギャラリー ${current + 1} / ${srcs.length}`;
    counterEl.textContent = `${current + 1} / ${srcs.length}`;
    // ボタンの活性状態
    prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    nextBtn.style.opacity = current === srcs.length - 1 ? '0.3' : '1';
  }

  function prev() {
    if (current > 0) { current--; showImage(); }
  }

  function next() {
    if (current < srcs.length - 1) { current++; showImage(); }
  }

  function close() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // アイテムクリック & キーボード
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  prevBtn.addEventListener('click',  prev);
  nextBtn.addEventListener('click',  next);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  // キーボード操作
  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });

  // スワイプ対応（タッチ）
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });
})();

/* ============================================================
   5. キャスト画像プレースホルダー制御（初期ロード時）
============================================================ */
(function initCastPlaceholders() {
  document.querySelectorAll('.cast__card').forEach(card => {
    const img = card.querySelector('.cast__img');
    const placeholder = card.querySelector('.cast__img-placeholder');
    if (img && placeholder) {
      hidePlaceholderIfImgLoaded(img, placeholder);
    }
  });
})();
