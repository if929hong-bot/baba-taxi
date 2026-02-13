import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import SuperAdminLogin from './pages/super-admin/Login'
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import BankSettings from './pages/super-admin/BankSettings'
import FleetApproval from './pages/super-admin/FleetApproval'
import RentConfirm from './pages/super-admin/RentConfirm'
import DriversOverview from './pages/super-admin/DriversOverview'
import FleetManage from './pages/super-admin/FleetManage'
import FleetLogin from './pages/fleet/Login'
import FleetRegister from './pages/fleet/Register'
import FleetForgotPassword from './pages/fleet/ForgotPassword'
import FleetDashboard from './pages/fleet/Dashboard'
import DriverPending from './pages/fleet/DriverPending'
import DriverList from './pages/fleet/DriverList'
import OrderList from './pages/fleet/OrderList'
import Revenue from './pages/fleet/Revenue'
import FareSettings from './pages/fleet/FareSettings'
import BankInfo from './pages/fleet/BankInfo'

// 司機端元件
import DriverLogin from './pages/driver/Login'
import DriverRegister from './pages/driver/Register'
import DriverForgotPassword from './pages/driver/ForgotPassword'
import TaskHall from './pages/driver/TaskHall'
import TaskDetail from './pages/driver/TaskDetail'
import MyTasks from './pages/driver/MyTasks'
import TodayIncome from './pages/driver/TodayIncome'
import Profile from './pages/driver/Profile'

// 乘客端元件
import PassengerHome from './pages/passenger/Home'
import PassengerMatching from './pages/passenger/Matching'
import PassengerTracking from './pages/passenger/Tracking'
import PassengerComplete from './pages/passenger/Complete'

// 首頁元件
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 導航列 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">叭叭</span>
              <span className="text-2xl font-bold text-gray-800">出行</span>
            </div>
            <div className="flex space-x-4">
              <a href="/super-admin/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                超級管理員
              </a>
              <a href="/fleet/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                車隊管理員
              </a>
              <a href="/fleet/F001/driver/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                司機
              </a>
              <a href="/fleet/F001/passenger" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                乘客
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 標題區 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            歡迎來到 <span className="text-blue-600">叭叭出行</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            最專業的車隊管理平台，為您提供完整的叫車服務解決方案
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* 超級管理員卡片 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-blue-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">超級管理員</h2>
              <p className="text-gray-600 mb-6">管理所有車隊、審核申請、設定銀行資訊</p>
              <a 
                href="/super-admin/login" 
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                登入後台
              </a>
            </div>
          </div>

          {/* 車隊管理員卡片 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-green-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">車隊管理員</h2>
              <p className="text-gray-600 mb-6">管理司機、查看營收、設定費率</p>
              <div className="space-y-3">
                <a 
                  href="/fleet/login" 
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  登入
                </a>
                <a 
                  href="/fleet/register" 
                  className="block w-full border-2 border-green-600 text-green-600 text-center py-3 rounded-xl font-medium hover:bg-green-50 transition-colors"
                >
                  註冊新車隊
                </a>
              </div>
            </div>
          </div>

          {/* 司機卡片 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-yellow-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">司機</h2>
              <p className="text-gray-600 mb-6">接單、賺錢、管理行程</p>
              <div className="space-y-3">
                <a 
                  href="/fleet/F001/driver/login" 
                  className="block w-full bg-yellow-600 text-white text-center py-3 rounded-xl font-medium hover:bg-yellow-700 transition-colors"
                >
                  登入
                </a>
                <a 
                  href="/fleet/F001/driver/register" 
                  className="block w-full border-2 border-yellow-600 text-yellow-600 text-center py-3 rounded-xl font-medium hover:bg-yellow-50 transition-colors"
                >
                  註冊成為司機
                </a>
              </div>
            </div>
          </div>

          {/* 乘客卡片 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-purple-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">乘客</h2>
              <p className="text-gray-600 mb-6">叫車、追蹤、輕鬆出行</p>
              <a 
                href="/fleet/F001/passenger" 
                className="block w-full bg-purple-600 text-white text-center py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                開始叫車
              </a>
            </div>
          </div>
        </div>

        {/* 特色說明 */}
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            為什麼選擇 <span className="text-blue-600">叭叭出行</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">安全可靠</h3>
              <p className="text-gray-600">所有司機都經過嚴格審核，保障乘客安全</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">即時快速</h3>
              <p className="text-gray-600">即時配對，司機快速抵達</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">價格透明</h3>
              <p className="text-gray-600">每趟行程價格公開透明，無隱藏費用</p>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          © 2026 叭叭出行. All rights reserved.
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 超級管理員登入頁 */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        
        {/* 超級管理員後台 */}
        <Route path="/super-admin" element={<Layout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="fleets/pending" element={<FleetApproval />} />
          <Route path="bank" element={<BankSettings />} />
          <Route path="rent" element={<RentConfirm />} />
          <Route path="drivers" element={<DriversOverview />} />
          <Route path="fleets" element={<FleetManage />} />
        </Route>
        
        {/* 車隊管理員 - 認證頁面 */}
        <Route path="/fleet/login" element={<FleetLogin />} />
        <Route path="/fleet/register" element={<FleetRegister />} />
        <Route path="/fleet/forgot-password" element={<FleetForgotPassword />} />

        {/* 車隊管理員後台 */}
        <Route path="/fleet/:fleetCode/admin" element={<Layout />}>
          <Route index element={<FleetDashboard />} />
          <Route path="drivers/pending" element={<DriverPending />} />
          <Route path="drivers" element={<DriverList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="settings/fare" element={<FareSettings />} />
          <Route path="bank" element={<BankInfo />} />
        </Route>
        
        {/* 司機 - 認證頁面 */}
        <Route path="/fleet/:fleetCode/driver/login" element={<DriverLogin />} />
        <Route path="/fleet/:fleetCode/driver/register" element={<DriverRegister />} />
        <Route path="/fleet/:fleetCode/driver/forgot-password" element={<DriverForgotPassword />} />

        {/* 司機後台 */}
        <Route path="/fleet/:fleetCode/driver" element={<Layout />}>
          <Route index element={<TaskHall />} />
          <Route path="task/:taskId" element={<TaskDetail />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="income" element={<TodayIncome />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 乘客端 */}
        <Route path="/fleet/:fleetCode/passenger" element={<PassengerHome />} />
        <Route path="/fleet/:fleetCode/passenger/matching" element={<PassengerMatching />} />
        <Route path="/fleet/:fleetCode/passenger/tracking" element={<PassengerTracking />} />
        <Route path="/fleet/:fleetCode/passenger/complete" element={<PassengerComplete />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App