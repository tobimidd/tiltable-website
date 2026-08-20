/**
 * Tiltable — hero device render (index.html only).
 * The puck is built procedurally in Three.js (rounded-rect extrusion for
 * the body, a thin extruded frame for the LED ring) — no model or texture
 * files are loaded, so this still works when the page is opened straight
 * from disk. Auto-rotates slowly, pauses on hover, and can be dragged.
 * Falls back to a static CSS puck (see .fallback-puck in style.css) if
 * WebGL or the Three.js CDN script is unavailable.
 */
(function () {
  const stage = document.querySelector('.hero-stage');
  const canvas = document.getElementById('hero-canvas');
  if (!stage || !canvas) return;

  function useFallback() {
    stage.classList.add('no-webgl');
  }

  if (typeof THREE === 'undefined') {
    useFallback();
    return;
  }

  try {
    buildHero();
  } catch (err) {
    console.warn('Tiltable hero: falling back to CSS puck —', err);
    useFallback();
  }

  function buildHero() {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const styles = getComputedStyle(document.documentElement);
    const green = styles.getPropertyValue('--tiltable-green').trim() || '#19C36B';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 1.35, 5.6);
    camera.lookAt(0, -0.05, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // ---- lighting: soft studio setup, no environment map needed ----
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd2d6, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(3.2, 4.5, 3.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-3.5, 1.5, -2.5);
    scene.add(fill);
    const rimLight = new THREE.DirectionalLight(0xbfe9d2, 0.5);
    rimLight.position.set(0, 2, -4);
    scene.add(rimLight);

    // ---- rounded-rectangle path helpers ----
    function roundedRectShape(w, h, r) {
      const shape = new THREE.Shape();
      const x = -w / 2, y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
      shape.lineTo(x + w, y + h - r);
      shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
      shape.lineTo(x + r, y + h);
      shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
      shape.lineTo(x, y + r);
      shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
      return shape;
    }
    function roundedRectPoints(w, h, r) {
      return roundedRectShape(w, h, r).getPoints(32);
    }

    const BODY_W = 2.2, BODY_D = 2.2, BODY_R = 0.56, BODY_THICK = 0.44;

    // ---- puck body ----
    const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(BODY_W, BODY_D, BODY_R), {
      depth: BODY_THICK,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 6,
      curveSegments: 24,
    });
    bodyGeo.center();
    bodyGeo.rotateX(-Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xf3f4f5, roughness: 0.82, metalness: 0.04 }));

    // ---- underside grip pad ----
    const padGeo = new THREE.ExtrudeGeometry(roundedRectShape(BODY_W - 0.14, BODY_D - 0.14, Math.max(BODY_R - 0.05, 0.1)), {
      depth: 0.03, bevelEnabled: false, curveSegments: 24,
    });
    padGeo.center();
    padGeo.rotateX(-Math.PI / 2);
    const pad = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.95 }));
    pad.position.y = -BODY_THICK / 2 - 0.014;

    // ---- LED ring around the rim (thin extruded frame, not a flat decal) ----
    const ringW = BODY_W + 0.03, ringD = BODY_D + 0.03, ringR = BODY_R + 0.015, ringStroke = 0.1;
    const ringFrame = new THREE.Shape(roundedRectPoints(ringW, ringD, ringR));
    ringFrame.holes.push(new THREE.Path(roundedRectPoints(
      ringW - ringStroke * 2, ringD - ringStroke * 2, Math.max(ringR - ringStroke, 0.05)
    )));
    const ringGeo = new THREE.ExtrudeGeometry(ringFrame, { depth: 0.09, bevelEnabled: false, curveSegments: 32 });
    ringGeo.center();
    ringGeo.rotateX(-Math.PI / 2);
    const ledColor = new THREE.Color(green);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      color: ledColor, emissive: ledColor, emissiveIntensity: 1.6, roughness: 0.35, metalness: 0,
    }));
    ring.position.y = -0.02;

    // ---- minimal etched logo mark on the top face ----
    const markGeo = new THREE.RingGeometry(0.1, 0.14, 40);
    markGeo.rotateX(-Math.PI / 2);
    const mark = new THREE.Mesh(markGeo, new THREE.MeshStandardMaterial({ color: 0xc7c9cc, roughness: 0.6, side: THREE.DoubleSide }));
    mark.position.y = BODY_THICK / 2 + 0.055;

    const rig = new THREE.Group();
    rig.add(body, pad, ring, mark);
    rig.rotation.y = Math.PI * 0.18;
    scene.add(rig);

    // ---- sizing ----
    function resize() {
      const size = stage.clientWidth || 1;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // ---- interaction: auto-spin, pause on hover, drag to rotate ----
    const reduceMotion = !!(window.Tiltable && window.Tiltable.prefersReducedMotion);
    let autoSpin = !reduceMotion;
    let dragging = false;
    let lastX = 0;
    let momentum = 0;

    stage.addEventListener('mouseenter', () => { autoSpin = false; });
    stage.addEventListener('mouseleave', () => { if (!dragging) autoSpin = !reduceMotion; });

    canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      autoSpin = false;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rig.rotation.y += dx * 0.012;
      momentum = dx * 0.0015;
    });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointercancel', () => { dragging = false; });

    stage.classList.add('is-ready');

    // ---- render loop ----
    const clock = new THREE.Clock();
    function tick() {
      const delta = clock.getDelta();
      if (autoSpin) {
        rig.rotation.y += delta * 0.28;
      } else if (!dragging && Math.abs(momentum) > 0.0002) {
        rig.rotation.y += momentum;
        momentum *= 0.94;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      tick();
    }
  }
})();

/**
 * Three-step "flip" sequence (index.html only): each .flip-step gets
 * .is-active once it scrolls into view, which triggers the CSS 3D flip
 * defined in style.css (.flip-card / .flip-face--back).
 */
(function () {
  const steps = document.querySelectorAll('[data-step]');
  if (!steps.length) return;

  if (!('IntersectionObserver' in window)) {
    steps.forEach((el) => el.classList.add('is-active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  steps.forEach((el) => observer.observe(el));
})();
