import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const data = await fetch('./data/dorm-floor.json').then(r => {
  if (!r.ok) throw new Error(`Could not load floor data (${r.status})`);
  return r.json();
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1422);
scene.fog = new THREE.Fog(0x0a1422, 18, 78);
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
const keys = new Set();
let activeDoor = null;
let roomOpen = false;

function resetPosition() {
  camera.position.set(data.spawn.x, data.spawn.y, data.spawn.z);
  camera.rotation.set(0, data.spawn.yaw, 0);
  localStorage.removeItem('shpDormExplorerState');
}
function savePosition() {
  localStorage.setItem('shpDormExplorerState', JSON.stringify({x:camera.position.x,y:camera.position.y,z:camera.position.z,ry:camera.rotation.y}));
}
function restorePosition() {
  try {
    const s=JSON.parse(localStorage.getItem('shpDormExplorerState'));
    if(s && Number.isFinite(s.x)){camera.position.set(s.x,s.y,s.z);camera.rotation.set(0,s.ry||0,0);return;}
  } catch {}
  resetPosition();
}
restorePosition();

const ambient = new THREE.HemisphereLight(0xa9dfff, 0x1b2635, 1.8); scene.add(ambient);
const hall = data.hallway;
const floorMat = new THREE.MeshStandardMaterial({color:0x355a72,roughness:.75,metalness:.05});
const wallMat = new THREE.MeshStandardMaterial({color:0xd9e4ec,roughness:.82});
const ceilingMat = new THREE.MeshStandardMaterial({color:0xaebdca,roughness:.9});
const trimMat = new THREE.MeshStandardMaterial({color:0x27475d,roughness:.7});
const doorMat = new THREE.MeshStandardMaterial({color:0x50352b,roughness:.65});

function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;}
box(hall.width,.18,hall.length,floorMat,0,0,0);
box(hall.width,.16,hall.length,ceilingMat,0,hall.height,0);
box(.18,hall.height,hall.length,wallMat,-hall.width/2,hall.height/2,0);
box(.18,hall.height,hall.length,wallMat,hall.width/2,hall.height/2,0);
box(hall.width,hall.height,.18,wallMat,0,hall.height/2,-hall.length/2);
box(hall.width,hall.height,.18,wallMat,0,hall.height/2,hall.length/2);
box(.12,.22,hall.length,trimMat,-hall.width/2+.1,.12,0);
box(.12,.22,hall.length,trimMat,hall.width/2-.1,.12,0);

for(let z=-30;z<=30;z+=8){
  const light=new THREE.PointLight(0xf4fbff,3.2,15,2);light.position.set(0,hall.height-.35,z);scene.add(light);
  box(1.4,.06,.5,new THREE.MeshStandardMaterial({color:0xeaf8ff,emissive:0xcceeff,emissiveIntensity:2}),0,hall.height-.12,z);
}

const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
function labelTexture(text){
  const c=canvas.cloneNode(); const ctx=c.getContext('2d');
  ctx.fillStyle='#07111f';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#9be7ff';ctx.lineWidth=6;ctx.strokeRect(3,3,c.width-6,c.height-6);
  ctx.fillStyle='#ffffff';ctx.font='bold 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const doors=[];
for(const room of data.rooms){
  const side=room.side==='left'?-1:1;
  const x=side*(hall.width/2-.15);
  const door=box(.12,2.35,1.35,doorMat,x,1.175,room.z);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.32),new THREE.MeshBasicMaterial({map:labelTexture(room.name)}));
  sign.position.set(side*(hall.width/2-.245),2.78,room.z);
  sign.rotation.y=side===-1?Math.PI/2:-Math.PI/2;scene.add(sign);
  doors.push({room,position:new THREE.Vector3(x,1.5,room.z)});
}

const move = {speed:5.4,radius:.32};
function clampPlayer(next){
  next.x=THREE.MathUtils.clamp(next.x,-hall.width/2+move.radius,hall.width/2-move.radius);
  next.z=THREE.MathUtils.clamp(next.z,-hall.length/2+move.radius,hall.length/2-move.radius);
  next.y=data.spawn.y;
}
window.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyE'&&activeDoor&&!roomOpen)openRoom(activeDoor.room)});
window.addEventListener('keyup',e=>keys.delete(e.code));
controls.addEventListener('lock',()=>menu.classList.add('hidden'));
controls.addEventListener('unlock',()=>{if(!roomOpen)menu.classList.remove('hidden');savePosition()});
document.getElementById('start').onclick=()=>controls.lock();
document.getElementById('reset').onclick=()=>{resetPosition();if(!controls.isLocked&&!roomOpen)controls.lock()};

function leaveRoom(){
  roomOpen=false;
  sceneOverlay.classList.remove('open');
  sceneBody.innerHTML='';
  controls.lock();
}
document.getElementById('leave').onclick=leaveRoom;
window.addEventListener('message',event=>{
  if(event.data?.type==='shp:explorer-leave-room') leaveRoom();
});
function openRoom(room){
  roomOpen=true;controls.unlock();menu.classList.add('hidden');sceneOverlay.classList.add('open');
  if(room.sceneHtml){
    const frame=document.createElement('iframe');
    frame.className='room-frame';
    frame.src=room.sceneHtml;
    frame.title=`${room.name}'s dorm room`;
    frame.setAttribute('allow','fullscreen');
    sceneBody.replaceChildren(frame);
  }else if(room.sceneImage){
    sceneBody.innerHTML=`<img src="${room.sceneImage}" alt="${room.name}'s dorm room">`;
  }else{
    sceneBody.innerHTML=`<div class="placeholder-room"><div><h2>${room.name}'s Dorm</h2><p>No interactive room layout exists for this student in the source map yet. Add a <code>sceneHtml</code> destination to the shared dorm data when one is available.</p></div></div>`;
  }
}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(controls.isLocked&&!roomOpen){
    const old=camera.position.clone();
    const amount=move.speed*dt;
    if(keys.has('KeyW'))controls.moveForward(amount);
    if(keys.has('KeyS'))controls.moveForward(-amount);
    if(keys.has('KeyA'))controls.moveRight(-amount);
    if(keys.has('KeyD'))controls.moveRight(amount);
    clampPlayer(camera.position);
    if(!Number.isFinite(camera.position.x))camera.position.copy(old);
    activeDoor=null;let best=2.15;
    for(const d of doors){const dist=camera.position.distanceTo(d.position);if(dist<best){best=dist;activeDoor=d;}}
    if(activeDoor){prompt.textContent=`[ E ] Enter ${activeDoor.room.name}'s Dorm`;prompt.classList.add('show');}
    else prompt.classList.remove('show');
  } else prompt.classList.remove('show');
  renderer.render(scene,camera);
}
animate();
setInterval(()=>{if(controls.isLocked)savePosition()},2500);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
