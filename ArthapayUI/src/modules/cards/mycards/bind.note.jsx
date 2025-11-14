import React from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
const keyPoints = [
  {
    title: "Physical Card Details",
    description: "Card Number, Expiry Date, and CVV (back of the card).",
  },
  {
    title: "Personal Identification Document",
    description:
      "A valid Government-issued ID (e.g., passport, driver’s license). Must be clear and not expired.",
  },
  {
    title: "Selfie with Card (if applicable)",
    description:
      "A photo of you holding the card. Face and card details should be clearly visible.",
  },
  {
    title: "Stable Internet Connection",
    description: "Avoid interruptions during verification.",
  },
  {
    title: "Good Lighting",
    description:
      "Ensure your documents and face are clearly visible in uploaded images.",
  },
  {
    title: "App Permissions",
    description:
      "Allow access to your device’s camera and storage if prompted.",
  },
];
const BindNote = () => {
  return (
    <>
    <div className="mt-6">
      <h2 className="mb-4 !text-start text-subTextColor text-lg font-semibold flex gap-2 items-center">
       <span className="icon key-nots-icon"></span> <span>Key Points for Successful Card Binding</span>
      </h2>

      <div>
        {keyPoints?.map((point) => (
          <div className="mb-3" key={point.title}>
           <div className="flex items-center gap-3">
           <CheckCircleOutlined className="text-green-500 text-xl" />
            <div className="flex flex-col justify-start text-left">
              <h1 className="text-sm text-subTextColor font-semibold">{point.title}</h1>
              <p className="text-paraColor text-sm font-normal">{point.description}</p>
            </div>
           </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default BindNote;
