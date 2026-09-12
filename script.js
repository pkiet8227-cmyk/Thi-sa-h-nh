/* =========================================================
   THI SÁT HÌNH Ô TÔ
   SCRIPT.JS
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {

  transmission: "MT",

  mode: "practice",

  running: false,

  paused: false,

  camera: "front",

  score: 100,

  faults: 0,

  elapsed: 0,

  speed: 0,

  rpm: 800,

  gear: "N",

  steering: 0,

  throttle: 0,

  brake: 0,

  clutch: 0,

  positionX: 0,

  positionZ: 0,

  heading: 0,

  distance: 0,

  taskIndex: 0,

  lookX: 0,

  lookY: 0,

  lastTime: 0,

  timerId: null,

  animationId: null,

  faultCooldown: 0,

  messageTimer: null,

  drag: {

    active: false,

    startX: 0,

    startY: 0,

    lastX: 0,

    lastY: 0

  },

  keys: {

    w: false,

    s: false,

    a: false,

    d: false,

    space: false

  }

};


/* =========================================================
   TASKS
   ========================================================= */

const tasks = [

  {
    title: "Xuất phát",
    description: "Thắt dây an toàn và bắt đầu di chuyển.",
    distance: 30
  },

  {
    title: "Dừng vạch",
    description: "Giảm tốc và dừng đúng khu vực quy định.",
    distance: 70
  },

  {
    title: "Khởi hành ngang dốc",
    description: "Giữ xe ổn định và không để trôi xe.",
    distance: 120
  },

  {
    title: "Vệt bánh xe",
    description: "Đi đúng làn, tránh đè vạch.",
    distance: 180
  },

  {
    title: "Ngã tư",
    description: "Quan sát hai bên trước khi đi qua giao lộ.",
    distance: 245
  },

  {
    title: "Đường quanh co",
    description: "Đi chậm và điều khiển vô-lăng chính xác.",
    distance: 320
  },

  {
    title: "Ghép xe",
    description: "Điều khiển xe vào khu vực ghép xe.",
    distance: 395
  },

  {
    title: "Lùi xe",
    description: "Chọn số lùi và quan sát gương.",
    distance: 455
  },

  {
    title: "Tăng tốc",
    description: "Di chuyển ổn định và giữ đúng hướng.",
    distance: 520
  },

  {
    title: "Kết thúc",
    description: "Đưa xe về vị trí kết thúc bài thi.",
    distance: 590
  }

];


/* =========================================================
   DOM
   ========================================================= */

const $ = id => document.getElementById(id);

const menuScreen = $("menuScreen");

const gameScreen = $("gameScreen");

const startGameButton = $("startGameButton");

const mtButton = $("mtButton");

const atButton = $("atButton");

const practiceButton = $("practiceButton");

const testButton = $("testButton");

const manualGearPanel = $("manualGearPanel");

const automaticGearPanel = $("automaticGearPanel");

const transmissionLabel = $("transmissionLabel");

const gearHelpText = $("gearHelpText");

const gearValue = $("gearValue");

const speedValue = $("speedValue");

const rpmValue = $("rpmValue");

const scoreValue = $("scoreValue");

const faultValue = $("faultValue");

const timeValue = $("timeValue");

const steeringValue = $("steeringValue");

const steeringWheel = $("steeringWheel");

const clutchPedal = $("clutchPedal");

const brakePedal = $("brakePedal");

const acceleratorPedal = $("acceleratorPedal");

const gameCanvas = $("gameCanvas");

const leftMirrorCanvas = $("leftMirrorCanvas");

const centerMirrorCanvas = $("centerMirrorCanvas");

const rightMirrorCanvas = $("rightMirrorCanvas");

const cameraLabel = $("cameraLabel");

const lookIndicator = $("lookIndicator");

const dragHint = document.querySelector(".drag-hint");

const taskNumber = $("taskNumber");

const taskTitle = $("taskTitle");

const taskDescription = $("taskDescription");

const taskProgressValue = $("taskProgressValue");

const taskProgressBar = $("taskProgressBar");

const gameMessage = $("gameMessage");

const gameMessageTitle = $("gameMessageTitle");

const gameMessageText = $("gameMessageText");

const pauseButton = $("pauseButton");

const pauseOverlay = $("pauseOverlay");

const resumeButton = $("resumeButton");

const restartButton = $("restartButton");

const menuButton = $("menuButton");

const exitGameButton = $("exitGameButton");

const resultOverlay = $("resultOverlay");

const retryButton = $("retryButton");

const resultMenuButton = $("resultMenuButton");

const finalScore = $("finalScore");

const finalTime = $("finalTime");

const finalFaults = $("finalFaults");

const finalTasks = $("finalTasks");

const resultTitle = $("resultTitle");

const resultMessage = $("resultMessage");

const faultToast = $("faultToast");

const faultTitle = $("faultTitle");

const faultText = $("faultText");

const faultPenalty = $("faultPenalty");

const keyboardHelp = $("keyboardHelp");

const closeKeyboardHelp = $("closeKeyboardHelp");


/* =========================================================
   CANVAS
   ========================================================= */

const ctx = gameCanvas.getContext("2d");

const leftCtx = leftMirrorCanvas.getContext("2d");

const centerCtx = centerMirrorCanvas.getContext("2d");

const rightCtx = rightMirrorCanvas.getContext("2d");


/* =========================================================
   RESIZE
   ========================================================= */

function resizeCanvas() {

  const rect = gameCanvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  gameCanvas.width = Math.max(1, Math.floor(rect.width * dpr));

  gameCanvas.height = Math.max(1, Math.floor(rect.height * dpr));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

}


function resizeMirror(canvas, context) {

  const rect = canvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.max(1, Math.floor(rect.width * dpr));

  canvas.height = Math.max(1, Math.floor(rect.height * dpr));

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

}


function resizeAll() {

  resizeCanvas();

  resizeMirror(leftMirrorCanvas, leftCtx);

  resizeMirror(centerMirrorCanvas, centerCtx);

  resizeMirror(rightMirrorCanvas, rightCtx);

}


