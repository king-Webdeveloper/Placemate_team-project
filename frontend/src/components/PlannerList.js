import React, { useState, useEffect } from 'react';

const Planner = () => {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/planner');
                const data = await response.json();
                setPlans(data);
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchPlans();
    }, []);

    return (
        <div>
            <h1>All Plans</h1>
            <ul>
                {plans.map((plan) => (
                    <li key={plan.plan_id}>
                        <h2>{plan.title}</h2>
                        <p>Start Time: {new Date(plan.start_time).toLocaleString()}</p>
                        <p>Created At: {new Date(plan.created_at).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Planner;
