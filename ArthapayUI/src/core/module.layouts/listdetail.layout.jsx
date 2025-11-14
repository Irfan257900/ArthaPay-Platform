import React, {
  isValidElement,
  cloneElement,
  useCallback,
  useMemo,
  useState,
  createContext,
  useContext,
} from "react";
import ScreenActions from "../shared/screenActions";
import AppInfiniteScroll from "../shared/appInfiniteScroll";
import AppSearch from "../shared/appSearch";
import { List, Modal, Row } from "antd";
import AppAlert from "../shared/appAlert";
import defaultImg from "../../assets/images/default-circle-img.png";
import PageHeader from "../shared/page.header";
import ListLoader from "../skeleton/common.page.loader/list.loader";
export const LayoutContext = createContext();
const renderElement = (Element, extraProps = {}) => {
  if (isValidElement(Element)) {
    return cloneElement(Element, { ...Element.props, ...extraProps });
  }
  return Element;
};
const ListDetailLayout = ({
  showBreadcrumb = true,
  hasPageHeader = true,
  breadCrumbList = [],
  helpLink = "",
  hasOverview = false,
  Overview,
  ListHeader,
  ListComponent,
  ListComponentTitle = "",
  ViewHeader,
  children,
}) => {
  const [listModal, setListModal] = useState(false);
  const handleModalOpen = useCallback(() => {
    setListModal(true);
  }, []);
  const handleModalClose = useCallback(() => {
    setListModal(false);
  }, []);
  const contextValue = useMemo(() => {
    return {
      isListModalOpen: listModal,
      handleListModalClose: handleModalClose,
      handleListModalOpen: handleModalOpen,
    };
  }, [listModal]);
  return (
    <LayoutContext.Provider value={contextValue}>
      {hasPageHeader && (
        <PageHeader
          showBreadcrumb={showBreadcrumb}
          breadcrumbList={breadCrumbList}
          helpLink={helpLink}
        />
      )}
      {hasOverview && Overview}
      <Row className="row-stretch">
        <div className="layout-bg left-panel pannel-bg left-items-stretch sm-none">
          <div className=" justify-between items-center">
            {renderElement(ListHeader)}
          </div>
          <div className=""></div>
          {renderElement(ListComponent)}
        </div>
        <div className="layout-bg left-panel pannel-bg left-items-stretch md-none !p-2">
          <div className="buy-token md-none mt-0">
            <div
              className="flex items-center justify-between"
              onClick={handleModalOpen}
            >
              <span className="buy-from">
                {renderElement(ListComponentTitle)}
              </span>
              <span className="icon sm down-angle" />
            </div>
          </div>
        </div>
        {listModal && (
          <Modal
            className="custom-modal mobile-drop mobile-modal"
            onCancel={handleModalClose}
            onClose={handleModalClose}
            destroyOnClose={true}
            closable={false}
            open={listModal}
            footer={false}
          >
            <div className="text-right mb-2">
              <span
                onClick={handleModalClose}
                className="icon lg close c-pointer"
              ></span>
            </div>
            <div className="md:flex justify-between items-center">
              {renderElement(ListHeader, {
                handleListModalClose: handleModalClose,
              })}
            </div>
            {renderElement(ListComponent, {
              handleListModalClose: handleModalClose,
            })}
          </Modal>
        )}
        <div className="layout-bg right-panel withdraw-rightpanel">
          {renderElement(ViewHeader)}
          {children}
        </div>
      </Row>
    </LayoutContext.Provider>
  );
};
const ViewHeader = ({
  showOverview = true,
  showActions = true,
  showAlert,
  alterMessage,
  alertProps = { type: "error", showIcon: true },
  screen,
  hasLogo = true,
  logo,
  logoType = "img",
  logoBg = "bg-nameCircle",
  customLogoClass = "w-10 h-10 rounded-full text-large font-semibold flex justify-center items-center text-textWhite verifytext",
  logoSize = ["40px", "40px"], //[width,height]
  title,
  hasMetaData = true,
  metaData,
  onAction,
  list,
  shouldUsePropsList = false,
  includeAdd = false,
  handleCloseAlert,
  headerCustomClass,
  hasStatusBadge = false,
  hasBgState=false,
  badgeColor={},
  itemFields={},
  data={},
  module=null,
}) => {
  const {status,activeField } = useMemo(() => {
    return itemFields || {};
  }, [itemFields]);
  return (
    <>
      {showOverview && (
        <div
          className={`flex flex-wrap items-center gap-2.5 !justify-start ${headerCustomClass}`}
        >
          {hasLogo && logoType === "img" && (
            <img
              src={logo || defaultImg}
              alt=""
              width={logoSize[0]}
              height={logoSize[1]}
              className={logo && "rounded-full w-10 h-10"}
            />
          )}
          {hasLogo && logoType === "custom" && (
            <div className={`${logoBg} ${customLogoClass}`}>{logo}</div>
          )}
          
          <div className="flex flex-col">
            <div className="flex gap-4 items-center">
            <h1 className="text-md text-titleColor font-semibold xl:max-w-72 md:max-w-64  text-ellipsis truncate notification-titile">{title}</h1>
            <div>
            { module === 'payees' && hasStatusBadge && (
              <span
                className={`physical-badge !px-4 !text-sm ${
                  hasBgState
                    ? activeField
                      ? badgeColor[data?.[activeField]]
                      : badgeColor[data?.[status] || data?.status]
                    : badgeColor?.[data?.[status] || data?.status]
                }`}
              >
                {module === 'payees' && data?.status?.toLowerCase() === "inactive" ? "Deactivated" : data?.[status] || data?.status || "--"}
              </span>
            )}
          </div>
          </div>
            {hasMetaData && (
              <p className="text-xs font-medium text-textGrey">{metaData}</p>
            )}
          </div>
          
          
        </div>
      )}
      {showActions && (
        <ScreenActions
          screen={screen}
          onClick={onAction}
          list={list}
          includeAdd={includeAdd}
          shouldUsePropsList={shouldUsePropsList}
        />
      )}
      {showAlert && (
        <div className="coin-container px-4">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert {...alertProps} description={alterMessage} />
            <span
              className="icon sm alert-close"
              onClick={handleCloseAlert}
            ></span>
          </div>
        </div>
      )}
    </>
  );
};
const ListHeader = ({ onAdd, showAdd = true,isTabAction=true,activeTab="" }) => {
  const { handleListModalClose } = useContext(LayoutContext);
  const handleAdd = () => {
    handleListModalClose?.();
    onAdd?.();
  }
  return (
    <div>
      <div className="flex justify-between items-center">
        {showAdd && (
          <ScreenActions
            onlyAdd={true}
            onClick={handleAdd}
            isTab={isTabAction}
            activeTab={activeTab}
            customButtons={{
              Add: (
                <button
                  type="normal"
                  className="secondary-outline"
                >
                  Add <span className="icon btn-add shrink-0 ml-2 "></span>
                </button>
              ),
            }}
          />
        )}{" "}
      </div>
    </div>
  );
};

