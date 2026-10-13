/* ============================================================
   PROFILE.JS — модалки, сохранение/загрузка профиля,
   настройки, редактор кнопок, дневная награда
   ============================================================ */

/* ============================================================
   МОДАЛЬНЫЕ ОКНА (alert / confirm / prompt)
   ============================================================ */
const modalQueue = [];
let modalActive = false;

function showModal(cfg) {
    modalQueue.push(cfg);
    if (!modalActive) processModalQueue();
}

function processModalQueue() {
    if (modalQueue.length === 0) {
        modalActive = false;
        return;
    }
    modalActive = true;
    const cfg = modalQueue.shift();

    if (cfg.type === 'alert') {
        const m = document.getElementById('modal-alert');
        document.getElementById('modal-alert-title').textContent = cfg.title || 'УВЕДОМЛЕНИЕ';
        document.getElementById('modal-alert-text').textContent = cfg.text || '';
        m.classList.add('show');
        const h = () => {
            document.getElementById('modal-alert-ok').removeEventListener('click', h);
            m.classList.remove('show');
            setTimeout(processModalQueue, 80);
            if (cfg.onOk) cfg.onOk();
        };
        document.getElementById('modal-alert-ok').addEventListener('click', h);
    }
    else if (cfg.type === 'confirm') {
        const m = document.getElementById('modal-confirm');
        document.getElementById('modal-confirm-title').textContent = cfg.title || 'ПОДТВЕРЖДЕНИЕ';
        document.getElementById('modal-confirm-text').textContent = cfg.text || '';
        m.classList.add('show');
        const okH = () => { cleanup(); m.classList.remove('show'); setTimeout(processModalQueue, 80); if (cfg.onOk) cfg.onOk(); };
        const cancelH = () => { cleanup(); m.classList.remove('show'); setTimeout(processModalQueue, 80); if (cfg.onCancel) cfg.onCancel(); };
        const cleanup = () => {
            document.getElementById('modal-confirm-ok').removeEventListener('click', okH);
            document.getElementById('modal-confirm-cancel').removeEventListener('click', cancelH);
        };
        document.getElementById('modal-confirm-ok').addEventListener('click', okH);
        document.getElementById('modal-confirm-cancel').addEventListener('click', cancelH);
    }
    else if (cfg.type === 'prompt') {
        const m = document.getElementById('modal-prompt');
        document.getElementById('modal-prompt-title').textContent = cfg.title || 'ВВОД';
        document.getElementById('modal-prompt-text').textContent = cfg.text || '';
        const inp = document.getElementById('modal-prompt-input');
        inp.value = cfg.value || '';
        inp.maxLength = cfg.maxLength || 30;
        m.classList.add('show');
        setTimeout(() => inp.focus(), 100);
        const okH = () => {
            const v = inp.value.trim();
            cleanup();
            m.classList.remove('show');
            setTimeout(processModalQueue, 80);
            if (cfg.onOk) cfg.onOk(v);
        };
        const cancelH = () => {
            cleanup();
            m.classList.remove('show');
            setTimeout(processModalQueue, 80);
            if (cfg.onCancel) cfg.onCancel();
        };
        const enterH = (e) => { if (e.key === 'Enter') okH(); };
        const cleanup = () => {
            document.getElementById('modal-prompt-ok').removeEventListener('click', okH);
            document.getElementById('modal-prompt-cancel').removeEventListener('click', cancelH);
            inp.removeEventListener('keydown', enterH);
        };
        document.getElementById('modal-prompt-ok').addEventListener('click', okH);
        document.getElementById('modal-prompt-cancel').addEventListener('click', cancelH);
        inp.addEventListener('keydown', enterH);
    }
}

function myAlert(t, title = 'УВЕДОМЛЕНИЕ') {
    return new Promise(r => showModal({ type: 'alert', title, text: t, onOk: r }));
}
function myConfirm(t, title = 'ПОДТВЕРЖДЕНИЕ') {
    return new Promise(r => showModal({ type: 'confirm', title, text: t, onOk: () => r(true), onCancel: () => r(false) }));
}
function myPrompt(t, v = '', title = 'ВВОД', ml = 30) {
    return new Promise(r => showModal({ type: 'prompt', title, text: t, value: v, maxLength: ml, onOk: x => r(x), onCancel: () => r(null) }));
}

