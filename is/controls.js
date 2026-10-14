/* ============================================================
   CONTROLS.JS — джойстик, обзор, кнопки, колесо смены
   оружия, свайпы, fullscreen, пауза
   ============================================================ */

/* ============================================================
   ДЖОЙСТИК + ОБЗОР (водим пальцем по правой части)
   ============================================================ */
function setupJoysticks() {
    const joy = document.getElementById('joy-move');
    const knob = document.getElementById('joy-move-knob');
    const R = 55;

    function upd(x, y) {
        let dx = x - mobile.joyMoveStart.x;
        let dy = y - mobile.joyMoveStart.y;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx = dx / d * R; dy = dy / d * R; }
        knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
        mobile.moveX = dx / R;
        mobile.moveY = dy / R;
    }
    function center() {
        const r = joy.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    let tid = null;
    joy.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        if (tid !== null) return;
        const t = e.changedTouches[0];
        tid = t.identifier;
        mobile.joyMoveActive = true;
        mobile.joyMoveStart = center();
        upd(t.clientX, t.clientY);
    }, { passive: false });

    joy.addEventListener('touchmove', e => {
        if (tid === null) return;
        e.preventDefault();
        e.stopPropagation();
        for (const t of e.changedTouches) {
            if (t.identifier === tid) { upd(t.clientX, t.clientY); break; }
        }
    }, { passive: false });

    const end = e => {
        for (const t of e.changedTouches) {
            if (t.identifier === tid) {
                tid = null;
                mobile.joyMoveActive = false;
                mobile.moveX = 0;
                mobile.moveY = 0;
                knob.style.transform = 'translate(-50%,-50%)';
                break;
            }
        }
    };
    joy.addEventListener('touchend', end);
    joy.addEventListener('touchcancel', end);

    /* ----- Обзор ----- */
    let lookId = null;
    document.addEventListener('touchstart', e => {
        if (e.target && e.target.closest) {
            if (e.target.closest('#joy-move') ||
                e.target.closest('.ctrl-btn') ||
                e.target.closest('#fire-zone') ||
                e.target.closest('.overlay') ||
                e.target.closest('.modal') ||
                e.target.closest('#button-editor') ||
                e.target.closest('#paused-msg') ||
                e.target.closest('#awp-scope') ||
                e.target.closest('#match-end') ||
                e.target.closest('#team-select') ||
                e.target.closest('#map-select') ||
                e.target.closest('#weapon-wheel')) return;
        }
        for (const t of e.changedTouches) {
            if (lookId === null && t.clientX > window.innerWidth * .3) {
                lookId = t.identifier;
                mobile.lookActive = true;
                mobile.lookLast = { x: t.clientX, y: t.clientY };
                break;
            }
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (lookId === null) return;
        for (const t of e.changedTouches) {
            if (t.identifier === lookId) {
                const dx = t.clientX - mobile.lookLast.x;
                const dy = t.clientY - mobile.lookLast.y;
                mobile.lookLast = { x: t.clientX, y: t.clientY };
                const sens = BASE_LOOK * (playerData.sensitivity / 8) * (state.isAiming ? .4 : 1);
                state.yaw -= dx * sens;
                state.pitch -= dy * sens;
                state.pitch = Math.max(-Math.PI / 2 + .05, Math.min(Math.PI / 2 - .05, state.pitch));
                updateCameraFromYawPitch();
                break;
            }
        }
    }, { passive: true });

    const endLook = e => {
        for (const t of e.changedTouches) {
            if (t.identifier === lookId) {
                lookId = null;
                mobile.lookActive = false;
                break;
            }
        }
    };
    document.addEventListener('touchend', endLook);
    document.addEventListener('touchcancel', endLook);
}

/* ============================================================
   КОЛЕСО СМЕНЫ ОРУЖИЯ
   ============================================================ */
