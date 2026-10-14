/* ============================================================
   MAIN.JS — меню, старт/конец игры, главный цикл animate,
   инициализация, ориентация экрана
   ============================================================ */

/* ============================================================
   ССЫЛКИ НА ЭЛЕМЕНТЫ
   ============================================================ */
const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const mapSelect = document.getElementById('map-select');
const teamSelect = document.getElementById('team-select');

/* ============================================================
   БОКОВОЕ МЕНЮ — ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
   ============================================================ */
document.querySelectorAll('.side-icon').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tab;
    if (t === 'maps') {
        renderMapSelect();
        mapSelect.style.display = 'flex';
    }
    else if (t === 'inventory') {
        renderInventory();
        openOverlay('inventory-overlay');
    }
    else if (t === 'cases') {
        renderCases();
        openOverlay('cases-overlay');
    }
    else if (t === 'clans') {
        renderClans();
        openOverlay('clan-overlay');
    }
    else if (t === 'profile') {
        showProfilePopup();
    }
    else if (t === 'settings') {
        initSettings();
        openOverlay('settings-overlay');
    }
}));

/* ============================================================
   ВЫБОР КАРТЫ
   ============================================================ */
function renderMapSelect() {
    const l = document.getElementById('map-select-list');
    l.innerHTML = '';
    Object.entries(MAPS).forEach(([k, m]) => {
        const c = document.createElement('div');
        c.className = 'map-card';
        c.innerHTML = '<div class="map-preview ' + k + '">' + m.icon + '</div>' +
                      '<div class="map-info"><h3>' + m.name + '</h3><p>' + m.desc + '</p></div>';
        c.onclick = () => {
            state.mapKey = k;
            mapSelect.style.display = 'none';
            startGame();
        };
        l.appendChild(c);
    });
}

/* ============================================================
   ПРОФИЛЬ — попап
   ============================================================ */
function showProfilePopup() {
    myAlert(
        'ID: ' + playerData.playerId +
        '\nИмя: ' + playerData.playerName +
        '\nУровень: ' + playerData.level +
        '\nДеньги: ' + playerData.money + '$' +
        '\nУбийств: ' + playerData.totalKills +
        '\nСкинов: ' + playerData.ownedSkins.length +
        '\nКоманда: ' + playerData.team,
        'ПРОФИЛЬ'
    );
}

/* ============================================================
   ВЫБОР КОМАНДЫ
   ============================================================ */
document.querySelectorAll('.team-btn').forEach(b => b.addEventListener('click', () => {
    playerData.team = b.dataset.team;
    saveProfile();
    document.getElementById('team-badge').textContent = playerData.team;
    document.getElementById('team-badge').className = playerData.team === 'T' ? 't' : 'ct';
    teamSelect.style.display = 'none';
    renderMapSelect();
    mapSelect.style.display = 'flex';
}));

document.getElementById('back-team').addEventListener('click', () => {
    teamSelect.style.display = 'none';
    menu.style.display = 'flex';
});

document.getElementById('back-to-menu').addEventListener('click', () => {
    mapSelect.style.display = 'none';
    menu.style.display = 'flex';
});

document.getElementById('play-btn').addEventListener('click', () => {
    if (innerHeight > innerWidth) { checkOrientation(); return; }
    menu.style.display = 'none';
    teamSelect.style.display = 'flex';
});

/* ============================================================
   СТАРТ ИГРЫ
   ============================================================ */
function startGame() {
    menu.style.display = 'none';
    teamSelect.style.display = 'none';
    mapSelect.style.display = 'none';
    hud.style.display = 'block';

    if (state.scene) destroyGame();

    /* Сброс состояния */
    state.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
    state.hitMarkerTimer = 0;
    state.hitFlashTimer = 0;
    state.isCrouching = false;
    state.isAiming = false;
    state.isShooting = false;
    state.recoilPitch = 0;
    state.recoilYaw = 0;
    state.score = 0;
    state.sessionMoney = 0;
    state.deaths = 0;
    state.matchState = 'playing';
    state.wave = 1;
    state.currentWaveEnemies = 0;
    state.currentSlot = 'primary';
    state.bombPlanted = false;
    state.bombMesh = null;
    state.jumpHold = false;
    state.jumpCooldown = 0;
    state.planting = false;
    state.defusing = false;

    createScene();

    state.maxHealth = 100;
    state.health = 100;
    document.getElementById('health-fill').style.width = '100%';
    state.isGameOver = false;
    state.isReloading = false;
    state.isPaused = false;
    state.velocity.set(0, 0, 0);

    document.getElementById('score').textContent = '0';
    document.getElementById('map-name').textContent = MAPS[state.mapKey].name;
    document.getElementById('team-badge').textContent = playerData.team;
    document.getElementById('team-badge').className = playerData.team === 'T' ? 't' : 'ct';
    document.getElementById('match-end').classList.remove('show');
    document.getElementById('paused-msg').style.display = 'none';
    document.getElementById('awp-scope').classList.remove('active');
    document.getElementById('crosshair').style.opacity = '0.95';
    document.getElementById('btn-aim').classList.remove('active');
    document.getElementById('btn-plant').classList.remove('show');
    document.getElementById('btn-defuse').classList.remove('show');
    document.getElementById('plant-progress').classList.remove('show');

    applyButtonSettings();
    applyButtonLayout();
    updateDebugVisibility();

    document.getElementById('crouch-icon-down').style.display = 'block';
    document.getElementById('crouch-icon-up').style.display = 'none';
    document.getElementById('btn-crouch').classList.remove('active');

    /* Первая волна — 10 врагов */
    spawnEnemies(10);
    state.currentWaveEnemies = 10;

    state.clock.getDelta();
    checkOrientation();
    animate();
}

