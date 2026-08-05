import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const data = await fetch('./data/dorm-floor.json').then(r => {
  if (!r.ok) throw new Error(`Could not load floor data (${r.status})`);
  return r.json();
});

const S = data.worldScale;
const mapToWorld = (x, y) => ({ x: (x - data.mapWidth / 2) * S, z: (y - data.mapHeight / 2) * S });
const worldToMap = (x, z) => ({ x: x / S + data.mapWidth / 2, y: z / S + data.mapHeight / 2 });

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1422);
scene.fog = new THREE.Fog(0x0a1422, 20, 72);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 150);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
controls.pointerSpeed = 0.8;
const menu = document.getElementById('menu');
const prompt = document.getElementById('prompt');
const sceneOverlay = document.getElementById('scene');
const sceneBody = document.getElementById('sceneBody');
const minimap = document.getElementById('minimap');
const miniCtx = minimap.getContext('2d');
const keys = new Set();
let activeDoor = null;
let roomOpen = false;

function resetPosition() {
  const p = mapToWorld(data.spawn.mapX, data.spawn.mapY);
  camera.position.set(p.x, 1.7, p.z);
  camera.rotation.set(0, data.spawn.yaw, 0);
  localStorage.removeItem('shpDormExplorerStateV2');
}
function savePosition() {
  localStorage.setItem('shpDormExplorerStateV2', JSON.stringify({x:camera.position.x,y:camera.position.y,z:camera.position.z,ry:camera.rotation.y}));
}
function restorePosition() {
  try {
    const s=JSON.parse(localStorage.getItem('shpDormExplorerStateV2'));
    if(s && Number.isFinite(s.x)){camera.position.set(s.x,s.y,s.z);camera.rotation.set(0,s.ry||0,0);return;}
  } catch {}
  resetPosition();
}
restorePosition();

scene.add(new THREE.HemisphereLight(0xa9dfff, 0x1b2635, 1.65));
const floorMat = new THREE.MeshStandardMaterial({color:0x355a72,roughness:.75,metalness:.05});
const wallMat = new THREE.MeshStandardMaterial({color:0xd9e4ec,roughness:.82});
const ceilingMat = new THREE.MeshStandardMaterial({color:0xaebdca,roughness:.9});
const trimMat = new THREE.MeshStandardMaterial({color:0x27475d,roughness:.7});
const doorMat = new THREE.MeshStandardMaterial({color:0x50352b,roughness:.65});
const stairMat = new THREE.MeshStandardMaterial({color:0x263746,roughness:.8});
const lightMat = new THREE.MeshStandardMaterial({color:0xeaf8ff,emissive:0xcceeff,emissiveIntensity:2});

function box(w,h,d,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;
}

// Floor and ceiling use the same three rectangles as the original Dorms map.
for (const hall of data.corridors) {
  const c = mapToWorld(hall.x + hall.w/2, hall.y + hall.h/2);
  box(hall.w*S,.18,hall.h*S,floorMat,c.x,0,c.z);
  box(hall.w*S,.16,hall.h*S,ceilingMat,c.x,data.height,c.z);
}

// Exterior walls follow the exact union outline of those rectangles.
const outline = data.outline.map(([x,y]) => mapToWorld(x,y));
for(let i=0;i<outline.length;i++){
  const a=outline[i], b=outline[(i+1)%outline.length];
  const dx=b.x-a.x, dz=b.z-a.z;
  const length=Math.hypot(dx,dz), cx=(a.x+b.x)/2, cz=(a.z+b.z)/2;
  const wall=box(length,.001,.001,wallMat,cx,data.height/2,cz);
  wall.geometry.dispose();
  wall.geometry=new THREE.BoxGeometry(length,data.height,.18);
  wall.rotation.y=-Math.atan2(dz,dx);
  const trim=box(length,.22,.10,trimMat,cx,.12,cz);
  trim.rotation.y=wall.rotation.y;
}

