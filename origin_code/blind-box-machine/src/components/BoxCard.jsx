// src/components/BoxCard.jsx
import { Link } from "react-router-dom";

export default function BoxCard({ box }) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{box.name}</h3>
                    <span className="text-lg font-semibold text-purple-600">
                        ¥{box.price.toFixed(2)}
                    </span>
                </div>

                {box.prizes && box.prizes.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">包含奖品:</p>
                        <div className="flex flex-wrap gap-1">
                            {box.prizes.slice(0, 3).map((prize, index) => (
                                <span
                                    key={index}
                                    className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                                >
                                    {prize.name}
                                </span>
                            ))}
                            {box.prizes.length > 3 && (
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                                    +{box.prizes.length - 3} 更多
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <Link
                    to={`/boxes/${box.id}`}
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg transition mt-4"
                >
                    查看详情
                </Link>
            </div>
        </div>
    );
}