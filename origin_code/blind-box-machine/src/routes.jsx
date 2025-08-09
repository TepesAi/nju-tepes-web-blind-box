import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BoxList from "./pages/BoxList";
import BoxDetail from "./pages/BoxDetail";
import MyOrders from "./pages/MyOrders";
import DrawBox from "./pages/DrawBox";
import ShareShowcase from "./pages/ShareShowcase"; // 替换旧的 Showcase 和 ShareRoom

export default function AppRoutes({ setUser }) {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/boxes" element={<BoxList />} />
            <Route path="/boxes/:id" element={<BoxDetail />} />
            <Route path="/draw/:id" element={<DrawBox />} />
            <Route path="/orders" element={<MyOrders />} />
            {/* 替换为新的玩家秀页面 */}
            <Route path="/showcase" element={<ShareShowcase />} />
            {/* 移除旧的 /share-room 路由 */}
        </Routes>
    );
}