import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import AppDefaults from "../../utils/app.config";
import {
  fetchAddresses,
  resetState,
  setErrorMessages,
  setSelectedAddress,
} from "../../reducers/profile.reducer";
import AppAlert from "../shared/appAlert";
import AppPagination from "../shared/appPagination";
import CommonDrawer from "../shared/drawer";
import ManageAddress from "./address.manage";
import CustomButton from "../button/button";
import { useTranslation } from "react-i18next";
import AppTooltip from "../shared/appTooltip";
import addressImg from "../../assets/images/address-img.svg";
import addressimglight from "../../assets/images/address-img-light.svg";
import AddressLoader from "../skeleton/address.loaders";
import { Tooltip } from "antd";

const DrawerTitle = ({ selectedAddress }) => {
  const { t: translator } = useTranslation();
  return (
    <>
      {selectedAddress?.id !== AppDefaults.GUID_ID &&
        translator("profile.addresses.titles.edit")}
      {selectedAddress?.id === AppDefaults.GUID_ID &&
        translator("profile.addresses.titles.add")}
    </>
  );
};

export const AddNewAddress = ({ handleAction }) => {
  const { t: translator } = useTranslation();
  return (
    <div className="py-6 px-3.5 bg-cardbackground rounded-5 group mb-4">
      <div className="text-center">
        <img
          src={addressImg}
          alt="addressimage"
          className="dark:block hidden m-auto mb-5"
        />
        <img
          src={addressimglight}
          alt="addressimglight"
          className="dark:hidden block m-auto mb-5"
        />
        <CustomButton
          type="primary"
          onClick={handleAction}
          onClickParams={[{ id: AppDefaults.GUID_ID }]}
        >
          {translator("profile.addresses.titles.add")}
        </CustomButton>
      </div>
    </div>
  );
};

const Addresses = () => {
  const { t: translator } = useTranslation();
  const dispatch = useDispatch();
  const { loading, data, total, page, pageSize, error, selectedAddress } =
    useSelector((store) => store.profileStore.addresses);
  useEffect(() => {
    dispatch(fetchAddresses({ page }));
    return () => {
      dispatch(resetState(["addresses"]));
    };
  }, []);

  const onPageChange = useCallback((pageToSet) => {
    dispatch(fetchAddresses({ page: pageToSet }));
  }, []);
  const handleAction = useCallback(
    (e, address) => {
      e?.preventDefault?.();
      dispatch(setSelectedAddress(address));
      error && dispatch(setErrorMessages([{ key: "addresses", message: "" }]));
    },
    [error]
  );
  const closeErrorMessage = useCallback(() => {
    dispatch(setErrorMessages([{ key: "addresses", message: "" }]));
  }, []);
  const onDrawerClose = useCallback(() => {
    dispatch(setSelectedAddress(null));
  }, []);

  const onDrawerSuccess = useCallback(() => {
    dispatch(fetchAddresses({ page: 1 }));
    dispatch(setSelectedAddress(null));
  }, []);


  return (
    <>
      <div className="flex items-center justify-between md:mt-7 mt-4 mb-1 md:mb-2.5">
        <h1 className="text-2xl text-titleColor font-semibold">
          {translator("profile.addresses.titles.list")}
        </h1>
        {!loading && data?.length > 0 && <AppTooltip title={translator("profile.addresses.titles.add")}>
          <CustomButton
            type="normal"
            onClick={handleAction}
            className="secondary-outline h-full flex gap-2 items-center"
            onClickParams={[{ id: AppDefaults.GUID_ID }]}
          >Add <span className="icon btn-add shrink-0 ml-2 "></span></CustomButton>
        </AppTooltip>}
      </div>
      {error && (
        <div className="alert-flex mb-24">
          <AppAlert
            type="error"
            description={error}
            onClose={closeErrorMessage}
            showIcon
            closable={true}
          />
        </div>
      )}
      {loading && <AddressLoader />}
      {!loading &&
        data?.map((address) => {
          return (
            <div
              key={address.favouriteName}
              className="py-4 px-3.5 kpicardbg rounded-5 group mb-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-1">
                  <h2 className="text-sm text-subTextColor capitalize">
                    <span className="text-subTextColor text-base font-semibold"> {address?.addressType || ""}</span>{" - "}
                    <span className="text-sm font-medium text-subTextColor capitalize"> {address?.favoriteName || ""}{" "}</span>
                  </h2>
                  <div>
                     {address?.isDefault && (
                      <span className="border border-defaultBadge text-defaultBadge text-xs font-medium rounded-3xl px-4 py-1 ml-2.5">
                        {translator("profile.addresses.texts.defaultAddress")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 items-center justify-end ">
                  <Tooltip
                    title="Edit Address"
                  >
                    <span>
                      <CustomButton
                        type="normal"
                        onClick={handleAction}
                        onClickParams={[address]}
                        className=""
                      >
                        <span className="icon Edit-links cursor-pointer"></span>
                      </CustomButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
              <p className="text-sm text-paraColor font-normal w-full break-words whitespace-pre-line mt-1">
                {address?.addressLine1 && `${address?.addressLine1}, `}
                {address?.addressLine2 && `${address?.addressLine2}, `}
                {address?.city && `${address?.city}, `}
                {address?.state && `${address?.state}, `}
                {address?.town && `${address?.town}, `}
                {address?.country && `${address?.country} `}
                {address?.postalCode}
              </p>
            </div>
          );
        })}
      {!loading && !data?.length && (
        <AddNewAddress handleAction={handleAction} />
      )}
      {!loading && (
        <div className="mt-5 text-center appPagination">
          <AppPagination
            currentPage={page}
            pageSize={pageSize}
            onChange={onPageChange}
            total={total}
          />
        </div>
      )}
      <CommonDrawer
        isOpen={selectedAddress !== null}
        title={<DrawerTitle selectedAddress={selectedAddress} />}
        onClose={onDrawerClose}
      >
        <ManageAddress
          isDrawer={true}
          addressId={selectedAddress?.id}
          address={selectedAddress}
          formMode={
            selectedAddress?.id !== AppDefaults.GUID_ID ? "Edit" : "Add"
          }
          showHeader={false}
          onSuccess={onDrawerSuccess}
          onCancel={onDrawerClose}
        />
      </CommonDrawer>
    </>
  );
};

export default Addresses;
