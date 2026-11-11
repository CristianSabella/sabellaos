// Entrada de SabellaOS: una habitación gamer en 3D hecha con Three.js (todo armado por código, sin modelos externos)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const AZUL = new THREE.Color('#4fc3ff'), FUC = new THREE.Color('#d63bb0'), VIO = new THREE.Color('#8b5cf6');
const degrade = t => { t = ((t % 1) + 1) % 1; return t < .5 ? AZUL.clone().lerp(VIO, t * 2) : VIO.clone().lerp(FUC, (t - .5) * 2); };
const ida = t => { t = ((t % 2) + 2) % 2; return t < 1 ? t : 2 - t; };

export function iniciarEscena({ canvas, celu, alEntrar, alListo }) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  let calidad = Math.min(window.devicePixelRatio || 1, celu ? 1 : 1.25); r.setPixelRatio(calidad);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.25;
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#070b16'); sc.fog = new THREE.Fog('#070b16', 14, 30);
  const cam = new THREE.PerspectiveCamera(36, 1, .05, 60);

  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: .25 }, o));
  const brillo = (c, i = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: .4 });
  const grupo = new THREE.Group(); sc.add(grupo); // todo lo que se puede tocar para entrar
  const add = (g, m, x, y, z, padre = sc) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); padre.add(o); return o; };
  const animados = [];

  // ---------- Luces ----------
  sc.add(new THREE.HemisphereLight('#5a6ea8', '#120c18', 1.15));
  const lLampara = new THREE.PointLight('#ffb36b', 16, 9, 1.6); lLampara.position.set(-4.1, 3.9, 1.2); sc.add(lLampara);
  const lLuna = new THREE.PointLight('#7fb2ff', 10, 9, 1.6); lLuna.position.set(-3.6, 3.2, -.6); sc.add(lLuna);
  const lFuc = new THREE.PointLight(FUC, 26, 13); lFuc.position.set(3.4, 2.6, .9); sc.add(lFuc);
  const lAzul = new THREE.PointLight(AZUL, 24, 13); lAzul.position.set(-3.2, 2.8, 1.2); sc.add(lAzul);
  const sol = new THREE.DirectionalLight('#b3a6ff', .7); sol.position.set(1, 6, 7); sc.add(sol);

  // ---------- Habitación ----------
  function textura(w, h, dibujar, rx = 1, ry = 1) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; dibujar(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
  }
  // piso de madera oscura
  const texPiso = textura(512, 512, (x, w, h) => {
    for (let i = 0; i < 8; i++) { const y = i * 64; x.fillStyle = `hsl(${22 + (i % 3) * 3},${24 + (i % 2) * 6}%,${12 + (i % 4)}%)`; x.fillRect(0, y, w, 64);
      for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(0,0,0,${.05 + Math.random() * .08})`; x.beginPath(); const yy = y + Math.random() * 64; x.moveTo(0, yy); x.bezierCurveTo(w * .3, yy + 4, w * .6, yy - 4, w, yy + 2); x.stroke(); }
      x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, y, w, 2); x.fillRect(((i * 197) % w), y, 2, 64); }
  }, 6, 6);
  add(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: texPiso, roughness: .45, metalness: .15, color: '#b7a6a0' }), 0, 0, 0).rotation.x = -Math.PI / 2;
  // pared con textura suave
  const texPared = textura(512, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2340'); g.addColorStop(1, '#141a30'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  }, 8, 3);
  add(new THREE.PlaneGeometry(40, 14), new THREE.MeshStandardMaterial({ map: texPared, roughness: .95 }), 0, 7, -1.7);
  const lat = add(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: texPared, roughness: .95 }), -5.2, 7, 3); lat.rotation.y = Math.PI / 2;
  // panel acústico de listones de madera detrás del escritorio
  const texListones = textura(512, 256, (x, w, h) => {
    x.fillStyle = '#0d090b'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) { const g = x.createLinearGradient(i * 15, 0, i * 15 + 11, 0); g.addColorStop(0, '#2c1f19'); g.addColorStop(.5, i % 2 ? '#4a3529' : '#433025'); g.addColorStop(1, '#22170f'); x.fillStyle = g; x.fillRect(i * 15 + 2, 0, 11, h); }
  });
  add(new THREE.BoxGeometry(5.1, 3.3, .04), new THREE.MeshStandardMaterial({ map: texListones, roughness: .7 }), 0, 2.65, -1.685);
  // luz de techo (cornisa con LED)
  const corn = add(new THREE.BoxGeometry(40, .06, .06), brillo(VIO, 1.4), 0, 5.3, -1.6);
  animados.push(t => corn.material.emissive.copy(degrade(.55 + Math.sin(t * .3) * .2)));
  // ventana con la ciudad de noche
  // vista de la ciudad de noche (foto)
  const texCiudad = new THREE.TextureLoader().load('img/ciudad.jpg'); texCiudad.colorSpace = THREE.SRGBColorSpace;
  texCiudad.repeat.set(.75, 1); texCiudad.offset.set(.125, 0); // la foto es más ancha que la ventana: se recorta a los costados
  const ventanaVid = add(new THREE.PlaneGeometry(2.2, 1.65), new THREE.MeshBasicMaterial({ map: texCiudad, toneMapped: false }), -4.0, 3.0, -1.66);
  ventanaVid.material.color.setScalar(1.05);
  for (const [w, h, x, y] of [[2.36, .08, -4.0, 3.86], [2.36, .08, -4.0, 2.14], [.08, 1.8, -5.14, 3.0], [.08, 1.8, -2.86, 3.0], [.05, 1.65, -4.0, 3.0], [2.2, .04, -4.0, 3.0]]) add(new THREE.BoxGeometry(w, h, .1), mat('#e8e6f0', { roughness: .5 }), x, y, -1.62);
  add(new THREE.BoxGeometry(2.5, .06, .26), mat('#e8e6f0'), -4.0, 2.1, -1.52);
  // cortinas
  for (const lado of [-1, 1]) for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(.13, 3.2, .05), mat(k % 2 ? '#3b2453' : '#432a5e', { roughness: .95 }), -4.0 + lado * (1.18 + k * .065), 2.55, -1.5 + (k % 2) * .05);
  add(new THREE.CylinderGeometry(.02, .02, 3.3, 8), mat('#c8c8d8', { metalness: .9 }), -4.0, 4.15, -1.5).rotation.z = Math.PI / 2;
  // alfombra con borde de luz
  add(new THREE.CylinderGeometry(1.6, 1.6, .02, 64), mat('#2b1f3d', { roughness: 1 }), -1.9, .012, 1.5);
  const bordeAlf = add(new THREE.TorusGeometry(1.6, .018, 8, 96), brillo(FUC, .55), -1.9, .03, 1.5); bordeAlf.rotation.x = Math.PI / 2;
  // lámpara de pie (luz cálida)
  add(new THREE.CylinderGeometry(.22, .25, .05, 32), mat('#1c1c24', { metalness: .8 }), -4.4, .03, 1.2);
  add(new THREE.CylinderGeometry(.025, .025, 3.6, 12), mat('#2a2a34', { metalness: .9 }), -4.4, 1.8, 1.2);
  const pantalla = add(new THREE.CylinderGeometry(.28, .42, .5, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd6a0', emissive: '#ffb36b', emissiveIntensity: 1.2, side: THREE.DoubleSide, roughness: .8 }), -4.4, 3.75, 1.2);
  // planta grande en la esquina
  add(new THREE.CylinderGeometry(.32, .26, .6, 24), mat('#e9e4f2', { roughness: .4 }), -4.6, .3, -1.1);
  for (let i = 0; i < 14; i++) { const hoja = add(new THREE.SphereGeometry(.28, 12, 8), mat(i % 2 ? '#1f8a5a' : '#2aa06a', { roughness: .8 }), -4.6 + Math.cos(i * 2.4) * .3, .9 + (i % 5) * .32, -1.1 + Math.sin(i * 2.4) * .25); hoja.scale.set(.55, 1.2, .2); hoja.rotation.set(Math.sin(i) * .6, i, Math.cos(i * 1.3) * .7); }
  // mueble con cubos a la derecha
  const mueble = new THREE.Group(); mueble.position.set(4.6, 0, -1.25); sc.add(mueble);
  add(new THREE.BoxGeometry(1.4, 2.1, .7), mat('#1b1622', { roughness: .6 }), 0, 1.05, 0, mueble);
  for (let f = 0; f < 3; f++) for (let c = 0; c < 2; c++) { add(new THREE.BoxGeometry(.6, .6, .05), mat('#0f0c14'), -.33 + c * .66, .4 + f * .66, .33, mueble); }
  add(new THREE.BoxGeometry(1.36, .02, .02), brillo(AZUL, 1.4), 0, 2.1, .36, mueble);
  add(new RoundedBoxGeometry(.4, .5, .3, 2, .04), mat('#2d6cdf'), -.33, .45, .25, mueble); // consola
  add(new THREE.BoxGeometry(.06, .3, .06), brillo(FUC, 2), .33, 1.1, .3, mueble);
  for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(.06, .4, .3), mat(['#4fc3ff', '#d63bb0', '#8b5cf6', '#e8bd4c', '#3ddc84'][i]), .1 + i * .08, 1.75, .1, mueble);
  // zócalo con luz
  add(new THREE.BoxGeometry(40, .05, .05), brillo(VIO, .9), 0, .03, -1.66);
  // paneles hexagonales de luz en la pared
  const hexG = new THREE.CylinderGeometry(.34, .34, .05, 6);
  const hexes = [[3.55, 2.55], [4.13, 2.88], [4.13, 2.21], [4.71, 2.55], [4.71, 3.21]];
  hexes.forEach(([x, y], i) => {
    const marco = add(hexG, mat('#111827', { roughness: .4 }), x, y, -1.66); marco.rotation.x = Math.PI / 2; marco.rotation.y = Math.PI / 6;
    const luz = add(new THREE.CylinderGeometry(.29, .29, .06, 6), brillo(degrade(i / 5), 1.3), x, y, -1.64); luz.rotation.x = Math.PI / 2; luz.rotation.y = Math.PI / 6;
    animados.push(t => { luz.material.emissive.copy(degrade(i / 5 + t * .05)); luz.material.color.copy(luz.material.emissive); luz.material.emissiveIntensity = 1.1 + .35 * Math.sin(t * 1.4 + i); });
  });
  // tira LED detrás del escritorio con onda de color
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, .045, .04), new THREE.MeshBasicMaterial({ toneMapped: false }), 48);
  const mtx = new THREE.Matrix4(), colTmp = new THREE.Color();
  for (let i = 0; i < 48; i++) { mtx.setPosition(-3.95 + i * .168, 4.32, -1.64); leds.setMatrixAt(i, mtx); leds.setColorAt(i, AZUL); }
  sc.add(leds);
  animados.push(t => { for (let i = 0; i < 48; i++) leds.setColorAt(i, colTmp.copy(degrade(i / 48 - t * .12)).multiplyScalar(1.6)); leds.instanceColor.needsUpdate = true; });

  // cartel de neón "<CS/>"
  const nc = document.createElement('canvas'); nc.width = 1024; nc.height = 320; const nx = nc.getContext('2d');
  function dibujarNeon(on) {
    nx.clearRect(0, 0, 1024, 320); nx.font = '800 210px Inter, Arial, sans-serif'; nx.textAlign = 'center'; nx.textBaseline = 'middle';
    const g = nx.createLinearGradient(160, 0, 860, 0); g.addColorStop(0, '#4fc3ff'); g.addColorStop(.5, '#a78bfa'); g.addColorStop(1, '#ff5fd2');
    nx.shadowColor = on ? '#d63bb0' : 'transparent'; nx.shadowBlur = on ? 40 : 0; nx.fillStyle = g; nx.globalAlpha = on ? 1 : .25;
    nx.fillText('<CS/>', 512, 170); nx.shadowBlur = on ? 14 : 0; nx.fillText('<CS/>', 512, 170); nx.globalAlpha = 1;
  }
  dibujarNeon(true);
  const neonTex = new THREE.CanvasTexture(nc); neonTex.colorSpace = THREE.SRGBColorSpace;
  const neon = add(new THREE.PlaneGeometry(1.6, .5), new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, toneMapped: false, depthWrite: false }), 2.35, 3.15, -1.62);
  neon.material.color.setScalar(1.6);
  let neonOn = true, proxParpadeo = 4;
  animados.push((t, dt) => {
    proxParpadeo -= dt;
    if (proxParpadeo < 0) { neonOn = !neonOn; dibujarNeon(neonOn); neonTex.needsUpdate = true; proxParpadeo = neonOn ? 3 + Math.random() * 6 : .06 + Math.random() * .1; }
  });

  // póster propio (atardecer synthwave) en la pared lateral
  const pc = document.createElement('canvas'); pc.width = 512; pc.height = 700; const px = pc.getContext('2d');
  const cg = px.createLinearGradient(0, 0, 0, 700); cg.addColorStop(0, '#0b0820'); cg.addColorStop(.55, '#3b0f52'); cg.addColorStop(1, '#06121f'); px.fillStyle = cg; px.fillRect(0, 0, 512, 700);
  const sg = px.createLinearGradient(0, 180, 0, 420); sg.addColorStop(0, '#ffcf6b'); sg.addColorStop(1, '#ff3fa4'); px.fillStyle = sg; px.beginPath(); px.arc(256, 380, 150, Math.PI, 0); px.fill();
  px.fillStyle = '#0b0820'; for (let i = 0; i < 6; i++) px.fillRect(100, 300 + i * 16, 312, 4 + i);
  px.strokeStyle = '#4fc3ff'; px.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = 420 + i * i * 4; px.beginPath(); px.moveTo(0, y); px.lineTo(512, y); px.stroke(); }
  for (let i = -8; i <= 8; i++) { px.beginPath(); px.moveTo(256 + i * 10, 420); px.lineTo(256 + i * 80, 700); px.stroke(); }
  px.fillStyle = '#e6f4ff'; px.font = '800 58px Inter, Arial'; px.textAlign = 'center'; px.fillText('PRESS START', 256, 110);
  px.fillStyle = '#4fc3ff'; px.font = '700 26px monospace'; px.fillText('PLAYER 1 · CRISTIAN', 256, 152);
  const posterTex = new THREE.CanvasTexture(pc); posterTex.colorSpace = THREE.SRGBColorSpace;
  const poster = add(new THREE.BoxGeometry(.88, 1.2, .04), [mat('#05070c'), mat('#05070c'), mat('#05070c'), mat('#05070c'), new THREE.MeshStandardMaterial({ map: posterTex, emissive: '#ffffff', emissiveMap: posterTex, emissiveIntensity: .35 }), mat('#05070c')], -1.95, 2.95, -1.64);

  // estante con cosas
  add(new RoundedBoxGeometry(1.5, .06, .32, 2, .02), mat('#141b2b'), -.2, 3.05 + .78, -1.5);
  add(new THREE.BoxGeometry(1.5, .015, .015), brillo(AZUL, 1.6), -.2, 3.8, -1.34);
  const libroCol = ['#4fc3ff', '#d63bb0', '#8b5cf6', '#1f2a44'];
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.07, .3 + (i % 2) * .06, .22), mat(libroCol[i]), -.85 + i * .08, 4.03 + (i % 2) * .03, -1.5);
  // mini robot (como el de tus bots)
  const rob = new THREE.Group(); rob.position.set(-.25, 3.88, -1.5); sc.add(rob);
  add(new RoundedBoxGeometry(.22, .2, .18, 2, .04), mat('#2b6fe0', { metalness: .4 }), 0, .18, 0, rob);
  add(new THREE.BoxGeometry(.15, .045, .02), brillo(AZUL, 2.5), 0, .19, .1, rob);
  add(new RoundedBoxGeometry(.16, .14, .14, 2, .03), mat('#1d4fb0'), 0, .03, 0, rob);
  add(new THREE.SphereGeometry(.025, 12, 8), brillo(FUC, 3), 0, .32, 0, rob);
  animados.push(t => { rob.rotation.y = Math.sin(t * .6) * .5; });
  // planta
  add(new THREE.CylinderGeometry(.07, .055, .13, 16), mat('#e6f4ff', { roughness: .3 }), .3, 3.93, -1.5);
  for (let i = 0; i < 6; i++) { const h = add(new THREE.ConeGeometry(.035, .26, 6), mat('#1f9d6b'), .3 + Math.cos(i) * .04, 4.1, -1.5 + Math.sin(i) * .04); h.rotation.z = Math.cos(i * 2) * .5; h.rotation.x = Math.sin(i * 2) * .5; }
  // trofeo
  add(new THREE.CylinderGeometry(.05, .07, .05, 16), mat('#d4a73a', { metalness: .9, roughness: .25 }), .55, 3.89, -1.5);
  add(new THREE.CylinderGeometry(.075, .03, .14, 16), mat('#e8bd4c', { metalness: .9, roughness: .2 }), .55, 4.0, -1.5);

  // ---------- Escritorio ----------
  add(new RoundedBoxGeometry(6.6, .12, 2.15, 3, .04), mat('#0e1420', { roughness: .3, metalness: .55 }), 0, 1.0, -.25, grupo);
  const filo = add(new THREE.BoxGeometry(6.58, .022, .022), brillo(FUC, 1.3), 0, .935, .83);
  animados.push(t => { filo.material.emissive.copy(degrade(.75 + Math.sin(t * .5) * .2)); });
  for (const x of [-3.1, 3.1]) add(new THREE.BoxGeometry(.1, .94, 1.9), mat('#0a0e18', { metalness: .6 }), x, .47, -.25);

  // ---------- Monitor curvo con SabellaOS adentro (dibujado en vivo) ----------
  const SW = 1400, SH = 504, ESC = celu ? .55 : .72; // se dibuja más chico: menos trabajo para la placa de video
  const scv = document.createElement('canvas'); scv.width = Math.round(SW * ESC); scv.height = Math.round(SH * ESC); const s = scv.getContext('2d');
  const pantTex = new THREE.CanvasTexture(scv); pantTex.colorSpace = THREE.SRGBColorSpace; pantTex.wrapS = THREE.RepeatWrapping; pantTex.repeat.x = -1; pantTex.offset.x = 1; pantTex.anisotropy = 4; pantTex.generateMipmaps = false; pantTex.minFilter = THREE.LinearFilter;
  const gotas = Array.from({ length: 50 }, () => [Math.random() * SW, Math.random() * SH, .4 + Math.random()]);
  const lineasTerm = ['coti@sabellaos:~$ ayuda', '  proyectos  cv  juegos  contacto  stack', 'coti@sabellaos:~$ stack', '  C# · .NET · Flutter · SQL Server · JS', 'coti@sabellaos:~$ jugar arena'];
  // la parte fija de la pantalla se dibuja UNA sola vez
  const base = document.createElement('canvas'); base.width = scv.width; base.height = scv.height;
  (function dibujarBase() {
    const s = base.getContext('2d'); s.setTransform(ESC, 0, 0, ESC, 0, 0);
    const g = s.createLinearGradient(0, 0, SW, SH); g.addColorStop(0, '#0b2a44'); g.addColorStop(.5, '#0a0f22'); g.addColorStop(1, '#3a0f3a'); s.fillStyle = g; s.fillRect(0, 0, SW, SH);
    s.textAlign = 'center'; s.font = '800 92px Inter, Arial'; const lg = s.createLinearGradient(450, 0, 950, 0); lg.addColorStop(0, '#4fc3ff'); lg.addColorStop(.5, '#a78bfa'); lg.addColorStop(1, '#ff5fd2'); s.fillStyle = lg; s.fillText('SabellaOS', SW / 2, 230); s.textAlign = 'left';
    ['📁', '👤', '📄', '🎮', '🎵', '💻'].forEach((ic, i) => { s.fillStyle = 'rgba(79,195,255,.18)'; s.fillRect(22, 18 + i * 66, 50, 50); s.font = '30px sans-serif'; s.fillText(ic, 31, 54 + i * 66); });
    const wx = 1020, wy = 30, ww = 350, wh = 190;
    s.fillStyle = 'rgba(10,18,32,.92)'; s.fillRect(wx, wy, ww, wh); s.fillStyle = 'rgba(214,59,176,.35)'; s.fillRect(wx, wy, ww, 24);
    s.fillStyle = '#e6f4ff'; s.font = '600 14px Inter, Arial'; s.fillText('🎵 Música', wx + 10, wy + 17);
    const tx = 860, ty = 270, tw = 480, th = 160;
    s.fillStyle = 'rgba(4,8,15,.95)'; s.fillRect(tx, ty, tw, th); s.fillStyle = 'rgba(79,195,255,.3)'; s.fillRect(tx, ty, tw, 22);
    s.fillStyle = '#e6f4ff'; s.font = '600 13px Inter, Arial'; s.fillText('💻 Terminal', tx + 10, ty + 16);
    s.fillStyle = 'rgba(10,18,32,.92)'; s.fillRect(110, 270, 560, 190); s.fillStyle = 'rgba(79,195,255,.3)'; s.fillRect(110, 270, 560, 22);
    s.fillStyle = '#e6f4ff'; s.fillText('📁 Proyectos', 120, 286);
    for (let i = 0; i < 4; i++) { const cg2 = s.createLinearGradient(0, 300, 0, 400); cg2.addColorStop(0, i % 2 ? '#4fc3ff' : '#d63bb0'); cg2.addColorStop(1, '#0a1220'); s.fillStyle = cg2; s.fillRect(124 + i * 135, 304, 120, 80); s.fillStyle = '#e6f4ff'; s.font = '600 13px Inter'; s.fillText(['DyNamo', 'Atelier', 'MAREA', 'Arena'][i], 128 + i * 135, 404); }
    s.fillStyle = 'rgba(6,12,22,.95)'; s.fillRect(0, SH - 34, SW, 34);
    const bgr = s.createLinearGradient(0, 0, 30, 30); bgr.addColorStop(0, '#4fc3ff'); bgr.addColorStop(1, '#d63bb0'); s.fillStyle = bgr; s.fillRect(10, SH - 28, 22, 22);
    s.fillStyle = 'rgba(255,255,255,.08)'; s.fillRect(44, SH - 34, 230, 34); s.fillStyle = '#8fa9c4'; s.font = '13px Inter'; s.fillText('🔍 Escribí aquí para buscar', 54, SH - 12);
  })();
  const barraGrad = (() => { const g = s.createLinearGradient(0, 85, 0, 205); g.addColorStop(0, '#ff5fd2'); g.addColorStop(1, '#4fc3ff'); return g; })();
  // lo que se mueve: lluvia de números, barras de música, terminal y reloj
  function dibujarPantalla(t) {
    s.setTransform(1, 0, 0, 1, 0, 0); s.drawImage(base, 0, 0); s.setTransform(ESC, 0, 0, ESC, 0, 0);
    s.font = '600 14px monospace'; s.fillStyle = 'rgba(79,195,255,.18)';
    gotas.forEach(d => { d[1] += d[2] * 5; if (d[1] > SH) d[1] = -10; if (d[0] > 90 && (d[0] < 100 || d[0] > 680) && d[1] < 470) s.fillText(d[2] > .9 ? '1' : '0', d[0], d[1]); });
    s.fillStyle = barraGrad;
    for (let i = 0; i < 28; i++) { const h = 20 + Math.abs(Math.sin(t * 3 + i * .5) * Math.sin(t * 1.3 + i * .21)) * 120; s.fillRect(1034 + i * 11.6, 205 - h, 8, h); }
    s.font = '500 14px monospace'; const n = Math.floor(t * 1.2) % (lineasTerm.length + 3);
    lineasTerm.slice(0, Math.min(n, lineasTerm.length)).forEach((l, i) => { s.fillStyle = l.startsWith('coti') ? '#3ddc84' : '#c8e6ff'; s.fillText(l, 872, 314 + i * 22); });
    s.fillStyle = '#e6f4ff'; s.font = '13px Inter'; s.textAlign = 'right'; s.fillText(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), SW - 14, SH - 12); s.textAlign = 'left';
    pantTex.needsUpdate = true;
  }
  dibujarPantalla(0);
  const R = 4.2, arco = .8, hM = 1.2;
  const pant = new THREE.Mesh(new THREE.CylinderGeometry(R, R, hM, 72, 1, true, Math.PI - arco / 2, arco), new THREE.MeshBasicMaterial({ map: pantTex, side: THREE.DoubleSide, toneMapped: false }));
  pant.material.color.setScalar(1.12); pant.position.set(0, 2.07, R - .55); grupo.add(pant);
  const marco = new THREE.Mesh(new THREE.CylinderGeometry(R + .025, R + .025, hM + .08, 72, 1, true, Math.PI - arco / 2 - .009, arco + .018), mat('#05070c', { side: THREE.DoubleSide, roughness: .3, metalness: .6 }));
  marco.position.set(0, 2.07, R - .55); grupo.add(marco);
  const lucesAtras = add(new THREE.BoxGeometry(2.9, .03, .03), brillo(FUC, 1.6), 0, 2.67, -.62);
  add(new THREE.BoxGeometry(.12, .72, .1), mat('#151c2c', { metalness: .85, roughness: .3 }), 0, 1.4, -.78, grupo);
  add(new RoundedBoxGeometry(.95, .045, .48, 2, .02), mat('#151c2c', { metalness: .85, roughness: .3 }), 0, 1.08, -.68, grupo);

  // ---------- Teclado mecánico RGB (onda de color) ----------
  add(new RoundedBoxGeometry(1.8, .06, .6, 2, .02), mat('#0b0f18', { metalness: .6 }), -.15, 1.09, .38, grupo);
  const teclas = new THREE.InstancedMesh(new THREE.BoxGeometry(.088, .045, .088), new THREE.MeshBasicMaterial({ toneMapped: false }), 85);
  for (let f = 0, n = 0; f < 5; f++) for (let c = 0; c < 17; c++, n++) { mtx.setPosition(-.95 + c * .1, 1.135, .17 + f * .1); teclas.setMatrixAt(n, mtx); teclas.setColorAt(n, AZUL); }
  grupo.add(teclas);
  const bajoTec = add(new THREE.BoxGeometry(1.84, .012, .64), brillo(VIO, 1), -.15, 1.062, .38);
  animados.push(t => { for (let f = 0, n = 0; f < 5; f++) for (let c = 0; c < 17; c++, n++) teclas.setColorAt(n, colTmp.copy(degrade(c / 17 * .8 + f * .03 - t * .25)).multiplyScalar(.75)); teclas.instanceColor.needsUpdate = true; });
  // mouse y pad
  add(new RoundedBoxGeometry(1.15, .015, .82, 2, .01), mat('#0a0d16', { roughness: .95 }), 1.38, 1.065, .4, grupo);
  const filoPad = add(new THREE.BoxGeometry(1.15, .008, .008), brillo(FUC, 1.6), 1.38, 1.07, .81);
  const mouse = add(new THREE.SphereGeometry(.09, 24, 16), mat('#0d121d', { metalness: .6 }), 1.42, 1.1, .45, grupo); mouse.scale.set(.75, .45, 1.25);
  add(new THREE.BoxGeometry(.02, .01, .07), brillo(AZUL, 3), 1.42, 1.135, .4);
  // taza con vapor
  add(new THREE.CylinderGeometry(.08, .07, .17, 20), mat('#e6f4ff', { roughness: .3 }), -1.45, 1.15, .45);
  add(new THREE.TorusGeometry(.045, .012, 8, 16), mat('#e6f4ff'), -1.37, 1.16, .45);
  const vaporG = new THREE.BufferGeometry(); const vaporN = 26, vp = new Float32Array(vaporN * 3), vv = [];
  for (let i = 0; i < vaporN; i++) { vv.push(Math.random()); }
  vaporG.setAttribute('position', new THREE.BufferAttribute(vp, 3));
  sc.add(new THREE.Points(vaporG, new THREE.PointsMaterial({ color: '#cfe2ff', size: .05, transparent: true, opacity: .35, depthWrite: false })));
  animados.push((t, dt) => { for (let i = 0; i < vaporN; i++) { vv[i] = (vv[i] + dt * .25) % 1; const k = vv[i]; vp[i * 3] = -1.45 + Math.sin(t * 2 + i) * .03 * k; vp[i * 3 + 1] = 1.25 + k * .45; vp[i * 3 + 2] = .45 + Math.cos(t * 1.5 + i) * .03 * k; } vaporG.attributes.position.needsUpdate = true; });

  // ---------- Gabinete gamer ----------
  const gab = new THREE.Group(); gab.position.set(2.6, 1.06, -.42); gab.rotation.y = -.42; grupo.add(gab);
  add(new RoundedBoxGeometry(.88, 1.86, 1.28, 3, .04), mat('#06080e', { metalness: .7, roughness: .3 }), 0, .93, 0, gab);
  add(new THREE.BoxGeometry(.012, 1.72, 1.16), new THREE.MeshPhysicalMaterial({ color: '#334', transparent: true, opacity: .18, roughness: .05, metalness: .2 }), -.445, .93, 0, gab);
  add(new THREE.BoxGeometry(.02, 1.6, 1.0), mat('#0c1220'), .3, .93, -.02, gab); // placa madre
  const aspas = [];
  for (let i = 0; i < 3; i++) {
    const col = degrade(i / 3);
    const aro = add(new THREE.TorusGeometry(.2, .026, 12, 48), brillo(col, 2.4), 0, 1.45 - i * .52, .645, gab);
    const rotor = new THREE.Group(); rotor.position.set(0, 1.45 - i * .52, .642); gab.add(rotor);
    add(new THREE.CircleGeometry(.06, 24), mat('#1a2233'), 0, 0, .004, rotor);
    for (let k = 0; k < 7; k++) { const a = add(new THREE.BoxGeometry(.15, .04, .008), new THREE.MeshStandardMaterial({ color: '#141a28', emissive: col, emissiveIntensity: .35 }), 0, 0, 0, rotor); a.rotation.z = k / 7 * Math.PI * 2; a.translateX(.09); a.rotation.x = .25; }
    aspas.push(rotor);
    animados.push(t => { aro.material.emissive.copy(degrade(i / 3 + t * .08)); });
  }
  // ventilador trasero, placa de video y memorias
  const aroT = add(new THREE.TorusGeometry(.15, .02, 10, 40), brillo(FUC, 2.2), -.2, 1.5, -.645, gab);
  add(new THREE.BoxGeometry(.5, .14, .78), mat('#10141f', { metalness: .7 }), -.08, .75, -.05, gab);
  const gpuLuz = add(new THREE.BoxGeometry(.5, .015, .74), brillo(FUC, 2), -.08, .825, -.05, gab);
  for (let i = 0; i < 4; i++) { const m = add(new THREE.BoxGeometry(.03, .26, .04), brillo(degrade(i / 4), 2.2), .15, 1.4, -.42 + i * .07, gab); animados.push(t => m.material.emissive.copy(degrade(i / 4 - t * .3))); }
  add(new THREE.BoxGeometry(.02, 1.76, .02), brillo(VIO, 1.4), -.43, .93, .62, gab);
  animados.push((t, dt) => { aspas.forEach((a, i) => a.rotation.z -= dt * (7 + i)); gpuLuz.material.emissive.copy(degrade(.8 + Math.sin(t) * .15)); });

  // ---------- Auriculares y parlante ----------
  add(new THREE.CylinderGeometry(.025, .03, .55, 12), mat('#151c2c', { metalness: .85 }), -2.45, 1.33, -.45);
  add(new THREE.CylinderGeometry(.13, .13, .02, 24), mat('#151c2c', { metalness: .85 }), -2.45, 1.07, -.45);
  add(new THREE.TorusGeometry(.2, .03, 12, 40, Math.PI), mat('#0b0f18'), -2.45, 1.6, -.45);
  for (const x of [-.2, .2]) {
    add(new THREE.CylinderGeometry(.09, .09, .08, 24), mat('#0b0f18'), -2.45 + x, 1.55, -.45).rotation.z = Math.PI / 2;
    const aro = add(new THREE.TorusGeometry(.07, .012, 8, 32), brillo(x < 0 ? AZUL : FUC, 3), -2.45 + x * 1.24, 1.55, -.45); aro.rotation.y = Math.PI / 2;
  }
  add(new RoundedBoxGeometry(.34, .58, .32, 2, .03), mat('#0b0f18'), -1.9, 1.35, -.78);
  const parl = add(new THREE.TorusGeometry(.1, .013, 8, 32), brillo(AZUL, 2.5), -1.9, 1.28, -.61);
  animados.push(t => { parl.scale.setScalar(1 + Math.max(0, Math.sin(t * 8.2)) * .08); });

  // ---------- Silla gamer (de espaldas) ----------
  const silla = new THREE.Group(); silla.position.set(-2.35, 0, 1.75); silla.rotation.y = .5; sc.add(silla);
  add(new RoundedBoxGeometry(.95, .14, .9, 3, .06), mat('#10131c'), 0, .95, 0, silla);
  const resp = add(new RoundedBoxGeometry(.9, 1.35, .18, 3, .08), mat('#10131c'), 0, 1.72, .42, silla); resp.rotation.x = -.12;
  for (const x of [-.24, .24]) { const f = add(new THREE.BoxGeometry(.12, 1.25, .02), new THREE.MeshStandardMaterial({ color: '#7a1f66', emissive: FUC, emissiveIntensity: .25 }), x, 1.72, .52, silla); f.rotation.x = -.12; }
  add(new RoundedBoxGeometry(.4, .16, .1, 2, .05), mat('#d63bb0', { roughness: .7 }), 0, 2.2, .44, silla);
  add(new THREE.CylinderGeometry(.04, .04, .55, 12), mat('#2a3142', { metalness: .9 }), 0, .6, 0, silla);
  for (let i = 0; i < 5; i++) { const p = add(new THREE.BoxGeometry(.5, .05, .07), mat('#1b2130', { metalness: .8 }), 0, .2, 0, silla); p.rotation.y = i / 5 * Math.PI * 2; p.translateX(.25); }

  // ---------- Polvo flotando en la luz ----------
  const PN = celu ? 90 : 200, polvoG = new THREE.BufferGeometry(), pp = new Float32Array(PN * 3);
  for (let i = 0; i < PN; i++) { pp[i * 3] = (Math.random() - .5) * 9; pp[i * 3 + 1] = Math.random() * 4.6; pp[i * 3 + 2] = -1.4 + Math.random() * 4; }
  polvoG.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  sc.add(new THREE.Points(polvoG, new THREE.PointsMaterial({ color: '#bcd7ff', size: .018, transparent: true, opacity: .55, depthWrite: false })));
  animados.push((t, dt) => { for (let i = 0; i < PN; i++) { pp[i * 3 + 1] += dt * .04; pp[i * 3] += Math.sin(t * .3 + i) * dt * .02; if (pp[i * 3 + 1] > 4.6) pp[i * 3 + 1] = 0; } polvoG.attributes.position.needsUpdate = true; });

  // ---------- Postproceso (brillo de las luces) ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: celu ? 0 : 2 }));
  comp.addPass(new RenderPass(sc, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), celu ? .5 : .62, .45, .8);
  comp.addPass(bloom); comp.addPass(new OutputPass());

  // ---------- Cámara ----------
  const camBase = new THREE.Vector3(), mira = new THREE.Vector3(-.35, 1.65, -.2), miraBase = new THREE.Vector3();
  function encuadre() {
    const w = canvas.clientWidth, h = canvas.clientHeight; r.setPixelRatio(calidad); comp.setPixelRatio(calidad); r.setSize(w, h, false); comp.setSize(w, h); bloom.setSize(Math.round(w * calidad / 2), Math.round(h * calidad / 2)); // el brillo se calcula a la mitad de resolución
    cam.aspect = w / h; const vertical = w / h < 1;
    cam.fov = vertical ? 58 : 36; cam.updateProjectionMatrix();
    camBase.set(vertical ? .9 : 2.4, vertical ? 2.7 : 2.75, vertical ? 9.6 : 8.6);
    miraBase.set(vertical ? .55 : -.35, vertical ? 2.35 : 1.65, -.2);
    if (!zoom) { cam.position.copy(camBase); mira.copy(miraBase); }
  }
  let zoom = null; encuadre(); window.addEventListener('resize', encuadre);
  const puntero = new THREE.Vector2();
  window.addEventListener('pointermove', e => { puntero.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });

  // clic en la PC para entrar
  const ray = new THREE.Raycaster();
  canvas.addEventListener('click', e => {
    if (zoom) return;
    const p = new THREE.Vector2(e.clientX / canvas.clientWidth * 2 - 1, -(e.clientY / canvas.clientHeight) * 2 + 1);
    ray.setFromCamera(p, cam);
    if (ray.intersectObject(grupo, true).length || celu) entrar();
  });
  canvas.addEventListener('pointermove', e => {
    if (zoom) return;
    const p = new THREE.Vector2(e.clientX / canvas.clientWidth * 2 - 1, -(e.clientY / canvas.clientHeight) * 2 + 1);
    ray.setFromCamera(p, cam); canvas.style.cursor = ray.intersectObject(grupo, true).length ? 'pointer' : 'default';
  });
  function entrar() {
    if (zoom) return;
    zoom = { t: 0, desde: cam.position.clone(), miraDesde: mira.clone(), hasta: new THREE.Vector3(0, 2.07, cam.aspect < 1 ? 1.0 : 1.2), miraHasta: new THREE.Vector3(0, 2.07, -.55) };
    document.getElementById('entrada').classList.add('zoom');
  }

  // ---------- Bucle ----------
  let corriendo = true, antes = performance.now(), t = 0, pantAcc = 0, listo = false; const medida = { n: 0, t: 0 };
  const suave = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  function bucle(ahora) {
    if (!corriendo) return;
    if (document.hidden) { antes = ahora; requestAnimationFrame(bucle); return; }
    const dt = Math.min(.05, (ahora - antes) / 1000); antes = ahora; t += dt;
    animados.forEach(f => f(t, dt));
    pantAcc += dt; if (pantAcc > .1) { pantAcc = 0; dibujarPantalla(t); }
    if (zoom) {
      zoom.t = Math.min(1, zoom.t + dt / 1.5); const k = suave(zoom.t);
      cam.position.lerpVectors(zoom.desde, zoom.hasta, k); mira.lerpVectors(zoom.miraDesde, zoom.miraHasta, k);
      if (zoom.t >= 1 && !zoom.fin) { zoom.fin = true; alEntrar(); }
    } else {
      cam.position.x += (camBase.x + puntero.x * .5 - cam.position.x) * .04;
      cam.position.y += (camBase.y + puntero.y * .25 - cam.position.y) * .04;
    }
    cam.lookAt(mira);
    comp.render();
    medida.n++; medida.t += dt;
    if (medida.t > 2) { const fps = medida.n / medida.t; medida.n = 0; medida.t = 0;
      if (fps < 45 && calidad > .6) { calidad = Math.max(.6, calidad - .15); encuadre(); }
      else if (fps < 30 && bloom.enabled && calidad <= .6) bloom.enabled = false; }
    if (!listo) { listo = true; alListo && alListo(); }
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  return {
    entrar,
    pausar() { corriendo = false; },
    volver() { // al apagar SabellaOS se vuelve a la habitación
      zoom = null; mira.copy(miraBase); cam.position.copy(camBase).add(new THREE.Vector3(0, 0, -2.5));
      document.getElementById('entrada').classList.remove('zoom');
      if (!corriendo) { corriendo = true; antes = performance.now(); requestAnimationFrame(bucle); }
    }
  };
}
