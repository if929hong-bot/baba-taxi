import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import AuthLayout from '../../components/common/AuthLayout'

const SuperAdminLogin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  // 預設的超級管理員帳號（之後會改成從後端驗證）
  const VALID_ACCOUNTS = [
    { phone: '0975521219', password: 'sgm0975521219' },
    { phone: '0982098079', password: 'sgm0982098079' },
    { phone: '0911123456', password: 'sgm0911123456' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.phone) {
      newErrors.phone = '請輸入手機號碼'
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = '手機號碼格式不正確（應為09開頭10碼）'
    }
    
    if (!formData.password) {
      newErrors.password = '請輸入密碼'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // 模擬登入驗證（之後會改成真的 API 呼叫）
    setTimeout(() => {
      const validAccount = VALID_ACCOUNTS.find(
        acc => acc.phone === formData.phone && acc.password === formData.password
      )

      if (validAccount) {
        // 登入成功
        localStorage.setItem('token', 'fake-jwt-token')
        localStorage.setItem('user', JSON.stringify({
          role: 'super-admin',
          phone: formData.phone,
          name: '超級管理員'
        }))
        navigate('/super-admin')
      } else {
        // 登入失敗
        setErrors({
          form: '手機號碼或密碼錯誤'
        })
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <AuthLayout 
      title="超級管理員登入"
      subtitle="請使用預設帳號密碼登入"
      role="超級管理員"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 手機號碼輸入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手機號碼
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="請輸入手機號碼"
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.phone 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* 密碼輸入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密碼
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.password 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* 表單錯誤（帳號密碼錯誤） */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.form}
          </div>
        )}

        {/* 預設帳號提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">預設帳號：</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>0975521219 / sgm0975521219</li>
            <li>0982098079 / sgm0982098079</li>
            <li>0911123456 / sgm0911123456</li>
          </ul>
        </div>

        {/* 登入按鈕 */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full bg-blue-600 text-white py-3 rounded-lg font-medium
            flex items-center justify-center space-x-2
            ${loading 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:bg-blue-700 transition-colors'
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>登入中...</span>
            </>
          ) : (
            <>
              <LogIn size={20} />
              <span>登入</span>
            </>
          )}
        </button>

        {/* 返回首頁 */}
        <div className="text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-blue-600">
            ← 返回首頁
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}

export default SuperAdminLogin