/* ============================================================
   UI.JS — магазин, кейсы, инвентарь, кланы, слоты оружия
   ============================================================ */

/* ============================================================
   СЛОТЫ ОРУЖИЯ
   ============================================================ */
function applySlot() {
    let id;
    if (state.currentSlot === 'primary') id = playerData.equippedWeapon;
    else if (state.currentSlot === 'pistol') id = playerData.equippedPistol;
    else if (state.currentSlot === 'knife') id = playerData.equippedKnife;
    else if (state.currentSlot === 'bomb') {
        createBombViewModel();
        return;
    }
    if (!playerData.ownedWeapons.includes(id)) return;
    createWeaponModel(id);
    const w = WEAPONS[id];
    if (w.isMelee) {
        state.magAmmo = 0;
        state.reserveAmmo = 0;
    } else {
        state.magAmmo = w.magSize;
        state.reserveAmmo = w.reserveMax;
    }
    updateAmmoUI();
    if (id !== 'awp') {
        document.getElementById('awp-scope').classList.remove('active');
        state.isAiming = false;
        document.getElementById('crosshair').style.opacity = '0.95';
        state.camera.fov = 80;
        state.camera.updateProjectionMatrix();
    }
}
function getActiveWeaponId() {
    if (state.currentSlot === 'primary') return playerData.equippedWeapon;
    if (state.currentSlot === 'pistol') return playerData.equippedPistol;
    if (state.currentSlot === 'knife') return playerData.equippedKnife;
    return playerData.equippedWeapon;
}
function getActiveWeapon() {
    return WEAPONS[getActiveWeaponId()];
}

/* ============================================================
   МАГАЗИН
   ============================================================ */
function renderShop() {
    const g = document.getElementById('shop-grid');
    if (!g) return;
    g.innerHTML = '';
    document.getElementById('shop-balance').textContent = playerData.money;
    const order = ['glock', 'dualies', 'deagle', 'fnfal', 'akr', 'fabm', 'awp'];
    order.forEach(id => {
        const w = WEAPONS[id];
        const owned = playerData.ownedWeapons.includes(id);
        const eq = playerData.equippedWeapon === id ||
                   playerData.equippedPistol === id ||
                   playerData.equippedKnife === id;
        const card = document.createElement('div');
        card.className = 'shop-item' + (owned ? ' owned' : '') + (eq ? ' equipped' : '');
        card.innerHTML =
            (eq ? '<div class="si-badge eq">✔</div>' : (owned ? '<div class="si-badge ow">КУПЛЕНО</div>' : '')) +
            '<div class="si-icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg></div>' +
            '<div class="si-name">' + w.name + '</div>' +
            '<div class="si-type">' + ({ pistol: 'ПИСТОЛЕТ', rifle: 'ВИНТОВКА', sniper: 'СНАЙПЕРСКАЯ', shotgun: 'ДРОБОВИК' }[w.type] || '') + '</div>' +
            '<div class="si-price">' + (owned ? '✔ В наличии' : w.price + ' $') + '</div>';
        card.onclick = async () => {
            if (owned) {
                equipWeaponById(id);
                await myAlert(w.name + ' экипирован!', 'ОРУЖИЕ');
                return;
            }
            if (playerData.money < w.price) {
                await myAlert('Не хватает денег!', 'МАГАЗИН');
                return;
            }
            const ok = await myConfirm('Купить ' + w.name + ' за ' + w.price + '$?', 'ПОКУПКА');
            if (!ok) return;
            playerData.money -= w.price;
            playerData.ownedWeapons.push(id);
            saveProfile();
            renderShop();
            updateProfileUI();
            await myAlert('Куплено! ' + w.name, 'МАГАЗИН');
        };
        g.appendChild(card);
    });
}
function equipWeaponById(id) {
    const w = WEAPONS[id];
    if (w.type === 'pistol') playerData.equippedPistol = id;
    else if (w.type === 'knife') playerData.equippedKnife = id;
    else playerData.equippedWeapon = id;
    saveProfile();
    renderShop();
    if (state.scene) {
        state.currentSlot = w.type === 'pistol' ? 'pistol' : (w.type === 'knife' ? 'knife' : 'primary');
        applySlot();
    }
}

