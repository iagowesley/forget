// Body weight ratios for each exercise
// barbell: total weight on bar
// dumbbell: weight per hand
// machine: stack weight
// bodyweight: no external load

export const EXERCISE_META = {
  ex_push_a_01: { ratio: 0.50, unit: 'barbell' },   // Supino Reto c/ Barra
  ex_push_a_02: { ratio: 0.16, unit: 'dumbbell' },  // Supino Inclinado c/ Halteres (per hand)
  ex_push_a_03: { ratio: 0.10, unit: 'machine' },   // Crucifixo c/ Cabos (per side)
  ex_push_a_04: { ratio: 0.14, unit: 'dumbbell' },  // Desenvolvimento c/ Halteres (per hand)
  ex_push_a_05: { ratio: 0.05, unit: 'dumbbell' },  // Elevação Lateral (per hand)
  ex_push_a_06: { ratio: 0.20, unit: 'machine' },   // Tríceps Corda (stack)

  ex_pull_a_01: { ratio: 0,    unit: 'bodyweight' }, // Barra Fixa
  ex_pull_a_02: { ratio: 0.50, unit: 'barbell' },   // Remada Curvada c/ Barra
  ex_pull_a_03: { ratio: 0.55, unit: 'machine' },   // Pulldown na Polia
  ex_pull_a_04: { ratio: 0.22, unit: 'barbell' },   // Rosca Direta c/ Barra
  ex_pull_a_05: { ratio: 0.09, unit: 'dumbbell' },  // Rosca Martelo (per hand)
  ex_pull_a_06: { ratio: 0.70, unit: 'barbell' },   // Encolhimento c/ Barra

  ex_legs_a_01: { ratio: 0.75, unit: 'barbell' },   // Agachamento Livre
  ex_legs_a_02: { ratio: 1.50, unit: 'machine' },   // Leg Press 45°
  ex_legs_a_03: { ratio: 0.45, unit: 'machine' },   // Cadeira Extensora
  ex_legs_a_04: { ratio: 0.12, unit: 'dumbbell' },  // Avanço c/ Halteres (per hand)
  ex_legs_a_05: { ratio: 0.80, unit: 'machine' },   // Panturrilha em Pé
  ex_legs_a_06: { ratio: 0,    unit: 'bodyweight' }, // Abdominais

  ex_push_b_01: { ratio: 0.35, unit: 'barbell' },   // Desenvolvimento c/ Barra (OHP)
  ex_push_b_02: { ratio: 0.05, unit: 'dumbbell' },  // Elevação Lateral c/ Halteres
  ex_push_b_03: { ratio: 0.06, unit: 'dumbbell' },  // Elevação Frontal
  ex_push_b_04: { ratio: 0.45, unit: 'barbell' },   // Supino Inclinado c/ Barra
  ex_push_b_05: { ratio: 0,    unit: 'bodyweight' }, // Mergulho nas Paralelas
  ex_push_b_06: { ratio: 0.18, unit: 'barbell' },   // Tríceps Francês (EZ bar)

  ex_pull_b_01: { ratio: 0.25, unit: 'dumbbell' },  // Remada Unilateral c/ Halter
  ex_pull_b_02: { ratio: 0.45, unit: 'machine' },   // Remada Baixa na Polia
  ex_pull_b_03: { ratio: 0.55, unit: 'machine' },   // Puxada Aberta na Polia
  ex_pull_b_04: { ratio: 0.09, unit: 'dumbbell' },  // Rosca Concentrada
  ex_pull_b_05: { ratio: 0.18, unit: 'barbell' },   // Rosca 21
  ex_pull_b_06: { ratio: 0.18, unit: 'dumbbell' },  // Encolhimento c/ Halteres

  // ── Exercícios femininos ────────────────────────────────────────────────
  // Inferior A (Segunda)
  ex_f_lower_a_01: { ratio: 0.60, unit: 'barbell' },  // Agachamento Livre
  ex_f_lower_a_02: { ratio: 1.20, unit: 'machine' },  // Leg Press 45°
  ex_f_lower_a_03: { ratio: 0.45, unit: 'barbell' },  // Hip Thrust
  ex_f_lower_a_04: { ratio: 0.35, unit: 'machine' },  // Cadeira Extensora
  ex_f_lower_a_05: { ratio: 0.20, unit: 'machine' },  // Abdução de Quadril
  ex_f_lower_a_06: { ratio: 0.60, unit: 'machine' },  // Panturrilha

  // Superiores A (Terça)
  ex_f_upper_a_01: { ratio: 0.13, unit: 'dumbbell' }, // Supino c/ Halteres (por mão)
  ex_f_upper_a_02: { ratio: 0.35, unit: 'barbell' },  // Remada Curvada
  ex_f_upper_a_03: { ratio: 0.40, unit: 'machine' },  // Pulldown na Polia
  ex_f_upper_a_04: { ratio: 0.08, unit: 'dumbbell' }, // Desenvolvimento c/ Halteres (por mão)
  ex_f_upper_a_05: { ratio: 0.07, unit: 'dumbbell' }, // Rosca Alternada (por mão)
  ex_f_upper_a_06: { ratio: 0.15, unit: 'machine' },  // Tríceps Corda

  // Inferior B (Quarta)
  ex_f_lower_b_01: { ratio: 0.50, unit: 'barbell' },  // Hip Thrust (força)
  ex_f_lower_b_02: { ratio: 0.20, unit: 'dumbbell' }, // Stiff c/ Halteres (por mão)
  ex_f_lower_b_03: { ratio: 0.25, unit: 'machine' },  // Mesa Flexora
  ex_f_lower_b_04: { ratio: 0.09, unit: 'dumbbell' }, // Avanço (por mão)
  ex_f_lower_b_05: { ratio: 0.20, unit: 'machine' },  // Cadeira Abdutora
  ex_f_lower_b_06: { ratio: 0,    unit: 'bodyweight'},// Elevação Pélvica

  // Superiores B (Quinta)
  ex_f_upper_b_01: { ratio: 0.14, unit: 'dumbbell' }, // Supino Inclinado c/ Halteres (por mão)
  ex_f_upper_b_02: { ratio: 0.18, unit: 'dumbbell' }, // Remada Unilateral (por mão)
  ex_f_upper_b_03: { ratio: 0.40, unit: 'machine' },  // Puxada Aberta
  ex_f_upper_b_04: { ratio: 0.04, unit: 'dumbbell' }, // Elevação Lateral (por mão)
  ex_f_upper_b_05: { ratio: 0.07, unit: 'dumbbell' }, // Rosca Martelo (por mão)
  ex_f_upper_b_06: { ratio: 0.08, unit: 'dumbbell' }, // Tríceps Francês (por mão)

  // Inferior C (Sexta)
  ex_f_lower_c_01: { ratio: 0.40, unit: 'barbell' },  // Agachamento Sumô (halter único = total)
  ex_f_lower_c_02: { ratio: 0.45, unit: 'barbell' },  // Hip Thrust
  ex_f_lower_c_03: { ratio: 0.09, unit: 'dumbbell' }, // Avanço Reverso (por mão)
  ex_f_lower_c_04: { ratio: 0.35, unit: 'machine' },  // Cadeira Extensora
  ex_f_lower_c_05: { ratio: 0.12, unit: 'machine' },  // Abdução em Pé (cabo)
  ex_f_lower_c_06: { ratio: 0,    unit: 'bodyweight'},// Abdominais
}

