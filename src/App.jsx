import { useState } from "react";

import PatientDashboard from "./pages/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

export default function App() {
  const [view, setView] = useState("patient");

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Top Navigation */}
      <div className="flex justify-center gap-4 p-4 border-b border-gray-800">

        <button
          onClick={() => setView("patient")}
          className={`px-4 py-2 rounded-lg ${
            view === "patient"
              ? "bg-blue-600"
              : "bg-gray-800"
          }`}
        >
          🚑 Patient Dashboard
        </button>

        <button
          onClick={() => setView("hospital")}
          className={`px-4 py-2 rounded-lg ${
            view === "hospital"
              ? "bg-green-600"
              : "bg-gray-800"
          }`}
        >
          🏥 Hospital Dashboard
        </button>

      </div>

      {view === "patient" ? (
        <PatientDashboard />
      ) : (
        <HospitalDashboard />
      )}
    </div>
  );
}