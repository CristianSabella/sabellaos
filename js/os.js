// SabellaOS: escritorio, ventanas, barra de tareas y menú inicio
import { APPS, ESCRITORIO, ANCLADAS } from './apps.js?v=20261110d';
import { PERFIL, PROYECTOS } from './datos.js?v=20261110d';

const $ = s => document.querySelector(s);
const esCelu = () => document.body.classList.contains('celu');
let zTop = 20, cascada = 0;
const abiertas = new Map(); // id -> {el, app}

export const OS = {
  abrir, cerrar, aviso,
  apagar: null // lo completa main.js (volver a la habitación)
};

// ---------- Escritorio ----------
export function iniciarOS() {
  const cont = $('#iconos');
  ESCRITORIO.forEach(id => {
    const a = APPS[id]; if (!a) return;
    const b = document.createElement('button'); b.className = 'icono'; b.innerHTML = `<i>${a.icono}</i>${a.nombre}`;
    b.addEventListener('click', () => {
      if (esCelu() || matchMedia('(pointer: coarse)').matches) return abrir(id);
      cont.querySelectorAll('.icono').forEach(i => i.classList.toggle('sel', i === b));
    });
    b.addEventListener('dblclick', () => abrir(id));
    b.addEventListener('keydown', e => { if (e.key === 'Enter') abrir(id); });
    cont.appendChild(b);
  });
  $('#fondo').addEventListener('pointerdown', () => { cont.querySelectorAll('.icono').forEach(i => i.classList.remove('sel')); cerrarInicio(); });
  armarBarra(); lluvia(); reloj(); setInterval(reloj, 1000 * 15);
}

// ---------- Ventanas ----------
function abrir(id, opciones = {}) {
  const app = APPS[id]; if (!app) return;
  cerrarInicio();
  if (app.enlace) { window.open(app.enlace, '_blank', 'noopener'); return; }
  if (abiertas.has(id)) { const v = abiertas.get(id); v.el.classList.remove('min'); enfocar(id); if (opciones && app.alReabrir) app.alReabrir(v.ctx, opciones); return; }
  const el = document.createElement('div'); el.className = 'ventana';
  const W = innerWidth, H = innerHeight - 48;
  const w = Math.min(app.ancho || 760, W - 40), h = Math.min(app.alto || 520, H - 40);
  const x = Math.max(10, Math.min(W - w - 10, (W - w) / 2 - 120 + cascada * 30)), y = Math.max(10, Math.min(H - h - 10, (H - h) / 2 - 60 + cascada * 30));
  cascada = (cascada + 1) % 6;
  Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  el.innerHTML = `<div class="v-titulo"><span>${app.icono}</span><span class="t">${app.titulo || app.nombre}</span>
    <button class="b-min" aria-label="Minimizar">—</button><button class="b-max" aria-label="Maximizar">☐</button><button class="x" aria-label="Cerrar">✕</button></div>
    <div class="v-cuerpo"></div><div class="v-borde"></div>`;
  $('#ventanas').appendChild(el);
  const cuerpo = el.querySelector('.v-cuerpo');
  const ctx = { id, el, cuerpo, OS, opciones, titulo: t => el.querySelector('.t').textContent = t };
  abiertas.set(id, { el, app, ctx });
  el.querySelector('.x').onclick = () => cerrar(id);
  el.querySelector('.b-min').onclick = () => { el.classList.add('min'); marcarTareas(); };
  el.querySelector('.b-max').onclick = () => el.classList.toggle('max');
  el.querySelector('.v-titulo').addEventListener('dblclick', e => { if (!e.target.closest('button')) el.classList.toggle('max'); });
  el.addEventListener('pointerdown', () => enfocar(id), true);
  arrastre(el); redimension(el);
  app.render(cuerpo, ctx);
  enfocar(id); armarTareas();
}
function cerrar(id) {
  const v = abiertas.get(id); if (!v) return;
  v.app.alCerrar && v.app.alCerrar(v.ctx);
  v.el.classList.add('cerrando'); setTimeout(() => v.el.remove(), 140);
  abiertas.delete(id); armarTareas();
}
function enfocar(id) {
  abiertas.forEach((v, k) => v.el.classList.toggle('activa', k === id));
  const v = abiertas.get(id); if (v) v.el.style.zIndex = ++zTop;
  marcarTareas();
}
function arrastre(el) {
  const barra = el.querySelector('.v-titulo'); let d = null;
  barra.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || esCelu() || el.classList.contains('max')) return;
    d = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop }; barra.setPointerCapture(e.pointerId);
  });
  barra.addEventListener('pointermove', e => {
    if (!d) return;
    el.style.left = Math.max(-el.offsetWidth + 80, Math.min(innerWidth - 80, e.clientX - d.x)) + 'px';
    el.style.top = Math.max(0, Math.min(innerHeight - 90, e.clientY - d.y)) + 'px';
  });
  barra.addEventListener('pointerup', () => d = null);
}
function redimension(el) {
  const b = el.querySelector('.v-borde'); let d = null;
  b.addEventListener('pointerdown', e => { d = { x: e.clientX, y: e.clientY, w: el.offsetWidth, h: el.offsetHeight }; b.setPointerCapture(e.pointerId); e.stopPropagation(); });
  b.addEventListener('pointermove', e => { if (!d) return; el.style.width = Math.max(300, d.w + e.clientX - d.x) + 'px'; el.style.height = Math.max(180, d.h + e.clientY - d.y) + 'px'; });
  b.addEventListener('pointerup', () => d = null);
}

