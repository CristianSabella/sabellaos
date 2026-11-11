// Arranque de SabellaOS
import { iniciarOS, OS } from './os.js';
import { Musica } from './apps.js';

const $ = s => document.querySelector(s);
const celu = () => innerWidth < 760 || (matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 820);
const marcarCelu = () => document.body.classList.toggle('celu', celu());
marcarCelu(); addEventListener('resize', marcarCelu);

iniciarOS();
let escena = null, dentro = false;

function cortina(fn) { $('#cortina').classList.add('on'); setTimeout(() => { fn(); setTimeout(() => $('#cortina').classList.remove('on'), 80); }, 460); }

function entrarAlOS() {
  if (dentro) return; dentro = true;
  Musica.reproducir(); // el clic para entrar habilita el audio
  cortina(() => {
    $('#entrada').hidden = true; $('#os').hidden = false; escena && escena.pausar();
    setTimeout(() => OS.aviso('🤖 Jarvis', '¡Hola! Bienvenido a SabellaOS. Abrí <b style="display:inline;color:#4fc3ff">Proyectos</b> o probá la <b style="display:inline;color:#4fc3ff">Terminal</b>.', () => OS.abrir('proyectos')), 1400);
    setTimeout(() => { if (!celu()) OS.abrir('proyectos'); }, 600);
  });
}
OS.apagar = () => {
  dentro = false; Musica.pausar();
  cortina(() => { $('#os').hidden = true; $('#entrada').hidden = false; escena ? escena.volver() : null; });
};

$('#saltar').onclick = entrarAlOS;
$('#entrar').onclick = () => escena ? escena.entrar() : entrarAlOS();

// La escena 3D se carga aparte: si la compu o el celular no la soportan, se entra directo
import('./escena.js').then(({ iniciarEscena }) => {
  escena = iniciarEscena({
    canvas: $('#escena'), celu: celu(),
    alEntrar: entrarAlOS,
    alListo: () => $('#cargando').classList.add('fuera')
  });
}).catch(err => {
  console.warn('Sin 3D:', err);
  $('#cargando span').textContent = 'Tu navegador no muestra 3D. Entrando a SabellaOS…';
  setTimeout(() => { $('#cargando').classList.add('fuera'); entrarAlOS(); }, 1200);
});
