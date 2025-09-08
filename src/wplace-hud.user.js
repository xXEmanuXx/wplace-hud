// ==UserScript==
// @name         WPlace Hud
// @namespace    https://github.com/xXEmanuXx/wplace-hud
// @version      0.2.0
// @description  HUD for wplace with various information
// @author       Ema
// @match        https://wplace.live/*
// @icon
// @run-at       document-start
// @grant        GM_getResourceText
// @resource     hudHtml https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/templates/hud.html
// @resource     hudCss https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/styles/hud.css
// @updateURL    https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// @downloadURL  https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// ==/UserScript==

function initHud() {
    const host = document.createElement('div');
    host.id = 'wplace-hud-root';
    const shadow = host.attachShadow({mode: 'open'});

    const style = document.createElement('style');
    style.textContent = GM_getResourceText('hudCss');
    shadow.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = GM_getResourceText('hudHtml');
    shadow.appendChild(template.content.cloneNode(true));

    const hud = shadow.getElementById('hud');
    const btns = shadow.querySelectorAll(".btn");
    const elements = {
        name: shadow.getElementById('name'),
        level: shadow.getElementById('level'),
        currCharges: shadow.getElementById('currCharges'),
        maxCharges: shadow.getElementById('maxCharges'),
        droplets: shadow.getElementById('droplets'),
        pixels: shadow.getElementById('pixels'),
    };

    function setCollapsed(value) {
        hud.classList.toggle('is-collapsed', value)
        btns.forEach(btn => {
            btn.textContent = value ? "Show" : "Hide";
        });
    }

    function updateHud(data = {}) {
        elements.name.textContent = data.name ?? '-';
        elements.level.textContent = Math.trunc(data.level) ?? '-';
        elements.currCharges.textContent = Math.trunc(data.charges.count) ?? '-';
        elements.maxCharges.textContent = data.charges.max ?? '-';
        elements.droplets.textContent = data.droplets ?? '-';
        elements.pixels.textContent = data.pixelsPainted ?? '-';
    }

    btns.forEach(btn => btn.addEventListener('click', () => {
        setCollapsed(!hud.classList.contains('is-collapsed'));
    }));

    setCollapsed(false);

    document.documentElement.appendChild(host);

    const api = {
        host,
        shadow,
        elements,
        setCollapsed,
        updateHud
    };

    return api;
}

async function getJson(url, { params = {}, headers = {}, timeoutMs = 8000} = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const result = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include',
            signal: controller.signal
        });

        if (!result.ok) {
            throw new Error(`HTTP ${result.status} ${result.statusText}`);
        }

        return await result.json();
    } finally {
        clearTimeout(timeout);
    }
}


(async function main() {
    const hud = initHud();
    const url = "https://backend.wplace.live/me";
    var data = {};

    try {
        data = await getJson(url);
    } catch (e) {
        console.error('[wplace-hud] fetch /me failed:', e);
    }

    hud.updateHud(data);
})();