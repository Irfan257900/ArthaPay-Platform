import React, {useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import user from "../../assets/images/defaultuser.jpg";
import { fetchKpis, fetchMemberInfo } from './httpServices';
import { useNavigate, useParams } from 'react-router';
import moment from 'moment';
import CopyComponent from '../../core/shared/copyComponent';
import List from '../../core/grid.component';
import { TranasactionDateHandler, TransactionViewStatusHandler, baseURL, currentApiVersion} from './services';
import { referralReducer, referralState } from './reducer';
import AppAlert from '../../core/shared/appAlert';
import PageHeader from '../../core/shared/page.header';
import KpiLoader from '../../core/skeleton/kpi.loader/kpi';
import { Dropdown } from 'antd';
import ProfileLoader from '../../core/skeleton/profile.loader';
import { useTranslation } from 'react-i18next';
import ShareComponentHandler from './shareComponent';
import { decryptAES } from '../../core/shared/encrypt.decrypt';

function ViewReferrals() {
  const { refid, member } = useParams();
    const gridRef = useRef(null)
    const navigate = useNavigate();
    const [localState, localDispatch] = useReducer(referralReducer, referralState);
    const {t}=useTranslation();
    const iconObj = {
    "Referral Code": "icon referral-code total-referrals",
    "Referral Amount": "icon total-amount total-referrals",
    "Percentage": 'icon referral-percent total-referrals'
    }
    useEffect(() => {
    if (refid) {
            getKpisData();
            getMemberInfo()
        }
    }, [refid])

    const navigateToDashboard = () => {
        navigate(`/referrals`)
      }
      const breadCrumbList = useMemo(() => {
        const defaultList = [
            { id: "1", title:`${t('referrals.referrals')}`, handleClick: () => navigateToDashboard() },
        ];
    const name = member ? `${member?.[0]?.toUpperCase()}${member?.substring(1)}` : '';
        let list = [...defaultList];
    if (name && name !== 'Null' && name !== 'Undefined' && name !== '') {
          list = [
            ...list,
            { id: '2', title: name }
          ];
        }
        return list;
      }, [member,t]);
  
    const getKpisData = async () => {
    const urlParams = { id: refid, referrer: false }
        await fetchKpis(localDispatch, urlParams)
    }

    const getMemberInfo = async () => {
    const urlParams = { id: refid }
        await fetchMemberInfo(localDispatch, urlParams)
    }

  const clearError = () => {
        localDispatch({ type: 'setError', payload: null });
      }

  const toggleDropdown = useCallback((isOpen) => {
          localDispatch({ type: 'setIsOpen', payload: isOpen });
        },[]);

  const transactionDateHandler=(dateProps)=>{
    return(<TranasactionDateHandler dateProps={dateProps}/>)
  }

  const statusHandler =(cellprops) => {
    return(<TransactionViewStatusHandler cellprops={cellprops} />)
  }
  
  const memberGridColoumns = [
    {
        field: 'transactionId',
        title: `${t('referrals.view.grid_view_columns.transaction_ID')}`,
        filter: false,
        sortable: false,
        width: 180,
    },
    {
        field: "transactionDate",
        title: `${t('referrals.view.grid_view_columns.date')}`,
        width: 200,
        filter: false,
        sortable: false,
        customCell: transactionDateHandler
    },
    {
      field: 'txSource',
      title: `${t('referrals.view.grid_view_columns.vault_card_Name')}`,
      width: 190,
      filter: false,
      sortable: false,
  },
  {
    field: 'type',
    title:`${t('referrals.view.grid_view_columns.transaction_Type')}`,
    width: 170,
    filter: false,
    sortable: false,
},
  {
    field: 'currency',
    title: `${t('referrals.view.grid_view_columns.wallet')}`,
    width: 110,
    filter: false,
    sortable: false,
},
{
    field: 'network',
      title: `${t('referrals.view.grid_view_columns.network')}`,
    width: 110,
    filter: false,
    sortable: false,
},
{
    field: 'amount',
    title: `${t('referrals.view.grid_view_columns.amount')}`,
    width: 110,
    filter: false,
    sortable: false,
},
    {
        field: 'status',
        title: `${t('referrals.view.grid_view_columns.status')}`,
        width: 140,
        filter: false,
        sortable: false,
        customCell:statusHandler
    },

]

const shareDrawerHandler = useCallback(() => {
  return (
    <ShareComponentHandler
      referralId={localState?.kpisInfo[0]?.value}
      toggleDropdown={toggleDropdown}
    />
  );
}, [localState?.kpisInfo]);

    return (
        <div className=''>
      <PageHeader breadcrumbList={breadCrumbList} />
            {localState?.error &&
                <div className="alert-flex mb-24">
                    <AppAlert
                        className="w-100 "
                        type="warning"
                        description={localState?.error}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={() => clearError()}></span>
                </div>
            }
      {localState?.kpisLoader ? <KpiLoader /> :
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-4' >
          {localState?.kpisInfo?.map((item) => (
             
                <div className="p-3.5 bg-cardbackground  rounded-5" key={item?.name}>
                    <div className="flex items-center gap-3.5">
                        <span className={`${iconObj[item?.name]}`}></span>
                        <h4 className="text-lg font-medium text-dbkpiPara">{item?.name}</h4>
                    </div>
                    <div>
                {item?.name === "Referral Amount" && <div>
                        <h3 className="text-mediumfont font-semibold  mt-2">$ {item?.value}</h3>
                    </div>}
                {item?.name === "Percentage" && <div className='flex items-center'>
                        <h3 className="text-mediumfont font-semibold  mt-2">{item?.value || "0.00"} %</h3>
                    </div>}
                {item?.name === "Referral Code" && <div className="flex items-center space-x-2 mt-2">
              <CopyComponent
                text={item?.value || ""}
                options={{ format: "text/plain" }}
                shouldTruncate={false}
              >
                <h4
                  copyable={{ tooltips: ["Copy", "Copied"] }}
                  className="summary-text m-0"
                >
                  {item?.value}
                </h4>
              </CopyComponent>
              <div className='bg-cardbackground  w-9 h-9 rounded-full flex items-center justify-center'>
              <Dropdown
                dropdownRender={shareDrawerHandler}
                trigger={["click"]}
                className=""
                open={localState?.isOpen}
                destroyPopupOnHide={true}
                onOpenChange={toggleDropdown}
              >
                <button className='relative'>
                  <span className="icon ref-share cursor-pointer"></span>
                </button>
              </Dropdown>
              </div>
            </div>}
                    </div>
                </div>
            ))}
        </div>}
      {localState?.memberLoader && <ProfileLoader />}
             {!localState?.memberLoader &&
             <div className="profile p-4 kpicardbg rounded-5 border border-dbkpiStroke mb-5">
                <div className="md:flex block gap-4 items-start">
                    <div className='text-center'>
                        <img className='lg:h-24 lg:w-24 h-24 w-24 rounded-full object-cover' src={localState?.memberData?.image || user} alt="" />
                    </div>
                    <div className='md:flex-1'>
                  <h1 className='text-2xl font-semibold text-lightWhite'>
              {localState?.memberData?.accountType === "Business" ? (
								localState?.memberData?.businessName
							) : (
								<>
									{localState?.memberData?.firstName} {localState?.memberData?.lastName }
								</>
							)} {' '} <span className='text-sm text-subTextColor font-medium inline-block'>({localState?.memberData?.accountType || '--'})</span>
                </h1>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-0">
                  <div>
                    <h4 className='text-subTextColor text-xs md:text-sm font-normal wordbreak'>{localState?.memberData?.email || '--'}</h4>
                    <p className="text-base text-lightWhite font-medium">
                      {localState?.memberData?.phoneCode && localState?.memberData?.phoneNo
                        ? `${decryptAES(localState.memberData.phoneCode)} ${localState.memberData.phoneNo}`
                        : '--'}
                    </p>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm text-paraColor font-normal whitespace-nowrap">{`${t("referrals.view.userDetails.ID")}`}:</h4><span className="text-sm font-medium text-paraColor">{localState?.memberData?.refId}</span>
                      <CopyComponent
                        text={localState?.memberData?.refId}
                        noText="No refId"
                        shouldTruncate={false}
                        type=""
                        className="icon copy-icon cursor-pointer text-primaryColor"
                        textClass="text-primaryColor"
                      />
                    </div>
                  </div>

                {(localState?.memberData?.accountType=="Business") && <div>
                  <h5 className='text-paraColor text-sm font-medium mb-0'>{`${t("referrals.view.userDetails.incorporation_Date")}`}</h5>
                  <p className='mb-0 text-subTextColor text-sm font-semibold wordbreak'>{localState?.memberData?.incorporationDate && moment.utc(localState?.memberData?.incorporationDate).local().format("DD/MM/YYYY") || '--'}</p>
                </div>}
                {(localState?.memberData?.accountType=="Employee"||localState?.memberData?.accountType=="Personal") &&<div>
                  <h5 className='text-paraColor text-sm font-medium mb-0'>{`${t("referrals.view.userDetails.country")}`}</h5>
                  <p className='mb-0 text-subTextColor text-sm font-semibold wordbreak'>{localState?.memberData?.country || '--'}</p>
                </div>}
                {(localState?.memberData?.accountType=="Business") && <div>
                  <h5 className='text-paraColor text-sm font-medium mb-0'>{`${t("referrals.view.userDetails.country_of_Business")}`}</h5>
                  <p className='mb-0 text-subTextColor text-sm font-semibold wordbreak'>{localState?.memberData?.country || '--'}</p>
                </div>}
                        <div>
                            <h5 className='text-paraColor text-sm font-medium mb-0'>{`${t("referrals.view.userDetails.Date")}`}</h5>
                            <p className='mb-0 text-subTextColor text-sm font-semibold'>
                    {localState?.memberData?.registeredDate && moment.utc(localState?.memberData?.registeredDate).local().format("DD/MM/YYYY") || '--'} </p>
                        </div>
                       </div>
                    </div>
                </div>
            </div>}
            <div className='layout-bg kpicardbg dashboard-transactions sm-m-0 db-table hover-bg'>
            <h1 className='text-2xl font-semibold text-titleColor mb-1 pb-0'>{`${t("referrals.view.referral_Bonus")}`}</h1>
            <List
            ref={gridRef}
            columns={memberGridColoumns}
            className="custom-grid"
            url={`${baseURL}/${currentApiVersion}/referrals/${refid}/transactions`}
            pSize={3}
            />
            </div>
        </div>
    )
}

export default ViewReferrals
