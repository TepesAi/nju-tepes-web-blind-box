// src/pages/DrawBox.jsx
import { useParams } from "react-router-dom"; // 移除了 useNavigate
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DrawBox() {
    const { id } = useParams();
    const { user, setUser } = useUser();
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnPrize, setDrawnPrize] = useState(null);
    const [box, setBox] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        async function fetchBoxDetail() {
            try {
                const res = await axios.post("http://localhost:7001/api/user/boxDetail", { id: parseInt(id) });
                if (res.data) {
                    setBox(res.data);
                } else {
                    alert("找不到该盲盒信息");
                }
            } catch (err) {
                alert("请求失败：" + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchBoxDetail();
    }, [id]);

    const handleDraw = async () => {
        if (!user) return alert("请先登录");
        if (user.balance < box.price) return alert("余额不足，请充值");

        setIsDrawing(true);
        setDrawnPrize(null);
        setShowResult(false);

        try {
            const res = await axios.post("http://localhost:7001/api/user/drawBox", {
                email: user.email,
                boxId: box.id,
            });

            if (res.data.success) {
                setTimeout(() => {
                    setDrawnPrize(res.data.data.prize);
                    setUser({ ...user, balance: res.data.data.balance });
                    setShowResult(true);
                }, 2000);
            } else {
                alert(res.data.msg);
                setIsDrawing(false);
            }
        } catch (err) {
            alert("请求失败：" + err.message);
            setIsDrawing(false);
        }
    };

    // 使用 Hash 跳转代替 navigate
    const goToOrders = () => {
        window.location.hash = "#/orders";
    };

    if (loading) {
        return <div className="text-center mt-10">加载中...</div>;
    }

    if (!box) {
        return (
            <div className="text-center mt-10 text-xl">
                ❌ 找不到该盲盒（id: {id}）
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
            <h1 className="text-3xl font-bold mb-6">抽取：{box.name}</h1>

            {!showResult && !isDrawing && !drawnPrize && (
                <>
                    <p className="mb-4 text-gray-600">每次抽奖需支付 {box.price} 元</p>
                    <p className="mb-6 text-gray-500">
                        当前余额：{user?.balance.toFixed(2)} 元
                    </p>
                    <button
                        onClick={handleDraw}
                        disabled={isDrawing}
                        className={`px-6 py-3 text-white text-lg rounded transition ${isDrawing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                            }`}
                    >
                        立即抽奖
                    </button>
                </>
            )}

            {isDrawing && !showResult && (
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 mb-8">
                        <div className="absolute inset-0 bg-purple-500 rounded-lg transform rotate-45 animate-pulse shadow-xl"></div>
                        <div className="absolute inset-2 bg-purple-600 rounded-lg transform rotate-45 animate-ping shadow-lg"></div>
                        <div className="absolute inset-4 bg-purple-700 rounded-lg transform rotate-45"></div>
                    </div>

                    <div className="text-xl font-semibold text-purple-700 animate-pulse">
                        正在抽取奖品，请稍候...
                    </div>

                    <div className="flex mt-6 space-x-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {showResult && drawnPrize && (
                <div className="mt-8 text-center animate-fade-in">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                        🎉 恭喜你抽中了：
                    </h2>
                    <div className="text-4xl font-bold text-purple-700 mb-6 transform scale-125 transition duration-500">
                        {drawnPrize}
                    </div>
                    <button
                        onClick={goToOrders} // 使用修改后的跳转函数
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition transform hover:scale-105"
                    >
                        查看我的订单
                    </button>
                </div>
            )}
        </div>
    );
}