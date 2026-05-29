import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from 'antd/locale/zh_CN';
import Home from "@/pages/Home";
import ProductList from "@/pages/ProductList";
import ProductDetail from "@/pages/ProductDetail";
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
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/category/:id" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}
