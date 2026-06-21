import { useEffect, useState } from "react";
import { getMqttClient } from "../services/mqtt";

const client = getMqttClient();
const TOPIC = "swiftaid/patient/1/vitals";
const OUT_TOPIC = "swiftaid/patient/1/data";

export default function PatientDashboard() {
  const [vitals, setVitals] = useState({
    heart_rate: 0,
    spo2: 0,
    fall: false,
    motion: "Waiting...",
  });

  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Disconnected");

  // ───── MQTT INPUT ─────
  useEffect(() => {
    const onConnect = () => {
      setStatus("Connected 🟢");

      client.subscribe(TOPIC);
    };

    const onMessage = (topic, msg) => {
      if (topic !== TOPIC) return;

      const data = JSON.parse(msg.toString());
      setVitals(data);
    };

    client.on("connect", onConnect);
    client.on("message", onMessage);

    return () => {
      client.off("connect", onConnect);
      client.off("message", onMessage);
    };
  }, []);

  // ───── GEOLOCATION ─────
  useEffect(() => {
    navigator.geolocation.watchPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  // ───── PUBLISH TO HOSPITAL ─────
  useEffect(() => {
    if (!location) return;

    const payload = {
      patientId: "P001",
      ...vitals,
      ...location,
      timestamp: Date.now(),
    };

    client.publish(OUT_TOPIC, JSON.stringify(payload));
  }, [vitals, location]);

 return (
  <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 flex items-center justify-center p-6">

    <div className="w-full max-w-5xl">

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-6 mb-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              🚑 SwiftAid
            </h1>

            <p className="text-slate-500 mt-1">
              Real-Time Patient Monitoring
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">

            <div
              className={`w-4 h-4 rounded-full animate-pulse ${
                status.includes("Connected")
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            <span
              className={`font-semibold ${
                status.includes("Connected")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {status}
            </span>

          </div>

        </div>

      </div>

      {/* Vital Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Heart Rate */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-red-500 hover:scale-105 transition duration-300">

          <p className="text-gray-500 text-sm mb-2">
            Heart Rate
          </p>

          <h2 className="text-5xl font-bold text-red-500">
            {vitals.heart_rate}
          </h2>

          <p className="text-gray-500 mt-2">
            BPM
          </p>

        </div>

        {/* SPO2 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-blue-500 hover:scale-105 transition duration-300">

          <p className="text-gray-500 text-sm mb-2">
            Oxygen Saturation
          </p>

          <h2 className="text-5xl font-bold text-blue-500">
            {vitals.spo2}
          </h2>

          <p className="text-gray-500 mt-2">
            %
          </p>

        </div>

        {/* Motion */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-green-500 hover:scale-105 transition duration-300">

          <p className="text-gray-500 text-sm mb-2">
            Stability
          </p>

          <h2 className="text-2xl font-bold text-green-600">
            {vitals.motion}
          </h2>

        </div>

        {/* Fall Status */}
        <div
          className={`rounded-3xl shadow-xl p-6 border-l-4 hover:scale-105 transition duration-300 ${
            vitals.fall
              ? "bg-red-50 border-red-600"
              : "bg-white border-emerald-500"
          }`}
        >

          <p className="text-gray-500 text-sm mb-2">
            Fall Detection
          </p>

          <h2
            className={`text-2xl font-bold ${
              vitals.fall
                ? "text-red-600 animate-pulse"
                : "text-emerald-600"
            }`}
          >
            {vitals.fall ? "EMERGENCY" : "SAFE"}
          </h2>

        </div>

      </div>

      {/* Location Card */}
      <div className="mt-6 bg-white rounded-3xl shadow-xl p-6 border-l-4 border-purple-500">

        <h3 className="font-semibold text-slate-700 text-lg mb-3">
          📍 Current Location
        </h3>

        {location ? (
          <>
            <p className="text-slate-600">
              Latitude:
              <span className="font-semibold ml-2">
                {location.lat.toFixed(6)}
              </span>
            </p>

            <p className="text-slate-600 mt-2">
              Longitude:
              <span className="font-semibold ml-2">
                {location.lng.toFixed(6)}
              </span>
            </p>
          </>
        ) : (
          <p className="text-gray-500">
            Getting GPS location...
          </p>
        )}

      </div>

      {/* Emergency Banner */}
      {vitals.fall && (
        <div className="mt-6 bg-red-600 text-white rounded-3xl shadow-xl p-5 animate-pulse">

          <h2 className="text-xl font-bold">
            🚨 Emergency Detected
          </h2>

          <p className="mt-2">
            Fall event has been detected and transmitted to the hospital.
          </p>

        </div>
      )}

    </div>

  </div>
)};