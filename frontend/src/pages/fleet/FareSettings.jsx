import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Landmark, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  CreditCard
} from 'lucide-react'

const BankInfo = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [bankInfo, setBankInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!token || user?.role !== 'fleet-admin') {
      navigate('/fleet/login')
    }
  }, [navigate])

  useEffect(() => {
    setLoading(true)
    // 模擬從 API 取得銀行資訊
    setTimeout(() => {
      setBankInfo({
        bankName: '第一商業銀行',
        branch: '敦化分行',
        accountName: '叭叭出行股份有限公司',
        accountNumber: '123-456-789012',
        updatedAt: '2026-02-13 14:30'
      })
      setLoading(false)
    }, 500)
  }, [])

  const handleCopy = () => {
    if (bankInfo) {
      navigator.clipboard.writeText(bankInfo.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">銀行資訊</h1>
        <p className="text-gray-600 mt-1">平台收款帳戶（由超級管理員設定，不可修改）</p>
      </div>

      {/* 銀行資訊卡片 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-2">
            <Landmark className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">收款銀行帳戶</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 銀行名稱 */}
          <div className="flex items-start space-x-4 pb-4 border-b">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">銀行名稱</p>
              <p className="text-lg font-medium text-gray-800">{bankInfo?.bankName}</p>
            </div>
          </div>

          {/* 分行名稱 */}
          <div className="flex items-start space-x-4 pb-4 border-b">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">分行名稱</p>
              <p className="text-lg font-medium text-gray-800">{bankInfo?.branch}</p>
            </div>
          </div>

          {/* 戶名 */}
          <div className="flex items-start space-x-4 pb-4 border-b">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">戶名</p>
              <p className="text-lg font-medium text-gray-800">{bankInfo?.accountName}</p>
            </div>
          </div>

          {/* 帳號 */}
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">帳號</p>
              <div className="flex items-center space-x-3">
                <p className="text-lg font-mono font-medium text-gray-800">
                  {bankInfo?.accountNumber}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm text-green-600">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">複製帳號</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部資訊 */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-500">
              <AlertCircle size={16} />
              <span>此資訊由超級管理員設定，車隊管理員無法修改</span>
            </div>
            <span className="text-gray-400">最後更新：{bankInfo?.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* 使用說明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">繳費說明</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>請將每月租金匯入以上銀行帳戶</li>
          <li>匯款完成後，請至「租金繳費」頁面上傳繳費證明</li>
          <li>超級管理員確認收款後，系統會更新繳費狀態</li>
        </ul>
      </div>
    </div>
  )
}

export default BankInfo