function updateWheelLabels() {
    document.getElementById('ws-primary-name').textContent = WEAPONS[playerData.equippedWeapon].name;
    document.getElementById('ws-pistol-name').textContent = WEAPONS[playerData.equippedPistol].name;
    document.getElementById('ws-knife-name').textContent = WEAPONS[playerData.equippedKnife].name;
    document.getElementById('ws-bomb-name').textContent = playerData.team === 'T' ? 'ПАЧКА' : 'ДЕФЬЮЗЕР';
}
function highlightWheelSector(slot) {
    document.querySelectorAll('#weapon-wheel .wheel-sector').forEach(s => {
        s.classList.toggle('active', s.dataset.slot === slot);
    });
    state.wheelCurrentSlot = slot;
}
function showWeaponWheel() {
    updateWheelLabels();
    document.getElementById('weapon-wheel').classList.add('show');
    state.wheelActive = true;
    highlightWheelSector(state.currentSlot);
}
function hideWeaponWheel() {
    document.getElementById('weapon-wheel').classList.remove('show');
    state.wheelActive = false;
    state.wheelCurrentSlot = null;
}
function applyWheelSelection() {
    if (state.wheelCurrentSlot && state.wheelCurrentSlot !== state.currentSlot) {
        switchToSlot(state.wheelCurrentSlot);
    }
    hideWeaponWheel();
}

/* ============================================================
   КНОПКА СМЕНЫ — удержание и выбор сектора
   ============================================================ */
function setupSwapButton() {
    const btn = document.getElementById('btn-swap');
    if (!btn) return;

    let active = false;
    let startX = 0, startY = 0;
    let holdTimer = null;
    let isHold = false;

    const start = e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (active) return;
        active = true;
        const t = e.touches ? e.touches[0] : e;
        startX = t.clientX;
        startY = t.clientY;
        isHold = false;
        btn.classList.add('active');

        holdTimer = setTimeout(() => {
            if (active) {
                isHold = true;
                showWeaponWheel();
            }
        }, 250);
    };

    const move = e => {
        if (!active) return;
        const t = e.touches ? e.touches[0] : e;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!isHold && Math.hypot(dx, dy) > 20) {
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
            if (!isHold) {
                isHold = true;
                showWeaponWheel();
            }
        }
        if (isHold) {
            /* Определяем сектор по направлению пальца */
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            let slot = null;
            if (angle >= -135 && angle < -45) slot = 'bomb';
            else if (angle >= 45 && angle < 135) slot = 'primary';
            else if (angle >= 135 || angle < -135) slot = 'knife';
            else slot = 'pistol';
            if (slot) highlightWheelSector(slot);
        }
    };

    const end = e => {
        if (!active) return;
        active = false;
        btn.classList.remove('active');

        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }

        if (isHold) {
            applyWheelSelection();
        } else {
            /* Обычный тап — циклическое переключение */
            const s = ['primary', 'pistol', 'knife'];
            const i = s.indexOf(state.currentSlot);
            switchToSlot(s[(i + 1) % s.length]);
        }
        isHold = false;
    };

    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchmove', move, { passive: false });
    btn.addEventListener('touchend', end);
    btn.addEventListener('touchcancel', end);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
    btn.addEventListener('contextmenu', e => e.preventDefault());
}

/* ============================================================
   ВСЕ КНОПКИ УПРАВЛЕНИЯ
   ============================================================ */
