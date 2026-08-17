import type { AvatarProps } from '@nuxt/ui'

// === Forenzné typy ===

export type PersonType = 'podozrivý' | 'svedok' | 'obeť' | 'alibi'

export type DocumentStatus = 'pending' | 'analyzing' | 'done' | 'error'

export type ContradictionType
  = | 'time_conflict'
    | 'location_conflict'
    | 'location_time_conflict'
    | 'factual_conflict'
    | 'identity_conflict'
    | 'event_participation_conflict'

export type Severity = 'high' | 'medium' | 'low'

export type ContradictionStatus = 'possible' | 'confirmed' | 'dismissed'

export interface ForenzDocument {
  id: string
  title: string
  image_url?: string
  status: DocumentStatus
  error?: string
  summary?: string
  person_count: number
  relationship_count: number
  red_flag_count: number
  processing_started_at?: string
  processing_finished_at?: string
  attempt_count: number
  source_kind?: 'upload' | 'pdf_container' | 'pdf_page'
  parent_document_id?: string
  page_number?: number
  page_count?: number
  created_at?: string
  updated_at?: string
}

export interface Person {
  id: string
  name: string
  type: PersonType
  details?: string
  document_id?: string
  document_title?: string
  pageRankScore?: number
  degree?: number
  isKeyHub?: boolean
  nodeRadius?: number
}

export interface ForensicClaim {
  id: string
  document_id?: string
  document_title?: string
  subject: string
  predicate: string
  object: string
  event_date?: string
  event_time?: string
  approximate_time?: boolean
  time_start?: string
  time_end?: string
  location?: string
  confidence: number
  source_quote?: string
}

export interface Contradiction {
  id: string
  claim_a_id: string
  claim_b_id: string
  document_a_id: string
  document_b_id: string
  entity_ref?: string
  type: ContradictionType
  severity: Severity
  confidence: number
  explanation?: string
  status: ContradictionStatus
  document_id?: string
  document_title?: string
}

export interface ForenzEvent {
  id: string
  document_id?: string
  document_title?: string
  title: string
  type?: string
  persons?: string[]
  date?: string
  time?: string
  approximate_time?: boolean
  time_start?: string
  time_end?: string
  location?: string
  description?: string
  source_quote?: string
  confidence: number
}

export interface Relationship {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  time?: string
  description?: string
  document_id?: string
}

export interface RedFlag {
  id: string
  text: string
  document_id?: string
  document_title?: string
}

export interface FlaggedPassage {
  id: string
  text: string
  category: 'neistota' | 'rozpor'
  explanation: string
  document_id?: string
  document_title?: string
}

export interface ForenzLocation {
  id: string
  name: string
  address?: string
  source_quote?: string
  confidence: number
  document_id?: string
  document_title?: string
}

export interface Vehicle {
  id: string
  type: string
  brand_model?: string
  color?: string
  license_plate?: string
  owner_name?: string
  source_quote?: string
  confidence: number
  document_id?: string
  document_title?: string
}

export type ActiveView = 'dashboard' | 'documents' | 'persons' | 'contradictions' | 'graph' | 'timeline'
