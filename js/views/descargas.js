Views.descargas = {
  html() {
    const rows = App.state.reports.map((r) => `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md"><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-error">picture_as_pdf</span><span class="font-medium">${Helpers.esc(r.nombre)}</span></div></td>
        <td class="py-md px-md">${Helpers.esc(r.empresa)}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.periodo)}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.fecha)}</td>
        <td class="py-md px-md text-right"><button data-descargar="${r.id}" class="flex items-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint transition-colors"><span class="material-symbols-outlined text-[16px]">download</span> Descargar</button></td>
      </tr>`).join("");
    return `
      ${Cards.sectionHeader("Descargar reportes PDF", "Reportes de prospección generados por el Administrador. Lista de solo lectura para visualizar y descargar (RF-016/017).")}
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Reporte", "Empresa", "Periodo", "Fecha", ""].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase ${h === "" ? "text-right" : ""}">${h}</th>`).join("")}</tr></thead>
            <tbody class="text-body-md">${rows || '<tr><td colspan="5" class="py-xl text-center text-body-md text-on-surface-variant">No hay reportes disponibles todavía.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
  },
  after(root) {
    root.querySelectorAll("[data-descargar]").forEach((b) => b.addEventListener("click", () => {
      const r = App.state.reports.find((x) => x.id === b.dataset.descargar);
      Report.openModal(r.empresa, r.periodo, r.secciones, r);
    }));
  }
};