function setupButtons() {
    const hold = (id, onDown, onUp) => {
        const el = document.getElementById(id);
        if (!el) return;
        let a = false;
        const d = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (a) return;
            a = true;
            onDown();
        };
        const u = e => {
            if (!a) return;
            a = false;
            if (onUp) onUp();
        };
        el.addEventListener('touchstart', d, { passive: false });
        el.addEventListener('touchend', u);
        el.addEventListener('touchcancel', u);
        el.addEventListener('mousedown', d);
        el.addEventListener('mouseup', u);
        el.addEventListener('mouseleave', u);
        el.addEventListener('contextmenu', e => e.preventDefault());
    };
    const tap = (id, fn) => {
        const el = document.getElementById(id);
        if (!el) return;
        let t = false;
        const h = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (t) return;
            t = true;
            setTimeout(() => t = false, 150);
            fn();
        };
        el.addEventListener('touchstart', h, { passive: false });
        el.addEventListener('click', h);
    };

    /* ----- ОГОНЬ ----- */
    hold('btn-fire', () => {
        state.autoFire = true;
        state.isShooting = true;
        const wid = getActiveWeaponId();
        const w = WEAPONS[wid];
        if (w && (w.isMelee || !w.auto)) shoot();
    }, () => {
        state.autoFire = false;
        state.isShooting = false;
    });

    /* ----- ЗОНА СТРЕЛЬБЫ ----- */
    const fz = document.getElementById('fire-zone');
    if (fz) {
        let a = false;
        const d = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (a) return;
            a = true;
            fz.classList.add('active');
            state.autoFire = true;
            state.isShooting = true;
            const wid = getActiveWeaponId();
            const w = WEAPONS[wid];
            if (w && (w.isMelee || !w.auto)) shoot();
        };
        const u = e => {
            if (!a) return;
            a = false;
            fz.classList.remove('active');
            state.autoFire = false;
            state.isShooting = false;
        };
        fz.addEventListener('touchstart', d, { passive: false });
        fz.addEventListener('touchend', u);
        fz.addEventListener('touchcancel', u);
        fz.addEventListener('mousedown', d);
        fz.addEventListener('mouseup', u);
        fz.addEventListener('mouseleave', u);
    }

    /* ----- ПРИЦЕЛ ----- */
    tap('btn-aim', toggleAim);
    document.getElementById('awp-close-btn').addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        state.isAiming = false;
        document.getElementById('awp-scope').classList.remove('active');
        document.getElementById('crosshair').style.opacity = '0.95';
        document.getElementById('btn-aim').classList.remove('active');
        state.camera.fov = 80;
        state.camera.updateProjectionMatrix();
    });

    /* ----- ПРЫЖОК (с бинихопом) ----- */
    const jumpBtn = document.getElementById('btn-jump');
    if (jumpBtn) {
        let active = false;
        const down = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (active) return;
            active = true;
            jumpBtn.classList.add('active');
            state.jumpHold = true;

            if (state.canJump) {
                state.velocity.y = JUMP_SPEED;
                state.canJump = false;
                const wid = getActiveWeaponId();
                const w = WEAPONS[wid];
                const boost = w && w.isMelee ? 1.15 : 1;
                const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
                fwd.y = 0;
                fwd.normalize();
                state.velocity.x += fwd.x * 1.5 * boost;
                state.velocity.z += fwd.z * 1.5 * boost;
            }
        };
        const up = e => {
            if (!active) return;
            active = false;
            jumpBtn.classList.remove('active');
            state.jumpHold = false;
        };
        jumpBtn.addEventListener('touchstart', down, { passive: false });
        jumpBtn.addEventListener('touchend', up);
        jumpBtn.addEventListener('touchcancel', up);
        jumpBtn.addEventListener('mousedown', down);
        jumpBtn.addEventListener('mouseup', up);
        jumpBtn.addEventListener('mouseleave', up);
        jumpBtn.addEventListener('contextmenu', e => e.preventDefault());
    }

    /* ----- ПРИСЕД ----- */
    tap('btn-crouch', () => {
        state.isCrouching = !state.isCrouching;
        const b = document.getElementById('btn-crouch');
        const d = document.getElementById('crouch-icon-down');
        const u = document.getElementById('crouch-icon-up');
        if (state.isCrouching) {
            b.classList.add('active');
            d.style.display = 'none';
            u.style.display = 'block';
        } else {
            b.classList.remove('active');
            d.style.display = 'block';
            u.style.display = 'none';
        }
    });

    /* ----- ПЕРЕЗАРЯДКА ----- */
    tap('btn-reload', reload);

    /* ----- КНОПКА СМЕНЫ (со свайпами) ----- */
    setupSwapButton();

    /* ----- ПАУЗА И НАСТРОЙКИ ----- */
    tap('btn-pause', pauseGame);
    tap('btn-resume', resumeGame);
    tap('btn-leave', leaveGame);
    tap('btn-settings-pause', () => { initSettings(); openOverlay('settings-overlay'); });
    tap('btn-fullscreen', toggleFullscreen);
    tap('fs-toggle-btn', toggleFullscreen);
    tap('btn-shop-hud', () => { renderShop(); openOverlay('shop-overlay'); });

    /* ----- МЕНЮ КОНЦА МАТЧА ----- */
    tap('me-again', () => {
        document.getElementById('match-end').classList.remove('show');
        startGame();
    });
    tap('me-menu', () => {
        document.getElementById('match-end').classList.remove('show');
        returnToMenu();
    });

    /* ----- PLANT ----- */
    const pb = document.getElementById('btn-plant');
    if (pb) {
        let a = false;
        const d = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (a) return;
            a = true;
            startPlant();
        };
        const u = e => { if (!a) return; a = false; stopPlant(); };
        pb.addEventListener('touchstart', d, { passive: false });
        pb.addEventListener('touchend', u);
        pb.addEventListener('touchcancel', u);
        pb.addEventListener('mousedown', d);
        pb.addEventListener('mouseup', u);
        pb.addEventListener('mouseleave', u);
    }

    /* ----- DEFUSE ----- */
    const db = document.getElementById('btn-defuse');
    if (db) {
        let a = false;
        const d = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (a) return;
            a = true;
            startDefuse();
        };
        const u = e => { if (!a) return; a = false; stopDefuse(); };
        db.addEventListener('touchstart', d, { passive: false });
        db.addEventListener('touchend', u);
        db.addEventListener('touchcancel', u);
        db.addEventListener('mousedown', d);
        db.addEventListener('mouseup', u);
        db.addEventListener('mouseleave', u);
    }
}