window.addEventListener("resize", resizeAll);


/* =========================================================
   MENU
   ========================================================= */

function selectTransmission(type) {

  state.transmission = type;

  mtButton.classList.toggle("active", type === "MT");

  atButton.classList.toggle("active", type === "AT");

  manualGearPanel.classList.toggle(
    "hidden",
    type !== "MT"
  );

  automaticGearPanel.classList.toggle(
    "hidden",
    type !== "AT"
  );

  transmissionLabel.textContent =
    type === "MT"
      ? "SỐ SÀN"
      : "SỐ TỰ ĐỘNG";

  gearHelpText.textContent =
    type === "MT"
      ? "Đạp côn để chuyển số"
      : "Đạp phanh để chuyển P/R/N/D";

  if (type === "MT") {

    state.gear = "N";

    state.clutch = 0;

  } else {

    state.gear = "P";

  }

  updateGearUI();

}


function selectMode(mode) {

  state.mode = mode;

  practiceButton.classList.toggle(
    "active",
    mode === "practice"
  );

  testButton.classList.toggle(
    "active",
    mode === "test"
  );

}


mtButton.addEventListener(
  "click",
  () => selectTransmission("MT")
);


atButton.addEventListener(
  "click",
  () => selectTransmission("AT")
);


practiceButton.addEventListener(
  "click",
  () => selectMode("practice")
);


testButton.addEventListener(
  "click",
  () => selectMode("test")
);


/* =========================================================
   START
   ========================================================= */

startGameButton.addEventListener(
  "click",
  startGame
);


function startGame() {

  resetGame();

  menuScreen.classList.add("hidden");

  gameScreen.classList.remove("hidden");

  state.running = true;

  state.paused = false;

  state.lastTime = performance.now();

  resizeAll();

  showMessage(
    "BẮT ĐẦU",
    "Kiểm tra gương và bắt đầu di chuyển."
  );

  cancelAnimationFrame(state.animationId);

  state.animationId =
    requestAnimationFrame(gameLoop);

  updateTimerDisplay();

}


/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

  state.running = false;

  state.paused = false;

  state.camera = "front";

  state.score = 100;

  state.faults = 0;

  state.elapsed = 0;

  state.speed = 0;

  state.rpm = 800;

  state.steering = 0;

  state.throttle = 0;

  state.brake = 0;

  state.clutch = 0;

  state.positionX = 0;

  state.positionZ = 0;

  state.heading = 0;

  state.distance = 0;

  state.taskIndex = 0;

  state.lookX = 0;

  state.lookY = 0;

  state.faultCooldown = 0;

  if (state.transmission === "MT") {

    state.gear = "N";

  } else {

    state.gear = "P";

  }

  state.keys.w = false;

  state.keys.s = false;

  state.keys.a = false;

  state.keys.d = false;

  state.keys.space = false;

  updateAllUI();

}


/* =========================================================
   CAMERA
   ========================================================= */

const cameraButtons =
  document.querySelectorAll(".camera-button");


cameraButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const camera =
        button.dataset.camera;

      setCamera(camera);

    }
  );

});


function setCamera(camera) {

  state.camera = camera;

  cameraButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.camera === camera
    );

  });

  const labels = {

    front: "CAM TRƯỚC",

    left: "CAM QUA VAI TRÁI",

    right: "CAM QUA VAI PHẢI",

    rear: "CAM PHÍA SAU",

    top: "CAM SA HÌNH"

  };

  cameraLabel.textContent =
    labels[camera] || "CAMERA";

  state.lookX = 0;

  state.lookY = 0;

}


/* =========================================================
   TOUCH CAMERA DRAG
   ========================================================= */

const viewport =
  document.getElementById("viewport");


viewport.addEventListener(
  "pointerdown",
  event => {

    if (!state.running || state.paused) {
      return;
    }

    state.drag.active = true;

    state.drag.startX = event.clientX;

    state.drag.startY = event.clientY;

    state.drag.lastX = event.clientX;

    state.drag.lastY = event.clientY;

    viewport.setPointerCapture?.(
      event.pointerId
    );

    dragHint.style.opacity = "0";

  }
);


viewport.addEventListener(
  "pointermove",
  event => {

    if (!state.drag.active) {
      return;
    }

    const dx =
      event.clientX - state.drag.lastX;

    const dy =
      event.clientY - state.drag.lastY;

    state.drag.lastX = event.clientX;

    state.drag.lastY = event.clientY;

    state.lookX += dx * 0.7;

    state.lookY += dy * 0.45;

    state.lookX =
      clamp(state.lookX, -100, 100);

    state.lookY =
      clamp(state.lookY, -55, 55);

  }
);


viewport.addEventListener(
  "pointerup",
  () => {

    state.drag.active = false;

  }
);


viewport.addEventListener(
  "pointercancel",
  () => {

    state.drag.active = false;

  }
);


/* =========================================================
   STEERING WHEEL
   ========================================================= */

let steeringPointer = null;


steeringWheel.addEventListener(
  "pointerdown",
  event => {

    if (!state.running || state.paused) {
      return;
    }

    steeringPointer = event.pointerId;

    steeringWheel.setPointerCapture?.(
      event.pointerId
    );

    updateSteeringFromPointer(event);

  }
);


steeringWheel.addEventListener(
  "pointermove",
  event => {

    if (event.pointerId !== steeringPointer) {
      return;
    }

    updateSteeringFromPointer(event);

  }
);


steeringWheel.addEventListener(
  "pointerup",
  event => {

    if (event.pointerId === steeringPointer) {

      steeringPointer = null;

    }

  }
);


steeringWheel.addEventListener(
  "pointercancel",
  () => {

    steeringPointer = null;

  }
);


