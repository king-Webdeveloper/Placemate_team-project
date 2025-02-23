// getGeo.js
export function getUserLocation(setUserLocation) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        console.log(`User Location: Latitude: ${latitude}, Longitude: ${longitude}`);
      },
      (error) => {
        console.error("Error getting location:", error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}