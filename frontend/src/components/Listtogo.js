// Listtogo.js [frontend]
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./Listtogo.css";

const ListToGo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [listToGo, setListToGo] = useState([]);
  const [searched, setSearched] = useState(false);
  const [userId, setUserId] = useState(null); // เพิ่ม state สำหรับ user_id
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอิน
    const checkLoginStatus = async () => {
      const response = await fetch("http://localhost:5000/api/cookies-check", {
        method: "GET",
        credentials: "include", // ส่งคุกกี้
      });

      if (response.status === 401) {
        navigate("/login"); // หากไม่มีการล็อกอิน, นำผู้ใช้ไปยังหน้า login
      } else {
        const data = await response.json(); // รับข้อมูลจาก response
        setUserId(data.user_id); // ตั้งค่า user_id ที่ได้จาก response
      }
    };

    checkLoginStatus(); // เรียกฟังก์ชันตรวจสอบเมื่อคอมโพเนนต์โหลด
  }, [navigate]);

  useEffect(() => {
    if (userId) { // ตรวจสอบว่า user_id ถูกตั้งค่าแล้ว
      fetchListToGo(userId);
    }
  }, [userId]); // จะทำงานเมื่อ userId ถูกตั้งค่า

  const fetchListToGo = async (userId) => {
    const response = await fetch(`http://localhost:5000/api/list-to-go/user/${userId}`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      setListToGo(data);
    } else {
      console.error("Error: Data is not an array", data);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {  // ใช้ searchTerm แทน query
      navigate(`/searchresult?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

// listtogo.js [frontend]
const handleRemovePlace = async (listToGo) => {
  if (!userId) return; // ตรวจสอบว่า user_id มีค่าก่อนทำงาน

  // // แจ้งเตือนให้ยืนยันการลบสถานที่
  // const isConfirmed = window.confirm("คุณแน่ใจว่าต้องการลบสถานที่นี้ออกจาก List to Go?");
  // if (!isConfirmed) return; // หากผู้ใช้ไม่ยืนยัน จะไม่ทำการลบ

// SweetAlert แจ้งเตือนการลบสถานที่
Swal.fire({
  title: "ยืนยันการลบสถานที่หรือไม่?",
  text: "สิ่งที่คุณเลือกจะถูกลบออกจาก List to Go ของคุณ",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "ยืนยัน"
}).then(async (result) => {
  if (result.isConfirmed) {
    try {
      // ส่งคำขอลบสถานที่จาก backend
      const response = await fetch("http://localhost:5000/api/list-to-go/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,  // ส่ง user_id
          list_to_go_id: listToGo.list_to_go_id,  // ส่ง list_to_go_id ของสถานที่ที่ต้องการลบ
        }),
      });

      if (!response.ok) throw new Error("Failed to remove place");

      // ลบสถานที่ออกจาก listToGo ใน frontend
      setListToGo((prevListToGo) => prevListToGo.filter((p) => p.list_to_go_id !== listToGo.list_to_go_id));

      // แสดงการแจ้งเตือนเมื่อการลบสำเร็จ
      Swal.fire({
        title: "ลบสถานที่ออกจาก List to go ของคุณสำเร็จ!",
        text: "สถานที่ถูกลบออกจาก List to go ของคุณแล้ว",
        icon: "success"
      });
    } catch (error) {
      console.error("Error removing place:", error);
      // แสดงการแจ้งเตือนหากเกิดข้อผิดพลาด
      Swal.fire({
        title: "Error!",
        text: "เกิดข้อผิดพลาดในการลบสถานที่",
        icon: "error"
      });
    }
  }
});
};

// listtogo.js [frontend]
return (
    <div className="listtogo-main-container">
      <h1 className="listtogo-text">List to Go</h1>

      {/* Search Bar */}
      <div className="searchbar-search-bar">
        <input
          type="text"
          className="searchbar-search-input"
          placeholder="ค้นหา"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="searchbar-search-button">
          ค้นหา
        </button>
      </div>

      {/* รายการใน List to Go */}
        <h2 className="text-lg font-semibold">รายการใน List to Go ของคุณ</h2>
        {Array.isArray(listToGo) && listToGo.length > 0 && (
          <ul className="listtogo-searchbar-resultbox">
            {listToGo.map((place) => (
              <li key={place.list_to_go_id} className="result-listtogo">
                <div className="place-image-container">
                  <img 
                    src={`/place_images/${place.place_id}.jpg`} 
                    alt={place.place_name} 
                    className="place-image" 
                  />
                    <span className="place-name">{place.place_name}</span>
                    <button
                      onClick={() => handleRemovePlace(place)}
                      className="remove-button"
                    >
                      ลบออกจาก List
                    </button>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
);
}

export default ListToGo;



