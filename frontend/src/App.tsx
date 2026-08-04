import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import VendorRegister from './pages/auth/VendorRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorLayout from './components/vendor/VendorLayout';
import ShopProfile from './pages/vendor/ShopProfile';
import ProductsList from './pages/vendor/ProductsList';
import AddProduct from './pages/vendor/AddProduct';
import CustomerLayout from './components/customer/CustomerLayout';
import Home from './pages/customer/Home';
import ProductListing from './pages/customer/ProductListing';
import ProductDetails from './pages/customer/ProductDetails';
import ShopListing from './pages/customer/ShopListing';
import ShopDetails from './pages/customer/ShopDetails';
import Cart from './pages/customer/Cart';
import Wishlist from './pages/customer/Wishlist';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorWallet from './pages/vendor/VendorWallet';
import VendorSettings from './pages/vendor/VendorSettings';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminShops from './pages/admin/AdminShops';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';

function RootRedirect() {
  const location = useLocation();
  return <Navigate to={`/customer/home${location.search}${location.hash}`} replace />;
}

function CustomerIndexRedirect() {
  const location = useLocation();
  return <Navigate to={`home${location.search}${location.hash}`} replace />;
}

function AuthRoute({ user }: { user: any }) {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  if (!user) return <UnifiedLogin />;
  if (returnUrl) return <Navigate to={returnUrl} replace />;
  return <Navigate to={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'admin' ? '/dashboard/admin' : '/customer/home'} replace />;
}

function VendorSignupRoute({ user }: { user: any }) {
  if (!user) return <VendorRegister />;
  return <Navigate to={`/dashboard/${user?.role || 'vendor'}`} replace />;
}

function App() {
  const { user, checkSession, initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkSession();
    initializeAuth();
  }, [checkSession, initializeAuth]);

  return (
    <Router>
      <Toaster position="top-center" richColors theme="system" />
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerIndexRedirect />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="search" element={<ProductListing />} />
            <Route path="category/:category" element={<ProductListing />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="shops" element={<ShopListing />} />
            <Route path="shops/:id" element={<ShopDetails />} />
            
            {/* Cart and Wishlist - Guests can browse, but logic inside components will handle guest vs auth */}
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            
            {/* Protected Storefront Routes */}
            <Route 
              path="checkout" 
              element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} 
            />
            <Route 
              path="orders" 
              element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} 
            />
            <Route 
              path="order/:id" 
              element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} 
            />
          </Route>
          
          <Route 
            path="/auth" 
            element={<AuthRoute user={user} />} 
          />
          <Route 
            path="/vendor/signup" 
            element={<VendorSignupRoute user={user} />} 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Vendor Routes */}
          <Route 
            path="/dashboard/vendor" 
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<VendorDashboard />} />
            <Route path="shop" element={<ShopProfile />} />
            <Route path="wallet" element={<VendorWallet />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="products">
              <Route index element={<ProductsList />} />
              <Route path="new" element={<AddProduct />} />
              <Route path="edit/:id" element={<AddProduct />} />
            </Route>
            <Route path="settings" element={<VendorSettings />} />
            {/* Future nested routes will go here: analytics, etc. */}
            <Route path="*" element={<div className="p-8">Page under construction</div>} />
          </Route>

          {/* Catch-all route */}
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            {/* Using AdminDashboard for Analytics as it contains charts, and settings separately */}
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
