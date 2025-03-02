import React, { useState, useEffect } from "react";
import "./PlannerForm.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const PlannerForm = ({ setPlans }) => {
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState(null);

    // ✅ ฟังก์ชันดึง Token จาก localStorage
    const getToken = () => {
        return localStorage.getItem("auth_token") || null;
    };

    useEffect(() => {
        const token = getToken();

        if (!token) {
            console.warn("⚠ ไม่มี auth_token ใน LocalStorage");
            setUserId(null);
            return;
        }

        try {
            console.log("🔍 Token ที่ได้รับ:", token);
            const decodedToken = jwtDecode(token);
            console.log("✅ Token Decode สำเร็จ:", decodedToken);
            setUserId(decodedToken?.user_id || null);
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการ Decode Token:", error);
            setUserId(null);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // ✅ Reset Message ก่อน Submit

        if (!userId) {
            setMessage("⚠ กรุณาเข้าสู่ระบบก่อนสร้างแผนการเดินทาง");
            return;
        }

        const newPlan = {
            user_id: userId,
            title,
            start_time: startTime,
            end_time: endTime,
        };

        const token = getToken();
        if (!token) {
            console.error("❌ ไม่มี Token ใน LocalStorage, ไม่สามารถส่ง API ได้");
            setMessage("❌ กรุณาเข้าสู่ระบบใหม่");
            return;
        }

        try {
            console.log("🚀 กำลังส่งคำขอ API:", newPlan);
            const response = await axios.post("http://localhost:5000/api/planner/add", newPlan, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("🟢 API Response:", response.data);

            if (response.status === 201) {
                setMessage("✅ แผนการเดินทางเพิ่มสำเร็จ!");
                setTitle("");
                setStartTime("");
                setEndTime("");
                setPlans((prevPlans) => [...prevPlans, response.data]);
            } else {
                setMessage("❌ เกิดข้อผิดพลาดในการเพิ่มแผน");
            }
        } catch (err) {
            console.error("❌ API Error:", err.response?.data || err.message);
            setMessage("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    };

    return (
        <div className="planner-form-container">
            <h2>สร้างแผนการเดินทางใหม่</h2>
            {!userId ? (
                <p className="error-message">⚠ กรุณาเข้าสู่ระบบก่อนสร้างแผนการเดินทาง</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>📍 ชื่อแผน:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="กรุณากรอกชื่อแผนการเดินทาง"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>📅 วันเริ่มเดินทาง:</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>📅 วันสิ้นสุดเดินทาง:</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">🚀 สร้างแผนการเดินทาง</button>
                </form>
            )}

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default PlannerForm;
