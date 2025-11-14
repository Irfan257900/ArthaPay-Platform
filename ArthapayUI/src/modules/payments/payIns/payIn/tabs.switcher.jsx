import React from "react";

const TabSwitcher = ({ activeTab, setActiveTab, disable = false, selectedType = null }) => (
  <div className="flex bg-tabsBg rounded-5 border border-StrokeColor w-max custom-payments-tabs">
    <button
      className={`px-4 py-2 rounded-5 transition text-sm font-medium outline-none custom-swithcher-tabs
      ${
        (disable && selectedType === "PaymentLink") || 
        (!disable && activeTab === "PaymentLink")
          ? "bg-primaryColor text-textWhite active"
          : "bg-transparent !text-subTextColor"
      }
      ${disable ? "cursor-not-allowed" : ""}
      `}
      onClick={!disable ? () => setActiveTab("PaymentLink") : undefined}
      type="button"
      disabled={disable}
    >
      Payment Link
    </button>

    <button
      className={`px-6 py-2 rounded-5 transition text-sm font-medium outline-none custom-swithcher-tabs
      ${
        (disable && selectedType === "Invoice") || 
        (!disable && activeTab === "Invoice")
          ? "bg-primaryColor text-textWhite active"
          : "bg-transparent !text-subTextColor"
      }
      ${disable ? "cursor-not-allowed" : ""}
      `}
      onClick={!disable ? () => setActiveTab("Invoice") : undefined}
      type="button"
      disabled={disable}
    >
      Invoice
    </button>
  </div>
);

export default TabSwitcher;
