import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import Home from './pages/Home';

// Routes other than Home are lazy-loaded so the initial bundle stays small.
// Each route becomes its own JS chunk fetched only when the user navigates.
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const About = lazy(() => import('./pages/About'));
const JMTPage = lazy(() => import('./pages/JMTPage'));
const GrandCanyonPage = lazy(() => import('./pages/GrandCanyonPage'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Galleries = lazy(() => import('./pages/Galleries'));
const PhotoPage = lazy(() => import('./pages/PhotoPage'));

const TRAIL_PAGES = ['/jmt', '/grand-canyon'];

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/galleries" element={<Galleries />} />
          <Route path="/landscapes" element={<CategoryPage category="landscapes" title="Landscapes" />} />
          <Route path="/cities" element={<CategoryPage category="cities" title="Cities" />} />
          <Route path="/people" element={<CategoryPage category="people" title="People" />} />
          <Route path="/events" element={<CategoryPage category="events" title="Events" />} />
          <Route path="/death-valley" element={<CategoryPage category="death-valley" title="Death Valley" />} />
          <Route path="/grand-canyon" element={<GrandCanyonPage />} />
          <Route path="/jmt" element={<JMTPage />} />
          <Route path="/photo/:slug" element={<PhotoPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const location = useLocation();
  const hideFooter = TRAIL_PAGES.includes(location.pathname);

  return (
    <>
      <SplashScreen />
      <Navbar />
      <AnimatedRoutes />
      {!hideFooter && <Footer />}
      <SpeedInsights />
      <Analytics />
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
