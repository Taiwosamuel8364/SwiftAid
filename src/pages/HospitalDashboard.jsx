import { useEffect, useState } from "react";
import { getMqttClient } from "../services/mqtt";
import {
  calculateSeverity,
  getSeverityLevel,
} from "../utils/severityEngine";

const client = getMqttClient();
const TOPIC = "swiftaid/patient/+/data";

export default function HospitalDashboard() {
  const [patients, setPatients] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);

  useEffect(() => {
    const onConnect = () => {
      client.subscribe(TOPIC);
    };

    const onMessage = (topic, msg) => {
      const data = JSON.parse(msg.toString());

      const score = calculateSeverity(data);
      const level = getSeverityLevel(score);

      const enriched = { ...data, severity: score, level };

      setPatients((prev) => ({
        ...prev,
        [data.patientId]: enriched,
      }));

      // 🚨 EMERGENCY LOGIC (NEW)
      if (score >= 60) {
        setActiveEmergency(enriched);

        setAlerts((prev) => [
          enriched,
          ...prev.slice(0, 5),
        ]);
      }
    };

    client.on("connect", onConnect);
    client.on("message", onMessage);

    return () => {
      client.off("connect", onConnect);
      client.off("message", onMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-6">

      {/* 🚨 EMERGENCY OVERLAY */}
      {activeEmergency && (
        <div className="fixed top-6 right-6 w-96 bg-red-600 text-white p-5 rounded-2xl shadow-2xl animate-pulse z-50">

          <h2 className="text-xl font-bold">
            🚨 EMERGENCY ACTIVE
          </h2>

          <p className="mt-2 font-semibold">
            Patient: {activeEmergency.patientId}
          </p>

          <p>❤️ {activeEmergency.heart_rate} BPM</p>
          <p>🩸 {activeEmergency.spo2}%</p>

          <p className="mt-3 font-bold">
            Severity: {activeEmergency.severity}
          </p>

          <p className="mt-1 text-sm">
            Status: CRITICAL CONDITION
          </p>

        </div>
      )}

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 mb-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              🏥 SwiftAid Control Center
            </h1>
            <p className="text-slate-500 mt-1">
              Real-Time Multi-Patient Monitoring System
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

            <span className="text-green-600 font-semibold">
              MQTT LIVE
            </span>

          </div>

        </div>

      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-slate-500">Total Patients</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {Object.keys(patients).length}
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-red-500">
          <p className="text-slate-500">Active Alerts</p>
          <h2 className="text-3xl font-bold text-red-600">
            {alerts.length}
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-emerald-500">
          <p className="text-slate-500">System Status</p>
          <h2 className="text-2xl font-bold text-emerald-600">
            OPERATIONAL
          </h2>
        </div>

      </div>

      {/* PATIENT GRID */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          🧑‍⚕️ Live Patients
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {Object.values(patients).map((p) => (
            <div
              key={p.patientId}
              className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 hover:scale-[1.02] transition"
            >

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-lg font-bold text-slate-800">
                  {p.patientId}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.severity > 60
                      ? "bg-red-100 text-red-600"
                      : p.severity > 30
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {p.level}
                </span>

              </div>

              <div className="space-y-2 text-slate-600">

                <p className="flex justify-between">
                  <span>❤️ Heart Rate</span>
                  <span className="font-semibold text-slate-800">
                    {p.heart_rate} BPM
                  </span>
                </p>

                <p className="flex justify-between">
                  <span>🩸 SpO₂</span>
                  <span className="font-semibold text-slate-800">
                    {p.spo2}%
                  </span>
                </p>

                <p className="flex justify-between">
                  <span>📊 Severity</span>
                  <span className="font-bold text-slate-800">
                    {p.severity}
                  </span>
                </p>

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* ALERT PANEL */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-red-100">

        <h2 className="text-xl font-bold text-red-600 mb-4">
          🚨 Emergency Alerts
        </h2>

        {alerts.length === 0 ? (
          <p className="text-slate-500">No active emergencies</p>
        ) : (
          <div className="space-y-3">

            {alerts.map((a, i) => (
              <div
                key={i}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-pulse"
              >

                <div className="flex justify-between">

                  <p className="font-bold text-red-700">
                    {a.patientId}
                  </p>

                  <p className="text-red-600 font-semibold">
                    {a.level}
                  </p>

                </div>

                <p className="text-sm text-slate-600 mt-1">
                  ❤️ {a.heart_rate} BPM | 🩸 {a.spo2}%
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}