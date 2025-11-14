import React, { useEffect, useState, useCallback } from 'react';
import { Input, Button, Tooltip, List, Skeleton } from 'antd';
import { getPayeesLu } from '../../modules/wallets/httpServices'
import VirtualList from 'rc-virtual-list';
import AppAlert from './appAlert';
import CustomButton from '../button/button';
import HeaderNotificationsLoader from '../skeleton/header.notification.loader';
import ActionController from '../onboarding/action.controller';
import { useTranslation } from 'react-i18next';
import { getFaitPayeesLu } from '../../modules/wallets/fiat/withdraw.components/httpServices';
import AppEmpty from './appEmpty';
import AddPayeeDrawer from './addPayee.drawer';
import { deriveErrorMessage } from './deriveErrorMessage';
const ContainerHeight = 400;
const { Search } = Input;
const AddressList = ({ screenType, coinForDropDowns, coinSearch, reDirectToSumrry, coinsRefresh, onRefresh, selectedPayeeId, selectedPayee, handleFormSubmission, loading, network, shouldDisplayPayees = false, feature,action }) => {
    const [addressListData, setAddressListData] = useState([]);
    const [searchVal, setSearchVal] = useState(null)
    const [loader, setLoader] = useState(false)
    const [selectedId, setSelectedId] = useState(null);
    const [isViewDrawer, setISViewDrawer] = useState(false)
    const [address, setAddress] = useState([]);
    const [error, setError] = useState(null);
    const { t } = useTranslation();
    useEffect(() => {
        fetchPayees();
        setSelectedId(selectedPayeeId);
    }, [network, coinForDropDowns]);// eslint-disable-line react-hooks/exhaustive-deps


    const navigateToPayees = useCallback(() => {
        setISViewDrawer(true)
    }, [])

    const closeDrawer = useCallback(() => {
        setISViewDrawer(false);
    }, [])
    const onScroll = useCallback((e) => {
        if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
            fetchPayees();
            setLoader(false)
        }
    }, []);
    const fetchPayees = async () => {
        try {
            setLoader(true)
            let response = screenType == "fiat" ? await getFaitPayeesLu(coinForDropDowns, feature) : await getPayeesLu(coinForDropDowns, network, searchVal,action);
            if (response?.data) {
                setAddressListData(response?.data)
                setLoader(false);
                setAddress(response)
            }
            else if (response?.error) {
                setError(deriveErrorMessage(response?.error));
                setLoader(false)
            }
        } catch (error) {
            setError(error);
            setLoader(false)
        }
    }

    const handleSearch = (value) => {
        let filtercoinsList;
        if (!value) {
            filtercoinsList = address?.data;
            fetchPayees();

        } else {
            filtercoinsList = address?.data?.filter(item => ((item.favoriteName)?.toLowerCase()?.includes(value.toLowerCase())));

        }
        setAddressListData(filtercoinsList)
    }

    const refreshRates = () => {
        if (onRefresh) {
            onRefresh();
        }
    }
    const handleSelectItem = (item) => {
        setSelectedId(item.id);
        reDirectToSumrry(item);
    };
    const onPayeeSuccess = useCallback(() => {
        fetchPayees()
        closeDrawer()
    }, [])
    return (
        <div className=''>
            <div className="md:max-w-[465px] mx-auto pt-4">

                {error !== undefined && error !== null && (
                    <div className="alert-flex withdraw-alert fiat-alert">
                        <AppAlert
                            type="error"
                            description={error}
                            showIcon
                        />
                        <span className="icon sm alert-close" ></span>

                    </div>
                )}
                {loader && <HeaderNotificationsLoader itemCount={5} />}
                {!loader && <>
                    <div className='bg-menuhover payess-selection-search  rounded-5 p-3.5'>


                        <div className='flex items-center gap-1'>
                            {/* <span className="icon lg btn-arrow-back c-pointer" onClick={() => reDirectToTransferAmount()}></span> */}
                            <h3 className="text-xs font-normal text-titleColor">{t('vault.vaultscrypto.selectPayee')}</h3>
                            <span className='text-textRed'>*</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            {coinSearch &&
                                <div className="coin-search address-search payout-search w-full !mb-0">
                                    <Search value={searchVal} placeholder={t('vault.vaultscrypto.payeeplaceholder')} suffix={<span className="icon md search c-pointer" />}
                                        onChange={({ currentTarget }) => { setSearchVal(currentTarget.value); handleSearch(currentTarget.value) }}
                                        size="middle" bordered={false} className="coin-search-input cursor-pointer" />
                                    {coinsRefresh && <Button onClick={() => refreshRates()} className="coin-refbtn" shape="circle" icon={<Tooltip title="Refresh"><span className="icon lg refresh" /></Tooltip>} size="large" />}
                                </div>}
                            {/* { (
                                <ActionController
                                    handlerType="button"
                                    onAction={navigateToPayees}
                                    actionFrom="wallets"
                                    redirectTo="/wallets/crypto"
                                    buttonType="plain"
                                    buttonClass={"rounded-full hover:bg-transparent focus:outline-none !p-0"}
                                >
                                    <span className="rounded-full w-8 h-8 hover:bg-transparent border border-primaryColor focus:outline-none flex justify-center items-center">
                                        <span className="icon btn-add "></span>
                                    </span>
                                </ActionController>
                            )} */}
                        </div>
                        {addressListData?.length > 0 && (
                            <List className='selectbank-list dt-topspace'
                                loading={loader}>
                                <VirtualList
                                    data={addressListData}
                                    itemKey={item => item.id}
                                    onScroll={onScroll}
                                    className='withdraw-component overflow-auto pr-2'
                                >
                                    {(item) => (
                                        <List.Item key={item.id} className={`!p-4  mb-2.5 cursor-pointer !rounded-5 bg-inputBg dark:bg-menuhover hover:bg-cardbackground border border-StrokeColor ${selectedId === item.id ? '!bg-cardbackground dark:!bg-profileBr activecheck-show border border-StrokeColor' : 'bg-cardbackground check-hidden'}`}
                                            onClick={() => handleSelectItem(item)}>
                                            <Skeleton loading={loader} active avatar paragraph={{ rows: 1 }}>
                                                <List.Item.Meta
                                                    bordered
                                                    actions={false}
                                                    avatar={<p className="text-base font-semibold text-subTextColor w-7 h-7 bg-advcard dark:bg-cardbackground rounded-full flex justify-center items-center" >{item?.favoriteName?.charAt(0).toUpperCase()}</p>}
                                                    title={screenType === "crypto" ?
                                                        <div className='flex justify-between items-center'><p className={`mb-0 `}>
                                                            <span className='text-sm text-lightWhite font-normal'>{item.favoriteName?.length > 0 ? item.favoriteName : ""}</span>
                                                            {/* <p className='mb-0 text-sm text-textGray2 font-normal'>{`(${item.walletAddress?.length > 0 ? item.walletAddress.substring(0, 4) + `......` + item.walletAddress.slice(-4) : ""})`}</p> */}
                                                        </p>
                                                            <span className="icon md success-arrow scale-150"></span></div> : <div className='flex justify-between'><p className={`text-base text-lightWhite font-semibold mb-0 flex gap-2 items-center`}>{item?.favoriteName} </p><span className="icon md success-arrow "></span></div>}
                                                    description={screenType === "crypto" ? <p className="text-sm font-normal text-titleColor">
                                                        {`(${item?.network})`} {item?.walletAddress?.length > 0 ? item?.walletAddress.substring(0, 6) + `......` + item?.walletAddress.slice(-6) : ""   }
                                                    </p> : <p className="text-sm font-normal text-titleColor">
                                                
                                                        {item?.name} - {item?.accountNoOrAddress}

                                                    </p>
                                                    }
                                                />
                                            </Skeleton>
                                        </List.Item>
                                    )}
                                </VirtualList>
                            </List>)}
                        {!loader && !addressListData?.length > 0 && <AppEmpty />}
                    </div>
                    <div className='text-center mb-3 mt-2'>
                        {selectedPayee && !shouldDisplayPayees && !feature == "Vaults" && <CustomButton type='primary' onClick={handleFormSubmission} className={"w-full"} loading={loading}>
                            Continue
                        </CustomButton>}
                    </div></>}

            </div>

            <div>
                <AddPayeeDrawer isOpen={isViewDrawer} onSuccess={onPayeeSuccess} onClose={closeDrawer} onCancel={closeDrawer} payeeType={screenType} selectedCoin={coinForDropDowns} selectedNetwork={network} />
            </div>
        </div>

    )
}


export default AddressList;