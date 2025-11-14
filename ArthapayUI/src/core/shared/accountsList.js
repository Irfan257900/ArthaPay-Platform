import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { List, Typography, Skeleton, Image } from "antd";
import { connect } from "react-redux";
import currencySymbols from "./currencySymbols";
import NumericText from "./numericText";
import ListLoader from "../skeleton/common.page.loader/list.loader";
import NoAccounts from "../../modules/banks/noAccounts";
import AppSearch from "./appSearch";
import CustomButton from "../button/button";
import AppEmpty from "./appEmpty";
import CreateButton from "../../modules/banks/create/create.button";
const { Text } = Typography;
const AccountsList = ({
  showSearch,
  isLoading,
  accountsList,
  fields,
  onSelect = null,
  selected = null,
  hasActions = true,
  showBalances = true,
  handleListModalClose,
}) => {
  const [list, setList] = useState(accountsList);
  const [searchVal, setSearchVal] = useState([]);

  useEffect(() => {
    setList(accountsList);
  }, [accountsList]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((value) => {
    const valueForFilter=typeof value==='string' ? value?.trim() : searchVal?.trim()
    let filterList;
    if (!valueForFilter) {
      filterList = accountsList;
    } else {
      filterList = accountsList.filter((item) =>
        item[fields?.currency].toLowerCase().includes(valueForFilter.toLowerCase()?.trim())
      );
    }
    setList(filterList);
  },[searchVal]);

  const onAccountChange = useCallback((item) => {
    handleListModalClose?.()
    onSelect?.(item);
  },[handleListModalClose])
  const handleInputChange = useCallback((event) => {
    setSearchVal(event.currentTarget.value);
}, []);
  return (
    <div className="h-[350px]">
      {isLoading && <ListLoader />}
      {!isLoading && !accountsList?.length && <div className="p-3.5 mt-5 border-t border-StrokeColor">
        {/* <NoAccounts title={'No Accounts Found'} showIcon={true} description="You don't have any accounts yet.
Let's create one to get started!" showButton={false} /> */}
<AppEmpty description="Add an account to start making deposits and withdrawals."  />
<div className="text-center mt-4"><CreateButton>Account Create</CreateButton></div>

      </div>}
      {!isLoading && accountsList?.length>0 && <>
        {showSearch && (
        <div className="coin-search">
          <AppSearch
            value={searchVal}
            placeholder="Search Currency"
            suffix={<CustomButton type="normal" onClick={handleSearch}><span className="icon md search cursor-pointer" /></CustomButton>}
            onChange={handleInputChange}
            onSearch={handleSearch}
            size="middle"
            bordered={false}
            className="coin-search-input"
          />
        </div>
      )}
        <List
          dataSource={list}
          renderItem={(account) => (
            <List.Item
              key={account.id}
              className={`${
                hasActions
                  ? "coin-item custom-list cursor-pointer"
                  : "coin-item custom-list"
              } ${
                account[fields?.currency] === selected?.[fields?.currency]
                  ? "active"
                  : ""
              }`}
              onClick={hasActions ? () => onAccountChange(account) : null}
            >
              <Skeleton
                loading={isLoading}
                active
                avatar
                paragraph={{ rows: 1 }}
              >
                <List.Item.Meta
                  bordered="true"
                  actions={false}
                  className="items-center"
                  avatar={
                    <Image preview={false} className="!w-9 !h-9 rounded-full" src={account?.[fields?.logo]} />
                  }
                  title={
                    <Text
                      className={`coin-title ${account[
                        fields?.currencyCode
                      ]?.toLowerCase()}`}
                    >
                      {/* {account[fields?.currency]} */}
                    </Text>
                  }
                  description={
                    <div className="coin-fullname">
                      {account[fields?.currencyCode]} {account?.[fields?.state]}
                    </div>
                  }
                />
                <div
                  className={`${
                    showBalances
                      ? "d-nonecoinlist text-right"
                      : "d-coinlist text-left"
                  }`}
                >
                  <div className="d-flex">
          
                    <NumericText
                      value={account[fields?.available] || 0}
                      decimalScale={2}
                      thousandSeparator
                      renderTextClass="coin-balance text-upper text-primary d-block"
                      displayType="text"
                      prefixText={currencySymbols[account[fields?.currencyCode]?.toLowerCase()] || ""}
                    />
                  </div>
                </div>
              </Skeleton>
            </List.Item>
          )}
        />
      </>}
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details};
};
AccountsList.propTypes = {
  showSearch: PropTypes.bool,
  isLoading: PropTypes.bool,
  showBalances: PropTypes.bool,
  accountsList: PropTypes.array,
  fields: PropTypes.object,
  onSelect: PropTypes.func,
  selected: PropTypes.object,
  hasActions: PropTypes.bool,
  handleListModalClose:PropTypes.func || PropTypes.any
};
export default connect(connectStateToProps)(AccountsList);
