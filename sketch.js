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

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    let x, y;

    // 根據手勢決定圓圈位置
    if (gesture === "stone") {
      // 額頭 (第10點)
      [x, y] = keypoints[10];
    } else if (gesture === "scissors") {
      // 左右眼睛中點 (第33, 263點)
      const [x1, y1] = keypoints[33];
      const [x2, y2] = keypoints[263];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else if (gesture === "paper") {
      // 左右臉頰中點 (第234, 454點)
      const [x1, y1] = keypoints[234];
      const [x2, y2] = keypoints[454];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else {
      // 預設鼻子 (第94點)
      [x, y] = keypoints[94];
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }
}

// 簡單手勢辨識：根據手指伸展情況判斷剪刀石頭布
function detectGesture(landmarks) {
  // 取得每根手指的指尖與掌心距離
  // landmarks: [21][x, y, z]
  // 指尖: 8(食), 12(中), 16(無), 20(小)
  // 掌心: 0
  const palm = landmarks[0];
  const tips = [8, 12, 16, 20].map(i => landmarks[i]);
  const dists = tips.map(tip => dist(palm[0], palm[1], tip[0], tip[1]));

  // 判斷規則（簡化版）：
  // 石頭：所有手指都彎曲（距離小於40）
  // 布：所有手指都伸直（距離大於80）
  // 剪刀：食指與中指伸直，其餘彎曲
  if (dists.every(d => d < 40)) return "stone";
  if (dists.every(d => d > 80)) return "paper";
  if (dists[0] > 80 && dists[1] > 80 && dists[2] < 40 && dists[3] < 40) return "scissors";
  return "none";
}
