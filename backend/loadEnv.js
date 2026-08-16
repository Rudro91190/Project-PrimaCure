import dotenv from "dotenv";
import dns from "dns";

// Fix for Windows local DNS issue with MongoDB SRV records
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch (e) {
    // ignore
  }
}

dotenv.config();
console.log("✅ Environment Variables Loaded");