function updateSteeringFromPointer(event) {

  const rect =
    steeringWheel.getBoundingClientRect();

  const cx =
    rect.left + rect.width / 2;

  const cy =
    rect.top + rect.height / 2;

  const angle =
    Math.atan2(
      event.clientY - cy,
      event.clientX - cx
    ) * 180 / Math.PI + 90;

  let normalized = angle;

  while (normalized > 180) {
    normalized -= 360;
  }

  while (normalized < -180) {
    normalized += 360;
  }

  state.steering =
    clamp(normalized, -180, 180);

}


/* =========================================================
   DOUBLE TAP / POINTER ON PEDALS
   ========================================================= */

function setupPedal(
  element,
  property
) {

  if (!element) return;

  const press = event => {

    event.preventDefault();

    state[property] = 1;

    element.classList.add("pressed");

  };

  const release = event => {

    event.preventDefault();

    state[property] = 0;

    element.classList.remove("pressed");

  };

  element.addEventListener(
    "pointerdown",
    press
  );

  element.addEventListener(
    "pointerup",
    release
  );

  element.addEventListener(
    "pointercancel",
    release
  );

  element.addEventListener(
    "pointerleave",
    event => {

      if (event.buttons === 0) {
        release(event);
      }

    }
  );

}


setupPedal(
  clutchPedal,
  "clutch"
);


setupPedal(
  brakePedal,
  "brake"
);


setupPedal(
  acceleratorPedal,
  "throttle"
);


/* =========================================================
   GEAR
   ========================================================= */

document
  .querySelectorAll(".gear-panel button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectGear(
          button.dataset.gear
        );

      }
    );

  });


function selectGear(newGear) {

  if (!state.running || state.paused) {
    return;
  }

  if (state.transmission === "MT") {

    if (
      state.speed > 3 &&
      state.clutch < 0.6
    ) {

      addFault(
        "CHUYỂN SỐ SAI",
        "Với số sàn cần đạp côn trước khi chuyển số.",
        2
      );

      return;

    }

    state.gear = newGear;

    showMessage(
      "SỐ",
      `Đã vào số ${newGear}.`
    );

  } else {

    if (
      state.gear !== newGear &&
      state.brake < 0.5
    ) {

      addFault(
        "CHƯA ĐẠP PHANH",
        "Hãy đạp phanh trước khi chuyển P/R/N/D.",
        2
      );

      return;

    }

    state.gear = newGear;

  }

  updateGearUI();

}


function updateGearUI() {

  gearValue.textContent =
    state.gear;

  document
    .querySelectorAll(".gear-panel button")
    .forEach(button => {

      const active =
        button.dataset.gear === state.gear;

      button.classList.toggle(
        "active",
        active
      );

    });

}


/* =========================================================
   KEYBOARD
   ========================================================= */

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();

    if (
      key === "w" ||
      key === "s" ||
      key === "a" ||
      key === "d" ||
      event.code === "Space"
    ) {

      event.preventDefault();

    }

    if (key === "w") {
      state.keys.w = true;
    }

    if (key === "s") {
      state.keys.s = true;
    }

    if (key === "a") {
      state.keys.a = true;
    }

    if (key === "d") {
      state.keys.d = true;
    }

    if (event.code === "Space") {
      state.keys.space = true;
    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    const key =
      event.key.toLowerCase();

    if (key === "w") {
      state.keys.w = false;
    }

    if (key === "s") {
      state.keys.s = false;
    }

    if (key === "a") {
      state.keys.a = false;
    }

    if (key === "d") {
      state.keys.d = false;
    }

    if (event.code === "Space") {
      state.keys.space = false;
    }

  }
);


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

  if (!state.running) {
    return;
  }

  if (!state.lastTime) {
    state.lastTime = timestamp;
  }

  let dt =
    (timestamp - state.lastTime) / 1000;

  state.lastTime = timestamp;

  dt = Math.min(dt, 0.05);

  if (!state.paused) {

    updateInput();

    updatePhysics(dt);

    updateTasks();

    updateFaultSystem(dt);

    state.elapsed += dt;

  }

  drawScene();

  updateMirrors();

  updateAllUI();

  state.animationId =
    requestAnimationFrame(gameLoop);

}


/* =========================================================
   INPUT
   ========================================================= */

function updateInput() {

  if (state.keys.w) {
    state.throttle = 1;
  } else if (!acceleratorPedal.matches(".pressed")) {
    state.throttle = 0;
  }

  if (
    state.keys.s ||
    state.keys.space
  ) {

    state.brake = 1;

  } else if (!brakePedal.matches(".pressed")) {

    state.brake = 0;

  }

  if (
    state.keys.a &&
    !state.drag.active
  ) {

    state.steering -= 3;

  }

  if (
    state.keys.d &&
    !state.drag.active
  ) {

    state.steering += 3;

  }

  state.steering =
    clamp(state.steering, -180, 180);

}


/* =========================================================
   PHYSICS
   ========================================================= */

