export function getUserLocation(setUserLocation) {
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // เก็บข้อมูล lat และ lng ใน LocalStorage
          localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lng: longitude }));
          setUserLocation({ lat: latitude, lng: longitude });
          // console.log(`User Location: Latitude: ${latitude}, Longitude: ${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // เรียกใช้การอัพเดททุกๆ 5 วินาที
  updateLocation(); // เรียกใช้งานครั้งแรก
  const intervalId = setInterval(updateLocation, 5000); // อัพเดททุกๆ 5 วินาที

  // หากต้องการให้หยุดการอัพเดทเมื่อไม่ใช้งาน
  return () => clearInterval(intervalId);
}
