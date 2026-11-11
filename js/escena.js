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

export function iniciarEscena({ canvas, celu, alEntrar, alListo, whatsapp }) {
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

  // ---------- Luces (paredes bañadas de celeste y violeta, como un setup real) ----------
  sc.add(new THREE.HemisphereLight('#6f8fe0', '#2a1640', 1.25));
  const lCeleste = new THREE.PointLight('#38d6ff', 30, 11, 1.5); lCeleste.position.set(-3.6, 3.2, .4); sc.add(lCeleste);
  const lVioleta = new THREE.PointLight('#a855f7', 26, 9, 1.5); lVioleta.position.set(.2, .55, .2); sc.add(lVioleta); // bajo el escritorio
  const lFuc = new THREE.PointLight('#ff4fd8', 18, 8, 1.6); lFuc.position.set(1.6, 3.4, -.9); sc.add(lFuc);
  const sol = new THREE.DirectionalLight('#b8a8ff', .55); sol.position.set(1, 6, 7); sc.add(sol);

  // ---------- Habitación ----------
  function textura(w, h, dibujar, rx = 1, ry = 1) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; dibujar(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t;
  }
  // pared del fondo: luz LED celeste a la izquierda que pasa a violeta
  const texFondo = textura(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#1d4f8a'); g.addColorStop(.35, '#2a3f8f'); g.addColorStop(.7, '#3b2a7a'); g.addColorStop(1, '#2a1d55'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(6,8,20,.65)'); v.addColorStop(.55, 'rgba(6,8,20,0)'); v.addColorStop(.75, 'rgba(120,80,255,.12)'); v.addColorStop(1, 'rgba(6,8,20,.35)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .02})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  const fondo = add(new THREE.PlaneGeometry(14, 7), new THREE.MeshStandardMaterial({ map: texFondo, emissive: '#ffffff', emissiveMap: texFondo, emissiveIntensity: .38, roughness: .95 }), 0, 3.5, -1.7);
  const texLat = textura(512, 512, (x, w, h) => {
    const g = x.createLinearGradient(w, 0, 0, 0); g.addColorStop(0, '#1d5a96'); g.addColorStop(1, '#122a52'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(6,8,20,.6)'); v.addColorStop(.6, 'rgba(6,8,20,0)'); v.addColorStop(1, 'rgba(6,8,20,.3)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
  });
  const lat = add(new THREE.PlaneGeometry(10, 7), new THREE.MeshStandardMaterial({ map: texLat, emissive: '#ffffff', emissiveMap: texLat, emissiveIntensity: .32, roughness: .95 }), -5.2, 3.5, 3.3); lat.rotation.y = Math.PI / 2;
  // piso alfombrado lila
  const texPiso = textura(256, 256, (x, w, h) => { x.fillStyle = '#4a3a6e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .06})`; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } }, 14, 14);
  add(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: texPiso, roughness: .95, color: '#9b8fbf' }), 0, 0, 0).rotation.x = -Math.PI / 2;
  // cornisa LED en el techo
  const corn = add(new THREE.BoxGeometry(14, .05, .05), brillo(VIO, 1.2), 0, 6.2, -1.62);
  animados.push(t => corn.material.emissive.copy(degrade(.5 + Math.sin(t * .3) * .25)));

  // ventana con la ciudad de noche y cortinas
  const texCiudad = new THREE.TextureLoader().load('img/ciudad.jpg'); texCiudad.colorSpace = THREE.SRGBColorSpace; texCiudad.repeat.set(.75, 1); texCiudad.offset.set(.125, 0);
  const vent = add(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshBasicMaterial({ map: texCiudad, toneMapped: false }), -4.15, 3.25, -1.66); vent.material.color.setScalar(1.05);
  for (const [w, h, x, y] of [[1.86, .08, -4.15, 4.33], [1.86, .08, -4.15, 2.17], [.08, 2.24, -5.04, 3.25], [.08, 2.24, -3.26, 3.25], [.05, 2.1, -4.15, 3.25]]) add(new THREE.BoxGeometry(w, h, .1), mat('#151827', { roughness: .4 }), x, y, -1.62);
  for (const lado of [-1, 1]) for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(.12, 3.6, .05), mat(k % 2 ? '#26304d' : '#2c385a', { roughness: .95 }), -4.15 + lado * (.95 + k * .06), 2.45, -1.52 + (k % 2) * .05);

  // dos cuadros con arte propio
  function cuadro(dibujar, x, y) {
    const t = textura(360, 500, dibujar);
    add(new THREE.BoxGeometry(.98, 1.34, .05), mat('#08090e', { roughness: .4 }), x, y, -1.66);
    add(new THREE.PlaneGeometry(.88, 1.24), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: .45 }), x, y, -1.63);
  }
  cuadro((x, w, h) => { // guerrero frente a la luna
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d1b3d'); g.addColorStop(.6, '#2c4f86'); g.addColorStop(1, '#0b1020'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#dbe9ff'; x.shadowColor = '#9fd0ff'; x.shadowBlur = 30; x.beginPath(); x.arc(240, 120, 52, 0, 7); x.fill(); x.shadowBlur = 0;
    x.fillStyle = '#060a16'; x.beginPath(); x.moveTo(0, 430); x.lineTo(110, 360); x.lineTo(220, 420); x.lineTo(360, 340); x.lineTo(360, 500); x.lineTo(0, 500); x.fill();
    x.fillStyle = '#05070f'; x.beginPath(); x.moveTo(150, 400); x.lineTo(165, 250); x.lineTo(185, 215); x.lineTo(205, 250); x.lineTo(222, 400); x.fill(); x.beginPath(); x.arc(185, 205, 20, 0, 7); x.fill();
    x.strokeStyle = '#4fc3ff'; x.lineWidth = 5; x.shadowColor = '#4fc3ff'; x.shadowBlur = 18; x.beginPath(); x.moveTo(214, 300); x.lineTo(290, 150); x.stroke(); x.shadowBlur = 0;
    x.fillStyle = '#cfe6ff'; x.font = '800 30px Inter, Arial'; x.textAlign = 'center'; x.fillText('LA ÚLTIMA', 180, 455); x.fillText('PARTIDA', 180, 488);
  }, -2.35, 3.55);
  cuadro((x, w, h) => { // robot en la ciudad
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a0f3a'); g.addColorStop(.55, '#a32a6a'); g.addColorStop(1, '#1a0c22'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let b = 0; b < 9; b++) { const bh = 90 + (b * 53) % 170; x.fillStyle = '#12081c'; x.fillRect(b * 42 - 10, h - 80 - bh, 38, bh + 80); }
    x.fillStyle = '#0a0612'; x.fillRect(130, 170, 100, 120); x.fillRect(150, 120, 60, 50); x.fillRect(118, 290, 40, 110); x.fillRect(202, 290, 40, 110); x.fillRect(95, 180, 30, 100); x.fillRect(235, 180, 30, 100);
    x.fillStyle = '#ff5fd2'; x.shadowColor = '#ff5fd2'; x.shadowBlur = 20; x.fillRect(158, 138, 44, 10); x.shadowBlur = 0;
    x.fillStyle = '#ffe1f5'; x.font = '800 30px Inter, Arial'; x.textAlign = 'center'; x.fillText('NEÓN', 180, 455); x.fillText('ROSARIO', 180, 488);
  }, -.95, 3.55);

  // estantes con figuras
  const estante = (x, y, ancho) => { add(new RoundedBoxGeometry(ancho, .05, .3, 2, .02), mat('#0d0f16', { metalness: .4 }), x, y, -1.52); add(new THREE.BoxGeometry(ancho, .012, .012), brillo(AZUL, 1.2), x, y - .03, -1.38); };
  estante(1.15, 3.6, 1.5); estante(2.75, 3.15, 1.2);
  // Jarvis (el robot que se toca)
  const rob = new THREE.Group(); rob.position.set(.75, 3.63, -1.5); rob.scale.setScalar(1.35); sc.add(rob);
  add(new RoundedBoxGeometry(.22, .2, .18, 2, .04), mat('#2b6fe0', { metalness: .4 }), 0, .18, 0, rob);
  add(new THREE.BoxGeometry(.15, .045, .02), brillo(AZUL, 2.5), 0, .19, .1, rob);
  add(new RoundedBoxGeometry(.16, .14, .14, 2, .03), mat('#1d4fb0'), 0, .03, 0, rob);
  add(new THREE.SphereGeometry(.025, 12, 8), brillo(FUC, 3), 0, .32, 0, rob);
  animados.push(t => { rob.rotation.y = Math.sin(t * .6) * .5; });
  // figura de un guerrero y un mecha
  const fig = (x, y, col) => { add(new THREE.CylinderGeometry(.06, .07, .03, 16), mat('#111'), x, y + .015, -1.5); add(new THREE.CapsuleGeometry(.045, .16, 4, 8), mat(col, { metalness: .5 }), x, y + .14, -1.5); add(new THREE.SphereGeometry(.04, 12, 8), mat(col), x, y + .29, -1.5); };
  fig(1.35, 3.62, '#8a93a8'); fig(1.6, 3.62, '#c2410c');
  // vitrina de vidrio con figura adentro
  add(new THREE.BoxGeometry(.42, .5, .3), new THREE.MeshPhysicalMaterial({ color: '#cfe8ff', transparent: true, opacity: .12, roughness: .05 }), 3.0, 3.42, -1.5);
  const vitrinaLuz = add(new THREE.BoxGeometry(.42, .015, .3), brillo(FUC, 1.6), 3.0, 3.66, -1.5);
  fig(3.0, 3.17, '#e8bd4c');
  add(new THREE.SphereGeometry(.09, 12, 8), mat('#3aa36b'), 2.45, 3.25, -1.5); // plantita colgante
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.04, 8, 6), mat('#2f8a58'), 2.45 + Math.sin(i) * .04, 3.15 - i * .07, -1.45);

  const mtx = new THREE.Matrix4(), colTmp = new THREE.Color();
  // ---------- Escritorio en L con patas cruzadas ----------
  const tapaMat = mat('#0c0e14', { roughness: .35, metalness: .35 });
  add(new THREE.BoxGeometry(6.6, .07, 2.15), tapaMat, .2, 1.025, -.25, grupo);       // parte larga contra la pared
  add(new THREE.BoxGeometry(1.3, .07, 1.9), tapaMat, -2.45, 1.025, 1.77, grupo);      // parte corta (la L)
  const patasMat = mat('#05060a', { metalness: .7, roughness: .3 });
  function patasX(x, z, largo, girar) {
    const p = new THREE.Group(); p.position.set(x, 0, z); if (girar) p.rotation.y = Math.PI / 2; sc.add(p);
    for (const s of [-1, 1]) { const b = add(new THREE.BoxGeometry(.05, Math.hypot(largo, 1.0), .05), patasMat, 0, .5, 0, p); b.rotation.x = s * Math.atan2(largo, 1.0); }
    add(new THREE.BoxGeometry(.05, .05, largo), patasMat, 0, .03, 0, p);
  }
  patasX(3.35, -.25, 1.9); patasX(-2.95, -.25, 1.9); patasX(-2.45, 2.55, 1.15, true);
  // luz violeta bajo el escritorio
  const bajo1 = add(new THREE.BoxGeometry(6.3, .02, .03), brillo(VIO, 2), .2, .98, .78);
  const bajo2 = add(new THREE.BoxGeometry(.03, .02, 2.5), brillo(VIO, 2), -1.82, .98, 1.77);
  animados.push(t => { const c = degrade(.45 + Math.sin(t * .4) * .2); bajo1.material.emissive.copy(c); bajo2.material.emissive.copy(c); });
  // planta en el escritorio
  add(new THREE.CylinderGeometry(.14, .11, .2, 20), mat('#e9e4f2', { roughness: .4 }), -2.75, 1.17, 1.6);
  for (let i = 0; i < 10; i++) { const h = add(new THREE.SphereGeometry(.13, 10, 6), mat(i % 2 ? '#1f8a5a' : '#2aa06a', { roughness: .8 }), -2.75 + Math.cos(i * 2.4) * .14, 1.36 + (i % 3) * .07, 1.6 + Math.sin(i * 2.4) * .12); h.scale.set(.6, .35, 1.2); h.rotation.y = i; }
  // auriculares en soporte
  add(new THREE.CylinderGeometry(.11, .11, .02, 24), mat('#151c2c', { metalness: .85 }), -1.75, 1.07, -.95);
  add(new THREE.CylinderGeometry(.02, .02, .5, 12), mat('#151c2c', { metalness: .85 }), -1.75, 1.33, -.95);
  add(new THREE.TorusGeometry(.17, .028, 12, 40, Math.PI), mat('#0b0f18'), -1.75, 1.55, -.95);
  for (const x of [-.17, .17]) add(new THREE.CylinderGeometry(.08, .08, .07, 24), mat('#0b0f18'), -1.75 + x, 1.5, -.95).rotation.z = Math.PI / 2;

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

  // ---------- Celular sonando (WhatsApp) ----------
  const cel = new THREE.Group(); cel.position.set(-.98, 1.27, .6); cel.rotation.set(1.05, .3, 0, 'YXZ'); cel.scale.setScalar(1.45); sc.add(cel);
  const soporte = add(new THREE.BoxGeometry(.3, .05, .22), mat('#1b2130', { metalness: .7 }), -.98, 1.085, .52); soporte.rotation.y = .3;
  add(new RoundedBoxGeometry(.24, .025, .46, 3, .03), mat('#0b0d12', { metalness: .7, roughness: .25 }), 0, 0, 0, cel);
  const cc = document.createElement('canvas'); cc.width = 256; cc.height = 512; const cx = cc.getContext('2d');
  function dibujarCel(on) {
    const g = cx.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, on ? '#0f5132' : '#07140e'); g.addColorStop(1, on ? '#075e54' : '#050a08'); cx.fillStyle = g; cx.fillRect(0, 0, 256, 512);
    cx.textAlign = 'center'; cx.fillStyle = '#e8fff3'; cx.font = '600 22px Inter, Arial'; cx.fillText('WhatsApp · llamando…', 128, 70);
    cx.fillStyle = '#25d366'; cx.beginPath(); cx.arc(128, 190, 70, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.font = '800 54px Inter, Arial'; cx.fillText('CS', 128, 210);
    cx.font = '700 28px Inter, Arial'; cx.fillText('Cristian Sabella', 128, 310); cx.font = '500 19px Inter, Arial'; cx.fillStyle = '#b8f5d5'; cx.fillText('Tocá para escribirle', 128, 345);
    cx.fillStyle = '#e53935'; cx.beginPath(); cx.arc(70, 440, 34, 0, 7); cx.fill(); cx.fillStyle = '#25d366'; cx.beginPath(); cx.arc(186, 440, 34, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; cx.font = '32px sans-serif'; cx.fillText('✕', 70, 452); cx.fillText('✆', 186, 452);
  }
  dibujarCel(true);
  const celTex = new THREE.CanvasTexture(cc); celTex.colorSpace = THREE.SRGBColorSpace;
  const celPant = add(new THREE.PlaneGeometry(.21, .42), new THREE.MeshBasicMaterial({ map: celTex, toneMapped: false }), 0, .014, 0, cel); celPant.rotation.x = -Math.PI / 2;
  const ondas = [0, 1].map(() => { const o = add(new THREE.RingGeometry(.2, .225, 48), new THREE.MeshBasicMaterial({ color: '#25d366', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }), 0, .016, 0, cel); o.rotation.x = -Math.PI / 2; return o; });
  let celOn = true;
  animados.push(t => {
    const ciclo = t % 2.6, suena = ciclo < 1.5;
    cel.position.x = -.98 + (suena ? Math.sin(t * 90) * .007 : 0); cel.rotation.z = suena ? Math.sin(t * 70) * .05 : 0;
    if (suena !== celOn) { celOn = suena; dibujarCel(suena); celTex.needsUpdate = true; }
    ondas.forEach((o, i) => { const k = ((t * .9 + i * .5) % 1); o.scale.setScalar(.8 + k * 2.2); o.material.opacity = suena ? (1 - k) * .8 : 0; });
  });

  // ---------- Gabinete blanco con vidrio y ventiladores RGB ----------
  const gab = new THREE.Group(); gab.position.set(2.85, 1.06, -.75); gab.rotation.y = -.3; grupo.add(gab);
  add(new RoundedBoxGeometry(.85, 1.25, 1.1, 3, .04), mat('#b9bfcc', { metalness: .1, roughness: .7 }), 0, .63, 0, gab);
  add(new THREE.BoxGeometry(.015, 1.1, .95), new THREE.MeshPhysicalMaterial({ color: '#dfe8ff', transparent: true, opacity: .16, roughness: .05 }), -.43, .63, 0, gab);
  add(new THREE.BoxGeometry(.02, 1.05, .9), mat('#aab0bd', { roughness: .7 }), .3, .63, -.02, gab);
  const aspas = [];
  for (let i = 0; i < 2; i++) {
    const col = i ? FUC : AZUL;
    const aro = add(new THREE.TorusGeometry(.2, .03, 12, 48), brillo(col, 2.6), 0, .88 - i * .5, .555, gab);
    const rotor = new THREE.Group(); rotor.position.set(0, .88 - i * .5, .55); gab.add(rotor);
    for (let k = 0; k < 7; k++) { const a = add(new THREE.BoxGeometry(.15, .04, .008), new THREE.MeshStandardMaterial({ color: '#f5f5fa', emissive: col, emissiveIntensity: .45 }), 0, 0, 0, rotor); a.rotation.z = k / 7 * Math.PI * 2; a.translateX(.09); a.rotation.x = .25; }
    aspas.push(rotor);
    animados.push(t => { aro.material.emissive.copy(degrade((i ? .9 : .05) + Math.sin(t * .5) * .08)); });
  }
  for (let i = 0; i < 2; i++) { const a = add(new THREE.TorusGeometry(.16, .025, 10, 40), brillo(i ? FUC : VIO, 2.4), -.38, .85 - i * .42, .05, gab); a.rotation.y = Math.PI / 2; }
  add(new THREE.BoxGeometry(.45, .1, .6), mat('#9aa1b0', { roughness: .7 }), -.08, .45, -.05, gab);
  add(new THREE.BoxGeometry(.45, .012, .56), brillo(FUC, 2), -.08, .505, -.05, gab);
  animados.push((t, dt) => aspas.forEach((a, i) => a.rotation.z -= dt * (7 + i)));

  // segundo monitor vertical con el chat de Jarvis
  const vc = document.createElement('canvas'); vc.width = 256; vc.height = 448; const vx = vc.getContext('2d');
  vx.fillStyle = '#121520'; vx.fillRect(0, 0, 256, 448); vx.fillStyle = '#1b1f2c'; vx.fillRect(0, 0, 256, 54);
  vx.fillStyle = '#1e6fd9'; vx.beginPath(); vx.arc(30, 27, 17, 0, 7); vx.fill(); vx.fillStyle = '#fff'; vx.font = '700 17px Inter, Arial'; vx.fillText('Jarvis', 56, 25); vx.fillStyle = '#3ddc84'; vx.font = '12px Inter'; vx.fillText('● En línea', 56, 42);
  [['¡Hola! Soy Jarvis 🤖', 0], ['¿En qué te ayudo?', 0], ['Quiero ver proyectos', 1], ['¡Dale! Entrá a la PC 👉', 0]].forEach(([t, yo], i) => { vx.font = '14px Inter, Arial'; const w = vx.measureText(t).width + 22; vx.fillStyle = yo ? '#1e6fd9' : '#262b3a'; const x = yo ? 244 - w : 12; vx.fillRect(x, 76 + i * 54, w, 36); vx.fillStyle = '#fff'; vx.fillText(t, x + 11, 99 + i * 54); });
  const vTex = new THREE.CanvasTexture(vc); vTex.colorSpace = THREE.SRGBColorSpace;
  const vMon = new THREE.Group(); vMon.position.set(1.95, 1.06, -1.0); vMon.rotation.y = -.35; grupo.add(vMon);
  add(new THREE.BoxGeometry(.62, 1.06, .04), mat('#05070c', { metalness: .6 }), 0, 1.0, 0, vMon);
  add(new THREE.PlaneGeometry(.56, 1.0), new THREE.MeshBasicMaterial({ map: vTex, toneMapped: false }), 0, 1.0, .022, vMon);
  add(new THREE.BoxGeometry(.06, .45, .06), mat('#151c2c', { metalness: .85 }), 0, .25, -.06, vMon);
  add(new THREE.BoxGeometry(.32, .03, .26), mat('#151c2c', { metalness: .85 }), 0, .02, -.06, vMon);

  // ---------- Silla gamer con luces en los bordes ----------
  const silla = new THREE.Group(); silla.position.set(-1.75, 0, 2.35); silla.rotation.y = .95; sc.add(silla);
  const cuero = mat('#14151c', { roughness: .55 });
  add(new RoundedBoxGeometry(1.0, .16, .95, 3, .07), cuero, 0, 1.0, 0, silla);
  const resp = new THREE.Group(); resp.position.set(0, 1.08, .42); resp.rotation.x = -.13; silla.add(resp);
  add(new RoundedBoxGeometry(.92, 1.45, .2, 4, .1), cuero, 0, .75, 0, resp);
  add(new RoundedBoxGeometry(.34, .2, .12, 2, .05), mat('#1d1f2a'), 0, 1.22, -.12, resp); // almohadón
  for (const s of [-1, 1]) add(new RoundedBoxGeometry(.16, 1.0, .26, 3, .07), cuero, s * .45, .55, -.04, resp); // alas
  // tira de luz que recorre el borde del respaldo
  const curva = new THREE.CatmullRomCurve3([[-.47, .02], [-.52, .6], [-.44, 1.2], [-.3, 1.48], [0, 1.53], [.3, 1.48], [.44, 1.2], [.52, .6], [.47, .02]].map(([x, y]) => new THREE.Vector3(x, y, .11)));
  const texTira = textura(256, 8, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); ['#4fc3ff', '#8b5cf6', '#ff4fd8', '#ffb36b', '#3ddc84', '#4fc3ff'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c)); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const tira = new THREE.Mesh(new THREE.TubeGeometry(curva, 80, .016, 6, false), new THREE.MeshBasicMaterial({ map: texTira, toneMapped: false })); resp.add(tira);
  const tiraAsiento = new THREE.Mesh(new THREE.TorusGeometry(.47, .014, 6, 64), new THREE.MeshBasicMaterial({ map: texTira, toneMapped: false })); tiraAsiento.rotation.x = Math.PI / 2; tiraAsiento.scale.set(1, .95, 1); tiraAsiento.position.y = 1.08; silla.add(tiraAsiento);
  animados.push(t => { texTira.offset.x = -t * .25; });
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(.08, .3, .08), mat('#1d1f2a'), s * .5, 1.2, .05, silla); add(new RoundedBoxGeometry(.12, .05, .4, 2, .02), mat('#1d1f2a'), s * .5, 1.36, .02, silla); }
  add(new THREE.CylinderGeometry(.045, .045, .6, 12), mat('#2a3142', { metalness: .9 }), 0, .62, 0, silla);
  for (let i = 0; i < 5; i++) { const p = add(new THREE.BoxGeometry(.48, .05, .07), mat('#14151c', { metalness: .6 }), 0, .2, 0, silla); p.rotation.y = i / 5 * Math.PI * 2; p.translateX(.24); const r = add(new THREE.SphereGeometry(.045, 10, 8), mat('#0a0a0e'), 0, .06, 0, silla); r.position.set(Math.cos(-i / 5 * Math.PI * 2) * .46, .06, Math.sin(-i / 5 * Math.PI * 2) * .46); }

  // ---------- Polvo flotando en la luz ----------
  const PN = celu ? 90 : 200, polvoG = new THREE.BufferGeometry(), pp = new Float32Array(PN * 3);
  for (let i = 0; i < PN; i++) { pp[i * 3] = (Math.random() - .5) * 9; pp[i * 3 + 1] = Math.random() * 4.6; pp[i * 3 + 2] = -1.4 + Math.random() * 4; }
  polvoG.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  sc.add(new THREE.Points(polvoG, new THREE.PointsMaterial({ color: '#bcd7ff', size: .018, transparent: true, opacity: .55, depthWrite: false })));
  animados.push((t, dt) => { for (let i = 0; i < PN; i++) { pp[i * 3 + 1] += dt * .04; pp[i * 3] += Math.sin(t * .3 + i) * dt * .02; if (pp[i * 3 + 1] > 4.6) pp[i * 3 + 1] = 0; } polvoG.attributes.position.needsUpdate = true; });

  // ---------- Carteles flotantes que explican qué se puede tocar ----------
  const capa = document.createElement('div'); capa.id = 'marcas'; canvas.parentElement.appendChild(capa);
  const MARCAS = [
    { obj: cel, alto: .42, c: '#25d366', txt: celu ? '📱 ¡Te llaman! Escribime' : '📱 ¡Te están llamando! Escribime por WhatsApp', accion: () => window.open(whatsapp, '_blank', 'noopener') },
    { obj: rob, alto: .55, c: '#4fc3ff', txt: '🤖 Hablá con Jarvis', accion: () => entrar('jarvis') }
  ];
  const vTmp = new THREE.Vector3();
  MARCAS.forEach(m => { m.el = document.createElement('button'); m.el.className = 'marca'; m.el.style.setProperty('--c', m.c); m.el.innerHTML = `<i></i>${m.txt}`; m.el.onclick = m.accion; capa.appendChild(m.el); });
  function moverMarcas() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    MARCAS.forEach(m => { m.obj.getWorldPosition(vTmp); vTmp.y += m.alto; vTmp.project(cam); const mw = m.el.offsetWidth / 2 + 8; m.el.style.left = Math.max(mw, Math.min(w - mw, (vTmp.x + 1) / 2 * w)) + 'px'; m.el.style.top = ((-vTmp.y + 1) / 2 * h) + 'px'; });
  }

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
    if (ray.intersectObject(cel, true).length) return window.open(whatsapp, '_blank', 'noopener');
    if (ray.intersectObject(rob, true).length) return entrar('jarvis');
    if (ray.intersectObject(grupo, true).length || celu) entrar();
  });
  canvas.addEventListener('pointermove', e => {
    if (zoom) return;
    const p = new THREE.Vector2(e.clientX / canvas.clientWidth * 2 - 1, -(e.clientY / canvas.clientHeight) * 2 + 1);
    ray.setFromCamera(p, cam); canvas.style.cursor = ray.intersectObjects([grupo, cel, rob], true).length ? 'pointer' : 'default';
  });
  let appInicial = null;
  function entrar(app) {
    if (zoom) return;
    appInicial = app || null;
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
      if (zoom.t >= 1 && !zoom.fin) { zoom.fin = true; alEntrar(appInicial); }
    } else {
      cam.position.x += (camBase.x + puntero.x * .5 - cam.position.x) * .04;
      cam.position.y += (camBase.y + puntero.y * .25 - cam.position.y) * .04;
    }
    cam.lookAt(mira);
    if (!zoom) moverMarcas();
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
