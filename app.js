// --- Datos de refranes: primera parte, correcta, distractores y significado breve ---
const REFRANES = [
  { a: "A quien madruga,", b: "Dios lo ayuda.", d:["mejor desayuna.","todo le dura."], m:"La iniciativa y el esfuerzo temprano tienen recompensa." },
  { a: "Al mal tiempo,", b: "buena cara.", d:["poca vara.","nada para."], m:"Ante la adversidad, mantener actitud positiva." },
  { a: "No hay mal", b: "que por bien no venga.", d:["que dure cien años.","que aguante todo."], m:"De lo negativo puede surgir algo bueno." },
  { a: "Más vale tarde", b: "que nunca.", d:["que siempre.","que pronto."], m:"Mejor hacerlo tarde que no hacerlo." },
  { a: "En casa de herrero,", b: "cuchillo de palo.", d:["todo es de hierro.","no hay recelo."], m:"A veces falta lo esencial donde debería sobrar." },
  { a: "El que mucho abarca,", b: "poco aprieta.", d:["todo completa.","menos respeta."], m:"Hacer demasiadas cosas a la vez reduce la eficacia." },
  { a: "Perro ladrador,", b: "poco mordedor.", d:["gran corredor.","mal jugador."], m:"Quien amenaza mucho suele actuar poco." },
  { a: "Ojos que no ven,", b: "corazón que no siente.", d:["mente que no miente.","todo se resiente."], m:"Lo que se desconoce, no duele." },
  { a: "A caballo regalado", b: "no se le mira el diente.", d:["no se le presta.","siempre va al frente."], m:"No critiques lo que te han obsequiado." },
  { a: "Más vale prevenir", b: "que curar.", d:["que lamentar.","que dudar."], m:"Conviene evitar el problema antes que resolverlo." },
  { a: "Quien mucho corre,", b: "pronto para.", d:["nunca llega.","todo ignora."], m:"Ir con prisa puede llevar al cansancio/apuro." },
  { a: "Despacio que", b: "voy de prisa.", d:["ya no avanza.","nadie me pisa."], m:"Con calma se avanza mejor que con apuro." },
  { a: "Barriga llena,", b: "corazón contento.", d:["mente suelta.","todo atento."], m:"Satisfechas las necesidades básicas, se está mejor." },
  { a: "De tal palo,", b: "tal astilla.", d:["tal camisa.","tal semilla."], m:"Los hijos suelen parecerse a sus padres." },
  { a: "El hábito no hace", b: "al monje.", d:["al conde.","al duende."], m:"Las apariencias engañan." },
  { a: "No por mucho madrugar", b: "amanece más temprano.", d:["te va a gustar.","se come temprano."], m:"Hay procesos que no se aceleran con prisa." }
];

// Estado
let rondaActual = 0, totalRondas = 8, aciertos = 0, bar = null;
const juegoEl = document.getElementById('juego');
const progresoEl = document.getElementById('progreso');
const aciertosEl = document.getElementById('aciertos');
const btnComenzar = document.getElementById('btnComenzar');
const btnReiniciar = document.getElementById('btnReiniciar');
const selRondas = document.getElementById('rondas');
const selTam = document.getElementById('tamano');

let rondaSet = []; // subconjunto aleatorio de refranes

function barajar(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function prepararRondas(){
  totalRondas = +selRondas.value;
  const copia = [...REFRANES];
  barajar(copia);
  rondaSet = copia.slice(0, totalRondas);
  rondaActual = 0; aciertos = 0;
  actualizarEstado();
}

function actualizarEstado(){
  progresoEl.textContent = `${Math.min(rondaActual, totalRondas)}/${totalRondas}`;
  aciertosEl.textContent = aciertos;
  if(bar){
    const pct = Math.round((Math.min(rondaActual, totalRondas)/totalRondas)*100);
    bar.style.width = pct + "%";
  }
}

function renderPregunta(){
  const item = rondaSet[rondaActual];
  if(!item){ return renderFin(); }

  // Combinar opciones y barajar
  const opciones = barajar([ {txt:item.b, ok:true}, ...item.d.map(x=>({txt:x, ok:false})) ]).slice(0,3);

  // Estructura
  juegoEl.innerHTML = `
    <div class="tarjeta" role="group" aria-labelledby="enunciado">
      <div class="progresoBar" aria-hidden="true"><div></div></div>
      <p id="enunciado" class="pregunta">🧠 ${item.a} <em>…¿cómo sigue?</em></p>
      <div class="opciones" id="opciones"></div>
      <p id="feedback" class="feedback" aria-live="polite"></p>
      <div class="acciones">
        <button id="btnSiguiente" class="btn principal" disabled>Siguiente</button>
      </div>
    </div>
  `;
  bar = juegoEl.querySelector('.progresoBar > div');
  actualizarEstado();

  const cont = document.getElementById('opciones');
  opciones.forEach((op, idx)=>{
    const b = document.createElement('button');
    b.setAttribute('data-correcta', op.ok ? "true":"false");
    b.setAttribute('aria-label', `Opción ${idx+1}`);
    b.innerHTML = `<strong>${idx+1}.</strong> ${op.txt}`;
    b.addEventListener('click', ()=> elegir(b, item));
    cont.appendChild(b);
  });

  // Accesos directos 1-3
  const onKey = (e)=>{
    if(["1","2","3"].includes(e.key)){
      const i = +e.key - 1;
      cont.children[i]?.click();
    }
  };
  document.addEventListener('keydown', onKey, { once:true });
}

function elegir(btn, item){
  // Marcar selección
  [...document.querySelectorAll('.opciones button')].forEach(b=>{
    b.disabled = true;
    if(b===btn) b.classList.add('marcada');
  });

  const ok = btn.dataset.correcta === "true";
  const fb = document.getElementById('feedback');
  if(ok){
    aciertos++;
    fb.className = "feedback ok";
    fb.textContent = `✔ ${item.a} ${item.b} — ${item.m}`;
  } else {
    fb.className = "feedback bad";
    fb.textContent = `✘ Casi. Correcto: “${item.a} ${item.b}”. ${item.m}`;
  }

  const btnSig = document.getElementById('btnSiguiente');
  btnSig.disabled = false;
  btnSig.focus();
  btnSig.onclick = ()=>{
    rondaActual++;
    actualizarEstado();
    renderPregunta();
  };
}

function renderFin(){
  juegoEl.innerHTML = `
    <div class="tarjeta">
      <p class="pregunta">🎉 ¡Buen trabajo!</p>
      <p>Tu resultado: <strong>${aciertos}</strong> de <strong>${totalRondas}</strong>.</p>
      <p>Puedes volver a jugar con otros refranes o cambiar el tamaño de texto en los controles.</p>
    </div>
  `;
  btnReiniciar.hidden = false;
  btnComenzar.hidden = true;
}

function comenzar(){
  document.body.classList.toggle('muy-grande', selTam.value === 'muy-grande');
  prepararRondas();
  btnReiniciar.hidden = true;
  btnComenzar.hidden = true;
  renderPregunta();
}

btnComenzar.addEventListener('click', comenzar);
btnReiniciar.addEventListener('click', ()=>{ btnComenzar.hidden=false; juegoEl.innerHTML=""; actualizarEstado(); });
selTam.addEventListener('change', ()=> document.body.classList.toggle('muy-grande', selTam.value === 'muy-grande'));
