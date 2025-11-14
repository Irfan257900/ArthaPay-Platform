import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router';
import PageHeader from '../../../core/shared/page.header';
import DashBoardAppKpis from '../../../core/shared/dashboardKpis';
import DashboardLoader from '../../../core/skeleton/dashboard.loader';
import ExchangeServices from './ExchangeService';
import moment from "moment/moment";
import MarketHighlightsKpis from '../../../core/dashboard/marketHighlightsKpis';
import List from '../../../core/grid.component';
import { textStatusColors } from '../../../utils/statusColors';
import { getFiatAsset } from '../../wallets/api/services';
import { useTranslation } from 'react-i18next';
import AppNumber from '../../../core/shared/inputs/appNumber';
import AppDefaults from '../../../utils/app.config';
import {  getCrypto, getKipsDetails, getTopGainers } from './service';
import lightnoData from '../../../assets/images/light-no-data.svg';
import darknoData from '../../../assets/images/dark-no-data.svg';
import { Typography } from 'antd';
const WalletType = window.runtimeConfig.VITE_WALLET_TYPE;
const baseURL =
  WalletType === "non_custodial"
    ? window.runtimeConfig.VITE_WEB3_API_END_POINT
    : window.runtimeConfig.VITE_API_END_POINT;
const ExchangeDashboard = () => {
  const userInfo = useSelector((store) => store.userConfig.details);
  const [isLoading, setIsLoading] = useState(true)
  const { Text } = Typography
  const [showByAssetsFait, setShowByAssetsFait] = useState([])
  const [cryptoDetails, setCryptoDetails] = useState([]);
  const navigate = useNavigate()
  const { t } = useTranslation();
  const [kpisData, setKpisData] = useState([])
  const [marketData, setMarketData] = useState([]);
  const breadCrumbList = [
    { id: "1", title: "Exchange", },
  ];
  const getShowByFiatDetails = async () => {
    const urlParams = { id: userInfo.id }
    await getFiatAsset(setShowByAssetsFait, urlParams);
  }
  useEffect(() => {
    fetchData()
  }, []);
  const renderTransactionDate = (cellprops) => (
    <td>
      <div>
        {cellprops.dataItem.transactionDate
          ? moment
            .utc(cellprops.dataItem.transactionDate)
            .local()
            .format("DD/MM/YYYY hh:mm:ss A")
          : cellprops.dataItem.transactionDate}
      </div>
    </td>
  );
  const renderTransactionId = (propsData) => (
    <td>
      <div>
        <button
          onClick={() => handleView(propsData?.dataItem)}
        >
          {propsData?.dataItem["txId"]}
        </button>
      </div>
    </td>
  );
  const customStatusCell = (propsData) => {
    const status = propsData.dataItem?.status || "Approved";
    return (
      <td>
        <span className={textStatusColors[status]}>{status}</span>
      </td>
    );
  };
  const gridColumns = [
    {
      field: "txId",
      title: "Transaction ID",
      filter: false,
      filterType: "text",
      width: 180,
      sortable:false,
      customCell: renderTransactionId,
    },
    {
      field: "transactionDate",
      title: "Transaction Date",
      filter: false,
      filterType: "date",
      width: 180,
      sortable:false,
      customCell: renderTransactionDate,
    },
    {
      field: "transactionType",
      title: "Type",
      filter: false,
      filterType: "text",
      sortable:false,
      width: 100,
    },
    {
      field: "wallet",
      title: "Wallet",
      filter: false,
      filterType: "text",
      sortable:false,
      width: 125,
    },
    {
      field: "amount",
      title: "Value",
      filter: false,
      filterType: "text",
      sortable:false,
      width: 100,
    },
    {
      field: "state",
      title: "Status",
      filter: false,
      filterType: "text",
      sortable:false,
      width: 100,
      customCell: customStatusCell,
    },
  ];
  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getKipsDetails(setKpisData),         
        getTopGainers(setMarketData),
        getShowByFiatDetails(),
        getCrypto(setCryptoDetails),
      ]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const handleRedirection = useCallback((type) => {
    type=="crypto"&& navigate(`/exchange/sell/USDT`);
    type=="fiat"&&navigate('/exchange/buy/USDT')
  }, []);

  const CreateVaultButton = useMemo(() => {
    return (
      <div className='nodata-content py-3'>
        <div className='no-data'>
          <img src={darknoData} width={'100px'} alt="img" className="dark:block hidden"></img>
      <img src={lightnoData} width={'100px'} alt="img" className="dark:hidden block"></img>
          <p className="text-lightWhite text-sm font-medium mt-3">{t('vaults.No Data')}</p>
        </div>
      </div>
    );
  });
  return (
    <> {isLoading && <DashboardLoader />}
      <PageHeader breadcrumbList={breadCrumbList} />

      <div className="grid md:grid-cols-4 gap-5">
        <DashBoardAppKpis data={kpisData} isSeparate={true} EndIndex={1} />
          <ExchangeServices />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-5 mb-2 mt-8">
        <div className="flex justify-between items-center">
          <button className="flex items-center gap-1" onClick={()=>handleRedirection('crypto')}>
            <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
              <button >{t('vaults.Crypto')}</button>
            </h4>
            <span className="icon lg square-arrow cursor-pointer" ></span>
          </button>         
        </div>
        <div className="md:flex justify-between items-center hidden">
          <button className="flex items-center gap-1" onClick={()=>handleRedirection('fiat')}>
            <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
              {t('vaults.Fiat')}
            </h4>
            <span className="icon lg square-arrow cursor-pointer"></span>
          </button>
        </div>
      </div>
      <div className="md:grid md:grid-cols-2 mb-5 gap-5">
        <div className="p-0 border border-StrokeColor md:flex-1 mb-4 md:mb-0 rounded-5">
          {(cryptoDetails.length > 0) &&
            (
            <>
              {
                <table className="w-full table-style md:!min-w-full">
                  {cryptoDetails.map((asset, idx) => (
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
                              {asset.coinName}
                            </span>
                            <span className="block text-descriptionGreyTwo text-xs font-medium">
                              {asset.currency}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right pl-3 pr-0 py-2 border border-StrokeColor text-sm font-semibold text-lightWhite !border-x-0">
                        <AppNumber
                          value={asset.available || 0}
                          type="text"
                          defaultValue={asset.available || 0}
                          prefixText=""
                          suffixText=""
                          decimalScale={AppDefaults.fiatDecimals}
                          fixedDecimalScale={true}
                          thousandSeparator={true}
                          allowNegative={true}
                          className="amount-text"
                        />
                        <Text className={`coin-price ${asset.percent_change_1h < 0 ? textStatusColors.negative : textStatusColors.positive}`}>{asset?.percent_change_1h ? asset?.percent_change_1h : 0}%</Text>
                      </td>
                      <td className="border border-StrokeColor text-end w-10 !border-x-0">
                      </td>
                    </tr>
                  ))}
                </table>
              }
            </>
            ) || (
              CreateVaultButton
            )}
        </div>
        <div className="block justify-between items-center md:hidden">
          <button className="flex items-center gap-1" onClick={()=>handleRedirection('fiat')}>
            <h4 className="text-2xl text-titleColor font-semibold mb-0.5">
              {t('vaults.Fiat')}
            </h4>
            <span className="icon lg square-arrow cursor-pointer"></span>
          </button>
        </div>      
        <div className="p-0 md:flex-1 border border-StrokeColor rounded-5">          
          {((showByAssetsFait.length > 0)) && (
            <div className="h-[267px] overflow-auto">
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
                          value={asset.amount || 0}
                          type="text"
                          defaultValue={asset.amount || 0}
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
          ) || (
              <div className='nodata-content py-3'>
                <div className='no-data'>
                  <img src={darknoData} width={'100px'} alt="img" className="dark:block hidden"></img>
                  <img src={lightnoData} width={'100px'} alt="img" className="dark:hidden block"></img>
                  <p className="text-lightWhite text-sm font-medium mt-3">{t('vaults.No Data')}</p>
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="mt-7">
        <h4 className="text-2xl text-titleColor font-semibold mb-1.5">Market Highlights{' '}<Link to={"/dashboard/makethighlights"} ><span className="icon lg square-arrow cursor-pointer"></span></Link></h4>
        <div className="grid md:grid-cols-3 gap-5">
          <MarketHighlightsKpis topgainerData={marketData} />
        </div>
      </div>
      <div className='mt-7 mb-7'>
        <h4 className="text-2xl text-titleColor font-semibold mb-2">Recent Transactions</h4>
        <div className=''>
            <List
              url={baseURL + `/Merchant/Buysell/transactions/All/null//`}
              pageable={false}
              pSize={'5'}
              columns={gridColumns}
              className="custom-grid"

            />
        </div>
      </div>

      <div>

      </div>
    </>
  )
}

export default ExchangeDashboard   