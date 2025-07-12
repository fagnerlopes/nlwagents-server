import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
const model = env.GEMINI_MODEL
const geminiModelEmbedding = env.GEMINI_MODEL_EMBEDDING

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  try {
    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          text: 'Transcreva o áudio para o Protuguês do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.',
        },
        {
          inlineData: {
            mimeType,
            data: audioAsBase64,
          },
        },
      ],
    })

    if (!response.text) {
      console.error(
        '[ERROR] Transcription failed: No text returned from Gemini API'
      )
      throw new Error('Transcription failed: No text returned from Gemini API')
    }

    return response.text
  } catch (error) {
    console.error('[ERROR] Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function generateEmbeddings(text: string) {
  try {
    const response = await gemini.models.embedContent({
      model: geminiModelEmbedding,
      contents: [
        {
          text,
        },
      ],
    })

    if (
      !response.embeddings ||
      response.embeddings.length === 0 ||
      !response.embeddings[0].values
    ) {
      console.error(
        '[ERROR] Embedding generation failed: No embeddings returned from Gemini API'
      )
      throw new Error('Embedding generation failed: No embeddings returned')
    }

    return response.embeddings[0].values
  } catch (error) {
    console.error('[ERROR] Error generating embeddings:', error)
    throw new Error('Failed to generate embeddings')
  }
}

export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join('\n\n')

  const prompt = `
    Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e objetiva em português do Brasil.

    CONTEXTO:
    ${context}

    PERGUNTA: 
    ${question}
    
    RESPOSTA:
    - Use apenas informações contidas no contexto enviado;
    - Seja objetivo;
    - Mantenha um tom educativo e profissional;
    - Cite trechos relevantes do contexto se apropriado;
    - Se for citar o contexto, utilize o termo "Conteúdo da live" seguido do trecho citado corrigindo a gramática.    
    - Se a resposta não for encontrada no contexto, responda 'Não tenho informações suficientes para responder';
  `.trim()

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  })

  if (!response.text) {
    console.error(
      '[ERROR] Answer generation failed: No text returned from Gemini API'
    )
    throw new Error(
      'Answer generation failed: No text returned from Gemini API'
    )
  }

  return response.text
}
