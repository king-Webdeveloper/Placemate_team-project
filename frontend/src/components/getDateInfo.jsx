// getDateInfo.jsx
const getDateInfo = () => {
    const today = new Date();

    const dayName = today.toLocaleString("en-EN", { weekday: "long" }); // ชื่อวัน (เช่น วันศุกร์)
    const day = today.getDate(); // วันที่ (1-31)
    const month = today.toLocaleString("en-EN", { month: "long" }); // ชื่อเดือน (เช่น มีนาคม)
    const year = today.getFullYear(); // ปี (เช่น 2025)

    // ดึงเวลาปัจจุบัน
    const hours = today.getHours().toString().padStart(2, "0"); // ชั่วโมง (00-23)
    const minutes = today.getMinutes().toString().padStart(2, "0"); // นาที (00-59)
    const seconds = today.getSeconds().toString().padStart(2, "0"); // วินาที (00-59)

    const time = `${hours}:${minutes}`; // รูปแบบเวลา HH:MM:SS

    return { dayName, time };
};

export default getDateInfo;