// ---------- Barra de tareas ----------
function armarBarra() {
  $('#btn-inicio').onclick = e => { e.stopPropagation(); $('#inicio-menu').hidden ? abrirInicio() : cerrarInicio(); };
  $('#btn-musica').onclick = () => abrir('musica');
  $('#btn-wa').onclick = () => abrir('whatsapp');
  const inp = $('#buscar-input');
  inp.addEventListener('focus', () => abrirInicio(inp.value));
  inp.addEventListener('input', () => abrirInicio(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const p = $('#inicio-menu .item'); if (p) p.click(); inp.value = ''; inp.blur(); }
    if (e.key === 'Escape') { cerrarInicio(); inp.blur(); }
  });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#inicio-menu, #btn-inicio, #buscar')) cerrarInicio(); });
  armarTareas();
}
function armarTareas() {
  const t = $('#tareas'); t.innerHTML = '';
  const ids = [...new Set([...ANCLADAS, ...abiertas.keys()])];
  ids.forEach(id => {
    const a = APPS[id]; if (!a) return;
    const b = document.createElement('button'); b.className = 'tarea'; b.dataset.id = id; b.title = a.nombre; b.textContent = a.icono;
    b.onclick = () => {
      const v = abiertas.get(id);
      if (!v) return abrir(id);
      if (v.el.classList.contains('min')) { v.el.classList.remove('min'); enfocar(id); }
      else if (v.el.classList.contains('activa')) { v.el.classList.add('min'); v.el.classList.remove('activa'); marcarTareas(); }
      else enfocar(id);
    };
    t.appendChild(b);
  });
  marcarTareas();
}
function marcarTareas() {
  document.querySelectorAll('.tarea').forEach(b => {
    const v = abiertas.get(b.dataset.id);
    b.classList.toggle('abierta', !!v);
    b.classList.toggle('activa', !!v && v.el.classList.contains('activa') && !v.el.classList.contains('min'));
  });
}

