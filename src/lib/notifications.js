const TIMERS = {}

export function hasNotificationSupport() {
  return 'Notification' in window
}

export async function requestNotificationPermission() {
  if (!hasNotificationSupport()) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function msUntilTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target - now
}

const MESSAGES = {
  creatine: [
    '💊 Hora da creatina! 5g agora — funciona igual nos dias de descanso.',
    '💊 Creatina! Consistência é o que separa resultados mediocres dos incríveis.',
    '💊 Tome sua creatina agora. Pequenos hábitos, grandes transformações.',
    '💊 5g de creatina. Todo dia. Sem falhar. Você sabe disso.',
  ],
  gym: [
    '🏋️ Academia te esperando! Você vai se arrepender de NÃO ir, nunca de ter ido.',
    '🏋️ Hora de treinar! Cada rep te coloca à frente de quem ficou no sofá.',
    '🏋️ Bora! O seu eu do futuro agradece cada série de hoje.',
    '🔥 Disciplina é fazer mesmo quando não está com vontade. Vai lá!',
    '💪 A dor de treinar é temporária. O resultado é permanente. Vamos!',
  ],
}

function getRandomMessage(type) {
  const list = MESSAGES[type]
  return list[Math.floor(Math.random() * list.length)]
}

export function scheduleNotification(type, timeStr) {
  cancelNotification(type)
  if (!hasNotificationSupport() || Notification.permission !== 'granted') return

  const fire = () => {
    try {
      new Notification('FORGEfit', {
        body: getRandomMessage(type),
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: type,
      })
    } catch { /* ignore */ }
    TIMERS[type] = setTimeout(fire, msUntilTime(timeStr))
  }

  TIMERS[type] = setTimeout(fire, msUntilTime(timeStr))
}

export function cancelNotification(type) {
  if (TIMERS[type]) {
    clearTimeout(TIMERS[type])
    delete TIMERS[type]
  }
}

export function initNotifications(settings) {
  if (!hasNotificationSupport() || Notification.permission !== 'granted') return

  if (settings.creatineNotification && settings.creatineTime) {
    scheduleNotification('creatine', settings.creatineTime)
  } else {
    cancelNotification('creatine')
  }

  if (settings.gymNotification && settings.gymTime) {
    scheduleNotification('gym', settings.gymTime)
  } else {
    cancelNotification('gym')
  }
}
