// Test API untuk building-details
const API_BASE_URL = "https://pointmap-production.up.railway.app/api";

// Test semua endpoint yang digunakan di building-details
async function testBuildingDetailsAPI() {
  console.log("🔍 Testing Building Details API...");
  console.log("API Base URL:", API_BASE_URL);
  console.log("");

  const testCases = [
    {
      name: "Bangunan Data",
      url: `${API_BASE_URL}/bangunan/1`,
      method: "GET",
    },
    {
      name: "Ruangan 3D Data",
      url: `${API_BASE_URL}/ruangan/bangunan/1/3d`,
      method: "GET",
    },
    {
      name: "Lantai Gambar Data",
      url: `${API_BASE_URL}/lantai-gambar/bangunan/1`,
      method: "GET",
    },
    {
      name: "Ruangan Gallery Data",
      url: `${API_BASE_URL}/ruangan-gallery`,
      method: "GET",
    },
  ];

  for (const testCase of testCases) {
    console.log(`🔄 Testing: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);

    try {
      const response = await fetch(testCase.url, {
        method: testCase.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${testCase.name}`);
        console.log(`Data type: ${Array.isArray(data) ? "Array" : "Object"}`);
        console.log(
          `Data length: ${
            Array.isArray(data) ? data.length : Object.keys(data).length
          }`
        );

        // Show sample data
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Sample data:`, JSON.stringify(data[0], null, 2));
        } else if (typeof data === "object" && Object.keys(data).length > 0) {
          const firstKey = Object.keys(data)[0];
          console.log(`Sample data:`, JSON.stringify(data[firstKey], null, 2));
        }
      } else {
        console.log(`❌ Failed: ${testCase.name}`);
        console.log(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${testCase.name}`);
      console.log(`Error message: ${error.message}`);
    }

    console.log("");
  }

  console.log("🎯 API Testing Complete!");
}

// Test CORS headers
async function testCORSHeaders() {
  console.log("🔍 Testing CORS Headers...");

  try {
    const response = await fetch(`${API_BASE_URL}/bangunan/1`, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("OPTIONS Response Headers:");
    console.log(
      "- Access-Control-Allow-Origin:",
      response.headers.get("Access-Control-Allow-Origin")
    );
    console.log(
      "- Access-Control-Allow-Methods:",
      response.headers.get("Access-Control-Allow-Methods")
    );
    console.log(
      "- Access-Control-Allow-Headers:",
      response.headers.get("Access-Control-Allow-Headers")
    );
    console.log(
      "- Access-Control-Allow-Credentials:",
      response.headers.get("Access-Control-Allow-Credentials")
    );
  } catch (error) {
    console.log("❌ CORS test failed:", error.message);
  }
}

// Run tests
if (typeof window !== "undefined") {
  // Browser environment
  window.testBuildingDetailsAPI = testBuildingDetailsAPI;
  window.testCORSHeaders = testCORSHeaders;

  console.log("🧪 API Test functions available:");
  console.log("- testBuildingDetailsAPI()");
  console.log("- testCORSHeaders()");
  console.log("");
  console.log("Run these functions in browser console to test API");
} else {
  // Node.js environment
  testBuildingDetailsAPI();
}
