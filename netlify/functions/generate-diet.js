exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { profile, goals } = JSON.parse(event.body)
    const { username, weight_kg, height_cm, birth_year, gender, experience } = profile

    const age = birth_year ? new Date().getFullYear() - birth_year : null
    const bmi = (height_cm && weight_kg) ? (weight_kg / Math.pow(height_cm / 100, 2)).toFixed(1) : null

    const genderLabel = gender === 'female' ? 'Feminino' : 'Masculino'
    const expLabel = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }[experience] || 'Intermediário'

    const GOAL_LABELS = {
      lose_fat:      'Perda de Gordura (Definição)',
      gain_muscle:   'Ganho de Massa Muscular',
      recomposition: 'Recomposição Corporal',
      maintain:      'Manutenção',
    }
    const GOAL_CONTEXT = {
      lose_fat:      'déficit calórico moderado (~300–500 kcal abaixo do TDEE), preservar massa magra, alto teor proteico',
      gain_muscle:   'superávit calórico controlado (~250–400 kcal acima do TDEE), maximizar síntese proteica e hipertrofia',
      recomposition: 'calorias próximas ao TDEE, ciclagem de carboidratos (mais carbs no dia de treino), proteína alta',
      maintain:      'calorias no TDEE, equilíbrio entre todos os macros, qualidade alimentar em foco',
    }

    const goalsList = (Array.isArray(goals) ? goals : [goals]).filter(Boolean)
    const goalsLabels = goalsList.map(id => GOAL_LABELS[id] || id).join(', ')
    const goalsContext = goalsList.map(id => `• ${GOAL_LABELS[id] || id}: ${GOAL_CONTEXT[id] || ''}`).join('\n')
    const isMultiGoal = goalsList.length > 1

    const trainFocus = gender === 'female'
      ? 'Treino feminino com foco em glúteo, posterior e quadríceps (inferior 3x semana + superiores 2x)'
      : 'Treino PPL — Push/Pull/Legs (5x semana, hipertrofia e força)'

    const prompt = `Você é nutricionista esportivo. Crie um plano alimentar em português para:

- ${genderLabel}, ${weight_kg}kg, ${height_cm}cm${age ? `, ${age} anos` : ''}${bmi ? `, IMC ${bmi}` : ''}
- Nível: ${expLabel} | ${trainFocus}
- Objetivo(s): ${goalsLabels}
${isMultiGoal ? `\n${goalsContext}\n\nEquilibre o plano entre todos os objetivos.` : ''}

## 📊 MACROS DIÁRIOS
Calorias, proteínas (g), carboidratos (g), gorduras (g), água (L).${isMultiGoal ? ' Variação treino vs descanso.' : ''}

## 🍽️ CARDÁPIO (3 dias modelo: Treino A, Treino B, Descanso)
Para cada dia: café da manhã, almoço, lanche, jantar (com quantidades em gramas).

## ✅ TOP 8 ALIMENTOS para o objetivo
## ❌ TOP 5 ALIMENTOS A EVITAR

## ⏰ TIMING: pré-treino e pós-treino ideais

## 💊 SUPLEMENTOS com dosagem

## 💡 3 DICAS PRÁTICAS

Seja direto, use emojis, especifique gramas/porções.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, headers, body: JSON.stringify({ error: err }) }
    }

    const data = await response.json()
    const diet = data.content[0].text

    return { statusCode: 200, headers, body: JSON.stringify({ diet }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
