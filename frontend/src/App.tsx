import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Contact } from './pages/Contact';
import { Certificates } from "./pages/Certificates.tsx";

export const App = () => {
  useEffect(() => {
    document.title = 'My SPA Portfolio';
  }, []);

  useEffect(() => {
    fetch("/api/track-visit/", { method: "POST" })
      .catch(err => console.error("Sentry visit tracking failed:", err));
  }, []);

  return (
    <div className="app-wrapper">
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
};