/* ============================================================
   STILL WATERS — stand-in figures for the niche
   ------------------------------------------------------------
   Loaded ONLY when assets/models/jesus_mary.glb is missing, so the
   niche works before your own model exists. It builds two low-poly
   "carved clay" statuettes out of simple shapes, using exactly the
   node names and animation clip names your Blender export should use
   (see assets/models/README.md). Because the names match, scene.js
   drives these stand-ins and your real model with the same code.

   Once your .glb is in place, this file is never downloaded.
   You can delete it then, or keep it as a fallback.
============================================================ */
import * as THREE from 'three';

const PALETTE = {
  skin:   0xe7cdb3,
  cream:  0xf1e8d9,
  marian: 0x7a8fc4, // Our Lady's blue, softened to clay
  rose:   0xb58391, // Christ's mantle: the site's votive rose
  hair:   0x6f533e,
};

/* ---------- small builders ---------- */

function makeMaterials() {
  const clay = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, flatShading: true, ...extra });
  return {
    skin:   clay(PALETTE.skin),
    cream:  clay(PALETTE.cream),
    marian: clay(PALETTE.marian, { side: THREE.DoubleSide }),
    rose:   clay(PALETTE.rose, { side: THREE.DoubleSide }),
    hair:   clay(PALETTE.hair, { side: THREE.DoubleSide }),
  };
}

function node(name, parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

/* A turned profile, like a statue carved on a lathe. [radius, height] pairs,
   bottom to top. `gap` leaves the front open (radians), which is how the
   mantles, the veil and the hair frame the body and the face. */
function lathe(profile, material, { gap = 0, segments = 16 } = {}) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, segments, gap / 2, Math.PI * 2 - gap);
  return new THREE.Mesh(geo, material);
}

function head(parent, m, r) {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m.skin);
  mesh.scale.set(0.92, 1.1, 0.98);
  mesh.position.set(0, r * 1.05, 0.012);
  parent.add(mesh);
  return mesh;
}

function neckMesh(parent, m) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.038, 0.09, 8), m.skin);
  mesh.position.y = 0.03;
  parent.add(mesh);
}

/* Upper arm -> forearm -> hand, hanging along -Y in their rest frame. */
function arm(prefix, side, parent, shoulder, m, { upper, fore, sleeve, cuff }) {
  const up = node(`${prefix}_UpperArm_${side}`, parent, ...shoulder);
  const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, upper - 0.042, 3, 8), sleeve);
  upperMesh.position.y = -upper / 2;
  up.add(upperMesh);

  const fa = node(`${prefix}_Forearm_${side}`, up, 0, -upper, 0);
  const foreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.037, cuff, fore, 9), sleeve);
  foreMesh.position.y = -fore / 2;
  fa.add(foreMesh);

  const hand = node(`${prefix}_Hand_${side}`, fa, 0, -fore, 0);
  const handMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.033, 0), m.skin);
  handMesh.scale.set(0.82, 1.25, 0.62);
  handMesh.position.y = -0.028;
  hand.add(handMesh);

  const shoulderInFigure = new THREE.Vector3(...shoulder).add(parent.position);
  return { upper: up, fore: fa, hand, a: upper, b: fore, shoulder: shoulderInFigure };
}

/* ---------- posing: a tiny two-bone IK solver ----------
   Given where a hand should be (in the figure's own space), work out the
   upper-arm and forearm rotations. Poses are then written as keyframes. */
const DOWN = new THREE.Vector3(0, -1, 0);

function solveArm(limb, target, pole) {
  const { shoulder, a, b } = limb;
  const toTarget = target.clone().sub(shoulder);
  const dist = THREE.MathUtils.clamp(toTarget.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  const u = toTarget.normalize();
  const cosA = (a * a + dist * dist - b * b) / (2 * a * dist);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const v = pole.clone().normalize();
  v.sub(u.clone().multiplyScalar(v.dot(u))).normalize();

  const elbow = shoulder.clone().addScaledVector(u, a * cosA).addScaledVector(v, a * sinA);
  const hand = shoulder.clone().addScaledVector(u, dist);

  const upperDir = elbow.clone().sub(shoulder).normalize();
  const foreDir = hand.clone().sub(elbow).normalize();
  const qUpper = new THREE.Quaternion().setFromUnitVectors(DOWN, upperDir);
  const qFore = qUpper.clone().invert().multiply(new THREE.Quaternion().setFromUnitVectors(DOWN, foreDir));
  return { upper: qUpper, fore: qFore };
}

function applyPose(limb, pose) {
  limb.upper.quaternion.copy(pose.upper);
  limb.fore.quaternion.copy(pose.fore);
}

const euler = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

/* Dense, eased keyframes between key poses, so movements start and
   settle softly instead of moving at a constant, mechanical speed. */
function easedTrack(nodeName, keyTimes, keyQuats, fps = 30) {
  const total = keyTimes[keyTimes.length - 1];
  const times = [];
  const values = [];
  const q = new THREE.Quaternion();
  const frames = Math.round(total * fps);
  for (let f = 0; f <= frames; f++) {
    const t = Math.min(f / fps, total);
    let i = 0;
    while (i < keyTimes.length - 2 && t > keyTimes[i + 1]) i++;
    const span = keyTimes[i + 1] - keyTimes[i];
    const u = span > 0 ? THREE.MathUtils.clamp((t - keyTimes[i]) / span, 0, 1) : 0;
    const e = u * u * (3 - 2 * u); // ease in and out
    q.slerpQuaternions(keyQuats[i], keyQuats[i + 1], e);
    times.push(t);
    values.push(q.x, q.y, q.z, q.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, values);
}

/* Breathing: the chest swells a little more than one percent, then settles. */
function breathTrack(spineName, period) {
  const times = [];
  const values = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * period;
    const s = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period);
    times.push(t);
    values.push(1 + 0.007 * s, 1 + 0.013 * s, 1 + 0.007 * s);
  }
  return new THREE.VectorKeyframeTrack(`${spineName}.scale`, times, values);
}

