import { ArrowUp, ArrowDown } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
        {/* 如果有 change 才顯示，沒有就不顯示 */}
        {change !== undefined && (
          <div className={`
            flex items-center text-sm font-medium
            ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}
          `}>
            {changeType === 'increase' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}

export default StatCard