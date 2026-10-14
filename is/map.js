/* ============================================================
   MAP.JS — коллайдеры, карты Sandstone и Templ, сцена,
   пленты, камера
   ============================================================ */

/* ============================================================
   ХЕЛПЕРЫ ДЛЯ ПОСТРОЕНИЯ ГЕОМЕТРИИ
   ============================================================ */
function addCollider(x, y, z, w, h, d) {
    state.colliders.push({
        min: new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
        max: new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2)
    });
}
function addBox(x, y, z, w, h, d, mat, collide) {
    if (collide === undefined) collide = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    m.castShadow = true;
    state.scene.add(m);
    if (collide) addCollider(x, y, z, w, h, d);
    return m;
}

/* ============================================================
   SANDSTONE — точная планировка Standoff 2
   ============================================================ */
function buildSandstone() {
    const sc = state.scene;
    const map = MAPS.sandstone;

    /* ----- Пол ----- */
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
        new THREE.MeshStandardMaterial({ color: map.groundColor, roughness: .95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    sc.add(ground);

    /* ----- Материалы ----- */
    const wall = new THREE.MeshStandardMaterial({ color: map.wallColor, roughness: .9 });
    const wallDark = new THREE.MeshStandardMaterial({ color: 0x6b5030, roughness: .9 });
    const wallLight = new THREE.MeshStandardMaterial({ color: 0xa07850, roughness: .85 });
    const crateA = new THREE.MeshStandardMaterial({ color: 0xa07850, roughness: .85 });
    const crateB = new THREE.MeshStandardMaterial({ color: 0x7a5838, roughness: .85 });
    const H = 8, T = 2;

    /* ===== ВНЕШНИЕ СТЕНЫ ===== */
    addBox(0, H / 2, -HALF_WORLD, WORLD_SIZE, H, T, wall);
    addBox(0, H / 2, HALF_WORLD, WORLD_SIZE, H, T, wall);
    addBox(-HALF_WORLD, H / 2, 0, T, H, WORLD_SIZE, wall);
    addBox(HALF_WORLD, H / 2, 0, T, H, WORLD_SIZE, wall);

    /* ===== ЦЕНТР (MID) ===== */
    addBox(-12, H / 2, -8, 4, H, 14, wallDark);
    addBox(12, H / 2, -8, 4, H, 14, wallDark);
    addBox(-7, H / 2, 6, 3, H, 3, wallLight);
    addBox(7, H / 2, 6, 3, H, 3, wallLight);
    addBox(0, 1, 0, 6, 2, 6, wallLight);

    /* ===== T-СПАВН (юг) ===== */
    addBox(0, H / 2, -HALF_WORLD + 5, 30, H, 2, wallDark);
    addBox(-18, H / 2, -HALF_WORLD + 5, 4, H, 2, wallLight);
    addBox(18, H / 2, -HALF_WORLD + 5, 4, H, 2, wallLight);

    /* ===== CT-СПАВН (север) ===== */
    addBox(0, H / 2, HALF_WORLD - 5, 30, H, 2, wallDark);

    /* ===== ТОЧКА A (юго-запад) ===== */
    addBox(-28, 1, 28, 14, 2, 14, wallLight);
    addBox(-40, H / 2, 20, 3, H, 30, wallDark);
    addBox(-28, H / 2, 10, 25, H, 3, wallDark);
    addBox(-30, 1.5, 30, 4, 3, 4, crateA);
    addBox(-22, 1.5, 30, 4, 3, 4, crateB);
    addBox(-26, 1.5, 24, 4, 3, 4, crateA);
    addBox(-28, 5, 36, 12, 1, 4, wallLight);

    /* ===== ТОЧКА B (юго-восток) ===== */
    addBox(28, 1, 28, 14, 2, 14, wallLight);
    addBox(40, H / 2, 20, 3, H, 30, wallDark);
    addBox(28, H / 2, 10, 25, H, 3, wallDark);
    addBox(24, 1.5, 30, 4, 3, 4, crateA);
    addBox(32, 1.5, 30, 4, 3, 4, crateB);
    addBox(28, 1.5, 24, 5, 3, 4, crateA);
    addBox(18, 2, 32, 4, 4, 4, wallLight);

    /* ===== LONG A (западный коридор) ===== */
    addBox(-38, H / 2, -5, 4, H, 25, wallDark);
    addBox(-48, H / 2, -5, 4, H, 25, wallDark);
    addBox(-40, H / 2, 12, 12, H, 2, wallLight);

    /* ===== SHORT A (короткий проход к A) ===== */
    addBox(-15, H / 2, 18, 3, H, 20, wallDark);
    addBox(-15, H / 2, 8, 10, H, 2, wallLight);

    /* ===== BANANA (проход к B) ===== */
    addBox(15, H / 2, 18, 3, H, 20, wallDark);
    addBox(22, H / 2, 8, 15, H, 3, wallDark);
    addBox(15, H / 2, 8, 10, H, 2, wallLight);

    /* ===== CONNECTOR (соединяет mid и B) ===== */
    addBox(20, H / 2, -5, 3, H, 15, wallDark);
    addBox(20, H / 2, -18, 12, H, 3, wallLight);

    /* ===== АПАРТАМЕНТЫ (у точки A) ===== */
    addBox(-38, H / 2, 38, 12, H, 12, wallDark);
    addBox(-32, H / 2, 32, 3, H, 2, wallLight);
    addBox(-28, H / 2, 38, 2, H, 3, wallLight);

    /* ===== ДОПОЛНИТЕЛЬНЫЕ УКРЫТИЯ ===== */
    addBox(-20, H / 2, -25, 4, H, 4, wallLight);
    addBox(20, H / 2, -25, 4, H, 4, wallLight);
    addBox(0, H / 2, -30, 25, H, 3, wallDark);

    /* ===== ПЕСЧАНЫЕ БАРХАНЫ ===== */
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd4b080, roughness: 1 });
    [[-50, -50], [50, -50], [-50, 50], [50, 50], [-50, 0], [50, 0]].forEach(([x, z]) => {
        const m = new THREE.Mesh(new THREE.ConeGeometry(4, 3, 6), sandMat);
        m.position.set(x, 1.5, z);
        sc.add(m);
        addCollider(x, 1.5, z, 4, 3, 4);
    });

    /* ===== ПАЛЬМЫ ===== */
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b5030, roughness: 1 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: .9 });
    [[-55, 20], [55, 20], [-55, -20], [55, -20], [-55, 45], [55, 45]].forEach(([x, z]) => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(.4, .6, 7, 8), trunkMat);
        t.position.set(x, 3.5, z);
        sc.add(t);
        addCollider(x, 3.5, z, 1, 7, 1);
        const l = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 6), leavesMat);
        l.position.set(x, 7, z);
        sc.add(l);
    });

    /* ===== ТОЧКИ СПАВНА ===== */
    state.spawnPoints = [
        [-40, -40], [40, -40], [-40, 40], [40, 40],
        [-35, 0], [35, 0], [0, -35], [0, 35],
        [-30, -15], [30, -15], [-30, 15], [30, 15]
    ];
}

/* ============================================================
   TEMPL
   ============================================================ */
function buildTempl() {
    const sc = state.scene;
    const map = MAPS.templ;

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
        new THREE.MeshStandardMaterial({ color: map.groundColor, roughness: .9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    sc.add(ground);

    const wm = new THREE.MeshStandardMaterial({ color: map.wallColor, roughness: .7, metalness: .1 });
    const wh = 12, wt = 2;
    addBox(0, wh / 2, -HALF_WORLD, WORLD_SIZE, wh, wt, wm);
    addBox(0, wh / 2, HALF_WORLD, WORLD_SIZE, wh, wt, wm);
    addBox(-HALF_WORLD, wh / 2, 0, wt, wh, WORLD_SIZE, wm);
    addBox(HALF_WORLD, wh / 2, 0, wt, wh, WORLD_SIZE, wm);

    const t = new THREE.MeshStandardMaterial({ color: 0x6a7a90, roughness: .6 });
    addBox(0, 3, 0, 14, 6, 14, t);
    addBox(0, 1, 0, 18, 2, 18, t);

    const r = new THREE.Mesh(
        new THREE.ConeGeometry(12, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0x5a6a80, metalness: .3, roughness: .5 })
    );
    r.position.set(0, 8.5, 0);
    r.rotation.y = Math.PI / 4;
    sc.add(r);

    const cm = new THREE.MeshStandardMaterial({ color: 0x8a9ab0, roughness: .5 });
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * 12;
        const z = Math.sin(a) * 12;
        const c = new THREE.Mesh(new THREE.CylinderGeometry(.7, .8, 8, 12), cm);
        c.position.set(x, 4, z);
        sc.add(c);
        addCollider(x, 4, z, 1.6, 8, 1.6);
    }

    const cm2 = new THREE.MeshStandardMaterial({ color: 0x4a5a70, roughness: .75 });
    [[-25, -25, 3, 5, 20], [25, -25, 3, 5, 20], [-25, 25, 3, 5, 20], [25, 25, 3, 5, 20]]
        .forEach(([x, z, w, h, d]) => addBox(x, h / 2, z, w, h, d, cm2));

    state.spawnPoints = [
        [-40, -40], [40, -40], [-40, 40], [40, 40],
        [-35, 0], [35, 0], [0, -35], [0, 35]
    ];
}

