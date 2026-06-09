import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ThemeProvider from '@/lib/ThemeProvider';
import { base44 } from '@/api/base44Client';
import { AssistantProvider } from '@/components/assistant/AssistantContext';
import AssistantSheet from '@/components/assistant/AssistantSheet';

import AppLayout from './components/layout/AppLayout';
import AdminPreviewPill from './components/admin/AdminPreviewPill';
import Home from './pages/Home.jsx';
import LiveFeed from './pages/LiveFeed';
import MapView from './pages/MapView';
import TruckProfile from './pages/TruckProfile';
import ItemDetail from './pages/ItemDetail';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail.jsx';
import Rewards from './pages/Rewards.jsx';
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
import Profile from './pages/Profile.jsx';
import VendorPortal from './pages/VendorPortal';
import VendorPlans from './pages/vendor/VendorPlans';
import VendorProfile from './pages/vendor/VendorProfile';
import GoLive from './pages/vendor/GoLive';
import VendorVerification from './pages/vendor/VendorVerification';
import LaunchDashboard from './pages/admin/LaunchDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import FoodScan from './pages/FoodScan';
import FoodConcierge from './pages/FoodConcierge';
import TruckRadar from './pages/TruckRadar';
import Privacy from './pages/Privacy.jsx';
import Experiences from './pages/Experiences.jsx';
import Terms from './pages/Terms.jsx';
import Support from './pages/Support.jsx';
import Parks from './pages/Parks.jsx';
import ParkProfile from './pages/ParkProfile.jsx';
import TopItems from './pages/TopItems.jsx';
import VendorOnboarding from './pages/vendor/VendorOnboarding';
import NotApproved from './pages/NotApproved.jsx';

const SPLASH_URL = 'https://curbchef.app';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Fetch launch_mode, beta users, and approved trucks for the signed-in user
  const [launchMode, setLaunchMode] = React.useState(null);
  const [isApproved, setIsApproved] = React.useState(null); // null = loading

  React.useEffect(() => {
    base44.entities.HomepageConfig.filter({ key: 'launch_mode' })
      .then(rows => setLaunchMode(rows[0]?.headline || 'waitlist'))
      .catch(() => setLaunchMode('waitlist'));
  }, []);

  React.useEffect(() => {
    // Only run approval check once we know auth state
    if (isLoadingAuth) return;

    if (!isAuthenticated || !user) {
      setIsApproved(false);
      return;
    }

    // Admin always approved
    if (user.role === 'admin') { setIsApproved(true); return; }

    const email = user.email?.toLowerCase();

    // Check BetaUser OR approved FoodTruck
    Promise.all([
      base44.entities.BetaUser.filter({ email, is_active: true }),
      base44.entities.FoodTruck.filter({ owner_email: user.email, is_approved: true }),
    ]).then(([betaRows, truckRows]) => {
      setIsApproved(betaRows.length > 0 || truckRows.length > 0);
    }).catch(() => setIsApproved(false));
  }, [isLoadingAuth, isAuthenticated, user]);

  const loading = isLoadingPublicSettings || isLoadingAuth || launchMode === null || isApproved === null;

  if (loading) {
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
      // Not signed in → send to Netlify splash
      window.location.replace(SPLASH_URL);
      return null;
    }
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isOnboardRoute = location.pathname === '/onboard-truck';

  // Gate only applies when not in public mode
  const gateApplies = launchMode !== 'public';

  // Not signed in + gate applies → Netlify splash
  if (gateApplies && !isAuthenticated && !isOnboardRoute) {
    window.location.replace(SPLASH_URL);
    return null;
  }

  // Signed in but not approved → friendly waitlist screen
  if (gateApplies && isAuthenticated && !isApproved && !isOnboardRoute) {
    return <NotApproved />;
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
        {isAdmin && <AdminPreviewPill />}
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
          <Route path="/vendor/go-live" element={<GoLive />} />
          <Route path="/vendor/verification" element={<VendorVerification />} />
          <Route path="/vendor/onboarding" element={<VendorOnboarding />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/homepage" element={<HomepageCMS />} />
          <Route path="/admin/launch" element={<LaunchDashboard />} />
          <Route path="/admin/verification" element={<VerificationQueue />} />
          <Route path="/scan" element={<FoodScan />} />
          <Route path="/radar" element={<TruckRadar />} />
          <Route path="/concierge" element={<FoodConcierge />} />

          <Route path="/onboard-truck" element={<OnboardTruck />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/quiz" element={<UserQuiz />} />

          <Route path="/experiences" element={<Experiences />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/parks" element={<Parks />} />
          <Route path="/parks/:slug" element={<ParkProfile />} />
          <Route path="/top-items" element={<TopItems />} />

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