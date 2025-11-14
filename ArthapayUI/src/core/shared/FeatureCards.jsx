import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import ActionControlModal from "../onboarding/actionControl.modal";
const FeatureCard = ({ icon, title, description, hasSeparator = false, routing,actionFrom,redirectTo,isKycCheck=false}) => {
    const [modalOpen, setModalOpen] = useState(false)
    const currentKycStatus = useSelector(store => store.userConfig.kycStatus)
    const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
    const navigate = useNavigate()
    const handleAdvertismentButton = useCallback(() => {
        if (currentKycStatus !== 'Approved' && isKycCheck) {
            setModalOpen('kyc')
        }
        else if (!isSubscribed && isKycCheck) {
            setModalOpen('subscribeMembership');
        }
        else {
            navigate(routing)
        }
    }, [currentKycStatus, isSubscribed, routing]);
    return (<>
            <Link  onClick={handleAdvertismentButton} className="p-0 flex items-start justify-between gap-2">
                <div className="active-hyperlink">
                    <span className={`icon ${icon}`}></span>
                    <h4 className="text-dbkpiText text-base font-semibold mt-1">{title}</h4>
                    <p className="text-labelGrey text-sm font-light">{description}</p>
                </div>
            </Link>
        <ActionControlModal isOpen={modalOpen} setModalOpen={setModalOpen} modal={modalOpen} actionFrom={actionFrom} redirectTo={redirectTo} />
    </>
    );
};
FeatureCard.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    hasSeparator: PropTypes.bool,
    routing: PropTypes.arrayOf(PropTypes.string).isRequired,
    actionFrom:PropTypes.string,
    redirectTo:PropTypes.string,
    isKycCheck:PropTypes.bool
};
export default FeatureCard;
