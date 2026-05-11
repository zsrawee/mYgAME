const LevelData = [
    {
        name: "البداية",
        width: 2000,
        startX: 80, startY: 500, goalX: 1900, goalY: 530,
        cutscene: {
            skippable: true,
            sequence: [
                { type: 'wait', duration: 4047 },
                { type: 'showText', text: 'مرحباً بك في عالم الباركور!', duration: 2500 },
                { type: 'showText', text: 'استخدم الأسهم للحركة، SPACE للقفز', duration: 3000 },
                { type: 'focusPlayer' }
            ]
        },
        platforms: [
            { x: 0, y: 580, width: 2000, height: 40 },
            { x: 0, y: 0, width: 20, height: 640 },
            { x: 1980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    },
    {
        name: "القفز المزدوج",
        width: 2500,
        startX: 80, startY: 500, goalX: 2400, goalY: 400,
        cutscene: {
            skippable: false, // ❌ لا يمكن تخطيه (مهم للتعلم)
            sequence: [
                { type: 'panCamera', x: 600, y: 400, duration: 2000 },
                { type: 'showText', text: 'تعلم القفز المزدوج!', duration: 2000 },
                { type: 'showText', text: 'اضغط SPACE مرتين في الهواء للارتفاع أكثر', duration: 3500 },
                { type: 'focusPlayer' }
            ]
        },
        platforms: [
            { x: 0, y: 580, width: 300, height: 40 },
            { x: 350, y: 550, width: 80, height: 40 }, { x: 500, y: 500, width: 80, height: 40 },
            { x: 650, y: 450, width: 80, height: 40 }, { x: 800, y: 400, width: 80, height: 40 },
            { x: 950, y: 350, width: 80, height: 40 }, { x: 1100, y: 400, width: 80, height: 40 },
            { x: 1250, y: 450, width: 80, height: 40 }, { x: 1400, y: 500, width: 80, height: 40 },
            { x: 1550, y: 550, width: 80, height: 40 }, { x: 1700, y: 580, width: 800, height: 40 },
            { x: 0, y: 0, width: 20, height: 640 }, { x: 2480, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    },
    {
        name: "المنصات المتحركة", width: 3000, startX: 80, startY: 500, goalX: 2900, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 250, height: 40 }, { x: 400, y: 550, width: 100, height: 40 },
            { x: 650, y: 500, width: 100, height: 40 }, { x: 900, y: 450, width: 100, height: 40 },            { x: 1150, y: 400, width: 100, height: 40 }, { x: 1400, y: 450, width: 100, height: 40 },
            { x: 1650, y: 500, width: 100, height: 40 }, { x: 1900, y: 550, width: 100, height: 40 },
            { x: 2150, y: 580, width: 850, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 2980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [],
        movingPlatforms: [
            { x: 300, y: 520, endX: 350, endY: 520, speed: 1.5 }, { x: 550, y: 480, endX: 600, endY: 480, speed: 1.5 },
            { x: 800, y: 430, endX: 850, endY: 430, speed: 1.5 }, { x: 1050, y: 380, endX: 1100, endY: 380, speed: 1.5 },
            { x: 1300, y: 430, endX: 1350, endY: 430, speed: 1.5 }, { x: 1550, y: 480, endX: 1600, endY: 480, speed: 1.5 },
            { x: 1800, y: 530, endX: 1850, endY: 530, speed: 1.5 }
        ],
        buttons: [], doors: []
    },
    {
        name: "الطريق الطويل", width: 4000, startX: 80, startY: 500, goalX: 3900, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 400, height: 40 }, { x: 450, y: 550, width: 120, height: 40 },
            { x: 650, y: 500, width: 120, height: 40 }, { x: 850, y: 450, width: 120, height: 40 },
            { x: 1050, y: 400, width: 120, height: 40 }, { x: 1250, y: 350, width: 120, height: 40 },
            { x: 1450, y: 300, width: 120, height: 40 }, { x: 1650, y: 350, width: 120, height: 40 },
            { x: 1850, y: 400, width: 120, height: 40 }, { x: 2050, y: 450, width: 120, height: 40 },
            { x: 2250, y: 500, width: 120, height: 40 }, { x: 2450, y: 550, width: 120, height: 40 },
            { x: 2650, y: 580, width: 1350, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 3980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    },
    {
        name: "القفز العالي", width: 3500, startX: 80, startY: 550, goalX: 3400, goalY: 300,
        platforms: [
            { x: 0, y: 580, width: 300, height: 40 }, { x: 350, y: 550, width: 100, height: 40 },
            { x: 500, y: 500, width: 100, height: 40 }, { x: 650, y: 450, width: 100, height: 40 },
            { x: 800, y: 400, width: 100, height: 40 }, { x: 950, y: 350, width: 100, height: 40 },
            { x: 1100, y: 300, width: 100, height: 40 }, { x: 1250, y: 250, width: 100, height: 40 },
            { x: 1400, y: 200, width: 100, height: 40 }, { x: 1550, y: 250, width: 100, height: 40 },
            { x: 1700, y: 300, width: 100, height: 40 }, { x: 1850, y: 350, width: 100, height: 40 },
            { x: 2000, y: 400, width: 100, height: 40 }, { x: 2150, y: 450, width: 100, height: 40 },
            { x: 2300, y: 500, width: 100, height: 40 }, { x: 2450, y: 550, width: 100, height: 40 },
            { x: 2600, y: 580, width: 900, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 3480, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    },
    {
        name: "المنعطفات", width: 4500, startX: 80, startY: 500, goalX: 4400, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 350, height: 40 }, { x: 400, y: 550, width: 100, height: 40 },
            { x: 550, y: 500, width: 100, height: 40 }, { x: 700, y: 450, width: 100, height: 40 },
            { x: 850, y: 400, width: 100, height: 40 }, { x: 1000, y: 350, width: 100, height: 40 },
            { x: 1150, y: 300, width: 100, height: 40 }, { x: 1300, y: 250, width: 100, height: 40 },
            { x: 1450, y: 200, width: 100, height: 40 }, { x: 1600, y: 250, width: 100, height: 40 },
            { x: 1750, y: 300, width: 100, height: 40 }, { x: 1900, y: 350, width: 100, height: 40 },            { x: 2050, y: 400, width: 100, height: 40 }, { x: 2200, y: 450, width: 100, height: 40 },
            { x: 2350, y: 500, width: 100, height: 40 }, { x: 2500, y: 550, width: 100, height: 40 },
            { x: 2650, y: 500, width: 100, height: 40 }, { x: 2800, y: 450, width: 100, height: 40 },
            { x: 2950, y: 400, width: 100, height: 40 }, { x: 3100, y: 350, width: 100, height: 40 },
            { x: 3250, y: 400, width: 100, height: 40 }, { x: 3400, y: 450, width: 100, height: 40 },
            { x: 3550, y: 500, width: 100, height: 40 }, { x: 3700, y: 550, width: 100, height: 40 },
            { x: 3850, y: 580, width: 650, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 4480, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    },
    {
        name: "السرعة", width: 5000, startX: 80, startY: 500, goalX: 4900, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 400, height: 40 }, { x: 450, y: 560, width: 150, height: 40 },
            { x: 650, y: 540, width: 150, height: 40 }, { x: 850, y: 520, width: 150, height: 40 },
            { x: 1050, y: 500, width: 150, height: 40 }, { x: 1250, y: 480, width: 150, height: 40 },
            { x: 1450, y: 460, width: 150, height: 40 }, { x: 1650, y: 440, width: 150, height: 40 },
            { x: 1850, y: 420, width: 150, height: 40 }, { x: 2050, y: 400, width: 150, height: 40 },
            { x: 2250, y: 420, width: 150, height: 40 }, { x: 2450, y: 440, width: 150, height: 40 },
            { x: 2650, y: 460, width: 150, height: 40 }, { x: 2850, y: 480, width: 150, height: 40 },
            { x: 3050, y: 500, width: 150, height: 40 }, { x: 3250, y: 520, width: 150, height: 40 },
            { x: 3450, y: 540, width: 150, height: 40 }, { x: 3650, y: 560, width: 150, height: 40 },
            { x: 3850, y: 580, width: 1150, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 4980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [],
        movingPlatforms: [
            { x: 500, y: 500, endX: 550, endY: 500, speed: 3 }, { x: 1000, y: 450, endX: 1050, endY: 450, speed: 3 },
            { x: 1500, y: 400, endX: 1550, endY: 400, speed: 3 }, { x: 2000, y: 350, endX: 2050, endY: 350, speed: 3 },
            { x: 2500, y: 400, endX: 2550, endY: 400, speed: 3 }, { x: 3000, y: 450, endX: 3050, endY: 450, speed: 3 },
            { x: 3500, y: 500, endX: 3550, endY: 500, speed: 3 }
        ],
        buttons: [], doors: []
    },
    {
        name: "التحدي الطويل", width: 6000, startX: 80, startY: 500, goalX: 5900, goalY: 400,
        platforms: [
            { x: 0, y: 580, width: 300, height: 40 }, { x: 350, y: 550, width: 100, height: 40 },
            { x: 500, y: 500, width: 100, height: 40 }, { x: 650, y: 450, width: 100, height: 40 },
            { x: 800, y: 400, width: 100, height: 40 }, { x: 950, y: 350, width: 100, height: 40 },
            { x: 1100, y: 300, width: 100, height: 40 }, { x: 1250, y: 250, width: 100, height: 40 },
            { x: 1400, y: 200, width: 100, height: 40 }, { x: 1550, y: 250, width: 100, height: 40 },
            { x: 1700, y: 300, width: 100, height: 40 }, { x: 1850, y: 350, width: 100, height: 40 },
            { x: 2000, y: 400, width: 100, height: 40 }, { x: 2150, y: 450, width: 100, height: 40 },
            { x: 2300, y: 500, width: 100, height: 40 }, { x: 2450, y: 550, width: 100, height: 40 },
            { x: 2600, y: 500, width: 100, height: 40 }, { x: 2750, y: 450, width: 100, height: 40 },
            { x: 2900, y: 400, width: 100, height: 40 }, { x: 3050, y: 350, width: 100, height: 40 },
            { x: 3200, y: 300, width: 100, height: 40 }, { x: 3350, y: 250, width: 100, height: 40 },
            { x: 3500, y: 200, width: 100, height: 40 }, { x: 3650, y: 250, width: 100, height: 40 },
            { x: 3800, y: 300, width: 100, height: 40 }, { x: 3950, y: 350, width: 100, height: 40 },
            { x: 4100, y: 400, width: 100, height: 40 }, { x: 4250, y: 450, width: 100, height: 40 },            { x: 4400, y: 500, width: 100, height: 40 }, { x: 4550, y: 550, width: 100, height: 40 },
            { x: 4700, y: 580, width: 1300, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 5980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [],
        movingPlatforms: [
            { x: 500, y: 480, endX: 550, endY: 480, speed: 2 }, { x: 1200, y: 280, endX: 1250, endY: 280, speed: 2 },
            { x: 1900, y: 330, endX: 1950, endY: 330, speed: 2 }, { x: 2700, y: 480, endX: 2750, endY: 480, speed: 2 },
            { x: 3400, y: 230, endX: 3450, endY: 230, speed: 2 }, { x: 4100, y: 380, endX: 4150, endY: 380, speed: 2 },
            { x: 4800, y: 530, endX: 4850, endY: 530, speed: 2 }
        ],
        buttons: [], doors: []
    },
    {
        name: "النهاية", width: 5000, startX: 80, startY: 500, goalX: 4900, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 350, height: 40 }, { x: 400, y: 560, width: 120, height: 40 },
            { x: 570, y: 540, width: 120, height: 40 }, { x: 740, y: 520, width: 120, height: 40 },
            { x: 910, y: 500, width: 120, height: 40 }, { x: 1080, y: 480, width: 120, height: 40 },
            { x: 1250, y: 460, width: 120, height: 40 }, { x: 1420, y: 440, width: 120, height: 40 },
            { x: 1590, y: 420, width: 120, height: 40 }, { x: 1760, y: 400, width: 120, height: 40 },
            { x: 1930, y: 380, width: 120, height: 40 }, { x: 2100, y: 360, width: 120, height: 40 },
            { x: 2270, y: 380, width: 120, height: 40 }, { x: 2440, y: 400, width: 120, height: 40 },
            { x: 2610, y: 420, width: 120, height: 40 }, { x: 2780, y: 440, width: 120, height: 40 },
            { x: 2950, y: 460, width: 120, height: 40 }, { x: 3120, y: 480, width: 120, height: 40 },
            { x: 3290, y: 500, width: 120, height: 40 }, { x: 3460, y: 520, width: 120, height: 40 },
            { x: 3630, y: 540, width: 120, height: 40 }, { x: 3800, y: 560, width: 120, height: 40 },
            { x: 3970, y: 580, width: 1030, height: 40 }, { x: 0, y: 0, width: 20, height: 640 }, { x: 4980, y: 0, width: 20, height: 640 }
        ],
        spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: []
    }
];