// ---------- Menú inicio (estilo Windows 10: barra lateral, lista A-Z y mosaicos) ----------
const RECIENTES = ['friday', 'jarvis', 'juego-buscaminas'];
const COLORES = { proyectos: '#1d5fa8', sobremi: '#5b3fc4', cv: '#2a4a8a', juegos: '#7a2fb0', musica: '#b0287f', terminal: '#1b2433', contacto: '#3a3f9e', jarvis: '#1e6fd9', friday: '#8b1d3f', whatsapp: '#1a9e52', 'juego-2048': '#c2410c', 'juego-sudoku': '#0f766e', 'juego-buscaminas': '#4b5563' };
const GRUPOS = [
  ['Trabajo', [['proyectos', 'g'], ['cv', 'm'], ['sobremi', 'm'], ['contacto', 'm'], ['whatsapp', 'm'], ['terminal', 'a']]],
  ['Asistentes', [['jarvis', 'a'], ['friday', 'a']]],
  ['Entretenimiento', [['musica', 'a'], ['juegos', 'm'], ['juego-2048', 'm'], ['juego-sudoku', 'm'], ['juego-buscaminas', 'm']]]
];
let vivoTimer = null;
const icChico = id => `<span class="ic-ini" style="background:${COLORES[id] || '#1d5fa8'}">${APPS[id].icono}</span>`;
function abrirInicio(filtro = '') {
  const m = $('#inicio-menu'); m.hidden = false; $('#btn-inicio').classList.add('on');
  const f = filtro.trim().toLowerCase();
  const item = id => `<button class="item" data-a="${id}">${icChico(id)}<span>${APPS[id].nombre}</span></button>`;
  let lista;
  if (f) {
    const ids = Object.keys(APPS).filter(id => (APPS[id].nombre + ' ' + (APPS[id].buscar || '')).toLowerCase().includes(f));
    lista = `<h4>Mejor coincidencia</h4>${ids.map(item).join('') || '<p class="muted" style="padding:10px">No encontré nada con ese nombre.</p>'}`;
  } else {
    const orden = Object.keys(APPS).sort((x, y) => APPS[x].nombre.localeCompare(APPS[y].nombre, 'es'));
    let letra = '', az = '';
    orden.forEach(id => { const l = APPS[id].nombre[0].toUpperCase().normalize('NFD')[0]; const L = /[A-Z]/.test(l) ? l : '#'; if (L !== letra) { letra = L; az += `<div class="letra">${L}</div>`; } az += item(id); });
    lista = `<h4>Agregadas recientemente</h4>${RECIENTES.map(item).join('')}${az}`;
  }
  const mosaico = ([id, t]) => {
    const a = APPS[id];
    if (id === 'proyectos') return `<button class="mos g vivo" data-a="${id}" style="--c:${COLORES[id]}"><div class="vivo-img"></div><span class="mos-ic">${a.icono}</span><b>${a.nombre}</b></button>`;
    if (id === 'musica') return `<button class="mos ${t}" data-a="${id}" style="--c:${COLORES[id]}"><span class="mos-ic">${a.icono}</span><small>Sonando ahora<br><em>NEFFEX</em></small><b>${a.nombre}</b></button>`;
    if (id === 'jarvis' || id === 'friday') return `<button class="mos ${t}" data-a="${id}" style="--c:${COLORES[id]}"><span class="mos-ic">${a.icono}</span><small>● En línea<br><em>Escribime 👋</em></small><b>${a.nombre}</b></button>`;
    return `<button class="mos ${t}" data-a="${id}" style="--c:${COLORES[id]}"><span class="mos-ic">${a.icono}</span><b>${a.nombre}</b></button>`;
  };
  m.classList.toggle('buscando', !!f);
  m.innerHTML = `<div class="lado">
      <button class="hamb" title="Expandir"><span>☰</span><em>INICIO</em></button>
      <div class="lado-abajo">
        <button data-a="sobremi" title="${PERFIL.nombre}"><img src="${PERFIL.foto}" alt=""><em>${PERFIL.nombre}</em></button>
        <button data-a="cv" title="Documentos"><span>🗎</span><em>Documentos</em></button>
        <button data-a="proyectos" title="Imágenes"><span>🖼</span><em>Imágenes</em></button>
        <button data-a="terminal" title="Configuración"><span>⚙</span><em>Configuración</em></button>
        <button data-a="apagar" title="Apagar (volver a la habitación)"><span>⏻</span><em>Inicio/Apagado</em></button>
      </div></div>
    <div class="lista">${lista}</div>
    <div class="mosaicos">${GRUPOS.map(([g, its]) => `<div class="grupo"><h5>${g}</h5><div class="rejilla">${its.map(mosaico).join('')}</div></div>`).join('')}</div>`;
  m.querySelector('.hamb').onclick = () => m.querySelector('.lado').classList.toggle('abierto');
  m.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const a = b.dataset.a; cerrarInicio();
    if (a === 'apagar') return OS.apagar && OS.apagar();
    abrir(a);
  });
  // mosaico "en vivo": va pasando las fotos de los proyectos
  const fotos = PROYECTOS.filter(p => p.img).map(p => [p.img, p.nombre]);
  const caja = m.querySelector('.vivo-img'); let n = 0;
  const pasar = () => { if (!caja || !fotos.length) return; const [src, nom] = fotos[n++ % fotos.length]; const d = document.createElement('div'); d.className = 'foto'; d.style.backgroundImage = `url("${src}")`; d.innerHTML = `<i>${nom}</i>`; caja.appendChild(d); while (caja.children.length > 2) caja.firstChild.remove(); };
  clearInterval(vivoTimer); pasar(); vivoTimer = setInterval(pasar, 3200);
}
function cerrarInicio() { clearInterval(vivoTimer); $('#inicio-menu').hidden = true; $('#btn-inicio').classList.remove('on'); }

// ---------- Avisos ----------
function aviso(titulo, texto, alTocar) {
  const d = document.createElement('div'); d.className = 'aviso'; d.innerHTML = `<b>${titulo}</b><span>${texto}</span>`;
  $('#avisos').appendChild(d);
  const fuera = () => { d.classList.add('fuera'); setTimeout(() => d.remove(), 300); };
  d.onclick = () => { fuera(); alTocar && alTocar(); };
  setTimeout(fuera, 7000);
}

// ---------- Fondo y reloj ----------
function reloj() {
  const d = new Date();
  $('#reloj b').textContent = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  $('#reloj small').textContent = d.toLocaleDateString('es-AR');
}
function lluvia() {
  const cv = $('#lluvia'), x = cv.getContext('2d'); let gotas = [], col = 0;
  function medir() { cv.width = innerWidth; cv.height = innerHeight; col = Math.floor(cv.width / 18); gotas = Array.from({ length: col }, () => Math.random() * cv.height); }
  medir(); addEventListener('resize', medir);
  setInterval(() => {
    if (document.getElementById('os').hidden) return;
    x.fillStyle = 'rgba(5,11,20,.18)'; x.fillRect(0, 0, cv.width, cv.height); x.font = '15px monospace';
    for (let i = 0; i < col; i++) { x.fillStyle = i % 3 ? '#1f6f99' : '#a1007e'; x.fillText(Math.random() < .5 ? '0' : '1', i * 18, gotas[i]); gotas[i] += 18; if (gotas[i] > cv.height && Math.random() > .975) gotas[i] = 0; }
  }, 70);
}
