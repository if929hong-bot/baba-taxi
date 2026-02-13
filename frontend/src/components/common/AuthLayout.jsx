import { Link } from 'react-router-dom'

const AuthLayout = ({ children, title, subtitle, role }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-blue-600">叭叭</span>
            <span className="text-3xl font-bold text-gray-800">出行</span>
          </Link>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {/* 角色標籤 */}
        {role && (
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
              {role}
            </span>
          </div>
        )}

        {/* 主要卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
          {children}
        </div>

        {/* 底部連結 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          © 2026 叭叭出行. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default AuthLayout