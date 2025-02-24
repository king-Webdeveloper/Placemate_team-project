import { useState, useEffect } from "react";
import axios from "axios";

const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/cookies-check", { withCredentials: true })
            .then(response => {
                setUser(response.data); // เก็บข้อมูล user_id, username
            })
            .catch(() => {
                setUser(null); // ถ้า token หมดอายุ จะเป็น null
            });
    }, []);

    return user;
};

export default useAuth;