function updatePhysics(dt) {

  const throttle =
    clamp(state.throttle, 0, 1);

  const brake =
    clamp(state.brake, 0, 1);

  const clutch =
    clamp(state.clutch, 0, 1);

  let driveForce = 0;

  let maxSpeed = 0;

  if (state.transmission === "MT") {

    const gearRatios = {

      R: -0.35,

      1: 0.38,

      2: 0.62,

      3: 0.86,

      4: 1.08,

      5: 1.32,

      N: 0

    };

    const ratio =
      gearRatios[state.gear] || 0;

    if (state.gear !== "N") {

      if (clutch > 0.5) {

        driveForce =
          throttle *
          ratio *
          24;

      } else {

        driveForce =
          throttle *
          ratio *
          10;

      }

      maxSpeed =
        Math.abs(ratio) * 72;

    }

    if (
      state.gear !== "N" &&
      state.gear !== "R" &&
      clutch < 0.15 &&
      throttle < 0.05 &&
      state.speed < 5
    ) {

      driveForce -= 4;

    }

  } else {

    if (state.gear === "D") {

      driveForce =
        throttle * 25 + 2;

      maxSpeed = 120;

    }

    if (state.gear === "R") {

      driveForce =
        -(throttle * 18 + 1.5);

      maxSpeed = 30;

    }

  }


  /* Brake */

  if (brake > 0) {

    state.speed -=
      brake * 35 * dt;

  }


  /* Drive */

  state.speed +=
    driveForce * dt;


  /* Rolling resistance */

  if (
    throttle < 0.05 &&
    brake < 0.05
  ) {

    state.speed *=
      Math.pow(.992, dt * 60);

  }


  state.speed =
    clamp(
      state.speed,
      state.transmission === "AT" &&
      state.gear === "R"
        ? -maxSpeed
        : 0,
      maxSpeed || 0
    );


  /* If reversing, keep negative */

  if (
    state.transmission === "AT" &&
    state.gear === "R"
  ) {

    if (state.speed > 0) {
      state.speed = -state.speed;
    }

  } else {

    if (state.speed < 0) {
      state.speed = 0;
    }

  }


  /* Direction */

  const direction =
    state.speed >= 0 ? 1 : -1;


  /* Steering */

  const steeringFactor =
    state.steering / 180;


  state.heading +=
    steeringFactor *
    Math.abs(state.speed) *
    0.012 *
    dt *
    60 *
    direction;


  /* Position */

  const speedUnits =
    state.speed * 0.018 * dt;

  state.positionZ +=
    speedUnits *
    Math.cos(state.heading);

  state.positionX +=
    speedUnits *
    Math.sin(state.heading);

  state.distance +=
    Math.abs(speedUnits) * 100;


  /* RPM */

  if (state.transmission === "MT") {

    if (state.gear === "N") {

      state.rpm =
        800 + throttle * 2600;

    } else {

      const gearNumber =
        state.gear === "R"
          ? 1
          : Number(state.gear) || 1;

      state.rpm =
        800 +
        Math.abs(state.speed) *
        (280 - gearNumber * 35) +
        throttle * 1600;

    }

  } else {

    state.rpm =
      700 +
      Math.abs(state.speed) * 40 +
      throttle * 1500;

  }

  state.rpm =
    clamp(state.rpm, 650, 5500);

}


/* =========================================================
   TASK SYSTEM
   ========================================================= */

function updateTasks() {

  if (
    state.taskIndex >= tasks.length
  ) {
    finishGame();
    return;
  }

  const task =
    tasks[state.taskIndex];

  const target =
    task.distance;

  if (
    state.distance >= target
  ) {

    completeTask();

  }

}


function completeTask() {

  const finished =
    tasks[state.taskIndex];

  state.taskIndex++;

  if (
    state.taskIndex >= tasks.length
  ) {

    finishGame();

    return;

  }

  state.score =
    clamp(
      state.score + 2,
      0,
      100
    );

  const next =
    tasks[state.taskIndex];

  showMessage(
    "HOÀN THÀNH",
    `${finished.title} → ${next.title}`
  );

}


/* =========================================================
   FAULT SYSTEM
   ========================================================= */

function updateFaultSystem(dt) {

  state.faultCooldown -= dt;

  if (state.faultCooldown > 0) {
    return;
  }

  /*
    Mô phỏng một số lỗi cơ bản.
  */

  if (
    Math.abs(state.positionX) > 1.8 &&
    Math.abs(state.speed) > 8
  ) {

    addFault(
      "ĐÈ VẠCH",
      "Xe đang lệch khỏi vùng chạy mô phỏng.",
      3
    );

    state.faultCooldown = 4;

    return;

  }


  if (
    state.transmission === "MT" &&
    state.gear !== "N" &&
    state.clutch < 0.05 &&
    state.speed < 2 &&
    state.throttle > 0.7
  ) {

    addFault(
      "NGUY CƠ TẮT MÁY",
      "Phối hợp côn và ga chưa đúng.",
      2
    );

    state.faultCooldown = 5;

    return;

  }


  if (
    Math.abs(state.speed) > 55
  ) {

    addFault(
      "TỐC ĐỘ CAO",
      "Hãy giảm tốc độ để kiểm soát xe tốt hơn.",
      2
    );

    state.faultCooldown = 5;

  }

}


function addFault(
  title,
  text,
  penalty
) {

  if (!state.running) {
    return;
  }

  state.faults++;

  state.score =
    clamp(
      state.score - penalty,
      0,
      100
    );

  faultTitle.textContent = title;

  faultText.textContent = text;

  faultPenalty.textContent =
    `-${penalty}`;

  faultToast.classList.remove(
    "hidden"
  );

  clearTimeout(
    addFault.hideTimer
  );

  addFault.hideTimer =
    setTimeout(
      () => {

        faultToast.classList.add(
          "hidden"
        );

      },
      2500
    );

}


/* =========================================================
   MESSAGES
   ========================================================= */

function showMessage(
  title,
  text
) {

  gameMessageTitle.textContent =
    title;

  gameMessageText.textContent =
    text;

  gameMessage.classList.remove(
    "hidden"
  );

  clearTimeout(
    state.messageTimer
  );

  state.messageTimer =
    setTimeout(
      () => {

        gameMessage.classList.add(
          "hidden"
        );

      },
      2200
    );

}


/* =========================================================
   DRAW SCENE
   ========================================================= */

function drawScene() {

  const rect =
    gameCanvas.getBoundingClientRect();

  const width =
    rect.width;

  const height =
    rect.height;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  if (state.camera === "top") {

    drawTopView(
      ctx,
      width,
      height
    );

    return;

  }

  if (state.camera === "left") {

    drawSideView(
      ctx,
      width,
      height,
      -1
    );

    return;

  }

  if (state.camera === "right") {

    drawSideView(
      ctx,
      width,
      height,
      1
    );

    return;

  }

  if (state.camera === "rear") {

    drawRearView(
      ctx,
      width,
      height
    );

    return;

  }

  drawFrontView(
    ctx,
    width,
    height
  );

}


/* =========================================================
   SKY
   ========================================================= */