/* ============================================================
   СОХРАНЕНИЕ / ЗАГРУЗКА
   ============================================================ */
function saveProfile() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(playerData));
    } catch (e) {}
}
function loadProfile() {
    try {
        const s = localStorage.getItem(SAVE_KEY);
        if (s) {
            const p = JSON.parse(s);
            Object.keys(p).forEach(k => { if (k in playerData) playerData[k] = p[k]; });
        }
    } catch (e) {}
    ['knife', 'glock', 'akr', 'awp', 'fabm'].forEach(w => {
        if (!playerData.ownedWeapons.includes(w)) playerData.ownedWeapons.push(w);
    });
    updateProfileUI();
    applyCrosshair();
    applyFireZone();
}

/* ============================================================
   ОБНОВЛЕНИЕ ПРОФИЛЯ В МЕНЮ
   ============================================================ */
function updateProfileUI() {
    document.getElementById('p-id-val').textContent = playerData.playerId;
    document.getElementById('p-name').textContent = playerData.playerName;
    const av = document.getElementById('avatar');
    if (playerData.avatar) av.innerHTML = '<img src="' + playerData.avatar + '">';
    else av.innerHTML = '<div class="avatar-default"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';
    document.querySelector('#p-level .lv-badge').textContent = 'LVL ' + playerData.level;
    document.getElementById('p-exp').textContent = playerData.exp + ' / 100 EXP';
    document.querySelector('#p-level .lv-bar-fill').style.width = playerData.exp + '%';
}

/* ============================================================
   ПРИЦЕЛ (применение настроек)
   ============================================================ */
function applyCrosshair() {
    const ch = playerData.crosshair || { color: '#fa0', thickness: 2, length: 22, style: 'cross' };
    document.documentElement.style.setProperty('--crosshair-color', ch.color);
    const t = ch.thickness, l = ch.length;
    let css = '';
    if (ch.style === 'cross') {
        css = '#crosshair::before{width:' + t + 'px;height:' + l + 'px;left:' + (11 - t / 2) + 'px;top:' + ((22 - l) / 2) + 'px}' +
              '#crosshair::after{width:' + l + 'px;height:' + t + 'px;left:' + ((22 - l) / 2) + 'px;top:' + (11 - t / 2) + 'px}';
    } else if (ch.style === 'dot') {
        css = '#crosshair::before{width:' + (t + 2) + 'px;height:' + (t + 2) + 'px;left:' + (10 - t / 2) + 'px;top:' + (10 - t / 2) + 'px;border-radius:50%}' +
              '#crosshair::after{display:none}';
    } else if (ch.style === 'cross-dot') {
        css = '#crosshair::before{width:' + t + 'px;height:' + l + 'px;left:' + (11 - t / 2) + 'px;top:' + ((22 - l) / 2) + 'px}' +
              '#crosshair::after{width:' + l + 'px;height:' + t + 'px;left:' + ((22 - l) / 2) + 'px;top:' + (11 - t / 2) + 'px}';
    } else if (ch.style === 'circle') {
        css = '#crosshair::before{width:' + l + 'px;height:' + l + 'px;left:' + (11 - l / 2) + 'px;top:' + (11 - l / 2) + 'px;background:transparent;border:' + t + 'px solid ' + ch.color + ';border-radius:50%}' +
              '#crosshair::after{display:none}';
    }
    let s = document.getElementById('ch-dynamic-style');
    if (!s) {
        s = document.createElement('style');
        s.id = 'ch-dynamic-style';
        document.head.appendChild(s);
    }
    s.innerHTML = css;
}

/* ============================================================
   ЗОНА СТРЕЛЬБЫ
   ============================================================ */
function applyFireZone() {
    const fz = document.getElementById('fire-zone');
    if (!fz) return;
    fz.style.width = playerData.fireZone.w + 'px';
    fz.style.height = playerData.fireZone.h + 'px';
}

/* ============================================================
   НАСТРОЙКИ — инициализация
   ============================================================ */
