/* ============================================================
   PLAYER.JS — движение игрока, бинихоп, коллизии,
   мини-карта, зона плента
   ============================================================ */

/* ============================================================
   ПРОВЕРКА КОЛЛИЗИЙ
   ============================================================ */
function checkCollision(np) {
    /* Границы карты */
    if (np.x < -HALF_WORLD + PLAYER_RADIUS || np.x > HALF_WORLD - PLAYER_RADIUS) return true;
    if (np.z < -HALF_WORLD + PLAYER_RADIUS || np.z > HALF_WORLD - PLAYER_RADIUS) return true;

    /* Столкновение с объектами */
    for (const c of state.colliders) {
        if (np.x + PLAYER_RADIUS > c.min.x && np.x - PLAYER_RADIUS < c.max.x &&
            np.z + PLAYER_RADIUS > c.min.z && np.z - PLAYER_RADIUS < c.max.z) {
            const py = state.camera.position.y;
            if (py + 1.7 > c.min.y && py - .1 < c.max.y) return true;
        }
    }
    return false;
}

/* ============================================================
   ДВИЖЕНИЕ ИГРОКА + БИНИХОП
   ============================================================ */
function updateMovement(dt) {
    if (state.isGameOver || state.isPaused) return;

    const v = state.velocity;
    const wid = getActiveWeaponId();
    const w = WEAPONS[wid];

    /* Базовая скорость */
    let baseSpeed = MOVE_SPEED;

    /* Нож даёт ускорение */
    if (w && w.isMelee) baseSpeed = MOVE_SPEED * 1.25;

    /* БИНИХОП: если зажата кнопка прыжка и мы не на земле — ускорение */
    if (state.jumpHold && !state.canJump) baseSpeed *= 1.35;

    /* Присед замедляет */
    if (state.isCrouching) baseSpeed *= .5;

    /* Направления */
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    fwd.y = 0;
    fwd.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
    right.y = 0;
    right.normalize();

    /* Ввод: клавиатура + джойстик */
    const mv = new THREE.Vector3();
    let ix = 0, iz = 0;
    if (state.keys.w) iz += 1;
    if (state.keys.s) iz -= 1;
    if (state.keys.d) ix += 1;
    if (state.keys.a) ix -= 1;
    if (mobile.joyMoveActive) {
        ix += mobile.moveX;
        iz -= mobile.moveY;
    }

    if (ix !== 0 || iz !== 0) {
        mv.addScaledVector(right, ix);
        mv.addScaledVector(fwd, iz);
        if (mv.lengthSq() > 0) mv.normalize();
    }

    /* Замедление в прицеле */
    const aimMult = state.isAiming ? (wid === 'awp' ? .7 : .6) : 1;

    v.x = THREE.MathUtils.lerp(v.x, mv.x * baseSpeed * aimMult, 12 * dt);
    v.z = THREE.MathUtils.lerp(v.z, mv.z * baseSpeed * aimMult, 12 * dt);

    /* Гравитация */
    v.y -= GRAVITY * dt;

    /* Перемещение с проверкой коллизий по осям отдельно */
    const pos = state.camera.position;
    const nx = pos.x + v.x * dt;
    const nz = pos.z + v.z * dt;

    if (!checkCollision({ x: nx, y: pos.y, z: pos.z })) pos.x = nx;
    else v.x = 0;

    if (!checkCollision({ x: pos.x, y: pos.y, z: nz })) pos.z = nz;
    else v.z = 0;

    pos.y += v.y * dt;

    /* Приземление */
    const targetH = state.isCrouching ? PLAYER_HEIGHT * .65 : PLAYER_HEIGHT;
    if (pos.y < targetH) {
        pos.y = targetH;
        v.y = 0;
        state.canJump = true;

        /* АВТО-БИНИХОП: если держим кнопку прыжка — прыгаем снова */
        if (state.jumpHold) {
            state.velocity.y = JUMP_SPEED;
            state.canJump = false;
            const boost = w && w.isMelee ? 1.15 : 1;
            state.velocity.x += fwd.x * 1.5 * boost;
            state.velocity.z += fwd.z * 1.5 * boost;
        }
    }
    if (pos.y > 20) pos.y = 20;
}

/* ============================================================
   МИНИ-КАРТА
   ============================================================ */
function drawMinimap() {
    const ctx = state.minimapCtx;
    const size = 88, scale = size / WORLD_SIZE;
    ctx.clearRect(0, 0, size, size);

    /* Фон */
    ctx.fillStyle = state.mapKey === 'sandstone' ? '#3a2a15' : '#1a2a40';
    ctx.fillRect(0, 0, size, size);

    const toMap = (x, z) => [(x + WORLD_SIZE / 2) * scale, (z + WORLD_SIZE / 2) * scale];

    /* Стены */
    ctx.fillStyle = state.mapKey === 'sandstone' ? '#6b5030' : '#3a4a60';
    state.colliders.forEach(c => {
        if (c.max.y < 2) return;
        const [x1, z1] = toMap(c.min.x, c.min.z);
        const [x2, z2] = toMap(c.max.x, c.max.z);
        ctx.fillRect(x1, z1, x2 - x1, z2 - z1);
    });

    /* Пленты A и B */
    const m = MAPS[state.mapKey];
    ctx.fillStyle = '#fa0';
    const [aX, aY] = toMap(m.plantA[0], m.plantA[1]);
    ctx.beginPath(); ctx.arc(aX, aY, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#4af';
    const [bX, bY] = toMap(m.plantB[0], m.plantB[1]);
    ctx.beginPath(); ctx.arc(bX, bY, 3, 0, Math.PI * 2); ctx.fill();

    /* Враги */
    ctx.fillStyle = '#f22';
    state.enemies.forEach(e => {
        const [x, y] = toMap(e.position.x, e.position.z);
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    });

    /* Игрок — стрелочка */
    const [mx, my] = toMap(state.camera.position.x, state.camera.position.z);
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(-state.yaw);
    ctx.fillStyle = '#fa0';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(-3, 3);
    ctx.lineTo(0, 1.5);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

/* ============================================================
   ПРИЦЕЛ (переключение)
   ============================================================ */
function toggleAim() {
    const wid = getActiveWeaponId();
    if (wid === 'awp') {
        state.isAiming = !state.isAiming;
        const sc = document.getElementById('awp-scope');
        const btn = document.getElementById('btn-aim');
        if (state.isAiming) {
            sc.classList.add('active');
            document.getElementById('crosshair').style.opacity = '0';
            btn.classList.add('active');
            state.camera.fov = 30;
        } else {
            sc.classList.remove('active');
            document.getElementById('crosshair').style.opacity = '0.95';
            btn.classList.remove('active');
            state.camera.fov = 80;
        }
        state.camera.updateProjectionMatrix();
    } else {
        state.isAiming = !state.isAiming;
        const btn = document.getElementById('btn-aim');
        if (state.isAiming) {
            btn.classList.add('active');
            state.camera.fov = 55;
        } else {
            btn.classList.remove('active');
            state.camera.fov = 80;
        }
        state.camera.updateProjectionMatrix();
    }
}

/* ============================================================
   ПЕРЕКЛЮЧЕНИЕ СЛОТА ОРУЖИЯ
   ============================================================ */
function switchToSlot(slot) {
    if (slot === 'bomb' && playerData.team !== 'T') {
        myAlert('Только T может использовать бомбу!', 'НЕДОСТУПНО');
        return;
    }
    if (slot === 'primary' && !playerData.ownedWeapons.includes(playerData.equippedWeapon)) return;
    state.currentSlot = slot;
    applySlot();
        }
