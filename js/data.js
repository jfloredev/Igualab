const DB = {
  users: [
    { id: 1, nombre: "Oscar Baldeón", correo: "oscarbaldeon@igualab.org", rol: "superadmin", estado: "Activo" },
    { id: 2, nombre: "María López", correo: "maria.lopez@igualab.org", rol: "administrador", estado: "Activo" },
    { id: 3, nombre: "Rosa Quispe", correo: "rosa.quispe@igualab.org", rol: "administrador", estado: "Activo" }
  ],
  roleLabels: {
    superadmin: "Superadmin",
    administrador: "Administrador"
  },
  demoAccounts: {
    superadmin: { correo: "oscarbaldeon@igualab.org", nombre: "Oscar Baldeón" },
    administrador: { correo: "maria.lopez@igualab.org", nombre: "María López" }
  },
  empresas: [
    { id: "andina", nombre: "Minera Andina S.A.A.", ticker: "MINAND", sector: "Minería", esg: 62, riesgo: "Alto" },
    { id: "bancosur", nombre: "Banco del Sur S.A.", ticker: "BANSUR", sector: "Banca", esg: 81, riesgo: "Bajo" },
    { id: "energialima", nombre: "Energía Lima S.A.C.", ticker: "ENLIMA", sector: "Energía", esg: 74, riesgo: "Medio" },
    { id: "pesquera", nombre: "Pesquera del Pacífico S.A.", ticker: "PESPAC", sector: "Pesca", esg: 58, riesgo: "Alto" }
  ],
  gri: {
    andina: [
      { codigo: "GRI 401", tema: "Empleo", estado: "Sub-reportado", detalle: "Solo declara contrataciones, sin rotación ni beneficios" },
      { codigo: "GRI 413", tema: "Comunidades locales", estado: "Baja sustancia", detalle: "Menciona consultas pero sin indicadores de impacto" },
      { codigo: "GRI 306", tema: "Residuos", estado: "OK", detalle: "Reporte completo con metas de reducción" }
    ],
    bancosur: [
      { codigo: "GRI 205", tema: "Anticorrupción", estado: "Baja sustancia", detalle: "Declara política sin casos ni capacitaciones" },
      { codigo: "GRI 404", tema: "Formación", estado: "OK", detalle: "Horas de capacitación completas" }
    ],
    energialima: [
      { codigo: "GRI 305", tema: "Emisiones", estado: "Sub-reportado", detalle: "Scope 3 omitido en cadena de suministro" },
      { codigo: "GRI 308", tema: "Proveedores ambientales", estado: "OK", detalle: "Evaluación anual declarada" }
    ],
    pesquera: [
      { codigo: "GRI 304", tema: "Biodiversidad", estado: "Sub-reportado", detalle: "Sin datos de bycatch ni áreas sensibles" },
      { codigo: "GRI 403", tema: "Seguridad laboral", estado: "Baja sustancia", detalle: "Tasa de accidentes sin cobertura de proveedores" }
    ]
  },
  sanciones: {
    andina: [
      { entidad: "Ministerio de Trabajo", motivo: "Consulta previa a comunidades", monto: 4200000, anio: 2024 },
      { entidad: "OEFA", motivo: "Incumplimiento de instrumentos de gestión ambiental", monto: 1850000, anio: 2023 }
    ],
    bancosur: [
      { entidad: "SBS", motivo: "Falta de reporte laboral oportuno", monto: 1100000, anio: 2024 }
    ],
    energialima: [
      { entidad: "Osinergmin", motivo: "Reporte de emisiones incompleto", monto: 640000, anio: 2024 }
    ],
    pesquera: [
      { entidad: "Producción (PRODUCE)", motivo: "Excedencia de cuota de pesca", monto: 2750000, anio: 2023 }
    ]
  },
  bolsa: {
    periodos: ["2023", "2024", "2025"],
    series: {
      andina: { precio: [12.4, 10.8, 13.2], emisiones: [845200, 810300, 792100], intensidad: [12.4, 11.8, 11.2] },
      bancosur: { precio: [8.9, 9.7, 10.5], emisiones: [210500, 202100, 198400], intensidad: [3.2, 3.0, 2.9] },
      energialima: { precio: [5.6, 6.1, 5.4], emisiones: [421000, 435600, 418900], intensidad: [6.8, 7.0, 6.6] },
      pesquera: { precio: [3.2, 2.8, 3.5], emisiones: [95800, 101200, 96400], intensidad: [4.1, 4.3, 4.0] }
    }
  },
  documents: [
    { id: "d1", nombre: "Memoria Anual 2024 - Minera Andina S.A.A.", tipo: "Memoria Anual", empresa: "Minera Andina S.A.A.", anio: 2024, sector: "Minería", fuente: "Bolsa de Valores de Lima", estado: "Disponible", fecha: "2026-08-20 10:14", tamano: "4.2 MB" },
    { id: "d2", nombre: "Reporte de Sostenibilidad GRI 2024 - Banco del Sur", tipo: "Reporte GRI", empresa: "Banco del Sur S.A.", anio: 2024, sector: "Banca", fuente: "Web corporativa", estado: "Disponible", fecha: "2026-08-19 16:40", tamano: "8.7 MB" },
    { id: "d3", nombre: "Memoria Anual 2024 - Energía Lima S.A.C.", tipo: "Memoria Anual", empresa: "Energía Lima S.A.C.", anio: 2024, sector: "Energía", fuente: "Bolsa de Valores de Lima", estado: "Disponible", fecha: "2026-08-18 09:02", tamano: "3.9 MB" },
    { id: "d4", nombre: "Reporte de Sostenibilidad 2023 - Pesquera del Pacífico", tipo: "Reporte GRI", empresa: "Pesquera del Pacífico S.A.", anio: 2023, sector: "Pesca", fuente: "Web corporativa", estado: "Disponible", fecha: "2026-08-15 11:31", tamano: "6.1 MB" },
    { id: "d5", nombre: "Métricas Industriales 2024 - Sector Minería (XLSX)", tipo: "Métricas", empresa: "Varias", anio: 2024, sector: "Minería", fuente: "Base Igualab", estado: "Disponible", fecha: "2026-08-12 14:22", tamano: "1.3 MB" }
  ],
  reports: [
    { id: "r1", nombre: "Prospección - Minera Andina S.A.A.", empresa: "Minera Andina S.A.A.", periodo: "2024", secciones: ["Brechas GRI", "Sanciones"], generadoPor: "María López", fecha: "2026-08-21 12:03" },
    { id: "r2", nombre: "Prospección - Banco del Sur S.A.", empresa: "Banco del Sur S.A.", periodo: "2024", secciones: ["Brechas GRI"], generadoPor: "María López", fecha: "2026-08-20 09:47" }
  ],
  audit: [
    { id: 1, fecha: "2026-08-25 09:12", usuario: "Oscar Baldeón", tipo: "Inicio de sesión", accion: "Login exitoso (Superadmin)" },
    { id: 2, fecha: "2026-08-25 09:31", usuario: "María López", tipo: "Ingesta de datos", accion: "Cargó 'Memoria Anual 2024 - Minera Andina S.A.A.'" },
    { id: 3, fecha: "2026-08-25 10:02", usuario: "Oscar Baldeón", tipo: "Cambio de rol", accion: "Revocó rol de Administrador a Rosa Quispe" },
    { id: 4, fecha: "2026-08-25 11:20", usuario: "María López", tipo: "Generación de reporte", accion: "Generó 'Prospección - Minera Andina S.A.A.'" },
    { id: 5, fecha: "2026-08-25 11:44", usuario: "Juan Pérez", tipo: "Descarga", accion: "Descargó 'Prospección - Banco del Sur S.A.'" },
    { id: 6, fecha: "2026-08-25 14:05", usuario: "Oscar Baldeón", tipo: "Configuración", accion: "Ajustó expiración de sesión a 30 minutos" }
  ],
  contacts: {
    andina: [
      { nombre: "Carla Mendoza", cargo: "Gerente de Sostenibilidad", empresa: "Minera Andina S.A.A." },
      { nombre: "Luis Farfán", cargo: "Gerente Financiero (CFO)", empresa: "Minera Andina S.A.A." },
      { nombre: "Ana Ríos", cargo: "Jefa de Asuntos Corporativos", empresa: "Minera Andina S.A.A." }
    ],
    bancosur: [
      { nombre: "Pedro Castillo V.", cargo: "Gerente de Sostenibilidad", empresa: "Banco del Sur S.A." },
      { nombre: "Gabriela Ortiz", cargo: "Gerente de Riesgos", empresa: "Banco del Sur S.A." }
    ],
    energialima: [
      { nombre: "Ricardo Salas", cargo: "Gerente de HSE", empresa: "Energía Lima S.A.C." },
      { nombre: "Valeria Campos", cargo: "Gerente Financiero (CFO)", empresa: "Energía Lima S.A.C." }
    ],
    pesquera: [
      { nombre: "Miguel Uribe", cargo: "Gerente de Cumplimiento", empresa: "Pesquera del Pacífico S.A." }
    ]
  },
  horarios: ["Lun 26 · 09:00", "Lun 26 · 11:30", "Mar 27 · 15:00", "Mié 28 · 10:00", "Jue 29 · 16:30"],
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
  chat: {
    sugerencias: [
      "¿Cuáles son los puntos débiles por sanciones de la Minera Andina?",
      "Señala brechas GRI de Banco del Sur",
      "Resume la memoria anual 2024 de Energía Lima"
    ],
    respuestas: {
      sanciones: {
        texto: "En la memoria anual 2024 de <strong>Minera Andina S.A.A.</strong> identifico dos hitos negativos: una multa del <strong>Ministerio de Trabajo por S/ 4.2M</strong> asociada a consulta previa con comunidades y un procedimiento <strong>OEFA por S/ 1.85M</strong> en 2023 por incumplimiento de instrumentos de gestión ambiental. Estos puntos son la principal vulnerabilidad reputacional de la empresa y representan una oportunidad para acercarnos como aliados estratégicos en gestión social.",
        fuentes: [
          { cita: "[1]", doc: "Memoria Anual 2024 - Minera Andina S.A.A.", pagina: "p. 142, sección 'Pasivos contingentes'" },
          { cita: "[2]", doc: "Resoluciones OEFA 2023", pagina: "Res. N° 087-2023-OEFA/CD" }
        ]
      },
      brechas: {
        texto: "Analizando el reporte de sostenibilidad de <strong>Banco del Sur S.A.</strong>, el estándar <strong>GRI 205 (Anticorrupción)</strong> presenta baja sustancia: declara la política pero no reporta casos ni horas de capacitación, y el <strong>GRI 404 (Formación)</strong> está bien cubierto. Recomiendo profundizar en gobernanza como ángulo comercial.",
        fuentes: [
          { cita: "[1]", doc: "Reporte de Sostenibilidad GRI 2024 - Banco del Sur", pagina: "p. 58, sección 'Ética y Cumplimiento'" }
        ]
      },
      resumen: {
        texto: "La <strong>Memoria Anual 2024 de Energía Lima S.A.C.</strong> reporta utilidad neta de S/ 312M y destaca su plan de transición energética. En sostenibilidad, su punto débil es <strong>GRI 305</strong>: el Scope 3 está omitido en la cadena de suministro. Hay además una sanción de <strong>Osinergmin por S/ 640K</strong> por reporte de emisiones incompleto.",
        fuentes: [
          { cita: "[1]", doc: "Memoria Anual 2024 - Energía Lima S.A.C.", pagina: "p. 87, sección 'Desempeño Ambiental'" }
        ]
      },
      fallback: {
        texto: "No encuentro información suficiente en los documentos ingestados para responder con precisión, y prefiero no inventar datos. ¿Deseas que busque en las memorias anuales de la Bolsa o en los reportes GRI disponibles?",
        fuentes: []
      }
    }
  }
};
