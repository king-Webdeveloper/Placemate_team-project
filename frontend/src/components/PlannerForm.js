// ✅ PlannerForm.js (เพิ่มการเรียก POST /planner/:planId/add-place หลังสร้างแผน)
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import "./PlannerForm.css";

const PlannerForm = ({ setPlans, selectedPlaces, setSelectedPlaces }) => {
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/cookies-check", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.status === 401) {
                    Swal.fire({ title: "กรุณาเข้าสู่ระบบ", text: "คุณต้องล็อกอินก่อนที่จะสร้างแผนการเดินทาง", icon: "warning" }).then(() => {
                        navigate("/login");
                    });
                } else {
                    const data = await response.json();
                    setUserId(data.user_id);
                }
            } catch (err) {
                console.error("Error checking login status:", err);
                setMessage("เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ");
            }
        };

        checkLoginStatus();
    }, [navigate]);

    const handleRemovePlace = (placeId) => {
        setSelectedPlaces(prevPlaces => prevPlaces.filter(p => p.place_id !== placeId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!userId) {
            setMessage("กรุณาเข้าสู่ระบบก่อนสร้างแผนการเดินทาง");
            return;
        }

        const newPlan = {
            user_id: userId,
            title,
            start_time: startTime,
            end_time: endTime,
        };

        try {
            const response = await axios.post("http://localhost:5000/api/planner/add", newPlan, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 201 && response.data && response.data.plan_id) {
                const planId = response.data.plan_id;

                // 🔁 เพิ่มสถานที่เข้าแผนที่เพิ่งสร้าง
                if (selectedPlaces.length > 0) {
                    const placePayload = {
                        places: selectedPlaces.map(p => ({
                            place_id: p.place_id,
                            start_time: startTime,
                            end_time: endTime
                        }))
                    };

                    await axios.post(`http://localhost:5000/api/planner/${planId}/add-place`, placePayload, {
                        withCredentials: true,
                        headers: { "Content-Type": "application/json" },
                    });
                }

                Swal.fire({
                    title: "สร้างแผนการเดินทางสำเร็จ!",
                    text: "แผนของคุณถูกบันทึกเรียบร้อยแล้ว",
                    icon: "success"
                });

                setTitle("");
                setStartTime("");
                setEndTime("");
                setSelectedPlaces([]);

                if (setPlans) {
                    setPlans((prevPlans) => [...prevPlans, response.data]);
                }

                navigate('/planner');
            } else {
                setMessage("เกิดข้อผิดพลาดในการเพิ่มแผน");
            }
        } catch (err) {
            console.error("Error while adding plan:", err);
            setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    };

    const handleCancel = () => {
        navigate('/planner');
    };

    return (
        <div className="planner-form-container">
            <h2>สร้างแผนการเดินทางใหม่</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>ชื่อแผน:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>วันเริ่มเดินทาง:</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>วันสิ้นสุดเดินทาง:</label>
                    <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>

                <div className="selected-places">
                    <h3>สถานที่ที่เลือก:</h3>
                    {selectedPlaces.length > 0 ? (
                        selectedPlaces.map(place => (
                            <div key={place.place_id} className="selected-place-item">
                                <span>{place.place_name || place.name}</span>
                                <button className="remove-place-btn" onClick={() => handleRemovePlace(place.place_id)}>❌</button>
                            </div>
                        ))
                    ) : (
                        <p>ยังไม่มีสถานที่ถูกเลือก</p>
                    )}
                </div>

                <div className="form-buttons">
                    <button type="submit" className="create-plan-button">สร้างแผนการเดินทาง</button>
                    <button type="button" onClick={handleCancel} className="cancel-button">ยกเลิก</button>
                </div>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default PlannerForm