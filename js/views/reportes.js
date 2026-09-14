// Vista Administrador: generación de reportes de prospección por empresa + año
// (RF-035). Sólo empresas con al menos un documento ingestado (RF-036 / RN-020).
Views.reportes = {
  html() {
    const empresas = Domain.empresasConDocumentos(App.state);
    const misReportes = App.state.reports.map((r) => `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md font-medium">${Helpers.esc(r.empresa)}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.sector || "")}</td>
        <td class="py-md px-md text-on-surface-variant">${r.anio}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.generadoPor || "")}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.fecha)}</td>
        <td class="py-md px-md text-right"><button data-ver-reporte="${r.id}" class="p-1.5 rounded-lg text-primary hover:bg-primary/5" title="Ver / descargar"><span class="material-symbols-outlined text-[18px]">picture_as_pdf</span></button></td>
      </tr>`).join("");

    if (!empresas.length) {
      return `
        ${Cards.sectionHeader("Reportes de prospección", "Genera un reporte por empresa y año, a partir de los resultados de análisis almacenados (RF-042).")}
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-xl text-center">
          <span class="material-symbols-outlined text-[40px] text-outline">block</span>
          <p class="text-body-md text-on-surface-variant mt-sm">No hay empresas con documentos ingestados. No se puede generar un reporte de prospección (RF-026 / RN-020).</p>
        </div>`;
    }

    const emp = empresas[0];
    const anios = Domain.aniosDeEmpresa(emp.id, App.state);
    return `
      ${Cards.sectionHeader("Reportes de prospección", "Consolida, por empresa y año, el estado de cada código GRI, las sanciones y un resumen ejecutivo automático (RN-024). Se deriva de los resultados almacenados, sin IA (RF-042).")}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div class="lg:col-span-4 space-y-lg">
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow">
            <h3 class="font-title-lg text-title-lg text-on-background mb-md">Parámetros</h3>
            <div class="space-y-md">
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Empresa (con documentos)</label>
                <select id="rep-empresa" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
                  ${empresas.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("")}
                </select></div>
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Sector</label>
                <input id="rep-sector" value="${Helpers.esc(emp.sector)}" disabled class="rounded-lg border-outline-variant bg-surface-container-high py-sm px-md text-body-md text-on-surface-variant"/></div>
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Año</label>
                <select id="rep-anio" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
                  ${anios.map((a) => `<option>${a}</option>`).join("")}
                </select></div>
            </div>
            <div class="mt-md rounded-lg bg-surface-container-low p-sm border border-outline-variant">
              <p class="font-label-sm text-label-sm text-on-surface-variant">Contenido fijo (RN-024): resumen ejecutivo, estado por código GRI con cita, sanciones con monto o "no cuantificada" y totales. El reporte es inmutable (RN-026).</p>
            </div>
            <button data-action="generar-reporte" class="w-full mt-md bg-primary text-on-primary py-md px-lg rounded-lg flex items-center justify-center gap-sm shadow-md hover:bg-surface-tint hover:-translate-y-0.5 transition-all text-body-lg font-semibold">
              <span class="material-symbols-outlined">download</span> Generar y descargar PDF
            </button>
          </div>
        </div>
        <div class="lg:col-span-8 space-y-lg">
          <div class="bg-surface-container-low rounded-xl border border-surface-variant p-lg flex flex-col min-h-[420px]">
            <div class="flex justify-between items-center mb-sm">
              <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Vista previa del documento</h3>
              <span class="font-label-sm text-label-sm text-outline">A4</span>
            </div>
            <div class="flex-1 overflow-y-auto chat-scroll py-lg">
              <div id="rep-preview" class="scale-[0.7] lg:scale-[0.82] origin-top">${Report.renderA4(emp.id, anios[0])}</div>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
            <div class="p-lg border-b border-outline-variant bg-surface-bright"><h3 class="font-title-lg text-title-lg text-on-surface">Historial de reportes generados (RF-044)</h3></div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Empresa", "Sector", "Año", "Generado por", "Fecha", ""].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase">${h}</th>`).join("")}</tr></thead>
                <tbody class="text-body-md">${misReportes || '<tr><td colspan="6" class="py-lg text-center text-body-md text-on-surface-variant">Aún no has generado reportes.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  },
  after(root) {
    const selEmp = root.querySelector("#rep-empresa");
    const selAnio = root.querySelector("#rep-anio");
    const inSector = root.querySelector("#rep-sector");
    const preview = root.querySelector("#rep-preview");

    function refrescarAnios() {
      const emp = App.state.empresas.find((e) => e.id === selEmp.value);
      inSector.value = emp.sector;
      const anios = Domain.aniosDeEmpresa(emp.id, App.state);
      selAnio.innerHTML = anios.map((a) => `<option>${a}</option>`).join("");
    }
    function refrescarPreview() {
      preview.innerHTML = Report.renderA4(selEmp.value, parseInt(selAnio.value, 10));
    }
    selEmp.addEventListener("change", () => { refrescarAnios(); refrescarPreview(); });
    selAnio.addEventListener("change", refrescarPreview);

    root.querySelectorAll("[data-ver-reporte]").forEach((b) => b.addEventListener("click", () => {
      const r = App.state.reports.find((x) => x.id === b.dataset.verReporte);
      Report.openModal(r.empresaId, r.anio, r);
    }));
    root.querySelector("[data-action='generar-reporte']").addEventListener("click", () => {
      Report.openModal(selEmp.value, parseInt(selAnio.value, 10), null);
    });
  }
};
