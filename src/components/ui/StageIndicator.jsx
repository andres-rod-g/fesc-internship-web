import React from "react";
import { CheckCircle, Circle, Clock } from "lucide-react";

export default function StageIndicator({ currentStage, stages }) {
  const getStageStatus = (index) => {
    if (index < currentStage) return "completed";
    if (index === currentStage) return "current";
    return "pending";
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const status = getStageStatus(index);

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    status === "completed"
                      ? "bg-green-600 border-green-600 text-white"
                      : status === "current"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : status === "current" ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      status === "pending" ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {stage.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all ${
                    index < currentStage ? "bg-green-600" : "bg-gray-300"
                  }`}
                  style={{ maxWidth: "100px" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
