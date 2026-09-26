function mostrarPosiciones(equipos) {
  const tbody = document.getElementById("standingsBody");
  const contador = document.getElementById("teamsCount");

  contador.textContent = `${equipos.length} equipo${equipos.length === 1 ? "" : "s"}`;
  tbody.innerHTML = "";

  if (equipos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color: var(--color-cream-muted); padding: 30px;">Todavía no hay partidos finalizados en esta categoría</td></tr>`;
    return;
  }

  equipos.forEach((equipo, index) => {
    const puesto = index + 1;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="rank-badge ${puesto === 1 ? "rank-badge--leader" : ""}">${puesto}</span></td>
      <td>${equipo.nombre}</td>
      <td>${equipo.pj}</td>
      <td>${equipo.g}</td>
      <td>${equipo.e}</td>
      <td>${equipo.p}</td>
      <td>${equipo.gf}</td>
      <td>${equipo.gc}</td>
      <td class="${equipo.dg > 0 ? "dg-positivo" : equipo.dg < 0 ? "dg-negativo" : ""}">${equipo.dg > 0 ? "+" : ""}${equipo.dg}</td>
      <td>${equipo.pts}</td>
    `;
    tbody.appendChild(fila);
  });
}

const categoryFilters = document.getElementById("categoryFilters");
if (categoryFilters) {
  categoryFilters.addEventListener("click", (e) => {
    const boton = e.target.closest(".filter-chip");
    if (!boton) return;

    categoryFilters
      .querySelectorAll(".filter-chip")
      .forEach(chip => chip.classList.remove("filter-chip--active"));
    boton.classList.add("filter-chip--active");

    mostrarPosiciones(calcularTabla(todosLosPartidos, boton.dataset.category));
  });
}

cargarPartidos();
