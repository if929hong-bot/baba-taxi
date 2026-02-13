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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">叭叭出行</h1>
            <p className="mb-8">請選擇登入角色</p>
            <div className="space-x-4">
              <a href="/super-admin/login" className="btn-primary">超級管理員</a>
              <a href="/fleet/login" className="btn-primary">車隊管理員</a>
              <a href="/fleet/F001/driver/login" className="btn-primary">司機</a>
              <a href="/fleet/F001/passenger" className="btn-primary">乘客</a>
            </div>
          </div>
        } />
        
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
        
        {/* 車隊管理員 - 認證頁面 (不使用 Layout) */}
        <Route path="/fleet/login" element={<FleetLogin />} />
        <Route path="/fleet/register" element={<FleetRegister />} />
        <Route path="/fleet/forgot-password" element={<FleetForgotPassword />} />

        {/* 車隊管理員後台 (使用 Layout) */}
        <Route path="/fleet/:fleetCode/admin" element={<Layout />}>
          <Route index element={<FleetDashboard />} />
          <Route path="drivers/pending" element={<DriverPending />} />
          <Route path="drivers" element={<DriverList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="settings/fare" element={<FareSettings />} />
          <Route path="bank" element={<BankInfo />} />
        </Route>
        
        {/* 司機登入頁 - 待補 */}
        <Route path="/fleet/:fleetCode/driver/login" element={
          <div className="p-8 text-center">司機登入頁 (施工中)</div>
        } />
        
        {/* 乘客端 - 待補 */}
        <Route path="/fleet/:fleetCode/passenger" element={
          <div className="p-8 text-center">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">乘客叫車</h2>
              <p>車隊編號：{window.location.pathname.split('/')[2]}</p>
              <p className="text-gray-500 mt-4">此功能施工中</p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App