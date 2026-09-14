Views.auditoria = {
  html() {
    const rows = App.state.audit.slice().reverse().map((a) => `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md text-on-surface-variant whitespace-nowrap">${Helpers.esc(a.fecha)}</td>
        <td class="py-md px-md font-medium">${Helpers.esc(a.usuario)}</td>
        <td class="py-md px-md"><span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(a.tipo)}</span></td>
        <td class="py-md px-md">${Helpers.esc(a.accion)}</td>
      </tr>`).join("");
    return `
      ${Cards.sectionHeader("Auditoría de eventos", "Registro automático e inmutable de eventos sensibles. Solo lectura (RN-029). Consigna cuenta, fecha, hora y tipo (RN-028).",
      `<button data-action="export-audit" class="flex items-center gap-sm px-md py-sm bg-surface rounded-lg border border-outline-variant text-on-surface text-label-md font-semibold hover:bg-surface-container-low transition-colors"><span class="material-symbols-outlined text-[18px]">download</span> Exportar</button>`)}
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
        <div class="p-lg border-b border-outline-variant bg-surface-bright flex flex-wrap gap-md items-end">
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Tipo de evento</label>
            <select id="aud-tipo" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary"><option value="">Todos</option><option>Inicio de sesión</option><option>Cambio de rol</option><option>Cambio de estado GRI</option><option>Ingesta de documento</option><option>Rechazo de documento</option><option>Registro de empresa</option><option>Generación de reporte</option><option>Descarga</option><option>Configuración</option><option>Consulta IA</option></select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Usuario</label>
            <select id="aud-user" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary"><option value="">Todos</option>${App.state.users.map((u) => `<option>${Helpers.esc(u.nombre)}</option>`).join("")}</select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Desde</label>
            <input id="aud-desde" type="date" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary"/></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Hasta</label>
            <input id="aud-hasta" type="date" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary"/></div>
          <button data-action="aud-clear" class="py-sm px-md rounded-lg text-label-md text-primary hover:bg-primary/5 transition-colors">Limpiar filtros</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead><tr class="bg-surface-container-low border-b border-outline-variant">
              ${["Fecha y hora", "Usuario", "Tipo de evento", "Acción"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">${h}</th>`).join("")}
            </tr></thead>
            <tbody id="aud-body" class="text-body-md">${rows}</tbody>
          </table>
        </div>
        <div class="p-sm border-t border-outline-variant bg-surface-container-lowest"><span id="aud-count" class="font-label-sm text-label-sm text-on-surface-variant"></span></div>
      </div>`;
  },
  after(root) {
    const body = root.querySelector("#aud-body");
    const count = root.querySelector("#aud-count");
    const filtros = ["#aud-tipo", "#aud-user", "#aud-desde", "#aud-hasta"].map((s) => root.querySelector(s));
    function aplicar() {
      const [tipo, user, desde, hasta] = filtros.map((f) => f.value);
      const list = App.state.audit.filter((a) =>
        (!tipo || a.tipo === tipo) && (!user || a.usuario === user) &&
        (!desde || a.fecha >= desde) && (!hasta || a.fecha.slice(0, 10) <= hasta)
      );
      body.innerHTML = list.length ? list.reverse().map((a) => `
        <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
          <td class="py-md px-md text-on-surface-variant whitespace-nowrap">${Helpers.esc(a.fecha)}</td>
          <td class="py-md px-md font-medium">${Helpers.esc(a.usuario)}</td>
          <td class="py-md px-md"><span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(a.tipo)}</span></td>
          <td class="py-md px-md">${Helpers.esc(a.accion)}</td>
        </tr>`).join("") : `<tr><td colspan="4" class="py-xl text-center text-body-md text-on-surface-variant">Sin resultados para el filtro seleccionado.</td></tr>`;
      count.textContent = `${list.length} eventos · Registro de solo lectura`;
    }
    filtros.forEach((f) => f.addEventListener("change", aplicar));
    aplicar();
  }
};
