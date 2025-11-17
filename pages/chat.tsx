'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearToken } from '@/services/auth'
import { showToast } from '@/components/Toast'

// 生成唯一会话ID（36进制时间戳 + 随机字符串，确保唯一性）
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8)
}

// 生成单条消息ID（前缀区分角色，避免ID冲突）
const genMsgId = (prefix = 'msg_') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

// 消息类型定义
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false) // 整体加载状态
  const [streaming, setStreaming] = useState(false) // 流式响应中状态
  const [sessionId, setSessionId] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const router = useRouter()
  const chatRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const assistantMsgIdRef = useRef<string>('') // 缓存当前AI回复的消息ID

  // 初始化：校验登录状态、生成会话ID
  useEffect(() => {
    const initAuth = () => {
      const t = getToken()
      if (!t) {
        router.push('/login')
        return
      }
      setToken(t)
      setSessionId(generateSessionId())
      showToast('✅ 登录成功，可开始咨询')
    }

    initAuth()

    // 组件卸载时清理WebSocket连接
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close(1000, '组件卸载')
        websocketRef.current = null
      }
    }
  }, [router])

  // 自动滚动到最新消息（仅当autoScroll为true时）
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      // 微任务确保DOM已更新
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 0)
    }
  }, [messages, autoScroll])

  // 监听聊天容器滚动，判断是否在底部（控制自动滚动开关）
  const handleScroll = useCallback(() => {
    const container = chatRef.current
    if (!container) return

    const threshold = 100 // 底部容忍距离（px）
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + threshold
    setAutoScroll(isAtBottom)
  }, [])

  // 退出登录
  const logout = () => {
    clearToken()
    if (websocketRef.current) {
      websocketRef.current.close(1000, '用户退出登录')
    }
    router.push('/login')
    showToast('👋 已退出登录')
  }

  // 新建会话
  const newChat = () => {
    // 关闭当前WebSocket连接
    if (websocketRef.current) {
      websocketRef.current.close(1000, '新建会话')
      websocketRef.current = null
    }
    // 清空消息、生成新会话ID
    setMessages([])
    setSessionId(generateSessionId())
    setInput('')
    setLoading(false)
    setStreaming(false)
    assistantMsgIdRef.current = ''
    showToast('🆕 已开启新会话')
    // 强制滚动到底部
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  // 发送问题（核心逻辑）
  const sendQuestion = async () => {
    const question = input.trim()
    if (!question || loading) return

    // 预处理：清空输入框、设置加载状态
    setInput('')
    setLoading(true)
    setStreaming(true)

    // 记录当前是否在底部（用于后续自动滚动判断）
    const container = chatRef.current
    const isAtBottom = container 
      ? container.scrollHeight - container.scrollTop <= container.clientHeight + 100 
      : true
    setAutoScroll(isAtBottom)

    // 添加用户消息
    const userMsg: Message = {
      id: genMsgId('user_'),
      role: 'user',
      content: question
    }
    setMessages(prev => [...prev, userMsg])

    // 生成AI回复占位消息（后续流式更新）
    const assistantMsgId = genMsgId('assist_')
    assistantMsgIdRef.current = assistantMsgId
    const placeholderMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: ''
    }
    setMessages(prev => [...prev, placeholderMsg])

    try {
      // 构建WebSocket连接URL（自动适配HTTP/HTTPS）
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws/ai-question?session_id=${sessionId}`
      // const  wsUrl = `http://localhost:19069/api/ws/ai-question?session_id=${sessionId}`
      console.log(`📡 连接WebSocket: ${wsUrl}`)

      // 关闭现有连接（避免多连接冲突）
      if (websocketRef.current) {
        websocketRef.current.close(1000, '发送新问题')
      }

      // 创建新WebSocket连接
      const ws = new WebSocket(wsUrl)
      websocketRef.current = ws

      // 连接建立成功：发送问题
      ws.onopen = () => {
        console.log('✅ WebSocket连接建立成功')
        ws.send(JSON.stringify({
          question,
          type: 0,
          token // 可选：如果后端需要token校验
        }))
      }

      // 接收后端流式响应
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📥 接收后端消息:', data)

          // 处理不同状态
          switch (data.status) {
            case 1: // 流式响应中
              if (data.content) {
                // 累加更新AI回复内容
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMsgIdRef.current) {
                    return { ...msg, content: msg.content + data.content }
                  }
                  return msg
                }))
              }
              break

            case 2: // 响应结束
              setStreaming(false)
              setLoading(false)
              // 最后一次内容更新（如果有）
              if (data.content) {
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMsgIdRef.current) {
                    return { ...msg, content: msg.content + data.content }
                  }
                  return msg
                }))
              }
              // 关闭连接
              ws.close(1000, '响应结束')
              break

            case -1: // 业务错误
              setStreaming(false)
              setLoading(false)
              // 添加系统错误消息
              const errorMsg: Message = {
                id: genMsgId('sys_'),
                role: 'system',
                content: `⚠️ ${data.content || '服务器返回错误，请重试'}`
              }
              setMessages(prev => [...prev.filter(msg => msg.id !== assistantMsgIdRef.current), errorMsg])
              ws.close(3001, '业务错误')
              showToast(`错误：${data.content}`)
              break
          }
        } catch (parseError) {
          // JSON解析失败
          setStreaming(false)
          setLoading(false)
          console.error('❌ 解析WebSocket消息失败:', parseError)
          const errorMsg: Message = {
            id: genMsgId('sys_'),
            role: 'system',
            content: '⚠️ 消息解析失败，请重试'
          }
          setMessages(prev => [...prev.filter(msg => msg.id !== assistantMsgIdRef.current), errorMsg])
          ws.close(3002, '消息格式错误')
          showToast('消息解析失败')
        }
      }

      // WebSocket错误处理
      ws.onerror = (error) => {
        setStreaming(false)
        setLoading(false)
        console.error('❌ WebSocket连接错误:', error)
        const errorMsg: Message = {
          id: genMsgId('sys_'),
          role: 'system',
          content: '⚠️ 连接服务器失败，请检查网络或稍后重试'
        }
        setMessages(prev => [...prev.filter(msg => msg.id !== assistantMsgIdRef.current), errorMsg])
        showToast('连接服务器失败')
      }

      // WebSocket关闭处理
      ws.onclose = (event) => {
        console.log(`🔌 WebSocket连接关闭: 代码=${event.code}, 原因=${event.reason}`)
        // 处理意外关闭（非正常响应结束）
        if (streaming) {
          setStreaming(false)
          setLoading(false)
          const errorMsg: Message = {
            id: genMsgId('sys_'),
            role: 'system',
            content: `⚠️ 连接已断开（${event.reason || '未知原因'}）`
          }
          setMessages(prev => [...prev.filter(msg => msg.id !== assistantMsgIdRef.current), errorMsg])
          showToast('连接已断开')
        }
        websocketRef.current = null
      }

    } catch (globalError) {
      // 全局异常捕获
      setStreaming(false)
      setLoading(false)
      console.error('❌ 发送问题失败:', globalError)
      const errorMsg: Message = {
        id: genMsgId('sys_'),
        role: 'system',
        content: '⚠️ 发送请求失败，请重试'
      }
      setMessages(prev => [...prev.filter(msg => msg.id !== assistantMsgIdRef.current), errorMsg])
      showToast('发送请求失败')
    }
  }

  // 键盘回车发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // 禁止Shift+Enter换行（如需支持可移除!e.shiftKey）
      e.preventDefault()
      sendQuestion()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-800/90 shadow-sm backdrop-blur-sm">
        <span className="text-lg font-semibold text-gray-800 dark:text-white">磐维数据巡检助手</span>
        <div className="flex items-center space-x-4">
          <button 
            onClick={newChat}
            className="text-sm px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            新会话 +
          </button>
          <button 
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900"
      >
        {messages.length === 0 ? (
          // 空状态提示
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <img 
              src="/ai-avatar.png" 
              alt="AI助手" 
              className="w-20 h-20 rounded-full mb-4 border border-gray-200 dark:border-gray-700"
            />
            <h3 className="text-lg font-medium mb-2">欢迎使用磐维数据巡检助手</h3>
            <p className="text-sm max-w-md text-center">
              请输入您的问题（例如：查看数据库里所有表），AI将为您提供帮助
            </p>
          </div>
        ) : (
          // 聊天消息列表
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* AI/系统头像 */}
              {msg.role !== 'user' && (
                <img
                  src={msg.role === 'assistant' ? '/ai-avatar.png' : '/system-avatar.png'}
                  alt={msg.role === 'assistant' ? 'AI助手' : '系统通知'}
                  className="w-8 h-8 rounded-full mr-2 border border-gray-200 dark:border-gray-700 shrink-0 mt-1"
                />
              )}

              {/* 消息内容 */}
              <div
                className={`px-4 py-3 rounded-2xl break-words shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white max-w-[85%] rounded-tr-none'
                    : msg.role === 'system'
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 max-w-[85%]'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white max-w-[85%] rounded-tl-none'
                }`}
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {msg.content}
              </div>

              {/* 用户头像 */}
              {msg.role === 'user' && (
                <img
                  src="/user-avatar.png"
                  alt="用户"
                  className="w-8 h-8 rounded-full ml-2 border border-gray-200 dark:border-gray-700 shrink-0 mt-1"
                />
              )}
            </div>
          ))
        )}

        {/* 滚动锚点（始终在底部） */}
        <div ref={endRef} />

        {/* 流式加载提示 */}
        {streaming && (
          <div className="flex justify-start items-center ml-10 text-gray-400 dark:text-gray-500 text-sm">
            <span className="animate-pulse">AI 正在回复...</span>
          </div>
        )}
      </div>

      {/* 底部输入区域 */}
      <div className="p-3 bg-white/90 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="flex items-center space-x-3 max-w-5xl mx-auto">
          <input
            type="text"
            value={input}
            placeholder="请输入您的问题（例如：查看数据库里所有表）..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className={`flex-1 border rounded-full px-4 py-2.5 text-sm dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={sendQuestion}
            disabled={loading || !input.trim()}
            className={`bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all flex items-center space-x-1 ${
              (loading || !input.trim()) 
                ? 'opacity-70 cursor-not-allowed bg-blue-400 dark:bg-blue-500' 
                : 'hover:shadow-md'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>发送</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  // 客户端组件，服务端仅返回空props
  return { props: {} }
}