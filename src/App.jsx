import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import LiveFeed from './pages/LiveFeed';
import MapView from './pages/MapView';
import TruckProfile from './pages/TruckProfile';
import ItemDetail from './pages/ItemDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Rewards from './pages/Rewards';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorMenu from './pages/vendor/VendorMenu';
import AdminDashboard from './pages/admin/AdminDashboard';
import HomepageCMS from './pages/admin/HomepageCMS';
import Search from './pages/Search';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-heading text-sm text-muted-foreground">Loading CurbChef...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Customer routes with bottom nav */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/rewards" element={<Rewards />} />
      </Route>

      {/* Full-screen routes (no bottom nav) */}
      <Route path="/search" element={<Search />} />
      <Route path="/live" element={<LiveFeed />} />
      <Route path="/truck/:id" element={<TruckProfile />} />
      <Route path="/truck/:id/item/:itemId" element={<ItemDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order/:id" element={<OrderDetail />} />

      {/* Vendor routes */}
      <Route path="/vendor" element={<VendorDashboard />} />
      <Route path="/vendor/orders" element={<VendorOrders />} />
      <Route path="/vendor/menu" element={<VendorMenu />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/homepage" element={<HomepageCMS />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App