/* ---------- Our Lady ---------- */
function buildMary(m) {
  const root = node('Mary');
  const hips = node('Mary_Hips', root);
  hips.add(lathe([[0.001, 0], [0.185, 0], [0.195, 0.03], [0.18, 0.3], [0.158, 0.62], [0.146, 0.82]], m.cream));
  hips.add(lathe([[0.2, 0.02], [0.212, 0.07], [0.198, 0.38], [0.176, 0.66], [0.162, 0.8]], m.marian, { gap: 1.25 }));

  const spine = node('Mary_Spine', hips, 0, 0.78, 0);
  spine.add(lathe([[0.15, -0.04], [0.142, 0.1], [0.148, 0.28], [0.143, 0.42], [0.118, 0.49], [0.068, 0.53], [0.001, 0.545]], m.cream));
  spine.add(lathe([[0.166, -0.05], [0.16, 0.12], [0.166, 0.3], [0.16, 0.43], [0.132, 0.5], [0.086, 0.545], [0.05, 0.56]], m.marian, { gap: 1.45 }));

  const neck = node('Mary_Neck', spine, 0, 0.525, 0);
  neckMesh(neck, m);
  const headNode = node('Mary_Head', neck, 0, 0.055, 0);
  head(headNode, m, 0.08);
  // the veil: open at the front so it frames the face, falling onto the shoulders
  headNode.add(lathe(
    [[0.001, 0.19], [0.05, 0.186], [0.086, 0.162], [0.1, 0.118], [0.103, 0.07], [0.1, 0.02], [0.106, -0.03], [0.126, -0.07], [0.15, -0.1]],
    m.marian, { gap: 1.95 },
  ));

  const armOpts = { upper: 0.25, fore: 0.23, sleeve: m.cream, cuff: 0.05 };
  const R = arm('Mary', 'R', spine, [-0.128, 0.45, -0.005], m, armOpts);
  const L = arm('Mary', 'L', spine, [0.128, 0.45, -0.005], m, armOpts);

  // Rest: hands joined in prayer.  Gesture: Our Lady of Grace, hands lowered and opened.
  const pose = {
    prayR: solveArm(R, new THREE.Vector3(-0.014, 1.07, 0.19), new THREE.Vector3(-0.45, -1, -0.15)),
    prayL: solveArm(L, new THREE.Vector3(0.014, 1.07, 0.19), new THREE.Vector3(0.45, -1, -0.15)),
    graceR: solveArm(R, new THREE.Vector3(-0.27, 0.84, 0.14), new THREE.Vector3(-0.4, 0.1, -1)),
    graceL: solveArm(L, new THREE.Vector3(0.27, 0.84, 0.14), new THREE.Vector3(0.4, 0.1, -1)),
    graceR2: solveArm(R, new THREE.Vector3(-0.285, 0.82, 0.16), new THREE.Vector3(-0.4, 0.1, -1)),
    graceL2: solveArm(L, new THREE.Vector3(0.285, 0.82, 0.16), new THREE.Vector3(0.4, 0.1, -1)),
  };
  applyPose(R, pose.prayR);
  applyPose(L, pose.prayL);

  const T = [0, 1.5, 3.1, 4.6];
  const rest = new THREE.Quaternion();
  const incline = euler(0.17, 0, 0.06);
  const bless = new THREE.AnimationClip('Mary_Bless', -1, [
    easedTrack('Mary_UpperArm_R', T, [pose.prayR.upper, pose.graceR.upper, pose.graceR2.upper, pose.prayR.upper]),
    easedTrack('Mary_Forearm_R', T, [pose.prayR.fore, pose.graceR.fore, pose.graceR2.fore, pose.prayR.fore]),
    easedTrack('Mary_UpperArm_L', T, [pose.prayL.upper, pose.graceL.upper, pose.graceL2.upper, pose.prayL.upper]),
    easedTrack('Mary_Forearm_L', T, [pose.prayL.fore, pose.graceL.fore, pose.graceL2.fore, pose.prayL.fore]),
    easedTrack('Mary_Neck', [0, 1.6, 3.0, 4.6], [rest, incline, incline, rest]),
  ]);
  const idle = new THREE.AnimationClip('Mary_Idle', -1, [breathTrack('Mary_Spine', 6.2)]);

  return { root, clips: [idle, bless] };
}

