// Vista SuperAdmin: ciclo de vida de cuentas (RF-010/012/013/014/016).
Views.usuarios = {
  html() {
    const rows = App.state.users.map((u) => {
      const esSuper = u.rol === "superadmin";
      const activo = u.estado === "Activo";
      return `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md font-medium">${Helpers.esc(u.nombre)}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(u.correo)}</td>
        <td class="py-md px-md">${Badges.estadoBadge(u.estado)}</td>
        <td class="py-md px-md"><span class="font-label-md text-label-md ${esSuper ? "text-tertiary font-bold" : "text-secondary font-bold"}">${DB.roleLabels[u.rol]}</span></td>
        <td class="py-md px-md text-right">
          <div class="flex justify-end gap-xs">
            <button data-editar="${u.id}" class="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5" title="Editar datos"><span class="material-symbols-outlined text-[18px]">edit</span></button>
            <button data-toggle="${u.id}" ${esSuper ? "disabled" : ""} class="p-1.5 rounded-lg ${esSuper ? "text-outline-variant cursor-not-allowed" : "text-on-surface-variant hover:text-tertiary hover:bg-tertiary-fixed/20"}" title="${esSuper ? "El SuperAdmin no puede deshabilitarse (RF-013)" : activo ? "Deshabilitar" : "Habilitar"}"><span class="material-symbols-outlined text-[18px]">${activo ? "person_off" : "how_to_reg"}</span></button>
            <button data-transferir="${u.id}" ${esSuper || !activo ? "disabled" : ""} class="p-1.5 rounded-lg ${esSuper || !activo ? "text-outline-variant cursor-not-allowed" : "text-on-surface-variant hover:text-tertiary hover:bg-tertiary-fixed/20"}" title="${esSuper ? "Ya es SuperAdmin" : !activo ? "Requiere cuenta habilitada (RF-015)" : "Transferir rol SuperAdmin"}"><span class="material-symbols-outlined text-[18px]">swap_horiz</span></button>
          </div>
        </td>
      </tr>`;
    }).join("");
    return `
      ${Cards.sectionHeader("Usuarios y roles", "Ciclo de vida de cuentas. Sólo el SuperAdmin administra usuarios. Toda cuenta nueva nace como Administrador (RN-008).",
      `<button data-action="crear-usuario" class="flex items-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:bg-surface-tint transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">person_add</span> Crear usuario</button>`)}
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead><tr class="bg-surface-container-low border-b border-outline-variant">
              ${["Usuario", "Correo", "Estado", "Rol", "Acciones"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ${h === "Acciones" ? "text-right" : ""}">${h}</th>`).join("")}
            </tr></thead>
            <tbody class="text-body-md">${rows}</tbody>
          </table>
        </div>
        <div class="p-sm border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <span class="font-label-sm text-label-sm text-on-surface-variant">${App.state.users.length} cuentas · Exactamente una es SuperAdmin (RN-002) · Deshabilitar preserva el historial (RN-005).</span>
        </div>
      </div>`;
  }
};
