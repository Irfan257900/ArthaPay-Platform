import React, { useCallback, useState } from "react";
import CustomButton from "../button/button";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import ActionControlModal from "../onboarding/actionControl.modal";
import { useTranslation } from "react-i18next";
import AppNumber from "../shared/inputs/appNumber";
const VaultsKpis = ({ merchantsData,actionFrom,
    buttonName,barImgColorClassList = ["icon green-bars shrink-0", "icon red-bars shrink-0","icon green-bars shrink-0"],
    graphImgColorClassList=["icon graph-green ml-1","icon graph-red ml-1"],
    percentageClassName=["text-textGreen text-xs font-semibold","text-textRed text-xs font-semibold"],handleVaultsDrawer,redirectTo='/'
 }) => {
    const [modalOpen,setModalOpen]=useState(false)
    const currentKycStatus=useSelector(store=>store.userConfig.kycStatus)
    const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
    const { t } = useTranslation();
    const handleNavigate = useCallback(() => {
      if(currentKycStatus!=='Approved'){
        setModalOpen('kyc')
        return;
    }
    if(!isSubscribed){
      setModalOpen('subscribeMembership');
      return;
    }
    handleVaultsDrawer?.(true);
    }, [currentKycStatus]);
    const EffectiveEndIndex = merchantsData.length-1;
  return (<>
<ActionControlModal  isOpen={modalOpen} setModalOpen={setModalOpen} modal={modalOpen} actionFrom={actionFrom} redirectTo={redirectTo} />
 {merchantsData.slice(0, `${EffectiveEndIndex}`).map((merchant,index) => (
        <div key={merchant.id} className="p-3.5 border border-dbkpiStroke rounded-5 grid lg:grid-cols-1 md:grid-cols-1">
          <div className="flex items-center justify-between md:col-span-2 self-start">
            <h4 className="text-base font-semibold text-dbkpiText">{merchant.merchantName}</h4>
          </div>
          <div className="items-center flex justify-between">
            <div className="flex items-center space-x-4">
            <div className="flex overflow-hidden py-1 px-0 -space-x-2">
              {merchant.merchantsDetails.slice(0, 4).map((coinDetail) => (
                <img
                  key={coinDetail.code}
                  className="inline-block h-7 w-7 rounded-full"
                  src={coinDetail.logo }
                  alt={coinDetail.coinName}
                />
              ))}
            </div>
              {merchant.merchantsDetails.length>4&&<p className="text-paraColor text-base font-semibold">+{merchant.merchantsDetails.length-4||0}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0">
            <div className="flex items-center gap-1">
            <span className={barImgColorClassList[index % 2]}></span>
         <h3 className="text-md font-semibold text-dbkpiText"><AppNumber
           className={"text-md font-semibold text-dbkpiTex"}
           type="text"
           defaultValue={merchant.amountInUSD || '0.00'}
           localCurrency={""}
           prefixText={"$"}
           suffixText={''}
           thousandSeparator={true}
           allowNegative={true}
         /></h3>
            </div>
            <div className="">
              <span className={graphImgColorClassList[index % 2]}></span>
              <span className={percentageClassName[index % 2]}>45%</span>
              <span className="text-labelGrey text-xs font-normal">{t('dashboard.This Week')}</span>
            </div>
          </div>
          
        </div>
      ))}
       {merchantsData.slice( `${EffectiveEndIndex}`).map((merchant) => (
      <div   key={merchant.id} className="p-3.5 border border-dbkpiStroke rounded-5">
      <div className="flex justify-between">
      <p className="text-sm font-semibold text-dbkpiText">{merchant.merchantName}</p>
      {merchant.merchantsDetails.map((coinDetail) => (
                <img
                  key={coinDetail.code}
                   src={coinDetail.logo}
                  alt={'img'}
                />
              ))}
      </div>
      <CustomButton type="primary" onClick={handleNavigate}>{buttonName}</CustomButton>
  </div>  
      ))}
</>
  );
};
VaultsKpis.propTypes = {
  merchantsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      merchantName: PropTypes.string.isRequired,
      amountInUSD: PropTypes.string,
      customerId:PropTypes.string,
      merchantsDetails: PropTypes.arrayOf(
        PropTypes.shape({
          code: PropTypes.string.isRequired,
          logo: PropTypes.string.isRequired,
          coinName: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  buttonName: PropTypes.string.isRequired,
  barImgColorClassList: PropTypes.arrayOf(PropTypes.string),
  graphImgColorClassList: PropTypes.arrayOf(PropTypes.string),
  percentageClassName: PropTypes.arrayOf(PropTypes.string),
  handleVaultsDrawer: PropTypes.func,
  actionFrom:PropTypes.string,
  redirectTo:PropTypes.string
};
export default VaultsKpis;