MAPS.sandstone.generate = buildSandstone;
MAPS.templ.generate = buildTempl;

/* ============================================================
   СОЗДАНИЕ СЦЕНЫ
   ============================================================ */
function createScene() {
    const map = MAPS[state.mapKey];
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(map.skyColor);
    state.scene.fog = new THREE.Fog(map.fogColor, 5, map.fogFar);

    state.camera = new THREE.PerspectiveCamera(80, innerWidth / innerHeight, .1, 500);
    const sp = map.spawn || [0, 30];
    state.camera.position.set(sp[0], PLAYER_HEIGHT, sp[1]);

    state.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    state.renderer.setSize(innerWidth, innerHeight);
    const pr = devicePixelRatio > 1.5 ? 1.5 : devicePixelRatio;
    state.renderer.setPixelRatio(pr);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFShadowMap;

    state.renderer.domElement.style.display = 'block';
    state.renderer.domElement.style.position = 'fixed';
    state.renderer.domElement.style.top = '0';
    state.renderer.domElement.style.left = '0';
    state.renderer.domElement.style.zIndex = '1';
    document.body.appendChild(state.renderer.domElement);

    state.scene.add(state.camera);

    state.raycaster = new THREE.Raycaster();
    state.clock = new THREE.Clock();

    state.yaw = 0;
    state.pitch = 0;
    state.muzzleFlashTimer = 0;
    state.hitMarkerTimer = 0;
    state.hitFlashTimer = 0;
    state.recoilPitch = 0;
    state.recoilYaw = 0;
    state.velocity = new THREE.Vector3();
    state.jumpHold = false;
    state.jumpCooldown = 0;

    state.scene.add(new THREE.AmbientLight(map.ambient, map.ambientIntensity));
    const sun = new THREE.DirectionalLight(map.sunColor, 1.2);
    sun.position.set(30, 40, 20);
    state.scene.add(sun);
    state.scene.add(new THREE.HemisphereLight(map.skyColor, map.groundColor, .6));

    state.colliders = [];
    state.spawnPoints = [];
    state.bulletHoles = [];
    state.bloodParticles = [];
    state.plantZoneMeshes = [];

    map.generate();

    createPlantZone(map.plantA, 0xfa0, 'A');
    createPlantZone(map.plantB, 0x4af, 'B');

    applySlot();

    state.minimapCtx = document.getElementById('minimap-canvas').getContext('2d');
    updateCameraFromYawPitch();
}

/* ============================================================
   ЗОНЫ ПЛЕНТА
   ============================================================ */
function createPlantZone(pos, color, letter) {
    const grp = new THREE.Group();

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 2.1, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .7 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .02;
    grp.add(ring);

    const inner = new THREE.Mesh(
        new THREE.CircleGeometry(1.8, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .15, side: THREE.DoubleSide })
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = .01;
    grp.add(inner);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 96px Arial';
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 64, 70);
    const tex = new THREE.CanvasTexture(canvas);

    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.y = .03;
    grp.add(label);

    grp.position.set(pos[0], 0, pos[1]);
    state.scene.add(grp);
    state.plantZoneMeshes.push(grp);
}

/* ============================================================
   КАМЕРА — углы
   ============================================================ */
function updateCameraFromYawPitch() {
    const e = new THREE.Euler(
        state.pitch + state.recoilPitch,
        state.yaw + state.recoilYaw,
        0,
        'YXZ'
    );
    state.camera.quaternion.setFromEuler(e);
                               }
