import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminLogin from './pages/admin/Login'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProjectManager from './pages/admin/ProjectManager'
import CategoryManager from './pages/admin/CategoryManager'
import SkillManager from './pages/admin/SkillManager'
import AboutEditor from './pages/admin/AboutEditor'
import ContactMessages from './pages/admin/ContactMessages'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="skills" element={<SkillManager />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="contacts" element={<ContactMessages />} />
      </Route>
    </Routes>
  )
}

export default App
