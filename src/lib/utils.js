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

function fmt(ms) {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const rs = s % 60;
    const rm = m % 60;
    const rh = h % 24;

    let format;
    if (d) {
        format = `${d}d ${String(rh).padStart(2, '0')}h ${String(rm).padStart(2, '0')}m ${String(rs).padStart(2, '0')}s`;
    }
    else if (h) {
        format = `${h}h ${String(rm).padStart(2, '0')}m ${String(rs).padStart(2, '0')}s`;
    }
    else if (m) {
        format = `${m}m ${String(rs).padStart(2, '0')}s`;
    }
    else {
        format = `${s}s`;
    }

    return format;
}

function buildNextPixelTimer() {
    const start = model.charges.current;
    const end = Math.floor(start) + 1;
    if (start >= model.charges.max) {
        return;
    }

    nextPixelTimer?.stop();
    nextPixelTimer = startTimer(start, end, model.charges.cd, (msToMax) => {
        console.log(fmt(msToMax))
    }, () => {
        model.charges.current = end;
        hud.updateCharges(model);
        buildNextPixelTimer();
    });
}

function catchUpNextPixel() {
    if (!nextPixelTimer) return;
    const {start, rate, t0} = nextPixelTimer.inspect();
    const now = performance.now();

    const predicted = Math.min(model.charges.max, start + (now - t0) / rate);
    model.charges.current = predicted;
    hud.updateCharges(model);

    buildNextPixelTimer();
}