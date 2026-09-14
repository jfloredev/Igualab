// Vista Administrador: revisión de brechas GRI + asignación manual de estados
// (RN-016 / RF-027), puntaje ESG calculado (RF-051), sanciones (RF-039) y
// registro de evidencia por dimensión (RF-028).
Views.analisis = {
  html() {
    const empresas = Domain.empresasConDocumentos(App.state);
    if (!empresas.length) {
      return `
        ${Cards.sectionHeader("Análisis GRI y sanciones", "Revisa las brechas GRI detectadas y asigna su estado (RF-027).")}
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-xl text-center">
          <span class="material-symbols-outlined text-[40px] text-outline">folder_off</span>
          <p class="text-body-md text-on-surface-variant mt-sm">No hay empresas con documentos ingestados. Solicita al SuperAdmin la ingesta de memorias o reportes GRI.</p>
        </div>`;
    }
    const emp = empresas[0];
    const anios = Domain.aniosDeEmpresa(emp.id, App.state);
    return `
      ${Cards.sectionHeader("Análisis GRI y sanciones", "El estado de cada código GRI se asigna manualmente según criterio profesional, tras revisar la cita textual (RN-016). El sistema no lo infiere.")}
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow flex flex-wrap gap-md items-end">
        <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Empresa</label>
          <select id="an-empresa" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary min-w-[220px]">
            ${empresas.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("")}
          </select></div>
        <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Sector</label>
          <input id="an-sector" value="${Helpers.esc(emp.sector)}" disabled class="rounded-lg border-outline-variant bg-surface-container-high py-sm px-md text-body-md text-on-surface-variant"/></div>
        <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Año</label>
          <select id="an-anio" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
            ${anios.map((a) => `<option>${a}</option>`).join("")}
          </select></div>
      </div>
      <div id="an-panel"></div>`;
  },
  after(root) {
    const selEmp = root.querySelector("#an-empresa");
    const selAnio = root.querySelector("#an-anio");
    const inSector = root.querySelector("#an-sector");
    const panel = root.querySelector("#an-panel");

    function refrescarAnios() {
      const emp = App.state.empresas.find((e) => e.id === selEmp.value);
      inSector.value = emp.sector;
      const anios = Domain.aniosDeEmpresa(emp.id, App.state);
      selAnio.innerHTML = anios.map((a) => `<option>${a}</option>`).join("");
    }

    function render() {
      const empId = selEmp.value;
      const anio = parseInt(selAnio.value, 10);
      const key = Domain.analisisKey(empId, anio);
      const a = App.state.analisis[key];
      if (!a) {
        panel.innerHTML = `<div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-xl text-center mt-lg"><span class="material-symbols-outlined text-[40px] text-outline">query_stats</span><p class="text-body-md text-on-surface-variant mt-sm">No hay análisis persistido para este año.</p></div>`;
        return;
      }
      const esg = Domain.esgScore(a.gri);
      const conteo = Domain.conteoEstados(a.gri);
      const resSan = Domain.resumenSanciones(a.sanciones);

      const griRows = a.gri.map((g, i) => `
        <tr class="border-b border-surface-variant align-top">
          <td class="py-md px-md whitespace-nowrap"><span class="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold uppercase">${g.codigo}</span></td>
          <td class="py-md px-md font-medium">${Helpers.esc(g.tema)}</td>
          <td class="py-md px-md">
            <p class="text-body-md text-on-surface-variant italic border-l-2 border-outline-variant pl-sm">${Helpers.esc(g.cita)}</p>
            <p class="font-label-sm text-label-sm text-outline mt-xs">${Helpers.esc(g.doc)} · ${Helpers.esc(g.pagina)}</p>
          </td>
          <td class="py-md px-md">
            <select data-gri="${i}" class="rounded-lg border-outline-variant bg-surface-container-low py-xs px-sm text-body-md focus:border-primary focus:ring-primary">
              ${DB.estadosGri.map((es) => `<option ${g.estado === es ? "selected" : ""}>${es}</option>`).join("")}
            </select>
          </td>
        </tr>`).join("");

      const sanRows = a.sanciones.length ? a.sanciones.map((s) => `
        <div class="flex justify-between items-start border border-surface-variant rounded-lg p-md gap-md">
          <div class="min-w-0">
            <p class="text-body-md font-medium text-on-surface">${Helpers.esc(s.entidad)}</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(s.motivo)}</p>
            <p class="font-label-sm text-label-sm text-outline italic mt-xs">${Helpers.esc(s.cita)} · ${Helpers.esc(s.pagina)}</p>
          </div>
          <div class="text-right shrink-0">
            ${s.monto != null
              ? `<p class="font-title-lg text-title-lg text-error font-bold whitespace-nowrap">${Helpers.money(s.monto)}</p>`
              : `<span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">No cuantificada</span>`}
          </div>
        </div>`).join("") : `<p class="text-body-md text-on-surface-variant">No se identificaron sanciones en los documentos de este año.</p>`;

      panel.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-lg mt-lg">
          ${Cards.kpiCard({ titulo: "Puntaje ESG (calculado)", valor: esg == null ? "—" : esg, icono: "eco", pie: esg || 0, extra: "OK=100 · Baja=50 · Sub=0 (RF-051)" })}
          ${Cards.kpiCard({ titulo: "Códigos OK", valor: conteo["OK"], icono: "check_circle", color: "primary", pie: 100 })}
          ${Cards.kpiCard({ titulo: "Baja sustancia", valor: conteo["Baja sustancia"], icono: "warning", color: "tertiary", pie: 60 })}
          ${Cards.kpiCard({ titulo: "Sub-reportado", valor: conteo["Sub-reportado"], icono: "error", color: "primary", pie: 40 })}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-lg">
          <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
            <div class="p-lg border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h3 class="font-title-lg text-title-lg text-on-surface">Brechas GRI</h3>
              <span class="font-label-sm text-label-sm text-on-surface-variant">${a.evidencia.gri ? "Con evidencia analizable (RF-028)" : "Sin evidencia analizable"}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Código", "Tema", "Cita textual (evidencia)", "Estado"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase">${h}</th>`).join("")}</tr></thead>
                <tbody class="text-body-md">${griRows}</tbody>
              </table>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden flex flex-col">
            <div class="p-lg border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h3 class="font-title-lg text-title-lg text-on-surface">Sanciones</h3>
              <span class="material-symbols-outlined text-error">gavel</span>
            </div>
            <div class="p-lg space-y-md flex-1">
              ${sanRows}
              <div class="border-t border-surface-variant pt-md text-body-md">
                <div class="flex justify-between"><span class="text-on-surface-variant">Total cuantificado</span><span class="font-bold text-on-surface">${Helpers.money(resSan.total)}</span></div>
                <div class="flex justify-between"><span class="text-on-surface-variant">Sin monto determinado</span><span class="font-bold text-on-surface">${resSan.sinMonto}</span></div>
              </div>
              <p class="font-label-sm text-label-sm text-outline">Las sanciones provienen sólo de los documentos ingestados (RN-015).</p>
            </div>
          </div>
        </div>`;

      // RF-027 / RN-016: cambio manual de estado GRI (persistente).
      panel.querySelectorAll("[data-gri]").forEach((sel) => sel.addEventListener("change", () => {
        const idx = parseInt(sel.dataset.gri, 10);
        const prev = a.gri[idx].estado;
        const nuevo = sel.value;
        if (prev === nuevo) return;
        a.gri[idx].estado = nuevo;
        const emp = App.state.empresas.find((e) => e.id === empId);
        App.pushAudit("Cambio de estado GRI", `Asignó estado '${nuevo}' a ${a.gri[idx].codigo} · ${emp.nombre} ${anio} (antes '${prev}')`);
        UI.toast(`${a.gri[idx].codigo}: estado '${nuevo}'. Puntaje ESG recalculado.`, "success");
        render(); // recalcula ESG y conteos
      }));
    }

    selEmp.addEventListener("change", () => { refrescarAnios(); render(); });
    selAnio.addEventListener("change", render);
    render();
  }
};
