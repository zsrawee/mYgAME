export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true).setBounce(0).setMaxVelocity(3000, 2000);

        this.canDoubleJump = true;
        this.hasDoubleJumped = false;
        this.isWallSliding = false;
        this.wallDirection = 0;
        this.onGround = false;
        this.coyoteTime = 0;
        this.dead = false;
        this.canDash = true;
        this.isDashing = false;
    }

    updateGroundState(coyoteFrames) {
        this.onGround = this.body.blocked.down || this.body.touching.down;
        if (this.onGround) {
            this.coyoteTime = coyoteFrames;
            this.canDoubleJump = true;
            this.hasDoubleJumped = false;
            this.isWallSliding = false;
            this.canDash = true;
        } else if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }
    }

    updateWallSliding(physics, vx) {
        if (this.onGround || this.body.velocity.y <= 50) return;
        const absVx = Math.abs(vx);
        if (this.body.blocked.left && absVx > 50) {
            this.isWallSliding = true;
            this.wallDirection = -1;
            this.body.setVelocityY(physics.WALL_SLIDE_VELOCITY);
        } else if (this.body.blocked.right && absVx > 50) {
            this.isWallSliding = true;
            this.wallDirection = 1;
            this.body.setVelocityY(physics.WALL_SLIDE_VELOCITY);
        }
    }

    performDash(dashConfig) {
        if (!this.canDash || this.isDashing || this.dead) return false;
        this.isDashing = true;
        this.canDash = false;
        this.body.setAllowGravity(false);
        const dir = this.flipX ? -1 : 1;
        this.body.setVelocity(dir * dashConfig.VELOCITY, 0);
        this.scene.time.delayedCall(dashConfig.DURATION, () => {
            this.isDashing = false;
            this.body.setAllowGravity(true);
        });
        return true;
    }

    performJump(jumpForce) {
        if (this.isWallSliding) {
            const wallDir = this.wallDirection;
            this.body.setVelocity(-jumpForce, -wallDir * 500);
            this.canDoubleJump = true;
            this.hasDoubleJumped = false;
            this.isWallSliding = false;
            return;
        }
        if (this.onGround || this.coyoteTime > 0) {
            this.body.setVelocityY(-jumpForce);
            this.canDoubleJump = true;
            this.hasDoubleJumped = false;
        }
    }

    applyAirFriction() {
        if (this.body.velocity.y < -100) {
            this.body.velocity.y *= 0.9;
        }
    }

    markDead() {
        if (this.dead) return false;
        this.dead = true;
        this.setVisible(false);
        return true;
    }
}
