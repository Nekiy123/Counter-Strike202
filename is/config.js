/* ============================================================
   CONFIG.JS — все константы, оружие, карты, скины, кейсы,
   данные игрока и глобальное состояние игры
   ============================================================ */

/* ============================================================
   ОРУЖИЕ
   ============================================================ */
const WEAPONS = {
    knife: {
        name: 'НОЖ', damage: 55, headshotMult: 3, rpm: 120,
        magSize: 999, reserveMax: 999, reloadTime: 0, auto: false,
        spread: 0, range: 2.5, model: 'knife', isMelee: true,
        price: 0, type: 'knife'
    },
    glock: {
        name: 'GLOCK-18', damage: 22, headshotMult: 3, rpm: 400,
        magSize: 17, reserveMax: 51, reloadTime: 1200, auto: false,
        spread: .012, range: 60, model: 'glock', price: 200, type: 'pistol'
    },
    dualies: {
        name: 'DUAL BERETTAS', damage: 18, headshotMult: 3, rpm: 500,
        magSize: 30, reserveMax: 60, reloadTime: 1800, auto: false,
        spread: .02, range: 55, model: 'dualies', price: 400, type: 'pistol'
    },
    deagle: {
        name: 'DESERT EAGLE', damage: 60, headshotMult: 4, rpm: 180,
        magSize: 7, reserveMax: 21, reloadTime: 1500, auto: false,
        spread: .01, range: 80, model: 'deagle', price: 700, type: 'pistol'
    },
    fnfal: {
        name: 'FN FAL', damage: 42, headshotMult: 4, rpm: 500,
        magSize: 20, reserveMax: 60, reloadTime: 2200, auto: true,
        spread: .02, range: 85, model: 'fnfal', price: 2700, type: 'rifle'
    },
    akr: {
        name: 'AKR-12', damage: 35, headshotMult: 4, rpm: 600,
        magSize: 30, reserveMax: 90, reloadTime: 2000, auto: true,
        spread: .018, range: 80, model: 'rifle', price: 2700, type: 'rifle'
    },
    awp: {
        name: 'AWM SNIPER', damage: 150, headshotMult: 2, rpm: 40,
        magSize: 5, reserveMax: 15, reloadTime: 3000, auto: false,
        spread: .001, range: 150, model: 'sniper', price: 4750, type: 'sniper'
    },
    fabm: {
        name: 'FABM SHOTGUN', damage: 22, headshotMult: 2, rpm: 120,
        magSize: 8, reserveMax: 32, reloadTime: 2500, auto: false,
        spread: .06, range: 30, model: 'shotgun', pellets: 8,
        price: 2000, type: 'shotgun'
    }
};

/* ============================================================
   КАРТЫ
   ============================================================ */
const MAPS = {
    sandstone: {
        name: 'SANDSTONE',
        desc: 'Пустынная крепость. A и B, проходы через центр.',
        groundColor: 0xc9a06a,
        wallColor: 0x8b6f47,
        skyColor: 0xeedd99,
        fogColor: 0xeedd99,
        fogFar: 120,
        ambient: 0xffeecc,
        ambientIntensity: 1.2,
        sunColor: 0xffdd88,
        generate: null,
        icon: '<svg viewBox="0 0 24 24"><path d="M3 20h18L21 8l-3-2-4 4-2-6-2 6-4-4-3 2z"/></svg>',
        spawn: [0, 30],
        spawnCT: [0, 30],
        spawnT: [0, -30],
        plantA: [-25, 25],
        plantB: [25, 25]
    },
    templ: {
        name: 'TEMPL',
        desc: 'Древний храм в горах.',
        groundColor: 0x5a6a80,
        wallColor: 0x3a4a60,
        skyColor: 0x1a2a40,
        fogColor: 0x2a3a55,
        fogFar: 80,
        ambient: 0x8899bb,
        ambientIntensity: 1.2,
        sunColor: 0xccddff,
        generate: null,
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2L2 8h20zM4 10v10h2V10zm4 0v10h2V10zm4 0v10h2V10zm4 0v10h2V10zM2 22h20v-2H2z"/></svg>',
        spawn: [0, 30],
        spawnCT: [0, 30],
        spawnT: [0, -30],
        plantA: [-25, 0],
        plantB: [25, 0]
    }
};

/* ============================================================
   СКИНЫ
   ============================================================ */
const SKINS = {
    akr_dust:       { name: 'AKR-12 | Пыль',   weapon: 'akr',   rarity: 'common',    color: '#666', price: 150 },
    pistol_dust:    { name: 'P-9 | Пыль',      weapon: 'glock', rarity: 'common',    color: '#666', price: 100 },
    akr_redline:    { name: 'AKR-12 | Линия',  weapon: 'akr',   rarity: 'rare',      color: '#4f4', price: 450 },
    pistol_redline: { name: 'P-9 | Линия',     weapon: 'glock', rarity: 'rare',      color: '#4f4', price: 350 },
    akr_neon:       { name: 'AKR-12 | Неон',   weapon: 'akr',   rarity: 'epic',      color: '#a4f', price: 1200 },
    awp_neon:       { name: 'AWM | Неон',      weapon: 'awp',   rarity: 'epic',      color: '#a4f', price: 1500 },
    akr_dragon:     { name: 'AKR-12 | Дракон', weapon: 'akr',   rarity: 'legendary', color: '#fa0', price: 3500 },
    awp_dragon:     { name: 'AWM | Дракон',    weapon: 'awp',   rarity: 'legendary', color: '#fa0', price: 4000 },
    knife_gold:     { name: 'Нож | Золото',    weapon: 'knife', rarity: 'legendary', color: '#fa0', price: 5000 }
};

