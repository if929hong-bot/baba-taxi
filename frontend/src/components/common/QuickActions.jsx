import { useNavigate } from 'react-router-dom'
import { Users, Landmark, Receipt, Car, Settings, Ban } from 'lucide-react'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    { name: '車隊審核', path: '/super-admin/fleets/pending', icon: Users, color: 'blue' },
    { name: '銀行設定', path: '/super-admin/bank', icon: Landmark, color: 'green' },
    { name: '租金確認', path: '/super-admin/rent', icon: Receipt, color: 'yellow' },
    { name: '司機總覽', path: '/super-admin/drivers', icon: Car, color: 'purple' },
    { name: '車隊管理', path: '/super-admin/fleets', icon: Settings, color: 'gray' },
    { name: '停權管理', path: '/super-admin/fleets?status=blocked', icon: Ban, color: 'red' },
  ]

  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-4">快速操作</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`
              p-4 rounded-lg flex flex-col items-center space-y-2
              transition-colors ${colors[action.color]}
            `}
          >
            <action.icon size={24} />
            <span className="text-xs font-medium">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions