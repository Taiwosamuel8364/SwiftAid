import mqtt from "mqtt";

const BROKER_URL =
  "wss://60ef76ad47684abaa6aa88c67aecced5.s1.eu.hivemq.cloud:8884/mqtt";

let client = null;

export function getMqttClient() {
  if (client && client.connected) return client;

  client = mqtt.connect(BROKER_URL, {
    clientId: `swiftaid_${Math.random().toString(16).slice(2, 10)}`,
    username: "Victor01",
    password: "Iamxmat1",
    clean: true,
    reconnectPeriod: 3000,
  });

  client.on("connect", () => console.log("✅ MQTT Connected"));
  client.on("reconnect", () => console.log("🔄 MQTT Reconnecting"));
  client.on("error", (e) => console.log("❌ MQTT Error:", e.message));
  client.on("close", () => console.log("⚠️ MQTT Disconnected"));

  return client;
}

// export function subsribeTopic(topic, callback) {
//   const client = getMqttClient();
//   client.on("message", (receivedTopic, message) => {
//     if (receivedTopic === topic) {
//       try {
//         const data = JSON.parse(message.toString());
//         console.log(data);
//         callback(data);
//       } catch (error) {
//         console.error("Failed to parse to JSON:", error);
//       }
//     }
//   });
//   client.subscribe(topic);
// }
