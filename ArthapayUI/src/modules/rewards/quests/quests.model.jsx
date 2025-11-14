// QuestModal.js
import React, { useState } from "react";

const QuestModal = ({ quest, onClose, onSubmit }) => {
  const [proof, setProof] = useState("");

  const handleSubmit = () => {
    if (!proof.trim()) {
      alert("Please enter proof or transaction ID");
      return;
    }

    onSubmit(quest, proof);
    setProof("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1e1e25] text-white p-6 rounded-lg w-96 relative">
        <button className="absolute top-2 right-3 text-white text-xl" onClick={onClose}>×</button>

        <h2 className="text-xl font-bold mb-2">{quest.title}</h2>
        <p className="text-sm text-purple-300 mb-4">{quest.description}</p>

        <div className="mb-4">
          <strong>Progress:</strong> {quest.progress?.current}/{quest.total}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter transaction ID or proof"
            className="w-full p-2 text-sm bg-[#2a2a32] text-white rounded"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
          />
        </div>

        <button className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded" onClick={handleSubmit}>
          Submit Proof
        </button>
      </div>
    </div>
  );
};

export default QuestModal;