function initSettings() {
    document.getElementById('set-sens').value = playerData.sensitivity;
    document.getElementById('set-sens-val').textContent = playerData.sensitivity;
    document.getElementById('set-sound').checked = playerData.soundEnabled;
    document.getElementById('set-vibe').checked = playerData.vibeEnabled;
    document.getElementById('set-debug').checked = playerData.showDebug;
    document.getElementById('set-bots-weapons').checked = playerData.botsHaveWeapons;
    document.getElementById('set-fz-w').value = playerData.fireZone.w;
    document.getElementById('set-fz-w-val').textContent = playerData.fireZone.w;
    document.getElementById('set-fz-h').value = playerData.fireZone.h;
    document.getElementById('set-fz-h-val').textContent = playerData.fireZone.h;
    document.getElementById('set-btnsize').value = playerData.buttonSize;
    document.getElementById('set-btnsize-val').textContent = playerData.buttonSize + '%';
    document.getElementById('set-btnopacity').value = playerData.buttonOpacity;
    document.getElementById('set-btnopacity-val').textContent = playerData.buttonOpacity + '%';

    const ch = playerData.crosshair;
    document.getElementById('ch-color').value = ch.color;
    document.getElementById('ch-thickness').value = ch.thickness;
    document.getElementById('ch-thickness-val').textContent = ch.thickness;
    document.getElementById('ch-length').value = ch.length;
    document.getElementById('ch-length-val').textContent = ch.length;
    document.getElementById('ch-style').value = ch.style;

    updateCrosshairPreview();
    updateDebugVisibility();
}

/* ============================================================
   ПРЕВЬЮ ПРИЦЕЛА
   ============================================================ */
function updateCrosshairPreview() {
    const ch = playerData.crosshair;
    const p = document.getElementById('ch-preview');
    if (!p) return;
    p.style.setProperty('--cc', ch.color);
    let h = '';
    if (ch.style === 'cross') {
        h = '<div class="ch-h" style="width:' + ch.thickness + 'px;height:' + ch.length + 'px"></div>' +
            '<div class="ch-v" style="width:' + ch.length + 'px;height:' + ch.thickness + 'px"></div>';
    } else if (ch.style === 'dot') {
        h = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:' + (ch.thickness + 2) + 'px;height:' + (ch.thickness + 2) + 'px;background:' + ch.color + ';border-radius:50%"></div>';
    } else if (ch.style === 'cross-dot') {
        h = '<div class="ch-h" style="width:' + ch.thickness + 'px;height:' + ch.length + 'px"></div>' +
            '<div class="ch-v" style="width:' + ch.length + 'px;height:' + ch.thickness + 'px"></div>' +
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:' + (ch.thickness + 2) + 'px;height:' + (ch.thickness + 2) + 'px;background:' + ch.color + ';border-radius:50%"></div>';
    } else if (ch.style === 'circle') {
        h = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:' + ch.length + 'px;height:' + ch.length + 'px;border:' + ch.thickness + 'px solid ' + ch.color + ';border-radius:50%"></div>';
    }
    p.innerHTML = h;
}

/* ============================================================
   ОБРАБОТЧИКИ НАСТРОЕК
   ============================================================ */