// Ceiling lights distributed along each branch.
for (const hall of data.corridors) {
  const horizontal = hall.w >= hall.h;
  const span = horizontal ? hall.w : hall.h;
  const count = Math.max(1, Math.floor(span / 12));
  for(let i=0;i<=count;i++){
    const t=(i+.5)/(count+1);
    const mx=horizontal?hall.x+hall.w*t:hall.x+hall.w/2;
    const my=horizontal?hall.y+hall.h/2:hall.y+hall.h*t;
    const p=mapToWorld(mx,my);
    const light=new THREE.PointLight(0xf4fbff,2.8,14,2);light.position.set(p.x,data.height-.35,p.z);scene.add(light);
    box(horizontal?1.4:.5,.06,horizontal?.5:1.4,lightMat,p.x,data.height-.12,p.z);
  }
}

function labelTexture(text){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#07111f';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#9be7ff';ctx.lineWidth=6;ctx.strokeRect(3,3,c.width-6,c.height-6);
  ctx.fillStyle='#fff';ctx.font='bold 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

function nearestDoor(room){
  const cx=room.x+room.w/2, cy=room.y+room.h/2;
  const candidates=[];
  for(const hall of data.corridors){
    const hx1=hall.x, hx2=hall.x+hall.w, hy1=hall.y, hy2=hall.y+hall.h;
    if(cx>=hx1&&cx<=hx2){
      candidates.push({d:Math.abs(room.y+room.h-hy1),x:cx,y:hy1,normal:[0,-1],axis:'x'});
      candidates.push({d:Math.abs(room.y-hy2),x:cx,y:hy2,normal:[0,1],axis:'x'});
    }
    if(cy>=hy1&&cy<=hy2){
      candidates.push({d:Math.abs(room.x+room.w-hx1),x:hx1,y:cy,normal:[-1,0],axis:'y'});
      candidates.push({d:Math.abs(room.x-hx2),x:hx2,y:cy,normal:[1,0],axis:'y'});
    }
  }
  return candidates.sort((a,b)=>a.d-b.d)[0];
}

const doors=[];
for(const room of data.rooms){
  const d=nearestDoor(room); const p=mapToWorld(d.x,d.y);
  const horizontalWall=d.axis==='x';
  const door=box(horizontalWall?1.35:.12,2.35,horizontalWall?.12:1.35,doorMat,p.x,1.175,p.z);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.32),new THREE.MeshBasicMaterial({map:labelTexture(room.name)}));
  if(horizontalWall){sign.position.set(p.x,2.78,p.z+d.normal[1]*.11);sign.rotation.y=d.normal[1]<0?0:Math.PI;}
  else{sign.position.set(p.x+d.normal[0]*.11,2.78,p.z);sign.rotation.y=d.normal[0]<0?Math.PI/2:-Math.PI/2;}
  scene.add(sign);
  const inside=mapToWorld(d.x-d.normal[0]*1.7,d.y-d.normal[1]*1.7);
  doors.push({room,position:new THREE.Vector3(inside.x,1.5,inside.z)});
}

// A simple blocked stair marker in the original lower-right position.
const stairCenter=mapToWorld(data.stairs.x+data.stairs.w/2,data.stairs.y+data.stairs.h/2);
for(let i=0;i<7;i++){
  box(data.stairs.w*S,.10+i*.07,(data.stairs.h*S)/7,stairMat,stairCenter.x,.05+i*.035,stairCenter.z+(i-3)*(data.stairs.h*S/7));
}
const stairSign=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshBasicMaterial({map:labelTexture('STAIRS')}));
stairSign.position.set(stairCenter.x,2.25,stairCenter.z-2.15);scene.add(stairSign);

