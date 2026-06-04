import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import JMTPage from './pages/JMTPage';
import GrandCanyonPage from './pages/GrandCanyonPage';
import Favorites from './pages/Favorites';
import Galleries from './pages/Galleries';
import PhotoPage from './pages/PhotoPage';

const TRAIL_PAGES = ['/jmt', '/grand-canyon'];

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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
