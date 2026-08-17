async function verifyMistralApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY || process.env.NUXT_MISTRAL_API_KEY

  if (!apiKey) {
    console.error('❌ MISTRAL_API_KEY nie je nastavený v prostredí.')
    return
  }

  console.log('Testujem spojenie s Mistral AI API pomocou kľúča z prostredia...')

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'user', content: 'Potvrď, že si pripojený na forenznú platformu Alibi. Odpovedz jednou krátkou vetou.' }
        ],
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errText}`)
    }

    const data = await response.json()
    console.log('✅ Spojenie s Mistral AI bolo úspešne overené!')
    console.log('🤖 Odpoveď od Mistral Large:', data.choices[0]?.message?.content)
  } catch (error) {
    console.error('❌ Chyba pri overení kľúča:', error.message)
  }
}

verifyMistralApiKey()