/* ============================================================
   КЕЙСЫ
   ============================================================ */
function renderCases() {
    const g = document.getElementById('cases-grid');
    if (!g) return;
    g.innerHTML = '';
    document.getElementById('cases-balance').textContent = playerData.money;
    Object.entries(CASES).forEach(([k, c]) => {
        const isFree = k === 'free_case';
        const freeOk = isFree ? (Date.now() - playerData.lastFreeCase > 3600000) : true;
        const can = isFree ? freeOk : (playerData.money >= c.price);
        const card = document.createElement('div');
        card.className = 'case-card';
        card.style.opacity = can ? '1' : '.55';
        card.innerHTML =
            '<div class="case-icon"><svg viewBox="0 0 24 24" style="color:' + (isFree ? '#4f4' : '#fa0') + '"><path fill="currentColor" d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg></div>' +
            '<div class="case-name">' + c.name + '</div>' +
            '<div class="case-price">' + (isFree ? '<span style="color:#4f4">БЕСПЛАТНО</span>' : c.price + ' $') + '</div>';
        card.onclick = () => {
            if (!can) {
                myAlert(isFree ? 'Раз в час!' : 'Мало денег!', 'КЕЙС');
                return;
            }
            openCase(k);
        };
        g.appendChild(card);
    });
}
function openCase(k) {
    const c = CASES[k];
    const isFree = k === 'free_case';
    if (isFree) playerData.lastFreeCase = Date.now();
    else playerData.money -= c.price;
    saveProfile();
    document.getElementById('cases-balance').textContent = playerData.money;
    const win = pickWinner(c.skins);
    const items = [];
    for (let i = 0; i < 40; i++) {
        if (i === 35) items.push(win);
        else items.push(c.skins[Math.floor(Math.random() * c.skins.length)]);
    }
    renderRoulette(items, win, c);
}
function pickWinner(pool) {
    const r = Math.random() * 100;
    let target = 'common', acc = 0;
    for (const [k, v] of Object.entries(RARITY)) {
        acc += v.chance;
        if (r < acc) { target = k; break; }
    }
    let cand = pool.filter(s => SKINS[s] && SKINS[s].rarity === target);
    if (!cand.length) cand = pool;
    return cand[Math.floor(Math.random() * cand.length)];
}
function renderRoulette(items, win, ci) {
    const strip = document.getElementById('roulette-strip');
    strip.innerHTML = '';
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    items.forEach(id => {
        const s = SKINS[id];
        const el = document.createElement('div');
        el.className = 'roulette-item ' + s.rarity;
        el.innerHTML = '<div class="ri-icon" style="color:' + s.color + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg></div>' +
                      '<div class="ri-name">' + s.name + '</div>';
        strip.appendChild(el);
    });
    document.getElementById('roulette-title').textContent = ci.name;
    document.getElementById('case-roulette').style.display = 'flex';
    document.getElementById('case-result').classList.remove('show');
    const w = 108, ti = 35;
    const tx = -(ti * w - (window.innerWidth / 2 - 50));
    const off = (Math.random() - .5) * 60;
    requestAnimationFrame(() => {
        strip.style.transition = 'transform 4s cubic-bezier(.15,.7,.3,1)';
        strip.style.transform = 'translateX(' + (tx + off) + 'px)';
    });
    setTimeout(() => {
        if (!playerData.ownedSkins.includes(win)) playerData.ownedSkins.push(win);
        saveProfile();
        const s = SKINS[win];
        const r = document.getElementById('case-result');
        r.className = s.rarity;
        r.querySelector('.result-icon').innerHTML = '<svg viewBox="0 0 24 24" style="color:' + s.color + '"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>';
        r.querySelector('.result-name').textContent = s.name;
        r.querySelector('.result-rarity').textContent = RARITY[s.rarity].name;
        r.classList.add('show');
    }, 4100);
}
document.getElementById('btn-close-roulette').addEventListener('click', () => {
    document.getElementById('case-roulette').style.display = 'none';
    renderCases();
});

