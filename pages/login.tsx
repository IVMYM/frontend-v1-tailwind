import { useState } from 'react'
import { useRouter } from 'next/router'
import { login } from '@/services/auth'
import { showToast } from '@/components/Toast'
import '@/styles/loginstyle.module.css'
export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const router = useRouter()
// 同时添加切换密码可见性的函数
const togglePasswordVisibility = () => {
  setPasswordVisible(!passwordVisible);
};
const toggleRememberPassword = () => {
  setRememberPassword(!rememberPassword);
};
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(username, password)
    // 存 cookie（有效期 1 天）
      document.cookie = `token=${res.access_token}; path=/; max-age=${24 * 60 * 60}`
      showToast('✅ 登录成功')
      setTimeout(() => router.push('/chat'), 1500)
    } catch (err) {
      showToast('❌ 用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

   return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 font-['microsoft_yahei']">
      {/* 登录框 */}
      <div className="w-[360px] h-[400px] bg-gradient-to-br from-[#CADBFE] via-white to-white rounded-[15px] shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
        <div className="w-full h-full p-[24px] box-sizing-border relative">
          
          {/* Logo */}
               {/* <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          磐维数据巡检系统
        </h1> */}
              <div className="w-[298px] h-[60px] mx-auto bg-[url('../images/logo_blue.svg')] bg-no-repeat bg-center bg-[length:270px]"></div>
          {/* 表单内容 */}
          <div className="w-full mt-[5px]">
            <form onSubmit={handleLogin} className="w-full">
              {/* 用户名输入 */}
              <div className="w-full mt-[20px] relative">
                <input
                  type="text"
                  className="w-full h-[36px] px-[10px] pl-[35px] border border-[#C4D7FE] rounded-[5px] box-sizing-border transition-all duration-[0.2s] focus:border-[#1384FA] focus:outline-none text-[13px] appearance-none"
                  placeholder="请输入账号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    backgroundImage: "url('../images/path_number.svg')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "14px",
                    backgroundPositionX: "10px",
                    backgroundPositionY: "center"
                  }}
                />
              </div>
              
              {/* 密码输入 */}
              <div className="w-full mt-[20px] relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="w-full h-[36px] px-[10px] pl-[35px] border border-[#C4D7FE] rounded-[5px] box-sizing-border transition-all duration-[0.2s] focus:border-[#1384FA] focus:outline-none text-[13px] appearance-none"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    backgroundImage: "url('../images/path_password.svg')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "13px",
                    backgroundPositionX: "10px",
                    backgroundPositionY: "center"
                  }}
                />
                <button
                  type="button"
                  className="absolute right-[10px] top-[11px] w-[15px] h-[15px] bg-transparent outline-none border-none text-[13px] appearance-none"
                  onClick={togglePasswordVisibility}
                  style={{
                    backgroundImage: passwordVisible 
                      ? "url('../images/path_eyesclose.svg')" 
                      : "url('../images/path_eyes.svg')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "15px",
                    backgroundPosition: "center"
                  }}
                />
              </div>
              
              {/* 记住密码 */}
              <div className="w-full mt-[10px] text-[12px]">
                <i
                  className={`inline-block w-[14px] h-[14px] mr-[7px] cursor-pointer box-sizing-border relative top-[3px] ${
                    rememberPassword 
                      ? 'bg-[url("../images/path_check.svg")] bg-no-repeat bg-center bg-[length:9px] border border-[#1384FA] rounded-[2px]' 
                      : 'bg-white border border-[#E0E0E0] rounded-[2px]'
                  }`}
                  onClick={toggleRememberPassword}
                ></i>
                <span>记住密码</span>
              </div>
              
              {/* 登录按钮 */}
              <div className="w-full mt-[55px]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[36px] bg-[#1384FA] rounded-[5px] text-white transition-all duration-[0.2s] hover:bg-[rgba(19,132,250,0.9)] focus:outline-none text-[13px] appearance-none border-none"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
                没有账号？<a href="/register" className="text-[#1384FA]">注册</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
