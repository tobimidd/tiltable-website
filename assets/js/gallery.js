/**
 * Tiltable — design gallery (design.html only).
 *
 * GALLERY_ITEMS is the single place to add, remove or reorder images —
 * each entry becomes one masonry card and one lightbox slide. Static HTML
 * can't read a directory at runtime, so this list was built by hand while
 * scanning assets/reference/; add new files here and they'll appear.
 *
 * These reference photos predate any Tiltable hardware — they're material and
 * mood inspiration (finishes, light, sculptural form), not device photos.
 * Captions/tags describe them honestly on that basis.
 */
const GALLERY_ITEMS = [
  {
    src: 'assets/reference/1702897320628-ca0024c1953346c395c297f795c145aa-goods.jpeg',
    alt: 'Dark teal dispenser bottle with a faceted, diamond-cut surface texture',
    caption: 'Faceted surface study — a geometric texture we liked for catching light along an edge.',
    tag: 'texture',
  },
  {
    src: 'assets/reference/2280997.jpeg',
    alt: 'Two translucent plastic bottles, amber and green, with ribbed moulded detailing',
    caption: 'Material and finish reference — translucency and moulded rib details on everyday plastic goods.',
    tag: 'material',
  },
  {
    src: 'assets/reference/720X720-whatsapp-image-2020-03-14-at-16-47-30.jpg',
    alt: 'Two white sculptural 3D-printed vases with continuous curved cutouts, one holding a trailing plant',
    caption: 'Sculptural silhouette study — soft, continuous curves without hard seams.',
    tag: 'form language',
  },
  {
    src: "assets/reference/DSC08349-Verbessert-RR.webp",
    alt: 'A hand holding a matte black shaker bottle with a tan logo',
    caption: 'Matte-black finish and in-hand scale reference for a tabletop object.',
    tag: 'material',
  },
  {
    src: 'assets/reference/help-needed-im-a-complete-noob-and-i-3d-print-recreate-a-v0-2j7glnila2ue1.webp',
    alt: 'A wavy 3D-printed lamp glowing warm orange on a windowsill at dusk',
    caption: 'Warm ambient glow through a ribbed shell — early inspiration for how light could read off the device.',
    tag: 'ambient glow',
  },
  {
    src: 'assets/reference/images (1).jpeg',
    alt: 'A rectangular 3D-printed lamp with fine vertical ribs, glowing red-orange',
    caption: 'Another glow study — light escaping through fine vertical ribs.',
    tag: 'ambient glow',
  },
  {
    src: 'assets/reference/images (2).jpeg',
    alt: 'A cylindrical fluted lamp glowing orange on a dark rotating base',
    caption: 'Fluted cylindrical form on a dark base — a possible language for a charging tray, not the device itself.',
    tag: 'form language',
  },
  {
    src: 'assets/reference/images.jpeg',
    alt: 'A wavy 3D-printed lamp on a dark stand, captioned "3d printing"',
    caption: 'Rapid-prototyping reference — the kind of iteration speed we want for early device shells.',
    tag: 'process',
  },
];

(function () {
  const grid = document.getElementById('gallery-grid');
  const filterRow = document.getElementById('tag-filters');
  if (!grid) return;

  const tags = ['all', ...new Set(GALLERY_ITEMS.map((i) => i.tag))];

  // ---- filter pills ----
  if (filterRow) {
    tags.forEach((tag) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-filter';
      btn.textContent = tag === 'all' ? 'All' : tag;
      btn.setAttribute('aria-pressed', String(tag === 'all'));
      btn.dataset.tag = tag;
      btn.addEventListener('click', () => setFilter(tag));
      filterRow.appendChild(btn);
    });
  }

  function setFilter(tag) {
    if (filterRow) {
      filterRow.querySelectorAll('.tag-filter').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.tag === tag));
      });
    }
    grid.querySelectorAll('.masonry-item').forEach((card) => {
      card.style.display = tag === 'all' || card.dataset.tag === tag ? '' : 'none';
    });
  }

  // ---- masonry cards ----
  GALLERY_ITEMS.forEach((item, index) => {
    const fig = document.createElement('figure');
    fig.className = 'masonry-item';
    fig.dataset.tag = item.tag;

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(index));

    const caption = document.createElement('figcaption');
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = item.tag;
    const p = document.createElement('p');
    p.className = 'mt-2 text-sm text-subtle';
    p.textContent = item.caption;
    caption.append(chip, p);

    fig.append(img, caption);
    grid.appendChild(fig);
  });

  // ---- lightbox ----
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('[data-lb-caption]');
  const lbTag = lightbox.querySelector('[data-lb-tag]');
  const closeBtn = lightbox.querySelector('.lb-close');
  const nextBtn = lightbox.querySelector('.lb-next');
  const prevBtn = lightbox.querySelector('.lb-prev');

  let currentIndex = 0;
  let lastFocused = null;

  function render() {
    const item = GALLERY_ITEMS[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.caption;
    lbTag.textContent = item.tag;
  }

  function openLightbox(index) {
    currentIndex = index;
    render();
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function next() { currentIndex = (currentIndex + 1) % GALLERY_ITEMS.length; render(); }
  function prev() { currentIndex = (currentIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length; render(); }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowRight') { next(); return; }
    if (e.key === 'ArrowLeft') { prev(); return; }
    if (e.key === 'Tab') {
      const focusable = [prevBtn, nextBtn, closeBtn];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // swipe navigation
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }, { passive: true });
})();
