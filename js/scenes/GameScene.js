import Player from '../entities/Player.js';
import LevelBuilder from '../managers/LevelBuilder.js';
import CutsceneManager from '../managers/CutsceneManager.js';
import UIOverlay from '../ui-overlay.js';
import LevelData from '../data/levels.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.PHYSICS = Object.freeze({ GRAVITY: 800, MOVE_SPEED: 800, JUMP_FORCE: 650, WALL_SLIDE_VELOCITY: 60, COYOTE_FRAMES: 12, FRICTION: 0.85, VELOCITY_THRESHOLD: 10 });
        this.DASH = Object.freeze({ VELOCITY: 2000, DURATION: 150 });
        this.INPUT = Object.freeze({ MAX_POINTERS: 4 });
        this.CAMERA = Object.freeze({ LERP_X: 0.2, LERP_Y: 0.2, DEADZONE_X_RATIO: 0.2, DEADZONE_Y_RATIO: 0.2 });
        this.currentLevel = 0;
        this.deathCount = 0;
        this.nearPortalIndex = -1;
        this.markerTween = null;
        this.zoneHighlightTween = null;
        this.portalTween = null;
    }

    init(data) {
        this.currentLevel = data?.level ?? 0;
        this.levelData = LevelData[this.currentLevel];
        this.spawnX = data?.spawnX ?? this.levelData.startX;
        this.spawnY = data?.spawnY ?? this.levelData.startY;
        this.deathCount = 0;
    }

    create() {
        this.input.addPointer(this.INPUT.MAX_POINTERS);
        this.input.topOnly = false;
        this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(navigator.userAgent) || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

        this.ui = new UIOverlay(this);
        this.ui.show(this.isMobile);

        this.buildLevel();
        this.createPlayer();
        this.setupCollisions();
        this.setupCamera();
        this.setupInput();
        this.setupUI();
        this.setupPortals();
        this.setupOrientation();
        this.setupCutscene();
    }

    buildLevel() {
        const w = this.levelData.width || 960;
        const h = this.levelData.height || 640;
        this.add.rectangle(w / 2, h / 2, 10000, 10000, 0x0a0a1a).setDepth(-2);
        const builder = new LevelBuilder(this);
        const { groups, goal } = builder.build(this.levelData);
        this.platforms = groups.platforms; this.spikes = groups.spikes; this.saws = groups.saws;
        this.movingPlatforms = groups.movingPlatforms; this.buttons = groups.buttons; this.doors = groups.doors;
        this.goal = goal;
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.player.body.setGravityY(this.PHYSICS.GRAVITY);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.platforms, () => this.player.onGround = true, null, this);
        this.physics.add.collider(this.player, this.movingPlatforms, (p, m) => { if (p.body.velocity.y >= 0) { p.y = m.y - p.height; p.body.setVelocityY(0); p.body.velocity.x += m.body.velocity.x; p.onGround = true; } }, null, this);
        this.physics.add.overlap(this.player, this.spikes, () => this.die(), null, this);
        this.physics.add.overlap(this.player, this.saws, () => this.die(), null, this);
        this.physics.add.overlap(this.player, this.buttons, (p, b) => { if (!b.getData('pressed')) { b.setData('pressed', true); b.y += 4; const doorList = this.doors.getChildren(); const target = doorList[b.getData('targetDoor')]; if (target) target.setData('open', true); } }, null, this);
        if (this.goal) {
            this.physics.add.overlap(this.player, this.goal, () => {
                this.cameras.main.flash(500, 74, 170, 255);
                this.time.delayedCall(1000, () => this.handleGoal());
            }, null, this);
        }
    }

    setupCamera() {
        const w = this.levelData.width || 960;
        const h = this.levelData.height || 640;
        const cam = this.cameras.main;
        const cfg = this.levelData.camera || {};

        let zoom = cfg.zoom;
        if (!zoom) {
            const vw = cfg.viewportWidth || w;
            const vh = cfg.viewportHeight || h;
            zoom = Phaser.Math.Clamp(Math.min(960 / vw, 640 / vh), 0.25, 4);
        }

        this.physics.world.setBounds(0, 0, w, h);
        cam.setBounds(0, 0, w, h);
        cam.setZoom(zoom);
        cam.setRoundPixels(true);

        if (cfg.type === 'static') {
            cam.centerOn(cfg.x ?? w / 2, cfg.y ?? h / 2);
        } else {
            const lx = cfg.lerpX ?? this.CAMERA.LERP_X;
            const ly = cfg.lerpY ?? this.CAMERA.LERP_Y;
            const dzx = cfg.deadzoneX ?? this.CAMERA.DEADZONE_X_RATIO;
            const dzy = cfg.deadzoneY ?? this.CAMERA.DEADZONE_Y_RATIO;
            cam.startFollow(this.player, true, lx, ly);
            cam.setDeadzone((cam.width / zoom) * dzx, (cam.height / zoom) * dzy);
            cam.centerOn(this.spawnX, this.spawnY);
        }
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D, restart: Phaser.Input.Keyboard.KeyCodes.R, menu: Phaser.Input.Keyboard.KeyCodes.M });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    setupUI() {
        const levelName = this.levelData.name || '';
        this.ui.setLevelName(`المستوى ${this.currentLevel + 1}: ${levelName}`);
        this.ui.setDeathCount(0);
        if (this.currentLevel === 0 && !this.isMobile) {
            this.ui.showHint('استخدم WASD للتحرك والمسافة للقفز');
        }
    }

    setupPortals() {
        this.portalMarker = this.add.circle(0, 0, 6, 0x00ffff, 0.9).setDepth(490).setVisible(false);
        this.zoneHighlight = this.add.rectangle(0, 0, 1, 1, 0x00ddff, 0.2).setDepth(1).setVisible(false).setStrokeStyle(2, 0x00ffff, 0.8);
        this.portalIcon = this.add.sprite(0, 0, 'door').setDepth(501).setVisible(false).setScale(0.8);
        this.portalHint = this.add.text(0, 36, 'ENTER', {
            fontSize: '13px', color: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4, backgroundColor: '#00ccff88', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setDepth(502).setVisible(false);
        if (this.isMobile) this.ui.onRoomEnter(() => { if (this.nearPortalIndex >= 0) this.enterPortal(this.nearPortalIndex); });
    }

    setupOrientation() {
        const check = () => { const p = this.scale.isPortrait; this.ui.showOrientation(p); this.input.enabled = !p; };
        this.scale.on('orientationchange', check, this);
        this.scale.on('resize', check, this);
        check();
    }

    setupCutscene() {
        this.cutsceneManager = new CutsceneManager(this);
        if (this.levelData.cutscene) this.cutsceneManager.start(this.levelData.cutscene);
    }

    update() {
        if (this.cutsceneManager.isActive) return;
        if (!this.scene || !this.player || this.player.dead) return;
        if (Phaser.Input.Keyboard.JustDown(this.wasd.restart)) { this.restartCurrent(); return; }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.menu)) { this.scene.start('MenuScene'); return; }

        const player = this.player;
        const body = player.body;
        const PHYSICS = this.PHYSICS;
        const DASH = this.DASH;

        this.updateTouchState();
        this.checkPortals();
        player.updateGroundState(PHYSICS.COYOTE_FRAMES);
        this.handleDash(DASH);
        this.handleMovement(PHYSICS);
        player.updateWallSliding(PHYSICS, body.velocity.x);
        this.handleJump(PHYSICS);
        this.updateMovingPlatforms();
        this.updateSaws();
        this.updateDoors();
        if (player.y > (this.levelData.height || 640) + 10) this.die();
    }

    updateTouchState() {
        if (!this.ui) return;
        this.touchState = this.ui.state;
        this.touchJustPressed = this.ui.justPressed;
        this.ui.justPressed = { jump: false, dash: false };
    }

    checkPortals() {
        const portals = this.levelData.portals || [];
        if (portals.length === 0) {
            this.zoneHighlight?.setVisible(false);
            this.portalMarker?.setVisible(false);
            this.ui?.hideRoomEnter();
            return;
        }
        let nearPortal = -1;
        let nearDist = 999999;
        for (let i = 0; i < portals.length; i++) {
            const z = portals[i];
            const dx = this.player.x - z.x;
            const dy = this.player.y - z.y;
            const halfW = z.width / 2;
            const halfH = z.height / 2;
            if (dx >= -halfW && dx <= halfW && dy >= -halfH && dy <= halfH) { nearPortal = i; break; }
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearDist) { nearDist = dist; if (nearPortal < 0 && dist < 500) nearPortal = i; }
        }
        if (nearPortal !== this.nearPortalIndex) {
            if (this.nearPortalIndex >= 0) this.hidePortal();
            this.nearPortalIndex = nearPortal;
            if (nearPortal >= 0) this.showPortal();
        }
        if (this.nearPortalIndex >= 0) {
            const p = portals[this.nearPortalIndex];
            const inZone = this.player.x >= p.x - p.width / 2 && this.player.x <= p.x + p.width / 2 &&
                this.player.y >= p.y - p.height / 2 && this.player.y <= p.y + p.height / 2;
            this.portalMarker.setPosition(p.x, p.y - 50).setVisible(true);
            if (inZone) {
                this.zoneHighlight.setPosition(p.x, p.y).setSize(p.width, p.height).setVisible(true);
                this.portalIcon.setPosition(p.x, p.y).setVisible(true);
                this.portalHint.setPosition(p.x, p.y + 30).setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.enterPortal(this.nearPortalIndex);
                this.ui.showRoomEnter();
            } else {
                this.zoneHighlight?.setVisible(false);
                this.portalIcon?.setVisible(false);
                this.portalHint?.setVisible(false);
                this.ui.hideRoomEnter();
            }
        } else {
            this.zoneHighlight?.setVisible(false);
            this.portalMarker?.setVisible(false);
            this.ui.hideRoomEnter();
        }
    }

    showPortal() {
        if (this.markerTween) this.markerTween.stop();
        this.markerTween = this.tweens.add({ targets: this.portalMarker, alpha: 0.3, scale: 1.5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.portalIcon.setVisible(true).setScale(0.2).setAlpha(0);
        this.portalHint.setVisible(true).setAlpha(0);
        this.tweens.add({ targets: [this.portalIcon, this.portalHint], alpha: 1, duration: 300, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: this.portalIcon, scale: 0.7, duration: 350, ease: 'Back.easeOut' });
        if (this.zoneHighlightTween) this.zoneHighlightTween.stop();
        this.zoneHighlightTween = this.tweens.add({ targets: this.zoneHighlight, alpha: 0.4, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        if (this.portalTween) this.portalTween.stop();
        this.portalTween = this.tweens.add({ targets: this.portalIcon, alpha: 0.7, scale: 1.2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    hidePortal() {
        this.zoneHighlight?.setVisible(false);
        this.portalMarker?.setVisible(false);
        if (this.markerTween) { this.markerTween.stop(); this.markerTween = null; }
        if (this.zoneHighlightTween) { this.zoneHighlightTween.stop(); this.zoneHighlightTween = null; }
        if (this.portalTween) { this.portalTween.stop(); this.portalTween = null; }
        if (!this.portalIcon.visible) return;
        this.tweens.add({ targets: [this.portalIcon, this.portalHint], alpha: 0, scale: 0.5, duration: 200, onComplete: () => { this.portalIcon.setVisible(false); this.portalHint.setVisible(false); } });
    }

    enterPortal(index) {
        const portals = this.levelData.portals || [];
        const portal = portals[index];
        if (!portal) return;
        this.cameras.main.fade(200, 0, 0, 0, false, (cam, progress) => {
            if (progress === 1) this.scene.restart({ level: portal.targetLevel, spawnX: portal.spawnX, spawnY: portal.spawnY });
        });
    }

    handleGoal() {
        const target = this.levelData.goal;
        if (target?.type === 'level') { this.scene.restart({ level: target.index }); return; }
        if (target?.type === 'menu') { this.scene.start('MenuScene'); return; }
        const next = this.currentLevel + 1;
        if (next < LevelData.length) this.scene.restart({ level: next });
        else this.scene.start('MenuScene');
    }

    handleDash(DASH) {
        const dashPressed = Phaser.Input.Keyboard.JustDown(this.dashKey) || this.touchJustPressed?.dash;
        if (dashPressed && this.player.performDash(DASH)) this.cameras.main.shake(100, 0.003, false);
    }

    handleMovement(PHYSICS) {
        const player = this.player; const body = player.body;
        if (player.isDashing) { body.setVelocityY(0); return; }
        const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchState?.left;
        const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchState?.right;
        if (left) { body.setVelocityX(-PHYSICS.MOVE_SPEED); player.setFlipX(true); }
        else if (right) { body.setVelocityX(PHYSICS.MOVE_SPEED); player.setFlipX(false); }
        else { const vx = body.velocity.x * PHYSICS.FRICTION; body.setVelocityX(Math.abs(vx) < PHYSICS.VELOCITY_THRESHOLD ? 0 : vx); }
    }

    handleJump(PHYSICS) {
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.touchJustPressed?.jump;
        if (jumpPressed) this.player.performJump(PHYSICS.JUMP_FORCE);
        else if (this.player.body.velocity.y < -100) this.player.applyAirFriction();
    }

    updateMovingPlatforms() {
        this.movingPlatforms?.children.iterate(mp => {
            const speed = mp.moveSpeed * 60;
            if (mp.direction > 0) { mp.setVelocityX(speed); if (mp.x >= mp.endX) mp.direction = -1; }
            else { mp.setVelocityX(-speed); if (mp.x <= mp.startX) mp.direction = 1; }
        });
    }

    updateSaws() {
        this.saws?.children.iterate(s => { s.movePhase += s.moveSpeed; s.setPosition(s.baseX + Math.cos(s.movePhase) * s.moveRangeX, s.baseY + Math.sin(s.movePhase) * s.moveRangeY); s.angle += 0.15; });
    }

    updateDoors() {
        this.doors?.children.iterate(d => { if (d.getData('open') && d.getData('amount') < 1) { const na = d.getData('amount') + 0.02; d.setData('amount', na); d.y -= 1; } });
    }

    restartCurrent() {
        this.scene.restart({ level: this.currentLevel, spawnX: this.levelData.startX, spawnY: this.levelData.startY });
    }

    die() {
        if (!this.player.markDead()) return;
        this.deathCount++;
        this.ui.setDeathCount(this.deathCount);
        this.cameras.main.shake(200, 0.01);
        const emitter = this.add.particles(this.player.x, this.player.y, 'particle', { speed: { min: 50, max: 200 }, lifespan: 500, quantity: 10, scale: { start: 1, end: 0 }, emitting: false });
        emitter.explode(10);
        this.time.delayedCall(600, () => emitter.destroy());
        this.time.delayedCall(800, () => this.restartCurrent());
    }

    shutdown() {
        this.cutsceneManager?.destroy();
        this.ui?.destroy();
        this.scale.off('orientationchange');
        this.scale.off('resize');
    }
}