/* ============================================================
   КОНЕЦ МАТЧА
   ============================================================ */
function endMatch(win) {
    state.isGameOver = true;
    state.matchState = win ? 'win' : 'lose';

    document.getElementById('me-title').textContent = win ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
    document.getElementById('me-title').className = 'me-title ' + (win ? 'win' : 'lose');
    document.getElementById('me-kills').textContent = state.score;
    document.getElementById('me-deaths').textContent = state.deaths;
    document.getElementById('me-money').textContent = state.sessionMoney;
    document.getElementById('me-total').textContent = state.score;
    document.getElementById('match-end').classList.add('show');

    playerData.money += state.sessionMoney;
    playerData.exp += state.score * 10;
    while (playerData.exp >= 100) { playerData.exp -= 100; playerData.level++; }
    saveProfile();
    updateProfileUI();

    if (playerData.vibeEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

/* ============================================================
   УНИЧТОЖЕНИЕ СЦЕНЫ
   ============================================================ */
function destroyGame() {
    if (state.renderer) {
        state.renderer.dispose();
        if (state.renderer.domElement.parentNode) {
            state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
        }
    }
    state.scene = null;
    state.renderer = null;
    state.enemies = [];
    state.colliders = [];
    state.bloodParticles = [];
    state.bulletHoles = [];
    state.weaponModel = null;
    state.bombMesh = null;
    state.plantZoneMeshes = [];
}

/* ============================================================
   ВОЗВРАТ В МЕНЮ
   ============================================================ */
function returnToMenu() {
    destroyGame();
    hud.style.display = 'none';
    document.getElementById('match-end').classList.remove('show');
    document.getElementById('awp-scope').classList.remove('active');
    document.querySelectorAll('.overlay').forEach(o => o.style.display = 'none');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    document.getElementById('button-editor').classList.remove('active');
    document.getElementById('btn-plant').classList.remove('show');
    document.getElementById('btn-defuse').classList.remove('show');
    document.getElementById('plant-progress').classList.remove('show');
    hideWeaponWheel();
    menu.style.display = 'flex';
    menu.style.visibility = 'visible';
    menu.style.opacity = '1';
    updateProfileUI();
}

/* ============================================================
   ГЛАВНЫЙ ЦИКЛ
   ============================================================ */
function animate() {
    requestAnimationFrame(animate);
    if (!state.renderer || !state.scene) return;

    try {
        const dt = Math.min(state.clock.getDelta(), .05);

        /* Вспышка выстрела */
        if (state.muzzleFlashTimer > 0) {
            state.muzzleFlashTimer -= dt;
            if (state.muzzleFlashTimer <= 0) state.muzzleFlash.intensity = 0;
        }

        /* Хитмаркер */
        if (state.hitMarkerTimer > 0) {
            state.hitMarkerTimer -= dt;
            if (state.hitMarkerTimer <= 0) {
                document.getElementById('hit-marker').style.opacity = '0';
                document.getElementById('crosshair').classList.remove('hit');
            }
        }

        /* Красная вспышка при получении урона */
        if (state.hitFlashTimer > 0) {
            state.hitFlashTimer -= dt;
            if (state.hitFlashTimer <= 0) {
                document.getElementById('hit-flash').style.opacity = '0';
            }
        }

        /* Отдача */
        if (state.recoilPitch > 0) {
            state.recoilPitch = Math.max(0, state.recoilPitch - dt * .3);
            updateCameraFromYawPitch();
        }
        if (Math.abs(state.recoilYaw) > 0) {
            state.recoilYaw *= (1 - dt * 5);
            if (Math.abs(state.recoilYaw) < .001) state.recoilYaw = 0;
            updateCameraFromYawPitch();
        }

        /* Анимация доставания оружия */
        updateWeaponDraw(dt);

        if (!state.isGameOver && !state.isPaused) {
            const wid = getActiveWeaponId();
            const w = WEAPONS[wid];
            if (state.autoFire && w && w.auto && !w.isMelee) shoot();

            updateMovement(dt);
            updateEnemies(dt);
            updateParticles(dt);
            updateBomb(dt);
            updatePlantButton();
            drawMinimap();
        }

        state.renderer.render(state.scene, state.camera);
    } catch (err) {
        console.error('ANIMATE ERROR:', err);
    }
}

/* ============================================================
   ОРИЕНТАЦИЯ ЭКРАНА
   ============================================================ */
function checkOrientation() {
    const isP = innerHeight > innerWidth;
    const rh = document.getElementById('rotate-hint');
    if (isP) {
        rh.style.display = 'flex';
        menu.style.display = 'none';
        hud.style.display = 'none';
        mapSelect.style.display = 'none';
        teamSelect.style.display = 'none';
    } else {
        rh.style.display = 'none';
        if (!state.scene && !state.isGameOver) menu.style.display = 'flex';
        if (state.scene && !state.isGameOver) hud.style.display = 'block';
    }
}

window.addEventListener('resize', () => {
    if (state.camera) {
        state.camera.aspect = innerWidth / innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(innerWidth, innerHeight);
    }
    checkOrientation();
});
window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 200));

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
loadProfile();
setupJoysticks();
setupButtons();
checkOrientation();
initSettings();
applyButtonLayout();
updateDebugVisibility();
applyCrosshair();
applyFireZone();

document.getElementById('team-badge').textContent = playerData.team;
document.getElementById('team-badge').className = playerData.team === 'T' ? 't' : 'ct';

console.log('=== Standoff Mini 3D загружен ===');