function drawSky(
  context,
  width,
  horizon
) {

  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      horizon
    );

  gradient.addColorStop(
    0,
    "#77b8dc"
  );

  gradient.addColorStop(
    .45,
    "#a9d7e8"
  );

  gradient.addColorStop(
    1,
    "#d8e7e2"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    width,
    horizon
  );


  /* clouds */

  context.globalAlpha = .35;

  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const x =
      ((i * 173 + 50) % width);

    const y =
      45 + (i % 3) * 30;

    drawCloud(
      context,
      x,
      y,
      45 + (i % 2) * 20
    );

  }

  context.globalAlpha = 1;

}


function drawCloud(
  context,
  x,
  y,
  size
) {

  context.fillStyle =
    "#ffffff";

  context.beginPath();

  context.arc(
    x,
    y,
    size * .32,
    0,
    Math.PI * 2
  );

  context.arc(
    x + size * .35,
    y - size * .1,
    size * .25,
    0,
    Math.PI * 2
  );

  context.arc(
    x + size * .62,
    y,
    size * .28,
    0,
    Math.PI * 2
  );

  context.fill();

}


/* =========================================================
   FRONT VIEW
   ========================================================= */

function drawFrontView(
  context,
  width,
  height
) {

  const horizon =
    height * .43;

  drawSky(
    context,
    width,
    horizon
  );


  /* distant landscape */

  context.fillStyle =
    "#829c76";

  context.fillRect(
    0,
    horizon,
    width,
    height - horizon
  );


  /* distant trees */

  drawTreeLine(
    context,
    width,
    horizon
  );


  /* road */

  const roadTopY =
    horizon + 5;

  const roadBottomY =
    height * .92;

  const center =
    width / 2 -
    state.lookX * .35;

  const roadTopWidth =
    width * .13;

  const roadBottomWidth =
    width * .95;


  context.fillStyle =
    "#424b50";

  context.beginPath();

  context.moveTo(
    center - roadTopWidth / 2,
    roadTopY
  );

  context.lineTo(
    center + roadTopWidth / 2,
    roadTopY
  );

  context.lineTo(
    center + roadBottomWidth / 2,
    roadBottomY
  );

  context.lineTo(
    center - roadBottomWidth / 2,
    roadBottomY
  );

  context.closePath();

  context.fill();


  /* road edges */

  context.strokeStyle =
    "#f2f0dc";

  context.lineWidth = 4;

  context.beginPath();

  context.moveTo(
    center - roadTopWidth / 2,
    roadTopY
  );

  context.lineTo(
    center - roadBottomWidth / 2,
    roadBottomY
  );

  context.moveTo(
    center + roadTopWidth / 2,
    roadTopY
  );

  context.lineTo(
    center + roadBottomWidth / 2,
    roadBottomY
  );

  context.stroke();


  /* lane divider */

  drawPerspectiveDashes(
    context,
    center,
    roadTopY,
    roadBottomY
  );


  /* cones */

  drawPerspectiveCones(
    context,
    width,
    height,
    center
  );


  /* signs */

  drawRoadSigns(
    context,
    width,
    height
  );


  /* car hood */

  drawHood(
    context,
    width,
    height
  );


  /* slight camera movement */

  if (state.lookX !== 0) {

    context.fillStyle =
      "rgba(0,0,0,.08)";

    if (state.lookX < 0) {

      context.fillRect(
        0,
        0,
        width * .07,
        height
      );

    } else {

      context.fillRect(
        width * .93,
        0,
        width * .07,
        height
      );

    }

  }

}


/* =========================================================
   TREES
   ========================================================= */

function drawTreeLine(
  context,
  width,
  horizon
) {

  for (
    let i = 0;
    i < 18;
    i++
  ) {

    const x =
      i * width / 17;

    const size =
      22 + (i % 4) * 9;

    const y =
      horizon + 4;

    drawTree(
      context,
      x,
      y,
      size
    );

  }

}


function drawTree(
  context,
  x,
  y,
  size
) {

  context.fillStyle =
    "#5b4b38";

  context.fillRect(
    x - size * .08,
    y,
    size * .16,
    size * .65
  );


  context.fillStyle =
    "#456c4b";

  context.beginPath();

  context.arc(
    x,
    y - size * .18,
    size * .42,
    0,
    Math.PI * 2
  );

  context.arc(
    x - size * .27,
    y,
    size * .28,
    0,
    Math.PI * 2
  );

  context.arc(
    x + size * .27,
    y,
    size * .28,
    0,
    Math.PI * 2
  );

  context.fill();

}


/* =========================================================
   PERSPECTIVE DASHES
   ========================================================= */

function drawPerspectiveDashes(
  context,
  center,
  top,
  bottom
) {

  const segments = 9;

  for (
    let i = 0;
    i < segments;
    i++
  ) {

    const p1 =
      i / segments;

    const p2 =
      (i + .48) / segments;

    const y1 =
      top +
      (bottom - top) *
      Math.pow(p1, 1.75);

    const y2 =
      top +
      (bottom - top) *
      Math.pow(p2, 1.75);

    const half =
      2 +
      8 * p1;

    context.strokeStyle =
      "#eee7c8";

    context.lineWidth =
      2 + 5 * p1;

    context.beginPath();

    context.moveTo(
      center - half,
      y1
    );

    context.lineTo(
      center + half,
      y2
    );

    context.stroke();

  }

}


/* =========================================================
   CONES
   ========================================================= */

function drawPerspectiveCones(
  context,
  width,
  height,
  center
) {

  const positions = [
    {
      x: -.43,
      y: .62
    },
    {
      x: .42,
      y: .68
    },
    {
      x: -.30,
      y: .77
    },
    {
      x: .30,
      y: .83
    }
  ];

  positions.forEach(
    cone => {

      const y =
        height * cone.y;

      const size =
        5 +
        28 *
        Math.max(
          0,
          (y - height * .43) /
          (height * .5)
        );

      const x =
        center +
        width *
        cone.x *
        ((y - height * .43) /
          (height * .5));

      drawCone(
        context,
        x,
        y,
        size
      );

    }
  );

}


