import { useSelector } from "react-redux";
import { KycSubmitted } from "./kycKybSubmittedMsg";
import KycKybRejectionMsg from "./kycKybRejectionMsg";

const KycKybStatusHandler = ({ handleReKycKyb }) => {
    const userProfile = useSelector(
        (store) => store.userConfig.details || {}
    );
    const metadata = useSelector(
        (store) => store.userConfig.metadata || {}
    );
    if (userProfile?.kycStatus?.toLowerCase() === "submitted") {
        return <KycSubmitted accountType={userProfile?.accountType} />;
    } else if (userProfile?.kycStatus?.toLowerCase() === "rejected") {
        return <KycKybRejectionMsg accountType={userProfile?.accountType} supportEmail={metadata?.AdminEmail} handleReKycKyb={handleReKycKyb} />;
    } else {
        return <KycSubmitted accountType={userProfile?.accountType} />;
    }
};

export default KycKybStatusHandler;