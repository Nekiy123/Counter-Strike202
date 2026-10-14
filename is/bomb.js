/* ============================================================
   BOMB.JS — кнопки PLANT/DEFUSE, установка бомбы,
   разминирование, таймер, взрыв
   ============================================================ */

/* ============================================================
   ПОКАЗ/СКРЫТИЕ КНОПОК PLANT / DEFUSE
   ============================================================ */
function updatePlantButton() {
    const btn = document.getElementById('btn-plant');
    const dbtn = document.getElementById('btn-defuse');
    if (!btn || !dbtn) return;

    const m = MAPS[state.mapKey];
    const p = state.camera.position;

    /* Расстояние до плентов A и B */
    const dA = Math.hypot(p.x - m.plantA[0], p.z - m.plantA[1]);
    const dB = Math.hypot(p.x - m.plantB[0], p.z - m.plantB[1]);
    const nearZone = dA < 2.5 ? 'A' : (dB < 2.5 ? 'B' : null);
    state.currentPlantZone = nearZone;

    /* PLANT: только T, только на пленту, пока бомба не поставлена */
    if (playerData.team === 'T' && nearZone && !state.bombPlanted) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }

    /* DEFUSE: только CT, только у бомбы */
    if (playerData.team === 'CT' && state.bombPlanted && state.bombPos) {
        const db = Math.hypot(p.x - state.bombPos.x, p.z - state.bombPos.z);
        if (db < 2.5) dbtn.classList.add('show');
        else dbtn.classList.remove('show');
    } else {
        dbtn.classList.remove('show');
    }
}

/* ============================================================
   ПРОЦЕСС УСТАНОВКИ БОМБЫ (удержание кнопки PLANT)
   ============================================================ */
function startPlant() {
    if (playerData.team !== 'T' || state.bombPlanted || !state.currentPlantZone) return;
    state.planting = true;
    state.plantTimer = 0;
    document.getElementById('plant-progress').classList.add('show');
    document.getElementById('pp-title').textContent = 'УСТАНОВКА БОМБЫ...';
    document.getElementById('pp-fill').style.width = '0%';
}
function stopPlant() {
    if (!state.planting) return;
    state.planting = false;
    state.plantTimer = 0;
    document.getElementById('plant-progress').classList.remove('show');
}

/* ============================================================
   ПРОЦЕСС РАЗМИНИРОВАНИЯ (удержание кнопки DEFUSE)
   ============================================================ */
function startDefuse() {
    if (playerData.team !== 'CT' || !state.bombPlanted || !state.bombPos) return;
    const p = state.camera.position;
    const db = Math.hypot(p.x - state.bombPos.x, p.z - state.bombPos.z);
    if (db > 2.5) return;

    state.defusing = true;
    state.defuseTimer = 0;
    document.getElementById('plant-progress').classList.add('show');
    document.getElementById('pp-title').textContent = 'РАЗМИНИРОВАНИЕ...';
    document.getElementById('pp-fill').style.width = '0%';
}
function stopDefuse() {
    if (!state.defusing) return;
    state.defusing = false;
    state.defuseTimer = 0;
    document.getElementById('plant-progress').classList.remove('show');
}

/* ============================================================
   УСТАНОВКА БОМБЫ (когда прогресс дошёл до 100%)
   ============================================================ */
function plantBomb() {
    const m = MAPS[state.mapKey];
    const zone = state.currentPlantZone;
    if (!zone) return;

    const pos = zone === 'A' ? m.plantA : m.plantB;
    state.bombPlanted = true;
    state.bombTimer = 40; /* 40 секунд до взрыва */
    state.bombPos = new THREE.Vector3(pos[0], .2, pos[1]);

    /* ----- Визуальная модель бомбы на пленту ----- */
    const bg = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(.4, .25, .5),
        new THREE.MeshStandardMaterial({ color: 0x222, roughness: .7 })
    );
    bg.add(body);

    const led = new THREE.Mesh(
        new THREE.SphereGeometry(.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf22 })
    );
    led.position.set(0, .15, .26);
    bg.add(led);

    bg.position.copy(state.bombPos);
    state.scene.add(bg);
    state.bombMesh = bg;

    /* СРАЗУ УБИРАЕМ ПРОГРЕСС И КНОПКУ PLANT */
    state.planting = false;
    state.plantTimer = 0;
    document.getElementById('plant-progress').classList.remove('show');
    document.getElementById('btn-plant').classList.remove('show');

    myAlert('Бомба установлена! У CT 40 секунд.', 'БОМБА');
}

/* ============================================================
   РАЗМИНИРОВАНИЕ (когда прогресс дошёл до 100%)
   ============================================================ */
function defuseBomb() {
    if (!state.bombPlanted) return;

    state.bombPlanted = false;
    state.defusing = false;

    if (state.bombMesh) {
        state.scene.remove(state.bombMesh);
        state.bombMesh = null;
    }

    document.getElementById('plant-progress').classList.remove('show');
    document.getElementById('btn-defuse').classList.remove('show');

    myAlert('Бомба разминирована! Победа CT!', 'ПОБЕДА');
    endMatch(true);
}

/* ============================================================
   ОБНОВЛЕНИЕ ТАЙМЕРА БОМБЫ (вызывается каждый кадр)
   ============================================================ */
function updateBomb(dt) {
    /* Прогресс установки */
    if (state.planting) {
        state.plantTimer += dt;
        const f = Math.min(100, state.plantTimer / 3 * 100);
        const el = document.getElementById('pp-fill');
        if (el) el.style.width = f + '%';
        if (state.plantTimer >= 3) plantBomb();
    }

    /* Прогресс разминирования */
    if (state.defusing) {
        state.defuseTimer += dt;
        const f = Math.min(100, state.defuseTimer / 5 * 100);
        const el = document.getElementById('pp-fill');
        if (el) el.style.width = f + '%';
        if (state.defuseTimer >= 5) defuseBomb();
    }

    /* Таймер бомбы */
    if (state.bombPlanted) {
        state.bombTimer -= dt;

        /* Мигание светодиода */
        if (state.bombMesh && state.bombMesh.children[1]) {
            const t = performance.now() / 200;
            state.bombMesh.children[1].material.color.setHex(
                Math.sin(t) > 0 ? 0xf22 : 0x600
            );
        }

        /* Взрыв */
        if (state.bombTimer <= 0) {
            state.bombPlanted = false;
            if (state.bombMesh) {
                state.scene.remove(state.bombMesh);
                state.bombMesh = null;
            }
            myAlert('Бомба взорвалась! Победа T!', 'ВЗРЫВ');
            endMatch(true);
        }
    }
}