/* ============================================================
   РЕДКОСТЬ
   ============================================================ */
const RARITY = {
    common:    { name: 'ОБЫЧНЫЙ',     color: '#888', chance: 60 },
    rare:      { name: 'РЕДКИЙ',      color: '#4f4', chance: 28 },
    epic:      { name: 'ЭПИЧЕСКИЙ',   color: '#a4f', chance: 9 },
    legendary: { name: 'ЛЕГЕНДАРНЫЙ', color: '#fa0', chance: 3 }
};

/* ============================================================
   КЕЙСЫ
   ============================================================ */
const CASES = {
    free_case:   { name: 'БЕСПЛАТНЫЙ',  price: 0,    skins: ['akr_dust', 'pistol_dust', 'akr_redline'] },
    common_case: { name: 'СТАНДАРТНЫЙ', price: 500,  skins: ['akr_dust', 'pistol_dust', 'akr_redline', 'pistol_redline'] },
    rare_case:   { name: 'РЕДКИЙ',      price: 1500, skins: ['akr_redline', 'pistol_redline', 'akr_neon', 'awp_neon'] },
    legend_case: { name: 'ЛЕГЕНДАРНЫЙ', price: 3000, skins: ['akr_neon', 'awp_neon', 'akr_dragon', 'awp_dragon', 'knife_gold'] }
};

/* ============================================================
   ДАННЫЕ ИГРОКА
   ============================================================ */
const playerData = {
    money: 5000,
    totalKills: 0,
    ownedWeapons: ['knife', 'glock', 'akr', 'awp', 'fabm'],
    equippedWeapon: 'akr',
    equippedPistol: 'glock',
    equippedKnife: 'knife',
    playerId: '73396228',
    playerName: 'Игрок',
    avatar: null,
    level: 1,
    exp: 0,
    ownedSkins: [],
    equippedSkins: {},
    clanName: null,
    clanTag: '—',
    clanColor: '#888',
    lastFreeCase: 0,
    lastDailyReward: 0,
    customClans: [],
    buttonLayout: null,
    buttonSize: 100,
    buttonOpacity: 72,
    sensitivity: 8,
    soundEnabled: true,
    vibeEnabled: true,
    showDebug: false,
    botsHaveWeapons: false,
    crosshair: { color: '#fa0', thickness: 2, length: 22, style: 'cross' },
    fireZone: { w: 100, h: 100 },
    team: 'T'
};

/* ============================================================
   СОСТОЯНИЕ ИГРЫ
   ============================================================ */
const state = {
    scene: null,
    camera: null,
    renderer: null,
    raycaster: null,
    clock: null,
    mapKey: 'sandstone',
    magAmmo: 0,
    reserveAmmo: 0,
    health: 100,
    maxHealth: 100,
    score: 0,
    sessionMoney: 0,
    deaths: 0,
    isReloading: false,
    isGameOver: false,
    isPaused: false,
    lastShootTime: 0,
    enemies: [],
    colliders: [],
    bloodParticles: [],
    bulletHoles: [],
    velocity: null,
    canJump: true,
    minimapCtx: null,
    weaponModel: null,
    muzzleFlash: null,
    autoFire: false,
    spawnPoints: [],
    isCrouching: false,
    isAiming: false,
    yaw: 0,
    pitch: 0,
    keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
    muzzleFlashTimer: 0,
    hitMarkerTimer: 0,
    hitFlashTimer: 0,
    matchState: 'idle',
    wave: 0,
    currentWaveEnemies: 0,
    waveTimer: 0,
    recoilPitch: 0,
    recoilYaw: 0,
    isMoving: false,
    isShooting: false,
    jumpHold: false,
    jumpCooldown: 0,
    planting: false,
    plantTimer: 0,
    bombPlanted: false,
    bombPos: null,
    bombTimer: 0,
    defusing: false,
    defuseTimer: 0,
    bombMesh: null,
    currentPlantZone: null,
    currentSlot: 'primary',
    plantZoneMeshes: [],
    wheelActive: false,
    wheelPointerId: null,
    wheelCurrentSlot: null,
    weaponDrawProgress: 1
};

/* ============================================================
   КОНСТАНТЫ МИРА
   ============================================================ */
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = .6;
const WORLD_SIZE = 120;
const HALF_WORLD = WORLD_SIZE / 2 - 2;
const GRAVITY = 22;
const JUMP_SPEED = 7;
const MOVE_SPEED = 6;
const BASE_LOOK = 0.004;

/* ============================================================
   МОБИЛЬНОЕ УПРАВЛЕНИЕ
   ============================================================ */
const mobile = {
    moveX: 0,
    moveY: 0,
    joyMoveActive: false,
    joyMoveStart: { x: 0, y: 0 },
    lookActive: false,
    lookLast: { x: 0, y: 0 }
};

/* ============================================================
   КЛЮЧ СОХРАНЕНИЯ
   ============================================================ */
const SAVE_KEY = 'standoff_save_v25';
