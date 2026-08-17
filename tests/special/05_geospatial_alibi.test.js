import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveLocationCoords,
  getDistanceBetweenLocationsKm,
  getMinTravelTimeMinutes,
  evaluateTravelFeasibility
} from '../../base44/shared/geospatialEngine.ts'

test('🗺️ [ŠPECIÁLNY TEST 5] Geopriestorový Engine & Verifikácia Alibi', async (t) => {
  await t.test('5.1 Rozpoznávanie slovenských miest a GPS súradníc', () => {
    const ba = resolveLocationCoords('v meste Bratislava')
    assert.ok(ba, 'Bratislava musí byť rozpoznaná')
    assert.ok(Math.abs(ba.lat - 48.1486) < 0.01)

    const ke = resolveLocationCoords('Košice - centrum')
    assert.ok(ke, 'Košice musia byť rozpoznané')
    assert.ok(Math.abs(ke.lat - 48.7164) < 0.01)

    const za = resolveLocationCoords('pri Žiline')
    assert.ok(za, 'Žilina musí byť rozpoznaná')
  })

  await t.test('5.2 Výpočet reálnej cestnej vzdialenosti medzi mestami', () => {
    // Bratislava <-> Trnava (~50-60 km)
    const distBaTt = getDistanceBetweenLocationsKm('Bratislava', 'Trnava')
    assert.ok(distBaTt !== null && distBaTt >= 45 && distBaTt <= 70, `Vzdialenosť BA-TT (${distBaTt} km) musí byť v rozmedzí 45-70 km`)

    // Bratislava <-> Košice (~390-480 km)
    const distBaKe = getDistanceBetweenLocationsKm('Bratislava', 'Košice')
    assert.ok(distBaKe !== null && distBaKe >= 380 && distBaKe <= 520, `Vzdialenosť BA-KE (${distBaKe} km) musí byť v rozmedzí 380-520 km`)
  })

  await t.test('5.3 Detekcia fyzikálne nemožného alibi (Nemožná rýchlosť presunu)', () => {
    // Prípad: Podozrivý tvrdí, že bol o 21:00 v Bratislave a o 21:30 v Košiciach (rozdiel 30 minút na 430 km)
    const impossibleAlibi = evaluateTravelFeasibility(
      'Bratislava',
      '21:00',
      'Košice',
      '21:30',
      'Milan Horváth'
    )

    assert.ok(impossibleAlibi !== null, 'Výsledok vyhodnotenia alibi nesmie byť null')
    assert.equal(impossibleAlibi.isFeasible, false, 'Alibi musí byť vyhodnotené ako fyzikálne nemožné')
    assert.equal(impossibleAlibi.severity, 'critical', 'Závažnosť rozporu musí byť critical')
    assert.ok(impossibleAlibi.explanation.includes('Fyzikálne nemožný presun'), 'Vysvetlenie musí obsahovať popis nemožného presunu')
  })

  await t.test('5.4 Potvrdenie uskutočniteľného presunu', () => {
    // Prípad: Presun z Bratislavy do Trnavy (55 km) s časovým oknom 2 hodiny (18:00 -> 20:00)
    const feasibleTrip = evaluateTravelFeasibility(
      'Bratislava',
      '18:00',
      'Trnava',
      '20:00',
      'Peter Kováč'
    )

    assert.ok(feasibleTrip !== null)
    assert.equal(feasibleTrip.isFeasible, true, 'Tento presun musí byť vyhodnotený ako reálny a uskutočniteľný')
    assert.equal(feasibleTrip.severity, 'none')
  })
})
