const email = "admin@orvexatech.io";
const domain = "orvexatech";

async function run() {
  console.log("Simulating request-passcode call to local NestJS backend...");
  try {
    const res = await fetch("http://localhost:4000/api/v1/candidate-portal/request-passcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, domain })
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Text:", text);

  } catch (err) {
    console.error("Test failed:", err.message || err);
  }
}
run();
