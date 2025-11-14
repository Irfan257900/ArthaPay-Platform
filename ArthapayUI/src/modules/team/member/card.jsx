import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router";
import CommonDrawer from "../../../core/shared/drawer";
import CustomButton from "../../../core/button/button";
import { carddetails, freezeunfreezeCard } from "../httpServices";
import { Alert } from "antd";
import { connect } from "react-redux";
import ScreenTabs from "../../../core/shared/screenTabs";
import { successToaster } from "../../../core/shared/toasters";
import CardDetails from "../../../core/skeleton/carddetail";
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage";
import defaultCardImg from "../../../assets/images/default-cards.png";
const basePath = "/settings/team";
const tabs = [
  {
    title: "Card Transactions",
    icon: "team-transactions",
  },
  {
    title: "Card History",
    icon: "team-cards",
  },
];
const badgeStyle = {
  pending: "#E89900",
  approved: "#037A00",
  failed: "#FF0000",
  freezed: "#D7D7D7",
  unfreezed: "#D7D7D7",
  active: "#037A00",
  inactive: "#FF0000",
  suspended: "#FF0000",
  rejected: "#FF0000",
  canceled: "#FF0000",
  "freeze pending": "#E89900",
  "unfreeze pending": "#E89900",
  "under maintenance": "#E89900",
  submitted: "#2f7cf7",
};
const badgeColor = {
  pending: "#fff",
  approved: "#fff",
  failed: "#fff",
  freezed: "#000",
  unfreezed: "#000",
  active: "#fff",
  inactive: "#fff",
  suspended: "#fff",
  rejected: "#fff",
  canceled: "#fff",
  "freeze pending": "#fff",
  "unfreeze pending": "#fff",
  "under maintenance": "#fff",
  submitted: "#000",
};
const Card = (props) => {
  const { memberId: id, refId, cardName, cardId } = useParams();
  const [urlParams] = useSearchParams();
  const mainTab = useMemo(() => {
    return urlParams.get("mainTab") || "Cards";
  }, [urlParams.get("mainTab")]);
  const currentTab = useMemo(() => {
    return urlParams.get("cardTab") || "";
  }, [urlParams.get("cardTab")]);
  const [activeTab, setActiveTab] = useState();
  const navigate = useNavigate();
  const [details, setDetails] = useState({});
  const [loader, setLoader] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const viewCard = "Virtual";
  const [isOpen, setIsOpen] = useState(false);
  const cardNumber = useMemo(() => {
    if (details?.number && details.number.length > 0) {
      if (viewCard) {
        return `XXXX XXXX XXXX ${details?.number?.substr(-4)}`;
      } else {
        return details?.number?.replace(/(\d{4})(?=\d)/g, "$1 ");
      }
    }
    return "XXXX XXXX XXXX XXXX";
  }, [details?.number, viewCard]);
  const toggleDrawer = useCallback(() => {
    setIsOpen(!isOpen);
  }, [])
  useEffect(() => {
    if (!currentTab) {
      handleTabChange(tabs[0].title);
    } else {
      setActiveTab(currentTab);
    }
  }, [currentTab]);
  useEffect(() => {
    getCardDetails();
  }, []);
  const handleTabChange = useCallback((key) => {
    const keyToSet = encodeURIComponent(key);
    switch (key) {
      case "Card Transactions":
        return navigate(
          `${basePath}/member/${id}/${encodeURIComponent(refId)}/cards/${cardId}/${cardName}/transactions?mainTab=${mainTab}&cardTab=${keyToSet}`
        );
      case "Card History":
        return navigate(
          `${basePath}/member/${id}/${encodeURIComponent(refId)}/cards/${cardId}/${cardName}/history?mainTab=${mainTab}&cardTab=${keyToSet}`
        );
      default:
        return;
    }
  }, [])
  const setGetCardsData = (response) => {
    if (response) {
      setDetails(response);
    } else {
      cardDivRef.current.scrollIntoView(0, 0);
      setErrorMsg(deriveErrorMessage(response));
    }
  };
  const getCardDetails = async () => {
    setErrorMsg(null);
    const urlParams = {
      id: id,
      cardid: cardId,
    };
    await carddetails(setLoader, setGetCardsData, setErrorMsg, urlParams);
  };
  const closeToggleDrawer = useCallback(() => {
    setIsOpen(!isOpen);
  }, [])
  const freezeCard = useCallback(async () => {
    let obj = {
      id: cardId,
      status: details?.state == "Freezed" ? "Active" : "Inactive",
      actionBy: details?.state == "Freezed" ? "UnFreezed" : "Freezed",
      createdBy: props?.user?.name,
      createdDate: new Date(),
      SignImage: "",
    };
    const urlParams = { id: props?.user?.id, cardid: cardId, obj: obj, isFreezed:details?.state === "Freezed" };
    await freezeunfreezeCard(
      setBtnLoader,
      setGetfreezeCard,
      setErrorMsg,
      urlParams
    );
  }, [cardId, details?.state, props?.user?.id, props?.user?.name]);
  const setGetfreezeCard = (response) => {
    if (response) {
      handleFreezeModal(false, "save");
      successToaster({
        content: `Your request has been successfully submitted!`,
        className: "custom-msg",
        duration: 3,
      });
      setErrorMsg(null);
      setIsOpen(false);
    } else {
      setErrorMsg(deriveErrorMessage(response));
      setBtnLoader(false);
      setIsOpen(false);
    }
  };
  const closeError = useCallback(() => {
    setErrorMsg(null)
  }, [])
  return (
    <div>
      {errorMsg !== undefined && errorMsg !== null && (
        <div className="alert-flex mb-24">
          <Alert
            type="error"
            description={errorMsg}
            onClose={closeError}
            showIcon
          />
          <span
            className="icon sm alert-close cursor-pointer"
            onClick={closeError}
          ></span>
        </div>
      )}
      {!activeTab || loader ? (
        <CardDetails />
      ) : (
        <div className="card-paddingadd">
          <div className="buy-rpanel">
            <div
              className={`inner-card ${details?.type == "Physical" ? "physical-bg" : "virtual-bg"
                }`}
            >
              <div className="flex justify-center items-center">
                <div className={"relative"}>
                  <img
                    src={details?.image||defaultCardImg}
                    className="w-full md:w-[420px] h-[219px] rounded-xl"
                  />
                  <div className="absolute w-full h-full top-0 left-0 p-4">
                    <h4 className="text-base font-medium text-textWhite mb-2">
                      {details?.name}
                    </h4>
                    <p className="text-sm font-medium text-textWhite mb-2">
                      {cardNumber}
                    </p>
                    <p className="text-xs font-medium text-textWhite mb-4">
                      {details?.name}
                    </p>
                    {details?.state && 
                    <div>
                      <p
                        className={`card-state-default`}
                        style={{
                          backgroundColor:
                            badgeStyle[details.state?.toLowerCase()] ||
                            "#037A00",
                          color:
                            badgeColor[details.state?.toLowerCase()] || "#ffff",
                        }}
                      >
                        {details?.state}
                      </p>
                    </div>
                    }
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center flex items-center justify-center space-x-3">
                <span className="text-base text-labelGrey font-medium">
                  Card Balance :
                </span>
                <div className="flex items-center space-x-2">
                  <h4 className="text-md text-lightWhite  font-semibold">
                    {details?.amount} {details?.cardCurrency}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="team-tabs">
        <ScreenTabs
          activeKey={activeTab}
          onChange={handleTabChange}
          list={tabs}
          shouldUsePropsList={true}
          tabFields={{ icon: "icon", key: "title", title: "title" }}
        />
        <Outlet />
      </div>

      <CommonDrawer
        title={`Confirm ${details?.state === "Freezed" ? "Unfreeze" : "Freeze/Unfreeze"
          }`}
        isOpen={isOpen}
        onClose={toggleDrawer}
      >
        <div>
          <h1 className="text-lightWhite font-semibold text-md">
            Do you really want to{" "}
            {details?.state === "Freezed" ? "Unfreeze" : "Freeze"}?
          </h1>
        </div>
        <div className=" mt-10">
          <CustomButton
            type="primary"
            className="w-full"
            onClick={freezeCard}
            loading={btnLoader}
          >
            OK
          </CustomButton>
          <CustomButton className="w-full mt-5" onClick={closeToggleDrawer}>
            Cancel
          </CustomButton>
        </div>
      </CommonDrawer>
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(Card);
