import axios from './api'

// 登录函数
export async function login(username: string, password: string) {
  // 构造表单数据
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)

  const res = await axios.post('/api/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data
}
