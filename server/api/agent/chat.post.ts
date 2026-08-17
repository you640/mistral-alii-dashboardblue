export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const agentId = config.base44AgentId || '6a82afdc22217ec663d7c4f2'
  const apiKey = config.base44AgentApiKey || process.env.BASE44_AGENT_API_KEY || '01fd9def3d464ec7bc83801ced86f026'
  const conversationId = body.conversationId || config.base44ConversationId || '6a82afdef0ddf529b3da692d'
  const message = body.message || body.content || ''

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Správa nemôže byť prázdna.'
    })
  }

  try {
    const url = `https://app.base44.com/api/agents/${agentId}/conversations/${conversationId}/messages`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api_key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Base44 Agent API error (${response.status}): ${errText}`)
    }

    const data = await response.json()
    return {
      success: true,
      id: data.id,
      role: data.role || 'assistant',
      content: data.content || '',
      created_date: data.metadata?.created_date || new Date().toISOString()
    }
  } catch (err: any) {
    console.error('Chyba komunikácie s Base44 Agentom:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Nepodarilo sa komunikovať s Base44 Agentom'
    })
  }
})
