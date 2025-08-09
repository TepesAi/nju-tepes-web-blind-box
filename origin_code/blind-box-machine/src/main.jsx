// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom"; // 改为 HashRouter
import { UserProvider } from "./contexts/UserContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter> {/* 关键修改：替换 BrowserRouter */}
      <UserProvider>
        <App />
      </UserProvider>
    </HashRouter>
  </React.StrictMode>
);