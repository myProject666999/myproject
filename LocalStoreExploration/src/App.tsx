import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import NoteDetail from "@/pages/NoteDetail";
import ShopDetail from "@/pages/ShopDetail";
import MyList from "@/pages/MyList";
import Ranking from "@/pages/Ranking";
import Publish from "@/pages/Publish";
import Profile from "@/pages/Profile";
import Navbar from "@/components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
}
