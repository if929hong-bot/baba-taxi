import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'

const Header = ({ sidebarOpen, setSidebarOpen, fleetCode, sidebarType }) => {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // 從 localStorage 取得用戶資訊（之後會用 store 取代）
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  // 根據不同角色取得標題
  const getTitle = () => {
    if (sidebarType === 'super-admin') return '超級管理員後台'
    if (sidebarType === 'fleet-admin') return `${fleetCode} - 車隊管理後台`
    if (sidebarType === 'driver') return `${fleetCode} - 司機任務大廳`
    return '叭叭出行'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：選單按鈕 + Logo */}
          <div className="flex items-center">
            {/* 選單按鈕（只有需要側邊欄的頁面才顯示） */}
            {sidebarType && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            
            {/* Logo */}
            <Link to="/" className="ml-2 lg:ml-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">叭叭</span>
              <span className="text-2xl font-bold text-gray-800">出行</span>
            </Link>
            
            {/* 頁面標題（桌機版） */}
            <span className="hidden lg:block ml-6 text-lg font-medium text-gray-600">
              {getTitle()}
            </span>
          </div>

          {/* 右側：用戶資訊 */}
          <div className="flex items-center space-x-4">
            {/* 車隊編號顯示（如果有） */}
            {fleetCode && (
              <div className="hidden md:block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                車隊編號：{fleetCode}
              </div>
            )}
            
            {/* 用戶選單 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || '訪客'}
                </span>
              </button>

              {/* 下拉選單 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.phone}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>登出</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      前往登入
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 頁面標題（手機版） */}
        <div className="lg:hidden pb-2 text-sm text-gray-600 border-t pt-2">
          {getTitle()}
        </div>
      </div>
    </header>
  )
}

export default Header