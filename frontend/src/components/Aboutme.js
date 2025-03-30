import React, { useState } from 'react';
import './Aboutme.css';  // นำเข้าไฟล์ CSS

const Aboutme = () => {
  const [aboutme, setAboutme] = useState("We are web developer with a passion for building user-friendly applications.");

  return (
    <div className="aboutme-container">
      <h1>About Me</h1>
      <div className="profile-info">
        <img src="/PM1.1.png" alt="profile" className="profile-img" />
        <p className="about-text">{aboutme}</p>
      </div>
    </div>
  );
};

export default Aboutme;
