import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const TitleComponent = () => {
  const location = useLocation();

  useEffect(() => {
    let title = 'Giggles Tea';
    
    switch(location.pathname) {
      case '/':
        title = 'Giggles Tea: Home';
        break;
      case '/about':
        title = 'Giggles Tea: About';
        break;
      case '/products':
        title = 'Giggles Tea: Products';
        break;
      case '/contact':
        title = 'Giggles Tea: Contact';
        break;
      case '/cart':
        title = 'Giggles Tea: Cart';
        break;
      case '/checkout':
        title = 'Giggles Tea: Checkout';
        break;
      case '/login':
        title = 'Giggles Tea: Admin Login';
        break;
      case '/admin':
        title = 'Giggles Tea: Admin';
        break;
      case '/admin/dashboard':
        title = 'Giggles Tea: Admin Dashboard';
        break;
      case '/admin/orders':
        title = 'Giggles Tea: Admin Orders';
        break;
      case '/admin/products':
        title = 'Giggles Tea: Admin Products';
        break;
      default:
        title = 'Giggles Tea';
    }
    
    document.title = title;
  }, [location]);

  return null;
};

// Admin routes wrapper
const AdminRoutes = () => {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
};
function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <OrderProvider>
          <Router>
          <TitleComponent />
          <div className="flex flex-col min-h-screen">
            <Routes>
              {/* Public routes with Navbar and Footer */}
              <Route element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Outlet />
                  </main>
                  <Footer />
                </>
              }>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Admin routes with AdminLayout */}
              <Route path="/admin/*" element={<AdminRoutes />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<Users />} />
                <Route path="customers" element={<Customers />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 - Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        </OrderProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App
