import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Visitors from './pages/Visitors';
import Blacklist from './pages/Blacklist';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/blacklist" element={<Blacklist />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
