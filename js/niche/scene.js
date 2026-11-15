/* ============================================================
   STILL WATERS — the niche: Three.js scene
   ------------------------------------------------------------
   Scene, camera, renderer, lights, the GLTF model (or the stand-in
   figures), the AnimationMixer, cursor tracking by raycasting, the
   halos, the light motes, and the render loop.

   niche.js loads this file on demand and passes in CONFIG.
   Nothing here touches the rest of the site.
============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const LOG = '[Still Waters niche]';
const UP = new THREE.Vector3(0, 1, 0);
const clamp = THREE.MathUtils.clamp;

export async function createNicheScene(stage, config, hooks = {}) {
  /* ==================== RENDERER ==================== */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,                    // transparent: the niche's painted vault (CSS) shows through
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps the clay colours true
  renderer.toneMappingExposure = config.light.exposure;

  const canvas = renderer.domElement;
  canvas.className = 'sw-niche__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  /* ==================== SCENE & CAMERA ==================== */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(config.camera.fov, 1, 0.1, 40);
  camera.position.fromArray(config.camera.position);
  camera.lookAt(new THREE.Vector3().fromArray(config.camera.target));

  /* ==================== LIGHTS ==================== */
  // Warm ambient from above, lapis bounce from below.
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x26325f, config.light.ambient));

  // Key: late light from a high window, upper right (the same direction as the site's background glow).
  const key = new THREE.DirectionalLight(0xffe0ae, config.light.key);
  key.position.set(2.5, 3.8, 3.2);
  scene.add(key);

  // Soft lapis fill from the left so the shadow side never goes dead.
  const fill = new THREE.DirectionalLight(0xa9b8e8, config.light.fill);
  fill.position.set(-3, 1.2, 2.5);
  scene.add(fill);

  // Rim from behind: outlines shoulders, veil and hair in gold.
  const rim = new THREE.DirectionalLight(0xffd79a, config.light.rim);
  rim.position.set(-1.2, 2.8, -3);
  scene.add(rim);

  /* ==================== LEDGE & CONTACT SHADOW ==================== */
  const stone = new THREE.MeshStandardMaterial({ color: 0xcfc8b9, roughness: 1, metalness: 0, flatShading: true });
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.6, 1.1), stone);
  ledge.position.set(0, -0.3, 0.05);
  scene.add(ledge);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.34, config.standHeight, 0.66), stone);
  plinth.position.set(0, config.standHeight / 2, 0.02);
  scene.add(plinth);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.62),
    new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']]),
      color: 0x10162f, transparent: true, opacity: 0.5, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, config.standHeight + 0.002, 0.02);
  scene.add(shadow);

  /* ==================== FIGURES (GLTFLoader, or the stand-ins) ==================== */
  const cast = await loadCast(config);
  scene.add(cast.root);
  fitToHeight(cast.root, config.figureHeight);
  cast.root.position.y += config.standHeight;
  cast.root.updateMatrixWorld(true);

  const figureScale = config.figureHeight; // halo sizes and offsets are fractions of this
  const characters = ['jesus', 'mary']
    .map((who) => resolveCharacter(who, cast.root, config.rig[who]))
    .filter(Boolean);
  const byWho = Object.fromEntries(characters.map((c) => [c.who, c]));

  /* ==================== HALOS (gold nimbus + glow + rim light) ==================== */
  const glowTexture = radialTexture([[0, 'rgba(255,240,200,1)'], [0.28, 'rgba(255,226,160,.55)'], [1, 'rgba(255,214,140,0)']]);
  const nimbusTexture = radialTexture([[0, 'rgba(255,236,190,0)'], [0.62, 'rgba(255,230,170,.10)'], [0.92, 'rgba(240,206,130,.55)'], [1, 'rgba(240,206,130,0)']]);

  for (const c of characters) {
    const r = config.halo.radius * figureScale;
    const group = new THREE.Group();

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(r * 1.02, 48),
      new THREE.MeshBasicMaterial({ map: nimbusTexture, transparent: true, depthWrite: false, toneMapped: false }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, r * 0.045, 6, 64),
      new THREE.MeshBasicMaterial({ color: 0xe8c983, transparent: true, opacity: 0.9, toneMapped: false }),
    );
    group.add(disc, ring);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture, color: 0xffd98a, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, toneMapped: false, opacity: config.halo.glow,
    }));
    glow.scale.setScalar(r * 5.2);

    const light = new THREE.PointLight(0xffd88a, config.light.halo, figureScale * 0.8, 2);

    scene.add(group, glow, light);
    Object.assign(c, { halo: { group, disc, ring, glow, light }, flareAt: -Infinity, hover: 0, phase: Math.random() * 6 });
  }

  /* ==================== ANIMATION (AnimationMixer) ==================== */
  const mixer = new THREE.AnimationMixer(cast.root);
  const idleActions = [];
  const clipNames = cast.clips.map((c) => c.name);
  console.info(`${LOG} Loaded ${cast.source === 'model' ? `"${config.modelUrl}"` : 'the stand-in figures'} with clips: ${clipNames.join(', ') || '(none)'}`);

  for (const clip of cast.clips) {
    const who = /jesus|christ/i.test(clip.name) ? 'jesus' : /mary|lady/i.test(clip.name) ? 'mary' : 'both';
    const action = mixer.clipAction(clip);
    const owners = who === 'both' ? characters : [byWho[who]].filter(Boolean);

    if (config.clips.idle.test(clip.name)) {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.time = Math.random() * clip.duration; // so the two never breathe in unison
      idleActions.push(action);
      owners.forEach((c) => c.idle.push(action));
    } else if (config.clips.gesture.test(clip.name)) {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = false;
      owners.forEach((c) => c.gestures.push({ action, clip }));
    } else {
      console.warn(`${LOG} Clip "${clip.name}" wasn't recognised. Name it with "Idle" to loop it, or "Bless" to play it on click.`);
    }
  }
  // A gesture that animates the same bones as the idle loop must briefly replace it (cross-fade);
  // one that touches different bones can simply play on top, so breathing never stops.
  for (const c of characters) {
    const idleTracks = new Set(c.idle.flatMap((a) => a.getClip().tracks.map((t) => t.name)));
    c.gestures.forEach((g) => { g.overlapsIdle = g.clip.tracks.some((t) => idleTracks.has(t.name)); });
  }

  /* ==================== LIGHT MOTES ==================== */
  const motes = new Motes(config.motes.max);
  scene.add(motes.points);

  /* ==================== POINTER TRACKING (raycasting) ==================== */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const lookPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -config.look.planeZ);
  const pointer = { x: 0, y: 0, known: false, lastMove: -Infinity, overCanvas: false };

  // pointermove is the modern superset of mousemove: the same events for a mouse, plus pen and touch.
  const onPointerMove = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.known = true;
    pointer.lastMove = performance.now();
  };
  const onPointerOut = (e) => { if (!e.relatedTarget) pointer.known = false; }; // left the window
  const onBlur = () => { pointer.known = false; };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerMove, { passive: true });
  document.addEventListener('pointerout', onPointerOut);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerenter', () => { pointer.overCanvas = true; });
  canvas.addEventListener('pointerleave', () => { pointer.overCanvas = false; });

  function setNdcFromClient(x, y, limit = Infinity) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((x - rect.left) / rect.width) * 2 - 1;
    const ny = -(((y - rect.top) / rect.height) * 2 - 1);
    // Outside the canvas, compress distance so a cursor far across the page asks for a gentle turn, not a stare.
    const soften = (v) => (Math.abs(v) <= 1 ? v : Math.sign(v) * (1 + Math.log(Math.abs(v))));
    ndc.set(clamp(soften(nx), -limit, limit), clamp(soften(ny), -limit, limit));
  }

  function figureAt(clientX, clientY) {
    setNdcFromClient(clientX, clientY, 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(cast.root, true)[0];
    if (!hit) return null;
    for (let o = hit.object; o; o = o.parent) {
      if (/^jesus/i.test(o.name)) return 'jesus';
      if (/^mary/i.test(o.name)) return 'mary';
    }
    return null;
  }

  /* ==================== CLICK: a gesture, and light ==================== */
  const pending = [];
  canvas.addEventListener('click', (e) => {
    const who = figureAt(e.clientX, e.clientY) || 'both';
    gesture(who, { clientX: e.clientX, clientY: e.clientY });
  });

  function gesture(who = 'both', at = null) {
    pending.push({ who, at });
    wake(config.motion.wakeFor);
  }

  function startGesture({ who, at }) {
    const now = elapsed;
    const group = who === 'both' ? characters : [byWho[who]].filter(Boolean);
    const ready = group.filter((c) => now >= c.busyUntil);

    if (!ready.length) {
      // Still mid-gesture: answer the click with a small puff of light where it landed.
      if (motionOK && at) motes.puff(pointOnPlane(at.clientX, at.clientY, 0.35));
      return;
    }

    const played = new Set();
    for (const c of ready) {
      c.flareAt = now;
      if (!motionOK) { c.busyUntil = now + 2.5; continue; } // reduced motion: light only, no movement

      let length = 0;
      for (const g of c.gestures) {
        if (played.has(g.action)) { length = Math.max(length, g.clip.duration); continue; }
        played.add(g.action);
        g.action.reset().setEffectiveWeight(1).play();
        if (g.overlapsIdle) { g.action.fadeIn(0.5); c.idle.forEach((a) => a.fadeOut(0.5)); }
        length = Math.max(length, g.clip.duration);
      }
      c.gestureStart = now;
      c.gestureLength = length;
      c.fadedBack = false;
      c.busyUntil = now + Math.max(length, config.motion.minGesture);
      c.emitAt = now + (length ? config.motes.emitDelay : 0.15);
    }
    hooks.onGesture?.(ready.length === characters.length ? 'both' : ready[0].who);
  }

  function pointOnPlane(clientX, clientY, z) {
    setNdcFromClient(clientX, clientY, 1);
    raycaster.setFromCamera(ndc, camera);
    const p = new THREE.Vector3();
    return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z), p) || p.set(0, 1, z);
  }

  /* ==================== HEAD TRACKING ==================== */
  const tmp = {
    head: new THREE.Vector3(), target: new THREE.Vector3(), dir: new THREE.Vector3(),
    fwd: new THREE.Vector3(), right: new THREE.Vector3(), rootQ: new THREE.Quaternion(),
    qYaw: new THREE.Quaternion(), qPitch: new THREE.Quaternion(), qWorld: new THREE.Quaternion(),
    qPart: new THREE.Quaternion(), qParent: new THREE.Quaternion(), qLocal: new THREE.Quaternion(),
  };

  function lookTargetFor(c, out) {
    const idle = !pointer.known || (performance.now() - pointer.lastMove) / 1000 > config.look.idleAfter;
    if (!idle) {
      setNdcFromClient(pointer.x, pointer.y);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(lookPlane, out)) return out;
    }
    // At rest: Christ looks out at you; Our Lady turns to look at her Son.
    if (c.who === 'mary' && byWho.jesus) return byWho.jesus.head.getWorldPosition(out);
    return out.copy(camera.position);
  }

  function aim(c, dt) {
    const L = config.look;
    c.head.getWorldPosition(tmp.head);
    lookTargetFor(c, tmp.target);
    tmp.dir.subVectors(tmp.target, tmp.head).normalize();

    // The figure's own "straight ahead" (+Z of its root, which is Blender's -Y front).
    if (c.root) c.root.getWorldQuaternion(tmp.rootQ); else tmp.rootQ.identity();
    tmp.fwd.set(0, 0, 1).applyQuaternion(tmp.rootQ);

    let yaw = Math.atan2(tmp.dir.x, tmp.dir.z) - Math.atan2(tmp.fwd.x, tmp.fwd.z);
    yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
    let pitch = Math.asin(clamp(tmp.dir.y, -1, 1)) - Math.asin(clamp(tmp.fwd.y, -1, 1));
    yaw = L.maxYaw * Math.tanh(yaw / L.maxYaw);            // soft limit, never a hard stop
    pitch = clamp(pitch, -L.maxPitchDown, L.maxPitchUp);

    const k = 1 - Math.exp(-dt * L.speed);                  // slow, frame-rate-independent easing
    c.yaw += (yaw - c.yaw) * k;
    c.pitch += (pitch - c.pitch) * k;

    // World-space turn: tilt about the figure's side axis, then turn about world up.
    tmp.right.crossVectors(UP, tmp.fwd).normalize();
    tmp.qPitch.setFromAxisAngle(tmp.right, -c.pitch);
    tmp.qYaw.setFromAxisAngle(UP, c.yaw);
    tmp.qWorld.multiplyQuaternions(tmp.qYaw, tmp.qPitch);

    // Share the turn between neck and head, whatever way the bones point.
    if (c.neck) turnInWorld(c.neck, tmp.qWorld, L.neckShare);
    turnInWorld(c.head, tmp.qWorld, c.neck ? 1 - L.neckShare : 1);
  }

  // Rotate a bone by a world-space rotation: local' = parent⁻¹ · Q · parent · local
  function turnInWorld(bone, qWorld, amount) {
    tmp.qPart.identity().slerp(qWorld, amount);
    bone.parent.getWorldQuaternion(tmp.qParent);
    tmp.qLocal.copy(tmp.qParent).invert().multiply(tmp.qPart).multiply(tmp.qParent);
    bone.quaternion.premultiply(tmp.qLocal);
  }

  /* ==================== HALO UPDATE ==================== */
  const haloPos = new THREE.Vector3();
  function updateHalos(t, dt, hovered) {
    for (const c of characters) {
      if (c.haloAnchor) c.haloAnchor.getWorldPosition(haloPos);
      else {
        c.head.getWorldPosition(haloPos);
        haloPos.y += config.halo.up * figureScale;
        haloPos.z -= config.halo.back * figureScale;
      }
      const h = c.halo;
      h.group.position.copy(haloPos);
      h.group.lookAt(camera.position);
      h.glow.position.copy(haloPos);
      h.light.position.copy(haloPos).z -= 0.06 * figureScale;

      // a slow candle-like swell, a warm flare on each gesture, a little more light while you hover
      const since = t - c.flareAt;
      const flare = since < 0 ? 0 : since < 0.6 ? smooth(since / 0.6) : Math.exp(-(since - 0.6) / 1.5);
      c.hover += ((hovered === c.who ? 1 : 0) - c.hover) * (1 - Math.exp(-dt * 4));
      const swell = motionOK ? 0.5 + 0.5 * Math.sin(t * 0.9 + c.phase) : 0.5;

      h.glow.material.opacity = config.halo.glow * (0.85 + 0.2 * swell) + 0.45 * flare + 0.18 * c.hover;
      h.glow.scale.setScalar(config.halo.radius * figureScale * (5.2 + 1.4 * flare));
      h.ring.material.opacity = 0.82 + 0.18 * Math.max(flare, c.hover);
      h.light.intensity = config.light.halo * (0.85 + 0.15 * swell + 1.2 * flare + 0.35 * c.hover);
    }
  }

  /* ==================== LOOP ==================== */
  const timer = new THREE.Timer();
  let elapsed = 0;
  let running = false;
  let active = false;
  let wakeUntil = 0;
  let frameNo = 0;
  let hovered = null;
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let motionOK = !reduceQuery.matches;

  function step(dt) {
    elapsed += dt;

    // 1. Put tracked bones back to rest, so the mixer and the tracking both start clean every frame.
    for (const c of characters) {
      c.head.quaternion.copy(c.restHead);
      if (c.neck) c.neck.quaternion.copy(c.restNeck);
    }

    // 2. Start queued gestures here (inside the frame) so the mixer records the clean rest pose.
    while (pending.length) startGesture(pending.shift());

    // 3. Clips: breathing and gestures.
    if (motionOK) mixer.update(dt);

    // 4. Gesture bookkeeping: fade back to breathing near the end, release light at the right moment.
    for (const c of characters) {
      if (motionOK && c.gestureLength && !c.fadedBack && elapsed >= c.gestureStart + c.gestureLength - 0.7) {
        c.fadedBack = true;
        c.gestures.forEach((g) => g.action.isRunning() && g.action.fadeOut(0.6));
        c.gestures.some((g) => g.overlapsIdle) && c.idle.forEach((a) => { a.enabled = true; a.fadeIn(0.7); });
      }
      if (c.emitAt && elapsed >= c.emitAt) {
        c.emitAt = 0;
        if (motionOK) emitFrom(c);
      }
    }

    // 5. Heads turn slowly toward the cursor.
    if (motionOK) characters.forEach((c) => aim(c, dt));

    // 6. Hover (raycast a few times a second, only while the cursor is over the niche).
    if (pointer.overCanvas && frameNo++ % 6 === 0) hovered = figureAt(pointer.x, pointer.y);
    if (!pointer.overCanvas) hovered = null;

    updateHalos(elapsed, dt, hovered);
    if (motionOK) motes.update(dt, config.motes.idleRate);
  }

  const handPos = new THREE.Vector3();
  function emitFrom(c) {
    const sources = c.hands.length ? c.hands : [c.head];
    const count = Math.round(config.motes.burst / sources.length);
    for (const s of sources) {
      s.getWorldPosition(handPos);
      if (!c.hands.length) handPos.y -= 0.25;
      motes.burst(handPos, c.who === 'mary' ? 'grace' : 'rise', count, s === sources[0] ? -1 : 1);
    }
  }

  function frame(timestamp) {
    timer.update(timestamp);
    // Never step backwards (the first frame's timestamp can precede reset()), and never leap after a stall.
    const dt = clamp(timer.getDelta(), 0, 1 / 20);
    step(dt);
    renderer.render(scene, camera);
    if (!motionOK && performance.now() > wakeUntil) stopLoop();
  }

  function startLoop() {
    if (running) return;
    running = true;
    timer.reset();
    renderer.setAnimationLoop(frame);
  }
  function stopLoop() {
    running = false;
    renderer.setAnimationLoop(null);
  }
  function renderOnce() { renderer.render(scene, camera); }

  function wake(seconds) {
    wakeUntil = Math.max(wakeUntil, performance.now() + seconds * 1000);
    if (active) startLoop();
  }

  function setMotion(ok) {
    motionOK = ok;
    if (ok) {
      idleActions.forEach((a) => a.play());
      if (active) startLoop();
    } else {
      mixer.stopAllAction();
      characters.forEach((c) => {
        c.head.quaternion.copy(c.restHead);
        if (c.neck) c.neck.quaternion.copy(c.restNeck);
        c.yaw = c.pitch = 0;
        c.busyUntil = 0;
      });
      motes.clear();
      renderOnce();
    }
  }
  reduceQuery.addEventListener('change', (e) => setMotion(!e.matches));

  /* ==================== SIZING ==================== */
  const drawSize = new THREE.Vector2();
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(drawSize);
    motes.setScale(drawSize.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)));
    if (!running) renderOnce();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  // Settle the first frame, then start breathing.
  step(0);
  setMotion(motionOK);
  renderOnce();

  /* ==================== PUBLIC ==================== */
  return {
    source: cast.source,
    setActive(on) {
      active = on;
      if (on && (motionOK || performance.now() < wakeUntil)) startLoop();
      else { stopLoop(); if (on) renderOnce(); }
    },
    gesture,
    dispose() {
      stopLoop();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
      renderer.dispose();
      canvas.remove();
    },
  };
}

