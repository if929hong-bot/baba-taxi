import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const ActivityList = ({ activities }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />
      default:
        return <AlertCircle size={16} className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '待審核'
      case 'approved': return '已通過'
      case 'rejected': return '已拒絕'
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-800">近期活動</h3>
      </div>
      <div className="divide-y">
        {activities.map((activity, index) => (
          <div key={index} className="px-6 py-4 flex items-center space-x-3 hover:bg-gray-50">
            {getStatusIcon(activity.status)}
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${activity.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
              ${activity.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
            `}>
              {getStatusText(activity.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityList