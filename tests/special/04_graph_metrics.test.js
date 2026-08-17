import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  RELATIONSHIP_TYPES,
  classifyRelationship,
  calculateGraphMetrics
} from '../../src/lib/graphMetrics.js'

test('🕸️ [ŠPECIÁLNY TEST 4] Sieťové Metriky Grafu & PageRank', async (t) => {
  await t.test('4.1 Sémantická klasifikácia typov vzťahov', () => {
    // Spolupáchateľ
    const rel1 = classifyRelationship({ label: 'Dohoda o krádeži', description: 'Komplic pri vlámaní' })
    assert.equal(rel1.type, RELATIONSHIP_TYPES.SPOLUPACHATEL)
    assert.equal(rel1.color, '#dc2626')

    // Konflikt / Nepriateľstvo
    const rel2 = classifyRelationship({ label: 'Hádka', description: 'Vyhrážanie zabitím' })
    assert.equal(rel2.type, RELATIONSHIP_TYPES.NEPRIATELSTVO)
    assert.equal(rel2.color, '#f97316')

    // Finančný tok
    const rel3 = classifyRelationship({ label: 'Platba na účet', description: 'Prevod 15000 EUR' })
    assert.equal(rel3.type, RELATIONSHIP_TYPES.FINANCIE)
    assert.equal(rel3.color, '#eab308')

    // Rodina
    const rel4 = classifyRelationship({ label: 'Manželka' })
    assert.equal(rel4.type, RELATIONSHIP_TYPES.RODINA)
    assert.equal(rel4.color, '#8b5cf6')

    // Alibi
    const rel5 = classifyRelationship({ label: 'Alibi kontakt', description: 'Potvrdil spoločný pobyt' })
    assert.equal(rel5.type, RELATIONSHIP_TYPES.ALIBI)
    assert.equal(rel5.color, '#10b981')
  })

  await t.test('4.2 Výpočet PageRank skóre a identifikácia kľúčových hubov (Top Suspects)', () => {
    const persons = [
      { id: 'p_milan', name: 'Milan Horváth', type: 'podozrivý' },
      { id: 'p_peter', name: 'Peter Kováč', type: 'svedok' },
      { id: 'p_elena', name: 'Elena Horváthová', type: 'alibi' },
      { id: 'p_jozef', name: 'Jozef Varga', type: 'obeť' }
    ]

    // Milan má najviac spojení (centrálny uzol)
    const edges = [
      { source: 'p_milan', target: 'p_peter', label: 'Videný' },
      { source: 'p_milan', target: 'p_elena', label: 'Manžel' },
      { source: 'p_milan', target: 'p_jozef', label: 'Konflikt' }
    ]

    const metrics = calculateGraphMetrics(persons, edges)

    assert.equal(metrics.graphStats.totalNodes, 4, 'Graf musí obsahovať 4 uzly')
    assert.equal(metrics.graphStats.totalEdges, 3, 'Graf musí obsahovať 3 hrany')

    // Milan Horváth musí byť na 1. mieste v Top Suspects s najvyšším PageRank
    const topPerson = metrics.topSuspects[0]
    assert.equal(topPerson.id, 'p_milan', 'Milan Horváth musí byť identifikovaný ako hlavný kľúčový uzol')
    assert.equal(topPerson.degree, 3, 'Stupeň uzla (degree) pre Milana musí byť 3')
    assert.ok(topPerson.isKeyHub, 'Milan musí mať príznak isKeyHub = true')
    assert.ok(topPerson.pageRankScore > 0.2, 'PageRank skóre musí byť vypočítané a kladné')
  })
})