/* ============================================================
   ИНВЕНТАРЬ
   ============================================================ */
let invFilter = 'all';
function renderInventory() {
    const g = document.getElementById('inventory-grid');
    if (!g) return;
    g.innerHTML = '';
    let sk = playerData.ownedSkins || [];
    if (invFilter !== 'all') sk = sk.filter(i => SKINS[i] && SKINS[i].rarity === invFilter);
    if (!sk.length) {
        g.innerHTML = '<div class="inv-empty" style="grid-column:1/-1">Инвентарь пуст</div>';
        return;
    }
    sk.forEach(id => {
        const s = SKINS[id];
        if (!s) return;
        const eq = playerData.equippedSkins[s.weapon] === id;
        const c = document.createElement('div');
        c.className = 'inv-item ' + s.rarity;
        c.innerHTML =
            (eq ? '<div class="inv-equipped">✔</div>' : '') +
            '<div class="inv-icon" style="color:' + s.color + '"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg></div>' +
            '<div class="inv-name">' + s.name + '</div>' +
            '<div class="inv-weapon">' + WEAPONS[s.weapon].name + '</div>' +
            '<div class="inv-rarity" style="color:' + s.color + '">' + RARITY[s.rarity].name + '</div>' +
            '<div class="inv-price">💰 ' + s.price + '$</div>';
        c.onclick = () => openSkinModal(id);
        g.appendChild(c);
    });
}
let currentSkinId = null;
function openSkinModal(id) {
    currentSkinId = id;
    const s = SKINS[id];
    if (!s) return;
    const m = document.getElementById('modal-skin');
    document.getElementById('skin-preview-icon').innerHTML = '<svg viewBox="0 0 24 24" style="color:' + s.color + '"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>';
    document.getElementById('skin-modal-name').textContent = s.name;
    document.getElementById('skin-modal-name').style.color = s.color;
    document.getElementById('skin-modal-weapon').textContent = WEAPONS[s.weapon].name;
    document.getElementById('skin-modal-rarity').textContent = RARITY[s.rarity].name;
    document.getElementById('skin-modal-rarity').style.color = s.color;
    document.getElementById('skin-modal-price').textContent = 'Цена продажи: ' + s.price + '$';
    document.getElementById('skin-modal-equip').textContent = playerData.equippedSkins[s.weapon] === id ? 'СНЯТЬ' : 'ВЫБРАТЬ';
    m.classList.add('show');
}
document.getElementById('skin-modal-cancel').addEventListener('click', () => {
    document.getElementById('modal-skin').classList.remove('show');
});
document.getElementById('skin-modal-equip').addEventListener('click', () => {
    const id = currentSkinId;
    if (!id) return;
    const s = SKINS[id];
    if (playerData.equippedSkins[s.weapon] === id) {
        delete playerData.equippedSkins[s.weapon];
        myAlert('Скин снят', 'ИНВЕНТАРЬ');
    } else {
        playerData.equippedSkins[s.weapon] = id;
        myAlert(s.name, 'ЭКИПИРОВАНО');
    }
    saveProfile();
    renderInventory();
    document.getElementById('modal-skin').classList.remove('show');
});
document.getElementById('skin-modal-sell').addEventListener('click', async () => {
    const id = currentSkinId;
    if (!id) return;
    const s = SKINS[id];
    document.getElementById('modal-skin').classList.remove('show');
    const ok = await myConfirm('Продать "' + s.name + '" за ' + s.price + '$?', 'ПРОДАЖА');
    if (!ok) return;
    const i = playerData.ownedSkins.indexOf(id);
    if (i > -1) playerData.ownedSkins.splice(i, 1);
    if (playerData.equippedSkins[s.weapon] === id) delete playerData.equippedSkins[s.weapon];
    playerData.money += s.price;
    saveProfile();
    renderInventory();
    updateProfileUI();
    myAlert('Продано за ' + s.price + '$!\nБаланс: ' + playerData.money + '$', 'ПРОДАЖА');
});
document.querySelectorAll('.inv-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.inv-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    invFilter = t.dataset.filter;
    renderInventory();
}));

