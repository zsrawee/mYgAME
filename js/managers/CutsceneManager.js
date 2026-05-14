export default class CutsceneManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.isSkippable = false;
        this.queue = [];
        this.timers = [];
        this.uiElements = [];
        this.skipHandler = null;
    }

    start(config) {
        if (!config?.sequence) return;
        this.isActive = true;
        this.isSkippable = config.skippable !== false;
        this.queue = [...config.sequence];

        const { scene } = this;
        scene.input.enabled = false;
        scene.player.body.setAllowGravity(false);
        scene.player.setVelocity(0, 0);
        scene.cameras.main.stopFollow();

        if (this.isSkippable) {
            const skipTxt = scene.add.text(480, 600, 'اضغط SPACE أو المس الشاشة للتخطي', {
                fontSize: '14px', color: '#888'
            }).setOrigin(0.5).setDepth(999);
            this.uiElements.push(skipTxt);
            this.skipHandler = () => this.skip();
            scene.input.keyboard.on('keydown-SPACE', this.skipHandler);
            scene.input.once('pointerdown', this.skipHandler);
        }

        this.nextStep();
    }

    nextStep() {
        if (this.queue.length === 0) {
            this.end();
            return;
        }
        this.executeStep(this.queue.shift());
    }

    executeStep(step) {
        const { scene } = this;
        const onComplete = () => this.nextStep();

        switch (step.type) {
            case 'wait':
                this.timers.push(scene.time.delayedCall(step.duration || 1000, onComplete));
                break;

            case 'panCamera': {
                const cam = scene.cameras.main;
                const maxX = Math.max(0, (scene.levelData?.width || 960) - cam.width);
                const maxY = Math.max(0, (scene.levelData?.height || 640) - cam.height);
                const targetX = Phaser.Math.Clamp(step.x || 0, 0, maxX);
                const targetY = Phaser.Math.Clamp(step.y || 0, 0, maxY);
                cam.pan(targetX, targetY, step.duration || 1500, 'Sine.easeInOut');
                this.timers.push(scene.time.delayedCall(step.duration || 1500, onComplete));
                break;
            }

            case 'showText': {
                const txt = scene.add.text(480, 400, step.text || '', {
                    fontSize: '26px', color: '#fff', fontStyle: 'bold',
                    wordWrap: { width: 700 }
                }).setOrigin(0.5).setDepth(998);
                this.uiElements.push(txt);
                this.timers.push(scene.time.delayedCall(step.duration || 2000, () => {
                    txt.destroy();
                    onComplete();
                }));
                break;
            }

            case 'pausePlayer':
                scene.player.setVelocity(0, 0);
                onComplete();
                break;

            case 'focusPlayer':
                scene.cameras.main.startFollow(scene.player, true, 0.1, 0.1);
                onComplete();
                break;

            default:
                onComplete();
        }
    }

    skip() {
        if (!this.isActive || !this.isSkippable) return;
        this.timers.forEach(t => t.remove(false));
        this.queue = [];
        this.end();
    }

    end() {
        if (!this.isActive) return;
        this.isActive = false;
        const { scene } = this;
        scene.input.enabled = true;
        scene.player.body.setAllowGravity(true);
        scene.cameras.main.startFollow(scene.player, true, 0.1, 0.1);

        this.uiElements.forEach(el => el.destroy());
        this.uiElements = [];
        this.timers = [];
        this.queue = [];

        if (this.skipHandler) {
            scene.input.keyboard.off('keydown-SPACE', this.skipHandler);
            scene.input.off('pointerdown', this.skipHandler);
            this.skipHandler = null;
        }
    }

    destroy() {
        this.end();
    }
}
