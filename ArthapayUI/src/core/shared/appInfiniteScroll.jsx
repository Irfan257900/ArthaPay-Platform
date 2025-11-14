import React, { useCallback } from "react";
import { Divider } from "antd";
import DefaultLoader from "./loader";
import { Virtuoso } from "react-virtuoso";
import AppEmpty from "./appEmpty";

const DefaultNoMoreData = ({ text }) => {
  return (
    <Divider plain>
      <div className="buy-selectgroup my-4">
        <span>{text}</span>
      </div>
    </Divider>
  );
};
const Footer=({hasMore,loading,dataLength,NoMoreData,Loader,noMoreText,description,noDatarequired}) => {
  if(hasMore && loading){
    return   <div className="mt-2">
    <Loader />
  </div>
  }
  if(dataLength>0){
    return <NoMoreData text={noMoreText} />
  }
  if(!dataLength && !loading && noDatarequired){
    return <AppEmpty description={description}/>;
  }
  return <></>
}
const AppInfiniteScroll = React.memo(
  ({
    containerHeight = 600,
    containerClass = "",
    ItemComponent,
    loading,
    page,
    hasMore,
    loadMore,
    data,
    itemKey = "id",
    defaultPage = 1,
    Loader = DefaultLoader,
    NoMoreData = DefaultNoMoreData,
    noMoreText = "YAY! YOU HAVE SEEN IT ALL",
    handleListModalClose,
    description = "No Data",
    noDatarequired=true
  }) => {
    const getMore = useCallback(() => {
      loadMore(page);
    }, [page, data]);
    const footerRenderer = useCallback(() => (
      <Footer
        hasMore={hasMore}
        loading={loading}
        dataLength={data?.length}
        NoMoreData={NoMoreData}
        noMoreText={noMoreText}
        Loader={Loader}
        description={description}
        noDatarequired={noDatarequired}
      />
    ), [hasMore,loading,data?.length,NoMoreData,Loader,noMoreText]);

    const itemRenderer=useCallback((_, item) => (
      <ItemComponent
        data={item}
        key={item[itemKey]}
        handleListModalClose={handleListModalClose}
      />
    ),[handleListModalClose,itemKey,ItemComponent])
    return (
      <>
        {loading && page === defaultPage && <Loader />}
        {
          <Virtuoso
            data={data}
            itemContent={itemRenderer}
            endReached={hasMore && !loading ? getMore : undefined}
            style={{ height: containerHeight }}
            components={{
              Footer: footerRenderer,
            }}
            className={containerClass}
          />
        }
      </>
    );
  }
);

export default AppInfiniteScroll;
