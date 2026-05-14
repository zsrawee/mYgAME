export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.createTextures();
        this.scene.start('MenuScene');
    }

    createTextures() {
        const g = this.make.graphics({ add: false });

        g.fillStyle(0x4af);
        g.fillRoundedRect(0, 0, 35, 45, 5);
        g.fillStyle(0xfff);
        g.fillCircle(11, 12, 5);
        g.fillCircle(24, 12, 5);
        g.fillStyle(0x222);
        g.fillCircle(12, 13, 3);
        g.fillCircle(25, 13, 3);
        g.generateTexture('player', 35, 45);
        g.clear();

        g.fillStyle(0x4a4a5a);
        g.fillRect(0, 0, 40, 40);
        g.fillStyle(0x6a6a7a);
        g.fillRect(0, 0, 40, 4);
        g.generateTexture('platform', 40, 40);
        g.clear();

        g.fillStyle(0xc33);
        g.beginPath();
        g.moveTo(20, 0);
        g.lineTo(40, 30);
        g.lineTo(0, 30);
        g.closePath();
        g.fillPath();
        g.generateTexture('spike', 40, 30);
        g.clear();

        g.fillStyle(0x666);
        g.fillCircle(20, 20, 18);
        g.fillStyle(0xc33);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            g.fillCircle(20 + Math.cos(angle) * 12, 20 + Math.sin(angle) * 12, 8);
        }
        g.fillStyle(0x444);
        g.fillCircle(20, 20, 6);
        g.generateTexture('saw', 40, 40);
        g.clear();

        g.fillStyle(0xfd4);
        g.fillRoundedRect(0, 0, 30, 10, 3);
        g.generateTexture('button', 30, 10);
        g.clear();

        g.fillStyle(0x33ddff);
        g.fillRect(2, 0, 26, 60);
        g.fillStyle(0x88eeff);
        g.fillRect(5, 6, 20, 48);
        g.fillStyle(0xffffff);
        g.fillRect(10, 14, 10, 32);
        g.generateTexture('door', 30, 60);
        g.clear();

        g.fillStyle(0xfe4);
        g.fillRoundedRect(0, 0, 40, 50, 5);
        g.fillStyle(0xff0);
        g.fillCircle(20, 25, 10);
        g.generateTexture('goal', 40, 50);
        g.clear();

        g.fillStyle(0x6a8);
        g.fillRoundedRect(0, 0, 80, 16, 3);
        g.fillStyle(0x8ca);
        g.fillRect(0, 0, 80, 3);
        g.generateTexture('movingPlatform', 80, 16);
        g.clear();

        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(40, 40, 40);
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeCircle(40, 40, 40);
        g.generateTexture('button-bg', 80, 80);
        g.clear();

        g.fillStyle(0x00ff00, 0.4);
        g.fillCircle(50, 50, 50);
        g.lineStyle(3, 0x00ff00, 1);
        g.strokeCircle(50, 50, 50);
        g.generateTexture('button-dash', 100, 100);
        g.clear();

        g.fillStyle(0xff4444);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);

        g.destroy();
    }
}
