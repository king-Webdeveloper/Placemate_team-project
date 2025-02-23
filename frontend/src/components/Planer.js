import React, { useState } from 'react';
import './Planner.css'; // นำเข้า CSS ที่เฉพาะเจาะจงกับ Planner

const Planner = () => {
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [message, setMessage] = useState('');

    // ฟังก์ชันในการเริ่มต้นการเดินทาง
    const handleStartTrip = () => {
        setMessage("เริ่มต้นการเดินทาง");
    };

    // ฟังก์ชันในการลบแผนการเดินทาง
    const handleDeletePlan = () => {
        setUserId('');
        setTitle('');
        setStartTime('');
        setEndTime('');
        setMessage("ลบแผนการเดินทางเรียบร้อยแล้ว");
    };

    // ฟังก์ชันในการส่งข้อมูลแผนการเดินทาง
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPlan = {
            user_id: parseInt(userId),
            title: title,
            start_time: startTime,
            end_time: endTime,
        };

        try {
            const response = await fetch('http://localhost:5000/api/planner/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPlan),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('แผนการเดินทางเพิ่มสำเร็จ!');
                setUserId('');
                setTitle('');
                setStartTime('');
                setEndTime('');
            } else {
                setMessage(result.error || 'เกิดข้อผิดพลาดในการเพิ่มแผน');
            }
        } catch (err) {
            console.error('Error:', err);
            setMessage('เกิดข้อผิดพลาด!');
        }
    };

    return (
        <div className="planner-container">
            <h1>สร้างแผนการเดินทางใหม่</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>User ID:</label>
                    <input
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="กรุณากรอก User ID"
                        required
                    />
                </div>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="กรุณากรอกชื่อแผนการเดินทาง"
                        required
                    />
                </div>
                <div>
                    <label>Start Time:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>End Time:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">สร้างแผนการเดินทาง</button>
            </form>

            {message && <p>{message}</p>}

            <div className="planner-actions">
                <button onClick={handleStartTrip}>เริ่มต้นการเดินทาง</button>
                <button onClick={handleDeletePlan}>ลบแผนการเดินทาง</button>
            </div>
        </div>
    );
};

export default Planner;
