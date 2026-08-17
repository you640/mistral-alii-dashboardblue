import { createClient } from '@base44/sdk'

const BACKUP_API_URL = 'https://vesper-63d7c4f2.base44.app/functions/alibiApi'
let clientInstance: any = null

export function useBase44Client() {
  const config = useRuntimeConfig()
  const activeEndpoint = ref<'primary' | 'backup'>('primary')

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

  /**
   * Univerzálne volanie s automatickým Failoverom na záložný server
   */
  async function callWithFailover(entityName: string, action: string, payload?: any): Promise<any> {
    // 1. Pokus cez Primárny Base44 SDK
    try {
      if (clientInstance?.entities?.[entityName]) {
        if (action === 'list') {
          return await clientInstance.entities[entityName].list(payload)
        } else if (action === 'create') {
          return await clientInstance.entities[entityName].create(payload)
        } else if (action === 'get') {
          return await clientInstance.entities[entityName].get(payload)
        } else if (action === 'update') {
          return await clientInstance.entities[entityName].update(payload.id, payload.data)
        }
      }
    } catch (primaryErr) {
      console.warn(`[Base44 Primary] Zlyhalo volanie pre ${entityName}.${action}, prepínam na záložný server:`, primaryErr)
      activeEndpoint.value = 'backup'
    }

    // 2. Automatický Failover na Záložný Base44 Server (vesper-63d7c4f2.base44.app)
    try {
      const response = await fetch(BACKUP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entity: entityName,
          action,
          payload
        })
      })

      if (response.ok) {
        activeEndpoint.value = 'backup'
        return await response.json()
      }
    } catch (backupErr) {
      console.error(`[Base44 Backup] Zlyhal aj záložný server pre ${entityName}:`, backupErr)
    }

    return null
  }

  // Pomocné metódy s integrovaným failoverom
  async function getContradictions(caseId?: string) {
    const res = await callWithFailover('Contradiction', 'list', caseId ? { case_id: caseId } : undefined)
    return res || []
  }

  async function getPersons(caseId?: string) {
    const res = await callWithFailover('Person', 'list', caseId ? { case_id: caseId } : undefined)
    return res || []
  }

  async function getTimelineEvents(caseId?: string) {
    const res = await callWithFailover('TimelineEvent', 'list', caseId ? { case_id: caseId } : undefined)
    return res || []
  }

  async function getForensicClaims(caseId?: string) {
    const res = await callWithFailover('ForensicClaim', 'list', caseId ? { case_id: caseId } : undefined)
    return res || []
  }

  async function getCaseDocuments(caseId?: string) {
    const res = await callWithFailover('CaseDocument', 'list', caseId ? { case_id: caseId } : undefined)
    return res || []
  }

  async function logAudit(caseId: string, action: string, description: string, actor: string = 'Vysetrovatel') {
    return await callWithFailover('AuditLog', 'create', {
      case_id: caseId,
      action,
      description,
      actor,
      timestamp: new Date().toISOString()
    })
  }

  async function listCases() {
    try {
      const response = await fetch(BACKUP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listCases' })
      })
      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('Zoznam prípadov zlyhal:', err)
    }
    return []
  }

  return {
    base44: clientInstance,
    activeEndpoint,
    backupUrl: BACKUP_API_URL,
    callWithFailover,
    getContradictions,
    getPersons,
    getTimelineEvents,
    getForensicClaims,
    getCaseDocuments,
    logAudit,
    listCases
  }
}