const move={speed:5.4,radius:.42};
function insideCorridor(pos){
  const m=worldToMap(pos.x,pos.z), r=move.radius/S;
  return data.corridors.some(h=>m.x>=h.x+r&&m.x<=h.x+h.w-r&&m.y>=h.y+r&&m.y<=h.y+h.h-r);
}
window.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyE'&&activeDoor&&!roomOpen)openRoom(activeDoor.room)});
window.addEventListener('keyup',e=>keys.delete(e.code));
controls.addEventListener('lock',()=>menu.classList.add('hidden'));
controls.addEventListener('unlock',()=>{if(!roomOpen)menu.classList.remove('hidden');savePosition()});
document.getElementById('start').onclick=()=>controls.lock();
document.getElementById('reset').onclick=()=>{resetPosition();if(!controls.isLocked&&!roomOpen)controls.lock()};
function leaveRoom(){roomOpen=false;sceneOverlay.classList.remove('open');sceneBody.innerHTML='';controls.lock();}
document.getElementById('leave').onclick=leaveRoom;
window.addEventListener('message',event=>{if(event.data?.type==='shp:explorer-leave-room')leaveRoom()});
function openRoom(room){
  roomOpen=true;controls.unlock();menu.classList.add('hidden');sceneOverlay.classList.add('open');
  if(room.sceneHtml){const frame=document.createElement('iframe');frame.className='room-frame';frame.src=room.sceneHtml;frame.title=`${room.name}'s dorm room`;frame.setAttribute('allow','fullscreen');sceneBody.replaceChildren(frame);}
  else sceneBody.innerHTML=`<div class="placeholder-room"><div><h2>${room.name}'s Dorm</h2><p>No interactive room layout exists for this student in the source map yet.</p></div></div>`;
}

function drawMinimap(){
  const w=minimap.width,h=minimap.height,sx=w/data.mapWidth,sy=h/data.mapHeight;
  miniCtx.clearRect(0,0,w,h);miniCtx.fillStyle='#07111fe8';miniCtx.fillRect(0,0,w,h);
  miniCtx.fillStyle='#8fc6df';for(const c of data.corridors)miniCtx.fillRect(c.x*sx,c.y*sy,c.w*sx,c.h*sy);
  miniCtx.fillStyle='#dce9f0';for(const r of data.rooms)miniCtx.fillRect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);
  miniCtx.fillStyle='#263746';miniCtx.fillRect(data.stairs.x*sx,data.stairs.y*sy,data.stairs.w*sx,data.stairs.h*sy);
  const p=worldToMap(camera.position.x,camera.position.z);miniCtx.fillStyle='#e63b53';miniCtx.beginPath();miniCtx.arc(p.x*sx,p.y*sy,4,0,Math.PI*2);miniCtx.fill();
  const dx=Math.sin(camera.rotation.y)*9,dy=-Math.cos(camera.rotation.y)*9;miniCtx.strokeStyle='#fff';miniCtx.lineWidth=2;miniCtx.beginPath();miniCtx.moveTo(p.x*sx,p.y*sy);miniCtx.lineTo((p.x+dx)*sx,(p.y+dy)*sy);miniCtx.stroke();
  miniCtx.strokeStyle='#ffffff55';miniCtx.strokeRect(.5,.5,w-1,h-1);
}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(controls.isLocked&&!roomOpen){
    const old=camera.position.clone(),amount=move.speed*dt;
    if(keys.has('KeyW'))controls.moveForward(amount);if(keys.has('KeyS'))controls.moveForward(-amount);if(keys.has('KeyA'))controls.moveRight(-amount);if(keys.has('KeyD'))controls.moveRight(amount);
    camera.position.y=1.7;if(!insideCorridor(camera.position))camera.position.copy(old);
    activeDoor=null;let best=2.15;for(const d of doors){const dist=camera.position.distanceTo(d.position);if(dist<best){best=dist;activeDoor=d;}}
    if(activeDoor){prompt.textContent=`[ E ] Enter ${activeDoor.room.name}'s Dorm`;prompt.classList.add('show');}else prompt.classList.remove('show');
  }else prompt.classList.remove('show');
  drawMinimap();renderer.render(scene,camera);
}
animate();
setInterval(()=>{if(controls.isLocked)savePosition()},2500);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
