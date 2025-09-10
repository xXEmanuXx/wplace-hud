// ==UserScript==
// @name         WPlace Hud
// @namespace    https://github.com/xXEmanuXx/wplace-hud
// @version      0.3.0
// @description  HUD for wplace with various information
// @author       Ema
// @match        https://wplace.live/*
// @icon
// @run-at       document-start
// @grant        GM_getResourceText
// @resource     hudHtml https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/template/hud.html
// @resource     hudCss https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/style/hud.css
// @require      https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/lib/hud.js
// @require      https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/lib/timer.js
// @require      https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/lib/utils.js
// @updateURL    https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// @downloadURL  https://raw.githubusercontent.com/xXEmanuXx/wplace-hud/main/src/wplace-hud.user.js
// ==/UserScript==

(async function main() {
    const url = "https://backend.wplace.live/me";
    const hud = initHud();
    let data = {};

    try {
        data = await getJson(url);
    } catch (e) {
        console.error('[wplace-hud] fetch /me failed: ', e);
    }

    const model = {
        name: data.name,
        level: data.level,
        charges: {
            current: data.charges.count,
            max: data.charges.max,
            cd: data.charges.cooldownMs
        },
        droplets: data.droplets,
        pixels: data.pixelsPainted
    };

    hud.updateHud(model);
    hud.updateCharges(model);

    let nextPixelTimer = null;
    buildNextPixelTimer();

    const maxPixelTimer = startTimer(model.charges.current, model.charges.max, model.charges.cd, (msToMax) => {
        if (msToMax > 0) {
            hud.elements.etaMaxCharge.textContent = fmt(msToMax);
            hud.shadow.getElementById('maxCharge').querySelector('.label').textContent = 'until full';
        }
        else {
            hud.elements.etaMaxCharge.textContent = 'Full!';
            hud.shadow.getElementById('maxCharge').querySelector('.label').textContent = '';
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') catchUpNextPixel();
    });
    window.addEventListener('focus', catchUpNextPixel);
    window.addEventListener('pageshow', catchUpNextPixel);
})();