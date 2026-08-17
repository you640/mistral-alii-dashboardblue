import { defineStore } from 'pinia'
import { removeDiacritics, TYPE_COLOR } from '~/utils/forenzCore'
import type {
  ForenzDocument,
  Person,
  ForensicClaim,
  Contradiction,
  ForenzEvent,
  Relationship,
  RedFlag,
  FlaggedPassage,
  ForenzLocation,
  Vehicle,
  ActiveView
} from '~/types'

export interface ForenzState {
  documents: ForenzDocument[]
  selectedDocumentId: string | null
  persons: Person[]
  claims: ForensicClaim[]
  contradictions: Contradiction[]
  events: ForenzEvent[]
  relationships: Relationship[]
  redFlags: RedFlag[]
  flaggedPassages: FlaggedPassage[]
  locations: ForenzLocation[]
  vehicles: Vehicle[]
  loading: boolean
  error: string | null
  analysisProgress: number
  activeView: ActiveView
}

/**
 * Centrálny Pinia store pre forenznú analýzu.
 * Spravuje dokumenty, osoby, tvrdenia, rozpory, udalosti a vzťahy.
 */
export const useForenzStore = defineStore('forenz', {
  state: (): ForenzState => ({
    // === Dokumenty ===
    documents: [],
    selectedDocumentId: null,

    // === Extrahované entity ===
    persons: [],
    claims: [],
    contradictions: [],
    events: [],
    relationships: [],
    redFlags: [],
    flaggedPassages: [],
    locations: [],
    vehicles: [],

    // === UI stav ===
    loading: false,
    error: null,
    analysisProgress: 0,
    activeView: 'dashboard'
  }),

  getters: {
    // --- Dokumenty ---
    documentsByStatus: (state) => {
      const grouped: Record<string, ForenzDocument[]> = { pending: [], analyzing: [], done: [], error: [] }
      for (const doc of state.documents) {
        const status = doc.status || 'pending'
        if (grouped[status]) {
          grouped[status].push(doc)
        }
      }
      return grouped
    },

    pendingDocuments: (state) => state.documents.filter(d => d.status === 'pending'),
    analyzedDocuments: (state) => state.documents.filter(d => d.status === 'done'),
    errorDocuments: (state) => state.documents.filter(d => d.status === 'error'),

    selectedDocument: (state) => {
      if (!state.selectedDocumentId) return null
      return state.documents.find(d => d.id === state.selectedDocumentId) || null
    },

    // --- Osoby ---
    personsByType: (state) => {
      const grouped: Record<string, Person[]> = { podozrivý: [], svedok: [], obeť: [], alibi: [] }
      for (const p of state.persons) {
        const type = p.type || 'svedok'
        if (grouped[type]) {
          grouped[type].push(p)
        }
      }
      return grouped
    },

    suspects: (state) => state.persons.filter(p => p.type === 'podozrivý'),
    witnesses: (state) => state.persons.filter(p => p.type === 'svedok'),
    victims: (state) => state.persons.filter(p => p.type === 'obeť'),

    uniquePersons: (state) => {
      const seen = new Map<string, Person>()
      for (const p of state.persons) {
        const key = removeDiacritics(p.name || '')
        if (key && !seen.has(key)) {
          seen.set(key, p)
        }
      }
      return Array.from(seen.values())
    },

    // --- Rozpory ---
    totalContradictions: (state) => state.contradictions.length,
    confirmedContradictions: (state) => state.contradictions.filter(c => c.status === 'confirmed'),
    dismissedContradictions: (state) => state.contradictions.filter(c => c.status === 'dismissed'),
    possibleContradictions: (state) => state.contradictions.filter(c => c.status === 'possible'),

    highSeverityContradictions: (state) => state.contradictions.filter(c => c.severity === 'high'),

    contradictionsByType: (state) => {
      const grouped: Record<string, Contradiction[]> = {}
      for (const c of state.contradictions) {
        const type = c.type || 'unknown'
        if (!grouped[type]) grouped[type] = []
        grouped[type].push(c)
      }
      return grouped
    },

    // --- Štatistiky ---
    analysisStats: (state) => ({
      totalDocuments: state.documents.length,
      analyzedDocuments: state.documents.filter(d => d.status === 'done').length,
      totalPersons: state.persons.length,
      totalClaims: state.claims.length,
      totalContradictions: state.contradictions.length,
      confirmedContradictions: state.contradictions.filter(c => c.status === 'confirmed').length,
      totalEvents: state.events.length,
      totalRedFlags: state.redFlags.length,
      totalLocations: state.locations.length,
      totalVehicles: state.vehicles.length,
      highSeverityCount: state.contradictions.filter(c => c.severity === 'high').length
    }),

    // --- Vizuálne dáta pre graf ---
    graphNodes: (state) => {
      return state.persons.map(p => ({
        id: p.id || p.name,
        label: p.name,
        type: p.type || 'svedok',
        color: TYPE_COLOR[p.type] || '#3b82f6',
        details: p.details || '',
        document_id: p.document_id
      }))
    },

    graphEdges: (state) => {
      return state.relationships.map(r => ({
        source: r.source,
        target: r.target,
        label: r.label || r.type || '',
        time: r.time || '',
        description: r.description || ''
      }))
    },

    // --- Časová os ---
    timelineEvents: (state) => {
      return [...state.events]
        .filter(e => e.time || e.date)
        .sort((a, b) => {
          const dateCompare = (a.date || '').localeCompare(b.date || '')
          if (dateCompare !== 0) return dateCompare
          return (a.time || '').localeCompare(b.time || '')
        })
    }
  },

  actions: {
    // === Dokumenty ===
    addDocument(doc: Partial<ForenzDocument>): string {
      const id = doc.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const fullDoc: ForenzDocument = {
        title: doc.title || 'Nepomenovaný spis',
        id,
        status: doc.status || 'pending',
        person_count: doc.person_count || 0,
        relationship_count: doc.relationship_count || 0,
        red_flag_count: doc.red_flag_count || 0,
        attempt_count: doc.attempt_count || 1,
        summary: doc.summary,
        created_at: doc.created_at || new Date().toISOString()
      }
      this.documents.push(fullDoc)
      return id
    },

    updateDocumentStatus(docId: string, status: ForenzDocument['status'], data: Partial<ForenzDocument> = {}) {
      const idx = this.documents.findIndex(d => d.id === docId)
      if (idx === -1) return

      const current = this.documents[idx]
      if (current) {
        this.documents[idx] = {
          ...current,
          status,
          ...data,
          updated_at: new Date().toISOString()
        }
      }
    },

    removeDocument(docId: string) {
      this.documents = this.documents.filter(d => d.id !== docId)
      this.persons = this.persons.filter(p => p.document_id !== docId)
      this.claims = this.claims.filter(c => c.document_id !== docId)
      this.events = this.events.filter(e => e.document_id !== docId)
      this.redFlags = this.redFlags.filter(r => r.document_id !== docId)
      this.flaggedPassages = this.flaggedPassages.filter(f => f.document_id !== docId)
      this.locations = this.locations.filter(l => l.document_id !== docId)
      this.vehicles = this.vehicles.filter(v => v.document_id !== docId)
      this.relationships = this.relationships.filter(r => r.document_id !== docId)
      this.contradictions = this.contradictions.filter(c =>
        c.document_a_id !== docId && c.document_b_id !== docId
      )

      if (this.selectedDocumentId === docId) {
        this.selectedDocumentId = null
      }
    },

    selectDocument(docId: string | null) {
      this.selectedDocumentId = docId
    },

    // === Zlúčenie výsledkov analýzy ===
    mergeAnalysisResults(docId: string, results: any = {}) {
      const docTitle = this.documents.find(d => d.id === docId)?.title || ''

      // Osoby (nodes)
      if (results.nodes?.length) {
        for (const node of results.nodes) {
          this.persons.push({
            ...node,
            id: node.id || `person_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: node.label || node.name,
            document_id: docId,
            document_title: docTitle
          })
        }
      }

      // Vzťahy (edges)
      if (results.edges?.length) {
        for (const edge of results.edges) {
          this.relationships.push({
            ...edge,
            id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            document_id: docId
          })
        }
      }

      // Red flags
      if (results.red_flags?.length) {
        for (const flag of results.red_flags) {
          this.redFlags.push({
            text: typeof flag === 'string' ? flag : flag.text,
            document_id: docId,
            document_title: docTitle,
            id: `rf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Flagged passages
      if (results.flagged_passages?.length) {
        for (const fp of results.flagged_passages) {
          this.flaggedPassages.push({
            ...fp,
            document_id: docId,
            document_title: docTitle,
            id: `fp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Events
      if (results.events?.length) {
        for (const evt of results.events) {
          this.events.push({
            ...evt,
            document_id: docId,
            document_title: docTitle,
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Locations
      if (results.locations?.length) {
        for (const loc of results.locations) {
          this.locations.push({
            ...loc,
            document_id: docId,
            document_title: docTitle,
            id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Vehicles
      if (results.vehicles?.length) {
        for (const veh of results.vehicles) {
          this.vehicles.push({
            ...veh,
            document_id: docId,
            document_title: docTitle,
            id: `veh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Claims
      if (results.claims?.length) {
        for (const claim of results.claims) {
          this.claims.push({
            ...claim,
            document_id: docId,
            document_title: docTitle,
            id: `claim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          })
        }
      }

      // Aktualizuj dokument
      this.updateDocumentStatus(docId, 'done', {
        person_count: results.nodes?.length || 0,
        relationship_count: results.edges?.length || 0,
        red_flag_count: results.red_flags?.length || 0,
        processing_finished_at: new Date().toISOString()
      })
    },

    // === Rozpory ===
    addContradictions(newContradictions: Partial<Contradiction>[] = []) {
      for (const c of newContradictions) {
        this.contradictions.push({
          id: c.id || `contra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          claim_a_id: c.claim_a_id || '',
          claim_b_id: c.claim_b_id || '',
          document_a_id: c.document_a_id || '',
          document_b_id: c.document_b_id || '',
          entity_ref: c.entity_ref,
          type: c.type || 'factual_conflict',
          severity: c.severity || 'medium',
          confidence: c.confidence || 0.5,
          explanation: c.explanation,
          status: c.status || 'possible',
          document_id: c.document_id,
          document_title: c.document_title
        })
      }
    },

    setContradictionStatus(contradictionId: string, status: Contradiction['status']) {
      const idx = this.contradictions.findIndex(c => c.id === contradictionId)
      if (idx !== -1) {
        const current = this.contradictions[idx]
        if (current) {
          this.contradictions[idx] = {
            ...current,
            status
          }
        }
      }
    },

    // === UI ===
    setLoading(value: boolean) {
      this.loading = value
    },

    setError(error: string | null) {
      this.error = error
    },

    setAnalysisProgress(value: number) {
      this.analysisProgress = Math.min(100, Math.max(0, value))
    },

    setActiveView(view: ActiveView) {
      this.activeView = view
    },

    // === Reset ===
    clearAll() {
      this.documents = []
      this.persons = []
      this.claims = []
      this.contradictions = []
      this.events = []
      this.relationships = []
      this.redFlags = []
      this.flaggedPassages = []
      this.locations = []
      this.vehicles = []
      this.loading = false
      this.error = null
      this.analysisProgress = 0
      this.selectedDocumentId = null
    },

    // === Import / Export ===
    exportState() {
      return {
        documents: this.documents,
        persons: this.persons,
        claims: this.claims,
        contradictions: this.contradictions,
        events: this.events,
        relationships: this.relationships,
        redFlags: this.redFlags,
        flaggedPassages: this.flaggedPassages,
        locations: this.locations,
        vehicles: this.vehicles,
        exportedAt: new Date().toISOString()
      }
    },

    importState(data: any) {
      if (!data) return
      if (data.documents) this.documents = data.documents
      if (data.persons) this.persons = data.persons
      if (data.claims) this.claims = data.claims
      if (data.contradictions) this.contradictions = data.contradictions
      if (data.events) this.events = data.events
      if (data.relationships) this.relationships = data.relationships
      if (data.redFlags) this.redFlags = data.redFlags
      if (data.flaggedPassages) this.flaggedPassages = data.flaggedPassages
      if (data.locations) this.locations = data.locations
      if (data.vehicles) this.vehicles = data.vehicles
    },

    // === Persist do localStorage ===
    saveToLocalStorage() {
      if (typeof window === 'undefined') return
      try {
        const data = this.exportState()
        localStorage.setItem('forenz_store_backup', JSON.stringify(data))
      }
      catch (e) {
        console.warn('ForenzStore: Nepodarilo sa uložiť do localStorage', e)
      }
    },

    loadFromLocalStorage() {
      if (typeof window === 'undefined') return false
      try {
        const raw = localStorage.getItem('forenz_store_backup')
        if (!raw) return false
        const data = JSON.parse(raw)
        this.importState(data)
        return true
      }
      catch (e) {
        console.warn('ForenzStore: Nepodarilo sa načítať z localStorage', e)
        return false
      }
    }
  }
})
