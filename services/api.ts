import axios from 'axios'

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000',
  timeout: 8000,
})

// client.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })
/**
 * 执行 /数据库巡检 查询
 * @returns {Promise<any | null>} 返回查询结果数据或 null
 */
export async function dbInspect(inspecParam: string): Promise<any | null> {
  try {
    // 发起 GET 请求
    const response = await client.get('/true_dbinspect',{
      params: {
        question: inspecParam
      },
      timeout: 10000 // 设置超时时间，例如 10 秒
    })

    // 请求成功，返回响应数据
    console.log('DB Inspect Data fetched successfully:', response.data)
    return response.data

  } catch (error) {
    // 请求失败，处理错误
    if (axios.isAxiosError(error)) {
      // Axios 错误 (如网络问题、超时、HTTP 状态码非 2xx)
      console.error('Error fetching /true_dbinspect:', error.message)
      if (error.response) {
        // 服务器返回了状态码，但不在 2xx 范围内
        console.error('Status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
    } else {
      // 非 Axios 错误 (如代码逻辑错误)
      console.error('An unexpected error occurred:', error)
    }
    // 返回 null 或抛出错误，取决于你的错误处理策略
    return null 
  }
}
export default client
 
