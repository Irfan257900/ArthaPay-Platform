import React, { useMemo, useEffect, useRef,useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import ActionControlModal from "../onboarding/actionControl.modal";
const Advertisment = ({
    data,
    title,
    itemFields = { templateContent: "templateContent", title: "title" },
    actionFrom,
    redirectTo,
    routing
}) => {
    const [modalOpen,setModalOpen]=useState(false)
    const currentKycStatus=useSelector(store=>store.userConfig.kycStatus)
    const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
    const navigate = useNavigate()
    const { templateContent = "templateContent", title: titleField = "title" } = useMemo(() => {
        return itemFields || {};
    }, [itemFields]);
    const selectedAd = useMemo(
        () => data?.find((item) => item[titleField] === title) || [],
        [data, title, titleField]
    );
    const handleAdvertismentButton = useCallback(() => {
        if(currentKycStatus!=='Approved'){
            setModalOpen('kyc')
        }
        else if (!isSubscribed) {
            setModalOpen('subscribeMembership');
        }
        else {
            navigate(routing)
        }
    }, [currentKycStatus, isSubscribed, routing]);
    const contentRef = useRef(null);
    useEffect(() => {
        const button = contentRef.current?.querySelector("#handleButton");
        if (button) {
            button.addEventListener("click", (()=>handleAdvertismentButton()));
        }
        return () => {
            if (button) {
                button.removeEventListener("click", ()=>handleAdvertismentButton());
            }
        };
    }, [selectedAd]);
    useEffect(() => {
        window.handleAdvertismentButton = handleAdvertismentButton;
        return () => {
            delete window.handleAdvertismentButton;
        };
    }, [routing]);

    return (
        <>
            {selectedAd && (
                <div className="light-theme action-button"
                    ref={contentRef}
                    dangerouslySetInnerHTML={{
                        __html: selectedAd[templateContent] || "",
                    }}
                />
            )}
            <ActionControlModal  isOpen={modalOpen} setModalOpen={setModalOpen} modal={modalOpen} actionFrom={actionFrom} redirectTo={redirectTo} />
        </>
    );
};
Advertisment.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    title: PropTypes.string,
    itemFields: PropTypes.shape({
        description: PropTypes.string,
        title: PropTypes.string,
    }),
    actionFrom:PropTypes.string,
    redirectTo:PropTypes.string,
    routing:PropTypes.string,
};
export default Advertisment;
