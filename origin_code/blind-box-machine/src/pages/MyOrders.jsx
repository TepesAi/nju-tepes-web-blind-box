import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import axios from "axios";

export default function MyOrders() {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                const [orderRes, boxRes] = await Promise.all([
                    axios.post("http://localhost:7001/api/user/getOrders", { email: user.email }),
                    axios.get("http://localhost:7001/api/user/boxes")
                ]);

                if (orderRes.data.success && Array.isArray(orderRes.data.orders)) {
                    const boxMap = {};
                    for (const box of boxRes.data) {
                        boxMap[box.id] = box.name;
                    }

                    const enrichedOrders = orderRes.data.orders.map(order => ({
                        ...order,
                        boxName: boxMap[order.boxId] || "未知盲盒"
                    }));

                    setOrders(enrichedOrders);
                } else {
                    alert("订单获取失败");
                }
            } catch (err) {
                console.error("请求失败", err);
                alert("请求失败");
            }
        };

        fetchOrders();
    }, [user]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm("确定要删除该订单吗？");
        if (!confirmed || !user) return;

        try {
            const res = await axios.post("http://localhost:7001/api/user/deleteOrder", {
                id,
                email: user.email
            });
            if (res.data.success) {
                setOrders((prev) => prev.filter((order) => order.id !== id));
            } else {
                alert("删除失败：" + res.data.msg);
            }
        } catch (err) {
            console.error("删除失败", err);
            alert("删除失败");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">🧾 我的订单</h1>
            {orders.length === 0 ? (
                <div className="text-center text-gray-500">暂无抽奖记录</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded shadow p-4 flex flex-col sm:flex-row justify-between items-center"
                        >
                            <div className="text-center sm:text-left">
                                <div className="text-lg font-semibold">🎁 奖品：{order.prize}</div>
                                <div className="text-gray-600">来自盲盒：{order.boxName}</div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                <div className="text-sm text-gray-500">⏱ {new Date(order.time).toLocaleString()}</div>
                                <button
                                    onClick={() => handleDelete(order.id)}
                                    className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
