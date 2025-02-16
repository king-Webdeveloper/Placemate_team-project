import React, { useState } from 'react';
import './Planner.css';  // นำเข้า CSS ที่เฉพาะเจาะจงกับ Planner

const Planner = () => {
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPlan = {
            user_id: userId,
            title: title,
            start_time: startTime,
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
                setMessage('Plan added successfully!');
                setUserId('');
                setTitle('');
                setStartTime('');
            } else {
                setMessage(result.error || 'Failed to add plan');
            }
        } catch (err) {
            console.error('Error:', err);
            setMessage('Something went wrong!');
        }
    };

    return (
        <div className="planner-container">
            <h1>Create New Plan</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>User ID:</label>
                    <input
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                <button type="submit">Create Plan</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
};

export default Planner;
