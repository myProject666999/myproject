import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CanvasPage from "@/pages/CanvasPage";
import Templates from "@/pages/Templates";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/templates" element={<Templates />} />
      </Routes>
    </Router>
  );
}
