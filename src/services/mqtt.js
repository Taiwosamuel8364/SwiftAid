import mqtt from "mqtt";

const BROKER_URL =
  "wss://c644aec09d5a41f08bc71c8a328341d1.s1.eu.hivemq.cloud:8884/mqtt";

let client = null;

export function getMqttClient() {
  if (client && client.connected) return client;

  client = mqtt.connect(BROKER_URL, {
    clientId: `swiftaid_${Math.random().toString(16).slice(2, 10)}`,
    username: "paul_ajayi",
    password: "Paul@2002",
    clean: true,
    reconnectPeriod: 3000,
  });

  client.on("connect", () => console.log("✅ MQTT Connected"));
  client.on("reconnect", () => console.log("🔄 MQTT Reconnecting"));
  client.on("error", (e) => console.log("❌ MQTT Error:", e.message));
  client.on("close", () => console.log("⚠️ MQTT Disconnected"));

  return client;
}