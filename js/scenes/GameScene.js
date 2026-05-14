import Player from '../entities/Player.js';
import LevelBuilder from '../managers/LevelBuilder.js';
import CutsceneManager from '../managers/CutsceneManager.js';
import TouchControls from '../managers/TouchControls.js';
import LevelData from '../data/levels.js';

const levelStack = [];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.PHYSICS = Object.freeze({
            GRAVITY: 800, MOVE_SPEED: 800, JUMP_FORCE: 650,
            WALL_SLIDE_VELOCITY: 60, COYOTE_FRAMES: 12,
            FRICTION: 0.85, VELOCITY_THRESHOLD: 10
        });
        this.DASH = Object.freeze({ VELOCITY: 2000, DURATION: 150 });
        this.INPUT = Object.freeze({
            MAX_POINTERS: 4, TOUCH_BOTTOM_Y: 585,
            ZONES: {
                left: { x: 70, r: 35 }, right: { x: 150, r: 35 },
                jump: { x: 890, r: 40 }, dash: { x: 800, r: 40 }
            }
        });
        this.CAMERA = Object.freeze({
            LERP_X: 0.2, LERP_Y: 0.2,
            DEADZONE_X_RATIO: 0.3, DEADZONE_Y_RATIO: 0.4
        });

        this.isRoom = false;
        this.roomIndex = -1;
        this.currentLevel = 0;
        this.deathCount = 0;
        this.nearRoomIndex = -1;
        this.roomDoorTween = null;
        this.markerTween = null;
        this.uiLayer = null;
    }

    init(data) {
        if (data?.roomData) {
            this.isRoom = true;
            this.levelData = data.roomData;
            this.currentLevel = data?.level ?? 0;
        } else if (data?.room !== undefined && data?.parentLevel !== undefined) {
            this.isRoom = true;
            this.currentLevel = data.parentLevel;
            this.levelData = LevelData[this.currentLevel].rooms[data.room].roomData;
        } else {
            this.isRoom = false;
            this.currentLevel = data?.level ?? 0;
            this.levelData = LevelData[this.currentLevel];
        }
        this.deathCount = 0;
    }

    create() {
        this.input.addPointer(this.INPUT.MAX_POINTERS);
        this.input.topOnly = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        this.uiLayer = this.add.container(0, 0).setDepth(1000);

        this.buildLevel();
        this.createPlayer();
        this.setupCollisions();
        this.setupCamera();
        this.setupInput();
        this.setupUI();
        this.setupRoomDoor();
        this.setupOrientation();
        this.setupCutscene();
    }

    buildLevel() {
        const w = this.levelData.width || 960;
        const h = this.levelData.height || 640;
        this.add.rectangle(w / 2, h / 2, 10000, 10000, 0x0a0a1a).setDepth(-2);

        const builder = new LevelBuilder(this);
        const { groups, goal } = builder.build(this.levelData);
        this.platforms = groups.platforms;
        this.spikes = groups.spikes;
        this.saws = groups.saws;
        this.movingPlatforms = groups.movingPlatforms;
        this.buttons = groups.buttons;
        this.doors = groups.doors;
        this.goal = goal;
    }

    createPlayer() {
        const { startX, startY } = this.levelData;
        this.player = new Player(this, startX, startY);
        this.player.body.setGravityY(this.PHYSICS.GRAVITY);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.platforms,
            () => this.player.onGround = true, null, this);

        this.physics.add.collider(this.player, this.movingPlatforms,
            (p, m) => {
                if (p.body.velocity.y >= 0) {
                    p.y = m.y - p.height;
                    p.body.setVelocityY(0);
                    p.body.velocity.x += m.body.velocity.x;
                    p.onGround = true;
                }
            }, null, this);

        this.physics.add.overlap(this.player, this.spikes,
            () => this.die(), null, this);
        this.physics.add.overlap(this.player, this.saws,
            () => this.die(), null, this);

        this.physics.add.overlap(this.player, this.buttons,
            (p, b) => {
                if (!b.getData('pressed')) {
                    b.setData('pressed', true);
                    b.y += 4;
                    const doorList = this.doors.getChildren();
                    const target = doorList[b.getData('targetDoor')];
                    if (target) target.setData('open', true);
                }
            }, null, this);

        this.physics.add.overlap(this.player, this.goal,
            () => {
                this.cameras.main.flash(500, 74, 170, 255);
                this.time.delayedCall(1000, () => this.handleGoal());
            }, null, this);
    }

    setupCamera() {
        const w = this.levelData.width || 960;
        const h = this.levelData.height || 640;
        const cam = this.cameras.main;
        const zoom = Phaser.Math.Clamp(Math.min(960 / w, 640 / h), 0.5, 3);

        this.physics.world.setBounds(0, 0, w, h);
        cam.setBounds(0, 0, w, h);
        cam.setZoom(zoom);
        cam.startFollow(this.player, true, this.CAMERA.LERP_X, this.CAMERA.LERP_Y);
        cam.setDeadzone(
            (cam.width / zoom) * this.CAMERA.DEADZONE_X_RATIO,
            (cam.height / zoom) * this.CAMERA.DEADZONE_Y_RATIO
        );
        cam.setRoundPixels(true);
        cam.centerOn(this.levelData.startX, this.levelData.startY);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            restart: Phaser.Input.Keyboard.KeyCodes.R,
            menu: Phaser.Input.Keyboard.KeyCodes.M
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        if (this.isMobile) {
            this.touchControls = new TouchControls(this, this.INPUT.ZONES, this.INPUT.TOUCH_BOTTOM_Y, this.uiLayer);
        }
    }

    setupUI() {
        const levelName = this.levelData.name || '';
        const label = this.isRoom ? `غرفة: ${levelName}` : `المستوى ${this.currentLevel + 1}: ${levelName}`;
        this.levelText = this.add.text(20, 20, label,
            { fontSize: '16px', color: '#fff' });
        this.uiLayer.add(this.levelText);

        this.deathText = this.add.text(20, 45, 'الوفيات: 0',
            { fontSize: '14px', color: '#f44' });
        this.uiLayer.add(this.deathText);

        if (!this.isRoom && this.currentLevel === 0 && !this.isMobile) {
            const hint = this.add.text(480, 580, 'استخدم المفاتيح للتنقل والقفز', {
                fontSize: '14px', color: '#8cf'
            }).setOrigin(0.5);
            this.uiLayer.add(hint);
        }
    }

    setupRoomDoor() {
        this.roomMarker = this.add.circle(0, 0, 6, 0x00ffff, 0.9)
            .setDepth(490).setVisible(false);

        this.zoneHighlight = this.add.rectangle(0, 0, 1, 1, 0x00ddff, 0.2)
            .setDepth(1).setVisible(false).setStrokeStyle(2, 0x00ffff, 0.8);

        this.roomDoorCircle = this.add.circle(0, 0, 28, 0x00ddff, 0.5)
            .setDepth(500).setVisible(false).setInteractive({ useHandCursor: true });
        this.roomDoorIcon = this.add.sprite(0, 0, 'door')
            .setDepth(501).setVisible(false).setScale(0.8);
        this.roomDoorHint = this.add.text(0, 36, 'ENTER', {
            fontSize: '13px', color: '#fff', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4, backgroundColor: '#00ccff88',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setDepth(502).setVisible(false);

        this.roomDoorCircle.on('pointerdown', () => {
            if (this.nearRoomIndex >= 0) this.enterRoom(this.nearRoomIndex);
        });

        this.roomEnterBtn = this.add.circle(850, 470, 40, 0x4488ff, 0.7)
            .setStrokeStyle(3, 0x66ccff, 1)
            .setDepth(100).setVisible(false).setInteractive({ useHandCursor: true });
        this.roomEnterTxt = this.add.text(850, 470, 'ENTER', {
            fontSize: '14px', color: '#fff', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(101).setVisible(false);

        this.roomEnterBtn.on('pointerdown', () => {
            if (this.nearRoomIndex >= 0) this.enterRoom(this.nearRoomIndex);
        });

        this.uiLayer.add([this.roomEnterBtn, this.roomEnterTxt]);
    }

    setupOrientation() {
        if (this.orientationOverlay) this.orientationOverlay.destroy(true);
        this.orientationOverlay = this.add.container(0, 0).setDepth(9999).setScrollFactor(0);
        const bg = this.add.rectangle(480, 320, 960, 640, 0x0a0a1a);
        const icon = this.add.text(480, 280, '📱', { fontSize: '60px' }).setOrigin(0.5);
        const txt = this.add.text(480, 350, 'دوّر جوالك للعرض', {
            fontSize: '22px', color: '#4af', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.orientationOverlay.add([bg, icon, txt]).setVisible(false);

        this.scale.on('orientationchange', this.updateOrientation, this);
        this.scale.on('resize', this.updateOrientation, this);
        this.updateOrientation();
    }

    updateOrientation() {
        if (!this.orientationOverlay) return;
        const isPortrait = this.scale.isPortrait;
        this.orientationOverlay.setVisible(isPortrait);
        this.input.enabled = !isPortrait;
        if (isPortrait) {
            const w = this.scale.width;
            const h = this.scale.height;
            this.orientationOverlay.getAt(0).setSize(w, h);
            this.orientationOverlay.getAt(1).setPosition(w / 2, h / 2 - 35);
            this.orientationOverlay.getAt(2).setPosition(w / 2, h / 2 + 35);
        }
    }

    setupCutscene() {
        this.cutsceneManager = new CutsceneManager(this);
        if (this.levelData.cutscene) {
            this.cutsceneManager.start(this.levelData.cutscene);
        }
    }

    update() {
        if (this.cutsceneManager.isActive) return;
        if (!this.scene || !this.player || this.player.dead) return;

        if (Phaser.Input.Keyboard.JustDown(this.wasd.restart)) {
            this.restartCurrent();
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.menu)) {
            this.scene.start('MenuScene');
            return;
        }

        const cam = this.cameras.main;
        if (this.uiLayer) {
            this.uiLayer.setPosition(cam.scrollX, cam.scrollY);
            this.uiLayer.setScale(1 / cam.zoom);
        }

        const player = this.player;
        const body = player.body;
        const PHYSICS = this.PHYSICS;
        const DASH = this.DASH;

        this.updateTouchState();
        this.checkRoomEntries();
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
        if (!this.touchControls) return;
        this.touchState = this.touchControls.state;
        this.touchJustPressed = this.touchControls.justPressed;
    }

    checkRoomEntries() {
        const rooms = this.isRoom
            ? (this.levelData.rooms || [])
            : (LevelData[this.currentLevel]?.rooms || []);
        if (rooms.length === 0) {
            if (this.zoneHighlight) this.zoneHighlight.setVisible(false);
            if (this.roomMarker) this.roomMarker.setVisible(false);
            return;
        }

        let nearRoom = -1;
        let nearDist = 999999;
        for (let i = 0; i < rooms.length; i++) {
            const z = rooms[i].entryZone;
            if (!z) continue;
            const dx = this.player.x - z.x;
            const dy = this.player.y - z.y;
            const halfW = z.width / 2;
            const halfH = z.height / 2;
            if (dx >= -halfW && dx <= halfW && dy >= -halfH && dy <= halfH) {
                nearRoom = i;
                break;
            }
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearDist) {
                nearDist = dist;
                if (nearRoom < 0 && dist < 500) nearRoom = i;
            }
        }

        if (nearRoom !== this.nearRoomIndex) {
            if (this.nearRoomIndex >= 0) this.hideRoomDoor();
            this.nearRoomIndex = nearRoom;
            if (nearRoom >= 0) this.showRoomDoor();
        }

        if (this.nearRoomIndex >= 0) {
            const parentRooms = this.isRoom
                ? (this.levelData.rooms || [])
                : (LevelData[this.currentLevel]?.rooms || []);
            const z = parentRooms[this.nearRoomIndex].entryZone;
            const doorPos = parentRooms[this.nearRoomIndex]?.entryDoor ||
                { x: z.x, y: z.y - 25 };

            const inZone = this.player.x >= z.x - z.width / 2 && this.player.x <= z.x + z.width / 2 &&
                this.player.y >= z.y - z.height / 2 && this.player.y <= z.y + z.height / 2;

            this.roomMarker.setPosition(z.x, z.y - 50).setVisible(true);

            if (inZone) {
                this.zoneHighlight.setPosition(z.x, z.y).setSize(z.width, z.height).setVisible(true);
                this.roomDoorCircle.setPosition(doorPos.x, doorPos.y);
                this.roomDoorIcon.setPosition(doorPos.x, doorPos.y);
                this.roomDoorHint.setPosition(doorPos.x, doorPos.y + 30);

                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                    this.enterRoom(this.nearRoomIndex);
                }

                if (this.roomEnterBtn) this.roomEnterBtn.setVisible(true);
                if (this.roomEnterTxt) this.roomEnterTxt.setVisible(true);
            } else {
                this.zoneHighlight.setVisible(false);
                this.roomDoorCircle.setVisible(false);
                this.roomDoorIcon.setVisible(false);
                this.roomDoorHint.setVisible(false);
                if (this.roomEnterBtn) this.roomEnterBtn.setVisible(false);
                if (this.roomEnterTxt) this.roomEnterTxt.setVisible(false);
            }
        } else {
            if (this.zoneHighlight) this.zoneHighlight.setVisible(false);
            if (this.roomMarker) this.roomMarker.setVisible(false);
            if (this.roomEnterBtn) this.roomEnterBtn.setVisible(false);
            if (this.roomEnterTxt) this.roomEnterTxt.setVisible(false);
        }
    }

    showRoomDoor() {
        if (this.markerTween) this.markerTween.stop();
        this.markerTween = this.tweens.add({
            targets: this.roomMarker,
            alpha: 0.3, scale: 1.5,
            duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.roomDoorCircle.setVisible(true).setScale(0.3).setAlpha(0);
        this.roomDoorIcon.setVisible(true).setScale(0.2).setAlpha(0);
        this.roomDoorHint.setVisible(true).setAlpha(0);

        this.tweens.add({
            targets: [this.roomDoorCircle, this.roomDoorIcon, this.roomDoorHint],
            alpha: 1, duration: 300, ease: 'Sine.easeOut'
        });
        this.tweens.add({
            targets: this.roomDoorCircle,
            scale: 1, duration: 350, ease: 'Back.easeOut'
        });
        this.tweens.add({
            targets: this.roomDoorIcon,
            scale: 0.7, duration: 350, ease: 'Back.easeOut'
        });

        if (this.zoneHighlightTween) this.zoneHighlightTween.stop();
        this.zoneHighlightTween = this.tweens.add({
            targets: this.zoneHighlight,
            alpha: 0.4,
            duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        if (this.roomDoorTween) this.roomDoorTween.stop();
        this.roomDoorTween = this.tweens.add({
            targets: this.roomDoorCircle,
            scale: 1.2, alpha: 0.7,
            duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    hideRoomDoor() {
        if (this.zoneHighlight) this.zoneHighlight.setVisible(false);
        if (this.roomMarker) this.roomMarker.setVisible(false);
        if (this.markerTween) { this.markerTween.stop(); this.markerTween = null; }
        if (this.zoneHighlightTween) { this.zoneHighlightTween.stop(); this.zoneHighlightTween = null; }
        if (!this.roomDoorCircle.visible) return;
        if (this.roomDoorTween) {
            this.roomDoorTween.stop();
            this.roomDoorTween = null;
        }
        this.tweens.add({
            targets: [this.roomDoorCircle, this.roomDoorIcon, this.roomDoorHint],
            alpha: 0, scale: 0.5, duration: 200,
            onComplete: () => {
                this.roomDoorCircle.setVisible(false);
                this.roomDoorIcon.setVisible(false);
                this.roomDoorHint.setVisible(false);
            }
        });
    }

    enterRoom(index) {
        const rooms = this.isRoom
            ? (this.levelData.rooms || [])
            : (LevelData[this.currentLevel]?.rooms || []);
        const room = rooms[index];
        if (!room?.roomData) return;

        levelStack.push({ roomData: this.isRoom ? this.levelData : null });

        this.cameras.main.fade(200, 0, 0, 0, false, (cam, progress) => {
            if (progress === 1) {
                this.scene.restart({ roomData: room.roomData });
            }
        });
    }

    exitRoom() {
        const parent = levelStack.pop();
        if (!parent) { this.scene.start('MenuScene'); return; }

        this.cameras.main.fade(200, 0, 0, 0, false, (cam, progress) => {
            if (progress === 1) {
                this.scene.restart(
                    parent.roomData
                        ? { roomData: parent.roomData }
                        : { level: this.currentLevel }
                );
            }
        });
    }

    handleGoal() {
        const target = this.levelData.goal;
        if (target?.type === 'level') {
            this.scene.restart({ level: target.index });
            return;
        }
        if (target?.type === 'room') {
            const levelData = LevelData[target.level];
            if (levelData?.rooms?.[target.room]) {
                levelStack.push({ roomData: null });
                this.scene.restart({ room: target.room, parentLevel: target.level });
            }
            return;
        }
        if (target?.type === 'menu') {
            this.scene.start('MenuScene');
            return;
        }
        if (this.isRoom) {
            this.exitRoom();
        } else {
            const next = this.currentLevel + 1;
            if (next < LevelData.length) {
                this.scene.restart({ level: next });
            } else {
                this.scene.start('MenuScene');
            }
        }
    }

    handleDash(DASH) {
        const dashPressed = Phaser.Input.Keyboard.JustDown(this.dashKey) ||
            (this.touchJustPressed?.dash);
        if (dashPressed && this.player.performDash(DASH)) {
            this.cameras.main.shake(100, 0.003, false);
        }
        if (this.touchControls) this.touchControls.justPressed.dash = false;
    }

    handleMovement(PHYSICS) {
        const player = this.player;
        const body = player.body;

        if (player.isDashing) {
            body.setVelocityY(0);
            return;
        }

        const left = this.cursors.left.isDown || this.wasd.left.isDown ||
            (this.touchState?.left);
        const right = this.cursors.right.isDown || this.wasd.right.isDown ||
            (this.touchState?.right);

        if (left) {
            body.setVelocityX(-PHYSICS.MOVE_SPEED);
            player.setFlipX(true);
        } else if (right) {
            body.setVelocityX(PHYSICS.MOVE_SPEED);
            player.setFlipX(false);
        } else {
            const vx = body.velocity.x * PHYSICS.FRICTION;
            body.setVelocityX(Math.abs(vx) < PHYSICS.VELOCITY_THRESHOLD ? 0 : vx);
        }
    }

    handleJump(PHYSICS) {
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            (this.touchJustPressed?.jump);

        if (this.touchControls) this.touchControls.justPressed.jump = false;

        if (jumpPressed) {
            this.player.performJump(PHYSICS.JUMP_FORCE);
        } else if (this.player.body.velocity.y < -100) {
            this.player.applyAirFriction();
        }
    }

    updateMovingPlatforms() {
        this.movingPlatforms.children.iterate(mp => {
            const speed = mp.moveSpeed * 60;
            if (mp.direction > 0) {
                mp.setVelocityX(speed);
                if (mp.x >= mp.endX) mp.direction = -1;
            } else {
                mp.setVelocityX(-speed);
                if (mp.x <= mp.startX) mp.direction = 1;
            }
        });
    }

    updateSaws() {
        this.saws.children.iterate(s => {
            s.movePhase += s.moveSpeed;
            s.setPosition(
                s.baseX + Math.cos(s.movePhase) * s.moveRangeX,
                s.baseY + Math.sin(s.movePhase) * s.moveRangeY
            );
            s.angle += 0.15;
        });
    }

    updateDoors() {
        this.doors.children.iterate(d => {
            if (d.getData('open') && d.getData('amount') < 1) {
                const newAmount = d.getData('amount') + 0.02;
                d.setData('amount', newAmount);
                d.y -= 1;
            }
        });
    }

    restartCurrent() {
        if (this.isRoom) {
            this.scene.restart({ roomData: this.levelData });
        } else {
            this.scene.restart({ level: this.currentLevel });
        }
    }

    die() {
        if (!this.player.markDead()) return;
        this.deathCount++;
        this.deathText.setText(`الوفيات: ${this.deathCount}`);
        this.cameras.main.shake(200, 0.01);

        const emitter = this.add.particles(this.player.x, this.player.y, 'particle', {
            speed: { min: 50, max: 200 },
            lifespan: 500,
            quantity: 10,
            scale: { start: 1, end: 0 },
            emitting: false
        });
        emitter.explode(10);
        this.time.delayedCall(600, () => emitter.destroy());

        this.time.delayedCall(800, () => this.restartCurrent());
    }

    shutdown() {
        if (this.cutsceneManager) {
            this.cutsceneManager.destroy();
        }
        this.scale.off('orientationchange', this.updateOrientation, this);
        this.scale.off('resize', this.updateOrientation, this);
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        if (this.orientationOverlay) {
            this.orientationOverlay.destroy(true);
            this.orientationOverlay = null;
        }
    }
}
