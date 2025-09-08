import { Link } from 'react-router-dom';

export const Navbar = () => (
  <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
    <Link to="/" style={{ marginRight: 15 }}>Home</Link>
    <Link to="/projects" style={{ marginRight: 15 }}>Projects</Link>
    <Link to="/contact">Contact</Link>
  </nav>
);