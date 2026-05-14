export default class TouchControls {
    constructor(scene, zones, bottomY, uiLayer) {
        this.scene = scene;
        this.zones = zones;
        this.bottomY = bottomY;
        this.uiLayer = uiLayer;

        this.state = { left: false, right: false, jump: false, dash: false };
        this.justPressed = { jump: false, dash: false };
        this.pointers = { left: new Set(), right: new Set(), jump: new Set(), dash: new Set() };

        this.buttons = {};
        this.createButtons();
        this.bindEvents();
    }

    createButtons() {
        const { scene, zones, bottomY, uiLayer } = this;
        const mkBtn = (z, label, color) => {
            const bg = scene.add.circle(z.x, bottomY, z.r, color, 0.35)
                .setStrokeStyle(2, color, 0.8).setDepth(100);
            const txt = scene.add.text(z.x, bottomY, label, {
                fontSize: '14px', color: '#fff', fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(101);
            uiLayer.add([bg, txt]);
            return { bg, txt };
        };
        this.buttons.left = mkBtn(zones.left, '←', 0xffffff);
        this.buttons.right = mkBtn(zones.right, '→', 0xffffff);
        this.buttons.jump = mkBtn(zones.jump, 'JUMP', 0x4488ff);
        this.buttons.dash = mkBtn(zones.dash, 'DASH', 0x00ff00);
    }

    bindEvents() {
        const { scene } = this;
        scene.input.on('pointerdown', p => this.onPointerDown(p));
        scene.input.on('pointerup', p => this.onPointerUp(p));
        scene.input.on('pointercancel', p => this.onPointerUp(p));
    }

    onPointerDown(pointer) {
        const { zones, bottomY } = this;
        for (const [key, z] of Object.entries(zones)) {
            const dx = pointer.x - z.x;
            const dy = pointer.y - bottomY;
            if (dx * dx + dy * dy <= z.r * z.r) {
                this.pointers[key].add(pointer.id);
                if (key === 'jump') this.justPressed.jump = true;
                if (key === 'dash') this.justPressed.dash = true;
                this.updateVisuals();
                break;
            }
        }
    }

    onPointerUp(pointer) {
        for (const key of Object.keys(this.zones)) {
            if (this.pointers[key].has(pointer.id)) {
                this.pointers[key].delete(pointer.id);
                this.updateVisuals();
                break;
            }
        }
    }

    updateVisuals() {
        this.state.left = this.pointers.left.size > 0;
        this.state.right = this.pointers.right.size > 0;
        this.state.jump = this.pointers.jump.size > 0;
        this.state.dash = this.pointers.dash.size > 0;

        const setV = (btn, active) => {
            btn.bg.setAlpha(active ? 0.8 : 0.35).setScale(active ? 0.9 : 1);
        };
        setV(this.buttons.left, this.state.left);
        setV(this.buttons.right, this.state.right);
        setV(this.buttons.jump, this.state.jump);
        setV(this.buttons.dash, this.state.dash);
    }

    destroy() {
        const { scene } = this;
        scene.input.off('pointerdown', this.onPointerDown, this);
        scene.input.off('pointerup', this.onPointerUp, this);
        scene.input.off('pointercancel', this.onPointerUp, this);
    }
}