document.getElementById('set-sens').addEventListener('input', e => {
    playerData.sensitivity = +e.target.value;
    document.getElementById('set-sens-val').textContent = playerData.sensitivity;
    saveProfile();
});
document.getElementById('set-sound').addEventListener('change', e => {
    playerData.soundEnabled = e.target.checked;
    saveProfile();
});
document.getElementById('set-vibe').addEventListener('change', e => {
    playerData.vibeEnabled = e.target.checked;
    saveProfile();
});
document.getElementById('set-debug').addEventListener('change', e => {
    playerData.showDebug = e.target.checked;
    updateDebugVisibility();
    saveProfile();
});
document.getElementById('set-bots-weapons').addEventListener('change', e => {
    playerData.botsHaveWeapons = e.target.checked;
    saveProfile();
});
document.getElementById('set-fz-w').addEventListener('input', e => {
    playerData.fireZone.w = +e.target.value;
    document.getElementById('set-fz-w-val').textContent = playerData.fireZone.w;
    applyFireZone();
    saveProfile();
});
document.getElementById('set-fz-h').addEventListener('input', e => {
    playerData.fireZone.h = +e.target.value;
    document.getElementById('set-fz-h-val').textContent = playerData.fireZone.h;
    applyFireZone();
    saveProfile();
});
document.getElementById('set-btnsize').addEventListener('input', e => {
    playerData.buttonSize = +e.target.value;
    document.getElementById('set-btnsize-val').textContent = playerData.buttonSize + '%';
    applyButtonSettings();
    saveProfile();
});
document.getElementById('set-btnopacity').addEventListener('input', e => {
    playerData.buttonOpacity = +e.target.value;
    document.getElementById('set-btnopacity-val').textContent = playerData.buttonOpacity + '%';
    applyButtonSettings();
    saveProfile();
});
document.getElementById('ch-color').addEventListener('change', e => {
    playerData.crosshair.color = e.target.value;
    applyCrosshair();
    updateCrosshairPreview();
    saveProfile();
});
document.getElementById('ch-thickness').addEventListener('input', e => {
    playerData.crosshair.thickness = +e.target.value;
    document.getElementById('ch-thickness-val').textContent = e.target.value;
    applyCrosshair();
    updateCrosshairPreview();
    saveProfile();
});
document.getElementById('ch-length').addEventListener('input', e => {
    playerData.crosshair.length = +e.target.value;
    document.getElementById('ch-length-val').textContent = e.target.value;
    applyCrosshair();
    updateCrosshairPreview();
    saveProfile();
});
document.getElementById('ch-style').addEventListener('change', e => {
    playerData.crosshair.style = e.target.value;
    applyCrosshair();
    updateCrosshairPreview();
    saveProfile();
});

function updateDebugVisibility() {
    const e = document.getElementById('debug-hud');
    if (e) e.style.display = playerData.showDebug ? 'block' : 'none';
}

/* ============================================================
   ПРИМЕНЕНИЕ РАЗМЕРОВ КНОПОК
   ============================================================ */
function applyButtonSettings() {
    const m = playerData.buttonSize / 100;
    document.querySelectorAll('#hud .ctrl-btn').forEach(b => {
        if (b.style.width && !b.classList.contains('small') && !b.classList.contains('medium') && !b.classList.contains('big')) return;
        let w = 38;
        if (b.classList.contains('medium')) w = 48;
        else if (b.classList.contains('big')) w = 62;
        b.style.width = (w * m) + 'px';
        b.style.height = (w * m) + 'px';
    });
    if (playerData.buttonLayout) {
        Object.entries(playerData.buttonLayout).forEach(([id, p]) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.left = p.x + 'px';
                el.style.top = p.y + 'px';
                el.style.right = 'auto';
                el.style.bottom = 'auto';
                if (p.size) {
                    el.style.width = p.size + 'px';
                    el.style.height = p.size + 'px';
                }
            }
        });
    }
}

/* ============================================================
   РЕДАКТОР КНОПОК
   ============================================================ */
let editorState = { active: false, selected: null, dragging: null, layout: {} };
const EDITOR_BTNS = ['minimap', 'fire-zone', 'joy-move', 'btn-fire', 'btn-aim', 'btn-jump', 'btn-crouch', 'btn-reload', 'btn-swap', 'btn-pause', 'btn-fullscreen', 'btn-plant', 'btn-defuse'];
const BTN_LABELS = {
    'minimap': 'МИНИКАРТА',
    'fire-zone': 'ЗОНА СТРЕЛЬБЫ',
    'joy-move': 'ДЖОЙСТИК',
    'btn-fire': 'ОГОНЬ',
    'btn-aim': 'ПРИЦЕЛ',
    'btn-jump': 'ПРЫЖОК',
    'btn-crouch': 'ПРИСЕД',
    'btn-reload': 'ПЕРЕЗАР',
    'btn-swap': 'СМЕНА',
    'btn-pause': 'ПАУЗА',
    'btn-fullscreen': 'ФУЛЛСКРИН',
    'btn-plant': 'PLANT',
    'btn-defuse': 'DEFUSE'
};

