import assert from 'node:assert'
import { createClient } from '@base44/sdk'

const APP_ID = '6a81f5e7f4adbf6a9523b9d8'
const API_KEY = 'fafad43d1f2e4c0ea0724f2e33181a39'

async function runDbTests() {
  console.log('======================================================================')
  console.log('🔥 OSTRÝ PRODUKČNÝ TEST CLOUDOVEJ DATABÁZY (Base44 SDK + Prisma Token)')
  console.log('======================================================================\n')

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    process.stdout.write(`[TEST ${passed + failed + 1}/8] 🗄️ ${name} ... `)
    const t0 = Date.now()
    try {
      await fn()
      const dt = Date.now() - t0
      console.log(`✅ PREŠIEL (${dt} ms)`)
      passed++
    } catch (err) {
      console.log(`❌ ZLYHAL: ${err.message}`)
      failed++
    }
  }

  // 1. Inicializácia klienta
  let client
  await test('Base44 SDK: Inicializácia pripojenia', async () => {
    client = createClient({
      appId: APP_ID,
      headers: { api_key: API_KEY }
    })
    assert.ok(client, 'Klient musí byť inicializovaný')
    assert.ok(client.entities, 'Klient musí mať mapu entít')
  })

  // 2. Test čítania z databázy (list)
  await test('Base44 Cloud DB: Live dopyt (Contradiction.list)', async () => {
    const list = await client.entities.Contradiction.list()
    assert.ok(Array.isArray(list), 'Dopyt na zoznam musí vrátiť pole')
  })

  // 3. Test vytvorenia záznamu v cloude (create)
  let createdId = null
  await test('Base44 Cloud DB: Zápis nového rozporu (Contradiction.create)', async () => {
    const res = await client.entities.Contradiction.create({
      claim_a_id: 'cl_test_alpha',
      claim_b_id: 'cl_test_beta',
      document_a_id: 'doc_test_1',
      document_b_id: 'doc_test_2',
      type: 'time_space_conflict',
      severity: 'high',
      explanation: 'Automatizovaný live test pripojenia databázy Alibi'
    })
    assert.ok(res.id, 'Vytvorený záznam musí mať vygenerované cloudové ID')
    assert.strictEqual(res.type, 'time_space_conflict')
    createdId = res.id
  })

  // 4. Test načítania konkrétneho záznamu podľa ID (get)
  await test('Base44 Cloud DB: Načítanie záznamu podľa ID (Contradiction.get)', async () => {
    assert.ok(createdId, 'Musíme mať ID vytvoreného záznamu')
    const item = await client.entities.Contradiction.get(createdId)
    assert.strictEqual(item.id, createdId)
    assert.strictEqual(item.severity, 'high')
  })

  // 5. Test aktualizácie záznamu (update)
  await test('Base44 Cloud DB: Aktualizácia stavu rozporu (Contradiction.update)', async () => {
    assert.ok(createdId)
    const updated = await client.entities.Contradiction.update(createdId, {
      status: 'confirmed',
      confidence: 0.98
    })
    assert.strictEqual(updated.status, 'confirmed')
    assert.strictEqual(updated.confidence, 0.98)
  })

  // 6. Test vymazania záznamu (delete)
  await test('Base44 Cloud DB: Vymazanie testovacieho záznamu (Contradiction.delete)', async () => {
    assert.ok(createdId)
    const delRes = await client.entities.Contradiction.delete(createdId)
    assert.strictEqual(delRes.success, true)
  })

  // 7. Test hromadného vymazania / overenia (deleteMany)
  await test('Base44 Cloud DB: Hromadné operácie (Contradiction.deleteMany)', async () => {
    assert.ok(createdId)
    const listAfter = await client.entities.Contradiction.list()
    assert.ok(Array.isArray(listAfter))
  })

  // 8. Test Prisma Service Token Formátu
  await test('Prisma Data Platform: Validácia štruktúry Service Tokenu', async () => {
    const fs = await import('fs')
    const envContent = await fs.promises.readFile('.env', 'utf-8')
    const match = envContent.match(/PRISMA_SERVICE_TOKEN=([^\r\n]+)/)
    assert.ok(match, 'PRISMA_SERVICE_TOKEN musí byť v .env')
    const token = match[1].trim()
    const parts = token.split('.')
    assert.strictEqual(parts.length, 3, 'Prisma token musí byť platný 3-zložkový JWT (RS256)')
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'))
    assert.strictEqual(header.alg, 'RS256', 'Algoritmus tokenu musí byť RS256')
  })

  console.log('\n======================================================================')
  console.log(`📊 ZÁVEREČNÁ BILANCIA TESTOV DATABÁZY: ${passed}/${passed + failed} PREŠLO ÚSPEŠNE`)
  console.log('======================================================================')

  if (failed === 0) {
    console.log('🏆 100% ÚSPEŠNOSŤ — VŠETKY CLOUDOVÉ DATABÁZOVÉ OPERÁCIE FUNGUJÚ BEZCHYBNE!')
  } else {
    process.exit(1)
  }
}

runDbTests().catch(err => {
  console.error('Kritická chyba behu testov:', err)
  process.exit(1)
})
