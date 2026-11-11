// SabellaOS: escritorio, ventanas, barra de tareas y menú inicio
import { APPS, ESCRITORIO, ANCLADAS } from './apps.js';
import { PERFIL } from './datos.js';

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

// ---------- Menú inicio ----------
function abrirInicio(filtro = '') {
  const m = $('#inicio-menu'); m.hidden = false; $('#btn-inicio').classList.add('on');
  const f = filtro.trim().toLowerCase();
  const ids = Object.keys(APPS).filter(id => !f || (APPS[id].nombre + ' ' + (APPS[id].buscar || '')).toLowerCase().includes(f));
  m.innerHTML = `<div class="lado"><button title="Mi perfil" data-a="sobremi">👤</button><button title="Contacto" data-a="contacto">✉️</button><button title="Apagar (volver a la habitación)" data-a="apagar">⏻</button></div>
    <div class="lista">${f ? '' : `<div class="yo"><img src="${PERFIL.foto}" alt=""><div><b>${PERFIL.nombre}</b><small>${PERFIL.rol}</small></div></div>`}
    <h4>${f ? 'RESULTADOS' : 'APLICACIONES'}</h4>
    ${ids.map(id => `<button class="item" data-a="${id}"><span class="ic-app">${APPS[id].icono}</span>${APPS[id].nombre}</button>`).join('') || '<p class="muted" style="padding:10px">No encontré nada con ese nombre.</p>'}</div>`;
  m.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const a = b.dataset.a; cerrarInicio();
    if (a === 'apagar') return OS.apagar && OS.apagar();
    abrir(a);
  });
}
function cerrarInicio() { $('#inicio-menu').hidden = true; $('#btn-inicio').classList.remove('on'); }

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
