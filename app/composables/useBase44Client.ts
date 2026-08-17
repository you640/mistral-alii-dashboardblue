import { createClient } from '@base44/sdk'

let clientInstance: any = null

export function useBase44Client() {
  const config = useRuntimeConfig()

  if (!clientInstance) {
    const appId = (typeof window !== 'undefined' && localStorage.getItem('base44_app_id'))
      || config.public.base44AppId
      || '6a81f5e7f4adbf6a9523b9d8'

    const apiKey = (typeof window !== 'undefined' && localStorage.getItem('base44_api_key'))
      || 'fafad43d1f2e4c0ea0724f2e33181a39'

    clientInstance = createClient({
      appId,
      headers: {
        api_key: apiKey
      }
    })
  }

  // Pomocné metódy pre jednoduchú synchronizáciu s Base44 entitami
  async function getContradictions(caseId?: string) {
    try {
      if (clientInstance?.entities?.Contradiction) {
        return await clientInstance.entities.Contradiction.list(caseId ? { case_id: caseId } : undefined)
      }
    } catch (err) {
      console.warn('Base44 list Contradiction zlyhalo:', err)
    }
    return []
  }

  async function getPersons(caseId?: string) {
    try {
      if (clientInstance?.entities?.Person) {
        return await clientInstance.entities.Person.list(caseId ? { case_id: caseId } : undefined)
      }
    } catch (err) {
      console.warn('Base44 list Person zlyhalo:', err)
    }
    return []
  }

  async function getTimelineEvents(caseId?: string) {
    try {
      if (clientInstance?.entities?.TimelineEvent) {
        return await clientInstance.entities.TimelineEvent.list(caseId ? { case_id: caseId } : undefined)
      }
    } catch (err) {
      console.warn('Base44 list TimelineEvent zlyhalo:', err)
    }
    return []
  }

  async function getForensicClaims(caseId?: string) {
    try {
      if (clientInstance?.entities?.ForensicClaim) {
        return await clientInstance.entities.ForensicClaim.list(caseId ? { case_id: caseId } : undefined)
      }
    } catch (err) {
      console.warn('Base44 list ForensicClaim zlyhalo:', err)
    }
    return []
  }

  async function logAudit(caseId: string, action: string, description: string, actor: string = 'Vysetrovatel') {
    try {
      if (clientInstance?.entities?.AuditLog) {
        return await clientInstance.entities.AuditLog.create({
          case_id: caseId,
          action,
          description,
          actor,
          timestamp: new Date().toISOString()
        })
      }
    } catch (err) {
      console.warn('Base44 create AuditLog zlyhalo:', err)
    }
  }

  return {
    base44: clientInstance,
    getContradictions,
    getPersons,
    getTimelineEvents,
    getForensicClaims,
    logAudit
  }
}
