import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios"; // 添加axios用于API调用

export default function Home() {
    const { user, setUser } = useUser();

    async function handleRecharge() {
        const amount = parseFloat(prompt("请输入充值金额：", "10"));
        if (!isNaN(amount) && amount > 0) {
            try {
                // 调用后端充值API
                const res = await axios.post("http://localhost:7001/api/user/recharge", {
                    email: user.email,
                    amount
                });

                if (res.data.success) {
                    // 更新前端状态
                    const newUser = { ...user, balance: user.balance + amount };
                    setUser(newUser);
                    alert(`充值成功！当前余额：${newUser.balance.toFixed(2)} 元`);
                } else {
                    alert(res.data.msg);
                }
            } catch (err) {
                alert("充值失败：" + err.message);
            }
        } else {
            alert("请输入有效的金额！");
        }
    }

    async function handleCheckIn() {
        try {
            // 调用后端签到API
            const res = await axios.post("http://localhost:7001/api/user/signIn", {
                email: user.email
            });

            if (res.data.success) {
                // 更新前端状态
                const newUser = { ...user, balance: user.balance + 10 };
                setUser(newUser);
                alert("签到成功！获得 10 元奖励");
            } else {
                alert(res.data.msg);
            }
        } catch (err) {
            alert("签到失败：" + err.message);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200 p-4">
            <h1 className="text-4xl font-bold mb-4 text-center">欢迎来到盲盒抽奖机</h1>

            {user && (
                <>
                    <div className="mb-4 text-lg text-gray-700 font-medium bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-md">
                        欢迎你，<span className="text-purple-600 font-bold">{user.username}</span>！
                        当前余额：<span className="text-green-600 font-bold">💰 {user.balance.toFixed(2)} 元</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        <button
                            onClick={handleRecharge}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                        >
                            💰 充值
                        </button>
                        <button
                            onClick={handleCheckIn}
                            className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                        >
                            ✅ 每日签到
                        </button>
                    </div>
                </>
            )}

            <div className="flex flex-wrap justify-center gap-4 mt-6">
                {user ? (
                    <>
                        <Link to="/boxes" className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>🎁</span> 查看盲盒
                        </Link>
                        <Link to="/orders" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>📋</span> 我的订单
                        </Link>
                        <Link to="/showcase" className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>🏆</span> 玩家秀
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>🔑</span> 登录
                        </Link>
                        <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>📝</span> 注册
                        </Link>
                        <Link to="/boxes" className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <span>🎁</span> 查看盲盒
                        </Link>
                    </>
                )}
            </div>

            {/* 添加视觉装饰元素 */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-pink-400 rounded-full opacity-20 blur-xl"></div>
        </div>
    );
}