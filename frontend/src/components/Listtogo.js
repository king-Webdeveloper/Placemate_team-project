import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ใช้ navigate เพื่อเปลี่ยนหน้า
import "./Listtogo.css";

const ListToGo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // ดึง Token จาก localStorage

  // ตรวจสอบว่า Token มีค่าหรือไม่ ถ้าไม่มีให้ redirect ไปหน้า Login 
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchPlaces();
    }
  }, [token]);

  // ดึงข้อมูลสถานที่จาก Backend
  const fetchPlaces = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/listtogo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // เพิ่มสถานที่ใหม่โดยส่งไปยัง Backend
  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;

    try {
      const response = await fetch("http://localhost:5000/api/list-to-go/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: searchTerm }),
      });

      if (!response.ok) {
        throw new Error("Failed to add place");
      }

      const newPlace = await response.json();
      setPlaces([...places, newPlace]);
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  // ลบสถานที่โดยส่งคำขอไปยัง Backend
  const handleDelete = async (id) => {
    try {
      const response = await fetch("http://localhost:5000/api/list-to-go/remove", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete place");
      }

      setPlaces(places.filter((place) => place.id !== id));
    } catch (error) {
      console.error("Error deleting place:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 bg-white">
        <div className="text-2xl font-bold">โลโก้</div>
        <div className="space-x-8">
          <a href="/listtogo" className="text-black">LIST TO GO</a>
          <a href="#" className="text-gray-500">PLANNER</a>
          <a href="#" className="text-gray-500">ABOUT US</a>
        </div>
        <a href="/profile" className="text-blue-500">User Profile</a>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">LIST TO GO</h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-gray-200 focus:outline-none"
              placeholder="ค้นหา"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-gray-600 text-white rounded"
            >
              ค้นหาสถานที่
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid gap-6">
          {places.map((place) => (
            <div key={place.id} className="relative h-48 rounded-lg overflow-hidden group">
              <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-4">
                <div>
                  <h3 className="text-xl text-white font-bold">{place.name}</h3>
                  <div className="flex gap-2">
                    {place.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-white bg-opacity-90 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-white">{place.rating} ★</div>
                  {/* ปุ่มลบสถานที่ */}
                  <button 
                    onClick={() => handleDelete(place.id)} 
                    className="text-red-500 bg-white px-2 py-1 rounded-lg font-bold"
                  >
                    ❌ ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ListToGo;
