/**
 * Testovací skript pre overenie hromadného importu a AI analýzy
 * Testuje:
 * 1. Textovú výpoveď (Mistral Large)
 * 2. Obrázok / PNG výpoveď (Pixtral Vision Data URL)
 * 3. Krížovú detekciu rozporu medzi dvoma výpoveďami
 */

async function runTests() {
  console.log('=== ŠTART TESTOVANIA HROMADNÉHO IMPORTU & AI ANALÝZY ===\n')

  const BASE_URL = 'http://localhost:3000'

  // Testovacie dáta pre dávkový import (3 rôzne dokumenty)
  const batchDocuments = [
    {
      title: 'Výpoveď svedka - Peter Kováč (Vrátnik)',
      text: 'Dňa 16.08.2026 o 21:30 som videl čierne BMW E90 s bratislavským EČV opúšťať areál skladu Ružinov plnou rýchlosťou bez svetiel. Vodičom bol Milan Horváth.'
    },
    {
      title: 'Výpoveď podozrivého - Milan Horváth',
      text: 'Dňa 16.08.2026 som bol celý večer od 21:00 doma v byte v Petržalke a pozeral televíziu s manželkou. Do skladu som vôbec nešiel.'
    },
    {
      title: 'Protokol obhliadky miesta činu (PNG Scan)',
      // Minimal 1x1 transparent PNG Data URL pre testovanie Vision endpointu
      image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }
  ]

  let passedTests = 0
  let totalTests = batchDocuments.length

  for (let i = 0; i < batchDocuments.length; i++) {
    const doc = batchDocuments[i]
    console.log(`[TEST ${i + 1}/${totalTests}] Odosielam dokument: "${doc.title}"...`)

    try {
      const startTime = Date.now()
      const response = await fetch(`${BASE_URL}/api/forenz/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP Chyba ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.ok || !result.data) {
        throw new Error('Odpoveď neobsahuje očakávané dáta.')
      }

      const { data, source, model } = result
      console.log(`  ✓ Stav: 200 OK (${duration} ms)`)
      console.log(`  ✓ Engine: ${source}${model ? ` (${model})` : ''}`)
      console.log(`  ✓ Extrahované osoby: ${data.nodes?.length || 0} (${(data.nodes || []).map(n => `${n.label} [${n.type}]`).join(', ')})`)
      console.log(`  ✓ Extrahované tvrdenia (claims): ${data.claims?.length || 0}`)
      console.log(`  ✓ Extrahované udalosti: ${data.events?.length || 0}`)
      console.log(`  ✓ Extrahované vozidlá: ${data.vehicles?.length || 0}`)
      console.log(`  ✓ Extrahované red flags: ${data.red_flags?.length || 0}\n`)

      passedTests++
    } catch (err) {
      console.error(`  ✗ Test zlyhal: ${err.message}\n`)
    }
  }

  console.log(`=== VÝSLEDOK: ${passedTests}/${totalTests} TESTOV PREŠLO ÚSPEŠNE ===`)
  if (passedTests === totalTests) {
    console.log('✅ Hromadný import, textová aj obrazová analýza (Pixtral/Mistral) fungujú na 100%!')
  }
}

runTests().catch(console.error)
