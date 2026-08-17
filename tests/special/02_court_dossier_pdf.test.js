import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contradictionsToCsv, createPlaceholderPng2k } from '../../src/lib/courtDossier.js'
import { buildZipStore } from '../../src/lib/zipStore.js'
import { exportForensicCasePdf } from '../../src/lib/pdfExporter.js'

test('🏛️ [ŠPECIÁLNY TEST 2] Export Súdneho Dossier, CSV & PDF', async (t) => {
  await t.test('2.1 Export rozporov do Excel CSV tabuľky (UTF-8 BOM, bodkočiarka)', () => {
    const sampleContradictions = [
      {
        id: 'contra_001',
        type: 'location_time_conflict',
        severity: 'high',
        entity_ref: 'Milan Horváth',
        status: 'confirmed',
        confidence: 0.95,
        explanation: 'Tvrdil, že bol doma; videný pri sklade o 21:30.',
        document_title: 'Výpoveď svedka',
        quoteA: 'Bol som doma.',
        quoteB: 'Videl som ho odchádzať.'
      }
    ]

    const csvOutput = contradictionsToCsv(sampleContradictions)

    // Overenie UTF-8 BOM
    assert.equal(csvOutput.charCodeAt(0), 0xFEFF, 'CSV musí začínať UTF-8 BOM značkou pre správne otvorenie v Exceli')
    // Overenie oddeľovača (bodkočiarka pre SK/EU locale)
    assert.ok(csvOutput.includes(';'), 'CSV musí používať bodkočiarku ako oddeľovač stĺpcov')
    assert.ok(csvOutput.includes('Milan Horváth'), 'CSV musí obsahovať meno subjektu')
    assert.ok(csvOutput.includes('location_time_conflict'), 'CSV musí obsahovať typ rozporu')
  })

  await t.test('2.2 Generovanie 2K PNG grafu', () => {
    const pngBytes = createPlaceholderPng2k('Pavučina Vzťahov Kauza Sklad')
    assert.ok(pngBytes instanceof Uint8Array, 'Výstup musí byť Uint8Array')
    assert.ok(pngBytes.length > 50, 'PNG súbor musí mať platnú veľkosť')
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    assert.equal(pngBytes[0], 0x89)
    assert.equal(pngBytes[1], 0x50)
    assert.equal(pngBytes[2], 0x4E)
    assert.equal(pngBytes[3], 0x47)
  })

  await t.test('2.3 Generovanie ZIP súdneho archívu', () => {
    const testFiles = [
      { name: 'audit_log.json', data: new TextEncoder().encode(JSON.stringify({ status: 'ok', timestamp: Date.now() })) },
      { name: 'rozpory.csv', data: new TextEncoder().encode('ID;Typ;Subjekt\n1;time;Milan') }
    ]

    const zipBytes = buildZipStore(testFiles)
    assert.ok(zipBytes instanceof Uint8Array, 'ZIP výstup musí byť Uint8Array')
    assert.ok(zipBytes.length > 100, 'ZIP musí obsahovať zabalené súbory')
    // ZIP magic bytes: PK (0x50 0x4B 0x03 0x04)
    assert.equal(zipBytes[0], 0x50)
    assert.equal(zipBytes[1], 0x4B)
  })
})
