import axios from 'axios'
const API_BASE = process.env.NEXT_PUBLIC_SERVICE_API_BASE || '/api'
// 注册用户接口
export async function register(username: string, password: string) {

  const res = await axios.post(`${API_BASE}/register`, {
    username,
    password,
  }, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  })
  return res.data
}