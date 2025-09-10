function startTimer(start, end, rate, onTick, onDone, {intervalMs = 1000} = {}) {
    const state = {
        t0: performance.now(),
        raf: 0,
        to: 0,
        running: false,
    };

    function computeTime(now) {
        const gained = (now - state.t0) / rate;
        const current = Math.min(end, start + gained); // possible change to let start+gained to be greater than end to update charges
        //const msToMax = ((max - Math.floor(current) + 1) + (1 - frac)) * cooldown;

        const msToMax = (end - current) * rate;
        const done = current >= end;

        return {msToMax, done};
    }

    function loop(now) {
        if (!state.running) {
            return;
        }

        const payload = computeTime(now);
        onTick(payload.msToMax);

        if (payload.done) {
            if (typeof onDone === 'function') {
                onDone();
            }
            stop();
            return;
        }

        let delay = intervalMs;
        if (Number.isFinite(payload.msToMax)) {
            const rem = payload.msToMax % 1000;
            delay = rem == 0 ? 1000 : rem;
        }

        if (document.visibilityState === 'hidden') {
            if (state.raf) {
                cancelAnimationFrame(state.raf); 
                state.raf = 0;
            }
            state.to && clearTimeout(state.to);
            state.to = setTimeout(() => loop(performance.now()), delay);
        }
        else {
            if (state.to) {
                clearTimeout(state.to);
                state.to = 0;
            }
            const target = now + delay;
            const tick = (t) => (t >= target - 8) ? loop(t) : requestAnimationFrame(tick);
            state.raf = requestAnimationFrame(tick);
        }
    }

    function run() {
        if (state.running) {
            return;
        }

        state.running = true;
        if (document.visibilityState === 'hidden') {
            state.to = setTimeout(() => loop(performance.now()), 0);
        } 
        else {
            state.raf = requestAnimationFrame(loop);
        }
    }

    function stop() {
        state.running = false;
        if (state.raf) {
            cancelAnimationFrame(state.raf);
            state.raf = 0;
        }
    }

    run();

    return {run, stop, inspect: () => ({start, rate, t0: state.t0})};
}