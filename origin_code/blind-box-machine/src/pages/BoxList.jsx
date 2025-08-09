// src/pages/BoxList.jsx
import { useEffect, useState } from "react";
import BoxCard from "../components/BoxCard";
import { FiSearch, FiX, FiFilter, FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function BoxList() {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);

    // 搜索和筛选状态
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [prizeKeyword, setPrizeKeyword] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [filteredBoxes, setFilteredBoxes] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        async function fetchBoxes() {
            try {
                console.log("Fetching boxes from backend...");
                const res = await fetch("http://localhost:7001/api/user/boxes");
                const data = await res.json();
                setBoxes(data);
                setFilteredBoxes(data);
                setLoading(false);
            } catch (err) {
                console.error("获取盲盒失败：", err);
                setLoading(false);
            }
        }

        fetchBoxes();
    }, []);

    // 应用搜索和筛选
    useEffect(() => {
        if (boxes.length === 0) return;

        let result = [...boxes];

        // 名称搜索
        if (searchTerm) {
            result = result.filter(box =>
                box.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 价格范围筛选
        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                result = result.filter(box => box.price >= min);
            }
        }
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                result = result.filter(box => box.price <= max);
            }
        }

        // 奖品关键词筛选
        if (prizeKeyword) {
            result = result.filter(box =>
                box.prizes && box.prizes.some(prize =>
                    prize.name.toLowerCase().includes(prizeKeyword.toLowerCase())
                )
            );
        }

        // 排序
        if (sortBy === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredBoxes(result);
    }, [boxes, searchTerm, minPrice, maxPrice, prizeKeyword, sortBy]);

    const resetFilters = () => {
        setSearchTerm("");
        setMinPrice("");
        setMaxPrice("");
        setPrizeKeyword("");
        setSortBy("default");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-purple-600">加载盲盒中...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-purple-700">探索盲盒世界 🎁</h2>

            {/* 搜索栏 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜索盲盒名称..."
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FiFilter /> 筛选
                    </button>
                </div>

                {/* 高级筛选面板 */}
                {showFilters && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">最低价格</label>
                            <input
                                type="number"
                                placeholder="¥0"
                                min="0"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">最高价格</label>
                            <input
                                type="number"
                                placeholder="¥不限"
                                min="0"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">奖品关键词</label>
                            <input
                                type="text"
                                placeholder="输入奖品名称..."
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={prizeKeyword}
                                onChange={(e) => setPrizeKeyword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">排序方式</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">默认排序</option>
                                <option value="price-asc">价格从低到高</option>
                                <option value="price-desc">价格从高到低</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={resetFilters}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            >
                                重置
                            </button>
                            <span className="text-sm text-gray-500">
                                找到 {filteredBoxes.length} 个盲盒
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 盲盒列表 */}
            {filteredBoxes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        没有找到匹配的盲盒
                    </h3>
                    <p className="text-gray-500 mb-4">
                        尝试调整搜索条件或重置筛选器
                    </p>
                    <button
                        onClick={resetFilters}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                    >
                        显示所有盲盒
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredBoxes.map((box) => (
                        <BoxCard key={box.id} box={box} />
                    ))}
                </div>
            )}
        </div>
    );
}