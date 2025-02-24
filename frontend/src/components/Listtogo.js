import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      fetchPlaces();
      fetchListToGo(userId);
    }
  }, [userId]); // จะทำงานเมื่อ userId ถูกตั้งค่า

  const fetchPlaces = async () => {
    const response = await fetch("http://localhost:5000/api/list-to-go/places");
    const data = await response.json();
    setPlaces(data);
  };

  const fetchListToGo = async (userId) => {
    const response = await fetch(`http://localhost:5000/api/list-to-go/user/${userId}`);
    const data = await response.json();
    setListToGo(data);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearched(true);

    try {
      const response = await fetch(`http://localhost:5000/api/search/places?query=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to search places");

      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const handleAddPlace = async (place) => {
    if (!userId) return; // ตรวจสอบว่า user_id มีค่าก่อนทำงาน

    try {
      const response = await fetch("http://localhost:5000/api/list-to-go/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // ใช้ userId ที่ได้รับจาก checkLoginStatus
          name: place.name,
        }),
      });

      if (!response.ok) throw new Error("Failed to add place");

      const addedPlace = await response.json();
      setListToGo([...listToGo, addedPlace]); // อัปเดต list_to_go หลังเพิ่มสถานที่
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  const handleRemovePlace = async (place) => {
    if (!userId) return; // ตรวจสอบว่า user_id มีค่าก่อนทำงาน

    try {
      const response = await fetch("http://localhost:5000/api/list-to-go/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // ใช้ userId ที่ได้รับจาก checkLoginStatus
          name: place.name,
        }),
      });

      if (!response.ok) throw new Error("Failed to remove place");

      setListToGo(listToGo.filter((p) => p.place_id !== place.place_id)); // ลบสถานที่ออกจาก listToGo
    } catch (error) {
      console.error("Error removing place:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">List to Go</h1>

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

        {/* ผลลัพธ์การค้นหา */}
        {searched && places.length === 0 && (
          <p className="text-center text-gray-500 mt-4">ไม่พบผลลัพธ์ที่ตรงกัน</p>
        )}

        {places.length > 0 && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold">ผลลัพธ์การค้นหา</h2>
            <ul className="searchbar-resultbox">
              {places.map((place) => (
                <li key={place.place_id} className="result-listtogo">
                  <span>{place.name}</span>
                  <button
                    onClick={() => handleAddPlace(place)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  >
                    ➕ เพิ่มไปยัง List to go
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* รายการใน List to Go */}
        <div className="mt-4 w-full">
          <h2 className="text-lg font-semibold">รายการใน List to Go</h2>
          <ul className="searchbar-resultbox">
            {listToGo.map((place) => (
              <li key={place.list_to_go_id} className="result-listtogo">
                <span>{place.place_name}</span>
                <button
                  onClick={() => handleRemovePlace(place)}
                  className="bg-red-500 text-white px-2 py-1 rounded-lg"
                >
                  ➖ ลบออกจาก List
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ListToGo;
