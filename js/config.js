const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    scale: {
        mode: Phaser.Scale.FIT, // FIT يحافظ على النسب ويمنع التشوه
        // تم إزالة autoCenter لأن CSS يتولى المهمة بكفاءة أعلى
        width: 960,
        height: 640
    },
    input: {
        touch: {
            capture: true
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);