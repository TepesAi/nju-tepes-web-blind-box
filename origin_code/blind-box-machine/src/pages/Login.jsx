import { useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function Login() {
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e) {
        e.preventDefault();

        if (!email || !password) {
            alert("请输入完整信息！");
            return;
        }

        try {
            const res = await fetch("http://localhost:7001/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if (result.success) {
                const { username, balance } = result.data;
                setUser({ email, username, balance });
                localStorage.setItem(
                    "user",
                    JSON.stringify({ email, username, balance })
                );
                alert("登录成功！");
                window.location.hash = "#/boxes";
            } else {
                alert(result.msg || "登录失败");
            }
        } catch (err) {
            console.error("请求失败", err);
            alert("请求后端接口失败");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-lg rounded p-8 w-80"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                    登录
                </h2>
                <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded"
                >
                    登录
                </button>
            </form>
        </div>
    );
}