/* ============================================================
   Helpers
============================================================ */

async function loadCast(config) {
  if (config.modelUrl) {
    try {
      const gltf = await new GLTFLoader().loadAsync(config.modelUrl);
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        if (o.isSkinnedMesh) o.frustumCulled = false; // skinned bounds don't follow the pose
        if (config.clayFinish) {
          [].concat(o.material).forEach((m) => {
            if ('roughness' in m) m.roughness = Math.max(m.roughness, 0.8);
            if ('metalness' in m) m.metalness = 0;
          });
        }
      });
      return { root: gltf.scene, clips: gltf.animations, source: 'model' };
    } catch (err) {
      if (!config.usePlaceholderIfMissing) throw err;
      console.info(`${LOG} No model at "${config.modelUrl}" yet, so the stand-in figures are shown. (${err?.message || err})`);
    }
  }
  const { buildPlaceholderFigures } = await import('./placeholder-figures.js');
  const { root, clips } = buildPlaceholderFigures();
  return { root, clips, source: 'placeholder' };
}

// Scale any export to the same height, feet on the ledge, centred.
function fitToHeight(root, height) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) root.scale.multiplyScalar(height / size.y);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const centre = box.getCenter(new THREE.Vector3());
  root.position.x -= centre.x;
  root.position.z -= centre.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
}

