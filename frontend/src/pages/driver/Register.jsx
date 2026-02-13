import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Eye, EyeOff, UserPlus, Car, Phone, Mail, 
  Upload, AlertCircle, CheckCircle, X, FileText,
  Calendar, Award, Shield, CreditCard, Camera
} from 'lucide-react'
import AuthLayout from '../../components/common/AuthLayout'

const DriverRegister = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: 基本資料, 2: 車輛資料, 3: 文件上傳, 4: 完成
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // 基本資料
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // 職業背景
    experience: '',
    previousFleets: '',
    currentJob: '',
    selfScore: '5',
    
    // 車輛資料
    licensePlate: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    carColor: '',
    hasInsurance: false,
    
    // 前科資料
    criminalRecord: '無',
    
    // 文件上傳
    idCardFront: null,
    idCardBack: null,
    driverLicense: null,
    carPhotos: [],
    policeCertificate: null
  })

  const [errors, setErrors] = useState({})
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [selectedFleet, setSelectedFleet] = useState('F001') // 預設車隊

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }))
    }
  }

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      carPhotos: files
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.name) newErrors.name = '請輸入姓名'
    if (!formData.phone) {
      newErrors.phone = '請輸入手機號碼'
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = '手機號碼格式不正確'
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

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.licensePlate) newErrors.licensePlate = '請輸入車牌號碼'
    if (!formData.carBrand) newErrors.carBrand = '請輸入車款'
    if (!formData.carModel) newErrors.carModel = '請輸入車型'
    if (!formData.carYear) newErrors.carYear = '請輸入出廠年份'
    if (!formData.carColor) newErrors.carColor = '請輸入車子顏色'
    
    return newErrors
  }

  const validateStep3 = () => {
    const newErrors = {}
    
    if (!formData.driverLicense) newErrors.driverLicense = '請上傳駕照照片'
    if (formData.carPhotos.length === 0) newErrors.carPhotos = '請上傳車子照片'
    
    return newErrors
  }

  const handleNext = () => {
    let newErrors = {}
    
    if (step === 1) {
      newErrors = validateStep1()
    } else if (step === 2) {
      newErrors = validateStep2()
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setStep(step + 1)
    setErrors({})
  }

  const handlePrev = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateStep3()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // 模擬註冊 API 呼叫
    setTimeout(() => {
      console.log('司機註冊資料：', formData)
      setRegisterSuccess(true)
      setLoading(false)
    }, 1500)
  }

  if (registerSuccess) {
    return (
      <AuthLayout 
        title="註冊成功"
        subtitle="請等待車隊管理員審核"
        role="司機"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              您的司機註冊申請已送出
            </p>
            <p className="text-sm text-gray-500">
              車隊管理員審核通過後，您將收到通知<br />
              屆時即可登入開始接單
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <p className="text-sm text-yellow-800 font-medium mb-2">⏱ 預計審核時間</p>
            <p className="text-sm text-yellow-700">
              一般為 1-2 個工作天，審核通過後會以簡訊通知。
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
              to={`/fleet/${selectedFleet}/driver/login`}
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
      title="司機註冊"
      subtitle="填寫資料後等待車隊管理員審核"
      role="司機"
    >
      {/* 步驟進度條 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>基本資料</span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>車輛資料</span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>文件上傳</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-5">
        {/* 步驟1：基本資料 */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="請輸入真實姓名"
                className={`
                  w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                  ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                `}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手機號碼 <span className="text-red-500">*</span>
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
                    ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電子信箱 <span className="text-red-500">*</span>
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
                    ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密碼 <span className="text-red-500">*</span>
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
                    ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                確認密碼 <span className="text-red-500">*</span>
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
                    ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </>
        )}

        {/* 步驟2：車輛資料 */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車牌號碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="ABC-1234"
                className={`
                  w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                  ${errors.licensePlate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                `}
              />
              {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車款 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleChange}
                  placeholder="Toyota"
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.carBrand ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                {errors.carBrand && <p className="mt-1 text-sm text-red-600">{errors.carBrand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車型 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  placeholder="Altis"
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.carModel ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                {errors.carModel && <p className="mt-1 text-sm text-red-600">{errors.carModel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出廠年份 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="carYear"
                  value={formData.carYear}
                  onChange={handleChange}
                  placeholder="2022"
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.carYear ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                {errors.carYear && <p className="mt-1 text-sm text-red-600">{errors.carYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車子顏色 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="carColor"
                  value={formData.carColor}
                  onChange={handleChange}
                  placeholder="白色"
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.carColor ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
                  `}
                />
                {errors.carColor && <p className="mt-1 text-sm text-red-600">{errors.carColor}</p>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hasInsurance"
                  checked={formData.hasInsurance}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">我有乘客險</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有無經驗 / 待過哪些車隊
              </label>
              <input
                type="text"
                name="previousFleets"
                value={formData.previousFleets}
                onChange={handleChange}
                placeholder="例：5年經驗，待過大安車隊、松山車隊"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目前職業
              </label>
              <input
                type="text"
                name="currentJob"
                value={formData.currentJob}
                onChange={handleChange}
                placeholder="例：全職司機"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自評分數 (1-10)
              </label>
              <select
                name="selfScore"
                value={formData.selfScore}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num} 分</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有無前科
              </label>
              <select
                name="criminalRecord"
                value={formData.criminalRecord}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="無">無</option>
                <option value="有">有（請於良民證說明）</option>
              </select>
            </div>
          </>
        )}

        {/* 步驟3：文件上傳 */}
        {step === 3 && (
          <>
            <div className="space-y-4">
              {/* 駕照照片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  駕照照片 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="driverLicense"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'driverLicense')}
                    className="hidden"
                  />
                  <label htmlFor="driverLicense" className="cursor-pointer">
                    {formData.driverLicense ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-green-600" size={32} />
                        <p className="text-sm text-gray-600">{formData.driverLicense.name}</p>
                        <p className="text-xs text-gray-400">點擊更換</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">點擊上傳駕照照片</p>
                        <p className="text-xs text-gray-400">JPG、PNG，檔案小於5MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.driverLicense && <p className="mt-1 text-sm text-red-600">{errors.driverLicense}</p>}
              </div>

              {/* 車子照片（可多張） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  車子照片 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="carPhotos"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="carPhotos" className="cursor-pointer">
                    {formData.carPhotos.length > 0 ? (
                      <div className="space-y-2">
                        <Camera className="mx-auto text-green-600" size={32} />
                        <p className="text-sm text-gray-600">已上傳 {formData.carPhotos.length} 張照片</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {formData.carPhotos.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`car-${index}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">點擊新增更多照片</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="mx-auto text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">點擊上傳車子照片</p>
                        <p className="text-xs text-gray-400">可選擇多張，JPG、PNG</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.carPhotos && <p className="mt-1 text-sm text-red-600">{errors.carPhotos}</p>}
              </div>

              {/* 良民證（選填） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  良民證（選填）
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="policeCertificate"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'policeCertificate')}
                    className="hidden"
                  />
                  <label htmlFor="policeCertificate" className="cursor-pointer">
                    {formData.policeCertificate ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-green-600" size={32} />
                        <p className="text-sm text-gray-600">{formData.policeCertificate.name}</p>
                        <p className="text-xs text-gray-400">點擊更換</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Shield className="mx-auto text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">點擊上傳良民證（選填）</p>
                        <p className="text-xs text-gray-400">JPG、PNG、PDF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-700">
                    送出申請後，需等待車隊管理員審核通過方可開始接單。
                    請確保上傳的文件清晰可辨。
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 導航按鈕 */}
        <div className="flex space-x-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              下一步
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>送出中...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>送出註冊</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 登入連結 */}
        <div className="text-center">
          <span className="text-sm text-gray-600">已經有帳號了？</span>
          <Link to="/fleet/F001/driver/login" className="text-sm text-blue-600 hover:text-blue-700 ml-1">
            立即登入
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default DriverRegister