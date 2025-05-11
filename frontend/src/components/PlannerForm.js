// ✅ PlannerForm.js 
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';  // นำเข้า js-cookie
import { useNavigate } from 'react-router-dom';
import "./PlannerForm.css";

const PlannerForm = ({ setPlans, selectedPlaces, setSelectedPlaces }) => {
    const [title, setTitle] = useState(Cookies.get('title') || "");  // โหลดข้อมูลจาก cookie
    const [startTime, setStartTime] = useState(Cookies.get('startTime') || "");  // โหลดข้อมูลจาก cookie
    const [endTime, setEndTime] = useState(Cookies.get('endTime') || "");  // โหลดข้อมูลจาก cookie
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [draggedIndex, setDraggedIndex] = useState(null);

    // บันทึกข้อมูลใน cookie ทุกครั้งที่มีการเปลี่ยนแปลง
    useEffect(() => {
        // คำนวณเวลา 5 นาทีจากตอนนี้
        const expiryDate = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 นาที

        // บันทึกข้อมูลใน cookie โดยใช้วันที่ที่คำนวณมา
        Cookies.set('title', title, { expires: expiryDate });
        Cookies.set('startTime', startTime, { expires: expiryDate });
        Cookies.set('endTime', endTime, { expires: expiryDate });
        // Cookies.set('selectedPlaces', JSON.stringify(selectedPlaces), { expires: expiryDate }); // บันทึกสถานที่ใน cookie
    }, [title, startTime, endTime]);

    useEffect(() => {
        const savedPlaces = localStorage.getItem('selectedPlaces');
        if (savedPlaces) {
            setSelectedPlaces(JSON.parse(savedPlaces));
        }
    }, [setSelectedPlaces]);


    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/cookies-check", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.status === 401) {
                    Swal.fire({
                        title: "กรุณาเข้าสู่ระบบ",
                        text: "คุณต้องล็อกอินก่อนที่จะสร้างแผนการเดินทาง",
                        icon: "warning"
                    }).then(() => navigate("/login"));
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
        const updated = selectedPlaces.filter(p => p.place_id !== placeId);
        setSelectedPlaces(updated);
        localStorage.setItem('selectedPlaces', JSON.stringify(updated));
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // จำเป็นต้องมี ไม่งั้น onDrop จะไม่ทำงาน
    };

    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...selectedPlaces];
        const draggedItem = updated[draggedIndex];

        updated.splice(draggedIndex, 1);
        updated.splice(index, 0, draggedItem);

        // 🔁 ลบเวลาเก่าทิ้ง
        const resetTime = updated.map(place => ({
            ...place,
            start_time: "",
            end_time: ""
        }));

        setSelectedPlaces(resetTime);
        localStorage.setItem('selectedPlaces', JSON.stringify(resetTime));
        setDraggedIndex(null);
    };

    const handleStartTimeChange = (e, index) => {
        const newStartTime = e.target.value;
        const updated = [...selectedPlaces];
        updated[index].start_time = newStartTime;

        // ตรวจสอบลำดับเวลา
        if (
            index > 0 &&
            updated[index - 1].end_time &&
            newStartTime < updated[index - 1].end_time
        ) {
            alert("เวลาเริ่มต้นของสถานที่นี้ทับกับสถานที่ก่อนหน้า");
            return;
        }

        if (
            index < updated.length - 1 &&
            updated[index + 1].start_time &&
            newStartTime > updated[index + 1].start_time
        ) {
            alert("เวลาเริ่มต้นต้องมาก่อนสถานที่ถัดไป");
            return;
        }

        setSelectedPlaces(updated);
        localStorage.setItem('selectedPlaces', JSON.stringify(updated));
    };

    const handleEndTimeChange = (e, index) => {
        const newEndTime = e.target.value;
        const updated = [...selectedPlaces];
        updated[index].end_time = newEndTime;

        // ตรวจสอบว่าจบหลังจากเริ่ม
        if (updated[index].start_time && newEndTime <= updated[index].start_time) {
            alert("เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น");
            return;
        }

        // ตรวจสอบว่าไม่ทับกับสถานที่ถัดไป
        if (
            index < updated.length - 1 &&
            updated[index + 1].start_time &&
            newEndTime > updated[index + 1].start_time
        ) {
            alert("เวลาสิ้นสุดทับกับสถานที่ถัดไป");
            return;
        }

        setSelectedPlaces(updated);
        localStorage.setItem('selectedPlaces', JSON.stringify(updated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // ตรวจสอบสถานที่
        if (selectedPlaces.length === 0) {
            setError("กรุณาเพิ่มสถานที่ลงในแผนการเดินทางก่อน");
            return;
        }

        const now = new Date().toISOString().slice(0, 16);

        if (startTime < now) {
            setError("เวลาเริ่มต้นต้องไม่เป็นเวลาที่ผ่านมา");
            return;
        }

        if (startTime >= endTime) {
            setError("เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุด");
            return;
        }

        if (!userId) {
            setMessage("กรุณาเข้าสู่ระบบก่อนสร้างแผนการเดินทาง");
            return;
        }

        Swal.fire({
            title: 'คุณต้องการสร้างแผนการเดินทางนี้ใช่หรือไม่?',
            text: "แผนการเดินทางนี้จะถูกบันทึกในระบบ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'สร้างแผนการเดินทาง',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
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

                    if (response.status === 201 && response.data?.plan_id) {
                        const planId = response.data.plan_id;

                        const placePayload = {
                            places: selectedPlaces.map(p => ({
                              place_id: p.place_id,
                              start_time: p.start_time,
                              end_time: p.end_time
                            }))
                        };

                        await axios.post(`http://localhost:5000/api/planner/${planId}/add-place`, placePayload, {
                            withCredentials: true,
                            headers: { "Content-Type": "application/json" },
                        });

                        Swal.fire({
                            title: "สร้างแผนการเดินทางสำเร็จ!",
                            text: "แผนของคุณถูกบันทึกเรียบร้อยแล้ว",
                            icon: "success"
                        });

                        setTitle("");
                        setStartTime("");
                        setEndTime("");
                        setSelectedPlaces([]);
                        Cookies.remove('title');
                        Cookies.remove('startTime');
                        Cookies.remove('endTime');
                        localStorage.removeItem('selectedPlaces'); // ✅ เพิ่มบรรทัดนี้
                        // Cookies.remove('selectedPlaces'); // ลบข้อมูลสถานที่ใน cookie เมื่อสร้างแผนเสร็จ

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
            }
        });
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
                    <input 
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}  // ไม่ให้เลือกวันเวลาที่ผ่านมา
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>วันสิ้นสุดเดินทาง:</label>
                    <input 
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={startTime}  // ให้เลือกวันสิ้นสุดหลังจากวันเริ่ม
                        required
                    />
                </div>

                {error && <p className="error-message">{error}</p>}


                <div className="selected-places">
                    <h3>สถานที่ที่เลือก:</h3>
                    {selectedPlaces.length > 0 ? (
                        selectedPlaces.map((place, index) => (
                            <div
                                key={place.place_id}
                                className="selected-place-item"
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                            >
                                <span>{place.place_name || place.name}</span>

                                <div className="place-time-inputs">
                                    <label>เวลาเริ่ม:</label>
                                    <input
                                        type="datetime-local"
                                        className="planform-datetime-input"
                                        value={place.start_time || ""}
                                        min={index > 0 ? selectedPlaces[index - 1].end_time || startTime : startTime}
                                        max={place.end_time || endTime}
                                        onChange={(e) => handleStartTimeChange(e, index)}
                                    />

                                    <label>เวลาสิ้นสุด:</label>
                                    <input
                                        type="datetime-local"
                                        className="planform-datetime-input"
                                        value={place.end_time || ""}
                                        min={place.start_time || startTime}
                                        max={index < selectedPlaces.length - 1 ? selectedPlaces[index + 1].start_time || endTime : endTime}
                                        onChange={(e) => handleEndTimeChange(e, index)}
                                    />

                                </div>

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

export default PlannerForm;
