/* ============================================================
   WEAPONS.JS — модели оружия, стрельба, пули, дырки,
   частицы, перезарядка, анимация доставания
   ============================================================ */

/* ============================================================
   СОЗДАНИЕ МОДЕЛИ ОРУЖИЯ
   ============================================================ */
function createWeaponModel(id) {
    if (state.weaponModel) state.camera.remove(state.weaponModel);
    const wData = WEAPONS[id || playerData.equippedWeapon];
    if (!wData) return;

    const g = new THREE.Group();

    /* Материалы */
    const dark   = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .5, metalness: .8 });
    const grip   = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: .9 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .4, metalness: .85 });
    const wood   = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: .8 });
    const steel  = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: .95, roughness: .15 });
    const gold   = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: .9, roughness: .2 });

    const model = wData.model;

    /* ===== НОЖ ===== */
    if (model === 'knife') {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(.035, .015, .30), steel);
        blade.position.set(0, .01, -.20);
        g.add(blade);

        const tip = new THREE.Mesh(new THREE.ConeGeometry(.02, .06, 4), steel);
        tip.rotation.x = -Math.PI / 2;
        tip.position.set(0, .01, -.37);
        g.add(tip);

        const serr = new THREE.Mesh(new THREE.BoxGeometry(.005, .012, .06), accent);
        serr.position.set(-.018, .015, -.05);
        g.add(serr);

        const guard = new THREE.Mesh(new THREE.BoxGeometry(.06, .02, .02), accent);
        guard.position.set(0, .01, -.06);
        g.add(guard);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .14), grip);
        handle.position.set(0, .01, .02);
        g.add(handle);

        const pommel = new THREE.Mesh(new THREE.BoxGeometry(.045, .045, .02), accent);
        pommel.position.set(0, .01, .10);
        g.add(pommel);
    }

    /* ===== GLOCK ===== */
    else if (model === 'glock') {
        const slide = new THREE.Mesh(new THREE.BoxGeometry(.07, .05, .36), dark);
        slide.position.set(0, .04, -.14);
        g.add(slide);

        const serr = new THREE.Mesh(new THREE.BoxGeometry(.075, .012, .02), accent);
        serr.position.set(0, .04, .00);
        g.add(serr);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .10, 8), steel);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .04, -.32);
        g.add(barrel);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(.06, .04, .30), grip);
        frame.position.set(0, -.01, -.10);
        g.add(frame);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.06, .16, .09), grip);
        gr.position.set(0, -.11, .04);
        gr.rotation.x = .22;
        g.add(gr);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(.045, .14, .06), accent);
        mag.position.set(0, -.10, .04);
        mag.rotation.x = .22;
        g.add(mag);

        const trigger = new THREE.Mesh(new THREE.BoxGeometry(.02, .03, .02), accent);
        trigger.position.set(0, -.05, -.02);
        g.add(trigger);

        const sight = new THREE.Mesh(new THREE.BoxGeometry(.008, .012, .008), accent);
        sight.position.set(0, .07, -.30);
        g.add(sight);
    }

    /* ===== DUAL BERETTAS ===== */
    else if (model === 'dualies') {
        const grp1 = new THREE.Group();
        grp1.position.set(-.10, 0, 0);

        const s1 = new THREE.Mesh(new THREE.BoxGeometry(.06, .05, .34), dark);
        s1.position.set(0, .04, -.14);
        grp1.add(s1);

        const b1 = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .10, 8), steel);
        b1.rotation.x = Math.PI / 2;
        b1.position.set(0, .04, -.32);
        grp1.add(b1);

        const f1 = new THREE.Mesh(new THREE.BoxGeometry(.055, .04, .28), grip);
        f1.position.set(0, -.01, -.10);
        grp1.add(f1);

        const gr1 = new THREE.Mesh(new THREE.BoxGeometry(.055, .15, .09), grip);
        gr1.position.set(0, -.10, .04);
        gr1.rotation.x = .22;
        grp1.add(gr1);

        const tr1 = new THREE.Mesh(new THREE.BoxGeometry(.018, .028, .018), accent);
        tr1.position.set(0, -.05, -.02);
        grp1.add(tr1);

        g.add(grp1);
        const grp2 = grp1.clone();
        grp2.position.set(.10, 0, 0);
        g.add(grp2);
    }

    /* ===== DESERT EAGLE ===== */
    else if (model === 'deagle') {
        const slide = new THREE.Mesh(new THREE.BoxGeometry(.08, .06, .40), accent);
        slide.position.set(0, .05, -.18);
        g.add(slide);

        const rib = new THREE.Mesh(new THREE.BoxGeometry(.03, .012, .34), dark);
        rib.position.set(0, .09, -.20);
        g.add(rib);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .14, 10), steel);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .05, -.40);
        g.add(barrel);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(.07, .045, .32), dark);
        frame.position.set(0, -.01, -.14);
        g.add(frame);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.07, .18, .10), grip);
        gr.position.set(0, -.13, .05);
        gr.rotation.x = .25;
        g.add(gr);

        const sight = new THREE.Mesh(new THREE.BoxGeometry(.01, .014, .01), gold);
        sight.position.set(0, .08, -.34);
        g.add(sight);

        const trigger = new THREE.Mesh(new THREE.BoxGeometry(.02, .03, .02), accent);
        trigger.position.set(0, -.05, -.04);
        g.add(trigger);
    }

    /* ===== AKR-12 ===== */
    else if (model === 'rifle') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(.085, .10, .55), dark);
        body.position.set(0, 0, -.20);
        g.add(body);

        const topRail = new THREE.Mesh(new THREE.BoxGeometry(.035, .025, .45), accent);
        topRail.position.set(0, .065, -.22);
        g.add(topRail);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.017, .017, .42, 10), accent);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .01, -.72);
        g.add(barrel);

        const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(.025, .022, .06, 10), steel);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, .01, -.95);
        g.add(muzzle);

        const hg = new THREE.Mesh(new THREE.BoxGeometry(.10, .09, .24), wood);
        hg.position.set(0, -.03, -.52);
        g.add(hg);

        const gas = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .18, 8), accent);
        gas.rotation.x = Math.PI / 2;
        gas.position.set(0, .04, -.55);
        g.add(gas);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(.05, .24, .11), grip);
        mag.position.set(0, -.16, -.08);
        mag.rotation.x = -.35;
        g.add(mag);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.07, .16, .10), grip);
        gr.position.set(0, -.12, .12);
        gr.rotation.x = .3;
        g.add(gr);

        const stock = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .22), wood);
        stock.position.set(0, -.01, .28);
        g.add(stock);

        const sightRear = new THREE.Mesh(new THREE.BoxGeometry(.012, .03, .012), accent);
        sightRear.position.set(0, .09, -.05);
        g.add(sightRear);

        const sightFront = new THREE.Mesh(new THREE.BoxGeometry(.01, .04, .01), accent);
        sightFront.position.set(0, .09, -.90);
        g.add(sightFront);
    }

    /* ===== FN FAL ===== */
    else if (model === 'fnfal') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(.09, .11, .60), dark);
        body.position.set(0, 0, -.22);
        g.add(body);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .50, 10), accent);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .01, -.78);
        g.add(barrel);

        const flash = new THREE.Mesh(new THREE.CylinderGeometry(.028, .022, .05, 10), steel);
        flash.rotation.x = Math.PI / 2;
        flash.position.set(0, .01, -1.02);
        g.add(flash);

        const hg = new THREE.Mesh(new THREE.BoxGeometry(.10, .10, .26), dark);
        hg.position.set(0, -.03, -.56);
        g.add(hg);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(.055, .26, .11), grip);
        mag.position.set(0, -.18, -.10);
        mag.rotation.x = -.35;
        g.add(mag);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.07, .17, .10), grip);
        gr.position.set(0, -.13, .14);
        gr.rotation.x = .3;
        g.add(gr);

        const stock = new THREE.Mesh(new THREE.BoxGeometry(.07, .10, .28), dark);
        stock.position.set(0, -.01, .32);
        g.add(stock);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(.03, .02, .36), accent);
        rail.position.set(0, .07, -.28);
        g.add(rail);

        const scope = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .20, 10), accent);
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, .11, -.20);
        g.add(scope);
    }

    /* ===== AWM ===== */
    else if (model === 'sniper') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(.09, .12, .70), dark);
        body.position.set(0, 0, -.28);
        g.add(body);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .55, 12), accent);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .01, -.95);
        g.add(barrel);

        const brake = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .08, 12), steel);
        brake.rotation.x = Math.PI / 2;
        brake.position.set(0, .01, -1.25);
        g.add(brake);

        const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .34, 14), accent);
        scopeBody.rotation.x = Math.PI / 2;
        scopeBody.position.set(0, .14, -.18);
        g.add(scopeBody);

        const scopeLens = new THREE.Mesh(
            new THREE.CylinderGeometry(.055, .055, .01, 14),
            new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: .8, roughness: .1 })
        );
        scopeLens.rotation.x = Math.PI / 2;
        scopeLens.position.set(0, .14, -.35);
        g.add(scopeLens);

        const scopeMount = new THREE.Mesh(new THREE.BoxGeometry(.03, .06, .30), dark);
        scopeMount.position.set(0, .10, -.18);
        g.add(scopeMount);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.07, .18, .10), grip);
        gr.position.set(0, -.15, .18);
        gr.rotation.x = .3;
        g.add(gr);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(.05, .16, .10), grip);
        mag.position.set(0, -.11, -.10);
        g.add(mag);

        const stock = new THREE.Mesh(new THREE.BoxGeometry(.08, .11, .30), dark);
        stock.position.set(0, -.01, .36);
        g.add(stock);

        const bipod = new THREE.Mesh(new THREE.BoxGeometry(.12, .02, .02), steel);
        bipod.position.set(0, -.06, -.85);
        g.add(bipod);

        const cheek = new THREE.Mesh(new THREE.BoxGeometry(.06, .04, .18), grip);
        cheek.position.set(0, .08, .30);
        g.add(cheek);
    }

    /* ===== FABM SHOTGUN ===== */
    else if (model === 'shotgun') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(.09, .11, .50), dark);
        body.position.set(0, 0, -.22);
        g.add(body);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .55, 12), accent);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .02, -.78);
        g.add(barrel);

        const tube = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .45, 10), accent);
        tube.rotation.x = Math.PI / 2;
        tube.position.set(0, -.03, -.72);
        g.add(tube);

        const pump = new THREE.Mesh(new THREE.BoxGeometry(.08, .07, .22), wood);
        pump.position.set(0, -.04, -.60);
        g.add(pump);

        const gr = new THREE.Mesh(new THREE.BoxGeometry(.07, .16, .10), grip);
        gr.position.set(0, -.12, .10);
        gr.rotation.x = .3;
        g.add(gr);

        const stock = new THREE.Mesh(new THREE.BoxGeometry(.07, .10, .26), wood);
        stock.position.set(0, -.01, .30);
        g.add(stock);

        const shell = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .02, 6), gold);
        shell.rotation.z = Math.PI / 2;
        shell.position.set(.04, .07, -.30);
        g.add(shell);
    }

    /* Общая вспышка выстрела */
    state.muzzleFlash = new THREE.PointLight(0xffaa00, 0, 3);
    state.muzzleFlash.position.set(0, .02, -.9);
    g.add(state.muzzleFlash);

    g.position.set(.28, -.25, -.55);
    g.rotation.y = .06;
    state.camera.add(g);
    state.weaponModel = g;

    /* Анимация доставания — стартовое положение ниже экрана */
    state.weaponDrawProgress = 0;
    g.position.y = -1.2;
    g.rotation.x = -0.6;
}

