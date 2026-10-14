/* ============================================================
   ENEMIES.JS — продилизированные агенты, ИИ, волны,
   урон игроку, убийство врагов
   ============================================================ */

/* ============================================================
   СПАВН ВОЛНЫ ВРАГОВ
   ============================================================ */
function spawnEnemies(n) {
    for (let i = 0; i < n; i++) spawnEnemy();
}

/* ============================================================
   СПАВН ОДНОГО ВРАГА — детализированная модель
   ============================================================ */
function spawnEnemy() {
    if (!state.spawnPoints || !state.spawnPoints.length) return;
    const p = state.camera.position;

    /* Выбираем точку спавна дальше всего от игрока */
    let best = state.spawnPoints[0], bd = 0;
    state.spawnPoints.forEach(pt => {
        const d = Math.hypot(pt[0] - p.x, pt[1] - p.z);
        if (d > bd) { bd = d; best = pt; }
    });
    const bx = best[0] + (Math.random() - .5) * 4;
    const bz = best[1] + (Math.random() - .5) * 4;

    const e = new THREE.Group();
    const isT = Math.random() < .5;

    /* Цвета формы */
    const bodyColor = isT ? 0x8a5a20 : 0x2a4a7a;
    const vestColor = isT ? 0x6a4020 : 0x1a3a5a;
    const skinColor = 0xd4a878;

    /* Материалы */
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: .7 });
    const clothMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: .9 });
    const vestMat = new THREE.MeshStandardMaterial({ color: vestColor, roughness: .8 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .5, metalness: .3 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .85 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x111, roughness: .7 });

    /* ----- Торс ----- */
    const torso = new THREE.Mesh(new THREE.BoxGeometry(.7, .75, .35), clothMat);
    torso.position.y = 1.1;
    e.add(torso);

    /* ----- Бронежилет ----- */
    const vest = new THREE.Mesh(new THREE.BoxGeometry(.72, .5, .38), vestMat);
    vest.position.y = 1.15;
    e.add(vest);

    /* ----- Подсумки на жилете ----- */
    const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .06), beltMat);
    pouch1.position.set(-.18, 1.05, .21);
    e.add(pouch1);

    const pouch2 = pouch1.clone();
    pouch2.position.x = .18;
    e.add(pouch2);

    const pouch3 = new THREE.Mesh(new THREE.BoxGeometry(.08, .10, .05), beltMat);
    pouch3.position.set(0, 1.0, .21);
    e.add(pouch3);

    /* ----- Ремень ----- */
    const belt = new THREE.Mesh(new THREE.BoxGeometry(.74, .08, .36), beltMat);
    belt.position.y = .78;
    e.add(belt);

    /* ----- Голова ----- */
    const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 12), skinMat);
    head.position.y = 1.75;
    e.add(head);

    /* ----- Шлем ----- */
    const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(.24, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        helmetMat
    );
    helmet.position.y = 1.78;
    e.add(helmet);

    /* ----- Тактические очки ----- */
    const glasses = new THREE.Mesh(
        new THREE.BoxGeometry(.28, .08, .04),
        new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: .3, metalness: .6 })
    );
    glasses.position.set(0, 1.78, .21);
    e.add(glasses);

    /* ----- Балаклава ----- */
    const bala = new THREE.Mesh(
        new THREE.BoxGeometry(.22, .10, .18),
        new THREE.MeshStandardMaterial({ color: isT ? 0x3a2a15 : 0x15253a, roughness: .9 })
    );
    bala.position.set(0, 1.66, .06);
    e.add(bala);

    /* ----- Руки ----- */
    const la = new THREE.Mesh(new THREE.BoxGeometry(.16, .65, .16), clothMat);
    la.position.set(-.45, 1.05, 0);
    e.add(la);

    const ra = new THREE.Mesh(new THREE.BoxGeometry(.16, .65, .16), clothMat);
    ra.position.set(.45, 1.05, 0);
    e.add(ra);

    /* ----- Перчатки ----- */
    const lg = new THREE.Mesh(new THREE.BoxGeometry(.17, .16, .17), gloveMat);
    lg.position.set(-.45, .72, 0);
    e.add(lg);

    const rg = new THREE.Mesh(new THREE.BoxGeometry(.17, .16, .17), gloveMat);
    rg.position.set(.45, .72, 0);
    e.add(rg);

    /* ----- Ноги ----- */
    const ll = new THREE.Mesh(new THREE.BoxGeometry(.20, .75, .22), clothMat);
    ll.position.set(-.18, .38, 0);
    e.add(ll);

    const rl = new THREE.Mesh(new THREE.BoxGeometry(.20, .75, .22), clothMat);
    rl.position.set(.18, .38, 0);
    e.add(rl);

    /* ----- Ботинки ----- */
    const lb = new THREE.Mesh(new THREE.BoxGeometry(.22, .18, .30), bootMat);
    lb.position.set(-.18, .09, .04);
    e.add(lb);

    const rb = new THREE.Mesh(new THREE.BoxGeometry(.22, .18, .30), bootMat);
    rb.position.set(.18, .09, .04);
    e.add(rb);

    /* ----- Наколенники ----- */
    const lk = new THREE.Mesh(new THREE.BoxGeometry(.20, .10, .22), beltMat);
    lk.position.set(-.18, .45, .02);
    e.add(lk);

    const rk = lk.clone();
    rk.position.x = .18;
    e.add(rk);

    /* ----- Оружие в руках (если включено в настройках) ----- */
    if (playerData.botsHaveWeapons) {
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x111, roughness: .6, metalness: .7 });

        const gunBody = new THREE.Mesh(new THREE.BoxGeometry(.08, .10, .45), gunMat);
        gunBody.position.set(.35, 1.2, -.20);
        gunBody.rotation.y = Math.PI / 2;
        e.add(gunBody);

        const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .25, 8), gunMat);
        gunBarrel.rotation.z = Math.PI / 2;
        gunBarrel.rotation.y = Math.PI / 2;
        gunBarrel.position.set(.35, 1.2, -.50);
        e.add(gunBarrel);
    }

    /* Позиция */
    e.position.set(bx, 0, bz);
    e.userData = {
        hp: 30,
        maxHp: 30,
        head,
        body: torso,
        lastAttack: 0,
        attackCooldown: 600,
        speed: 2.5 + Math.random() * .6,
        damage: 15,
        hasWeapon: playerData.botsHaveWeapons,
        nextShot: 0
    };

    state.scene.add(e);
    state.enemies.push(e);
}

