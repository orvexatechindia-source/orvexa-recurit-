const tenantDomain = "orvexatech";

async function run() {
  console.log("Simulating Login to get access token...");
  try {
    const loginRes = await fetch("http://localhost:4000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Domain": tenantDomain
      },
      body: JSON.stringify({
        email: "admin@orvexatech.io",
        password: "Password123"
      })
    });
    
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      const errText = await loginRes.text();
      throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    const tenantId = loginData.data.user.tenantId;
    console.log("Logged in. Token:", token.slice(0, 15) + "...");

    // Now call the applications endpoint
    console.log("Calling GET /api/v1/applications...");
    const appRes = await fetch("http://localhost:4000/api/v1/applications", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Tenant-ID": tenantId
      }
    });

    console.log("Response Status:", appRes.status);
    const text = await appRes.text();
    console.log("Response Text (first 500 chars):", text.slice(0, 500));
    
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON successfully. Success status:", json.success);
    } catch (e) {
      console.log("Failed to parse response as JSON:", e.message);
    }

  } catch (err) {
    console.error("Test failed:", err.message || err);
  }
}
run();
