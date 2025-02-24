import React, { useState } from 'react';

const PlannerForm = ({ onSubmit }) => {
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newPlan = {
            user_id: parseInt(userId),
            title,
            start_time: startTime,
            end_time: endTime,
        };
        onSubmit(newPlan);
        setUserId('');
        setTitle('');
        setStartTime('');
        setEndTime('');
    };

    return (
        <form onSubmit={handleFormSubmit}>
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
    );
};

export default PlannerForm;