function openButtonEditor() {
    editorState.active = true;
    editorState.layout = {};
    editorState.selected = null;
    const ed = document.getElementById('button-editor');
    ed.classList.add('active');
    ed.innerHTML = '<div class="editor-hint">Тапни кнопку • Тяни • +/- размер</div><div class="editor-info" id="editor-info">—</div>';

    EDITOR_BTNS.forEach(id => {
        const s = document.getElementById(id);
        if (!s || s.offsetParent === null) return;
        const r = s.getBoundingClientRect();
        const c = document.createElement('div');
        c.className = 'editor-btn' + ((id === 'minimap' || id === 'fire-zone') ? ' rect' : '');
        c.dataset.id = id;
        c.style.left = r.left + 'px';
        c.style.top = r.top + 'px';
        c.style.width = r.width + 'px';
        c.style.height = r.height + 'px';
        c.textContent = BTN_LABELS[id].slice(0, 9);
        editorState.layout[id] = { x: Math.round(r.left), y: Math.round(r.top), size: Math.round(r.width) };
        ed.appendChild(c);
    });

    const sp = document.createElement('div');
    sp.className = 'editor-size-controls';
    sp.innerHTML = '<button id="ed-size-down">−</button><span class="editor-size-label">РАЗМЕР: <span id="ed-size-label">—</span></span><button id="ed-size-up">+</button>';
    ed.appendChild(sp);
    document.getElementById('ed-size-down').onclick = () => changeSize(-6);
    document.getElementById('ed-size-up').onclick = () => changeSize(6);

    const tb = document.createElement('div');
    tb.className = 'editor-toolbar';
    tb.innerHTML = '<button id="ed-cancel">ОТМЕНА</button><button class="primary" id="ed-save">СОХРАНИТЬ</button>';
    ed.appendChild(tb);
    document.getElementById('ed-cancel').onclick = closeButtonEditor;
    document.getElementById('ed-save').onclick = saveButtonEditor;

    ed.querySelectorAll('.editor-btn').forEach(b => {
        b.addEventListener('pointerdown', e => startDragEditor(e, b.dataset.id));
        b.addEventListener('touchstart', e => startDragEditor(e, b.dataset.id), { passive: false });
    });
}

function selectEditorBtn(id) {
    editorState.selected = id;
    document.querySelectorAll('.editor-btn').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
    const l = document.getElementById('ed-size-label');
    const info = document.getElementById('editor-info');
    if (l && editorState.layout[id]) l.textContent = Math.round(editorState.layout[id].size) + 'px';
    if (info) {
        info.textContent = 'ВЫБРАНО: ' + BTN_LABELS[id];
        info.classList.add('show');
    }
    const sc = document.querySelector('.editor-size-controls');
    if (sc) sc.classList.add('show');
}

function changeSize(d) {
    if (!editorState.selected) return;
    const el = document.querySelector('.editor-btn[data-id="' + editorState.selected + '"]');
    if (!el) return;
    const c = editorState.layout[editorState.selected].size;
    const n = Math.max(30, Math.min(300, c + d));
    el.style.width = n + 'px';
    el.style.height = n + 'px';
    editorState.layout[editorState.selected].size = n;
    const l = document.getElementById('ed-size-label');
    if (l) l.textContent = n + 'px';
}

function startDragEditor(e, id) {
    e.preventDefault();
    e.stopPropagation();
    selectEditorBtn(id);
    const t = e.touches ? e.touches[0] : e;
    const el = document.querySelector('.editor-btn[data-id="' + id + '"]');
    if (!el) return;
    editorState.dragging = { id, ox: t.clientX - el.offsetLeft, oy: t.clientY - el.offsetTop };
}

function editorMoveHandler(e) {
    if (!editorState.active || !editorState.dragging) return;
    const t = e.touches ? e.touches[0] : e;
    const el = document.querySelector('.editor-btn[data-id="' + editorState.dragging.id + '"]');
    if (el) {
        const nx = t.clientX - editorState.dragging.ox;
        const ny = t.clientY - editorState.dragging.oy;
        el.style.left = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, nx)) + 'px';
        el.style.top = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, ny)) + 'px';
        editorState.layout[editorState.dragging.id].x = Math.round(parseFloat(el.style.left));
        editorState.layout[editorState.dragging.id].y = Math.round(parseFloat(el.style.top));
    }
    e.preventDefault();
}
document.addEventListener('touchmove', editorMoveHandler, { passive: false });
document.addEventListener('mousemove', editorMoveHandler);
document.addEventListener('touchend', () => { editorState.dragging = null; });
document.addEventListener('mouseup', () => { editorState.dragging = null; });

