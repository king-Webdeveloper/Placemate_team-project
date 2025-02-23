import { Link } from "react-router-dom";
import "./Navbar.css"; // ไฟล์สำหรับสไตล์

const Navbar = () => {
  return (
    <div className="Navbarspace">
        <header className="navbar">
        <Link to="/">
                <img src="/PM1.1.png" alt="Logo" className="navbar-logo" />
            </Link>
            <nav className="navbar-center">
                <Link to="/listtogo">List to Go</Link>
                <Link to="/planer">Planner</Link>
                <Link to="/aboutme">About us</Link>
            </nav>
            <Link to="/profile" className="nav-profile">Profile</Link>
        </header>
    </div>
  );
};

export default Navbar;