const USAGE_URL = "https://muse-usage.toshas5488.workers.dev/"

export const READ_TOKEN_KEY = "muse-usage.read-token"

export function requestUsage(token: string): Promise<Response> {
  return fetch(USAGE_URL, {
    timeout: 10,
    headers: { Authorization: "Bearer " + token },
  })
}
