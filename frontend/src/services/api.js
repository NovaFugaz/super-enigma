const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
const SESSION_KEY = 'sonido-vivo-session'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function readToken() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const serialized = storage.getItem(SESSION_KEY)
    if (!serialized) continue

    try {
      const session = JSON.parse(serialized)
      if (typeof session?.token === 'string') return session.token
    } catch {
      continue
    }
  }
  return null
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  const accessToken = token ?? readToken()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    throw new Error(`No se pudo conectar con la API (${API_BASE_URL}).`, { cause: error })
  }

  if (response.status === 204) return null

  const responseText = await response.text()
  let responseBody
  try {
    responseBody = responseText ? JSON.parse(responseText) : null
  } catch {
    responseBody = responseText
  }

  if (!response.ok) {
    const message = typeof responseBody?.message === 'string'
      ? responseBody.message
      : typeof responseBody === 'string' && responseBody
        ? responseBody
        : `La API respondió con estado ${response.status}.`
    throw new ApiError(message, response.status)
  }

  return responseBody
}
