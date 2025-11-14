import { useCallback, useEffect, useState } from "react";
import ListDetailLayout from "../../core/module.layouts/listdetail.layout";
import moment from "moment";
import AppEmpty from "../../core/shared/appEmpty";
import { getNotificationIcon } from "../../utils/app.config";
import { fetchNotificationAll } from "./http.services";
import { replaceExtraSpaces } from "../../core/shared/validations";
import { useSelector } from "react-redux";
const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const mode = "view";


  const userProfileInfo = useSelector((store)=>store?.userConfig?.details);

  const breadCrumbList = [
    { id: "1", title: "Notifications" },
  ];

  useEffect(() => {
    if (userProfileInfo?.id) {
      fetchNotifications();
    }
  }, [userProfileInfo]);

   const fetchNotifications = async (
      currentData = [],
      pageToFetch = 1,
      searchValue = searchInput || 'all'
    ) => {
      const urlParams = {
        searchValue: searchValue,
        pageNo: pageToFetch,
        pageSize: pageSize,
        currentData,
      }
      await fetchNotificationAll(setLoading, setNotifications, setError, urlParams, setSelectedNotification, setPage);
    };

      const fetchNextPage = useCallback(async (pageToFetch) => {
        await fetchNotifications(notifications, pageToFetch + 1)
      }, [notifications]);

  const handleSelectedNotification=useCallback((item)=>{
    setSelectedNotification(item)
  },[]);
 
  const ItemRow = useCallback(({ data,handleListModalClose }) => {
    return (
      <ListDetailLayout.ListItem
        data={data}
        itemFields={{
          id: "id",
          title: "action",
        }}
        logoType={"custom"}
        hasLogo={true}
        customLogo={<span className={`icon ${getNotificationIcon(data?.action)}`}></span>}
        selectedRow={selectedNotification}
        onItemSelect={handleSelectedNotification }
        hasStatusBadge={true}
        metaClassName={"icon-start"}
        handleListModalClose={handleListModalClose}
      ><div><p className="text-xs font-medium text-summaryLabelGrey !text-start my-1 w-[272px] break-words whitespace-pre-line">{data?.message}</p>
          <p className="text-[10px] font-normal text-paraColor !text-start">  {data?.date ? moment.utc(data?.date).local().format("DD MMM YY hh:mmA") : "NA"}</p></div></ListDetailLayout.ListItem>
    );
  },[selectedNotification,getNotificationIcon,handleSelectedNotification]);

  const handleSearch = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    fetchNotifications([], 1, value || 'all');
  }, []);

  return (
    <div className="notification-list">
      <ListDetailLayout
        breadCrumbList={breadCrumbList}
        ListHeader={<ListDetailLayout.ListHeader title="All" showAdd={false} />}
        ListComponent={
          <ListDetailLayout.List
            list={notifications || []}
            ItemComponent={ItemRow}
            onSearch={handleSearch}
            onSearchInput={setSearchInput}
            showAlert={error !== ""}
           alterMessage={error}
            searchValue={searchInput}
            pageSize={pageSize}
            currentPage={page}
            fetchNext={fetchNextPage}
            searchPlaceholder="Search Notifications"
            loading={loading}
            setShowAlert={setError}
          />
        }
        ViewHeader={
          mode === "view" && selectedNotification ? (
            <ListDetailLayout.ViewHeader
              logoType="custom"
              logoBg=""
              logo={<span className={`icon scale-150 ${getNotificationIcon(selectedNotification?.action)}`}></span>}
              title={selectedNotification?.action}
              // metaData={`${selectedNotification?.notifiedDate} | ${selectedNotification?.message}`}
              showActions={false}
            />
          ) : <>
          </>
        }
        children={
                    !selectedNotification ? (
            <AppEmpty />
          ) : (
            <div className="rounded-sm py-3 mt-5 h-[90%]">
              <p className="text-base text-subTextColor font-normal mb-2">
                {selectedNotification?.message}
              </p>
              <p className="text-sm text-subTextColor font-normal mb-2">Additional Details</p>
              <ul className="!list-disc pl-6">
                {/* <li className="text-xs text-paraColor mb-2">
                  <span className="font-normal">Transaction ID:</span>{" "}
                  <span className="font-medium">
                    {selectedNotification?.transactionid || "NA"}
                  </span>
                </li> */}
                <li className="text-xs text-paraColor">
                  <span className="font-normal">Date:</span>{" "}
                  <span className="font-medium">
                    {selectedNotification?.date
                      ? moment
                        .utc(selectedNotification?.date)
                        .local()
                        .format("DD MMM YY hh:mmA")
                      : "NA"}
                  </span>
                </li>
              </ul>
            </div>
          )
        }
      />
    </div>
  );
};

export default Notifications;
