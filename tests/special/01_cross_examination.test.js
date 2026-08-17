import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CROSS_EXAM_MODES,
  buildCitation,
  hasValidCitation,
  validateQuestionSet,
  generateTemplateQuestions
} from '../../src/lib/crossExamination.js'

test('⚖️ [ŠPECIÁLNY TEST 1] Krížový Výsluch AI Engine', async (t) => {
  await t.test('1.1 Dostupné módy výsluchu (mild, aggressive, alibi)', () => {
    assert.ok(CROSS_EXAM_MODES.mild, 'Mód mild musí existovať')
    assert.ok(CROSS_EXAM_MODES.aggressive, 'Mód aggressive musí existovať')
    assert.ok(CROSS_EXAM_MODES.alibi, 'Mód alibi musí existovať')
    assert.equal(CROSS_EXAM_MODES.mild.tone, 'mierny')
    assert.equal(CROSS_EXAM_MODES.aggressive.tone, 'agresívny')
    assert.equal(CROSS_EXAM_MODES.alibi.tone, 'verifikačný')
  })

  await t.test('1.2 Generovanie a validácia citácií z výpovedí', () => {
    const source = {
      document_title: 'Výpoveď svedka Peter Kováč s. 4',
      source_quote: 'Videl som odchádzať čierne BMW o 21:30.',
      line_number: 12
    }
    const citation = buildCitation(source)

    assert.ok(citation.text.includes('Peter Kováč'), 'Citácia musí obsahovať názov dokumentu')
    assert.ok(citation.text.includes('s. 4'), 'Citácia musí obsahovať číslo strany')
    assert.ok(citation.text.includes('riad. 12'), 'Citácia musí obsahovať číslo riadku')
    assert.ok(hasValidCitation(citation.text), 'Citácia musí byť formálne validná')
  })

  await t.test('1.3 Generovanie konfrontačných otázok pre rozpor', () => {
    const contradiction = {
      id: 'contra_1',
      claim_a_id: 'claim_1',
      claim_b_id: 'claim_2',
      entity_ref: 'Milan Horváth',
      type: 'location_time_conflict',
      explanation: 'Rozpor medzi časom pobytu doma a videním pri sklade.',
      document_title: 'Výpoveď svedka',
      source_quote: 'Tvrdil, že bol doma.'
    }

    const claims = [
      { id: 'claim_1', document_title: 'Výpoveď obvineného', location: 'Petržalka', event_time: '21:00' },
      { id: 'claim_2', document_title: 'Výpoveď vrátnika', location: 'Ružinov', event_time: '21:30' }
    ]

    // Generovanie v agresívnom móde
    const questionsAggressive = generateTemplateQuestions({
      target: contradiction,
      mode: 'aggressive',
      claims
    })

    assert.ok(questionsAggressive.length > 0, 'Musí vygenerovať aspoň jednu konfrontačnú otázku')
    assert.equal(questionsAggressive[0].mode, 'aggressive')
    assert.ok(questionsAggressive[0].question.length > 10, 'Otázka musí obsahovať text')

    // Validácia sady otázok
    const validation = validateQuestionSet(questionsAggressive)
    assert.ok(validation.ok, 'Všetky vygenerované otázky musia mať platné citácie')
    assert.equal(validation.invalid.length, 0, 'Nesmú existovať otázky bez citácií')
  })
})
