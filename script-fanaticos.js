/* SESIÓN (simulada, solo para la demo)*/
const USUARIOS = [
  { usuario: "fan1", password: "hockey123" },
  { usuario: "fan2", password: "hockey123" }
];

function usuarioActual() {
  return localStorage.getItem("usuarioLogueado");
}

function iniciarSesion(usuario, password) {
  const valido = USUARIOS.some(u => u.usuario === usuario && u.password === password);
  if (valido) {
    localStorage.setItem("usuarioLogueado", usuario);
  }
  return valido;
}

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
}

/* MODAL DE ACCESO */
const authModal = document.getElementById("authModal");
const authBtn = document.getElementById("authBtn");
const authClose = document.getElementById("authClose");
const authOverlay = document.getElementById("authOverlay");

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const regUser = document.getElementById("regUser");
const loginError = document.getElementById("loginError");
const registerNote = document.getElementById("registerNote");

// Muestra una de las dos vistas del modal y oculta los avisos
function mostrarVista(vista) {
  loginView.hidden = vista !== "login";
  registerView.hidden = vista !== "register";
  loginError.hidden = true;
  registerNote.hidden = true;
}

function abrirModal(vista = "login") {
  mostrarVista(vista);
  authModal.classList.add("modal--open");
  (vista === "login" ? loginUser : regUser).focus();
}

function cerrarModal() {
  authModal.classList.remove("modal--open");
  loginForm.reset();
  registerForm.reset();
}

// El botón del navbar dice "Ingresar" o "Salir (usuario)" según la sesión
function actualizarBotonAuth() {
  const usuario = usuarioActual();
  authBtn.textContent = usuario ? `Salir (${usuario})` : "Ingresar";
}

authBtn.addEventListener("click", () => {
  if (usuarioActual()) {
    cerrarSesion();
    actualizarBotonAuth();
    mostrarVotacionEquipoFavorito(todosLosPartidos);
  } else {
    abrirModal("login");
  }
});

authClose.addEventListener("click", cerrarModal);
authOverlay.addEventListener("click", cerrarModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

document.getElementById("showRegister").addEventListener("click", () => mostrarVista("register"));
document.getElementById("showLogin").addEventListener("click", () => mostrarVista("login"));

loginForm.addEventListener("submit", (e) => {
  e.preventDefault(); // evita que el navegador recargue la página
  const usuario = loginUser.value.trim();
  const password = loginPass.value;

  if (iniciarSesion(usuario, password)) {
    cerrarModal();
    actualizarBotonAuth();
    mostrarVotacionEquipoFavorito(todosLosPartidos);
  } else {
    loginError.hidden = false;
  }
});

// Crear cuenta es solo visual: no guarda nada, solo avisa que es una demo
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  registerNote.hidden = false;
});

actualizarBotonAuth();

/* VOTACIÓN "EQUIPO FAVORITO" Se guarda un voto por usuario: { fan1: "La Tablada", fan2: "UNRC" } */
function obtenerListaEquipos(partidos) {
  const nombres = partidos.flatMap(p => [p.equipo_local, p.equipo_visitante]);
  return [...new Set(nombres)].filter(Boolean).sort();
}

function obtenerVotosPorUsuario() {
  const guardado = localStorage.getItem("votosPorUsuario");
  return guardado ? JSON.parse(guardado) : {};
}

// Cuenta cuántos votos tiene cada equipo: { "La Tablada": 2, "UNRC": 1 }
function contarVotos() {
  const conteo = {};
  Object.values(obtenerVotosPorUsuario()).forEach(equipo => {
    conteo[equipo] = (conteo[equipo] || 0) + 1;
  });
  return conteo;
}

// Devuelve true si el voto se guardó, false si faltaba iniciar sesión
function guardarVoto(equipo) {
  const usuario = usuarioActual();
  if (!usuario) {
    abrirModal("login");
    return false;
  }
  const votos = obtenerVotosPorUsuario();
  votos[usuario] = equipo; // si ya había votado, se reemplaza su voto anterior
  localStorage.setItem("votosPorUsuario", JSON.stringify(votos));
  return true;
}

function miVotoActual() {
  const usuario = usuarioActual();
  return usuario ? obtenerVotosPorUsuario()[usuario] : null;
}

function mostrarVotacionEquipoFavorito(partidos) {
  const contenedor = document.getElementById("favoriteTeamVote");
  const votos = contarVotos();
  const totalVotos = Object.values(votos).reduce((suma, n) => suma + n, 0);
  const votoActual = miVotoActual();

  // Armamos el ranking: de más a menos votado (si empatan, queda el orden alfabético)
  const ranking = obtenerListaEquipos(partidos)
    .map(equipo => ({ equipo, cantidad: votos[equipo] || 0 }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const filas = ranking.map(({ equipo, cantidad }, index) => {
    const porcentaje = totalVotos > 0 ? Math.round((cantidad / totalVotos) * 100) : 0;
    const esMiVoto = equipo === votoActual;
    const esLider = cantidad > 0 && index === 0;
    const puesto = cantidad > 0 ? index + 1 : "–";

    return `
      <div class="vote-row ${esMiVoto ? "vote-row--mine" : ""}">
        <span class="vote-row__rank ${esLider ? "vote-row__rank--leader" : ""}">${puesto}</span>
        ${renderBadge(equipo)}
        <span class="vote-row__name">${equipo}</span>
        <div class="vote-row__bar">
          <div class="vote-row__bar-fill" style="width: ${porcentaje}%"></div>
        </div>
        <span class="vote-row__stats"><strong>${porcentaje}%</strong> · ${cantidad}</span>
        <button class="filter-chip vote-row__btn ${esMiVoto ? "filter-chip--active" : ""}" data-equipo="${equipo}">
          ${esMiVoto ? "✓ Tu voto" : "Votar"}
        </button>
      </div>
    `;
  }).join("");

  contenedor.innerHTML = `
    <p class="vote-summary">${totalVotos} voto${totalVotos === 1 ? "" : "s"} en total</p>
    <div class="vote-list">${filas}</div>
  `;

  contenedor.querySelectorAll(".vote-row__btn").forEach(boton => {
    boton.addEventListener("click", () => {
      if (guardarVoto(boton.dataset.equipo)) {
        mostrarVotacionEquipoFavorito(partidos);
      }
    });
  });
}

cargarPartidos();