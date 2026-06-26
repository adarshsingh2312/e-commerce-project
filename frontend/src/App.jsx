import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { PrivateRoute, AdminRoute } from './components/RouteGuards';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-32 text-center">
    <h1 className="text-6xl font-bold font-serif text-brand-primary mb-4">404</h1>
    <h2 className="text-xl uppercase tracking-wider font-semibold text-gray-700 mb-6">Page Not Found</h2>
    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
      The page you are looking for does not exist or has been moved.
    </p>
    <a
      href="/"
      className="inline-block bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 transition-colors"
    >
      Go Back Home
    </a>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />

              {/* Customer Private Routes */}
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <OrderHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <PrivateRoute>
                    <OrderDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Admin Private Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Catch All 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
