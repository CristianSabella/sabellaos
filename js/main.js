// Arranque de SabellaOS
import { iniciarOS, OS } from './os.js?v=20261110b';
import { Musica, APPS } from './apps.js?v=20261110b';

const $ = s => document.querySelector(s);
const celu = () => innerWidth < 760 || (matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 820);
const marcarCelu = () => document.body.classList.toggle('celu', celu());
marcarCelu(); addEventListener('resize', marcarCelu);

iniciarOS();
let escena = null, dentro = false;

function cortina(fn) { $('#cortina').classList.add('on'); setTimeout(() => { fn(); setTimeout(() => $('#cortina').classList.remove('on'), 80); }, 460); }

function entrarAlOS(appInicial) {
  if (dentro) return; dentro = true;
  Musica.reproducir(); // el clic para entrar habilita el audio
  cortina(() => {
    $('#entrada').hidden = true; $('#os').hidden = false; escena && escena.pausar();
    setTimeout(() => OS.aviso('🤖 Jarvis', '¡Hola! Bienvenido a SabellaOS. Tocá acá para hablar conmigo, o escribile a Cristian con el botón verde de WhatsApp de abajo.', () => OS.abrir('jarvis')), 1400);
    setTimeout(() => { if (appInicial) OS.abrir(appInicial); else if (!celu() && !document.querySelector('.ventana')) OS.abrir('proyectos'); }, 600);
  });
}
OS.apagar = () => {
  dentro = false; Musica.pausar();
  cortina(() => { $('#os').hidden = true; $('#entrada').hidden = false; escena ? escena.volver() : null; });
};

$('#saltar').onclick = () => entrarAlOS();
$('#entrar').onclick = () => escena ? escena.entrar() : entrarAlOS();

// La escena 3D se carga aparte: si la compu o el celular no la soportan, se entra directo
import('./escena.js?v=20261110b').then(({ iniciarEscena }) => {
  escena = iniciarEscena({
    canvas: $('#escena'), celu: celu(),
    alEntrar: entrarAlOS, whatsapp: APPS.whatsapp.enlace,
    alListo: () => $('#cargando').classList.add('fuera')
  });
}).catch(err => {
  console.warn('Sin 3D:', err);
  $('#cargando span').textContent = 'Tu navegador no muestra 3D. Entrando a SabellaOS…';
  setTimeout(() => { $('#cargando').classList.add('fuera'); entrarAlOS(); }, 1200);
});