function drawCone(
  context,
  x,
  y,
  size
) {

  context.fillStyle =
    "#ef7b28";

  context.beginPath();

  context.moveTo(
    x,
    y - size
  );

  context.lineTo(
    x - size * .55,
    y
  );

  context.lineTo(
    x + size * .55,
    y
  );

  context.closePath();

  context.fill();


  context.fillStyle =
    "#ffffff";

  context.fillRect(
    x - size * .42,
    y - size * .38,
    size * .84,
    size * .13
  );


  context.fillStyle =
    "#25292c";

  context.fillRect(
    x - size * .65,
    y,
    size * 1.3,
    size * .15
  );

}


/* =========================================================
   ROAD SIGNS
   ========================================================= */

function drawRoadSigns(
  context,
  width,
  height
) {

  drawSign(
    context,
    width * .12,
    height * .43,
    "40"
  );

  drawSign(
    context,
    width * .86,
    height * .46,
    "STOP"
  );

}


function drawSign(
  context,
  x,
  y,
  text
) {

  const poleHeight = 55;

  context.strokeStyle =
    "#59616a";

  context.lineWidth = 3;

  context.beginPath();

  context.moveTo(
    x,
    y
  );

  context.lineTo(
    x,
    y + poleHeight
  );

  context.stroke();


  context.fillStyle =
    "#f5f5ed";

  context.strokeStyle =
    "#d84e4e";

  context.lineWidth = 3;

  context.beginPath();

  context.arc(
    x,
    y,
    17,
    0,
    Math.PI * 2
  );

  context.fill();

  context.stroke();


  context.fillStyle =
    "#333";

  context.font =
    "bold 9px Arial";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillText(
    text,
    x,
    y
  );

}


/* =========================================================
   HOOD
   ========================================================= */

function drawHood(
  context,
  width,
  height
) {

  const y =
    height * .80;

  context.fillStyle =
    "#151a1f";

  context.beginPath();

  context.moveTo(
    0,
    height
  );

  context.lineTo(
    width * .16,
    y
  );

  context.quadraticCurveTo(
    width * .5,
    y - 32,
    width * .84,
    y
  );

  context.lineTo(
    width,
    height
  );

  context.closePath();

  context.fill();


  context.strokeStyle =
    "rgba(255,255,255,.08)";

  context.lineWidth = 2;

  context.beginPath();

  context.moveTo(
    width * .16,
    y
  );

  context.quadraticCurveTo(
    width * .5,
    y - 32,
    width * .84,
    y
  );

  context.stroke();

}


/* =========================================================
   SIDE VIEW
   ========================================================= */

function drawSideView(
  context,
  width,
  height,
  side
) {

  const horizon =
    height * .44;

  drawSky(
    context,
    width,
    horizon
  );


  context.fillStyle =
    "#7e9a70";

  context.fillRect(
    0,
    horizon,
    width,
    height
  );


  /* road side */

  context.fillStyle =
    "#4a5052";

  context.fillRect(
    0,
    height * .60,
    width,
    height * .40
  );


  /* curb */

  context.fillStyle =
    "#d2d1c8";

  context.fillRect(
    0,
    height * .57,
    width,
    height * .04
  );


  /* curb segments */

  for (
    let i = 0;
    i < 14;
    i++
  ) {

    if (i % 2 === 0) {

      context.fillStyle =
        "#74797a";

      context.fillRect(
        i * width / 14,
        height * .57,
        width / 28,
        height * .04
      );

    }

  }


  /* nearby cones */

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    drawCone(
      context,
      width * (.12 + i * .20),
      height * (.67 + (i % 2) * .07),
      10 + i * 3
    );

  }


  /* shoulder scenery */

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    drawTree(
      context,
      i * width / 7,
      horizon + 5,
      25 + (i % 3) * 7
    );

  }


  /* side window tint */

  const tint =
    context.createLinearGradient(
      0,
      0,
      0,
      height
    );

  tint.addColorStop(
    0,
    "rgba(50,90,105,.05)"
  );

  tint.addColorStop(
    1,
    "rgba(5,10,14,.35)"
  );

  context.fillStyle =
    tint;

  context.fillRect(
    0,
    0,
    width,
    height
  );


  /* side car frame */

  context.fillStyle =
    "rgba(10,13,17,.86)";

  if (side < 0) {

    context.fillRect(
      0,
      0,
      width * .10,
      height
    );

    context.fillRect(
      width * .88,
      0,
      width * .12,
      height
    );

  } else {

    context.fillRect(
      0,
      0,
      width * .12,
      height
    );

    context.fillRect(
      width * .90,
      0,
      width * .10,
      height
    );

  }


  /* door line */

  context.strokeStyle =
    "rgba(255,255,255,.14)";

  context.lineWidth = 3;

  context.beginPath();

  context.moveTo(
    width * .25,
    height * .12
  );

  context.lineTo(
    width * .25,
    height * .83
  );

  context.moveTo(
    width * .73,
    height * .10
  );

  context.lineTo(
    width * .73,
    height * .83
  );

  context.stroke();


  /* blind spot indicator */

  context.fillStyle =
    "rgba(0,0,0,.35)";

  context.fillRect(
    width * .37,
    height * .74,
    width * .26,
    height * .12
  );

  context.fillStyle =
    "#aeb7bd";

  context.font =
    "bold 9px Arial";

  context.textAlign =
    "center";

  context.fillText(
    side < 0
      ? "GÓC QUAN SÁT TRÁI"
      : "GÓC QUAN SÁT PHẢI",
    width / 2,
    height * .81
  );

}


/* =========================================================
   REAR VIEW
   ========================================================= */

