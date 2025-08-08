// Test CORS configuration with detailed logging
import fetch from "node-fetch";

const testCorsDetailed = async () => {
  const baseUrl = "https://pointmap-production.up.railway.app";

  console.log("🔍 Testing CORS Configuration...");
  console.log("Base URL:", baseUrl);
  console.log("Origin:", "https://pointmap.vercel.app");
  console.log("");

  try {
    // Test OPTIONS request (preflight) with ngrok header
    console.log("🔄 Testing OPTIONS request with ngrok header...");
    const optionsResponse = await fetch(`${baseUrl}/api/bangunan/geojson`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://pointmap.vercel.app",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers":
          "Content-Type, ngrok-skip-browser-warning",
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("OPTIONS Response Status:", optionsResponse.status);
    console.log("OPTIONS Response Headers:");
    console.log(
      "- Access-Control-Allow-Origin:",
      optionsResponse.headers.get("Access-Control-Allow-Origin")
    );
    console.log(
      "- Access-Control-Allow-Methods:",
      optionsResponse.headers.get("Access-Control-Allow-Methods")
    );
    console.log(
      "- Access-Control-Allow-Headers:",
      optionsResponse.headers.get("Access-Control-Allow-Headers")
    );
    console.log(
      "- Access-Control-Allow-Credentials:",
      optionsResponse.headers.get("Access-Control-Allow-Credentials")
    );
    console.log("");

    // Test actual GET request with ngrok header
    console.log("🔄 Testing GET request with ngrok header...");
    const getResponse = await fetch(`${baseUrl}/api/bangunan/geojson`, {
      method: "GET",
      headers: {
        Origin: "https://pointmap.vercel.app",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("GET Response Status:", getResponse.status);
    console.log("GET Response Headers:");
    console.log(
      "- Access-Control-Allow-Origin:",
      getResponse.headers.get("Access-Control-Allow-Origin")
    );
    console.log("- Content-Type:", getResponse.headers.get("Content-Type"));
    console.log("");

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log("✅ GET request successful!");
      console.log(
        "Response data preview:",
        JSON.stringify(data).substring(0, 100) + "..."
      );
    } else {
      console.log("❌ GET request failed with status:", getResponse.status);
    }
  } catch (error) {
    console.error("❌ CORS test failed:");
    console.error("Error:", error.message);
  }
};

testCorsDetailed();
