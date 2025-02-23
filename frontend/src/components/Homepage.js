// import React from "react";
// import { Link } from "react-router-dom";
// import "./Homepage.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  const [query, setQuery] = useState(""); // เก็บค่าค้นหา
  const navigate = useNavigate();  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  // const [searchTerm, setSearchTerm] = useState("");

  // const handleSearch = () => {
  //   if (query.trim()) {
  //     navigate(`/searchresult?query=${encodeURIComponent(searchTerm)}`);
  //   }
  // };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/searchresult?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="homepage">
      {/* ✅ Navbar & Search Bar */}
      <header className="navbar">
        <img src="/PM1.1.png" alt="Logo" className="logo" />
        <nav className="navbar-nav">
          <Link to="/listtogo">LIST TO GO</Link>
          <Link to="/planner">PLANNER</Link>
          <Link to="/about">ABOUT US</Link>
        </nav>
        {isLoggedIn ? (
            <Link to="/profile" className="nav-profile">Profile</Link>
          ) : (
            <Link to="/login" className="login-btn">เข้าสู่ระบบ</Link>
          )}
      </header>

      <section className="search-bar">
        <h2>ค้นหากิจกรรมที่อยากทำ</h2>
        <div className="search-tags">
          {["Food & Drink", "Shopping", "Entertainment"].map((tag, index) => (
            <button key={index} className="tag" onClick={() => setQuery(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <div className="search-input">
          <input
            type="text"
            placeholder="ค้นหาสถานที่..."
            className="search-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            ค้นหา
          </button>
        </div>
      </section>

      {/* ✅ Hero Section */}
      <section className="hero">
        <div className="carousel">
          {[
            { img: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg", title: "อาหารรสเลิศ" },
            { img: "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg", title: "ออกกำลังกาย" }
          ].map((slide, index) => (
            <div key={index} className="slide">
              <img src={slide.img} alt={slide.title} className="carousel-image" />
              <h1 className="hero-title">{slide.title}</h1>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Recommended Places */}
      <section className="recommended">
        <h2>แนะนำสำหรับคุณ</h2>
        <div className="place-grid">
          {[
            { name: "ห้องสมุดเพื่อการเรียนรู้ทุ่งครุ", category: "เสริมสร้างความรู้", rating: 4.7, image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg" },
            { name: "สวนธนบุรีรมย์", category: "ออกกำลังกาย", rating: 4.5, image: "https://images.pexels.com/photos/414102/pexels-photo-414102.jpeg" },
            { name: "ศูนย์กีฬาฉลิมพระเกียรติ (บางมด)", category: "ออกกำลังกาย", rating: 4.9, image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg" },
            { name: "ตลาดใหญ่ทุ่งครุ", category: "อาหารรสเลิศ", rating: 4.2, image: "https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg" }
          ].map((place, index) => (
            <div key={index} className="place-card">
              <img src={place.image} alt={place.name} className="place-image" />
              <div className="place-info">
                <span className="place-category">{place.category}</span>
                <h3>{place.name}</h3>
                <span className="place-rating">⭐ {place.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* ✅ FAQ Section */}
      <section className="faq">
        <h2>คำถามที่พบบ่อย</h2>
        <div className="faq-item">
          <button className="faq-question">จะสร้าง PLANNER ได้อย่างไร ? <span>▼</span></button>
          <div className="faq-answer">คุณสามารถสร้าง PLANNER ได้โดย...</div>
        </div>
        <div className="faq-item">
          <button className="faq-question">จะสมัครบัญชีได้อย่างไร ? <span>▼</span></button>
          <div className="faq-answer">คุณสามารถสมัครบัญชีโดย...</div>
        </div>
        <div className="faq-item">
          <button className="faq-question">จะหาสถานที่ทำกิจกรรมได้อย่างไร ? <span>▼</span></button>
          <div className="faq-answer">คุณสามารถค้นหาสถานที่ได้จาก...</div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;



// function Homepage() {
//   return (
//     <div className="homepage">
//       <header>
//         <img src="/PM1.1.png" alt="Logo" className="logo" />
//         <nav>
//           <Link to="/login">Login</Link>
//           <Link to="/register">Register</Link>
//         </nav>
//       </header>

//       <section className="hero">
//         <h1>Welcome to My Website</h1>
//         <p>Your one-stop solution for everything.</p>
//         <Link to="/register" className="btn">Get Started</Link>
//       </section>
//     </div>
//   );
// }

// export default Homepage;
