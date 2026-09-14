// Vista SuperAdmin: catálogo de empresas (RN-035 / RF-052 / RF-053).
Views.empresas = {
  html() {
    const rows = App.state.empresas.map((e) => {
      const anios = Domain.aniosDeEmpresa(e.id, App.state);
      const nDocs = App.state.documents.filter((d) => d.empresaId === e.id && d.estado === "Éxito").length;
      const ultimoAnio = anios[0];
      const analisis = ultimoAnio ? App.state.analisis[Domain.analisisKey(e.id, ultimoAnio)] : null;
      const esg = analisis ? Domain.esgScore(analisis.gri) : null;
      return `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md font-medium">${Helpers.esc(e.nombre)}</td>
        <td class="py-md px-md"><span class="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(e.sector)}</span></td>
        <td class="py-md px-md text-on-surface-variant">${nDocs}</td>
        <td class="py-md px-md">${esg == null ? '<span class="text-outline">—</span>' : `<span class="font-semibold text-on-surface">${esg}</span><span class="text-outline">/100</span>`}</td>
        <td class="py-md px-md">${Badges.estadoBadge(Domain.riesgoDesdeEsg(esg))}</td>
      </tr>`;
    }).join("");
    return `
      ${Cards.sectionHeader("Empresas del catálogo", "Alta y registro de empresas del sistema. Sólo el SuperAdmin registra empresas (RF-052). Cada empresa requiere nombre y sector (RF-053).",
      `<button data-action="crear-empresa" class="flex items-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:bg-surface-tint transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">add_business</span> Registrar empresa</button>`)}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
        ${DB.sectores.map((s) => {
          const n = App.state.empresas.filter((e) => e.sector === s).length;
          return Cards.kpiCard({ titulo: "Sector " + s, valor: n, icono: s === "Minería" ? "landscape" : s === "Energía" ? "bolt" : "oil_barrel", color: "secondary", pie: Math.min(n * 25, 100), extra: "Empresas registradas" });
        }).join("")}
      </div>
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead><tr class="bg-surface-container-low border-b border-outline-variant">
              ${["Empresa", "Sector", "Documentos", "Puntaje ESG", "Riesgo"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">${h}</th>`).join("")}
            </tr></thead>
            <tbody class="text-body-md">${rows}</tbody>
          </table>
        </div>
        <div class="p-sm border-t border-outline-variant bg-surface-container-lowest">
          <span class="font-label-sm text-label-sm text-on-surface-variant">${App.state.empresas.length} empresas · Sectores en alcance: ${DB.sectores.join(", ")} (RN-019). El puntaje ESG se calcula del análisis GRI (RF-051).</span>
        </div>
      </div>`;
  }
};
