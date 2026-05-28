import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from 'antd/locale/zh_CN';
import Home from "@/pages/Home";
import { setMessageApi } from "@/api/request";

function MessageHolder() {
  const { message } = AntApp.useApp();
  setMessageApi(message);
  return null;
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ec4899',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <MessageHolder />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}
