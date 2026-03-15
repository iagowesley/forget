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

    const prompt = `Você é um nutricionista esportivo especializado. Gere um plano alimentar semanal COMPLETO e DETALHADO em português brasileiro para a pessoa abaixo.

DADOS DO USUÁRIO:
- Nome: ${username || 'Usuário'}
- Sexo: ${genderLabel}
- Peso: ${weight_kg}kg
- Altura: ${height_cm}cm
${age ? `- Idade: ${age} anos` : ''}
${bmi ? `- IMC: ${bmi}` : ''}
- Nível de treino: ${expLabel}
- Modalidade: ${trainFocus}
- Objetivo(s): ${goalsLabels}

${isMultiGoal ? `CONTEXTO DOS OBJETIVOS COMBINADOS:
${goalsContext}

⚠️ O plano deve ser EQUILIBRADO entre todos os objetivos acima, priorizando estratégias que beneficiam múltiplos objetivos simultaneamente (ex: alta proteína, ciclagem de carboidratos, refeições pré/pós treino otimizadas).` : `CONTEXTO DO OBJETIVO:
${goalsContext}`}

GERE O SEGUINTE (seja ESPECÍFICO com gramas e porções):

## 📊 CÁLCULO DE MACROS DIÁRIOS
- Calorias totais (justifique com base nos objetivos)
- Proteínas (g e % das calorias)
- Carboidratos (g e % das calorias)
- Gorduras (g e % das calorias)
- Água (litros/dia)
${isMultiGoal ? '- Variação nos dias de treino vs. descanso (se aplicável para os objetivos)' : ''}

## 🍽️ CARDÁPIO SEMANAL (Segunda a Domingo)
Para cada dia da semana, escreva:
**[Dia da semana]** (Dia de treino / Descanso)
- ☀️ Café da manhã (com quantidades)
- 🥗 Almoço (com quantidades)
- 🍎 Lanche da tarde (com quantidades)
- 🌙 Jantar (com quantidades)
- 🌛 Ceia opcional (se necessário)

## ✅ ALIMENTOS PRIORIDADE
Liste os 10 melhores alimentos para ${isMultiGoal ? 'esses objetivos combinados' : 'o objetivo'}.

## ❌ ALIMENTOS A EVITAR
Liste os 5 alimentos que prejudicam ${isMultiGoal ? 'esses objetivos' : 'o objetivo'}.

## ⏰ TIMING DE REFEIÇÕES
- Horário ideal das refeições
- O que comer pré-treino (1h antes)
- O que comer pós-treino (até 30min depois)

## 💊 SUPLEMENTAÇÃO SUGERIDA
Liste suplementos relevantes com dosagem.

## 💡 DICAS IMPORTANTES
3-4 dicas específicas para ${isMultiGoal ? 'os objetivos combinados' : 'o objetivo'}.

Formate tudo de forma clara, use emojis para organização e seja prático e direto.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
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
