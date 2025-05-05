// utils/googleUtils.js
const { google } = require("googleapis");

async function updateGoogleCalendarEvent(eventId, updatedData, googleToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(JSON.parse(googleToken));
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: updatedData.title,
    start: {
      dateTime: updatedData.startTime.toISOString(),
      timeZone: "Asia/Bangkok",
    },
    end: {
      dateTime: updatedData.endTime.toISOString(),
      timeZone: "Asia/Bangkok",
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 15 }],
    },
  };

  const response = await calendar.events.update({
    calendarId: "primary",
    eventId: eventId,
    requestBody: event,
  });

  return response.data.htmlLink;
}

module.exports = {
  updateGoogleCalendarEvent,
};