/* ============================================================
   МОДЕЛЬ БОМБЫ В РУКАХ
   ============================================================ */
function createBombViewModel() {
    if (state.weaponModel) state.camera.remove(state.weaponModel);
    const g = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(.18, .12, .22),
        new THREE.MeshStandardMaterial({ color: 0x222, roughness: .7 })
    );
    g.add(body);

    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(.10, .06, .01),
        new THREE.MeshStandardMaterial({ color: 0x4f4, emissive: 0x2a2, emissiveIntensity: 1 })
    );
    screen.position.set(0, .03, .115);
    g.add(screen);

    const led = new THREE.Mesh(
        new THREE.SphereGeometry(.012, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xf22 })
    );
    led.position.set(.06, .04, .115);
    g.add(led);

    g.position.set(.28, -.30, -.55);
    state.camera.add(g);
    state.weaponModel = g;
    state.weaponDrawProgress = 0;
}

/* ============================================================
   АНИМАЦИЯ ДОСТАВАНИЯ ОРУЖИЯ
   ============================================================ */
function updateWeaponDraw(dt) {
    if (!state.weaponModel) return;
    if (state.weaponDrawProgress < 1) {
        state.weaponDrawProgress = Math.min(1, state.weaponDrawProgress + dt * 3);
        const p = state.weaponDrawProgress;
        const ease = 1 - Math.pow(1 - p, 3);
        state.weaponModel.position.y = -1.2 + ease * (0.95);
        state.weaponModel.position.x = .28 + Math.sin(p * Math.PI) * 0.1;
        state.weaponModel.rotation.x = -0.6 + ease * 0.6;
    } else {
        state.weaponModel.position.y = -0.25;
        state.weaponModel.position.x = .28;
        state.weaponModel.rotation.x = 0;
    }
}

