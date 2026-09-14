// Vista SuperAdmin: configuración de seguridad. Los cambios se auditan (RN-027).
Views.config = {
  html() {
    const c = App.state.config;
    return `
      ${Cards.sectionHeader("Configuración del sistema", "Parámetros globales de seguridad y operación. Los cambios se registran en auditoría.")}
      <div class="max-w-2xl space-y-lg">
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow">
          <h3 class="font-title-lg text-title-lg text-on-background mb-lg flex items-center gap-sm"><span class="material-symbols-outlined text-primary">security</span> Seguridad</h3>
          <div class="space-y-lg">
            <div>
              <div class="flex justify-between items-baseline mb-xs">
                <label class="font-label-md text-label-md text-on-surface-variant" for="cfg-min">Minutos de inactividad para expirar sesión (RF-005)</label>
                <span id="cfg-min-val" class="font-title-lg text-title-lg text-primary font-bold">${c.minutos}</span>
              </div>
              <input id="cfg-min" type="range" min="15" max="120" step="15" value="${c.minutos}" class="w-full accent-primary"/>
              <div class="flex justify-between font-label-sm text-label-sm text-outline mt-xs"><span>15 min</span><span>120 min (2 h)</span></div>
            </div>
            <label class="flex items-center justify-between p-md rounded-lg border border-surface-variant hover:bg-surface-container-low cursor-pointer transition-colors">
              <div><p class="text-body-md font-medium text-on-background">Bloquear cuenta tras 5 intentos fallidos</p><p class="font-label-sm text-label-sm text-on-surface-variant">Protección contra fuerza bruta</p></div>
              <input id="cfg-bloqueo" type="checkbox" ${c.bloqueo ? "checked" : ""} class="w-5 h-5 text-primary focus:ring-primary rounded border-outline-variant"/>
            </label>
            <label class="flex items-center justify-between p-md rounded-lg border border-surface-variant hover:bg-surface-container-low cursor-pointer transition-colors">
              <div><p class="text-body-md font-medium text-on-background">Notificar accesos sospechosos</p><p class="font-label-sm text-label-sm text-on-surface-variant">Alerta por correo al SuperAdmin</p></div>
              <input id="cfg-notif" type="checkbox" ${c.notif ? "checked" : ""} class="w-5 h-5 text-primary focus:ring-primary rounded border-outline-variant"/>
            </label>
          </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow">
          <h3 class="font-title-lg text-title-lg text-on-background mb-md flex items-center gap-sm"><span class="material-symbols-outlined text-secondary">smart_toy</span> Servicio de IA (RAG)</h3>
          <div class="flex items-center justify-between p-md rounded-lg border border-surface-variant">
            <div><p class="text-body-md font-medium text-on-background">Proveedor de embeddings y generación</p><p class="font-label-sm text-label-sm text-on-surface-variant">API del servidor de la universidad · timeout configurado (RNF-018)</p></div>
            <span class="inline-flex items-center gap-xs px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm"><span class="w-2 h-2 rounded-full bg-primary"></span> Operativo</span>
          </div>
          <p class="font-label-sm text-label-sm text-outline mt-sm">Si el servicio de IA cae, el resto de módulos sigue operando (RN-030 / RNF-016).</p>
        </div>
        <div class="flex justify-end gap-sm">
          <button data-action="cfg-cancel" class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancelar</button>
          <button data-action="cfg-save" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint transition-colors shadow-sm flex items-center gap-sm"><span class="material-symbols-outlined text-[18px]">save</span> Guardar configuración</button>
        </div>
      </div>`;
  },
  after(root) {
    const slider = root.querySelector("#cfg-min");
    slider.addEventListener("input", () => { root.querySelector("#cfg-min-val").textContent = slider.value; });
  }
};
