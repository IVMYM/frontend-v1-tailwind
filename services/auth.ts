import client from './api'

export async function login(username: string, password: string) {
  const res = await client.post('/api/auth/token', { username, password })
  return res.data
}