/* ============================================================
   СТРЕЛЬБА
   ============================================================ */
function shoot() {
    if (state.isReloading || state.isGameOver || state.isPaused) return;
    if (state.currentSlot === 'bomb') return;

    const wid = getActiveWeaponId();
    const w = WEAPONS[wid];
    if (!w) return;

    /* ----- Ближний бой (нож) ----- */
    if (w.isMelee) {
        const now = performance.now();
        if (now - state.lastShootTime < 500) return;
        state.lastShootTime = now;

        const pp = state.camera.position;
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
        let hitE = null, isHead = false;

        for (const e of state.enemies) {
            const dx = e.position.x - pp.x;
            const dz = e.position.z - pp.z;
            const d = Math.hypot(dx, dz);
            if (d < 2.5) {
                const dot = (dx * fwd.x + dz * fwd.z) / d;
                if (dot > .6) { hitE = e; isHead = Math.random() < .5; break; }
            }
        }
        if (hitE) {
            const dmg = w.damage * (isHead ? w.headshotMult : 1);
            hitE.userData.hp -= dmg;
            document.getElementById('hit-marker').style.opacity = '1';
            document.getElementById('crosshair').classList.add('hit');
            state.hitMarkerTimer = .1;
            spawnParticles(hitE.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xff2222, 8);
            if (hitE.userData.hp <= 0) killEnemy(hitE, isHead);
        }
        return;
    }

    /* ----- Огнестрел ----- */
    const now = performance.now();
    const cd = 60000 / w.rpm;
    if (now - state.lastShootTime < cd) return;
    state.lastShootTime = now;

    if (state.magAmmo <= 0) {
        if (state.reserveAmmo > 0) reload();
        return;
    }
    state.magAmmo--;
    updateAmmoUI();

    /* Вспышка */
    state.muzzleFlash.intensity = 3;
    state.muzzleFlashTimer = .05;

    /* Отдача */
    const rec = w.damage > 100 ? .05 : (w.damage > 30 ? .02 : .015);
    state.recoilPitch += rec;
    state.recoilPitch = Math.min(state.recoilPitch, .15);
    state.recoilYaw += (Math.random() - .5) * .01;
    state.recoilYaw = Math.max(-.05, Math.min(.05, state.recoilYaw));
    updateCameraFromYawPitch();

    /* Точность: AWM в прицеле — 0 разброса */
    const spreadUse = state.isAiming ? (wid === 'awp' ? 0 : w.spread * .3) : w.spread;
    const pellets = w.pellets || 1;

    for (let pi = 0; pi < pellets; pi++) {
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
        dir.x += (Math.random() - .5) * spreadUse;
        dir.y += (Math.random() - .5) * spreadUse;
        dir.normalize();

        state.raycaster.set(state.camera.getWorldPosition(new THREE.Vector3()), dir);
        state.raycaster.far = w.range;

        const targets = [];
        state.enemies.forEach(e => { targets.push(e.userData.body, e.userData.head); });
        state.scene.children.forEach(ch => {
            if (ch.isMesh && ch !== state.weaponModel && ch.parent === state.scene && !ch.userData.isEnemy) {
                targets.push(ch);
            }
        });

        const hits = state.raycaster.intersectObjects(targets, false);
        if (hits.length > 0) {
            const hit = hits[0];
            let enemy = null, isHead = false;
            state.enemies.forEach(e => {
                if (hit.object === e.userData.body) enemy = e;
                if (hit.object === e.userData.head) { enemy = e; isHead = true; }
            });
            if (enemy) {
                const dmg = w.damage * (isHead ? w.headshotMult : 1);
                enemy.userData.hp -= dmg;
                document.getElementById('hit-marker').style.opacity = '1';
                document.getElementById('crosshair').classList.add('hit');
                state.hitMarkerTimer = .08;
                spawnParticles(hit.point, 0xff2222, 6);
                if (enemy.userData.hp <= 0) killEnemy(enemy, isHead);
            } else {
                createBulletHole(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
            }
        }
    }
    if (state.magAmmo === 0 && state.reserveAmmo > 0) reload();
}

/* ============================================================
   ДЫРКИ ОТ ПУЛЬ
   ============================================================ */
function createBulletHole(point, normal) {
    const geo = new THREE.CircleGeometry(.05, 8);
    const mat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: .85,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const h = new THREE.Mesh(geo, mat);
    const n = normal.clone().normalize();
    h.position.copy(point).addScaledVector(n, .01);
    h.lookAt(point.clone().add(n));
    state.scene.add(h);
    state.bulletHoles.push(h);

    if (state.bulletHoles.length > 60) {
        const o = state.bulletHoles.shift();
        state.scene.remove(o);
    }
    setTimeout(() => {
        if (h.parent) {
            state.scene.remove(h);
            const i = state.bulletHoles.indexOf(h);
            if (i > -1) state.bulletHoles.splice(i, 1);
        }
    }, 30000);
}

/* ============================================================
   ЧАСТИЦЫ (кровь при попадании)
   ============================================================ */
function spawnParticles(pos, color, count) {
    const geo = new THREE.SphereGeometry(.06, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color });
    for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        p.userData.vel = new THREE.Vector3(
            (Math.random() - .5) * 4,
            Math.random() * 3,
            (Math.random() - .5) * 4
        );
        p.userData.life = .6;
        state.scene.add(p);
        state.bloodParticles.push(p);
    }
}
function updateParticles(dt) {
    for (let i = state.bloodParticles.length - 1; i >= 0; i--) {
        const p = state.bloodParticles[i];
        p.userData.vel.y -= 12 * dt;
        p.position.addScaledVector(p.userData.vel, dt);
        p.userData.life -= dt;
        p.scale.setScalar(Math.max(.1, p.userData.life * 1.5));
        if (p.userData.life <= 0) {
            state.scene.remove(p);
            state.bloodParticles.splice(i, 1);
        }
    }
}