const ListItem = ({
  data,
  itemFields,
  selectedRow,
  onItemSelect,
  hasLogo = true,
  customLogo,
  logoType = "img",
  logoSizes = ["30px", "30px"],
  hasStatusBadge = true,
  ItemDescription,
  children,
  badgeColor,
  hasBgState,
  module = null,
  metaClassName,
}) => {
  const { handleListModalClose } = useContext(LayoutContext);
  const { id, logo, title, status,activeField } = useMemo(() => {
    return itemFields || {};
  }, [itemFields]);
  const isSelected = data?.[id] === selectedRow?.[id];

  const onRowSelection = useCallback(() => {
    handleListModalClose?.();
    onItemSelect(data);
  }, [data, handleListModalClose]);
  return (
    <List.Item
      key={id}
      className={`coin-item coin-flexgrow db-coinlist ${
        isSelected ? "active" : ""
      }`}
      onClick={onRowSelection}
    >
      <List.Item.Meta
        className={metaClassName}
        avatar={
          <>
            {hasLogo && logoType === "img" && (
              <div>
                <img
                  src={data?.[logo] || defaultImg}
                  width={logoSizes[0]}
                  height={logoSizes[1]}
                  alt={data?.[title]}
                />
              </div>
            )}
            {hasLogo && logoType === "custom" && <>{customLogo}</>}
            {!hasLogo && (
              <div className="custom-hover bg-nameCircle w-8 h-8 rounded-full text-base font-semibold flex justify-center items-center text-lightDark verifytext">
                {data?.[title]?.[0]?.toUpperCase() || "--"}
              </div>
            )}
          </>
        }
        title={
          <div className="md:flex justify-between items-center title-listtext">
            <p className="text-xs font-medium text-subTextColor min-h-4 uppercase w-48 text-ellipsis overflow-hidden">
              {data?.[title] || "--"}
            </p>
            <div className="text-xs font-medium text-summaryLabelGrey subtitle-listtext">
              {children}
            </div>
          </div>
        }
        description={
          <div className="flex justify-between items-center gap-2">
            {ItemDescription && (
              <div className="text-xs font-medium text-summaryLabelGrey summarytext">
                {ItemDescription}
              </div>
            )}
            {hasStatusBadge && (
              <span
                className={`physical-badge ${
                  hasBgState
                    ? activeField
                      ? badgeColor[data?.[activeField]]
                      : badgeColor[data?.[status] || data?.status]
                    : badgeColor?.[data?.[status] || data?.status]
                }`}
              >
                {module === 'payees' && data?.status?.toLowerCase() === "inactive" ? "Deactivated" : data?.[status] || data?.status || "--"}
              </span>
            )}
          </div>
        }
      />
    </List.Item>
  );
};
const ListComponent = ({
  alterMessage,
  showAlert,
  setShowAlert,
  alertProps = { type: "error", showIcon: true },
  showSearch = true,
  searchValue = "",
  onSearch,
  onSearchInput,
  showSearchButton = true,
  searchPlaceholer = "",
  searchParams = {
    className: "coin-search-input",
    size: "middle",
    placeholder: `Search ${searchPlaceholer}`,
  },
  ItemComponent,
  pageSize = 10,
  list,
  fetchNext,
  currentPage,
  defaultPage = 1,
  itemKey = "id",
  loading,
  LoaderComponent = ListLoader,
  NoMoreData,
}) => {
  const { handleListModalClose } = useContext(LayoutContext);
  const hasMoreData = useMemo(() => {
    return list?.length === currentPage * pageSize;
  }, [list?.length, currentPage, pageSize]);

  const handleCloseAlert = useCallback(() => {
    setShowAlert("");
  }, []);
  const handleSearch = useCallback((e) => {
    onSearchInput(e.target.value);
  }, []);
  return (
    <div className="coin-container">
      {showAlert && (
        <div className="px-2">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              {...alertProps}
              description={alterMessage}
              closable={true}
              afterClose={handleCloseAlert}
            />
          </div>
        </div>
      )}
      <div className="mt-1 mb-6">
        {showSearch && (
          <AppSearch
            {...searchParams}
            value={searchValue}
            onChange={handleSearch}
            onSearch={onSearch}
            suffix={
              showSearchButton ? (
                <AppSearch.SearchButton
                  onSearch={onSearch}
                  searchParams={[searchValue]}
                />
              ) : null
            }
          />
        )}
      </div>
      <List>
        <AppInfiniteScroll
          data={list}
          containerHeight={600}
          page={currentPage}
          ItemComponent={renderElement(ItemComponent)}
          Loader={LoaderComponent}
          loading={loading}
          pageSize={pageSize}
          loadMore={fetchNext}
          hasMore={hasMoreData}
          defaultPage={defaultPage}
          itemKey={itemKey}
          NoMoreData={NoMoreData}
          handleListModalClose={handleListModalClose}
        />
      </List>
    </div>
  );
};
ListDetailLayout.ListHeader = React.memo(ListHeader);
ListDetailLayout.ViewHeader = React.memo(ViewHeader);
ListDetailLayout.ListItem = React.memo(ListItem);
ListDetailLayout.List = React.memo(ListComponent);
export default ListDetailLayout;