function findNode(root, names) {
  for (const name of [].concat(names || [])) {
    const want = THREE.PropertyBinding.sanitizeNodeName(name).toLowerCase();
    let hit = null;
    root.traverse((o) => { if (!hit && o.name && o.name.toLowerCase() === want) hit = o; });
    if (hit) return hit;
  }
  return null;
}

function resolveCharacter(who, castRoot, rig) {
  const head = findNode(castRoot, rig.head);
  if (!head) {
    console.warn(`${LOG} No head bone named "${[].concat(rig.head).join('" or "')}" was found, so ${who} won't turn to follow the cursor.`);
    return null;
  }
  const neck = findNode(castRoot, rig.neck);
  return {
    who,
    root: findNode(castRoot, rig.root),
    head,
    neck,
    hands: [].concat(rig.hands || []).map((n) => findNode(castRoot, n)).filter(Boolean),
    haloAnchor: findNode(castRoot, rig.halo),
    restHead: head.quaternion.clone(),
    restNeck: neck ? neck.quaternion.clone() : null,
    yaw: 0,
    pitch: 0,
    idle: [],
    gestures: [],
    busyUntil: 0,
    emitAt: 0,
    gestureLength: 0,
  };
}

function radialTexture(stops, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([at, colour]) => grad.addColorStop(at, colour));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function smooth(u) { return u * u * (3 - 2 * u); }

