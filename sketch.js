let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = "none"; // stone, paper, scissors

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handReady);
  handpose.on('predict', results => {
    handPredictions = results;
    if (handPredictions.length > 0) {
      gesture = detectGesture(handPredictions[0].landmarks);
    }
  });
}

function modelReady() {}
function handReady() {}

function draw() {
  image(video, 0, 0, width, height);

  // Debug: 顯示偵測到的臉部數量
  fill(0, 255, 0);
  noStroke();
  textSize(24);
  text("faces: " + predictions.length, 10, 30);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    // Debug: 顯示鼻子座標
    const [nx, ny] = keypoints[94];
    fill(255, 255, 0);
    noStroke();
    ellipse(nx, ny, 10, 10); // 在鼻子畫一個小黃點

    let x, y;
    if (gesture === "stone") {
      [x, y] = keypoints[10]; // 額頭
    } else if (gesture === "scissors") {
      const [x1, y1] = keypoints[33];
      const [x2, y2] = keypoints[263];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else if (gesture === "paper") {
      const [x1, y1] = keypoints[234];
      const [x2, y2] = keypoints[454];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else {
      [x, y] = keypoints[94]; // 鼻尖（鼻子正中央）
    }

    noFill();
    stroke(255, 0, 0); // 紅色
    strokeWeight(8);
    ellipse(x, y, 50, 50);
  }
