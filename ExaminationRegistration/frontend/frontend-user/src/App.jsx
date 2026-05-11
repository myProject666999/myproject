import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import IntroList from './pages/IntroList'
import IntroDetail from './pages/IntroDetail'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import Cart from './pages/Cart'
import PaperList from './pages/PaperList'
import Exam from './pages/Exam'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'

import MyLayout from './pages/my/Layout'
import Profile from './pages/my/Profile'
import MyOrders from './pages/my/Orders'
import MyAddresses from './pages/my/Addresses'
import MyExamRecords from './pages/my/ExamRecords'
import MyWrongQuestions from './pages/my/WrongQuestions'
import MyFavorites from './pages/my/Favorites'
import MyPosts from './pages/my/MyPosts'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/intros" element={<AppLayout><IntroList /></AppLayout>} />
      <Route path="/intros/:id" element={<AppLayout><IntroDetail /></AppLayout>} />
      <Route path="/projects" element={<AppLayout><ProjectList /></AppLayout>} />
      <Route path="/projects/:id" element={<AppLayout><ProjectDetail /></AppLayout>} />
      <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
      <Route path="/papers" element={<AppLayout><PaperList /></AppLayout>} />
      <Route path="/papers/:id/exam" element={<Exam />} />
      <Route path="/posts" element={<AppLayout><PostList /></AppLayout>} />
      <Route path="/posts/:id" element={<AppLayout><PostDetail /></AppLayout>} />
      <Route path="/posts/create" element={<AppLayout><CreatePost /></AppLayout>} />

      <Route path="/my" element={<AppLayout><MyLayout /></AppLayout>}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="addresses" element={<MyAddresses />} />
        <Route path="exam-records" element={<MyExamRecords />} />
        <Route path="wrong-questions" element={<MyWrongQuestions />} />
        <Route path="favorites" element={<MyFavorites />} />
        <Route path="my-posts" element={<MyPosts />} />
      </Route>
    </Routes>
  )
}

export default App
