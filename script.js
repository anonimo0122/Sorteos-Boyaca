// ===============================
// CONFIGURACIÓN: CAMBIA ESTOS DATOS
// ===============================
const WHATSAPP = "573137813110"; // WhatsApp de atención, sin + ni espacios
const X_URL = "https://x.com/"; // Enlace genérico hasta configurar tus redes
const BANK_ACCOUNT = "3248448958";
const BANK_NAME = "Aida Epieyu";
// ===============================

const TOTAL = 10000;

/*
  NÚMEROS APARTADOS / VENDIDOS
  --------------------------------
  Esta lista debe alimentarse con números realmente apartados o vendidos.
  Puedes reemplazarla por los números que devuelve tu sistema de reservas.
  La interfaz acepta cualquier cantidad y los pinta en rojo; el resto queda verde.
*/
// 4.500 números apartados, distribuidos de forma aleatoria a lo largo de los 10.000.
const RESERVED_COUNT = 4500;

// Generador determinista: los mismos 4.500 números se mantienen al recargar la página.
function seededRandom(seed = 20261101){
  return function(){
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = seededRandom();
const shuffledNumbers = Array.from({length: TOTAL}, (_, i) => i + 1);
for(let i = shuffledNumbers.length - 1; i > 0; i--){
  const j = Math.floor(rng() * (i + 1));
  [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
}

const RESERVED_NUMBERS = shuffledNumbers.slice(0, RESERVED_COUNT);
const BLOCKED = new Set(RESERVED_NUMBERS);
const selected = new Set();


const availableEl = document.getElementById("availableCount");
const blockedEl = document.getElementById("blockedCount");
const progressPercentEl = document.getElementById("progressPercent");
const progressFillEl = document.getElementById("progressFill");
function updateInventoryStats(){
  const blockedCount = BLOCKED.size;
  const availableCount = TOTAL - blockedCount;
  const percent = Math.round((blockedCount / TOTAL) * 100);
  if(availableEl) availableEl.textContent = availableCount.toLocaleString("es-CO");
  if(blockedEl) blockedEl.textContent = blockedCount.toLocaleString("es-CO");
  if(progressPercentEl) progressPercentEl.textContent = percent;
  if(progressFillEl) progressFillEl.style.width = percent + "%";
}
updateInventoryStats();

const grid=document.getElementById("numbers");
const selectedCount=document.getElementById("selectedCount");
const selectedText=document.getElementById("selectedText");
const totalPrice=document.getElementById("totalPrice");
const reserveBtn=document.getElementById("reserveBtn");
const stickyCheckout=document.getElementById("stickyCheckout");
const stickyNumbers=document.getElementById("stickyNumbers");
const stickyCount=document.getElementById("stickyCount");
const stickyTotal=document.getElementById("stickyTotal");
const stickyPayBtn=document.getElementById("stickyPayBtn");

function fmt(n){return String(n).padStart(4,"0");}
function money(value){return "$"+value.toLocaleString("es-CO")+" COP";}

/* Tarifas: 1 boleta cuesta $70.000 COP; promoción de 5 por $160.000 COP.
   Se aplican paquetes completos de 5 y se cobran las boletas restantes a precio individual. */
function calculatePrice(count){
  const packs = Math.floor(count / 5);
  const singles = count % 5;
  return packs * 160000 + singles * 70000;
}

function render(){
 const frag=document.createDocumentFragment();
 for(let n=1;n<=TOTAL;n++){
  const b=document.createElement("button");
  b.type="button";
  b.className="number "+(BLOCKED.has(n)?"unavailable":"available");
  b.textContent=fmt(n);
  if(BLOCKED.has(n)){
   b.disabled=true;b.title="No disponible";
  }else{
   b.title="Seleccionar número";
   b.addEventListener("click",()=>toggle(n,b));
  }
  frag.appendChild(b);
 }
 grid.appendChild(frag);
}

function toggle(n,b){
 if(BLOCKED.has(n)) return;
 if(selected.has(n)){selected.delete(n);b.classList.remove("selected");}
 else{selected.add(n);b.classList.add("selected");}
 update();
}

function update(){
 const nums=[...selected].sort((a,b)=>a-b);
 const count=nums.length;
 const price=calculatePrice(count);

 selectedCount.textContent=count;
 selectedText.textContent=count
  ? "🎟️ Números seleccionados: "+nums.map(fmt).join(", ")
  : "Aún no has seleccionado números.";

 totalPrice.textContent=money(price);
 reserveBtn.textContent=count
  ? `💳 PAGAR — ${money(price)}`
  : "💳 PAGAR — $0 COP";
 reserveBtn.disabled=!count;

 // Barra inferior: aparece automáticamente cuando hay una selección.
 if(stickyCheckout){
   stickyCheckout.classList.toggle("show", count>0);
   stickyNumbers.textContent=count
     ? nums.map(fmt).join(", ")
     : "Selecciona tus números";
   stickyCount.textContent=count;
   stickyTotal.textContent=money(price);
   stickyPayBtn.disabled=!count;
   stickyPayBtn.textContent=count ? `💳 PAGAR — ${money(price)}` : "💳 PAGAR";
 }

 // Mostrar únicamente el precio fijo por boleta, sin promociones.
 const promoHint=document.querySelector('.promo-hint');
 if(promoHint){
   promoHint.textContent = count ? `${count} ${count === 1 ? 'boleta' : 'boletas'}  · tarifa promocional aplicada = ${money(price)}` : '1 boleta: $70.000 COP · 5 boletas: $160.000 COP (promoción especial).';
 }
}

function openPaymentModal(){
 if(!selected.size){
   alert("🎟️ Selecciona al menos un número disponible.");
   return;
 }
 const nums=[...selected].sort((a,b)=>a-b);
 const price=calculatePrice(nums.length);
 const modalNumbers = document.getElementById('modalNumbers');
 const modalCount = document.getElementById('modalCount');
 const modalTotal = document.getElementById('modalTotal');
 const paymentModal = document.getElementById('paymentModal');
 if(!modalNumbers || !modalCount || !modalTotal || !paymentModal){
   alert('No se pudo abrir el resumen de pago. Recarga la página e inténtalo de nuevo.');
   return;
 }
 // Escribe el resumen completo antes de mostrar el modal.
 modalNumbers.textContent = nums.map(fmt).join(', ');
 modalCount.textContent = String(nums.length);
 modalTotal.textContent = money(price);

 paymentModal.classList.add('show');
 paymentModal.setAttribute('aria-hidden','false');
 document.body.classList.add('modal-open');
}

function closePaymentModal(){
 document.getElementById('paymentModal').classList.remove('show');
 document.getElementById('paymentModal').setAttribute('aria-hidden','true');
 document.body.classList.remove('modal-open');
}

document.getElementById('closePaymentModal').onclick=closePaymentModal;
document.getElementById('paymentModalBackdrop').onclick=closePaymentModal;

document.addEventListener('keydown',(e)=>{
 if(e.key==='Escape') closePaymentModal();
});

function openWhatsApp(message){
 const phone = String(WHATSAPP).replace(/\D/g, "");
 const text = encodeURIComponent(message);
 const url = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
 // Usamos location en vez de window.open para evitar que el navegador bloquee la ventana emergente.
 window.location.href = url;
}

document.getElementById('modalWhatsappBtn').onclick=()=>{
 const nums=[...selected].sort((a,b)=>a-b).map(fmt).join(", ");
 const price=calculatePrice(selected.size);
 const msg=`Hola, ya realicé el pago de la rifa independiente.\n\n🎟️ Números: ${nums}\n🔢 Cantidad: ${selected.size}\n💰 Total pagado: ${money(price)}\n💜 Pago realizado al Nequi 3248448958, titular Aida Epieyu, o mediante llave Bre-B desde cualquier banco. 📲 Envío el comprobante por este medio.`;
 openWhatsApp(msg);
};

document.getElementById("clearBtn").onclick=()=>{
 selected.clear();
 document.querySelectorAll(".number.selected").forEach(x=>x.classList.remove("selected"));
 update();
};

reserveBtn.onclick=openPaymentModal;
stickyPayBtn.onclick=openPaymentModal;
document.getElementById("whatsappBtn").onclick=()=>{
 const price=calculatePrice(selected.size);
 const nums=[...selected].sort((a,b)=>a-b).map(fmt).join(", ");
 const msg=selected.size
   ? `Hola, quiero enviar el comprobante de pago de la rifa independiente.\n\n🎟️ Números: ${nums}\n💰 Total: ${money(price)}.\n📲 Adjunto el comprobante del pago realizado al Nequi 3248448958, a nombre de Aida Epieyu, o mediante la llave Bre-B desde cualquier banco.`
   : "Hola, quiero enviar el comprobante de pago de la rifa independiente. Adjunto el comprobante del pago realizado al Nequi 3248448958, a nombre de Aida Epieyu, o mediante la llave Bre-B desde cualquier banco.";
 openWhatsApp(msg);
};

document.querySelectorAll(".copy-btn").forEach(btn=>{
 btn.addEventListener("click", async ()=>{
  const target=document.getElementById(btn.dataset.copy);
  const value=target ? target.textContent.trim() : "";
  try { await navigator.clipboard.writeText(value); }
  catch(e) { const field=document.createElement("textarea"); field.value=value; document.body.appendChild(field); field.select(); document.execCommand("copy"); field.remove(); }
  const old=btn.textContent; btn.textContent="✅ ¡Copiado!"; btn.classList.add("copied");
  setTimeout(()=>{btn.textContent=old;btn.classList.remove("copied");},1600);
 });
});
document.querySelectorAll('.socials a:first-child, .footer-links a:first-child').forEach(a=>a.href=X_URL);
update();
render();
