const domain = "orvexatech";

async function run() {
  console.log("Querying public custom fields endpoint...");
  try {
    const res = await fetch(`http://localhost:4000/api/v1/custom-fields/public/${domain}?entityType=CANDIDATE`);
    console.log("Response Status:", res.status);
    const data = await res.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err.message || err);
  }
}
run();