const EXPERIENCE_MULTIPLIERS = {
  beginner: 0.65,
  intermediate: 1.0,
  advanced: 1.35,
}

function roundToPlate(kg) {
  if (!kg || kg <= 0) return null
  return Math.max(2.5, Math.round(kg / 2.5) * 2.5)
}

export function generateStartingWeights(weightKg, experience = 'intermediate') {
  const multiplier = EXPERIENCE_MULTIPLIERS[experience] ?? 1.0
  const result = {}

  for (const [exerciseId, meta] of Object.entries(EXERCISE_META)) {
    if (meta.unit === 'bodyweight' || meta.ratio === 0) {
      result[exerciseId] = null
    } else {
      result[exerciseId] = roundToPlate(weightKg * meta.ratio * multiplier)
    }
  }

  return result
}

export function getUnitLabel(exerciseId) {
  const meta = EXERCISE_META[exerciseId]
  if (!meta) return ''
  switch (meta.unit) {
    case 'dumbbell': return 'kg cada'
    case 'bodyweight': return 'peso corporal'
    default: return 'kg'
  }
}

// Main compound lifts to show in preview
export const PREVIEW_EXERCISES = [
  { id: 'ex_legs_a_01', name: 'Agachamento Livre' },
  { id: 'ex_push_a_01', name: 'Supino Reto' },
  { id: 'ex_push_b_01', name: 'Desenvolvimento (OHP)' },
  { id: 'ex_pull_a_02', name: 'Remada Curvada' },
  { id: 'ex_pull_a_03', name: 'Puxada / Pulldown' },
]

export const FEMALE_PREVIEW_EXERCISES = [
  { id: 'ex_f_lower_a_01', name: 'Agachamento Livre' },
  { id: 'ex_f_lower_a_03', name: 'Hip Thrust' },
  { id: 'ex_f_lower_b_02', name: 'Stiff com Halteres (RDL)' },
  { id: 'ex_f_upper_a_02', name: 'Remada Curvada' },
  { id: 'ex_f_upper_a_03', name: 'Puxada / Pulldown' },
]

export function getPreviewExercises(gender) {
  return gender === 'female' ? FEMALE_PREVIEW_EXERCISES : PREVIEW_EXERCISES
}
