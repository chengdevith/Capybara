/** Error from the Capybara API, carrying the HTTP status and JSON body. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: Record<string, unknown> = {},
  ) {
    super(message)
  }
}

async function failure(res: Response): Promise<ApiError> {
  let message = `${res.status} ${res.statusText}`
  let body: Record<string, unknown> = {}
  try {
    body = (await res.json()) as Record<string, unknown>
    if (typeof body.error === 'string') message = body.error
  } catch {
    // not JSON; keep the status line
  }
  return new ApiError(res.status, message, body)
}

/** Sends JSON to the Capybara API and returns the JSON reply. */
export async function apiSend<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw await failure(res)
  return (await res.json()) as T
}

/** GETs a JSON endpoint of the Capybara API (relative to the page origin). */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
  if (!res.ok) throw await failure(res)
  return (await res.json()) as T
}
