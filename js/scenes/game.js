class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.currentLevel = 0;
        this.deathCount = 0;
        
        this.PHYSICS = Object.freeze({
            GRAVITY: 800, MOVE_SPEED: 800, JUMP_FORCE: -650,
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

        // ✅ متغيرات الـ Cutscene
        this.isCutsceneActive = false;
        this.isCutsceneSkippable = false;
        this.cutsceneQueue = [];
        this.activeCutsceneTweens = [];
        this.activeCutsceneTimers = [];
        this.cutsceneUIElements = [];
    }

    init(data) {
        this.currentLevel = data?.level || 0;
        this.deathCount = 0;
    }

    create() {
        this._setupWorld();
        this._setupLevel(this.currentLevel);
        this._setupPlayer();
        this._setupInput();
        this._setupUI();
        this._setupOrientation();

        // ✅ تشغيل السيناريو إذا وجد
        if (this.levelData.cutscene) {
            this.startCutscene(this.levelData.cutscene);
        }    }

    // 🎬 نظام الـ Cutscene
    startCutscene(config) {
        if (!config?.sequence) return;
        this.isCutsceneActive = true;
        this.isCutsceneSkippable = config.skippable !== false;
        this.cutsceneQueue = [...config.sequence];

        // إيقاف gameplay مؤقتاً
        this.input.enabled = false;
        this.player.body.setAllowGravity(false);
        this.player.setVelocity(0, 0);
        this.cameras.main.stopFollow();

        // واجهة التخطي
        if (this.isCutsceneSkippable) {
            const skipTxt = this.add.text(480, 600, 'اضغط SPACE أو المس الشاشة للتخطي', { fontSize: '14px', color: '#888' }).setOrigin(0.5).setDepth(999);
            this.cutsceneUIElements.push(skipTxt);
            this._cutsceneSkipHandler = () => this.skipCutscene();
            this.input.keyboard.on('keydown-SPACE', this._cutsceneSkipHandler);
            this.input.once('pointerdown', this._cutsceneSkipHandler);
        }

        this.nextCutsceneStep();
    }

    nextCutsceneStep() {
        if (this.cutsceneQueue.length === 0) { this.endCutscene(); return; }
        this.executeStep(this.cutsceneQueue.shift());
    }

    executeStep(step) {
        const onComplete = () => this.nextCutsceneStep();
        
        switch (step.type) {
            case 'wait':
                this.activeCutsceneTimers.push(this.time.delayedCall(step.duration || 1000, onComplete));
                break;
                
            case 'panCamera':
                const cam = this.cameras.main;
                // ✅ حساب أقصى حد للتمرير بناءً على أبعاد المرحلة والكاميرا
                const maxScrollX = Math.max(0, (this.levelData.width || 960) - cam.width);
                const maxScrollY = Math.max(0, 640 - cam.height);
                
                // ✅ تثبيت الإحداثيات داخل الحدود الرسمية
                const targetX = Phaser.Math.Clamp(step.x || 0, 0, maxScrollX);
                const targetY = Phaser.Math.Clamp(step.y || 0, 0, maxScrollY);
                
                // ✅ استخدام الدالة الرسمية التي تحترم الحدود تلقائياً
                cam.pan(targetX, targetY, step.duration || 1500, 'Sine.easeInOut');
                this.activeCutsceneTimers.push(this.time.delayedCall(step.duration || 1500, onComplete));
                break;
                
            case 'showText':
                const txt = this.add.text(480, 400, step.text || '', {
                    fontSize: '26px', color: '#fff', fontStyle: 'bold',
                    wordWrap: { width: 700 }
                }).setOrigin(0.5).setDepth(998);
                this.cutsceneUIElements.push(txt);
                this.activeCutsceneTimers.push(this.time.delayedCall(step.duration || 2000, () => { 
                    txt.destroy(); 
                    onComplete(); 
                }));
                break;
                
            case 'pausePlayer':
                this.player.setVelocity(0, 0);
                onComplete();
                break;
                
            case 'focusPlayer':
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                onComplete();
                break;
                
            default:
                onComplete();
        }
    }

    skipCutscene() {
        if (!this.isCutsceneActive || !this.isCutsceneSkippable) return;
        this.activeCutsceneTweens.forEach(t => t.stop());
        this.activeCutsceneTimers.forEach(t => t.remove(false));
        this.cutsceneQueue = [];
        this.endCutscene();
    }

    endCutscene() {
        if (!this.isCutsceneActive) return;
        this.isCutsceneActive = false;
        this.input.enabled = true;
        this.player.body.setAllowGravity(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        this.cutsceneUIElements.forEach(el => el.destroy());
        this.cutsceneUIElements = [];
        this.activeCutsceneTweens = [];
        this.activeCutsceneTimers = [];
        this.cutsceneQueue = [];
        
        if (this._cutsceneSkipHandler) {
            this.input.keyboard.off('keydown-SPACE', this._cutsceneSkipHandler);
            this.input.off('pointerdown', this._cutsceneSkipHandler);
        }
    }

    // ✅ باقي الدوال الأصلية (مختصرة للتركيز على الجديد)
    _setupWorld() {
        this.input.addPointer(this.INPUT.MAX_POINTERS);        this.input.topOnly = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    _setupLevel(index) { /* ... نفس الكود السابق تماماً ... */ 
        const data = LevelData[index]; this.levelData = data;
        this.platforms = this.physics.add.staticGroup(); this.spikes = this.physics.add.staticGroup();
        this.saws = this.physics.add.group(); this.movingPlatforms = this.physics.add.group();
        this.buttons = this.physics.add.staticGroup(); this.doors = this.physics.add.staticGroup();
        data.platforms.forEach(p => this.platforms.create(p.x, p.y, 'platform').setScale(p.width/40, p.height/40).refreshBody());
        data.spikes.forEach(s => { const spike = this.spikes.create(s.x+20, s.y+15, 'spike'); spike.body.setSize(30,25).setOffset(5,5); });
        data.saws.forEach(s => { const saw = this.saws.create(s.x, s.y, 'saw').setOrigin(0.5).setImmovable(true); saw.body.setAllowGravity(false); Object.assign(saw, {baseX:s.x, baseY:s.y, moveRangeX:s.rangeX||0, moveRangeY:s.rangeY||0, moveSpeed:s.speed||0.02, angle:0, movePhase:Math.random()*Math.PI*2}); });
        data.movingPlatforms.forEach(mp => { const plat = this.movingPlatforms.create(mp.x, mp.y, 'movingPlatform').setOrigin(0).setImmovable(true); plat.body.setAllowGravity(false); Object.assign(plat, {startX:mp.x, startY:mp.y, endX:mp.endX||mp.x, endY:mp.endY||mp.y, moveSpeed:mp.speed||2, moveDirection:1}); });
        data.buttons.forEach(b => { const btn = this.buttons.create(b.x, b.y, 'button').setImmovable(true); btn.body.setAllowGravity(false); btn.setData('targetDoor', b.doorIndex).setData('pressed', false); });
        data.doors.forEach(d => { const door = this.doors.create(d.x, d.y, 'door').setImmovable(true); door.body.setAllowGravity(false); door.setData('open', false).setData('amount', 0); });
        this.goal = this.physics.add.staticSprite(data.goalX+20, data.goalY+25, 'goal');
    }

    _setupPlayer() {
        this.player = this.physics.add.sprite(this.levelData.startX, this.levelData.startY, 'player');
        this.player.setCollideWorldBounds(true).setBounce(0).setGravityY(this.PHYSICS.GRAVITY).setMaxVelocity(3000, 2000);
        Object.assign(this.player, { canDoubleJump:true, hasDoubleJumped:false, isWallSliding:false, wallDirection:0, onGround:false, coyoteTime:0, dead:false, canDash:true, isDashing:false });
        this.physics.add.collider(this.player, this.platforms, (p) => p.onGround = true, null, this);
        this.physics.add.collider(this.player, this.movingPlatforms, (p, m) => { if(p.body.velocity.y>=0){ p.y=m.y-p.height; p.body.setVelocityY(0); p.body.velocity.x+=m.body.velocity.x; p.onGround=true; } }, null, this);
        this.physics.add.overlap(this.player, this.spikes, () => this._die(), null, this);
        this.physics.add.overlap(this.player, this.saws, () => this._die(), null, this);
        this.physics.add.overlap(this.player, this.buttons, (p, b) => { if(!b.getData('pressed')){ b.setData('pressed',true); b.y+=4; const d=this.doors.getChildren()[b.getData('targetDoor')]; if(d) d.setData('open',true); } }, null, this);
        this.physics.add.overlap(this.player, this.goal, () => { this.cameras.main.flash(500,74,170,255); this.time.delayedCall(1000, ()=>{ const n=this.currentLevel+1; if(n<10) this.scene.restart({level:n}); else this.scene.start('MenuScene'); }); }, null, this);
        this._setupCamera();
    }

    _setupCamera() {
        const CAM = this.CAMERA; const w = this.levelData.width||960; const h = 640; const cam = this.cameras.main;
        this.physics.world.setBounds(0,0,w,h); cam.setBounds(0,0,w,h);
        cam.startFollow(this.player, true, CAM.LERP_X, CAM.LERP_Y);
        cam.setDeadzone(cam.width*CAM.DEADZONE_X_RATIO, cam.height*CAM.DEADZONE_Y_RATIO);
        cam.setRoundPixels(true); cam.centerOn(this.levelData.startX, this.levelData.startY);
    }

    _setupInput() { /* ... نفس الكود السابق ... */ 
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up:Phaser.Input.Keyboard.KeyCodes.W, left:Phaser.Input.Keyboard.KeyCodes.A, right:Phaser.Input.Keyboard.KeyCodes.D, restart:Phaser.Input.Keyboard.KeyCodes.R, menu:Phaser.Input.Keyboard.KeyCodes.M });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.touchState = { left:false, right:false, jump:false, dash:false };
        this.touchJustPressed = { jump:false, dash:false };
        this.touchPointers = { left:new Set(), right:new Set(), jump:new Set(), dash:new Set() };
        if(this.isMobile) this._setupTouchControls();
    }
    _setupUI() { /* ... نفس الكود السابق ... */ 
        this.levelText = this.add.text(20,20, `المستوى ${this.currentLevel+1}: ${this.levelData.name}`, {fontSize:'16px',color:'#fff'}).setScrollFactor(0);
        this.deathText = this.add.text(20,45, 'الوفيات: 0', {fontSize:'14px',color:'#f44'}).setScrollFactor(0);
        if(this.currentLevel===0 && !this.isMobile) this.add.text(480,580, 'استخدم المفاتيح للتنقل والقفز', {fontSize:'14px',color:'#8cf'}).setOrigin(0.5).setScrollFactor(0);
    }

    _setupOrientation() { /* ... نفس الكود السابق ... */ 
        if(this.orientationOverlay) this.orientationOverlay.destroy(true);
        this.scale.off('orientationchange', this._updateOrientation, this); this.scale.off('resize', this._updateOrientation, this);
        this.orientationOverlay = this.add.container(0,0).setDepth(9999).setScrollFactor(0);
        const bg = this.add.rectangle(480,320,960,640,0x0a0a1a);
        const icon = this.add.text(480,280,'📱',{fontSize:'60px'}).setOrigin(0.5);
        const txt = this.add.text(480,350,'دوّر جوالك للعرض',{fontSize:'22px',color:'#4af',fontStyle:'bold'}).setOrigin(0.5);
        this.orientationOverlay.add([bg,icon,txt]).setVisible(false);
        this.scale.on('orientationchange', this._updateOrientation, this); this.scale.on('resize', this._updateOrientation, this);
        this._updateOrientation();
    }

    _setupTouchControls() { /* ... نفس الكود السابق ... */ 
        const mkBtn=(z,l,c)=>{ const bg=this.add.circle(z.x,z.y,z.r,c,0.35).setStrokeStyle(2,c,0.8).setScrollFactor(0).setDepth(100); const txt=this.add.text(z.x,z.y,l,{fontSize:'14px',color:'#fff',fontStyle:'bold',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setScrollFactor(0).setDepth(101); return{bg,txt}; };
        const zones=this.INPUT.ZONES, by=this.INPUT.TOUCH_BOTTOM_Y;
        this.btnVis={ left:mkBtn({x:zones.left.x,y:by,r:zones.left.r},'←',0xffffff), right:mkBtn({x:zones.right.x,y:by,r:zones.right.r},'→',0xffffff), jump:mkBtn({x:zones.jump.x,y:by,r:zones.jump.r},'JUMP',0x4488ff), dash:mkBtn({x:zones.dash.x,y:by,r:zones.dash.r},'DASH',0x00ff00) };
        this.input.on('pointerdown', p=>this._onPointerDown(p)); this.input.on('pointerup', p=>this._onPointerUp(p)); this.input.on('pointercancel', p=>this._onPointerUp(p));
    }
    _onPointerDown(pointer) { const zones=this.INPUT.ZONES, by=this.INPUT.TOUCH_BOTTOM_Y; for(const[k,z]of Object.entries(zones)){ const dx=pointer.x-z.x, dy=pointer.y-by; if(dx*dx+dy*dy<=z.r*z.r){ this.touchPointers[k].add(pointer.id); if(k==='jump')this.touchJustPressed.jump=true; if(k==='dash')this.touchJustPressed.dash=true; this._updateButtonVisuals(); break; } } }
    _onPointerUp(pointer) { for(const k of Object.keys(this.INPUT.ZONES)){ if(this.touchPointers[k].has(pointer.id)){ this.touchPointers[k].delete(pointer.id); this._updateButtonVisuals(); break; } } }
    _updateButtonVisuals() { this.touchState.left=this.touchPointers.left.size>0; this.touchState.right=this.touchPointers.right.size>0; this.touchState.jump=this.touchPointers.jump.size>0; this.touchState.dash=this.touchPointers.dash.size>0; const setV=(b,a)=>b.bg.setAlpha(a?0.8:0.35).setScale(a?0.9:1); setV(this.btnVis.left,this.touchState.left); setV(this.btnVis.right,this.touchState.right); setV(this.btnVis.jump,this.touchState.jump); setV(this.btnVis.dash,this.touchState.dash); }
    _updateOrientation() { if(!this.orientationOverlay)return; const ip=this.scale.isPortrait; this.orientationOverlay.setVisible(ip); this.input.enabled=!ip; if(ip){ const w=this.scale.width, h=this.scale.height; this.orientationOverlay.getAt(0).setSize(w,h); this.orientationOverlay.getAt(1).setPosition(w/2,h/2-35); this.orientationOverlay.getAt(2).setPosition(w/2,h/2+35); } }

    update() {
        // ✅ حارس الـ Cutscene: يوقف gameplay تماماً أثناء العرض
        if (this.isCutsceneActive) return;
        if (!this.scene || !this.player || this.player.dead) return;

        const player = this.player, body = player.body, PHYSICS = this.PHYSICS, DASH = this.DASH;
        if (Phaser.Input.Keyboard.JustDown(this.wasd.restart)) return this.scene.restart({ level: this.currentLevel });
        if (Phaser.Input.Keyboard.JustDown(this.wasd.menu)) return this.scene.start('MenuScene');

        player.onGround = body.blocked.down || body.touching.down;
        if (player.onGround) { player.coyoteTime = PHYSICS.COYOTE_FRAMES; player.canDoubleJump = true; player.hasDoubleJumped = false; player.isWallSliding = false; player.canDash = true; }
        else if (player.coyoteTime > 0) player.coyoteTime--;

        if ((Phaser.Input.Keyboard.JustDown(this.dashKey) || this.touchJustPressed.dash) && player.canDash && !player.isDashing) {
            player.isDashing = true; player.canDash = false;
            this.cameras.main.shake(100, 0.003, false);
            body.setAllowGravity(false); body.setVelocity((player.flipX?-1:1)*DASH.VELOCITY, 0);
            this.time.delayedCall(DASH.DURATION, ()=>{ player.isDashing=false; body.setAllowGravity(true); });
        }
        this.touchJustPressed.dash = false;
        if (!player.isDashing) {
            const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchState.left;
            const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchState.right;
            if (left) { body.setVelocityX(-PHYSICS.MOVE_SPEED); player.setFlipX(true); }
            else if (right) { body.setVelocityX(PHYSICS.MOVE_SPEED); player.setFlipX(false); }
            else { const vx=body.velocity.x*PHYSICS.FRICTION; body.setVelocityX(Math.abs(vx)<PHYSICS.VELOCITY_THRESHOLD?0:vx); }
        } else body.setVelocityY(0);

        if (!player.onGround && body.velocity.y > 50) {
            const vx = Math.abs(body.velocity.x);
            if (body.blocked.left && vx>50) { player.isWallSliding=true; player.wallDirection=-1; body.setVelocityY(PHYSICS.WALL_SLIDE_VELOCITY); }
            else if (body.blocked.right && vx>50) { player.isWallSliding=true; player.wallDirection=1; body.setVelocityY(PHYSICS.WALL_SLIDE_VELOCITY); }
        }

        const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.touchJustPressed.jump;
        this.touchJustPressed.jump = false;
        if (jump) {
            if (player.isWallSliding) { body.setVelocity(PHYSICS.JUMP_FORCE, -player.wallDirection*500); player.canDoubleJump=true; player.hasDoubleJumped=false; player.isWallSliding=false; }
            else if (player.onGround || player.coyoteTime>0) { body.setVelocityY(PHYSICS.JUMP_FORCE); player.canDoubleJump=true; player.hasDoubleJumped=false; }
        } else if (body.velocity.y < -100) body.velocity.y *= 0.9;

        this.movingPlatforms.children.iterate(mp => {
            const sp = mp.moveSpeed*60;
            if(mp.moveDirection>0){ mp.setVelocityX(sp); if(mp.x>=mp.endX) mp.moveDirection=-1; }
            else{ mp.setVelocityX(-sp); if(mp.x<=mp.startX) mp.moveDirection=1; }
        });
        this.saws.children.iterate(s => { s.movePhase+=s.moveSpeed; s.setPosition(s.baseX+Math.cos(s.movePhase)*s.moveRangeX, s.baseY+Math.sin(s.movePhase)*s.moveRangeY); s.angle+=0.15; });
        this.doors.children.iterate(d => { if(d.getData('open')&&d.getData('amount')<1){ d.setData('amount',d.getData('amount')+0.02); d.y-=1; } });
        if(player.y>650) this._die();
    }

    _die() { /* ... نفس الكود السابق ... */ 
        if(this.player.dead) return; this.player.dead=true; this.deathCount++;
        this.deathText.setText(`الوفيات: ${this.deathCount}`); this.cameras.main.shake(200,0.01);
        for(let i=0;i<10;i++){ const p=this.add.circle(this.player.x+(Math.random()-0.5)*30, this.player.y+(Math.random()-0.5)*30, 4, 0xff4444); this.tweens.add({targets:p, x:p.x+(Math.random()-0.5)*100, y:p.y+(Math.random()-0.5)*100, alpha:0, duration:500, onComplete:()=>p.destroy()}); }
        this.player.setVisible(false); this.time.delayedCall(800, ()=>this.scene.restart({level:this.currentLevel}));
    }

    shutdown() {
        this.endCutscene(); // ✅ تنظيف آمن عند خروج المشهد
        this.scale.off('orientationchange', this._updateOrientation, this);
        this.scale.off('resize', this._updateOrientation, this);
        if(this.isMobile){ this.input.off('pointerdown', this._onPointerDown); this.input.off('pointerup', this._onPointerUp); this.input.off('pointercancel', this._onPointerUp); }
        if(this.orientationOverlay){ this.orientationOverlay.destroy(true); this.orientationOverlay=null; }
    }
}