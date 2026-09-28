// Formulario de contacto (simulado: no se envía a ningún servidor todavía)
const contactForm = document.getElementById("contactForm");
const formError = document.getElementById("formError");
const formSuccess = document.getElementById("formSuccess");
const contactSubmit = document.getElementById("contactSubmit");
const newMessage = document.getElementById("newMessage");

// Revisa cada campo y marca en rojo los que estén vacíos o mal.
// Devuelve true si todo está bien.
function validarFormulario() {
  let valido = true;

  contactForm.querySelectorAll(".form-field").forEach(campo => {
    const input = campo.querySelector("input, select, textarea");
    const vacio = input.value.trim() === "";
    // checkValidity() usa las reglas del HTML (ej: type="email" exige un @)
    const invalido = vacio || !input.checkValidity();
    campo.classList.toggle("form-field--error", invalido);
    if (invalido) valido = false;
  });

  return valido;
}

contactForm.addEventListener("submit", (evento) => {
  // Evita que el navegador recargue la página al enviar
  evento.preventDefault();

  if (!validarFormulario()) {
    formError.textContent = "Revisá los campos marcados en rojo.";
    return;
  }
  formError.textContent = "";

  // Simulamos el envío: botón bloqueado 1 segundo y después el mensaje de éxito
  contactSubmit.disabled = true;
  contactSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  setTimeout(() => {
    contactForm.hidden = true;
    formSuccess.hidden = false;
    contactForm.reset();
    contactSubmit.disabled = false;
    contactSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar consulta';
  }, 1000);
});

// Botón "Enviar otra consulta": vuelve a mostrar el formulario
newMessage.addEventListener("click", () => {
  formSuccess.hidden = true;
  contactForm.hidden = false;
});