function closeButtonEditor() {
    editorState.active = false;
    document.getElementById('button-editor').classList.remove('active');
}
function saveButtonEditor() {
    const l = {};
    Object.entries(editorState.layout).forEach(([id, p]) => {
        const el = document.querySelector('.editor-btn[data-id="' + id + '"]');
        if (el) {
            l[id] = {
                x: Math.round(parseFloat(el.style.left) || 0),
                y: Math.round(parseFloat(el.style.top) || 0),
                size: el.offsetWidth
            };
        }
    });
    playerData.buttonLayout = l;
    saveProfile();
    applyButtonLayout();
    closeButtonEditor();
    myAlert('Расположение сохранено!', 'ГОТОВО');
}
function applyButtonLayout() {
    if (!playerData.buttonLayout) return;
    Object.entries(playerData.buttonLayout).forEach(([id, p]) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.left = p.x + 'px';
            el.style.top = p.y + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.width = p.size + 'px';
            el.style.height = p.size + 'px';
        }
    });
}

/* ============================================================
   ОБРАБОТЧИКИ КНОПОК НАСТРОЕК
   ============================================================ */
document.getElementById('btn-open-editor').addEventListener('click', openButtonEditor);
document.getElementById('btn-reset-layout').addEventListener('click', async () => {
    const ok = await myConfirm('Сбросить расположение?', 'СБРОС');
    if (!ok) return;
    playerData.buttonLayout = null;
    playerData.buttonSize = 100;
    playerData.buttonOpacity = 72;
    saveProfile();
    document.querySelectorAll('#hud .ctrl-btn, #joy-move, #minimap, #fire-zone').forEach(b => {
        b.style.left = '';
        b.style.top = '';
        b.style.right = '';
        b.style.bottom = '';
        b.style.width = '';
        b.style.height = '';
    });
    applyButtonSettings();
    initSettings();
});
document.getElementById('btn-reset-data').addEventListener('click', async () => {
    const ok = await myConfirm('СБРОСИТЬ ВСЁ?', 'ВНИМАНИЕ');
    if (!ok) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
});

/* ============================================================
   ОВЕРЛЕИ — ЗАКРЫТИЕ
   ============================================================ */
function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
function openOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}
window.closeOverlay = closeOverlay;
window.openOverlay = openOverlay;
document.querySelectorAll('.overlay-close').forEach(b => {
    b.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        closeOverlay(b.dataset.close);
    });
});

/* ============================================================
   ПРОФИЛЬ — аватар, ID, имя, награда
   ============================================================ */
const av = document.getElementById('avatar-input');
document.getElementById('avatar').addEventListener('click', () => av.click());
av.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
        playerData.avatar = ev.target.result;
        updateProfileUI();
        saveProfile();
    };
    r.readAsDataURL(f);
});
document.getElementById('p-id').addEventListener('click', async () => {
    const n = await myPrompt('ID (до 12):', playerData.playerId, 'ID', 12);
    if (n) {
        playerData.playerId = n.slice(0, 12);
        updateProfileUI();
        saveProfile();
    }
});
document.getElementById('p-name').addEventListener('click', async () => {
    const n = await myPrompt('Имя (до 20):', playerData.playerName, 'ИМЯ', 20);
    if (n) {
        playerData.playerName = n.slice(0, 20);
        updateProfileUI();
        saveProfile();
    }
});
document.getElementById('get-reward-btn').addEventListener('click', async () => {
    const now = Date.now();
    if (now - playerData.lastDailyReward < 86400000) {
        const h = Math.ceil((86400000 - (now - playerData.lastDailyReward)) / 3600000);
        await myAlert('Через ' + h + ' ч.', 'ПОДОЖДИТЕ');
        return;
    }
    const r = 500 + Math.floor(Math.random() * 500);
    playerData.money += r;
    playerData.lastDailyReward = now;
    saveProfile();
    await myAlert('Получено ' + r + '$!', 'НАГРАДА');
});
