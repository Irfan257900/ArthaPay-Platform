import React, { useCallback, useEffect, useState } from 'react';
import { List, Typography, Skeleton, Dropdown, Space, Menu, Button } from 'antd';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router';
import AppDefaults from '../../utils/app.config';
import AppNumber from './inputs/appNumber';
import { useTranslation } from 'react-i18next';
import { textStatusColors } from '../../utils/statusColors';
import AppSearch from './appSearch';
import CoinListLoader from '../skeleton/coinList.loader';
import numberFormatter from '../../utils/numberFormatter';
import NumericText from './numericText';
const { Text } = Typography

const CoinsList = ({ fiatCoin, coinList, coinSearch, isLoading, selectedCoin, onReturnCoin,
    selectCoin, isPercent, isShowCoinBalance, CryptoCoin, cryptoCoin, isNetwork, isCrypto, fiatWalletCode,
    coinFields, selectionWalletcode, coinSelectionModal, selectedWithdrawCoin, handleListModalClose, screenName = "", currencyType }) => {
    const [coinListData, setCoinListData] = useState();
    const [searchVal, setSearchVal] = useState([]);
    const [coinSelectedModal, setCoinSelectedModal] = useState(null);
    const { walletcode } = useParams();
    const menuBar = (item, selectedItem) => (
        <Menu>
            <ul className="dropdown-list">
                {item === "crypto" && <>

                    <Link to="/wallets"
                        className=' customicon c-pointer'><li className='c-pointer'>
                            Deposit
                        </li> </Link>
                    <Link to={`/wallets/${selectedItem?.walletCode}/withdraw`}
                        className='customicon c-pointer'>
                        <li className='c-pointer'>
                            Withdraw
                        </li></Link>
                </>}

            </ul>
        </Menu>
    )
    useEffect(() => {
        setCoinListData(coinList)
    }, [coinList])//eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (selectedCoin) {
            if (!onReturnCoin) {
                selectList(selectedCoin)
            }
        }
    }, [selectedCoin, selectedWithdrawCoin]);//eslint-disable-line react-hooks/exhaustive-deps
    const handleSearch = useCallback((value) => {
        let valueToSearch = typeof value === 'string' ? value?.trim() : searchVal?.trim()
        setSearchVal(valueToSearch)
        let filtercoinsList;
        if (!value) {
            filtercoinsList = coinList;
        } else {
            filtercoinsList = coinList.filter(item => ((item[coinFields?.currencyCode])?.toLowerCase().includes(valueToSearch.toLowerCase()) ||
                (item[coinFields?.coinName])?.toLowerCase().includes(valueToSearch.toLowerCase())));
        }
        setCoinListData(filtercoinsList)
    }, [searchVal, coinList]);
    const selectList = (item) => {
        handleListModalClose?.()
        if (selectCoin) {
            selectCoin(item)
        }
        else if (coinSelectionModal) {
            coinSelectionModal(item);
            setCoinSelectedModal(item?.walletCode || item?.coin || fiatCoin)
        }
    }
    const { t } = useTranslation();

    const getFormattedDefaultValue = (value) => {
        const absoluteValue = Math.abs(value);
        const sign = Math.sign(value);
        if (absoluteValue > 999999) {
            return sign * (absoluteValue / 1000000).toFixed(1);
        }
        return sign * absoluteValue;
    };



    const truncateDecimals = (num, decimals) => {
        const factor = Math.pow(10, decimals);
        return Math.floor(num * factor) / factor;
    };

    const getBalanceText = (amount) => {
        if (!amount || isNaN(amount)) {
            return currencyType === "fiat" ? "0.00" : "0.0000";
        }
        const { number, suffix } = numberFormatter(amount);
        const decimalPlaces = currencyType === "fiat" ? 2 : 4;
        const truncatedNumber = truncateDecimals(number, decimalPlaces);
        return (
            truncatedNumber.toLocaleString(undefined, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
            }) + (suffix || "")
        );
    };

    const handleChange = useCallback((event) => {
        setSearchVal(event.currentTarget.value);
    }, []);
    const handleClick = useCallback((event) => {
        event.preventDefault();
    }, []);
    return (

        <div className="coin-container">
            {coinSearch && <div className="coin-search dt-topspace">
                <AppSearch value={searchVal} placeholder={isCrypto?('Search coin'):!isCrypto?('Search currency'):t('vault.vaultscrypto.searchCoin')} suffix={<button onClick={handleSearch}><span className="icon md search c-pointer" /></button>}
                    onChange={handleChange}
                    onSearch={handleSearch}
                    size="middle" bordered={false} className="coin-search-input " />
            </div>}
            {isLoading && <div className="db-kpi p-relative text-center" style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                <CoinListLoader />
            </div>}
            {!isLoading &&
                <List
                    dataSource={coinListData || []}
                    renderItem={(item) => (
                        <List.Item key={item.id} className={`coin-item coin-flexgrow db-coinlist ${((item[coinFields?.currencyCode]?.toLowerCase()) === (coinSelectedModal?.toLowerCase() || fiatCoin?.toLowerCase() || CryptoCoin?.coin.toLowerCase() || cryptoCoin?.toLowerCase() || walletcode?.toLowerCase() || fiatWalletCode?.toLowerCase() || selectionWalletcode?.toLowerCase())) ? 'active' : ''}`} onClick={() => selectList(item)}
                            actions={
                                coinFields?.showTradebtn ? [
                                    <>
                                        {(item[coinFields?.currencyCode] === "USD" || item[coinFields?.currencyCode] === "EUR" || item[coinFields?.currencyCode] === "GBP" || item[coinFields?.currencyCode] === "CHF") ? <Dropdown
                                            overlay={menuBar("fiat", item[coinFields?.currencyCode])}
                                            trigger={['click']} placement="bottomCenter" arrow overlayClassName="secureDropdown depwith-drpdown" >
                                            <Button onClick={handleClick}>
                                                <Space>
                                                    <span className="icon md menubar"></span>
                                                </Space>
                                            </Button>
                                        </Dropdown> : <Dropdown
                                            overlay={menuBar("crypto", item)}
                                            trigger={['click']} placement="bottomCenter" arrow overlayClassName="secureDropdown depwith-drpdown" >
                                            <Button onClick={handleClick}>
                                                <Space>
                                                    <span className="icon md menubar"></span>

                                                </Space>
                                            </Button>
                                        </Dropdown>}
                                    </>
                                ] : ''
                            }
                        >
                            <Skeleton loading={isLoading} active avatar paragraph={{ rows: 1 }}>

                                <List.Item.Meta
                                    bordered
                                    actions={false}
                                    avatar={<div className=' custom-rounded-coin'>{item?.logo || item.image ? <img src={item?.logo || item.image} className='w-11 h-8 rounded-5' /> : <span className={`crypto coin sm ${item[coinFields?.currencyCode]?.toLowerCase()}`} />}</div>}
                                    title={<Text className={`coin-title ${item[coinFields?.currencyCode]?.toLowerCase()}`}>{item[coinFields?.coinName]} </Text>}
                                    description={<>{isCrypto && <div className='coin-fillname'>
                                        {item[coinFields?.currencyCode]}
                                    </div>}</>}
                                />
                                <div className={` ${isShowCoinBalance === true ? "d-nonecoinlist text-right" : "d-coinlist text-right"}`}>
                                    {screenName !== 'payoutfiat' && <NumericText
                                        value={item?.balance || item[coinFields?.amount]}
                                        type="text"
                                        defaultValue={getFormattedDefaultValue(item?.balance || item[coinFields?.amount])}
                                        // prefixText={fiatCurrencySymbols[cryptoCoin]}  -- import ./currencySymbols
                                        suffixText=""
                                        decimalScale={isCrypto ? AppDefaults.cryptoDecimals : AppDefaults.fiatDecimals}
                                        fixedDecimalScale={true}
                                        thousandSeparator={true}
                                        allowNegative={true}
                                        className={`coin-val d-block coinval-width`}
                                    />}
                                    {screenName === 'payoutfiat' && getBalanceText(item?.balance || item[coinFields?.amount],'fiat')}
                                    {isPercent &&
                                        <Text className={`coin-price ${item.percent_change_1h < 0 ? textStatusColors.negative : textStatusColors.positive}`}>{item[coinFields?.percentage] ? item[coinFields?.percentage] : 0}%</Text>}

                                </div>
                                <div className={` ${isNetwork === true}`}>
                                    <Text className={`coin-val d-block`}>{item[coinFields?.networkType]}</Text>
                                </div>
                            </Skeleton>
                        </List.Item>
                    )}
                />
            }

        </div>
    )
}

const connectStateToProps = ({ userConfig, oidc, WithdrawData }) => {
    return {
        userConfig: userConfig.details, user: oidc.user,
    }
}

export default connect(connectStateToProps)(CoinsList);