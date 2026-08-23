import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import License from './pages/License';
import JMTPage from './pages/JMTPage';
import HSTPage from './pages/HSTPage';
import GrandCanyonPage from './pages/GrandCanyonPage';
import Favorites from './pages/Favorites';
import Galleries from './pages/Galleries';
import PhotoPage from './pages/PhotoPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { TRAIL_PAGES } from './utils/site';

// Page components are imported eagerly (not React.lazy). The site ships
// prerendered HTML for every route; lazy-loading meant React replaced that
// HTML on mount, hit the Suspense fallback, and blanked the page for the
// chunk-fetch gap — a content vanish/reappear that measured as a full-
// viewport layout shift (CLS ~1.0 on every route except the eagerly-imported
// Home). Eager imports remove the async gap so the prerendered content is
// re-rendered in a single commit. The page modules are small (2–9 KB each);
// the genuinely heavy code (3D splat viewer) stays lazy where it's used.

// Dev-only photo annotation tool. import.meta.env.DEV is statically false in
// production builds, so the route and its chunk are eliminated entirely.
const Annotate = import.meta.env.DEV ? lazy(() => import('./pages/Annotate')) : null;

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
          <Route path="/lassen-volcanic" element={<CategoryPage category="lassen-volcanic" title="Lassen Volcanic" />} />
          <Route path="/yosemite" element={<CategoryPage category="yosemite" title="Yosemite" />} />
          <Route path="/grand-canyon" element={<GrandCanyonPage />} />
          <Route path="/jmt" element={<JMTPage />} />
          <Route path="/hst" element={<HSTPage />} />
          <Route path="/photo/:slug" element={<PhotoPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/license" element={<License />} />
          {Annotate && <Route path="/annotate" element={<Annotate />} />}
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
