// src/contexts/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// 创建上下文
const UserContext = createContext();

// 创建 Provider 组件
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    // 页面加载时从 localStorage 获取
    useEffect(() => {
        const saved = localStorage.getItem("user");
        if (saved) setUser(JSON.parse(saved));
    }, []);

    // 当 user 变化时写入 localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

// 快捷 Hook，供组件使用
export function useUser() {
    return useContext(UserContext);
}
