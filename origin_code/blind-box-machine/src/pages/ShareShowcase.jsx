// src/pages/ShareShowcase.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

export default function ShareShowcase() {
    const { user } = useUser();
    const [shares, setShares] = useState([]);
    const [newShare, setNewShare] = useState({
        prize: "",
        content: "",
    });
    const [newComment, setNewComment] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShares();
    }, []);

    const fetchShares = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:7001/api/share/list");
            setShares(res.data);
        } catch (err) {
            console.error("获取分享失败:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddShare = async () => {
        if (!user) return alert("请先登录");
        if (!newShare.prize || !newShare.content) {
            return alert("请填写奖品和分享内容");
        }

        try {
            const res = await axios.post("http://localhost:7001/api/share/add", {
                user: user.username,
                prize: newShare.prize,
                content: newShare.content,
            });

            if (res.data.success) {
                setNewShare({ prize: "", content: "" });
                fetchShares();
                alert("分享成功！");
            }
        } catch (err) {
            alert("分享失败: " + err.message);
        }
    };

    const handleAddComment = async (shareId) => {
        const text = newComment[shareId];
        if (!text) return alert("请填写评论内容");

        try {
            const res = await axios.post("http://localhost:7001/api/share/comment", {
                shareId,
                user: user.username,
                text,
            });

            if (res.data.success) {
                setNewComment({ ...newComment, [shareId]: "" });
                fetchShares();
            }
        } catch (err) {
            alert("评论失败: " + err.message);
        }
    };

    const handleLike = async (id) => {
        try {
            const res = await axios.post("http://localhost:7001/api/share/like", { id });
            if (res.data.success) {
                fetchShares();
            }
        } catch (err) {
            alert("点赞失败: " + err.message);
        }
    };

    const handleDeleteShare = async (id) => {
        if (!window.confirm("确定要删除这条分享吗？")) return;

        try {
            const res = await axios.post("http://localhost:7001/api/share/delete", {
                id,
                user: user.username,
            });

            if (res.data.success) {
                fetchShares();
            } else {
                alert(res.data.msg);
            }
        } catch (err) {
            alert("删除失败: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-purple-600">加载中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
            {/* 移除了 Header 组件引用 */}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">
                    玩家秀 - 分享你的喜悦
                </h1>

                {/* 添加分享表单 */}
                {user && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-purple-600">分享我的奖品</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2">抽中的奖品</label>
                                <input
                                    type="text"
                                    placeholder="你抽中了什么奖品？"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={newShare.prize}
                                    onChange={(e) => setNewShare({ ...newShare, prize: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">分享内容</label>
                                <textarea
                                    placeholder="分享你的喜悦和体验..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={newShare.content}
                                    onChange={(e) => setNewShare({ ...newShare, content: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleAddShare}
                                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition duration-300 transform hover:-translate-y-0.5"
                            >
                                发布分享
                            </button>
                        </div>
                    </div>
                )}

                {/* 分享列表 */}
                <div className="space-y-6">
                    {shares.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <div className="text-5xl mb-4">🎁</div>
                            <h3 className="text-xl text-gray-600">暂无分享</h3>
                            <p className="text-gray-500 mt-2">
                                {user ? "成为第一个分享的人吧！" : "登录后分享你的奖品"}
                            </p>
                        </div>
                    ) : (
                        shares.map((share) => (
                            <div
                                key={share.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                                            <div className="ml-3">
                                                <div className="font-bold text-gray-800">{share.user}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(share.time).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {user && user.username === share.user && (
                                            <button
                                                onClick={() => handleDeleteShare(share.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center mb-3">
                                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                抽中奖品：{share.prize}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mt-3">{share.content}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => handleLike(share.id)}
                                                className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                <span>{share.likes || 0}</span>
                                            </button>

                                            <div className="flex items-center space-x-1 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                </svg>
                                                <span>{share.comments?.length || 0} 条评论</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 评论区域 */}
                                <div className="bg-gray-50 px-6 py-4">
                                    {share.comments && share.comments.length > 0 && (
                                        <div className="mb-4 space-y-4">
                                            {share.comments.map((comment) => (
                                                <div key={comment.id} className="flex">
                                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="bg-gray-100 rounded-lg p-3">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium text-gray-800">{comment.user}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(comment.time).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 mt-1">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {user && (
                                        <div className="flex items-start">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                                            <div className="ml-3 flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="添加评论..."
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    value={newComment[share.id] || ""}
                                                    onChange={(e) =>
                                                        setNewComment({ ...newComment, [share.id]: e.target.value })
                                                    }
                                                    onKeyPress={(e) => e.key === "Enter" && handleAddComment(share.id)}
                                                />
                                                <button
                                                    onClick={() => handleAddComment(share.id)}
                                                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-1 px-4 rounded-lg text-sm"
                                                >
                                                    评论
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}