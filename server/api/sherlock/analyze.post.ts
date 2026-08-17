import { defineEventHandler, readBody, createError } from 'h3'
import {
  SHERLOCK_SYSTEM_PROMPT,
  buildUserPrompt,
  buildRetryJsonPrompt,
  cleanResponse
} from '../../../app/lib/sherlockPrompt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, documentName } = body

  if (!text || typeof text !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chýba text dokumentu na analýzu'
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config.mistralApiKey || process.env.MISTRAL_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MISTRAL_API_KEY nie je nakonfigurovaný'
    })
  }

  const userPrompt = buildUserPrompt(text)

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: SHERLOCK_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Mistral API error ${response.status}: ${errText}`)
    }

    let data = await response.json()
    let content = data.choices[0]?.message?.content || ''
    let cleaned = cleanResponse(content)

    // Pokus o JSON parse s automatickým retry
    try {
      const parsed = JSON.parse(cleaned)
      if (documentName && parsed.metadata) {
        parsed.metadata.document_name = documentName
      }
      return parsed
    } catch {
      // Automatický 2nd-pass retry prompt
      const retryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: SHERLOCK_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
            { role: 'assistant', content },
            { role: 'user', content: buildRetryJsonPrompt() }
          ],
          response_format: { type: 'json_object' }
        })
      })

      if (!retryResponse.ok) {
        throw new Error('Zlyhala aj retry oprava JSON výstupu')
      }

      data = await retryResponse.json()
      content = data.choices[0]?.message?.content || ''
      cleaned = cleanResponse(content)
      return JSON.parse(cleaned)
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Chyba pri analýze dokumentu: ${err.message}`
    })
  }
})
