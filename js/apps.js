// Las aplicaciones de SabellaOS
import { PROYECTOS, PERFIL, CANCIONES, SITIO_VIEJO } from './datos.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Reproductor de música (sigue sonando aunque cierres la ventana) ----------
export const Musica = (() => {
  const audio = new Audio(); audio.preload = 'auto'; audio.volume = .4;
  let tema = 0, ctx = null, an = null, datos = null;
  function cargar(i) { tema = (i + CANCIONES.length) % CANCIONES.length; audio.src = CANCIONES[tema].src; avisar(); }
  function conectar() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaElementSource(audio); an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .8;
      src.connect(an); an.connect(ctx.destination); datos = new Uint8Array(an.frequencyBinCount);
    } catch (e) { an = null; }
  }
  const oyentes = new Set(); const avisar = () => oyentes.forEach(f => f());
  audio.addEventListener('ended', () => { cargar(tema + 1); audio.play().catch(() => {}); });
  ['play', 'pause', 'timeupdate'].forEach(ev => audio.addEventListener(ev, avisar));
  cargar(0);
  return {
    audio, oyentes,
    get tema() { return tema; },
    reproducir() { conectar(); return audio.play().catch(() => {}); },
    pausar() { audio.pause(); },
    alternar() { audio.paused ? this.reproducir() : audio.pause(); },
    ir(i) { cargar(i); this.reproducir(); },
    espectro() { if (!an || audio.paused) return null; an.getByteFrequencyData(datos); return datos; }
  };
})();

