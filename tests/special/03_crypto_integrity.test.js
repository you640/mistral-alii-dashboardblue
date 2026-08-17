import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateSha256Digest,
  generateCaseIntegrityDigest,
  buildSha256Chain
} from '../../src/utils/cryptoUtils.js'

test('🔐 [ŠPECIÁLNY TEST 3] Kryptografická Integrita Spisu & SHA-256 Chain', async (t) => {
  await t.test('3.1 Výpočet SHA-256 hashu textového reťazca', async () => {
    const input = 'Výpoveď svedka - Peter Kováč'
    const digest = await calculateSha256Digest(input)

    assert.equal(typeof digest, 'string', 'Hash musí byť reťazec')
    assert.equal(digest.length, 64, 'SHA-256 digest musí mať dĺžku presne 64 hexadecimálnych znakov')

    // Determinizmus: rovnaký vstup musí dať identický hash
    const digest2 = await calculateSha256Digest(input)
    assert.equal(digest, digest2, 'Hashovanie musí byť deterministické')

    // Zmena jedného znaku musí radikálne zmeniť celý hash (Avalanche effect)
    const digestModified = await calculateSha256Digest(input + '.')
    assert.notEqual(digest, digestModified, 'Zmenený vstup musí vyprodukovať odlišný hash')
  })

  await t.test('3.2 Generovanie digitálneho odtlačku integrity celého spisu', async () => {
    const caseData = {
      caseTitle: 'Kauza Logistický Sklad',
      documents: [{ id: 'doc_1', title: 'Výpoveď 1', content: 'Obsah výpovede' }],
      persons: [{ id: 'p_1', name: 'Milan Horváth' }],
      contradictions: [{ id: 'c_1', type: 'time_conflict' }],
      events: [{ id: 'e_1', time: '21:30' }]
    }

    const digest = await generateCaseIntegrityDigest(caseData)

    assert.ok(digest.startsWith('sha256:'), 'Odtlačok musí mať prefix sha256:')
    assert.equal(digest.length, 7 + 64, 'Celková dĺžka odtlačku musí byť 71 znakov')
  })

  await t.test('3.3 Reťazec dôkazov (SHA-256 Chain of Custody)', async () => {
    const links = [
      { label: 'Nahratie protokolu polície', timestamp: '2026-08-17T01:00:00Z' },
      { label: 'AI Analýza extrakcie entít', timestamp: '2026-08-17T01:05:00Z' },
      { label: 'Potvrdenie rozporu vyšetrovateľom', timestamp: '2026-08-17T01:10:00Z' }
    ]

    const custodyChain = await buildSha256Chain(links)

    assert.equal(custodyChain.algorithm, 'SHA-256')
    assert.equal(custodyChain.links.length, 3, 'Reťazec musí obsahovať 3 bloky')

    // Každý blok musí odkazovať na previousDigest predchádzajúceho bloku
    assert.equal(custodyChain.links[1].previousDigest, custodyChain.links[0].digest, 'Blok 2 musí nadväzovať na blok 1')
    assert.equal(custodyChain.links[2].previousDigest, custodyChain.links[1].digest, 'Blok 3 musí nadväzovať na blok 2')
    assert.equal(custodyChain.tip, custodyChain.links[2].digest, 'Vrchol reťazca (tip) sa musí zhodovať s posledným blokom')
  })
})
