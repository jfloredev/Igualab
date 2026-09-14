const Badges = (() => {
  function estadoBadge(estado) {
    const map = {
      // Cuentas
      "Activo": "bg-primary-container text-on-primary-container",
      "Inactivo": "bg-surface-variant text-on-surface-variant",
      // Ingesta de documentos (RF-024)
      "Éxito": "bg-primary-container text-on-primary-container",
      "En proceso": "bg-tertiary-fixed text-on-tertiary-fixed",
      "Rechazado": "bg-error-container text-on-error-container",
      // Riesgo derivado del ESG
      "Alto": "bg-error-container text-on-error-container",
      "Medio": "bg-tertiary-fixed text-on-tertiary-fixed",
      "Bajo": "bg-primary-container text-on-primary-container",
      "Sin datos": "bg-surface-variant text-on-surface-variant",
      // Estados GRI (RN-016)
      "OK": "bg-primary-container text-on-primary-container",
      "Sub-reportado": "bg-error-container text-on-error-container",
      "Baja sustancia": "bg-tertiary-fixed text-on-tertiary-fixed"
    };
    return `<span class="inline-flex items-center px-2 py-1 rounded-full font-label-sm text-label-sm ${map[estado] || "bg-surface-variant text-on-surface-variant"}">${Helpers.esc(estado)}</span>`;
  }

  return { estadoBadge };
})();
