export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.add.text(480, 250, 'لعبة باركور', {
            fontSize: '48px', color: '#4af', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        const startBtn = this.add.text(480, 380, 'ابدأ اللعب', {
            fontSize: '28px', color: '#fff', backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { level: 0 });
        });

        this.createOrientationOverlay();
    }

    createOrientationOverlay() {
        if (this.orientationOverlay) {
            this.orientationOverlay.destroy(true);
        }
        this.orientationOverlay = this.add.container(0, 0).setDepth(9999).setScrollFactor(0);
        const bg = this.add.rectangle(480, 320, 960, 640, 0x0a0a1a);
        const icon = this.add.text(480, 280, '📱', { fontSize: '60px' }).setOrigin(0.5);
        const text = this.add.text(480, 350, 'دوّر جوالك للعرض', {
            fontSize: '22px', color: '#4af', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.orientationOverlay.add([bg, icon, text]);
        this.orientationOverlay.setVisible(false);

        this.scale.on('orientationchange', this.updateOrientationOverlay, this);
        this.scale.on('resize', this.updateOrientationOverlay, this);
        this.updateOrientationOverlay();
    }

    updateOrientationOverlay() {
        if (!this.orientationOverlay) return;
        const isPortrait = this.scale.isPortrait;
        this.orientationOverlay.setVisible(isPortrait);
        this.input.enabled = !isPortrait;
        if (isPortrait) {
            const w = this.scale.width;
            const h = this.scale.height;
            const items = this.orientationOverlay;
            items.getAt(0).setSize(w, h);
            items.getAt(1).setPosition(w / 2, h / 2 - 35);
            items.getAt(2).setPosition(w / 2, h / 2 + 35);
        }
    }

    shutdown() {
        if (this.orientationOverlay) {
            this.orientationOverlay.destroy(true);
            this.orientationOverlay = null;
        }
        this.scale.off('orientationchange', this.updateOrientationOverlay, this);
        this.scale.off('resize', this.updateOrientationOverlay, this);
    }
}
