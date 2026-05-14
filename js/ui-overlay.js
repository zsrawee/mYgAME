export default class UIOverlay {
    constructor(scene) {
        this.scene = scene;
        this.state = { left: false, right: false, jump: false, dash: false };
        this.justPressed = { jump: false, dash: false };
        this._visible = false;
        this._touchBound = false;
        this.setup();
    }

    setup() {
        const g = id => document.getElementById(id);
        this.el = {
            overlay: g('ui-overlay'),
            levelName: g('level-name'),
            deathCount: g('death-count'),
            hint: g('hint-text'),
            touch: g('touch-controls'),
            roomEnter: g('room-enter-btn'),
            orientation: g('orientation-overlay'),
        };
    }

    show(isMobile) {
        if (this._visible) return;
        this._visible = true;
        this.el.overlay.classList.remove('hidden');
        this.el.levelName.classList.remove('hidden');
        this.el.deathCount.classList.remove('hidden');
        if (isMobile) {
            this.el.touch.classList.remove('hidden');
            this.bindTouch();
        }
    }

    hide() {
        this._visible = false;
        this.el.overlay.classList.add('hidden');
        this.unbindTouch();
    }

    setLevelName(text) { if (this.el.levelName) this.el.levelName.textContent = text; }
    setDeathCount(n) { if (this.el.deathCount) this.el.deathCount.textContent = `الوفيات: ${n}`; }

    showHint(text) {
        if (this.el.hint) {
            this.el.hint.textContent = text;
            this.el.hint.classList.remove('hidden');
        }
    }

    hideHint() { if (this.el.hint) this.el.hint.classList.add('hidden'); }

    showRoomEnter() { if (this.el.roomEnter) this.el.roomEnter.classList.remove('hidden'); }
    hideRoomEnter() { if (this.el.roomEnter) this.el.roomEnter.classList.add('hidden'); }

    onRoomEnter(cb) {
        if (this.el.roomEnter) {
            this.el.roomEnter.onclick = e => { e.preventDefault(); cb(); };
        }
    }

    showOrientation(isPortrait) {
        if (this.el.orientation) {
            this.el.orientation.style.display = isPortrait ? 'flex' : 'none';
        }
    }

    bindTouch() {
        if (this._touchBound) return;
        this._touchBound = true;
        const btns = {
            left: document.getElementById('btn-left'),
            right: document.getElementById('btn-right'),
            jump: document.getElementById('btn-jump'),
            dash: document.getElementById('btn-dash'),
        };
        const down = (key, e) => {
            if (e.cancelable) e.preventDefault();
            this.state[key] = true;
            if (key === 'jump' || key === 'dash') this.justPressed[key] = true;
            btns[key]?.classList.add('active');
        };
        const up = (key, e) => {
            if (e.cancelable) e.preventDefault();
            this.state[key] = false;
            btns[key]?.classList.remove('active');
        };
        for (const key of ['left', 'right', 'jump', 'dash']) {
            const el = btns[key];
            if (!el) continue;
            el.addEventListener('pointerdown', down.bind(null, key));
            el.addEventListener('pointerup', up.bind(null, key));
            el.addEventListener('pointercancel', up.bind(null, key));
            el.addEventListener('pointerleave', up.bind(null, key));
        }
    }

    unbindTouch() { this._touchBound = false; }

    destroy() {
        this.unbindTouch();
        this.hide();
    }
}
