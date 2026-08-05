import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const data = await fetch('./data/dorm-blueprint.json').then(r => {
  if (!r.ok) throw new Error(`Could not load dorm blueprint (${r.status})`);
  return r.json();
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1422);
scene.fog = new THREE.Fog(0x0a1422, 18, 74);
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
const zoneChip = document.getElementById('zoneChip');
const sceneOverlay = document.getElementById('scene');
const sceneBody = document.getElementById('sceneBody');
const keys = new Set();
let activeDoor = null;
let roomOpen = false;

function resetPosition() {
  camera.position.set(data.spawn.x, data.spawn.y, data.spawn.z);
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
const floorMat = new THREE.MeshStandardMaterial({color:0x355a72,roughness:.76,metalness:.04});
const wallMat = new THREE.MeshStandardMaterial({color:0xd9e4ec,roughness:.84});
const ceilingMat = new THREE.MeshStandardMaterial({color:0xaebdca,roughness:.92});
const roomMat = new THREE.MeshStandardMaterial({color:0x8798a5,roughness:.9});
const trimMat = new THREE.MeshStandardMaterial({color:0x27475d,roughness:.72});
const doorMat = new THREE.MeshStandardMaterial({color:0x50352b,roughness:.65});
const e=data.environment;
function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;}

// The hallway floor is generated entirely from blueprint rectangles.
for(const hall of data.hallways){
  const w=hall.world;
  box(w.width,e.floorThickness,w.depth,floorMat,w.x,0,w.z);
  box(w.width,.12,w.depth,ceilingMat,w.x,e.hallHeight,w.z);
}

// Room masses preserve the proportions and placement of the original 2D dorm map.
for(const room of data.rooms){
  const w=room.world;
  box(w.width,w.height,w.depth,roomMat,w.x,w.height/2,w.z);
}

const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;
function labelTexture(text){
  const c=signCanvas.cloneNode(); const ctx=c.getContext('2d');
  ctx.fillStyle='#07111f';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#9be7ff';ctx.lineWidth=6;ctx.strokeRect(3,3,c.width-6,c.height-6);
  ctx.fillStyle='#fff';ctx.font='bold 46px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const doors=[];
for(const room of data.rooms){
  const d=room.door;
  const northSouth=d.edge==='north'||d.edge==='south';
  const door=box(northSouth?1.35:.12,2.35,northSouth?.12:1.35,doorMat,d.x,1.175,d.z);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.32),new THREE.MeshBasicMaterial({map:labelTexture(room.name)}));
  if(northSouth){
    sign.position.set(d.x,2.78,d.z+(d.edge==='north'?-.08:.08));
    sign.rotation.y=d.edge==='north'?0:Math.PI;
  }else{
    sign.position.set(d.x+(d.edge==='west'?-.08:.08),2.78,d.z);
    sign.rotation.y=d.edge==='west'?Math.PI/2:-Math.PI/2;
  }
  scene.add(sign);
  doors.push({room,position:new THREE.Vector3(d.x,1.5,d.z)});
}

// Lighting follows hallway centers rather than a hardcoded straight line.
for(const hall of data.hallways){
  const w=hall.world;
  const horizontal=w.width>=w.depth;
  const length=horizontal?w.width:w.depth;
  const count=Math.max(1,Math.floor(length/6));
  for(let i=0;i<=count;i++){
    const t=count?i/count:.5;
    const x=horizontal?w.x-w.width/2+1+t*Math.max(0,w.width-2):w.x;
    const z=horizontal?w.z:w.z-w.depth/2+1+t*Math.max(0,w.depth-2);
    const light=new THREE.PointLight(0xf4fbff,2.5,12,2);light.position.set(x,e.hallHeight-.3,z);scene.add(light);
    box(horizontal?1.2:.45,.05,horizontal?.45:1.2,new THREE.MeshStandardMaterial({color:0xeaf8ff,emissive:0xcceeff,emissiveIntensity:1.7}),x,e.hallHeight-.08,z);
  }
}

function insideHall(pos,margin=e.playerRadius){
  return data.hallways.some(h=>{
    const w=h.world;
    return pos.x>=w.x-w.width/2+margin && pos.x<=w.x+w.width/2-margin && pos.z>=w.z-w.depth/2+margin && pos.z<=w.z+w.depth/2-margin;
  });
}
function hallAt(pos){
  return data.hallways.find(h=>{const w=h.world;return pos.x>=w.x-w.width/2&&pos.x<=w.x+w.width/2&&pos.z>=w.z-w.depth/2&&pos.z<=w.z+w.depth/2;});
}

const move={speed:5.2};
window.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyE'&&activeDoor&&!roomOpen)openRoom(activeDoor.room)});
window.addEventListener('keyup',e=>keys.delete(e.code));
controls.addEventListener('lock',()=>menu.classList.add('hidden'));
controls.addEventListener('unlock',()=>{if(!roomOpen)menu.classList.remove('hidden');savePosition()});
document.getElementById('start').onclick=()=>controls.lock();
document.getElementById('reset').onclick=()=>{resetPosition();if(!controls.isLocked&&!roomOpen)controls.lock()};
function leaveRoom(){roomOpen=false;sceneOverlay.classList.remove('open');sceneBody.innerHTML='';controls.lock();}
document.getElementById('leave').onclick=leaveRoom;
window.addEventListener('message',event=>{if(event.data?.type==='shp:explorer-leave-room')leaveRoom();});
function openRoom(room){
  roomOpen=true;controls.unlock();menu.classList.add('hidden');sceneOverlay.classList.add('open');
  if(room.sceneHtml){const frame=document.createElement('iframe');frame.className='room-frame';frame.src=room.sceneHtml;frame.title=`${room.name}'s dorm room`;frame.setAttribute('allow','fullscreen');sceneBody.replaceChildren(frame);}
  else sceneBody.innerHTML=`<div class="placeholder-room"><div><h2>${room.name}'s Dorm</h2><p>The door is correctly positioned from the converted blueprint. This student does not yet have an interactive room scene assigned.</p></div></div>`;
}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(controls.isLocked&&!roomOpen){
    const old=camera.position.clone();const amount=move.speed*dt;
    if(keys.has('KeyW'))controls.moveForward(amount);if(keys.has('KeyS'))controls.moveForward(-amount);if(keys.has('KeyA'))controls.moveRight(-amount);if(keys.has('KeyD'))controls.moveRight(amount);
    camera.position.y=data.spawn.y;
    if(!insideHall(camera.position))camera.position.copy(old);
    const zone=hallAt(camera.position);zoneChip.textContent=zone?zone.name:data.name;
    activeDoor=null;let best=2.1;
    for(const d of doors){const dist=camera.position.distanceTo(d.position);if(dist<best){best=dist;activeDoor=d;}}
    if(activeDoor){prompt.textContent=`[ E ] Enter ${activeDoor.room.name}'s Dorm`;prompt.classList.add('show');}else prompt.classList.remove('show');
  }else prompt.classList.remove('show');
  renderer.render(scene,camera);
}
animate();
setInterval(()=>{if(controls.isLocked)savePosition()},2500);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
