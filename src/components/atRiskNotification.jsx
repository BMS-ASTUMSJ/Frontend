import { useEffect, useState } from "react";
import api from "../utils/api";

const StudentAtRiskNotification = () => {
  const [atRisk, setAtRisk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskStatus();
  }, []);

  const fetchRiskStatus = async () => {
    try {
      const response = await api.get("/users/my-risk-status");

      setAtRisk(Boolean(response.data.atRisk));
    } catch (error) {
      console.error("Fetch at-risk status error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !atRisk) {
    return null;
  }

  return (
    <div className="mx-8 mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
          <span className="text-xl font-bold text-red-600">!</span>
        </div>

        <div>
          <h3 className="font-bold text-red-700">You are currently At Risk</h3>

          <p className="mt-1 text-sm leading-6 text-red-600">
            Your current progress needs attention. Please work on your
            attendance, assignments, and learning activities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAtRiskNotification;
