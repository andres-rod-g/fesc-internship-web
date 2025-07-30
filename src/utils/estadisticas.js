export async function obtenerEstadisticas(db) {
  // 1. ESTADÍSTICAS GENERALES
  const totalPracticantes = await db.collection("practicantes").countDocuments();
  const totalEmpresas = await db.collection("empresas").countDocuments();

  // 2. ANÁLISIS DE ESTADOS DE PRACTICANTES
  const estadosPracticantes = await db.collection("practicantes").aggregate([
    {
      $group: {
        _id: "$estado",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // 3. REGISTROS POR MES (últimos 12 meses)
  const hace12Meses = new Date();
  hace12Meses.setMonth(hace12Meses.getMonth() - 12);

  const registrosPorMes = await db.collection("practicantes").aggregate([
    {
      $match: {
        _id: { $gte: hace12Meses }
      }
    },
    {
      $group: {
        _id: {
          año: { $year: "$_id" },
          mes: { $month: "$_id" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.año": 1, "_id.mes": 1 } }
  ]).toArray();

  // 4. DISTRIBUCIÓN POR PROGRAMAS ACADÉMICOS
  const programas = await db.collection("practicantes").aggregate([
    {
      $group: {
        _id: "$programa",
        total: { $sum: 1 },
        pendientes: { $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] } },
        revisando: { $sum: { $cond: [{ $eq: ["$estado", "revisando"] }, 1, 0] } },
        finalizados: { $sum: { $cond: [{ $eq: ["$estado", "finalizado"] }, 1, 0] } },
        rechazados: { $sum: { $cond: [{ $eq: ["$estado", "rechazado"] }, 1, 0] } }
      }
    },
    { $sort: { total: -1 } }
  ]).toArray();

  // 5. DISTRIBUCIÓN POR MODALIDAD
  const modalidades = await db.collection("practicantes").aggregate([
    { $unwind: "$modalidad" },
    {
      $group: {
        _id: "$modalidad",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();

  // 6. DISTRIBUCIÓN POR CICLO (Tecnólogo/Profesional)
  const ciclos = await db.collection("practicantes").aggregate([
    {
      $group: {
        _id: "$ciclo",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // 7. HERRAMIENTAS MÁS UTILIZADAS
  const herramientas = await db.collection("practicantes").aggregate([
    { $unwind: "$herramientas" },
    {
      $group: {
        _id: "$herramientas",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();

  // 8. ANÁLISIS DE EXPERIENCIA LABORAL
  const experienciaLaboral = await db.collection("practicantes").aggregate([
    {
      $project: {
        tieneExperiencia: { $gt: [{ $size: { $ifNull: ["$experiencia_laboral", []] } }, 0] }
      }
    },
    {
      $group: {
        _id: "$tieneExperiencia",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // 9. EMPRESAS TOP POR PRACTICANTES
  const empresasTop = await db.collection("empresas").aggregate([
    {
      $project: {
        nombre: 1,
        sector: 1,
        totalPracticantes: { $size: { $ifNull: ["$practicantes_asignados", []] } },
        practicantesActivos: {
          $size: {
            $filter: {
              input: { $ifNull: ["$practicantes_asignados", []] },
              cond: { $in: ["$$this.estado_practica", ["pendiente", "activo"]] }
            }
          }
        },
        practicantesCompletados: {
          $size: {
            $filter: {
              input: { $ifNull: ["$practicantes_asignados", []] },
              cond: { $eq: ["$$this.estado_practica", "completado"] }
            }
          }
        }
      }
    },
    { $sort: { totalPracticantes: -1 } },
    { $limit: 8 }
  ]).toArray();

  // 10. DISTRIBUCIÓN POR SECTORES EMPRESARIALES
  const sectores = await db.collection("empresas").aggregate([
    {
      $group: {
        _id: "$sector",
        empresas: { $sum: 1 },
        totalPracticantes: { $sum: { $size: { $ifNull: ["$practicantes_asignados", []] } } }
      }
    },
    { $sort: { totalPracticantes: -1 } }
  ]).toArray();

  // 11. ESTADOS DE PRÁCTICAS EN EMPRESAS
  const estadosPracticas = await db.collection("empresas").aggregate([
    { $unwind: "$practicantes_asignados" },
    {
      $group: {
        _id: "$practicantes_asignados.estado_practica",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // 12. ACTIVIDAD RECIENTE (últimos 30 días)
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const actividadReciente = await db.collection("practicantes").aggregate([
    {
      $match: {
        _id: { $gte: hace30Dias }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 }
      }
    }
  ]).toArray();

  return {
    totalPracticantes,
    totalEmpresas,
    estadosPracticantes,
    registrosPorMes,
    programas,
    modalidades,
    ciclos,
    herramientas,
    experienciaLaboral,
    empresasTop,
    sectores,
    estadosPracticas,
    actividadReciente
  };
}