/* ============================================================
   ПЕРЕЗАРЯДКА
   ============================================================ */
function reload() {
    if (state.isReloading) return;
    const wid = getActiveWeaponId();
    const w = WEAPONS[wid];
    if (!w || w.isMelee) return;
    if (state.reserveAmmo <= 0 || state.magAmmo === w.magSize) return;

    state.isReloading = true;
    document.getElementById('reload-msg').style.display = 'block';

    setTimeout(() => {
        const need = w.magSize - state.magAmmo;
        const take = Math.min(need, state.reserveAmmo);
        state.magAmmo += take;
        state.reserveAmmo -= take;
        state.isReloading = false;
        document.getElementById('reload-msg').style.display = 'none';
        updateAmmoUI();
    }, w.reloadTime);
}

/* ============================================================
   ОБНОВЛЕНИЕ HUD ПАТРОНОВ
   ============================================================ */
function updateAmmoUI() {
    const wid = getActiveWeaponId();
    const w = WEAPONS[wid];
    if (!w) return;
    document.getElementById('weapon-name').textContent = w.name;
    if (w.isMelee) {
        document.getElementById('ammo').innerHTML = '∞';
    } else {
        document.getElementById('ammo').innerHTML =
            state.magAmmo + '<span class="res">/' + state.reserveAmmo + '</span>';
    }
}
