import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Home</Link> | <Link to="/projects">Projects</Link> |{" "}
    <Link to="/blog">Blog</Link> | <Link to="/contacts">Contacts</Link>
  </nav>
);

export default Navbar;
