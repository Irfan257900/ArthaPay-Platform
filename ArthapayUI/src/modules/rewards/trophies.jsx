import React from "react";

const TrophiesTab = () => (
  <div>
    <h2 className="text-lg font-bold mb-4">Trophies & Achievements</h2>
    <div className="bg-white rounded-lg p-4 mb-3 shadow flex items-center">
      <span className="text-3xl mr-3">🏆</span>
      <div>
        <div className="font-medium">Gold Member</div>
        <div className="text-xs text-gray-500">Earned 3,000 XP</div>
      </div>
    </div>
    <div className="bg-white rounded-lg p-4 shadow flex items-center">
      <span className="text-3xl mr-3">🥇</span>
      <div>
        <div className="font-medium">First Transaction</div>
        <div className="text-xs text-gray-500">Completed your first transaction</div>
      </div>
    </div>
  </div>
);

export default TrophiesTab;