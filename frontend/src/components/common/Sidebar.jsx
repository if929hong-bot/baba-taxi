import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  Settings,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  MapPin,
  LogOut,
  Ban,
  Banknote,
  ClipboardList
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen, type, fleetCode }) => {
  
  // 超級管理員選單
  const superAdminMenu = [
    { name: '儀表板', path: '/super-admin', icon: LayoutDashboard },
    { name: '車隊審核', path: '/super-admin/fleets/pending', icon: Users },
    { name: '銀行設定', path: '/super-admin/bank', icon: Banknote },
    { name: '租金確認', path: '/super-admin/rent', icon: DollarSign },
    { name: '司機總覽', path: '/super-admin/drivers', icon: Car },
    { name: '車隊管理', path: '/super-admin/fleets', icon: Settings },
  ]

  // 車隊管理員選單
  const fleetAdminMenu = [
    { name: '儀表板', path: `/fleet/${fleetCode}/admin`, icon: LayoutDashboard, end: true },
    { name: '司機審核', path: `/fleet/${fleetCode}/admin/drivers/pending`, icon: ClipboardList },
    { name: '司機列表', path: `/fleet/${fleetCode}/admin/drivers`, icon: Users },
    { name: '訂單查詢', path: `/fleet/${fleetCode}/admin/orders`, icon: FileText },
    { name: '營收報表', path: `/fleet/${fleetCode}/admin/revenue`, icon: DollarSign },
    { name: '費率設定', path: `/fleet/${fleetCode}/admin/settings/fare`, icon: Settings },
    { name: '銀行資訊', path: `/fleet/${fleetCode}/admin/bank`, icon: CreditCard },
  ]

  // 司機端選單
  const driverMenu = [
    { name: '任務大廳', path: `/fleet/${fleetCode}/driver`, icon: LayoutDashboard, end: true },
    { name: '我的任務', path: `/fleet/${fleetCode}/driver/tasks`, icon: ClipboardList },
    { name: '今日收入', path: `/fleet/${fleetCode}/driver/income`, icon: DollarSign },
    { name: '個人資料', path: `/fleet/${fleetCode}/driver/profile`, icon: Users },
  ]

  // 根據類型選擇選單
  const getMenu = () => {
    switch(type) {
      case 'super-admin':
        return superAdminMenu
      case 'fleet-admin':
        return fleetAdminMenu
      case 'driver':
        return driverMenu
      default:
        return []
    }
  }

  const menuItems = getMenu()

  return (
    <>
      {/* 手機版側邊欄背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 側邊欄本體 */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen pt-16 bg-white border-r
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-auto lg:pt-0
          w-64
        `}
      >
        <nav className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `
                    flex items-center p-2 text-base font-medium rounded-lg
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* 分隔線 */}
          <div className="my-4 border-t" />

          {/* 下線狀態資訊 */}
          <div className="px-3 py-2">
            <p className="text-xs text-gray-500 mb-2">目前車隊</p>
            <p className="text-sm font-medium text-gray-900">{fleetCode || '無'}</p>
          </div>

          {/* 登出按鈕（手機版） */}
          <button
            className="lg:hidden w-full mt-4 flex items-center p-2 text-base font-medium text-red-600 rounded-lg hover:bg-red-50"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/'
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>登出</span>
          </button>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar