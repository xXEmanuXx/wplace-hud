// ==UserScript==
// @name         WPlace Hud
// @namespace    https://github.com/xXEmanuXx/wplace-hud
// @version      0.1.1
// @description  HUD for wplace with various information
// @author       Ema
// @match        https://wplace.live
// @icon
// @run-at       document-start
// @grant        GM_getResourceText
// @resource     hudHtml https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/templates/hud.html
// @resource     hudCss https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/styles/hud.css
// @updateURL    https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// @downloadURL  https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// ==/UserScript==

(function initHud(){
    if (window.wplaceHud) return;

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
    const btn = shadow.querySelector(".btn-toggle");

    function setCollapsed(value) {
        hud.classList.toggle('is-collapsed', value)
        btn.textContent = value ? "Show" : "Hide";
    }

    btn.addEventListener('click', () => {
        setCollapsed(!hud.classList.contains('is-collapsed'));
    });

    setCollapsed(false);

    document.documentElement.appendChild(host);
})();

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

        return await result.json()
    } finally {
        clearTimeout(timeout)
    }
}

const url = "https://backend.wplace.live/me";
const data = await getJson(url);