// netlify/functions/get-tickets.js
//
// Returns the cached monthly ticket JSON from Netlify Blobs.
// Your React app calls this instead of hitting SharePoint/Power Automate
// directly on every load.

const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  try {
    const store = getStore("ekedp-reports");
    const data = await store.get("monthly-tickets", { type: "json" });

    if (data === null) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "No data cached yet" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
