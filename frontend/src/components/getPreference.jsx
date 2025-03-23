const getPreference = async (userId, preference) => {
    alert(userId+" "+preference)
    try {
        const response = await fetch("http://localhost:5000/api/createPreference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, preference }),
        });

        if (!response.ok) {
            throw new Error("Failed to save preference");
        }

        const result = await response.json();
        console.log("Preference saved:", result);
    } catch (error) {
        console.error("Error saving preference:", error);
    }
};

export default getPreference;
