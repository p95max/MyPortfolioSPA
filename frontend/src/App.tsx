import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Footer  from './components/Footer';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import Contact from './pages/Contact';
import TinyAssistant from './components/TinyAssistant';
import Snowfall from './components/Snowfall';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';


export const App = () => {
  useEffect(() => {
    document.title = 'My SPA Portfolio';
  }, []);

  return (
    <div className="app-wrapper">
      <Router>
        <Navbar />
         <Snowfall />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
          </Routes>
        </div>
        <Footer />
      </Router>

      <TinyAssistant />
    </div>
  );
};

export default App;