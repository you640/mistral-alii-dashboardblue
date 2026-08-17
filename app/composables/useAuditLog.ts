export interface AuditLogEntry {
  id: string
  action: 'case_imported' | 'contradiction_detected' | 'contradiction_status_changed' | 'dossier_exported' | 'alibi_calculated'
  details: string
  timestamp: string
  user: string
}

export function useAuditLog() {
  const logs = ref<AuditLogEntry[]>([])

  function loadLogs() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('alibi_audit_logs')
        if (stored) {
          logs.value = JSON.parse(stored)
        }
      } catch (err) {
        console.error('Chyba načítania audit logu:', err)
      }
    }
  }

  function logAction(action: AuditLogEntry['action'], details: string) {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'Vysetrovatel'
    }

    logs.value.unshift(entry)
    if (logs.value.length > 200) {
      logs.value = logs.value.slice(0, 200)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('alibi_audit_logs', JSON.stringify(logs.value))
    }
  }

  function clearLogs() {
    logs.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alibi_audit_logs')
    }
  }

  onMounted(() => {
    loadLogs()
  })

  return {
    logs,
    logAction,
    clearLogs,
    loadLogs
  }
}
