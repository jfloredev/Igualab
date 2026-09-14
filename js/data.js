// ============================================================================
//  Igualab · Datos del mock
//  Alineado al Documento de Análisis y Diseño (RN-001 … RN-038 / RF / RNF).
//  - Sólo dos roles: SuperAdmin y Administrador (RN-001).
//  - Sectores en alcance: Minería, Petróleo y Gas, Energía (RN-019).
//  - Estados GRI: OK, Baja sustancia, Sub-reportado (RN-016).
//  - Puntaje ESG se CALCULA (RN-034 / RF-051): OK=100, Baja sustancia=50, Sub-reportado=0.
// ============================================================================

const DB = {
  // --- Roles (RN-001: conjunto cerrado de dos roles) -----------------------
  roleLabels: {
    superadmin: "SuperAdmin",
    administrador: "Administrador"
  },

  // Sectores acotados del análisis (RN-019).
  sectores: ["Minería", "Petróleo y Gas", "Energía"],

  // Estados de cumplimiento GRI (RN-016) y su puntaje ESG (RF-051).
  estadosGri: ["OK", "Baja sustancia", "Sub-reportado"],
  esgPuntaje: { "OK": 100, "Baja sustancia": 50, "Sub-reportado": 0 },

  // --- Cuentas ---------------------------------------------------------------
  // RN-002: exactamente una cuenta SuperAdmin. RN-006: la inicial no se crea por app.
  // RN-008: toda cuenta creada por la app nace como Administrador.
  users: [
    { id: 1, nombre: "Oscar Baldeón", correo: "oscarbaldeon@igualab.org", rol: "superadmin", estado: "Activo" },
    { id: 2, nombre: "María López", correo: "maria.lopez@igualab.org", rol: "administrador", estado: "Activo" },
    { id: 3, nombre: "Rosa Quispe", correo: "rosa.quispe@igualab.org", rol: "administrador", estado: "Activo" },
    { id: 4, nombre: "Diego Farfán", correo: "diego.farfan@igualab.org", rol: "administrador", estado: "Inactivo" }
  ],
  demoAccounts: {
    superadmin: { correo: "oscarbaldeon@igualab.org", nombre: "Oscar Baldeón" },
    administrador: { correo: "maria.lopez@igualab.org", nombre: "María López" }
  },

  // --- Empresas del catálogo (RN-035 / RF-052 / RF-053) ---------------------
  // Sólo nombre + sector; el ESG y el riesgo se derivan del análisis.
  empresas: [
    { id: "andina", nombre: "Minera Andina S.A.A.", sector: "Minería", activa: true },
    { id: "altiplano", nombre: "Minera Altiplano S.A.", sector: "Minería", activa: true },
    { id: "amazonica", nombre: "Petrolera Amazónica S.A.", sector: "Petróleo y Gas", activa: true },
    { id: "energialima", nombre: "Energía Lima S.A.C.", sector: "Energía", activa: true },
    { id: "gassur", nombre: "Gas del Sur S.A.A.", sector: "Petróleo y Gas", activa: true }
  ],

  // --- Catálogo GRI corporativo versionado (RNF-022) ------------------------
  // Referencia; el catálogo real corporativo tiene 40 códigos (RN-018).
  griCatalogo: [
    { codigo: "GRI 205", tema: "Anticorrupción" },
    { codigo: "GRI 302", tema: "Energía" },
    { codigo: "GRI 303", tema: "Agua y efluentes" },
    { codigo: "GRI 304", tema: "Biodiversidad" },
    { codigo: "GRI 305", tema: "Emisiones" },
    { codigo: "GRI 306", tema: "Residuos" },
    { codigo: "GRI 308", tema: "Evaluación ambiental de proveedores" },
    { codigo: "GRI 401", tema: "Empleo" },
    { codigo: "GRI 403", tema: "Seguridad y salud en el trabajo" },
    { codigo: "GRI 404", tema: "Formación y enseñanza" },
    { codigo: "GRI 413", tema: "Comunidades locales" }
  ],

  // --- Análisis persistido por empresa + año (RN-017 / RF-038 / RF-039) -----
  // Clave: "<empresaId>|<anio>". El estado GRI lo asigna manualmente el
  // Administrador (RN-016). La cita textual es la evidencia del documento (RN-022).
  // Las sanciones provienen sólo de los documentos ingestados (RN-015);
  // monto null => "no cuantificada" (RN-032 / RF-039).
  analisis: {
    "andina|2024": {
      evidencia: { gri: true, sanciones: true },
      gri: [
        { codigo: "GRI 401", tema: "Empleo", estado: "Sub-reportado", cita: "«Durante 2024 se realizaron 312 nuevas contrataciones» — no se reporta rotación ni desglose por género.", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 74" },
        { codigo: "GRI 413", tema: "Comunidades locales", estado: "Baja sustancia", cita: "«Se sostuvieron mesas de diálogo con comunidades del área de influencia» — sin indicadores de impacto ni acuerdos.", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 88" },
        { codigo: "GRI 306", tema: "Residuos", estado: "OK", cita: "«Se gestionaron 12,400 t de residuos con meta de reducción del 8% y trazabilidad por relave».", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 102" },
        { codigo: "GRI 305", tema: "Emisiones", estado: "Baja sustancia", cita: "«Las emisiones directas Scope 1 fueron 845,200 tCO₂e» — Scope 3 no reportado.", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 96" },
        { codigo: "GRI 303", tema: "Agua y efluentes", estado: "OK", cita: "«Recirculación del 71% del agua industrial con reporte de vertimientos autorizados».", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 99" }
      ],
      sanciones: [
        { entidad: "Ministerio de Trabajo (SUNAFIL)", motivo: "Observaciones en consulta previa a comunidades", monto: 4200000, cita: "«Pasivo contingente por procedimiento sancionador N.° 214-2024» — sección Pasivos contingentes.", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 142" },
        { entidad: "OEFA", motivo: "Incumplimiento de instrumentos de gestión ambiental", monto: null, cita: "«La empresa afronta un procedimiento de OEFA cuyo monto se encuentra en determinación».", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 143" }
      ]
    },
    "andina|2023": {
      evidencia: { gri: true, sanciones: true },
      gri: [
        { codigo: "GRI 401", tema: "Empleo", estado: "Sub-reportado", cita: "«Se incorporaron 280 colaboradores» — sin datos de rotación.", doc: "Memoria Anual 2023 - Minera Andina S.A.A.", pagina: "p. 68" },
        { codigo: "GRI 413", tema: "Comunidades locales", estado: "Sub-reportado", cita: "Mención genérica sin evidencia de programas comunitarios.", doc: "Memoria Anual 2023 - Minera Andina S.A.A.", pagina: "p. 80" },
        { codigo: "GRI 306", tema: "Residuos", estado: "Baja sustancia", cita: "«Se dispuso de residuos conforme a normativa» — sin metas.", doc: "Memoria Anual 2023 - Minera Andina S.A.A.", pagina: "p. 91" }
      ],
      sanciones: [
        { entidad: "OEFA", motivo: "Incumplimiento de instrumentos de gestión ambiental", monto: 1850000, cita: "«Resolución N.° 087-2023-OEFA/CD».", doc: "Memoria Anual 2023 - Minera Andina S.A.A.", pagina: "p. 138" }
      ]
    },
    "amazonica|2024": {
      evidencia: { gri: true, sanciones: true },
      gri: [
        { codigo: "GRI 305", tema: "Emisiones", estado: "Sub-reportado", cita: "«Se reportan emisiones de operaciones propias» — sin cadena de suministro (Scope 3).", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 41" },
        { codigo: "GRI 306", tema: "Residuos", estado: "Baja sustancia", cita: "«Gestión de lodos de perforación conforme a normativa» — sin volúmenes.", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 44" },
        { codigo: "GRI 304", tema: "Biodiversidad", estado: "OK", cita: "«Plan de manejo con línea base de biodiversidad y monitoreo trimestral en 3 lotes».", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 47" },
        { codigo: "GRI 413", tema: "Comunidades locales", estado: "Baja sustancia", cita: "«Acuerdos con comunidades nativas» — sin seguimiento de compromisos.", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 52" }
      ],
      sanciones: [
        { entidad: "OEFA", motivo: "Derrame no reportado oportunamente", monto: 3100000, cita: "«Multa firme por Res. N.° 145-2024-OEFA».", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 58" }
      ]
    },
    "energialima|2024": {
      evidencia: { gri: true, sanciones: true },
      gri: [
        { codigo: "GRI 302", tema: "Energía", estado: "OK", cita: "«35% de la generación provino de fuentes renovables, con meta a 50% al 2027».", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 62" },
        { codigo: "GRI 305", tema: "Emisiones", estado: "Sub-reportado", cita: "«Emisiones Scope 1 y 2 reportadas» — Scope 3 de la cadena de suministro omitido.", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 87" },
        { codigo: "GRI 308", tema: "Evaluación ambiental de proveedores", estado: "OK", cita: "«El 100% de proveedores críticos fue evaluado ambientalmente en 2024».", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 90" }
      ],
      sanciones: [
        { entidad: "Osinergmin", motivo: "Reporte de emisiones incompleto", monto: 640000, cita: "«Resolución de sanción por reporte parcial de emisiones».", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 120" }
      ]
    },
    "altiplano|2024": {
      evidencia: { gri: true, sanciones: false },
      gri: [
        { codigo: "GRI 403", tema: "Seguridad y salud en el trabajo", estado: "OK", cita: "«Índice de frecuencia de accidentes 1.2, con cobertura de contratistas».", doc: "Reporte de Sostenibilidad GRI 2024 - Minera Altiplano S.A.", pagina: "p. 33" },
        { codigo: "GRI 303", tema: "Agua y efluentes", estado: "Baja sustancia", cita: "«Uso responsable del agua» — sin volúmenes ni recirculación.", doc: "Reporte de Sostenibilidad GRI 2024 - Minera Altiplano S.A.", pagina: "p. 39" }
      ],
      sanciones: []
    }
  },

  // --- Documentos ingestados (RN-011 / RN-014 / RN-033) ---------------------
  // tipo ∈ {Memoria Anual, Reporte de Sostenibilidad GRI}. Sólo Markdown (RN-012).
  // estado ∈ {Éxito, En proceso, Rechazado} (RF-024).
  documents: [
    { id: "d1", empresaId: "andina", empresa: "Minera Andina S.A.A.", sector: "Minería", anio: 2024, tipo: "Memoria Anual", estado: "Éxito", fecha: "2026-08-20 10:14", cuenta: "Oscar Baldeón", hash: "9f2c…a41b", tamano: "4.2 MB" },
    { id: "d2", empresaId: "andina", empresa: "Minera Andina S.A.A.", sector: "Minería", anio: 2023, tipo: "Memoria Anual", estado: "Éxito", fecha: "2026-08-18 09:30", cuenta: "Oscar Baldeón", hash: "1a77…c093", tamano: "3.8 MB" },
    { id: "d3", empresaId: "amazonica", empresa: "Petrolera Amazónica S.A.", sector: "Petróleo y Gas", anio: 2024, tipo: "Reporte de Sostenibilidad GRI", estado: "Éxito", fecha: "2026-08-19 16:40", cuenta: "Oscar Baldeón", hash: "b3d1…7f22", tamano: "6.1 MB" },
    { id: "d4", empresaId: "energialima", empresa: "Energía Lima S.A.C.", sector: "Energía", anio: 2024, tipo: "Memoria Anual", estado: "Éxito", fecha: "2026-08-18 09:02", cuenta: "Oscar Baldeón", hash: "77ce…10ab", tamano: "3.9 MB" },
    { id: "d5", empresaId: "altiplano", empresa: "Minera Altiplano S.A.", sector: "Minería", anio: 2024, tipo: "Reporte de Sostenibilidad GRI", estado: "Éxito", fecha: "2026-08-15 11:31", cuenta: "Oscar Baldeón", hash: "5e90…dd12", tamano: "2.7 MB" }
  ],

  // --- Reportes de prospección generados (RN-024 / RN-026 inmutables) -------
  reports: [
    {
      id: "r1", empresaId: "andina", empresa: "Minera Andina S.A.A.", sector: "Minería", anio: 2024,
      generadoPor: "María López", fecha: "2026-08-21 12:03"
    }
  ],

  // --- Auditoría (RN-027 / RN-028 / RN-029 inmutable) -----------------------
  audit: [
    { id: 1, fecha: "2026-08-25 09:12", usuario: "Oscar Baldeón", tipo: "Inicio de sesión", accion: "Login exitoso (SuperAdmin)" },
    { id: 2, fecha: "2026-08-25 09:31", usuario: "Oscar Baldeón", tipo: "Ingesta de documento", accion: "Ingestó 'Memoria Anual 2024 - Minera Andina S.A.A.' (Minería · 2024)" },
    { id: 3, fecha: "2026-08-25 09:48", usuario: "Oscar Baldeón", tipo: "Rechazo de documento", accion: "Rechazó carga duplicada (misma empresa, tipo y año) — RN-033" },
    { id: 4, fecha: "2026-08-25 10:02", usuario: "Oscar Baldeón", tipo: "Cambio de rol", accion: "Deshabilitó la cuenta de Diego Farfán" },
    { id: 5, fecha: "2026-08-25 11:20", usuario: "María López", tipo: "Cambio de estado GRI", accion: "Asignó estado 'Baja sustancia' a GRI 305 · Minera Andina 2024" },
    { id: 6, fecha: "2026-08-25 11:44", usuario: "María López", tipo: "Generación de reporte", accion: "Generó reporte de prospección · Minera Andina S.A.A. (2024)" }
  ],

  // --- Contactos de prospección (apoyo comercial) ---------------------------
  contacts: {
    andina: [
      { nombre: "Carla Mendoza", cargo: "Gerente de Sostenibilidad" },
      { nombre: "Luis Farfán", cargo: "Gerente Financiero (CFO)" }
    ],
    amazonica: [
      { nombre: "Ricardo Salas", cargo: "Gerente de HSE" }
    ],
    energialima: [
      { nombre: "Valeria Campos", cargo: "Gerente Financiero (CFO)" }
    ]
  },
  horarios: ["Lun 26 · 09:00", "Lun 26 · 11:30", "Mar 27 · 15:00", "Mié 28 · 10:00", "Jue 29 · 16:30"],

  // --- Portal público (solo lectura) · i18n ---------------------------------
  i18n: {
    es: {
      heroTitle: "Consulta unificada de reportes de sostenibilidad y memorias anuales",
      heroSub: "Acceso público y gratuito a la información unificada de la Bolsa de Valores de Lima y reportes GRI. Solo lectura.",
      searchPlaceholder: "Buscar por empresa o documento...",
      resultsTitle: "Documentos disponibles",
      readMode: "Solo lectura",
      langLabel: "Idioma",
      noResults: "Sin resultados para tu búsqueda.",
      verDoc: "Ver documento",
      footer: "Plataforma pública de Igualab · Acceso de solo lectura · Sin funciones de prospección",
      publicPortal: "Portal Público",
      fase2: "Fase 2 · Próximamente",
      chatbotTitle: "Asistente de Citas Igualab",
      chatbotIntro: "¡Hola! Puedo ayudarte a agendar una cita con nuestro equipo. ¿Qué deseas hacer?",
      optAgendar: "Agendar una cita",
      optConsulta: "Hacer una consulta",
      consultaMsg: "Con gusto. Escríbenos a consultas@igualab.org y te responderemos en menos de 48 horas.",
      horariosTitle: "Estos son los horarios disponibles:",
      confirmar: "Confirmar",
      agendada: "¡Cita agendada! Te enviamos la confirmación a tu correo. 🎉"
    },
    en: {
      heroTitle: "Unified access to sustainability reports and annual reports",
      heroSub: "Free public access to unified information from the Lima Stock Exchange and GRI reports. Read-only.",
      searchPlaceholder: "Search by company or document...",
      resultsTitle: "Available documents",
      readMode: "Read-only",
      langLabel: "Language",
      noResults: "No results for your search.",
      verDoc: "View document",
      footer: "Igualab public platform · Read-only access · No prospecting features",
      publicPortal: "Public Portal",
      fase2: "Phase 2 · Coming soon",
      chatbotTitle: "Igualab Appointments Assistant",
      chatbotIntro: "Hi! I can help you schedule an appointment with our team. What would you like to do?",
      optAgendar: "Schedule an appointment",
      optConsulta: "Ask a question",
      consultaMsg: "Sure. Write to consultas@igualab.org and we will reply within 48 hours.",
      horariosTitle: "These are the available time slots:",
      confirmar: "Confirm",
      agendada: "Appointment scheduled! We sent the confirmation to your email. 🎉"
    },
    qu: {
      heroTitle: "Allin qawachikuy: sustentabilidad willakunaqa memorias anualespas",
      heroSub: "Lima Bolsa willakunata GRI willakunatapas huknachispa qhawanapaq. Mana qillqanapaq, qhawanallapaq.",
      searchPlaceholder: "Empresa utaq willakuy maskay...",
      resultsTitle: "Kachkasqa willakuna",
      readMode: "Qhawanallapaq",
      langLabel: "Simi",
      noResults: "Manam tarikunchu.",
      verDoc: "Willakuyta qhaway",
      footer: "Igualab plataforma pública · Qhawanallapaq · Mana prospección",
      publicPortal: "Portal Público",
      fase2: "Iskay ñisqa etapa · Qatipaq",
      chatbotTitle: "Igualab Cita Allichik",
      chatbotIntro: "¡Allillanchu! Cita churanapaq yanapayman. Ima munanki?",
      optAgendar: "Cita churay",
      optConsulta: "Tapukuy",
      consultaMsg: "Ari. consultas@igualab.org manaraq 48 oras qatiqachun.",
      horariosTitle: "Kaykunaqa churana punctos:",
      confirmar: "Takyachiy",
      agendada: "¡Cita churasqa! Correo nikiyta apachimuwaq. 🎉"
    }
  },

  // --- Respuestas simuladas del asistente RAG (RF-029 … RF-033) -------------
  // Fundamentadas sólo en el corpus (RN-021) y con trazabilidad (RN-022).
  chat: {
    sugerencias: [
      "¿Qué sanciones identificas para esta empresa y año?",
      "Señala las brechas GRI sub-reportadas",
      "Resume el desempeño ambiental del año consultado"
    ],
    respuestas: {
      sanciones: {
        texto: "En los documentos ingestados identifico una multa firme de <strong>OEFA por S/ 3.1M</strong> por un derrame no reportado oportunamente. La empresa reconoce el pasivo en su reporte, lo que constituye la principal vulnerabilidad reputacional y una oportunidad de acercamiento en gestión de crisis ambiental.",
        fuentes: [
          { cita: "[1]", doc: "Reporte de Sostenibilidad GRI 2024 - Petrolera Amazónica S.A.", pagina: "p. 58 · sección 'Cumplimiento ambiental'" }
        ]
      },
      brechas: {
        texto: "Según el análisis persistido, <strong>GRI 305 (Emisiones)</strong> figura como <strong>Sub-reportado</strong>: se declaran Scope 1 y 2 pero se omite el Scope 3 de la cadena de suministro. El resto de códigos evaluados presenta evidencia suficiente. Recomiendo abordar la huella de carbono ampliada como ángulo comercial.",
        fuentes: [
          { cita: "[1]", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 87 · sección 'Desempeño Ambiental'" }
        ]
      },
      resumen: {
        texto: "La empresa consultada reporta avances en energía renovable (35% de la matriz) pero mantiene su punto débil en <strong>GRI 305</strong> por el Scope 3 omitido. Existe además una sanción de <strong>Osinergmin por S/ 640K</strong> por reporte de emisiones incompleto.",
        fuentes: [
          { cita: "[1]", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 87" }
        ]
      },
      // RN-037: fuera de dominio (sostenibilidad / GRI / sanciones / corpus).
      fueraDominio: {
        texto: "Solo puedo responder consultas sobre <strong>sostenibilidad empresarial, indicadores GRI, sanciones económicas</strong> o el contenido de los documentos ingestados (RN-037). Reformula tu pregunta dentro de ese alcance.",
        fuentes: []
      },
      // RN-023 / RF-033: ausencia de información en el corpus.
      fallback: {
        texto: "No encuentro información suficiente en los documentos ingestados para responder con precisión, y no infiero datos no respaldados (RN-023). ¿Deseas consultar otra empresa, año o indicador del corpus?",
        fuentes: []
      }
    }
  }
};

// ============================================================================
//  Utilidades de dominio derivadas de los datos (no persistidas).
// ============================================================================
const Domain = (() => {
  function analisisKey(empresaId, anio) { return `${empresaId}|${anio}`; }

  function getAnalisis(empresaId, anio) {
    return DB.analisis[analisisKey(empresaId, anio)] || null;
  }

  // Años con análisis/documentos disponibles para una empresa.
  function aniosDeEmpresa(empresaId, state) {
    const docs = (state ? state.documents : DB.documents)
      .filter((d) => d.empresaId === empresaId && d.estado === "Éxito");
    return [...new Set(docs.map((d) => d.anio))].sort((a, b) => b - a);
  }

  // RF-036 / RN-020: empresas con al menos un documento ingestado con éxito.
  function empresasConDocumentos(state) {
    const s = state || App.state;
    const ids = new Set(s.documents.filter((d) => d.estado === "Éxito").map((d) => d.empresaId));
    return DB.empresas.filter((e) => ids.has(e.id));
  }

  // RN-034 / RF-051: puntaje ESG = promedio de estados GRI (OK=100, Baja=50, Sub=0).
  function esgScore(griArray) {
    if (!griArray || !griArray.length) return null;
    const suma = griArray.reduce((a, g) => a + (DB.esgPuntaje[g.estado] ?? 0), 0);
    return Math.round(suma / griArray.length);
  }

  function riesgoDesdeEsg(esg) {
    if (esg == null) return "Sin datos";
    if (esg >= 70) return "Bajo";
    if (esg >= 45) return "Medio";
    return "Alto";
  }

  // Conteo de brechas por estado (RF-041).
  function conteoEstados(griArray) {
    const c = { "OK": 0, "Baja sustancia": 0, "Sub-reportado": 0 };
    (griArray || []).forEach((g) => { if (c[g.estado] != null) c[g.estado]++; });
    return c;
  }

  // Resumen de sanciones: total cuantificado y número sin monto (RF-040).
  function resumenSanciones(sanciones) {
    const lista = sanciones || [];
    const cuantificadas = lista.filter((s) => s.monto != null);
    const total = cuantificadas.reduce((a, s) => a + s.monto, 0);
    const sinMonto = lista.length - cuantificadas.length;
    return { total, sinMonto, cuantificadas: cuantificadas.length, cantidad: lista.length };
  }

  return {
    analisisKey, getAnalisis, aniosDeEmpresa, empresasConDocumentos,
    esgScore, riesgoDesdeEsg, conteoEstados, resumenSanciones
  };
})();