// ---------- Explorador de proyectos ----------
const CATS = [['destacados', '⭐ Destacados'], ['todos', '📂 Todos'], ['web', '🌐 Web / Apps'], ['db', '🗄️ Bases de datos'], ['desk', '🖥️ Escritorio'], ['game', '🎮 Juegos']];
function appProyectos(cuerpo, ctx) {
  let cat = ctx.opciones?.cat || 'destacados';
  cuerpo.innerHTML = `<div class="expl"><div class="expl-lado">${CATS.map(([k, t]) => `<button data-k="${k}">${t}</button>`).join('')}</div><div class="expl-main"></div></div>`;
  const main = cuerpo.querySelector('.expl-main');
  const lista = () => PROYECTOS.filter(p => cat === 'todos' || (cat === 'destacados' ? p.destacado : p.cats.includes(cat)));
  function grilla() {
    cuerpo.querySelectorAll('.expl-lado button').forEach(b => b.classList.toggle('on', b.dataset.k === cat));
    const nom = CATS.find(c => c[0] === cat)[1].split(' ').slice(1).join(' ');
    main.innerHTML = `<div class="ruta">Este equipo › Proyectos › ${nom}</div><div class="grilla">${lista().map((p, i) => `
      <button class="tarjeta" data-i="${PROYECTOS.indexOf(p)}"><div class="img">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : p.video ? `<video src="${p.video}#t=2.5" muted preload="metadata"></video>` : (p.cats.includes('game') ? '🎮' : p.cats.includes('desk') ? '🖥️' : '🌐')}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</div>
      <b>${esc(p.nombre)}</b><small>${esc(p.sub || p.tech.slice(0, 3).join(' · '))}</small></button>`).join('')}</div>`;
    main.querySelectorAll('.tarjeta').forEach(b => b.onclick = () => detalle(PROYECTOS[b.dataset.i]));
    ctx.titulo('Proyectos'); main.scrollTop = 0;
  }
  function detalle(p) {
    const jugable = p.jugar && APPS['juego-' + p.jugar];
    main.innerHTML = `<div class="ruta"><button class="btn" data-volver>← Volver</button></div><div class="detalle">
      ${p.video ? `<video class="media" src="${p.video}" controls autoplay muted playsinline></video>` : p.img ? `<img class="media" src="${p.img}" alt="">` : ''}
      <h2>${esc(p.nombre)}</h2><p class="muted">${esc(p.sub)}</p><p style="margin-top:10px;line-height:1.55">${esc(p.desc)}</p>
      ${p.items.length ? `<ul>${p.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      <div class="chips">${p.tech.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <div class="acc">${jugable ? `<button class="btn main" data-jugar>🎮 Jugar</button>` : ''}${p.links.map(l => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${esc(l.txt)}</a>`).join('')}</div></div>`;
    main.querySelector('[data-volver]').onclick = grilla;
    const j = main.querySelector('[data-jugar]'); if (j) j.onclick = () => ctx.OS.abrir('juego-' + p.jugar);
    ctx.titulo('Proyectos › ' + p.nombre); main.scrollTop = 0;
  }
  cuerpo.querySelectorAll('.expl-lado button').forEach(b => b.onclick = () => { cat = b.dataset.k; grilla(); });
  grilla();
}

// ---------- Sobre mí ----------
function appSobreMi(cuerpo) {
  cuerpo.innerHTML = `<div class="pad"><div class="sobre"><img src="${PERFIL.foto}" alt="${PERFIL.nombre}"><div>
    <h2>${PERFIL.nombre}</h2><p>${PERFIL.rol} · ${PERFIL.ciudad}</p><p style="line-height:1.6">${PERFIL.texto}</p>
    <p style="margin-top:12px"><span class="chip" style="border-color:#3ddc84;color:#3ddc84">● Disponible para trabajar · Rosario / Remoto</span></p></div></div>
    <div class="datos4">${PERFIL.datos.map(([n, t]) => `<div><b>${n}</b><small>${t}</small></div>`).join('')}</div>
    <h3 class="sec-t">FORMACIÓN</h3><div class="linea-t">${PERFIL.formacion.map(f => `<div><small>${f.cuando}</small><b>${f.titulo}</b><span>${f.lugar}</span></div>`).join('')}</div>
    <h3 class="sec-t">STACK TÉCNICO</h3>${Object.entries(PERFIL.stack).map(([k, v]) => `<p class="muted" style="margin:10px 0 6px;font-size:13px">${k}</p><div class="chips">${v.map(x => `<span class="chip">${x}</span>`).join('')}</div>`).join('')}
  </div>`;
}

// ---------- Contacto y CV ----------
function appContacto(cuerpo) {
  cuerpo.innerHTML = `<div class="pad"><h2 style="font-size:22px">¿Hablamos?</h2><p class="muted" style="margin-top:6px">Escribime por donde te quede más cómodo.</p>
    <div class="contacto-lista">
      ${PERFIL.emails.map(m => `<a href="mailto:${m}"><i>✉️</i><div>${m}<small>Email</small></div></a>`).join('')}
      <a href="${PERFIL.whatsapp}" target="_blank" rel="noopener"><i>💬</i><div>WhatsApp<small>Respondo rápido</small></div></a>
      <a href="${PERFIL.linkedin}" target="_blank" rel="noopener"><i>💼</i><div>LinkedIn<small>Cristian Sabella</small></div></a>
      <a href="${PERFIL.github}" target="_blank" rel="noopener"><i>🐙</i><div>GitHub<small>CristianSabella</small></div></a>
    </div></div>`;
}
function appCV(cuerpo) {
  cuerpo.innerHTML = `<div style="display:flex;flex-direction:column;height:100%"><div style="padding:8px 12px;display:flex;gap:8px;border-bottom:1px solid rgba(79,195,255,.15)"><a class="btn main" href="${PERFIL.cv}" target="_blank" rel="noopener">⬇️ Descargar CV</a></div>
    <iframe class="app-frame" src="${PERFIL.cvVista}" title="CV de Cristian Sabella" loading="lazy" style="flex:1"></iframe></div>`;
}

// ---------- Juegos ----------
const JUEGOS = [
  ['2048', '🔢', '2048', 'juegos/2048.html'], ['sudoku', '🧩', 'Sudoku', 'juegos/sudoku.html'], ['buscaminas', '💣', 'Buscaminas', 'juegos/buscaminas.html'],
  ['stack', '🧱', 'Stack', null], ['snake', '🐍', 'Snake', null], ['cascada', '🟪', 'Cascada', null], ['arena', '🔫', 'Arena Helada', null]
];
function appJuegos(cuerpo, ctx) {
  cuerpo.innerHTML = `<div class="pad"><div class="ruta">Este equipo › Juegos</div><div class="grilla">${JUEGOS.map(([id, ic, nom, url]) => {
    const p = PROYECTOS.find(x => x.jugar === id);
    return `<button class="tarjeta" data-id="${id}"><div class="img">${p && p.img ? `<img src="${p.img}" alt="" loading="lazy">` : ic}${url ? '' : '<span class="badge" style="background:#8b5cf6;color:#fff">Muy pronto</span>'}</div><b>${ic} ${nom}</b><small>${url ? 'Hacé clic para jugar' : 'Llega en la próxima etapa'}</small></button>`;
  }).join('')}</div></div>`;
  cuerpo.querySelectorAll('.tarjeta').forEach(b => b.onclick = () => {
    if (APPS['juego-' + b.dataset.id]) ctx.OS.abrir('juego-' + b.dataset.id);
    else ctx.OS.aviso('🎮 Muy pronto', 'Este juego se suma a SabellaOS en la próxima etapa.');
  });
}
function juegoIframe(url) {
  return (cuerpo) => { cuerpo.innerHTML = `<iframe class="app-frame" src="${SITIO_VIEJO}${url}" title="Juego" allow="autoplay"></iframe>`; cuerpo.style.overflow = 'hidden'; };
}

// ---------- Música ----------
function appMusica(cuerpo, ctx) {
  cuerpo.innerHTML = `<div class="musica"><canvas></canvas>
    <div class="m-ctrl"><button data-a="ant" aria-label="Anterior">⏮</button><button class="pp" data-a="pp" aria-label="Reproducir">▶</button><button data-a="sig" aria-label="Siguiente">⏭</button>
      <div class="m-tema"><b></b><small></small></div><span>🔊</span><input class="m-vol" type="range" min="0" max="100" aria-label="Volumen"></div>
    <div class="m-barra"><span class="m-t">0:00</span><input class="m-pos" type="range" min="0" max="1000" value="0" aria-label="Posición"><span class="m-d">0:00</span></div>
    <div class="m-lista">${CANCIONES.map((c, i) => `<button data-i="${i}">🎵 ${c.artista} — ${c.titulo}</button>`).join('')}</div></div>`;
  const q = s => cuerpo.querySelector(s), A = Musica.audio, cv = q('canvas'), x = cv.getContext('2d');
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  q('[data-a=pp]').onclick = () => Musica.alternar(); q('[data-a=ant]').onclick = () => Musica.ir(Musica.tema - 1); q('[data-a=sig]').onclick = () => Musica.ir(Musica.tema + 1);
  q('.m-vol').value = A.volume * 100; q('.m-vol').oninput = e => A.volume = e.target.value / 100;
  q('.m-pos').oninput = e => { if (A.duration) A.currentTime = e.target.value / 1000 * A.duration; };
  cuerpo.querySelectorAll('.m-lista button').forEach(b => b.onclick = () => Musica.ir(+b.dataset.i));
  const pintar = () => {
    const c = CANCIONES[Musica.tema]; q('.m-tema b').textContent = c.titulo; q('.m-tema small').textContent = c.artista;
    q('[data-a=pp]').textContent = A.paused ? '▶' : '❚❚'; q('.m-t').textContent = fmt(A.currentTime); q('.m-d').textContent = fmt(A.duration);
    if (A.duration) q('.m-pos').value = A.currentTime / A.duration * 1000;
    cuerpo.querySelectorAll('.m-lista button').forEach(b => b.classList.toggle('on', +b.dataset.i === Musica.tema));
  };
  Musica.oyentes.add(pintar); pintar(); ctx.pintar = pintar;
  let vivo = true; const alto = new Float32Array(48);
  (function dibujar() {
    if (!vivo) return;
    const w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    x.clearRect(0, 0, w, h); const d = Musica.espectro(), n = 48, bw = w / n;
    for (let i = 0; i < n; i++) {
      const v = d ? d[Math.floor(i * 1.6) + 1] / 255 : 0; alto[i] += (v - alto[i]) * .35;
      const hh = 4 + alto[i] * (h - 14), g = x.createLinearGradient(0, h - hh, 0, h); g.addColorStop(0, '#ff5fd2'); g.addColorStop(.5, '#8b5cf6'); g.addColorStop(1, '#4fc3ff');
      x.fillStyle = g; x.fillRect(i * bw + 2, h - hh, bw - 4, hh);
    }
    requestAnimationFrame(dibujar);
  })();
  ctx.parar = () => { vivo = false; Musica.oyentes.delete(pintar); };
}

// ---------- Terminal ----------
function appTerminal(cuerpo, ctx) {
  cuerpo.innerHTML = `<div class="term"><pre class="sal"></pre><div class="fila"><span class="v">coti@sabellaos</span>:<span class="a">~</span>$&nbsp;<input spellcheck="false" autocomplete="off" aria-label="Comando"></div></div>`;
  const sal = cuerpo.querySelector('.sal'), inp = cuerpo.querySelector('input'), term = cuerpo.querySelector('.term');
  const historial = []; let hi = 0;
  const out = h => { sal.innerHTML += h + '\n'; term.scrollTop = term.scrollHeight; };
  const abrirApp = id => { ctx.OS.abrir(id); return `<span class="g">Abriendo ${APPS[id].nombre}…</span>`; };
  const CMD = {
    ayuda: () => `Comandos disponibles:
  <span class="a">sobremi</span>     quién soy        <span class="a">proyectos</span>   mis proyectos
  <span class="a">stack</span>       tecnologías      <span class="a">cv</span>          mi currículum
  <span class="a">juegos</span>      lista de juegos  <span class="a">jugar</span> X     abre un juego (ej: jugar 2048)
  <span class="a">musica</span>      reproductor      <span class="a">contacto</span>    cómo encontrarme
  <span class="a">neofetch</span>    info del sistema <span class="a">limpiar</span>     borra la pantalla
  <span class="a">fecha</span>       fecha y hora     <span class="a">apagar</span>      volver a la habitación`,
    sobremi: () => `${PERFIL.nombre} · ${PERFIL.rol} · ${PERFIL.ciudad}\n${PERFIL.texto}`,
    stack: () => Object.entries(PERFIL.stack).map(([k, v]) => `<span class="r">${k}:</span> ${v.join(' · ')}`).join('\n'),
    proyectos: () => PROYECTOS.map(p => `  <span class="a">•</span> ${esc(p.nombre)} <span class="g">${esc(p.sub)}</span>`).join('\n') + '\n' + abrirApp('proyectos'),
    cv: () => abrirApp('cv'), contacto: () => PERFIL.emails.map(e => '  ✉️ ' + e).join('\n') + '\n' + abrirApp('contacto'),
    musica: () => abrirApp('musica'), juegos: () => JUEGOS.map(j => `  ${j[1]} ${j[2]}${j[3] ? '' : ' <span class="g">(muy pronto)</span>'}`).join('\n'),
    jugar: a => { const j = JUEGOS.find(x => x[0] === (a || '').toLowerCase() || x[2].toLowerCase() === (a || '').toLowerCase()); if (!j) return 'Decime cuál: jugar 2048, jugar sudoku o jugar buscaminas'; if (!j[3]) return `${j[2]} llega en la próxima etapa 🎮`; return abrirApp('juego-' + j[0]); },
    fecha: () => new Date().toLocaleString('es-AR'), limpiar: () => { sal.innerHTML = ''; return null; }, clear: () => CMD.limpiar(),
    apagar: () => { setTimeout(() => ctx.OS.apagar && ctx.OS.apagar(), 600); return 'Apagando SabellaOS… 👋'; },
    whoami: () => 'coti', hola: () => '¡Hola! 👋 Escribí <span class="a">ayuda</span> para ver qué podés hacer.',
    neofetch: () => `<span class="r">   ▄▄▄▄▄▄▄   </span>  <span class="v">coti</span>@<span class="v">sabellaos</span>
<span class="r">  █ <span class="a">C S</span> █  </span>  ─────────────────
<span class="r">  █▄▄▄▄▄▄▄█  </span>  <span class="a">SO:</span> SabellaOS 1.0
<span class="a">   ▀▀▀▀▀▀▀   </span>  <span class="a">Dev:</span> ${PERFIL.nombre}
               <span class="a">Ciudad:</span> ${PERFIL.ciudad}
               <span class="a">Shell:</span> coti-sh
               <span class="a">Música:</span> NEFFEX`
  };
  out(`SabellaOS [Versión 1.0] — Escribí <span class="a">ayuda</span> para empezar.\n`);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { if (hi > 0) inp.value = historial[--hi]; e.preventDefault(); return; }
    if (e.key === 'ArrowDown') { inp.value = historial[++hi] || ''; hi = Math.min(hi, historial.length); return; }
    if (e.key !== 'Enter') return;
    const linea = inp.value.trim(); inp.value = ''; if (linea) { historial.push(linea); hi = historial.length; }
    out(`<span class="v">coti@sabellaos</span>:<span class="a">~</span>$ ${esc(linea)}`);
    if (!linea) return;
    const [c, ...args] = linea.split(/\s+/); const f = CMD[c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')];
    const r = f ? f(args.join(' ')) : `No conozco "${esc(c)}". Probá con <span class="a">ayuda</span>.`;
    if (r) out(r);
  });
  term.addEventListener('click', () => inp.focus());
  setTimeout(() => inp.focus(), 50);
}

// ---------- Registro ----------
export const APPS = {
  proyectos: { nombre: 'Proyectos', icono: '📁', ancho: 980, alto: 640, render: appProyectos, buscar: 'portfolio trabajos' },
  sobremi: { nombre: 'Sobre mí', icono: '👤', ancho: 760, alto: 620, render: appSobreMi, buscar: 'perfil formacion stack' },
  cv: { nombre: 'Mi CV', icono: '📄', ancho: 820, alto: 680, render: appCV, buscar: 'curriculum' },
  juegos: { nombre: 'Juegos', icono: '🎮', ancho: 900, alto: 620, render: appJuegos },
  musica: { nombre: 'Música', icono: '🎵', ancho: 460, alto: 470, render: appMusica, alCerrar: c => c.parar && c.parar(), buscar: 'neffex reproductor' },
  terminal: { nombre: 'Terminal', icono: '💻', ancho: 700, alto: 430, render: appTerminal, buscar: 'consola cmd' },
  contacto: { nombre: 'Contacto', icono: '✉️', ancho: 520, alto: 520, render: appContacto, buscar: 'email whatsapp linkedin' },
  'juego-2048': { nombre: '2048', icono: '🔢', ancho: 470, alto: 760, render: juegoIframe('juegos/2048.html'), buscar: 'juego' },
  'juego-sudoku': { nombre: 'Sudoku', icono: '🧩', ancho: 500, alto: 820, render: juegoIframe('juegos/sudoku.html'), buscar: 'juego' },
  'juego-buscaminas': { nombre: 'Buscaminas', icono: '💣', ancho: 520, alto: 820, render: juegoIframe('juegos/buscaminas.html'), buscar: 'juego minas' }
};
export const ESCRITORIO = ['proyectos', 'sobremi', 'cv', 'juegos', 'musica', 'terminal', 'contacto'];
export const ANCLADAS = ['proyectos', 'terminal', 'musica', 'juegos'];
