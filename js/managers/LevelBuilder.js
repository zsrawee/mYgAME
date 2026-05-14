export default class LevelBuilder {
    constructor(scene) {
        this.scene = scene;
    }

    build(data) {
        const scene = this.scene;
        const groups = {};

        groups.platforms = scene.physics.add.staticGroup();
        groups.spikes = scene.physics.add.staticGroup();
        groups.saws = scene.physics.add.group();
        groups.movingPlatforms = scene.physics.add.group();
        groups.buttons = scene.physics.add.staticGroup();
        groups.doors = scene.physics.add.staticGroup();

        data.platforms.forEach(p =>
            groups.platforms.create(p.x, p.y, 'platform')
                .setScale(p.width / 40, p.height / 40).refreshBody()
        );

        data.spikes.forEach(s => {
            const spike = groups.spikes.create(s.x + 20, s.y + 15, 'spike');
            spike.body.setSize(30, 25).setOffset(5, 5);
        });

        data.saws.forEach(s => {
            const saw = groups.saws.create(s.x, s.y, 'saw').setOrigin(0.5).setImmovable(true);
            saw.body.setAllowGravity(false);
            saw.baseX = s.x;
            saw.baseY = s.y;
            saw.moveRangeX = s.rangeX || 0;
            saw.moveRangeY = s.rangeY || 0;
            saw.moveSpeed = s.speed || 0.02;
            saw.movePhase = Math.random() * Math.PI * 2;
        });

        data.movingPlatforms.forEach(mp => {
            const plat = groups.movingPlatforms.create(mp.x, mp.y, 'movingPlatform')
                .setOrigin(0).setImmovable(true);
            plat.body.setAllowGravity(false);
            plat.startX = mp.x;
            plat.startY = mp.y;
            plat.endX = mp.endX || mp.x;
            plat.endY = mp.endY || mp.y;
            plat.moveSpeed = mp.speed || 2;
            plat.direction = 1;
        });

        data.buttons.forEach((b, i) => {
            const btn = groups.buttons.create(b.x, b.y, 'button');
            btn.setData('targetDoor', b.doorIndex ?? i);
            btn.setData('pressed', false);
        });

        data.doors.forEach(d => {
            const door = groups.doors.create(d.x, d.y, 'door');
            door.setData('open', false);
            door.setData('amount', 0);
        });

        const goal = scene.physics.add.staticSprite(data.goalX + 20, data.goalY + 25, 'goal');

        return { groups, goal };
    }
}
