import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Building2, Mail, Phone, AlertCircle } from 'lucide-react'
import AuthLayout from '../../components/common/AuthLayout'

const FleetRegister = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fleetName: '',
    managerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [registerSuccess, setRegisterSuccess] = useState(false)

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
    
    if (!formData.fleetName) {
      newErrors.fleetName = '請輸入車隊名稱'
    }
    
    if (!formData.managerName) {
      newErrors.managerName = '請輸入負責人姓名'
    }
    
    if (!formData.phone) {
      newErrors.phone = '請輸入手機號碼'
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = '手機號碼格式不正確（應為09開頭10碼）'
    }
    
    if (!formData.email) {
      newErrors.email = '請輸入電子信箱'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '信箱格式不正確'
    }
    
    if (!formData.password) {
      newErrors.password = '請輸入密碼'
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼長度至少6碼'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致'
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
    
    // 模擬註冊 API 呼叫
    setTimeout(() => {
      console.log('註冊資料：', formData)
      setRegisterSuccess(true)
      setLoading(false)
    }, 1500)
  }

  if (registerSuccess) {
    return (
      <AuthLayout 
        title="註冊成功"
        subtitle="請等待超級管理員審核"
        role="車隊管理員"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="text-green-600" size={40} />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              您的註冊申請已送出，車隊編號將在審核通過後產生
            </p>
            <p className="text-sm text-gray-500">
              審核通過後會發送通知至您的信箱：<br />
              <span className="font-medium">{formData.email}</span>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <p className="text-sm text-yellow-800 font-medium mb-2">⏱ 預計審核時間</p>
            <p className="text-sm text-yellow-700">
              一般為 1-2 個工作天，審核通過後即可登入使用。
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              返回首頁
            </Link>
            <Link
              to="/fleet/login"
              className="block w-full text-gray-600 hover:text-blue-600"
            >
              前往登入
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="車隊管理員註冊"
      subtitle="填寫資料後等待超級管理員審核"
      role="車隊管理員"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 車隊名稱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            車隊名稱
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="fleetName"
              value={formData.fleetName}
              onChange={handleChange}
              placeholder="例：大安車隊"
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${errors.fleetName 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
          </div>
          {errors.fleetName && (
            <p className="mt-1 text-sm text-red-600">{errors.fleetName}</p>
          )}
        </div>

        {/* 負責人姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            負責人姓名
          </label>
          <input
            type="text"
            name="managerName"
            value={formData.managerName}
            onChange={handleChange}
            placeholder="請輸入姓名"
            className={`
              w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
              ${errors.managerName 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }
            `}
          />
          {errors.managerName && (
            <p className="mt-1 text-sm text-red-600">{errors.managerName}</p>
          )}
        </div>

        {/* 手機號碼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            手機號碼
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912-345-678"
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
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

        {/* 電子信箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電子信箱
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${errors.email 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 密碼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密碼
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="至少6碼"
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${errors.password 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* 確認密碼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            確認密碼
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="再次輸入密碼"
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700">
              註冊後需等待超級管理員審核通過，方可登入使用。審核結果將以Email通知。
            </p>
          </div>
        </div>

        {/* 註冊按鈕 */}
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
              <span>註冊中...</span>
            </>
          ) : (
            <>
              <UserPlus size={20} />
              <span>送出註冊</span>
            </>
          )}
        </button>

        {/* 登入連結 */}
        <div className="text-center">
          <span className="text-sm text-gray-600">已經有帳號了？</span>
          <Link to="/fleet/login" className="text-sm text-blue-600 hover:text-blue-700 ml-1">
            立即登入
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default FleetRegister