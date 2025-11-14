import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Collapse,  Input, Form } from "antd";
import { connect } from "react-redux";
import {getCryptoAssets, getCryptoWallets, getFiatAsset  } from "./api/services";
import {useNavigate } from "react-router";
import List from "../../core/grid.component";
import AppDefaults from "../../utils/app.config";
import AppNumber from "../../core/shared/inputs/appNumber";
import ManageVault from "./vault.manage";
import { fetchVaults } from "./vaultAccordianReducer";
import PropTypes from 'prop-types';
import PageHeader from "../../core/shared/page.header";
import PaymentsDashboardLoader from "../../core/skeleton/payments.loader/payments.dashboard.loader";
import HeaderNotificationsLoader from "../../core/skeleton/header.notification.loader";
import WalletGraph from "./walletGraph";
import darknoData from '../../assets/images/dark-no-data.svg';
import lightnoData from '../../assets/images/light-no-data.svg';
import { useTranslation } from "react-i18next";
import { WalletsColumns } from "./customCells";
import VaultsKpis from "../../core/dashboard/vaultsKpis";
const { Panel } = Collapse;
const Dashboard = (props) => {
    const gridRef = useRef()
    const WalletsColumn=WalletsColumns()
    const { t } = useTranslation();
    const [cryptoDetails, setCryptoDetails] = useState([]);
    const [showAssets, setShowAssets] = useState([])
    const [showByAssetsFait, setShowByAssetsFait] = useState([])
    const [isShowByAssetChecked, setIsShowByAssetChecked] = useState(false);
    const navigate = useNavigate()
    const [vaultToEdit, setVaultToEdit] = useState(null);
    const [modal, setModal] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const baseURL = window.runtimeConfig.VITE_WALLET_TYPE === "non_custodial" ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_API_END_POINT;
    const [cryptoActiveKey, setCryptoActiveKey] = useState([0]); 
    const [isLoadingCrypto,setIsLoadingCrypto]=useState(false)
    const [vaultsData] = useState([])
    const handleRedirectToCrypto = () => {
        navigate(`crypto`)
    }
    useEffect(() => {
        fetchData()
    }, []);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                getCryptoWallets(setCryptoDetails),
                getShowByFiatDetails()
            ]);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };
    const handleCheckboxChange = useCallback((e) => {
        setIsShowByAssetChecked(e.target.checked);
        if (e.target.checked) {
            getShowByAssetsDetails();
        } else {
            setShowAssets([]);
        }
      }, []);
    const getShowByAssetsDetails = async () => {
        await getCryptoAssets( setIsLoadingCrypto,setShowAssets);
    }
    const getShowByFiatDetails = async () => {
        await getFiatAsset(setShowByAssetsFait);
    }
    const getAccordionClassName = (index) => {
        const classNames = ["blue-gradient", "green-gradient", "brown-gradient"];
        return classNames[index % classNames.length];
    };
    const onVaultSave = useCallback(() => {
        fetchVaults( "dashboard",true);
        onModalClose();    
      }, [props?.user?.id]);
    const  handleVaultFait=()=>{
        navigate('fiat')
    }
    const onModalClose = useCallback(() => {
        setVaultToEdit(null);
        setModal('');
    },[]);
    const breadCrumbList = [
        { id: "1", title: t("vaults.Vaults"), }
    ]
    const CreateVaultButton = useMemo(() => {
        return (
            <div className='nodata-content'>
            <div className='no-data'>
            <img src={darknoData} width={'100px'} alt="img" className="dark:block hidden"></img>
            <img src={lightnoData} width={'100px'} alt="img" className="dark:hidden block"></img>
            <p className="text-lightWhite text-sm font-medium mt-3">{t('vaults.No Data')}</p>
            </div>
        </div>
        );
    });
    const handleVaultsDrawer = useCallback((data) => {
        data&& setModal('add')
    }, []);
    const handleCryptoActiveKey = useCallback((key) => {
        setCryptoActiveKey(key)
    }, [])
   
    return (<>
        {isLoading && <PaymentsDashboardLoader />}
        {!isLoading && <div>
            <PageHeader breadcrumbList={breadCrumbList} />
            <div className="grid grid-col-1 xl:grid-cols-3 md:grid-cols-2 gap-3">
                <div className="kpicardbg ">
                    <h1 className="text-base font-semibold text-titleColor">Crypto</h1>
                    <div className="flex -space-x-1 py-5">
                        <img className=" inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/BTC.svg" alt="Bitcoin" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/ETH.svg" alt="Ethereum" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdc-coin.svg" alt="USD Coin" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdtclr.svg" alt="Tether" />
                    </div>
                    <h1 className="text-3xl font-semibold text-dbkpiText">$ 40,909,809.62</h1>

                </div>

                <div >
                    <div className="kpicardbg ">
                        <h1 className="text-base font-semibold text-titleColor">Fiat</h1>
                        <div className="flex -space-x-1 py-5">
                            <img className=" inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/BTC.svg" alt="Bitcoin" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/ETH.svg" alt="Ethereum" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdc-coin.svg" alt="USD Coin" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdtclr.svg" alt="Tether" />
                        </div>
                        <h1 className="text-3xl font-semibold text-dbkpiText">$ 90,884.67</h1>

                    </div>
                </div>
                <div>
                    <div className="flex  justify-between mb-4 ">
                        <h4 className="bashboard-titles">Recent Activity</h4>
                        <div>
                            <button type="normal" className="secondary-outline">All Transactions  <span className="icon btn-arrow shrink-0 ml-2"></span></button>
                        </div>
                    </div>
                    <div>
                <div className="kpicardbg flex gap-3.5 items-center">
                <span className="icon shrink-0 notificationdeposit"></span>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p><span className="text-sm font-semibold text-subTextColor">John Doe</span><span className="icon btn-white-arrow shrink-0"></span><span className="text-sm font-semibold text-subTextColor">Eleanor Account</span> </p>
                        <h4 className="text-xs font-normal text-paraColor">20 Mar 2025</h4>
                    </div>
                    <div className="flex justify-between items-center">
                    <h4 className="text-xs font-normal text-paraColor">Withdraw Fiat USD SWIFT</h4>
                    <h4 className="text-sm font-semibold text-subTextColor">+948.5 UDS</h4>
                    </div>
                    <div className="flex justify-between items-center">
                        <h4>
                        <span>1bd44...2j3i<span className="icon anticon-copy ml-1 scale-75"></span></span>
                        </h4>
                        <h4 className="!text-textApproved text-xs font-normal">Approved</h4>
                        
                    </div>
                </div>
                </div>
                    </div>
                </div>
            </div>
            <div className="mt-7">
            <h4 className="text-2xl text-titleColor font-semibold mb-1.5">{'Vaults'}</h4>
                    <div className="grid md:grid-cols-4 grid-cols-1 gap-5">
                        <VaultsKpis merchantsData={vaultsData} buttonName={t("dashboard.Create Vault")} actionFrom={t('dashboard.Vaults')} handleVaultsDrawer={handleVaultsDrawer}redirectTo={'/vaults'} />
                    </div>
                </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-5 mb-2  mt-7">
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-1" onClick={handleRedirectToCrypto}>
                        <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
                            <button >{t('vaults.Crypto')}</button>
                        </h4>
                        <span className="icon lg square-arrow cursor-pointer" ></span>
                    </button>
                    <div className='flex items-center gap-2.5'>
                    <span className='text-sm font-normal text-lightWhite'>{t('vaults.Show By Asset')}</span>
                        <Form.Item name="isCheck" className={"mb-0"}>
                            <label className="custom-checkbox c-pointer cust-check-outline">
                                <Input
                                    name="check"
                                    type="checkbox"
                                    className="c-pointer"
                                    checked={isShowByAssetChecked}
                                    onChange={handleCheckboxChange}

                                />
                                <span></span>
                            </label>
                        </Form.Item>
                    </div>
                </div>
                <div className="md:flex justify-between items-center hidden">
                    <button className="flex items-center gap-1" onClick={()=>{handleVaultFait()}}>
                        <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
                            {t('vaults.Fiat')}
                        </h4>
                        <span className="icon lg square-arrow cursor-pointer"></span>
                    </button>                    
                </div>
            </div>
                <div className="md:grid md:grid-cols-2 mb-5 gap-5">                  
                <div className="p-0 bg-cover bg-no-repeat md:flex-1 mb-4 md:mb-0">
                    {((isShowByAssetChecked && showAssets.length > 0) || cryptoDetails.length > 0) &&
                        (<>
                            
                                {!isShowByAssetChecked && <div className="overflow-auto h-[267px]"><Collapse
                                    activeKey={cryptoActiveKey}
                                    onChange={handleCryptoActiveKey}
                                    bordered={false}
                                    expandIconPosition="end"
                                    className="custom-collapse dashboard-collapse"
                                >
                                    {cryptoDetails.map((crypto, index) => (
                                        !isShowByAssetChecked && (
                                            <Panel
                                                key={index === 0 && "0" || crypto.id}
                                                header={
                                                    <table className="w-full">
                                                          <thead>
                                                    <tr>
                                                        <></>
                                                    </tr>
                                                </thead>
                                                <tbody> 
                                                            <tr>
                                                                <td className="w-40">
                                                                    <span className="font-semibold text-subTextColor text-sm">
                                                                        {!isShowByAssetChecked &&
                                                                            (`${ crypto.merchantName.length > 31
                                                                                ?  crypto.merchantName.slice(0, 31) + '...'
                                                                                : crypto.merchantName}`)}
                                                                    </span>
                                                                </td>
                                                                <td>                                                                
                                                                    <div className="text-right">
                                                                        <span className="font-semibold text-subTextColor text-sm">
                                                                            <AppNumber
                                                                                value={!isShowByAssetChecked && crypto.amountInUSD||0}
                                                                                type="text"
                                                                                defaultValue={!isShowByAssetChecked && crypto.amountInUSD||0}
                                                                                prefixText="$"
                                                                                suffixText=""
                                                                                decimalScale={AppDefaults.fiatDecimals}
                                                                                fixedDecimalScale={true}
                                                                                thousandSeparator={true}
                                                                                allowNegative={true}
                                                                                className="amount-text"
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody> 
                                                    </table>
                                                }
                                                className={getAccordionClassName(index)}
                                            >
                                                {!isShowByAssetChecked && (
                                                    crypto.merchantsDetails ? (
                                                        <table className="w-full table-style md:!min-w-full">
                                                                {crypto.merchantsDetails.map((merchant) => (
                                                                    <tr
                                                                        key={merchant.id}
                                                                        className="bg-transparent"
                                                                    >
                                                                        <td className="text-left px-3 py-2 border border-StrokeColor w-40 !border-x-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <img
                                                                                    src={merchant.logo}
                                                                                    className="w-6 h-6 rounded-full"
                                                                                    alt={`${merchant.coin} logo`}
                                                                                />
                                                                                <div>
                                                                                    <span className="block font-medium text-sm text-lightWhite">
                                                                                        {merchant.coinName}
                                                                                    </span>
                                                                                    <span className="block text-descriptionGreyTwo text-xs font-medium">
                                                                                        {merchant.balance} {merchant.code}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-right pl-3 pr-0 py-2 border border-StrokeColor text-sm font-semibold text-lightWhite w-40 !border-x-0">
                                                                            <AppNumber
                                                                                value={merchant.amountInUSD||0}
                                                                                type="text"
                                                                                defaultValue={merchant.amountInUSD||0}
                                                                                prefixText="$"
                                                                                suffixText=""
                                                                                decimalScale={AppDefaults.fiatDecimals}
                                                                                fixedDecimalScale={true}
                                                                                thousandSeparator={true}
                                                                                allowNegative={true}
                                                                                className="amount-text"
                                                                            />
                                                                        </td>
                                                                        <td className="border border-StrokeColor text-end w-10 !border-x-0"></td>
                                                                    </tr>
                                                                ))}
                                                        </table>
                                                    ) : (
                                                        <div className='nodata-content'>
                                                        <div className='no-data'>
                                                        <img src={darknoData} width={'100px'} alt='img' className="dark:block hidden"></img>
                                                        <img src={lightnoData} width={'100px'} alt='img' className="dark:hidden block"></img>
                                                        <p className="text-lightWhite text-sm font-medium mt-3">No Data</p>
                                                        </div>
                                                    </div>
                                                    )
                                                )}
                                            </Panel>
                                        )
                                    ))}
                                </Collapse></div>}
                               { isLoadingCrypto&&<HeaderNotificationsLoader itemCount={5}/>}
                                {!isLoadingCrypto&&isShowByAssetChecked &&
                                <div className="overflow-auto h-[267px] border border-StrokeColor rounded-5">
                                    <table className="w-full table-style md:!min-w-full">
                                            {showAssets.map((asset, idx) => (
                                                <tr className="bg-transparent" key={asset.id}>
                                                    <td className="text-left px-3 py-2 border border-StrokeColor w-40 !border-x-0">
                                                       
                                                        <div className="flex items-center gap-2">
                                                                                <img
                                                                                    src={asset.logo}
                                                                                    className={`w-6 h-6 rounded-[50%] ${asset.coin ? "" : "bg-primaryColor"}`}
                                                                                    alt={`${asset.coin} logo`}
                                                                                />
                                                                                <div>
                                                                                    <span className="block font-medium text-sm text-lightWhite">
                                                                                        {asset.currency}
                                                                                    </span>
                                                                                    {/* <span className="block text-descriptionGreyTwo text-xs font-medium">
                                                                                        {asset.amount} {asset.code}
                                                                                    </span> */}
                                                                                </div>
                                                                            </div>
                                                    </td>
                                                    <td className="text-right pl-3 pr-0 py-2 border border-StrokeColor text-sm font-semibold text-lightWhite !border-x-0">
                                                        <AppNumber
                                                            value={asset.amount||0}
                                                            type="text"
                                                            defaultValue={asset.amount||0}
                                                            prefixText=""
                                                            suffixText=""
                                                            decimalScale={AppDefaults.cryptoDecimals}
                                                            fixedDecimalScale={true}
                                                            thousandSeparator={true}
                                                            allowNegative={true}
                                                            className="amount-text"
                                                        />
                                                    </td>
                                                    <td className="border border-StrokeColor text-end w-10 !border-x-0">
                                                    </td>
                                                </tr>
                                            ))}
                                    </table>
                                    </div>}                                    
                            
                            </>) ||(
                            CreateVaultButton
                        )}
                    </div>
                    <div className="md:hidden justify-between items-center block">
                        <button className="flex items-center gap-1" onClick={() => { handleVaultFait() }}>
                            <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
                                {t('vaults.Fiat')}
                            </h4>
                            <span className="icon lg square-arrow cursor-pointer"></span>
                        </button>
                    </div>
                    <div className="p-0 bg-cover bg-no-repeat md:flex-1 border border-StrokeColor rounded-5">                    
                        {(( showByAssetsFait.length >0) ) &&(
                            <div className="h-[267px] overflow-auto rounded-5">
                            {
                                    <table className="w-full table-style md:!min-w-full">
                                            {showByAssetsFait.map((asset, idx) => (
                                                <tr className="bg-transparent" key={asset.id}>
                                                    <td className="text-left px-3 py-2 border border-StrokeColor !border-x-0">
                                                        
                                                        <div className="flex items-center space-x-2">
                                                                    <div className={`h-7 w-12 rounded-5 ${asset.logo ? "" : "bg-primaryColor"}`}>
                                                                        <img
                                                                            src={asset.logo}
                                                                            className="h-7 w-12 rounded-5"
                                                                            alt={asset.logo}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                    <span className="block font-medium text-sm text-lightWhite">
                                                                        {asset.currency}
                                                                        </span>
                                                                        <span className="block text-descriptionGreyTwo text-xs font-medium">
                                                                        {asset.currency}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                    </td>
                                                    <td className="text-right pl-3 pr-0 py-2 border border-StrokeColor text-sm font-semibold text-lightWhite !border-x-0">
                                                        <AppNumber
                                                            value={asset.amountInUSD||0}
                                                            type="text"
                                                            defaultValue={asset.amountInUSD||0}
                                                            prefixText="$"
                                                            suffixText=""
                                                            decimalScale={AppDefaults.fiatDecimals}
                                                            fixedDecimalScale={true}
                                                            thousandSeparator={true}
                                                            allowNegative={true}
                                                            className="amount-text"
                                                        />
                                                    </td>
                                                    <td className="border border-StrokeColor text-end w-10 !border-x-0">
                                                    </td>
                                                </tr>
                                            ))}
                                    </table>
                                    }
                            </div>
                                )||(
                                    <div className='nodata-content'>
                                <div className='no-data'>
                                <img src={darknoData} width={'100px'} alt="img" className="dark:block hidden"></img>
                                <img src={lightnoData} width={'100px'} alt="img" className="dark:hidden block"></img>
                                <p className="text-lightWhite text-sm font-medium mt-3">{t('vaults.No Data')}</p>
                                </div>
                            </div>
                                )}
                                </div>
                </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-5 mb-0 mt-12">
        <h3 className="text-2xl font-semibold text-titleColor mb-1.5 md:block hidden">{t('vaults.Recent Activity')}</h3>
        <h3 className="text-2xl font-semibold text-titleColor mb-1.5 md:block hidden">{t('vaults.Transactions Summary')}</h3>
        </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-5 mb-7">
                <div className="rounded-5 border border-dbkpiStroke recent-grid-br">
                        <div className="">
                        <List
                            url={baseURL + `/Merchant/transactions/All/All/null`}
                            pageable={false}
                            pSize={'7'}
                            columns={WalletsColumn}
                            className="custom-grid"
                            ref={gridRef}
                        />
                        </div>
                </div>
                <WalletGraph/>
            </div>
            {modal && (
                <ManageVault
                    isOpen={modal}
                    data={vaultToEdit}
                    onSave={onVaultSave}
                    onClose={onModalClose}
                    mode={modal}
                    onUpgrade={onModalClose}
                />
            )}
        </div>}
    </>
    );
}
Dashboard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
};
const connectStateToProps = ({ userConfig }) => {
    return { user: userConfig.details }
}
export default connect(connectStateToProps)(Dashboard)