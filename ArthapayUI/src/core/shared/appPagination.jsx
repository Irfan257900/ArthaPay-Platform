import { Pagination } from "antd";
import React, { useCallback, useEffect } from "react";
const showTotalFunc = (total, range) =>
  `${range[0]}-${range[1]} of ${total} items`;
const AppPagination = ({
  currentPage,
  onChange,
  onChangeParams = [],
  total,
  showTotal = showTotalFunc,
  pageSize = 10,
  showSizeChanger = false,
  pageSizeOptions = [5, 10, 50, 100],
  onShowSizeChange,
  onShowSizeChangeParams,
  hideOnSinglePage=true,
  showQuickJumper=true,
  simple=false,
  align="end",
  className=""
}) => {
  const handleChange = useCallback(
    (pageToSet) => {
      onChange?.(pageToSet, ...onChangeParams);
    },
    [onChangeParams]
  );
  const handleShowSizeChange=useEffect((current,size)=>{
    if(showSizeChanger && onShowSizeChange){
        onShowSizeChange(current,size)
    }
  },[showSizeChanger,onShowSizeChangeParams])
  return (
    <Pagination
      pageSize={pageSize}
      simple={simple}
      className={className}
      showSizeChanger={showSizeChanger}
      pageSizeOptions={pageSizeOptions}
      current={currentPage}
      showQuickJumper ={showQuickJumper}
      onShowSizeChange={handleShowSizeChange}
      align={align}
      showTotal={showTotal}
      onChange={handleChange}
      total={total}
      hideOnSinglePage={hideOnSinglePage}
    />
  );
};

export default AppPagination;
