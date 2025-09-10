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
        etaMaxCharge: shadow.getElementById('etaMaxCharge'),
        droplets: shadow.getElementById('droplets'),
        pixels: shadow.getElementById('pixels'),
    };

    function setCollapsed(value) {
        hud.classList.toggle('is-collapsed', value)
        btns.forEach(btn => {
            btn.textContent = value ? "Show" : "Hide";
        });
    }

    function updateHud(model) {
        elements.name.textContent = model.name ?? '-';
        elements.level.textContent = Math.trunc(model.level) ?? '-';
        elements.droplets.textContent = model.droplets ?? '-';
        elements.pixels.textContent = model.pixels ?? '-';
    }

    function updateCharges(model) {
        elements.currCharges.textContent = String(Math.floor(model.charges.current));
        elements.maxCharges.textContent = String(model.charges.max);
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
        updateHud,
        updateCharges
    };

    return api;
}