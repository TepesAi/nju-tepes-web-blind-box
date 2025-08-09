import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // 移除了 useNavigate
import { useUser } from "../contexts/UserContext";

export default function BoxDetail() {
    const { id } = useParams();
    const { user } = useUser();
    const [box, setBox] = useState(null);

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await fetch("http://localhost:7001/api/user/boxDetail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                const result = await res.json();

                if (result && result.prizes) {
                    setBox(result);
                } else {
                    alert("获取盲盒详情失败！");
                }
            } catch (err) {
                console.error("请求失败：", err);
                alert("请求失败！");
            }
        }

        fetchDetail();
    }, [id]);

    // 使用 Hash 跳转代替 navigate
    const goToDraw = () => {
        window.location.hash = `#/draw/${id}`;
    };

    if (!box) return <div className="p-6 text-center text-gray-500">加载中...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full">
                <h2 className="text-3xl font-bold text-center mb-4">{box.name}</h2>

                <p className="text-gray-600 text-center mb-4">
                    每次抽取价格：<span className="text-green-600 font-semibold">￥{box.price.toFixed(2)}</span>
                </p>

                <h3 className="text-xl font-semibold mb-2">🎁 奖品列表</h3>
                {box.prizes.length === 0 ? (
                    <p className="text-gray-500">该盲盒暂无奖品</p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-700 mb-6">
                        {box.prizes.map((prize) => (
                            <li
                                key={prize.id}
                                className="bg-gray-100 rounded px-2 py-1 text-center text-sm"
                            >
                                🎁 {prize.name}（{prize.weight}%）
                            </li>
                        ))}
                    </ul>
                )}

                <div className="text-center">
                    {user ? (
                        <button
                            onClick={goToDraw} // 使用新的跳转方法
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-lg"
                        >
                            🎉 抽奖试试手气！
                        </button>
                    ) : (
                        <p className="text-red-500 text-center">请先登录才能抽奖</p>
                    )}
                </div>
            </div>
        </div>
    );
}