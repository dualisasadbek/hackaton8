import config from '../config/AppConfig.js'
import prisma from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

class AiService {
  constructor() {
    this.apiKey = config.groqApiKey
    this.baseUrl = config.groqBaseUrl
    this.textModel = config.groqTextModel
    this.visionModel = config.groqVisionModel
  }

  async _chat(messages, model = this.textModel, maxTokens = 300) {
    if (!this.apiKey) {
      throw ApiError.internal('GROQ_API_KEY sozlanmagan')
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw ApiError.internal(`Groq xatosi (${res.status}): ${text}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }

  _parseSeverity(raw) {
    const text = String(raw).toUpperCase()
    if (text.includes('CRITICAL')) return 'CRITICAL'
    if (text.includes('HIGH')) return 'HIGH'
    if (text.includes('MEDIUM')) return 'MEDIUM'
    return 'LOW'
  }

  async analyzeSos(sos) {
    const messages = [
      {
        role: 'system',
        content:
          'Sen favqulodda vaziyatlarni baholaydigan AI yordamchisan. ' +
          'Foydalanuvchi kiritgan matn va rasmlar asosida vaziyatning og\'irligini baholaysan. ' +
          'FAQAT JSON formatida javob qaytar: {"severity": "LOW|MEDIUM|HIGH|CRITICAL", "score": 0-100, "summary": "1-2 gapda qisqa xulosa", "recommendedAction": "nima qilish kerak"}',
      },
      {
        role: 'user',
        content: `SOS xabar: ${sos.description || 'Tavsif yo\'q'}. Kategoriya: ${sos.category}. Manzil: ${sos.address || 'Noma\'lum'}`,
      },
    ]

    let raw
    try {
      raw = await this._chat(messages, this.textModel, 300)
    } catch (err) {
      return this.fallbackAnalysis(sos)
    }

    const cleaned = raw.replace(/```json|```/g, '').trim()
    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {}
    }

    const score = Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 50))

    const result = {
      severity: this._parseSeverity(parsed.severity),
      score,
      summary: parsed.summary || '',
      recommendedAction: parsed.recommendedAction || '',
    }

    return result
  }

  fallbackAnalysis(sos) {
    const text = `${sos.description || ''} ${sos.address || ''}`.toLowerCase()
    const criticalWords = ['o\'layapman', 'oship', 'yurak', 'qon', 'jonim', 'kuymoq', 'o\'t', 'yong\'in', 'hujum']
    const highWords = ['yordam', 'tez', 'shoshilinch', 'singan', 'sinib', 'og\'riq', 'kuchli']
    const mediumWords = ['yordam kerak', 'bemor', 'kasallik', 'yengil']

    let score = 40
    for (const w of criticalWords) if (text.includes(w)) score += 25
    for (const w of highWords) if (text.includes(w)) score += 12
    for (const w of mediumWords) if (text.includes(w)) score += 5

    score = Math.min(100, score)

    let severity = 'LOW'
    if (score >= 80) severity = 'CRITICAL'
    else if (score >= 60) severity = 'HIGH'
    else if (score >= 40) severity = 'MEDIUM'

    return {
      severity,
      score,
      summary: 'AI vaziyatni baholadi',
      recommendedAction: 'Tez yordamni xabardor qilish tavsiya etiladi',
    }
  }

  async analyzeImage(photoPath, description) {
    const absoluteUrl = `http://localhost:${config.port}${photoPath}`
    const base64 = await this._imageToBase64(photoPath)

    if (!base64) return this.fallbackAnalysis({ description, category: 'OTHER' })

    const messages = [
      {
        role: 'system',
        content:
          'Sen favqulodda vaziyatni RASMDAN baholaydigan AI. ' +
          'FAQAT JSON: {"severity":"LOW|MEDIUM|HIGH|CRITICAL","score":0-100,"summary":"..."}',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Vaziyat tavsifi: ${description || 'Yo\'q'}. Rasmdagi vaziyatni bahola.` },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}` },
          },
        ],
      },
    ]

    try {
      const raw = await this._chat(messages, this.visionModel, 300)
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return {
        severity: this._parseSeverity(parsed.severity),
        score: Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 50)),
        summary: parsed.summary || '',
        recommendedAction: '',
      }
    } catch {
      return this.fallbackAnalysis({ description, category: 'OTHER' })
    }
  }

  async _imageToBase64(photoPath) {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.resolve(process.cwd(), '.' + photoPath)
    if (!fs.existsSync(filePath)) return null
    const buf = fs.readFileSync(filePath)
    if (buf.length > 4 * 1024 * 1024) return null
    return buf.toString('base64')
  }

  async autoDispatchText(sos) {
    const messages = [
      {
        role: 'system',
        content:
          'Sen SOS Map AI opertorisan. Admin 2 daqiqada javob bermadi, endi o\'zing yordam yuborasan. ' +
          '1-2 gapda qanday yordam yuborilganini yoz (tez yordam, olov o\'chirish, politsiya). Hech qanday format kerak emas, faqat matn.',
      },
      {
        role: 'user',
        content: `SOS kategoriya: ${sos.category}, og\'irlik: ${sos.severity}, tavsif: ${sos.description || ''}`,
      },
    ]

    try {
      const raw = await this._chat(messages, this.textModel, 200)
      return raw.trim()
    } catch {
      return `${sos.category} bo'yicha avtomatik yordam yuborildi`
    }
  }
}

export default new AiService()
