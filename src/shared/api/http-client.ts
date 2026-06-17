const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

type ApiErrorBody = {
  message?: string
  error?: string
}

export async function requestJson<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<TResponse>
}

async function getApiErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody
    const message = body.message ?? body.error

    if (message) {
      return message
    }
  } catch {
    return `API request failed: ${response.status}`
  }

  return `API request failed: ${response.status}`
}

export async function requestFirstJson<TResponse>(
  paths: string[],
  options: RequestOptions = {},
): Promise<TResponse> {
  const errors: Error[] = []

  for (const path of paths) {
    try {
      return await requestJson<TResponse>(path, options)
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)))
    }
  }

  throw new Error(
    `All API candidates failed: ${errors.map((error) => error.message).join(', ')}`,
  )
}
