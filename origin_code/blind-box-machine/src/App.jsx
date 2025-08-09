import { Link } from "react-router-dom";
import AppRoutes from "./routes";
import { useUser } from "./contexts/UserContext";

export default function App() {
  const { user, setUser } = useUser();


  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.hash = "#/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-purple-600">🎁 盲盒抽奖机</div>
        <div className="space-x-4 text-sm font-medium">
          <Link to="/" className="text-gray-700 hover:text-purple-600">首页</Link>
          <Link to="/boxes" className="text-gray-700 hover:text-purple-600">盲盒列表</Link>
          <Link to="/orders" className="text-gray-700 hover:text-purple-600">我的订单</Link>
          <Link to="/showcase" className="text-gray-700 hover:text-purple-600">玩家秀</Link>
          {/* 移除旧的 "晒单聊天室" 链接 */}

          {user ? (
            <>
              <span className="text-gray-600">👤 {user.username} | 💰 {user.balance.toFixed(2)}元</span>
              <button onClick={logout} className="text-red-500 hover:underline">退出登录</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-purple-600">登录</Link>
              <Link to="/register" className="text-gray-700 hover:text-purple-600">注册</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 p-4">
        <AppRoutes />
      </main>
    </div>
  );
}