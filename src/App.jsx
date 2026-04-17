import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ThemeProvider from '@/lib/ThemeProvider';
import { AssistantProvider } from '@/components/assistant/AssistantContext';
import AssistantSheet from '@/components/assistant/AssistantSheet';

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
import OnboardTruck from './pages/OnboardTruck';
import UserQuiz from './pages/UserQuiz';
import Explore from './pages/Explore';
import Deals from './pages/Deals';
import Profile from './pages/Profile';
import VendorPortal from './pages/VendorPortal';
import VendorPlans from './pages/vendor/VendorPlans';
import VendorProfile from './pages/vendor/VendorProfile';
import LaunchDashboard from './pages/admin/LaunchDashboard';
import FoodScan from './pages/FoodScan';
import FoodConcierge from './pages/FoodConcierge';
import TruckRadar from './pages/TruckRadar';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

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
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ minHeight: '100dvh' }}
      >
        <Routes location={location}>
          {/* Customer routes with bottom nav */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/profile" element={<Profile />} />
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
          <Route path="/vendor/plans" element={<VendorPlans />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/homepage" element={<HomepageCMS />} />
          <Route path="/admin/launch" element={<LaunchDashboard />} />
          <Route path="/scan" element={<FoodScan />} />
          <Route path="/radar" element={<TruckRadar />} />
          <Route path="/concierge" element={<FoodConcierge />} />

          <Route path="/onboard-truck" element={<OnboardTruck />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/quiz" element={<UserQuiz />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <AssistantProvider>
            <Router>
              <AuthenticatedApp />
              <AssistantSheet />
            </Router>
            <Toaster />
          </AssistantProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App