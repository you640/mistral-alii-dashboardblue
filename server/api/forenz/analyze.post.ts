import { defineEventHandler, readBody, createError } from 'h3'

const SYSTEM_PROMPT = `Si ForenzDetectiv AI — špecializovaný systém na forenznú analýzu výpovedí svedkov, obvinených a protokolov.
Tvojou úlohou je detailne analyzovať dodaný text alebo odfotený dokument a extrahovať kľúčové forenzné entity.

Zameriavaš sa na:
1. Extrakciu mien osôb a ich kategorizáciu (podozrivý, svedok, obeť, alibi).
2. Hľadanie časových údajov a ich priradenie k udalostiam a tvrdeniam.
3. Identifikáciu sémantických a časovo-priestorových rozporov.
4. Detekciu lingvistických znakov klamstva (zmeny v čase, vyhýbavosť).
5. Extrakciu atomických tvrdení (claims), udalostí, miest a vozidiel s presným dôkazným citátom.

Výstup MUSÍ byť VŽDY v čistom JSON formáte s touto presnou štruktúrou:
{
  "summary": "<krátky súhrn obsahu výpovede v 2-3 vetách>",
  "nodes": [
    {"id": "<unikátne_id_napr_p1>", "label": "<Meno Priezvisko>", "type": "podozrivý|svedok|obeť|alibi", "details": "<popis roly a kontextu z výpovede>"}
  ],
  "edges": [
    {"source": "<id_uzla>", "target": "<id_uzla>", "label": "<typ vzťahu>", "time": "<HH:MM alebo prázdne>", "description": "<citát alebo popis vzťahu>"}
  ],
  "red_flags": [
    "<konkrétna nezrovnalosť, časový nesúlad, lingvistika klamstva>"
  ],
  "flagged_passages": [
    {"text": "<presný doslovný citát>", "category": "neistota|rozpor", "explanation": "<prečo pasáž signalizuje problém>"}
  ],
  "events": [
    {"title": "<názov udalosti>", "type": "<typ: konflikt|stretnutie|cesta|čin>", "persons": ["<Meno>"], "date": "<YYYY-MM-DD alebo prázdne>", "time": "<HH:MM alebo prázdne>", "approximate_time": false, "location": "<miesto>", "description": "<popis>", "source_quote": "<presný citát>", "confidence": 0.9}
  ],
  "locations": [
    {"name": "<názov miesta>", "address": "<adresa>", "source_quote": "<presný citát>", "confidence": 0.9}
  ],
  "vehicles": [
    {"type": "<typ vozidla>", "brand_model": "<značka/model>", "color": "<farba>", "license_plate": "<EČV>", "owner_name": "<majiteľ>", "source_quote": "<citát>", "confidence": 0.9}
  ],
  "claims": [
    {"subject": "<osoba/objekt>", "predicate": "was_at|saw|had|owns|was_with|traveled_to", "object": "<hodnota/miesto>", "event_date": "<YYYY-MM-DD alebo prázdne>", "event_time": "<HH:MM alebo prázdne>", "approximate_time": false, "location": "<miesto>", "source_quote": "<doslovný citát>", "confidence": 0.9}
  ]
}

Pravidlá:
- Používaj výhradne slovenské názvy typov: podozrivý, svedok, obeť, alibi.
- Čas uvádzaj vo formáte HH:MM (24-hodinový). Ak čas nie je v texte, použi prázdny reťazec "".
- approximate_time = true iba ak text obsahuje "okolo", "približne", "asi", "cca".
- "source_quote" MUSÍ byť PRESNÝ doslovný citát z analyzovaného dokumentu. Nevymýšľaj údaje.
- Ak dokument neobsahuje daný typ informácie, vráť pre to pole prázdne pole [].
`

