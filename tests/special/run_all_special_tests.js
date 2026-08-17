/**
 * Master Runner pre všetkých 5 špeciálnych forenzných testov:
 * 1. Krížový Výsluch AI Engine
 * 2. Export Súdneho Dossier, CSV & PDF
 * 3. Kryptografická Integrita Spisu & SHA-256 Chain
 * 4. Sieťové Metriky Grafu & PageRank
 * 5. Geopriestorový Engine & Verifikácia Alibi
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const testFiles = [
  { id: 1, name: '⚖️ Krížový Výsluch AI Engine', file: '01_cross_examination.test.js' },
  { id: 2, name: '🏛️ Export Súdneho Dossier, CSV & PDF', file: '02_court_dossier_pdf.test.js' },
  { id: 3, name: '🔐 Kryptografická Integrita Spisu & SHA-256', file: '03_crypto_integrity.test.js' },
  { id: 4, name: '🕸️ Sieťové Metriky Grafu & PageRank', file: '04_graph_metrics.test.js' },
  { id: 5, name: '🗺️ Geopriestorový Engine & Verifikácia Alibi', file: '05_geospatial_alibi.test.js' }
]

async function runTestFile(testItem) {
  const filePath = path.join(__dirname, testItem.file)

  return new Promise((resolve) => {
    const proc = spawn('node', ['--test', filePath], {
      stdio: 'pipe',
      shell: true
    })

    let output = ''
    proc.stdout.on('data', (d) => { output += d.toString() })
    proc.stderr.on('data', (d) => { output += d.toString() })

    proc.on('close', (code) => {
      resolve({
        id: testItem.id,
        name: testItem.name,
        passed: code === 0,
        output
      })
    })
  })
}

async function main() {
  console.log('=================================================================')
  console.log('🧪 SÚHRNNÝ PROTOKOL ŠPECIÁLNYCH FORENZNÝCH TESTOV (5/5)')
  console.log('=================================================================\n')

  let passedCount = 0

  for (const testItem of testFiles) {
    process.stdout.write(`[TEST ${testItem.id}/5] ${testItem.name} ... `)
    const result = await runTestFile(testItem)

    if (result.passed) {
      console.log('✅ PREŠIEL')
      passedCount++
    } else {
      console.log('❌ ZLYHAL')
      console.error(result.output)
    }
  }

  console.log('\n=================================================================')
  console.log(`📊 ZÁVEREČNÝ VÝSLEDOK: ${passedCount}/${testFiles.length} TESTOVACÍCH SÁD PREŠLO ÚSPEŠNE`)
  console.log('=================================================================')

  if (passedCount === testFiles.length) {
    console.log('🚀 Všetky pokročilé forenzné moduly (Krížový výsluch, Dossier, Crypto, Grafy, Alibi) sú 100% funkčné!')
  }
}

main().catch(console.error)
