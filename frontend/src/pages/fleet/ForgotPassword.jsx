import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Send, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/common/AuthLayout'

const FleetForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: 驗證, 2: 重設, 3: 完成
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
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

  const handleVerify = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.phone) newErrors.phone = '請輸入手機號碼'
    if (!formData.email) newErrors.email = '請輸入電子信箱'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // 模擬驗證
    setTimeout(() => {
      setStep(2)
      setLoading(false)
    }, 1000)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.newPassword) {
      newErrors.newPassword = '請輸入新密碼'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = '密碼長度至少6碼'
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // 模擬重設密碼
    setTimeout(() => {
      setStep(3)
      setLoading(false)
    }, 1000)
  }

  return (
    <AuthLayout 
      title="忘記密碼"
      subtitle={step === 1 ? "請輸入註冊的手機和信箱" : step === 2 ? "設定新密碼" : "密碼重設成功"}
      role="車隊管理員"
    >
      {step === 1 && (
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手機號碼
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="請輸入註冊手機"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              電子信箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="請輸入註冊信箱"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>驗證中...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>發送驗證</span>
              </>
            )}
          </button>

          <div className="text-center">
            <Link to="/fleet/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center space-x-1">
              <ArrowLeft size={16} />
              <span>返回登入</span>
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新密碼
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="至少6碼"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              確認新密碼
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="再次輸入新密碼"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>重設中...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>重設密碼</span>
              </>
            )}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-gray-600">
            密碼重設成功！請使用新密碼登入。
          </p>

          <Link
            to="/fleet/login"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            前往登入
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}

export default FleetForgotPassword