function drawRearView(
  context,
  width,
  height
) {

  const horizon =
    height * .42;

  drawSky(
    context,
    width,
    horizon
  );


  context.fillStyle =
    "#78936c";

  context.fillRect(
    0,
    horizon,
    width,
    height
  );


  const center =
    width / 2 -
    state.lookX * .3;


  context.fillStyle =
    "#41494d";

  context.beginPath();

  context.moveTo(
    center - width * .08,
    horizon
  );

  context.lineTo(
    center + width * .08,
    horizon
  );

  context.lineTo(
    center + width * .48,
    height
  );

  context.lineTo(
    center - width * .48,
    height
  );

  context.closePath();

  context.fill();


  drawPerspectiveDashes(
    context,
    center,
    horizon,
    height
  );


  /* rear red tail lights */

  context.fillStyle =
    "#d83e45";

  context.fillRect(
    width * .25,
    height * .66,
    width * .08,
    height * .035
  );

  context.fillRect(
    width * .67,
    height * .66,
    width * .08,
    height * .035
  );


  /* rear window */

  context.fillStyle =
    "rgba(10,20,26,.55)";

  context.beginPath();

  context.moveTo(
    width * .30,
    height * .45
  );

  context.lineTo(
    width * .70,
    height * .45
  );

  context.lineTo(
    width * .77,
    height * .63
  );

  context.lineTo(
    width * .23,
    height * .63
  );

  context.closePath();

  context.fill();


  /* reverse label */

  context.fillStyle =
    "rgba(0,0,0,.45)";

  context.fillRect(
    width * .5 - 60,
    height * .16,
    120,
    28
  );

  context.fillStyle =
    "#fff";

  context.font =
    "bold 9px Arial";

  context.textAlign =
    "center";

  context.fillText(
    "QUAN SÁT PHÍA SAU",
    width / 2,
    height * .16 + 18
  );


  /* cabin rear frame */

  context.fillStyle =
    "rgba(7,10,13,.88)";

  context.fillRect(
    0,
    0,
    width * .07,
    height
  );

  context.fillRect(
    width * .93,
    0,
    width * .07,
    height
  );

}


/* =========================================================
   TOP VIEW
   ========================================================= */

function drawTopView(
  context,
  width,
  height
) {

  context.fillStyle =
    "#182219";

  context.fillRect(
    0,
    0,
    width,
    height
  );


  /* course */

  context.fillStyle =
    "#444b4e";

  context.fillRect(
    width * .35,
    0,
    width * .30,
    height
  );


  context.fillStyle =
    "#ddd9c6";

  context.fillRect(
    width * .33,
    0,
    width * .02,
    height
  );

  context.fillRect(
    width * .65,
    0,
    width * .02,
    height
  );


  /* intersections */

  context.fillStyle =
    "#50575a";

  context.fillRect(
    0,
    height * .38,
    width,
    height * .24
  );


  /* lane markings */

  context.strokeStyle =
    "#eee8c7";

  context.lineWidth = 4;

  context.setLineDash(
    [18, 18]
  );

  context.beginPath();

  context.moveTo(
    width * .5,
    0
  );

  context.lineTo(
    width * .5,
    height
  );

  context.stroke();

  context.setLineDash([]);


  /* task points */

  tasks.forEach(
    (task, index) => {

      const y =
        ((index + 1) /
          (tasks.length + 1)) *
        height;

      context.fillStyle =
        index === state.taskIndex
          ? "#35d39a"
          : "#a7b0b7";

      context.beginPath();

      context.arc(
        width * .5,
        y,
        index === state.taskIndex
          ? 9
          : 5,
        0,
        Math.PI * 2
      );

      context.fill();

    }
  );


  /* car */

  const carX =
    width * .5 +
    state.positionX * 15;

  const carY =
    height *
    (0.85 -
      Math.min(
        .70,
        state.distance / 900
      ));


  context.save();

  context.translate(
    carX,
    carY
  );

  context.rotate(
    state.heading
  );


  context.fillStyle =
    "#20272d";

  context.roundRect(
    -15,
    -28,
    30,
    56,
    8
  );

  context.fill();


  context.fillStyle =
    "#6b8793";

  context.fillRect(
    -10,
    -16,
    20,
    20
  );


  context.fillStyle =
    "#d84c54";

  context.fillRect(
    -10,
    21,
    7,
    4
  );

  context.fillRect(
    3,
    21,
    7,
    4
  );

  context.restore();


  /* label */

  context.fillStyle =
    "rgba(0,0,0,.55)";

  context.fillRect(
    12,
    12,
    145,
    30
  );

  context.fillStyle =
    "#fff";

  context.font =
    "bold 10px Arial";

  context.textAlign =
    "left";

  context.fillText(
    "BẢN ĐỒ SA HÌNH",
    23,
    31
  );

}


/* =========================================================
   MIRRORS
   ========================================================= */

function updateMirrors() {

  drawMirror(
    leftCtx,
    leftMirrorCanvas,
    -1
  );

  drawMirror(
    centerCtx,
    centerMirrorCanvas,
    0
  );

  drawMirror(
    rightCtx,
    rightMirrorCanvas,
    1
  );

}


function drawMirror(
  context,
  canvas,
  side
) {

  const rect =
    canvas.getBoundingClientRect();

  const width =
    rect.width;

  const height =
    rect.height;

  context.clearRect(
    0,
    0,
    width,
    height
  );


  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      height
    );

  gradient.addColorStop(
    0,
    "#8db6c5"
  );

  gradient.addColorStop(
    1,
    "#506456"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    width,
    height
  );


  /* road */

  context.fillStyle =
    "#474e50";

  context.beginPath();

  context.moveTo(
    width * .42,
    height * .55
  );

  context.lineTo(
    width * .58,
    height * .55
  );

  context.lineTo(
    width * .92,
    height
  );

  context.lineTo(
    width * .08,
    height
  );

  context.closePath();

  context.fill();


  /* car behind */

  context.fillStyle =
    "#c64c50";

  context.roundRect(
    width * .39,
    height * .60,
    width * .22,
    height * .23,
    3
  );

  context.fill();


  /* road lines */

  context.strokeStyle =
    "#eee8c9";

  context.lineWidth = 2;

  context.setLineDash(
    [8, 8]
  );

  context.beginPath();

  context.moveTo(
    width * .5,
    height * .58
  );

  context.lineTo(
    width * .5,
    height
  );

  context.stroke();

  context.setLineDash([]);


  /* mirror text */

  context.fillStyle =
    "rgba(255,255,255,.65)";

  context.font =
    "bold 6px Arial";

  context.textAlign =
    "center";

  context.fillText(
    side === -1
      ? "TRÁI"
      : side === 1
        ? "PHẢI"
        : "SAU",
    width / 2,
    height - 5
  );

}


/* =========================================================
   UI
   ========================================================= */

function updateAllUI() {

  speedValue.textContent =
    Math.round(
      Math.abs(state.speed)
    );

  rpmValue.textContent =
    Math.round(state.rpm);

  scoreValue.textContent =
    Math.round(state.score);

  faultValue.textContent =
    state.faults;

  steeringValue.textContent =
    `${Math.round(state.steering)}°`;

  updateGearUI();

  updateTimerDisplay();

  updateTaskUI();

  steeringWheel.style.transform =
    `rotate(${state.steering}deg)`;

}


function updateTimerDisplay() {

  if (
    state.mode === "practice"
  ) {

    timeValue.textContent =
      formatTime(state.elapsed);

    return;

  }

  const limit = 15 * 60;

  const remaining =
    Math.max(
      0,
      limit - state.elapsed
    );

  timeValue.textContent =
    formatTime(remaining);

  if (
    remaining <= 0 &&
    state.running &&
    !state.paused
  ) {

    finishGame(
      true
    );

  }

}


function updateTaskUI() {

  const task =
    tasks[
      Math.min(
        state.taskIndex,
        tasks.length - 1
      )
    ];

  if (!task) {
    return;
  }

  taskNumber.textContent =
    String(
      state.taskIndex + 1
    ).padStart(
      2,
      "0"
    );

  taskTitle.textContent =
    task.title;

  taskDescription.textContent =
    task.description;

  taskProgressValue.textContent =
    Math.min(
      state.taskIndex + 1,
      tasks.length
    );

  const progress =
    (
      Math.min(
        state.taskIndex,
        tasks.length
      ) /
      tasks.length
    ) *
    100;

  taskProgressBar.style.width =
    `${Math.max(
      10,
      progress
    )}%`;

}


/* =========================================================
   PAUSE
   ========================================================= */

pauseButton.addEventListener(
  "click",
  togglePause
);


function togglePause() {

  if (!state.running) {
    return;
  }

  state.paused =
    !state.paused;

  pauseOverlay.classList.toggle(
    "hidden",
    !state.paused
  );

}


resumeButton.addEventListener(
  "click",
  () => {

    state.paused = false;

    pauseOverlay.classList.add(
      "hidden"
    );

    state.lastTime =
      performance.now();

  }
);


restartButton.addEventListener(
  "click",
  () => {

    pauseOverlay.classList.add(
      "hidden"
    );

    startGame();

  }
);


menuButton.addEventListener(
  "click",
  backToMenu
);


exitGameButton.addEventListener(
  "click",
  () => {

    if (
      confirm(
        "Bạn có muốn thoát bài thi và quay lại menu?"
      )
    ) {

      backToMenu();

    }

  }
);


resultMenuButton.addEventListener(
  "click",
  backToMenu
);


retryButton.addEventListener(
  "click",
  () => {

    resultOverlay.classList.add(
      "hidden"
    );

    startGame();

  }
);


function backToMenu() {

  state.running = false;

  state.paused = false;

  cancelAnimationFrame(
    state.animationId
  );

  pauseOverlay.classList.add(
    "hidden"
  );

  resultOverlay.classList.add(
    "hidden"
  );

  gameScreen.classList.add(
    "hidden"
  );

  menuScreen.classList.remove(
    "hidden"
  );

}


/* =========================================================
   FINISH
   ========================================================= */

function finishGame(
  timeout = false
) {

  if (!state.running) {
    return;
  }

  state.running = false;

  cancelAnimationFrame(
    state.animationId
  );

  finalScore.textContent =
    Math.round(state.score);

  finalTime.textContent =
    formatTime(state.elapsed);

  finalFaults.textContent =
    state.faults;

  finalTasks.textContent =
    `${Math.min(
      state.taskIndex,
      tasks.length
    )}/${tasks.length}`;


  if (timeout) {

    resultTitle.textContent =
      "HẾT THỜI GIAN";

    resultMessage.textContent =
      "Bạn chưa hoàn thành bài thi trong thời gian quy định.";

  } else if (state.score >= 80) {

    resultTitle.textContent =
      "ĐẠT";

    resultMessage.textContent =
      "Rất tốt! Bạn đã hoàn thành bài mô phỏng.";

  } else if (state.score >= 50) {

    resultTitle.textContent =
      "CẦN LUYỆN THÊM";

    resultMessage.textContent =
      "Bạn đã hoàn thành nhưng vẫn còn một số lỗi cần cải thiện.";

  } else {

    resultTitle.textContent =
      "CHƯA ĐẠT";

    resultMessage.textContent =
      "Hãy luyện thêm các thao tác và thử lại.";

  }

  resultOverlay.classList.remove(
    "hidden"
  );

}


/* =========================================================
   UTILITY
   ========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


function formatTime(seconds) {

  const total =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const minutes =
    Math.floor(
      total / 60
    );

  const secs =
    total % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );

}


/* =========================================================
   KEYBOARD HELP
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "F1"
    ) {

      event.preventDefault();

      keyboardHelp.classList.toggle(
        "hidden"
      );

    }

  }
);


closeKeyboardHelp.addEventListener(
  "click",
  () => {

    keyboardHelp.classList.add(
      "hidden"
    );

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

selectTransmission("MT");

selectMode("practice");

resizeAll();

updateAllUI();


/* =========================================================
   PREVENT CONTEXT MENU
   ========================================================= */

viewport.addEventListener(
  "contextmenu",
  event => {

    event.preventDefault();

  }
);


/* =========================================================
   SAFETY: HANDLE PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      state.running
    ) {

      state.paused = true;

      pauseOverlay.classList.remove(
        "hidden"
      );

    }

  }
);