/* ============================================================
   FULLSCREEN
   ============================================================ */
function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    } catch (e) {}
}

/* ============================================================
   ПАУЗА
   ============================================================ */
function pauseGame() {
    state.isPaused = true;
    document.getElementById('paused-msg').style.display = 'block';
}
function resumeGame() {
    state.isPaused = false;
    document.getElementById('paused-msg').style.display = 'none';
}
function leaveGame() {
    state.isPaused = false;
    document.getElementById('paused-msg').style.display = 'none';
    returnToMenu();
}

/* ============================================================
   КЛАВИАТУРА (для ПК)
   ============================================================ */
document.addEventListener('gesturestart', e => e.preventDefault());

document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'KeyW': state.keys.w = true; break;
        case 'KeyS': state.keys.s = true; break;
        case 'KeyA': state.keys.a = true; break;
        case 'KeyD': state.keys.d = true; break;
        case 'Space':
            state.keys.space = true;
            state.jumpHold = true;
            if (state.canJump) {
                state.velocity.y = JUMP_SPEED;
                state.canJump = false;
            }
            e.preventDefault();
            break;
        case 'ShiftLeft': state.keys.shift = true; break;
        case 'KeyR': reload(); break;
        case 'KeyV': switchToSlot(state.currentSlot === 'primary' ? 'pistol' : 'primary'); break;
        case 'KeyF': toggleAim(); break;
        case 'KeyG': startPlant(); break;
    }
});

document.addEventListener('keyup', e => {
    switch (e.code) {
        case 'KeyW': state.keys.w = false; break;
        case 'KeyS': state.keys.s = false; break;
        case 'KeyA': state.keys.a = false; break;
        case 'KeyD': state.keys.d = false; break;
        case 'Space': state.keys.space = false; state.jumpHold = false; break;
        case 'ShiftLeft': state.keys.shift = false; break;
        case 'KeyG': stopPlant(); break;
    }
});
