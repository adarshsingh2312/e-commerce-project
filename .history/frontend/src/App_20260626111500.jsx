import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import PrivateRoute from './components/PrivateRoute'

function Profile() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl">Profile</h2>
      <p className="mt-2">User profile and edit form will go here.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </AuthProvider>
  )
}
