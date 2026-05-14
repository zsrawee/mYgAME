const LevelData = [
    {
        name: "TEST",
        width: 2000, height: 640,
        startX: 80, startY: 500, goalX: 1900, goalY: 500,
        platforms: [
            { x: 0, y: 580, width: 2000, height: 40 },
            { x: 0, y: 0, width: 20, height: 640 },
            { x: 1980, y: 0, width: 20, height: 640 }
        ],
        spikes: [],
        saws: [],
        movingPlatforms: [],
        buttons: [],
        doors: [],
        rooms: [
            {
                name: "Room 1",
                entryZone: { x: 300, y: 545, width: 120, height: 80 },
                roomData: {
                    name: "Room 1",
                    width: 600, height: 600,
                    startX: 50, startY: 500, goalX: 550, goalY: 500,
                    platforms: [
                        { x: 300, y: 580, width: 600, height: 40 },
                        { x: 150, y: 480, width: 80, height: 20 },
                        { x: 300, y: 400, width: 80, height: 20 },
                        { x: 450, y: 480, width: 80, height: 20 },
                        { x: 0, y: 0, width: 20, height: 600 },
                        { x: 580, y: 0, width: 20, height: 600 }
                    ],
                    spikes: [],
                    saws: [], movingPlatforms: [], buttons: [], doors: [],
                    rooms: [
                        {
                            name: "Room 1.1",
                            entryZone: { x: 120, y: 530, width: 60, height: 50 },
                            roomData: {
                                name: "Room 1.1",
                                width: 400, height: 400,
                                startX: 50, startY: 300, goalX: 350, goalY: 300,
                                platforms: [
                                    { x: 200, y: 380, width: 400, height: 40 },
                                    { x: 100, y: 280, width: 60, height: 20 },
                                    { x: 300, y: 200, width: 60, height: 20 },
                                    { x: 0, y: 0, width: 20, height: 400 },
                                    { x: 380, y: 0, width: 20, height: 400 }
                                ],
                                spikes: [],
                                saws: [], movingPlatforms: [], buttons: [], doors: [],
                                rooms: []
                            }
                        }
                    ]
                }
            }
        ]
    }
];

export default LevelData;
