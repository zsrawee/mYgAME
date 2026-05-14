const levels = [
  // 0 — Follow Standard
  { name: "Follow 1:1", camera: { type: 'follow', zoom: 1, lerpX: 0.2, lerpY: 0.2, deadzoneX: 0.2, deadzoneY: 0.2 } },
  // 1 — Follow Zoomed In + Smooth
  { name: "Zoom 1.5 Smooth", camera: { type: 'follow', zoom: 1.5, lerpX: 0.08, lerpY: 0.08, deadzoneX: 0.1, deadzoneY: 0.1 } },
  // 2 — Follow Zoomed Out + Snappy
  { name: "Zoom 0.7 Snappy", camera: { type: 'follow', zoom: 0.7, lerpX: 0.3, lerpY: 0.3, deadzoneX: 0.3, deadzoneY: 0.3 } },
  // 3 — Static Fixed
  { name: "Static Center", camera: { type: 'static', zoom: 1, x: 480, y: 320 } },
  // 4 — Follow Very Slow
  { name: "Very Slow Follow", camera: { type: 'follow', zoom: 1, lerpX: 0.04, lerpY: 0.04, deadzoneX: 0.4, deadzoneY: 0.4 } },
  // 5 — Follow Zoomed In + Snappy
  { name: "Zoom 1.8 Snappy", camera: { type: 'follow', zoom: 1.8, lerpX: 0.3, lerpY: 0.3, deadzoneX: 0.05, deadzoneY: 0.05 } },
  // 6 — Static Left
  { name: "Static Left", camera: { type: 'static', zoom: 1, x: 150, y: 320 } },
  // 7 — Follow Medium
  { name: "Zoom 0.85 Medium", camera: { type: 'follow', zoom: 0.85, lerpX: 0.15, lerpY: 0.15, deadzoneX: 0.2, deadzoneY: 0.2 } },
  // 8 — Follow Tight
  { name: "Tight Follow", camera: { type: 'follow', zoom: 1.2, lerpX: 0.25, lerpY: 0.25, deadzoneX: 0.03, deadzoneY: 0.03 } },
  // 9 — Follow Wide + Smooth
  { name: "Zoom 0.6 Wide", camera: { type: 'follow', zoom: 0.6, lerpX: 0.1, lerpY: 0.1, deadzoneX: 0.25, deadzoneY: 0.25 } },
];

const basePlatforms = [
  { x: 0, y: 580, width: 960, height: 40 },
  { x: 0, y: 0, width: 20, height: 640 },
  { x: 940, y: 0, width: 20, height: 640 },
];

const LevelData = levels.map((l, i) => ({
  name: l.name,
  width: 960, height: 640,
  startX: 80, startY: 500,
  goalX: 880, goalY: 500,
  goal: { type: 'level', index: (i + 1) % levels.length },
  camera: l.camera,
  platforms: [
    ...basePlatforms,
    { x: 200, y: 460, width: 60, height: 20 },
    { x: 400, y: 380, width: 80, height: 20 },
    { x: 600, y: 460, width: 60, height: 20 },
    { x: 750, y: 350, width: 60, height: 20 },
  ],
  spikes: [], saws: [], movingPlatforms: [], buttons: [], doors: [], portals: [],
}));

export default LevelData;
