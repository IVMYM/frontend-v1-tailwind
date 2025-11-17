import { useState } from 'react'
import { useRouter } from 'next/router'
import { register } from '@/services/register'
import { showToast } from '@/components/Toast'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
    
      const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            showToast('❌ 两次输入密码不一致')
            return
          }
        setLoading(true)
        try {
          const res = await register(username, password)
          if (res.code == 400) {
            showToast(`❌ ${res.message}`)
            return
          }

          showToast('✅ 注册成功')
          setTimeout(() => router.push('/login'), 1500)
        } catch (err) {
          showToast('❌ 注册失败')
        } finally {
          setLoading(false)
        }
      }
       return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-xl rounded-2xl p-8 w-80 border border-gray-100"
      >
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          磐维数据巡检注册
        </h1>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-4 text-gray-700 focus:ring focus:ring-indigo-100"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2 mb-6 text-gray-700 focus:ring focus:ring-indigo-100"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
          <input
          type="password"
          className="w-full border rounded-lg px-3 py-2 mb-6 text-gray-700 focus:ring focus:ring-indigo-100"
          placeholder="确认密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? '注册中...' : '注册'}
        </button>
        已有账号？<a href="/login" className="text-[#1384FA]">登录</a>
      </form>
    </div>
  )
}