/* ---------- Christ ---------- */
function buildJesus(m) {
  const root = node('Jesus');
  const hips = node('Jesus_Hips', root);
  hips.add(lathe([[0.001, 0], [0.19, 0], [0.2, 0.03], [0.186, 0.34], [0.168, 0.68], [0.158, 0.87]], m.cream));
  hips.add(lathe([[0.205, 0.12], [0.214, 0.17], [0.2, 0.44], [0.18, 0.72], [0.17, 0.88]], m.rose, { gap: 1.55 }));
  for (const x of [-0.055, 0.055]) {
    const foot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), m.skin);
    foot.scale.set(0.7, 0.45, 1.3);
    foot.position.set(x, 0.016, 0.175);
    hips.add(foot);
  }

  const spine = node('Jesus_Spine', hips, 0, 0.85, 0);
  spine.add(lathe([[0.16, -0.03], [0.153, 0.13], [0.165, 0.33], [0.168, 0.46], [0.138, 0.535], [0.074, 0.58], [0.001, 0.592]], m.cream));
  spine.add(lathe([[0.18, -0.06], [0.172, 0.14], [0.18, 0.34], [0.178, 0.47], [0.146, 0.55], [0.092, 0.595], [0.056, 0.607]], m.rose, { gap: 1.6 }));

  const neck = node('Jesus_Neck', spine, 0, 0.572, 0);
  neckMesh(neck, m);
  const headNode = node('Jesus_Head', neck, 0, 0.06, 0);
  head(headNode, m, 0.086);
  // centre-parted hair to the shoulders, open at the front
  headNode.add(lathe(
    [[0.001, 0.2], [0.052, 0.196], [0.09, 0.172], [0.102, 0.124], [0.101, 0.07], [0.098, 0.015], [0.102, -0.04], [0.112, -0.085], [0.128, -0.115]],
    m.hair, { gap: 2.2 },
  ));
  const beard = new THREE.Mesh(new THREE.IcosahedronGeometry(0.052, 1), m.hair);
  beard.scale.set(0.98, 0.9, 0.78);
  beard.position.set(0, 0.03, 0.052);
  headNode.add(beard);

  const armOpts = { upper: 0.27, fore: 0.25, sleeve: m.cream, cuff: 0.052 };
  const R = arm('Jesus', 'R', spine, [-0.15, 0.49, 0], m, armOpts);
  const L = arm('Jesus', 'L', spine, [0.15, 0.49, 0], m, armOpts);

  // Rest: right hand open at his side, left hand over his heart.  Gesture: the raised right hand of blessing.
  const pose = {
    restR: solveArm(R, new THREE.Vector3(-0.215, 0.9, 0.09), new THREE.Vector3(-0.2, 0, -1)),
    restL: solveArm(L, new THREE.Vector3(0.06, 1.2, 0.19), new THREE.Vector3(0.5, -1, 0.1)),
    blessR: solveArm(R, new THREE.Vector3(-0.2, 1.33, 0.22), new THREE.Vector3(-0.45, -1, 0.1)),
    blessR2: solveArm(R, new THREE.Vector3(-0.21, 1.36, 0.25), new THREE.Vector3(-0.45, -1, 0.1)),
  };
  applyPose(R, pose.restR);
  applyPose(L, pose.restL);

  const T = [0, 1.3, 2.8, 4.2];
  const rest = new THREE.Quaternion();
  const nod = euler(0.12, 0, 0);
  const bless = new THREE.AnimationClip('Jesus_Bless', -1, [
    easedTrack('Jesus_UpperArm_R', T, [pose.restR.upper, pose.blessR.upper, pose.blessR2.upper, pose.restR.upper]),
    easedTrack('Jesus_Forearm_R', T, [pose.restR.fore, pose.blessR.fore, pose.blessR2.fore, pose.restR.fore]),
    easedTrack('Jesus_Neck', [0, 1.4, 2.7, 4.2], [rest, nod, nod, rest]),
  ]);
  const idle = new THREE.AnimationClip('Jesus_Idle', -1, [breathTrack('Jesus_Spine', 5.6)]);

  return { root, clips: [idle, bless] };
}

/* ---------- public ---------- */
export function buildPlaceholderFigures() {
  const m = makeMaterials();
  const mary = buildMary(m);
  const jesus = buildJesus(m);

  // Mary stands at her Son's right hand (the viewer's left), both turned slightly toward each other.
  mary.root.position.set(-0.29, 0, 0.03);
  mary.root.rotation.y = 0.2;
  jesus.root.position.set(0.27, 0, 0);
  jesus.root.rotation.y = -0.1;

  const root = new THREE.Group();
  root.name = 'StandInFigures';
  root.add(mary.root, jesus.root);
  return { root, clips: [...mary.clips, ...jesus.clips] };
}
