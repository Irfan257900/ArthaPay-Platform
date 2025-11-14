import React, { useState } from "react";
import { useNavigate } from "react-router";
import { textStatusColors } from "../../utils/statusColors";
import AppEmpty from "../shared/appEmpty";
import { formatDate } from "../../utils/app.config";
import CommonDrawer from "../shared/drawer";
import Transaction from "../transactions/transaction";

const icons = {
    "withdraw fiat": "icon withdraw",
    "deposit fiat": "icon deposit",
    "deposit crypto": "icon deposit",
    "withdraw crypto": "icon withdraw",
    "buy crypto": "icon deposit",
    "sell crypto": "icon withdraw",
    "topup card": "icon deposit",
    "first recharge": "icon deposit",
    "apply card": "icon withdraw",
};

const TransactionSection = ({ recentTranscation }) => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [data, setData] = useState(null);

    const handleRedirect = () => {
        navigate(`/transactions`);
    };

    const handleItemClick = (itemData) => () => {
        setData(itemData);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    // Helper function to format the amount
    const formatAmount = (data) => {
        const value = data?.amount;
        const amounts = value ? value.split("/") : [];
        const actionLower = data?.action?.toLowerCase() || '';

        if (amounts.length === 0) {
            return "";
        }

        let firstDecimalScale = 2; // Default for fiat
        let secondDecimalScale = 4; // Default for crypto

        if (actionLower.includes('crypto')) {
            if (actionLower === "buy crypto") {
                firstDecimalScale = 2; // Fiat
                secondDecimalScale = 4; // Crypto
            } else if (actionLower === "sell crypto") {
                firstDecimalScale = 4; // Crypto
                secondDecimalScale = 2; // Fiat
            } else {
                 // For deposit/withdraw crypto, we can assume a single crypto value or a default
                 // This example assumes a single value or defaults to the original split logic
                 firstDecimalScale = 4;
                 secondDecimalScale = 4;
            }
        }

        const formattedFirst = Number(amounts[0]).toLocaleString(undefined, {
            minimumFractionDigits: firstDecimalScale,
            maximumFractionDigits: firstDecimalScale,
        });

        if (amounts.length > 1) {
            const formattedSecond = Number(amounts[1]).toLocaleString(undefined, {
                minimumFractionDigits: secondDecimalScale,
                maximumFractionDigits: secondDecimalScale,
            });
            return `${formattedFirst} / ${formattedSecond}`;
        }
        
        return formattedFirst;
    };

    return (
        <div className="">
            <div className="flex items-center justify-between mb-4">
                <h4 className="bashboard-titles">Recent Activity</h4>
                {recentTranscation?.length > 0 && (
                    <div>
                        <button type="normal" className="secondary-outline" onClick={handleRedirect}>
                            All Transactions <span className="icon btn-arrow shrink-0 ml-2"></span>
                        </button>
                    </div>
                )}
            </div>
            <div className="kpicardbg !p-3">
                {!recentTranscation?.length && (
                    <div className="nodata-content">
                        <AppEmpty description="No activity found. Please start transacting to view your history!" />
                    </div>
                )}
                {recentTranscation?.map((data, index) => {
                    const actionLower = data?.action?.toLowerCase() || '';
                    const amountText = formatAmount(data);

                    return (
                        <div key={index} onClick={handleItemClick(data)}>
                            <div className="hover:bg-menuhover p-2 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={` scale-125 ${icons[actionLower] || 'icon deposit'}`}></span>
                                    <div className="space-y-1">
                                        <div className="">
                                            <h4 className="xl:text-sm lg:text-xs xl:font-semibold lg:font-medium text-subTextColor">{data?.action}</h4>
                                        </div>
                                         <div className="items-center flex gap-1.5">
                                             <h4 className="xl:text-xs lg:text-[10px] font-medium text-subTextColor">{data?.currecncyCode}</h4>
                                             <h5 className="xl:text-xs lg:text-[10px] font-normal text-paraColor">
                                               {amountText}
                                             </h5>
                                        </div>
                                    </div>
                                    
                                    
                                </div>
                                <div className="">
                                        <h5 className="xl:text-xs lg:text-[10px] font-normal text-paraColor lg:text-right">
                                            {formatDate(data?.date)}
                                        </h5>
                                    <h5 className="">
                                        <span className={`${textStatusColors[data?.status]} xl:text-xs lg:text-[10px] font-normal`}>
                                            {data?.status}
                                        </span>
                                    </h5>
                                </div>
                            </div>
                            <hr className="border border-StrokeColor my-2.5"></hr>
                        </div>
                    );
                })}
                <CommonDrawer
                    title={'Transaction Details'}
                    isOpen={isDrawerOpen}
                    onClose={handleDrawerClose}
                >
                    <Transaction
                        data={data}
                        onClose={handleDrawerClose}
                    />
                </CommonDrawer>
            </div>
        </div>
    );
};

export default TransactionSection;