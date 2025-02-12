import { Link } from "react-router-dom";
import "./Navbar.css"; // ไฟล์สำหรับสไตล์

const Navbar = () => {
  return (
    <div className="Navbarspace">
        <header className="navbar">
            <img src="/PM1.1.png" alt="Logo" className="navbar-logo" />
            <nav-center>
                <Link to="/">HOME</Link>
                <Link to="/listtogo">List to Go</Link>
                <Link to="/planner">Planner</Link>
                <Link to="/aboutus">About us</Link>
            </nav-center>
            <Link to="/profile" className="nav-profile">Profile</Link>
        </header>
    </div>
  );
};

export default Navbar;