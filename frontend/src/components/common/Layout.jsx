import { useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { fleetCode } = useParams()
  
  // 判斷當前路徑，決定要顯示哪種側邊欄
  const getSidebarType = () => {
    if (location.pathname.includes('/super-admin')) {
      return 'super-admin'
    } else if (location.pathname.includes('/fleet/') && location.pathname.includes('/admin')) {
      return 'fleet-admin'
    } else if (location.pathname.includes('/fleet/') && location.pathname.includes('/driver')) {
      return 'driver'
    } else {
      return null // 乘客端或其他頁面不顯示側邊欄
    }
  }

  const sidebarType = getSidebarType()
  const showSidebar = sidebarType !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header 所有頁面都會顯示 */}
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        fleetCode={fleetCode}
        sidebarType={sidebarType}
      />
      
      {/* 雙欄布局：側邊欄 + 主要內容 */}
      <div className="flex">
        {/* 側邊欄（條件式顯示） */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen}
            type={sidebarType}
            fleetCode={fleetCode}
          />
        )}
        
        {/* 主要內容區域 */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${showSidebar ? 'lg:ml-64' : ''}
            p-4 md:p-6 lg:p-8
          `}
        >
          {/* 用於顯示巢狀路由的內容 */}
          <Outlet />
          {/* 也可以直接傳入 children */}
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout