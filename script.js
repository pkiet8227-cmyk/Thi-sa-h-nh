(() => {
"use strict";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const state = {
  mode: "MT",
  camera: "front",
  gear: "N",
  speed: 0,
  x: 0,
  y: 0,
  heading: 0,
  steering: 0,
  score: 100,
  faults: 0,
  elapsed: 0,
  running: false,
  pedals: { clutch:false, brake:false, gas:false },
  lastTime: performance.now(),
  keys: {}
};

const menu = $("#menu"), game = $("#game"), canvas = $("#scene"), ctx = canvas.getContext("2d");
const scoreEl=$("#score"), faultsEl=$("#faults"), timerEl=$("#timer"), modeLabel=$("#modeLabel");
const gearLabel=$("#gearLabel"), gearLabelAT=$("#gearLabelAT"), cameraLabel=$("#cameraLabel");
const wheel=$("#steeringWheel"), steerValue=$("#steerValue"), message=$("#message");

function resize(){
  const r=canvas.getBoundingClientRect();
  canvas.width=Math.max(1,Math.floor(r.width*devicePixelRatio));
  canvas.height=Math.max(1,Math.floor(r.height*devicePixelRatio));
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener("resize",resize);

function start(mode){
  state.mode=mode; state.gear=mode==="MT"?"N":"P"; state.speed=0; state.x=0; state.y=0;
  state.heading=0; state.steering=0; state.score=100; state.faults=0; state.elapsed=0;
  state.running=true; state.lastTime=performance.now();
  menu.classList.remove("active"); game.classList.add("active");
  $("#mtGear").classList.toggle("hidden",mode!=="MT");
  $("#atGear").classList.toggle("hidden",mode!=="AT");
  modeLabel.textContent=mode;
  message.classList.add("hidden");
  resize(); updateUI();
}

$$(".car-card").forEach(b=>b.addEventListener("click",()=>start(b.dataset.mode)));
$("#exitBtn").onclick=()=>{state.running=false;game.classList.remove("active");menu.classList.add("active")};

function updateUI(){
  scoreEl.textContent=state.score; faultsEl.textContent=state.faults;
  const m=Math.floor(state.elapsed/60), s=Math.floor(state.elapsed%60);
  timerEl.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  gearLabel.textContent=state.gear; gearLabelAT.textContent=state.gear;
  steerValue.textContent=Math.round(state.steering)+"°";
  cameraLabel.textContent={
    front:"CAM TRƯỚC",left:"CAM QUA VAI TRÁI",right:"CAM QUA VAI PHẢI",
    rear:"CAM SAU",top:"TOÀN CẢNH"
  }[state.camera];
}

$$(".camera-buttons button").forEach(b=>b.onclick=()=>{state.camera=b.dataset.cam;updateUI()});

$$(".mt-gear button,.at-gear button").forEach(b=>b.addEventListener("click",()=>{
  const g=b.dataset.gear;
  if(state.mode==="MT"){
    if(g==="R" && state.speed>2) return fault("Không vào số R khi xe đang chạy!");
    if(state.speed>1 && !state.pedals.clutch) return fault("Đạp côn khi chuyển số!");
  }
  state.gear=g; updateUI();
}));

function pedal(id,key){
  const el=$("#"+id);
  const on=e=>{e.preventDefault();state.pedals[key]=true;el.classList.add("active")};
  const off=e=>{e.preventDefault();state.pedals[key]=false;el.classList.remove("active")};
  ["pointerdown","touchstart"].forEach(ev=>el.addEventListener(ev,on,{passive:false}));
  ["pointerup","pointercancel","pointerleave","touchend"].forEach(ev=>el.addEventListener(ev,off,{passive:false}));
}
pedal("clutch","clutch");pedal("brake","brake");pedal("gas","gas");

window.addEventListener("keydown",e=>{
  state.keys[e.key.toLowerCase()]=true;
  if(["arrowleft","arrowright","arrowup","arrowdown"," "].includes(e.key.toLowerCase()))e.preventDefault();
  if(e.key.toLowerCase()==="a") state.steering=Math.max(-360,state.steering-12);
  if(e.key.toLowerCase()==="d") state.steering=Math.min(360,state.steering+12);
  if(e.key.toLowerCase()==="r") state.steering=0;
});
window.addEventListener("keyup",e=>state.keys[e.key.toLowerCase()]=false);

let wheelLastAngle=null, wheelStart=0;
function pointerAngle(e){
  const r=wheel.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;
}
wheel.addEventListener("pointerdown",e=>{
  e.preventDefault(); wheel.setPointerCapture(e.pointerId);
  wheelLastAngle=pointerAngle(e); wheelStart=state.steering;
});
wheel.addEventListener("pointermove",e=>{
  if(wheelLastAngle===null)return;
  const a=pointerAngle(e), d=((a-wheelLastAngle+540)%360)-180;
  state.steering=Math.max(-360,Math.min(360,state.steering+d));
  wheel.style.transform=`rotate(${state.steering}deg)`; steerValue.textContent=Math.round(state.steering)+"°";
  wheelLastAngle=a;
});
["pointerup","pointercancel"].forEach(ev=>wheel.addEventListener(ev,()=>wheelLastAngle=null));
$("#centerWheel").onclick=()=>{
  state.steering=0;wheel.style.transform="rotate(0deg)";updateUI();
};

function fault(text){
  state.faults++; state.score=Math.max(0,state.score-5);
  message.innerHTML="⚠️ "+text+"<br><small>-5 điểm</small>";
  message.classList.remove("hidden"); setTimeout(()=>message.classList.add("hidden"),1400);
  updateUI();
}

function getThrottle(){
  return state.pedals.gas || state.keys["w"] || state.keys["arrowup"];
}
function getBrake(){
  return state.pedals.brake || state.keys["s"] || state.keys["arrowdown"];
}

function drive(dt){
  if(!state.running)return;
  state.elapsed+=dt;
  const gas=getThrottle(), brake=getBrake();
  let allowed=false, reverse=false;
  if(state.mode==="AT") allowed=state.gear==="D"||state.gear==="R";
  else {
    allowed=["1","2","3","4","5","R"].includes(state.gear) &&
      (state.pedals.clutch || state.gear!=="N");
    reverse=state.gear==="R";
  }
  if(allowed){
    let accel=gas ? 5.5 : -1.5;
    if(brake) accel=-9;
    if(state.mode==="MT" && state.pedals.clutch) accel*=0.35;
    if(reverse) accel=-Math.abs(accel);
    state.speed=Math.max(-10,Math.min(35,state.speed+accel*dt));
  }else{
    state.speed*=Math.max(0,1-3*dt);
  }
  if(Math.abs(state.speed)<.15)state.speed=0;
  const steerFactor=Math.max(-1,Math.min(1,state.steering/360));
  state.heading += steerFactor * state.speed * 0.018 * dt*60;
  const rad=state.heading*Math.PI/180;
  state.x += Math.sin(rad)*state.speed*dt;
  state.y -= Math.cos(rad)*state.speed*dt;

  // simple boundary check for the practice track
  if(Math.abs(state.x)>420 || Math.abs(state.y)>720){
    state.x=Math.max(-420,Math.min(420,state.x)); state.y=Math.max(-720,Math.min(720,state.y));
    fault("Xe chạm giới hạn sa hình!");
  }
  updateUI();
}

function road(ctx,w,h){
  ctx.fillStyle="#557348";ctx.fillRect(0,0,w,h);
  // practice course
  ctx.save();
  ctx.translate(w/2-state.x,h/2-state.y);
  ctx.rotate(-state.heading*Math.PI/180);
  ctx.fillStyle="#50555a";ctx.fillRect(-260,-720,520,1440);
  ctx.strokeStyle="#e7d78a";ctx.lineWidth=5;ctx.strokeRect(-260,-720,520,1440);
  ctx.strokeStyle="#ffffff";ctx.lineWidth=3;ctx.setLineDash([25,25]);
  ctx.beginPath();ctx.moveTo(0,-720);ctx.lineTo(0,1440);ctx.stroke();ctx.setLineDash([]);
  // start/finish
  ctx.fillStyle="#2f75a8";ctx.fillRect(-250,600,500,70);
  ctx.fillStyle="#fff";ctx.font="bold 22px Arial";ctx.textAlign="center";ctx.fillText("VẠCH XUẤT PHÁT",0,642);
  // stop line
  ctx.fillStyle="#fff";ctx.fillRect(-250,-50,500,7);
  ctx.fillStyle="#d22";ctx.font="bold 18px Arial";ctx.fillText("DỪNG ĐÚNG VỊ TRÍ",0,-70);
  // cones
  for(let yy=-450;yy<=450;yy+=90){cone(-215,yy);cone(215,yy)}
  ctx.restore();
}
function cone(x,y){
  ctx.fillStyle="#ff8b20";ctx.beginPath();ctx.moveTo(x,y-13);ctx.lineTo(x-12,y+14);ctx.lineTo(x+12,y+14);ctx.closePath();ctx.fill();
  ctx.fillStyle="#fff";ctx.fillRect(x-9,y+3,18,4);
}

function car(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  ctx.save();
  ctx.translate(w/2,h/2);
  ctx.rotate(-state.heading*Math.PI/180);
  ctx.fillStyle="#b92d35";ctx.roundRect(-30,-52,60,104,12);ctx.fill();
  ctx.fillStyle="#9ec3d5";ctx.fillRect(-22,-35,44,25);ctx.fillRect(-22,12,44,24);
  ctx.fillStyle="#171c21";ctx.fillRect(-37,-30,7,22);ctx.fillRect(30,-30,7,22);ctx.fillRect(-37,10,7,22);ctx.fillRect(30,10,7,22);
  ctx.fillStyle="#ffd95a";ctx.fillRect(-21,-51,15,4);ctx.fillRect(6,-51,15,4);
  ctx.restore();
}

function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  if(state.camera==="top"){road(ctx,w,h);car();}
  else {
    // cabin-style overlay: course remains visible but camera view changes slightly.
    road(ctx,w,h);
    const shift=state.camera==="left"?-90:state.camera==="right"?90:state.camera==="rear"?180:0;
    ctx.fillStyle="#11182055";
    ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(shift,0);
    car();ctx.restore();
    // windshield frame
    ctx.strokeStyle="#0b1016cc";ctx.lineWidth=18;ctx.strokeRect(8,8,w-16,h-16);
    if(state.camera==="rear"){
      ctx.fillStyle="#0d1820aa";ctx.fillRect(0,0,w,h);
      ctx.fillStyle="#fff";ctx.font="bold 13px Arial";ctx.textAlign="center";ctx.fillText("GÓC NHÌN PHÍA SAU",w/2,Math.max(30,h*.14));
    }
  }
  updateMirrors();
}
function updateMirrors(){
  const vals=[
    ["#mirrorLeft",state.camera==="left"?"👀":"↖"],
    ["#mirrorCenter",state.camera==="rear"?"🚗":"▰"],
    ["#mirrorRight",state.camera==="right"?"👀":"↗"]
  ];
  vals.forEach(([id,t])=>$(id).textContent=t);
}

function loop(t){
  const dt=Math.min(.05,(t-state.lastTime)/1000);state.lastTime=t;
  drive(dt);draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
resize();
})();