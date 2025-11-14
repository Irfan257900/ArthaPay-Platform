import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Changed to 'react-router-dom' for consistency

// QuickLinkItem remains unchanged, but we ensure it takes the correct props.
const QuickLinkItem = ({ icon, label, description, actionText, onClick }) => (
    <button
        onClick={onClick}
        className="flex gap-2 space-y-4 items-center w-full rounded-5 text-left"
    >
        {/* Icon */}
        <div className="items-center justify-center w-8 h-8 rounded-full">
            <span className={"icon shrink-0 " + icon}></span>
        </div>

        {/* Label and Description */}
        <div className="flex-grow">
            <h4 className="xl:text-sm lg:text-xs font-medium text-lightWhite">{label}</h4>
            <p className="xl:text-xs lg:text-[10px] text-paraColor mt-0.5 font-normal">{description}</p>
        </div>

        {/* Action Link */}
        <span className="flex items-center gap-1.5 px-2 py-1 font-medium rounded-5 border border-primaryColor">
            <span className='text-[10px] text-primaryColor'>{actionText}</span> <span className='icon btn-arrow shrink-0'></span>
        </span>
    </button>
);

// --- Quick Links Data Definition ---
// This array defines all possible quick links, their details, and the required permission.
const QUICK_LINKS_DATA = [
    {
        screenName: "Cards",
        icon: "team-cards-icon",
        label: "Apply for a Card",
        description: "Request new virtual or physical cards for spending.",
        actionText: "Apply",
        action: 'applycard',
    },
    {
        screenName: "Wallets",
        icon: "grey-arrow-down",
        label: "Deposit Crypto",
        description: "Transfer crypto assets to your wallet.",
        actionText: "Deposit",
        action: 'depositcrypto',
    },
    {
        screenName: "Wallets",
        icon: "grey-arrow-down",
        label: "Deposit Fiat",
        description: "Add funds from your linked bank account.",
        actionText: "Deposit",
        action: 'depositfiat',
    },
    {
        screenName: "Wallets",
        icon: "grey-arrow-up",
        label: "Withdraw Crypto",
        description: "Send crypto from your wallet to an external address.",
        actionText: "Withdraw",
        action: 'withdrawcrypto',
    },
    {
        screenName: "Wallets",
        icon: "grey-arrow-up",
        label: "Withdraw Fiat",
        description: "Move funds from your account back to your bank.",
        actionText: "Withdraw",
        action: 'withdrawfiat',
    },
    {
        screenName: "Payments",
        icon: "payments-menu-icon",
        label: "Create Payment Link",
        description: "Generate a shareable link to request payment for invoices.",
        actionText: "Create",
        action: 'createpayment',
    },
];

const QuickLinks = () => {
    const navigate = useNavigate();
    // Assuming menuLinks holds the permissions array
    const permissions = useSelector(state => state.userConfig.menuLinks);

    // Helper to check permissions
    const isFeatureEnabled = useCallback((screenName) => {
        return permissions?.some(item => item.screenName === screenName && item.isEnabled) ?? false;
    }, [permissions]);

    // Handle navigation logic - this remains the same
    const handleClick = useCallback((action) => {
        switch (action) {
            case 'applycard':
                navigate('/cards/apply');
                break;
            case 'depositcrypto':
                navigate('/wallets');
                break;
            case 'depositfiat':
                navigate('/wallets/fiat/deposit');
                break;
            case 'withdrawcrypto':
                navigate('/wallets/crypto/withdraw');
                break;
            case 'withdrawfiat':
                navigate('/wallets/fiat/withdraw');
                break;
            case 'createpayment':
                navigate('/payments');
                break;
            default:
                break;
        }
    }, [navigate]);

    // **Dynamic Mapping Logic using useMemo for optimization**
    const permittedLinks = useMemo(() => {
        return QUICK_LINKS_DATA.filter(link => 
            // Only include the link if its required feature is enabled
            isFeatureEnabled(link.screenName)
        );
    }, [isFeatureEnabled]);


    return (
        <div className="rounded-lg shadow-sm gap-2 kpicardbg mt-5 mb-3">
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>

            <div className="flex flex-col">
                {permittedLinks.map((link) => (
                    <QuickLinkItem
                        key={`${link.action}`}
                        icon={link.icon}
                        label={link.label}
                        description={link.description}
                        actionText={link.actionText}
                        onClick={() => handleClick(link.action)}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuickLinks;