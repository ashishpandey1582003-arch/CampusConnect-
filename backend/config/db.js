import dns from "node:dns";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dnsServers = process.env.DNS_SERVERS
      ?.split(',')
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers?.length) {
      dns.setServers(dnsServers);
    } else {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log(conn.connection.host);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    throw err;
  }
};

export default connectDB; 