function cleanJsonOutput(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return cleaned.trim()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, image_url, title, apiKey: clientApiKey } = body || {}

  if (!text && !image_url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chýba text výpovede alebo obrázok dokumentu.'
    })
  }

  const apiKey = clientApiKey || process.env.MISTRAL_API_KEY || process.env.NUXT_MISTRAL_API_KEY

  // Ak je dodaný Mistral API kľúč, vykonaj reálne AI volanie
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const isVision = !!image_url && image_url.startsWith('data:')
      const model = isVision ? 'pixtral-12b-2409' : 'mistral-large-latest'

      const userContent = isVision
        ? [
            { type: 'text', text: `Analyzuj túto odfotenú výpoveď s názvom "${title || 'Výpoveď'}" a vráť štruktúrovaný JSON.` },
            { type: 'image_url', image_url: { url: image_url } }
          ]
        : `Analyzuj nasledujúcu výpoveď s názvom "${title || 'Výpoveď'}":\n\n${text}`

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('Mistral API error:', response.status, errorText)
        throw new Error(`Mistral API chyba (${response.status}): ${errorText.slice(0, 150)}`)
      }

      const aiData = await response.json()
      const rawContent = aiData.choices?.[0]?.message?.content || '{}'
      const parsed = JSON.parse(cleanJsonOutput(rawContent))

      return {
        ok: true,
        source: 'mistral_ai',
        model,
        data: parsed
      }
    } catch (err: any) {
      console.warn('AI analysis fallback due to error:', err.message)
      // Pokračuj na inteligentný heuristický fallback ak API zlyhá
    }
  }

  // === Inteligentný lokálny deterministický parser (Fallback / Offline režim) ===
  const rawText = String(text || '')
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

  // Detekcia mien a rolí s explicitnými typmi
  const nodes: Array<{ id: string, label: string, type: string, details: string }> = []
  const claims: Array<{ subject: string, predicate: string, object: string, event_date: string, event_time: string, approximate_time: boolean, location: string, source_quote: string, confidence: number }> = []
  const events: Array<{ title: string, type: string, persons: string[], time: string, date: string, description: string, source_quote: string, confidence: number }> = []
  const red_flags: string[] = []
  const locations: Array<{ name: string, address?: string, source_quote: string, confidence: number }> = []
  const vehicles: Array<{ type: string, brand_model: string, color: string, source_quote: string, confidence: number }> = []

  // Extrakcia času HH:MM
  const timeMatches = rawText.matchAll(/(\b[0-2]?[0-9][:.][0-5][0-9]\b)/g)
  const foundTimes = Array.from(timeMatches).map((m) => {
    const matched = m[1] ?? ''
    return matched.replace('.', ':').padStart(5, '0')
  })

  // Základná extrakcia mena z titulku
  const titleNameMatch = (title || '').match(/(?:svedka|podozrivého|obvineného|obete)\s*[-–:]*\s*([A-ZÁČĎÉÍĽĹŇÓŠŤÚÝŽ][a-záčďéíľĺňóšťúýž]+\s+[A-ZÁČĎÉÍĽĹŇÓŠŤÚÝŽ][a-záčďéíľĺňóšťúýž]+)/i)
  const primaryName = (titleNameMatch && titleNameMatch[1]) ? titleNameMatch[1] : 'Svedok'

  let primaryType = 'svedok'
  if (/podozriv|obvinen/i.test(title || rawText)) primaryType = 'podozrivý'
  else if (/obeť|poškoden/i.test(title || rawText)) primaryType = 'obeť'
  else if (/alibi/i.test(title || rawText)) primaryType = 'alibi'

  nodes.push({
    id: `node_${Date.now()}_1`,
    label: primaryName,
    type: primaryType,
    details: `Osoba identifikovaná z výpovede "${title || 'Nezaradený spis'}".`
  })

  // Detekcia vozidiel
  if (/bmw|audi|mercedes|škoda|skoda|volkswagen|auto|vozidlo/i.test(rawText)) {
    const vMatch = rawText.match(/(?:čierne|biele|modré|červené|strieborné)?\s*(bmw|audi|mercedes|škoda|skoda|volkswagen|auto)/i)
    vehicles.push({
      type: 'Osobné auto',
      brand_model: vMatch ? vMatch[0] : 'Osobné motorové vozidlo',
      color: /čiern/i.test(rawText) ? 'čierna' : /biel/i.test(rawText) ? 'biela' : /modr/i.test(rawText) ? 'modrá' : '',
      source_quote: lines[0] || 'Vozidlo spomenuté vo výpovedi',
      confidence: 0.8
    })
  }

  // Vytvorenie claimov z časových údajov
  if (foundTimes.length > 0) {
    foundTimes.forEach((time) => {
      claims.push({
        subject: primaryName,
        predicate: 'was_at',
        object: 'Uvedená lokalita / pobyt',
        event_date: new Date().toISOString().slice(0, 10),
        event_time: time,
        approximate_time: /okolo|asi|približne/i.test(rawText),
        location: 'Lokalita z výpovede',
        source_quote: lines.find(l => l.includes(time)) || `Záznam o čase ${time}`,
        confidence: 0.85
      })

      events.push({
        title: `Udalosť o ${time}`,
        type: 'výpoveď',
        persons: [primaryName],
        time,
        date: new Date().toISOString().slice(0, 10),
        description: `Časový záznam extrahovaný z textu výpovede.`,
        source_quote: lines.find(l => l.includes(time)) || '',
        confidence: 0.8
      })
    })
  }

  if (rawText.length > 200 && !foundTimes.length) {
    red_flags.push('Výpoveď neobsahuje žiadne konkrétne časové údaje (riziko neoveriteľnosti alibi).')
  }

  return {
    ok: true,
    source: 'local_heuristic_engine',
    data: {
      summary: rawText.slice(0, 250) + (rawText.length > 250 ? '...' : ''),
      nodes,
      edges: [],
      red_flags,
      flagged_passages: [],
      events,
      locations,
      vehicles,
      claims
    }
  }
})