/* ============================================================
   ИИ ВРАГОВ
   ============================================================ */
function updateEnemies(dt) {
    const pp = state.camera.position;
    state.enemies.forEach(e => {
        const dx = pp.x - e.position.x;
        const dz = pp.z - e.position.z;
        const dist = Math.hypot(dx, dz);

        /* Поворот в сторону игрока */
        e.rotation.y = Math.atan2(dx, dz);

        /* Движение к игроку */
        if (dist > 2.2) {
            const sp = e.userData.speed * dt;
            const nx = e.position.x + (dx / dist) * sp;
            const nz = e.position.z + (dz / dist) * sp;

            /* Проверка коллизий */
            let okX = true, okZ = true;
            for (const c of state.colliders) {
                if (nx + .35 > c.min.x && nx - .35 < c.max.x &&
                    e.position.z + .35 > c.min.z && e.position.z - .35 < c.max.z &&
                    c.min.y < 1.8) okX = false;

                if (e.position.x + .35 > c.min.x && e.position.x - .35 < c.max.x &&
                    nz + .35 > c.min.z && nz - .35 < c.max.z &&
                    c.min.y < 1.8) okZ = false;
            }
            if (okX && Math.abs(nx) < HALF_WORLD - 1) e.position.x = nx;
            if (okZ && Math.abs(nz) < HALF_WORLD - 1) e.position.z = nz;
        }

        /* Ближний бой */
        if (dist < 2.5) {
            const now = performance.now();
            if (now - e.userData.lastAttack > e.userData.attackCooldown) {
                e.userData.lastAttack = now;
                damagePlayer(e.userData.damage);
            }
        }

        /* Стрельба бота (если есть оружие) */
        if (playerData.botsHaveWeapons && dist > 2.5 && dist < 25) {
            const now = performance.now();
            if (now > e.userData.nextShot) {
                e.userData.nextShot = now + 1200 + Math.random() * 800;
                if (Math.random() < .5) damagePlayer(8);
            }
        }
    });
}

/* ============================================================
   УРОН ИГРОКУ
   ============================================================ */
function damagePlayer(amt) {
    if (state.isGameOver || state.isPaused) return;
    state.health -= amt;
    if (state.health < 0) state.health = 0;
    document.getElementById('health-fill').style.width = state.health + '%';
    document.getElementById('hit-flash').style.opacity = '1';
    state.hitFlashTimer = .1;
    if (playerData.vibeEnabled && navigator.vibrate) navigator.vibrate(50);
    if (state.health <= 0) endMatch(false);
}

/* ============================================================
   УБИЙСТВО ВРАГА + БЕСКОНЕЧНЫЕ ВОЛНЫ ПО 10
   ============================================================ */
function killEnemy(e, isHead) {
    const i = state.enemies.indexOf(e);
    if (i > -1) state.enemies.splice(i, 1);
    state.scene.remove(e);

    state.score++;
    playerData.totalKills++;
    state.currentWaveEnemies--;

    const reward = isHead ? 400 : 300;
    state.sessionMoney += reward;

    document.getElementById('score').textContent = state.score;
    addKillfeed(isHead ? 'HEADSHOT!' : 'KILL', reward);

    /* Если волна закончилась — спавним новую (10 врагов) */
    if (state.currentWaveEnemies <= 0 && state.matchState === 'playing' && !state.isGameOver) {
        state.wave++;
        setTimeout(() => {
            if (state.matchState === 'playing' && !state.isGameOver) {
                spawnEnemies(10);
                state.currentWaveEnemies = 10;
            }
        }, 1500);
    }
}

/* ============================================================
   КИЛЛФИД
   ============================================================ */
function addKillfeed(t, r) {
    const kf = document.getElementById('killfeed');
    const m = document.createElement('div');
    m.className = 'kill-msg';
    m.innerHTML = '<span style="color:#fa0">' + t + '</span> +' + r + '$';
    kf.appendChild(m);
    setTimeout(() => m.remove(), 3000);
      }