/* ============================================================
   Motes: soft points of light, drawn with a small shader
============================================================ */
class Motes {
  constructor(max) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.alpha = new Float32Array(max);
    this.size = new Float32Array(max);
    this.age = new Float32Array(max);
    this.life = new Float32Array(max).fill(-1);  // -1 = free
    this.peak = new Float32Array(max);
    this.seed = new Float32Array(max);
    this.idleClock = 0;
    this.cursor = 0;

    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.alphaAttr = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    this.sizeAttr = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('aAlpha', this.alphaAttr);
    geo.setAttribute('aSize', this.sizeAttr);

    this.uniforms = { uScale: { value: 400 }, uColor: { value: new THREE.Color(0xffe2a6) } };
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      vertexShader: /* glsl */`
        attribute float aAlpha;
        attribute float aSize;
        uniform float uScale;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uScale / -mv.z;
          vAlpha = aAlpha;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.7) * vAlpha;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uColor, a);
          #include <colorspace_fragment>
        }`,
    });
    this.points = new THREE.Points(geo, material);
    this.points.frustumCulled = false;
  }

  setScale(s) { this.uniforms.uScale.value = s; }

  spawn(x, y, z, vx, vy, vz, life, size, peak) {
    // take a free slot, or recycle the oldest one
    let i = -1;
    for (let n = 0; n < this.max; n++) {
      const k = (this.cursor + n) % this.max;
      if (this.life[k] < 0) { i = k; break; }
    }
    if (i < 0) i = this.cursor;
    this.cursor = (i + 1) % this.max;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.age[i] = 0;
    this.life[i] = life;
    this.size[i] = size;
    this.peak[i] = peak;
    this.seed[i] = Math.random() * 100;
  }

  // Christ's blessing: light rising from the raised hand.
  // Our Lady of Grace: light falling from open hands, then drifting upward.
  burst(o, mode, count, side = 1) {
    for (let n = 0; n < count; n++) {
      const r = () => Math.random() - 0.5;
      if (mode === 'grace') {
        this.spawn(o.x + r() * 0.05, o.y + r() * 0.05, o.z + r() * 0.05,
          side * (0.04 + Math.random() * 0.1) + r() * 0.08, -(0.14 + Math.random() * 0.22), 0.12 + Math.random() * 0.2,
          2.8 + Math.random() * 1.8, 0.022 + Math.random() * 0.03, 0.8);
      } else {
        this.spawn(o.x + r() * 0.06, o.y + r() * 0.06, o.z + r() * 0.06,
          r() * 0.26, 0.22 + Math.random() * 0.38, 0.04 + r() * 0.2,
          2.6 + Math.random() * 1.8, 0.022 + Math.random() * 0.03, 0.85);
      }
    }
  }

  puff(o) {
    for (let n = 0; n < 7; n++) {
      const r = () => Math.random() - 0.5;
      this.spawn(o.x, o.y, o.z, r() * 0.2, 0.05 + Math.random() * 0.15, r() * 0.1, 1.6 + Math.random(), 0.018 + Math.random() * 0.02, 0.6);
    }
  }

  clear() {
    this.life.fill(-1);
    this.alpha.fill(0);
    this.alphaAttr.needsUpdate = true;
  }

  update(dt, idleRate) {
    // a few motes always drift up through the niche, like dust in window light
    this.idleClock += dt * idleRate;
    while (this.idleClock >= 1) {
      this.idleClock -= 1;
      this.spawn((Math.random() - 0.5) * 1.4, 0.15 + Math.random() * 1.25, -0.3 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.02, 0.035 + Math.random() * 0.05, 0,
        5 + Math.random() * 3, 0.014 + Math.random() * 0.016, 0.28 + Math.random() * 0.25);
    }

    const damp = Math.exp(-dt * 0.9);
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] < 0) continue;
      const age = (this.age[i] += dt);
      const life = this.life[i];
      if (age >= life) { this.life[i] = -1; this.alpha[i] = 0; continue; }
      const j = i * 3;
      const s = this.seed[i];
      this.vel[j] = this.vel[j] * damp + Math.sin(age * 1.3 + s) * 0.03 * dt;
      this.vel[j + 1] = this.vel[j + 1] * damp + 0.11 * dt; // gentle buoyancy
      this.vel[j + 2] *= damp;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      const fadeIn = Math.min(1, age / 0.35);
      const fadeOut = Math.min(1, (life - age) / (life * 0.45));
      const twinkle = 0.82 + 0.18 * Math.sin(age * 5 + s);
      this.alpha[i] = this.peak[i] * fadeIn * fadeOut * twinkle;
    }
    this.posAttr.needsUpdate = true;
    this.alphaAttr.needsUpdate = true;
    this.sizeAttr.needsUpdate = true;
  }
}