/* ============================================================
   КЛАНЫ
   ============================================================ */
function renderClans() {
    const g = document.getElementById('clans-grid');
    if (!g) return;
    g.innerHTML = '';
    if (playerData.clanName) {
        const c = document.createElement('div');
        c.style.cssText = 'background:linear-gradient(135deg,rgba(40,30,10,.9),rgba(20,20,35,.9));border:2px solid ' + (playerData.clanColor || '#fa0') + ';border-radius:10px;padding:14px;max-width:500px;margin:0 auto 12px;width:100%;text-align:center';
        c.innerHTML = '<div style="font-size:16px;font-weight:bold;color:' + (playerData.clanColor || '#fa0') + ';letter-spacing:2px">' + playerData.clanName + '</div>' +
                      '<div style="font-size:11px;color:#888;margin:4px 0">' + (playerData.clanTag || '—') + '</div>' +
                      '<button id="btn-leave-clan" style="margin-top:8px;padding:8px 20px;background:#a22;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer">ПОКИНУТЬ</button>';
        g.appendChild(c);
        setTimeout(() => {
            const b = document.getElementById('btn-leave-clan');
            if (b) b.onclick = leaveClan;
        }, 0);
    } else {
        const e = document.createElement('div');
        e.style.cssText = 'text-align:center;color:#666;padding:20px;font-size:12px;width:100%';
        e.textContent = 'Вы не в клане';
        g.appendChild(e);
    }
    (playerData.customClans || []).forEach(c => {
        const i = document.createElement('div');
        i.className = 'clan-item';
        i.style.borderColor = playerData.clanTag === c.tag ? c.color : '#333';
        i.innerHTML = '<div class="ci-emblem" style="background:' + c.color + '">' + c.tag.replace(/[\[\]]/g, '').slice(0, 2) + '</div>' +
                      '<div class="ci-info"><div class="ci-name" style="color:' + c.color + '">' + c.name + '</div>' +
                      '<div class="ci-desc">' + c.tag + '</div></div>';
        i.onclick = () => joinClan(c);
        g.appendChild(i);
    });
}
function joinClan(c) {
    playerData.clanName = c.name;
    playerData.clanTag = c.tag;
    playerData.clanColor = c.color;
    saveProfile();
    renderClans();
    myAlert('Клан: ' + c.name, 'ВСТУПЛЕНИЕ');
}
function leaveClan() {
    playerData.clanName = null;
    playerData.clanTag = '—';
    playerData.clanColor = '#888';
    saveProfile();
    renderClans();
}
document.getElementById('btn-create-clan').addEventListener('click', async () => {
    const n = document.getElementById('clan-name-input').value.trim();
    const t = document.getElementById('clan-tag-input').value.trim().toUpperCase();
    if (n.length < 3 || n.length > 20) { await myAlert('Название: 3-20 символов', 'ОШИБКА'); return; }
    if (t.length < 2 || t.length > 5) { await myAlert('Тег: 2-5 символов', 'ОШИБКА'); return; }
    if (!playerData.customClans) playerData.customClans = [];
    const cs = ['#4f4', '#88f', '#f62', '#a4f', '#fa0', '#f44', '#4ff', '#ff4'];
    const c = { id: 'c_' + Date.now(), name: n, tag: '[' + t + ']', color: cs[Math.floor(Math.random() * cs.length)] };
    playerData.customClans.push(c);
    joinClan(c);
    document.getElementById('clan-name-input').value = '';
    document.getElementById('clan-tag-input').value = '';
});
