const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const btnEscribeme = document.getElementById('btn-escribeme');
const btnCancelar  = document.getElementById('btn-cancelar');
const formWrap     = document.getElementById('contacto-form-wrap');

btnEscribeme.addEventListener('click', function() {
  formWrap.classList.add('open');
  formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

btnCancelar.addEventListener('click', function() {
  formWrap.classList.remove('open');
});

document.getElementById('phone-number').addEventListener('input', function() {
  let digits = this.value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 6) digits = digits.slice(0,2) + ' ' + digits.slice(2,6) + ' ' + digits.slice(6);
  else if (digits.length > 2) digits = digits.slice(0,2) + ' ' + digits.slice(2);
  this.value = digits;
});

const contactoForm = document.querySelector('.contacto-form');
contactoForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  const btn = this.querySelector('.btn-submit');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const data = new FormData(this);
  const prefix = document.getElementById('phone-prefix').value;
  const number = document.getElementById('phone-number').value.trim();
  if (number) data.append('whatsapp', prefix + ' ' + number);

  try {
    const res = await fetch(this.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    const json = await res.json();
    if (res.ok && json.success) {
      formWrap.innerHTML = `
        <div class="form-success">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="#4A9A9A" stroke-width="1.5"/>
            <path d="M14 24.5l7 7 13-14" stroke="#4A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="form-success-title">¡Mensaje enviado!</p>
          <p class="form-success-sub">Te contactaré pronto.</p>
        </div>`;
    } else {
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      alert('Error: ' + (json.message || 'Intenta de nuevo.'));
    }
  } catch {
    btn.textContent = 'Enviar mensaje';
    btn.disabled = false;
    alert('Sin conexión. Verifica tu internet e intenta de nuevo.');
  }
});

