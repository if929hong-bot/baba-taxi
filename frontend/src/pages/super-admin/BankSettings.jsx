import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Save, AlertCircle, CheckCircle, Edit2 } from 'lucide-react'

const BankSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    branch: '',
    accountName: '',
    accountNumber: ''
  })

  const [formData, setFormData] = useState({
    bankName: '',
    branch: '',
    accountName: '',
    accountNumber: ''
  })

  // 檢查登入狀態
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'super-admin') {
      navigate('/super-admin/login')
    }
  }, [navigate])

  // 模擬載入銀行資訊
  useEffect(() => {
    const loadBankInfo = () => {
      setLoading(true)
      
      // 模擬 API 呼叫
      setTimeout(() => {
        const mockData = {
          bankName: '第一商業銀行',
          branch: '敦化分行',
          accountName: '叭叭出行股份有限公司',
          accountNumber: '123-456-789012'
        }
        
        setBankInfo(mockData)
        setFormData(mockData)
        setLoading(false)
      }, 800)
    }

    loadBankInfo()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    // 模擬儲存
    setTimeout(() => {
      setBankInfo(formData)
      setEditMode(false)
      setSaving(false)
      setMessage({ 
        type: 'success', 
        text: '銀行資訊更新成功！' 
      })
      
      // 3秒後清除訊息
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }, 1000)
  }

  const handleCancel = () => {
    setFormData(bankInfo)
    setEditMode(false)
    setMessage({ type: '', text: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">銀行設定</h1>
          <p className="text-gray-600 mt-1">設定平台收款銀行帳戶，車隊管理員將可查看（不可編輯）</p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit2 size={18} />
            <span>編輯資訊</span>
          </button>
        )}
      </div>

      {/* 提示訊息 */}
      {message.text && (
        <div className={`
          flex items-center space-x-2 p-4 rounded-lg
          ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ''}
          ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
        `}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{message.text}</p>
        </div>
      )}

      {/* 銀行資訊卡片 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Landmark className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">收款銀行帳戶</h2>
          </div>
        </div>

        <div className="p-6">
          {editMode ? (
            // 編輯模式
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    銀行名稱
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：第一商業銀行"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分行名稱
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：敦化分行"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    戶名
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：叭叭出行股份有限公司"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    帳號
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：123-456-789012"
                    required
                  />
                </div>
              </div>

              {/* 編輯模式按鈕 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>儲存中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>儲存設定</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // 檢視模式
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">銀行名稱</p>
                  <p className="text-lg font-medium text-gray-800">{bankInfo.bankName || '未設定'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">分行名稱</p>
                  <p className="text-lg font-medium text-gray-800">{bankInfo.branch || '未設定'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">戶名</p>
                  <p className="text-lg font-medium text-gray-800">{bankInfo.accountName || '未設定'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">帳號</p>
                  <p className="text-lg font-medium text-gray-800">{bankInfo.accountNumber || '未設定'}</p>
                </div>
              </div>

              {/* 重要提示 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">重要提醒</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      此銀行資訊將顯示給所有車隊管理員查看，車隊管理員無法編輯此資訊。
                      請務必確認帳號正確無誤。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作紀錄（可選） */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">最近更新紀錄</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">上次更新：2026年2月13日 14:30</span>
            </div>
            <span className="text-gray-500">超級管理員 0975521219</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span className="text-gray-600">建立時間：2026年1月1日 10:00</span>
            </div>
            <span className="text-gray-500">系統初始化</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankSettings