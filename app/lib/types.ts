export interface SherlockMetadata {
  document_name: string
  language: 'sk' | 'cz' | 'en'
  page_count: number | null
  upload_date: string
}

export interface SherlockPerson {
  id: string
  name: string
  role: string
  description: string | null
  aliases: string[] | null
}

export interface SherlockEvidence {
  id: string
  type: 'document' | 'photo' | 'video' | 'testimony' | 'audio' | 'other'
  content: string
  source: string
  relevance_score: number
}

export interface SherlockRelationship {
  person1_id: string
  person2_id: string
  type: string
  description: string
  evidence_supporting: string[]
}

export interface SherlockTimelineEvent {
  id: string
  timestamp: string | null
  title: string
  description: string
  location: string | null
  persons_involved: string[]
  evidence_links: string[]
  tags: string[]
  source_text: string
  confidence: number
  approximate: boolean
}

export interface SherlockAnalysis {
  metadata: SherlockMetadata
  persons: SherlockPerson[]
  evidence: SherlockEvidence[]
  relationships: SherlockRelationship[]
  timeline: SherlockTimelineEvent[]
}
