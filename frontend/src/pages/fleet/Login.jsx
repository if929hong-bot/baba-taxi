import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import AuthLayout from '../../components/common/AuthLayout'

const FleetLogin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      newErrors.phone = '手機號碼格式不正確'
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
    
    // 模擬登入驗證
    setTimeout(() => {
      // 這裡之後會串接後端
      const mockFleetCode = 'F001'
      
      // 儲存登入狀態
      localStorage.setItem('token', 'fleet-token')
      localStorage.setItem('user', JSON.stringify({
        role: 'fleet-admin',
        phone: formData.phone,
        name: '車隊管理員',
        fleetCode: mockFleetCode
      }))
      
      // 跳轉到車隊管理員後台
      navigate(`/fleet/${mockFleetCode}/admin`)
      setLoading(false)
    }, 1000)
  }

  return (
    <AuthLayout 
      title="車隊管理員登入"
      subtitle="請使用註冊的手機號碼登入"
      role="車隊管理員"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 手機號碼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手機號碼
          </label>
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
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* 密碼 */}
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

        {/* 忘記密碼 */}
        <div className="text-right">
          <Link 
            to="/fleet/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            忘記密碼？
          </Link>
        </div>

        {/* 表單錯誤 */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.form}
          </div>
        )}

        {/* 審核中提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-700">
              若您剛註冊，請等待超級管理員審核通過後方可登入。
            </p>
          </div>
        </div>

        {/* 登入按鈕 */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full bg-blue-600 text-white py-3 rounded-lg font-medium
            flex items-center justify-center space-x-2
            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}
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

        {/* 註冊連結 */}
        <div className="text-center">
          <span className="text-sm text-gray-600">還沒有帳號？</span>
          <Link to="/fleet/register" className="text-sm text-blue-600 hover:text-blue-700 ml-1">
            立即註冊
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default FleetLogin