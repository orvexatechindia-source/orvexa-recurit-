const tenantDomain = "orvexatech";

async function run() {
  console.log("Simulating Login to local NestJS backend...");
  try {
    // 1. Login to get access token
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
    console.log("Logged in successfully. Token received.");

    // 2. Call Job Description Generator
    console.log("Calling generate-description endpoint...");
    const descRes = await fetch("http://localhost:4000/api/v1/jobs/generate-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Tenant-ID": tenantId
      },
      body: JSON.stringify({
        outline: "social media intern trainee"
      })
    });

    console.log("Response Status:", descRes.status);
    const descData = await descRes.json();
    console.log("Response Data:", JSON.stringify(descData, null, 2));

  } catch (err) {
    console.error("Endpoint simulation failed:", err.message || err);
  }
}
run();
