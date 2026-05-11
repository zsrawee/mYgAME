class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.createTextures();
        this.scene.start('MenuScene');
    }

    createTextures() {
        const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
        playerGfx.fillStyle(0x4af);
        playerGfx.fillRoundedRect(0, 0, 35, 45, 5);
        playerGfx.fillStyle(0xfff);
        playerGfx.fillCircle(11, 12, 5);
        playerGfx.fillCircle(24, 12, 5);
        playerGfx.fillStyle(0x222);
        playerGfx.fillCircle(12, 13, 3);
        playerGfx.fillCircle(25, 13, 3);
        playerGfx.generateTexture('player', 35, 45);

        const platformGfx = this.make.graphics({ x: 0, y: 0, add: false });
        platformGfx.fillStyle(0x4a4a5a);
        platformGfx.fillRect(0, 0, 40, 40);
        platformGfx.fillStyle(0x6a6a7a);
        platformGfx.fillRect(0, 0, 40, 4);
        platformGfx.generateTexture('platform', 40, 40);

        const spikeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        spikeGfx.fillStyle(0xc33);
        spikeGfx.beginPath();
        spikeGfx.moveTo(20, 0);
        spikeGfx.lineTo(40, 30);
        spikeGfx.lineTo(0, 30);
        spikeGfx.closePath();
        spikeGfx.fillPath();
        spikeGfx.generateTexture('spike', 40, 30);

        const sawGfx = this.make.graphics({ x: 0, y: 0, add: false });
        sawGfx.fillStyle(0x666);
        sawGfx.fillCircle(20, 20, 18);
        sawGfx.fillStyle(0xc33);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            sawGfx.fillCircle(20 + Math.cos(angle) * 12, 20 + Math.sin(angle) * 12, 8);
        }
        sawGfx.fillStyle(0x444);
        sawGfx.fillCircle(20, 20, 6);
        sawGfx.generateTexture('saw', 40, 40);

        const buttonGfx = this.make.graphics({ x: 0, y: 0, add: false });
        buttonGfx.fillStyle(0xfd4);
        buttonGfx.fillRoundedRect(0, 0, 30, 10, 3);
        buttonGfx.generateTexture('button', 30, 10);

         const doorGfx = this.make.graphics({ x: 0, y: 0, add: false });
         doorGfx.fillStyle(0xa55);
         doorGfx.fillRect(0, 0, 30, 60);
         doorGfx.fillStyle(0x844);
         doorGfx.fillRect(5, 14, 20, 2);
         doorGfx.fillRect(5, 29, 20, 2);
         doorGfx.fillRect(5, 44, 20, 2);
         doorGfx.generateTexture('door', 30, 60);

         const goalGfx = this.make.graphics({ x: 0, y: 0, add: false });
         goalGfx.fillStyle(0xfe4);
         goalGfx.fillRoundedRect(0, 0, 40, 50, 5);
         goalGfx.fillStyle(0xfa0);
         goalGfx.fillCircle(20, 25, 8);
         goalGfx.generateTexture('goal', 40, 50);

         const mpGfx = this.make.graphics({ x: 0, y: 0, add: false });
         mpGfx.fillStyle(0x6a8);
         mpGfx.fillRoundedRect(0, 0, 80, 16, 3);
         mpGfx.fillStyle(0x8ca);
         mpGfx.fillRect(0, 0, 80, 3);
         mpGfx.generateTexture('movingPlatform', 80, 16);

         // Button textures for mobile controls - more opaque
         const buttonBgGfx = this.make.graphics({ x: 0, y: 0, add: false });
         buttonBgGfx.fillStyle(0xffffff, 0.5);
         buttonBgGfx.fillCircle(40, 40, 40);
         buttonBgGfx.lineStyle(2, 0xffffff, 0.9);
         buttonBgGfx.strokeCircle(40, 40, 40);
         buttonBgGfx.generateTexture('button-bg', 80, 80);

         const buttonDashGfx = this.make.graphics({ x: 0, y: 0, add: false });
         buttonDashGfx.fillStyle(0x00ff00, 0.4);
         buttonDashGfx.fillCircle(50, 50, 50);
         buttonDashGfx.lineStyle(3, 0x00ff00, 1);
         buttonDashGfx.strokeCircle(50, 50, 50);
         buttonDashGfx.generateTexture('button-dash', 100, 100);
     }
 }
 
 

