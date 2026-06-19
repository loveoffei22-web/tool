// netlify/functions/save-tickets.js
//
// Receives the monthly ticket JSON array from Power Automate (Flow A)
// and writes it into Netlify Blobs under the "ekedp-reports" store,
// key "monthly-tickets". The app reads from the matching get-tickets
// function instead of calling SharePoint directly.

const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  // Simple shared-secret check so randoms on the internet can't overwrite your data.
  // Set EKEDP_API_KEY in Netlify: Site configuration > Environment variables.
  const providedKey = event.headers["x-api-key"];
  if (!providedKey || providedKey !== process.env.EKEDP_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: "Unauthorized" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON body" }),
    };
  }

  try {
    const store = getStore("ekedp-reports");
    await store.setJSON("monthly-tickets", data);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        ticketsSaved: Array.isArray(data) ? data.length : 0,
        savedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
