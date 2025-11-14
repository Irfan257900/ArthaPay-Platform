import React, { useEffect, useState, useCallback } from "react";
import { Select, Tooltip } from "antd";
import CommonDrawer from "../../../../core/shared/drawer";
import CustomButton from "../../../../core/button/button";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import ManageAddress from "../../../../core/profile/address.manage";
import AppDefaults from "../../../../utils/app.config";
import { addressLookups } from "../../reducers/payout.reducer";

const { Option } = Select;

const AddressSelection = ({ form, Form, isError, selectedAddressData }) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userConfig = useSelector((store) => store.userConfig.details);
  const addressLookupState = useSelector(
    (store) => store?.payoutReducer?.addressLookupData
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addressLookups());
  }, [dispatch]);

  useEffect(() => {
    const addressData = addressLookupState?.data;
    if (Array.isArray(addressData) && addressData.length > 0) {
      const firstAddress = addressData[0];
      form.setFieldsValue({ addressIds: firstAddress.id }); 
      selectedAddressData(firstAddress.id);
    }
  }, [addressLookupState, form, selectedAddressData]);

  const handleAddAddress = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const onDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    dispatch(addressLookups());
  }, [dispatch]);

  const handleAddressChange = useCallback(
    (value) => {
      selectedAddressData(value);
    },
    [selectedAddressData]
  );

  return (
    <div>
      <div className="flex gap-3 items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-semibold text-titleColor">
            Address Information
          </h3>
          {userConfig?.accountType === "Business" && (
            <Tooltip title="Please select at least one address">
              <span className="icon bank-info"></span>
            </Tooltip>
          )}
        </div>

        <CustomButton
          type="normal"
          onClick={handleAddAddress}
          className="secondary-outline h-full flex gap-2 items-center"
        >
          Add <span className="icon btn-add shrink-0 ml-2 "></span>
        </CustomButton>
      </div>

      <div className="grid md:grid-cols-2">
        <Form.Item
          label={t("cards.applyCards.Select_Address")}
          name="addressIds"
          rules={[{ required: true, message: t("cards.Is_required") }]}
          className="custom-select-float mb-0"
          colon={false}
        >
          <Select
            showSearch
            className="paymentsAddress"
            placeholder={t("cards.applyCards.Select_Address")}
            onChange={handleAddressChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {addressLookupState?.data?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.favoriteName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <CommonDrawer
        isOpen={isDrawerOpen}
        title="Add Address"
        onClose={onDrawerClose}
      >
        <ManageAddress
          isDrawer={isDrawerOpen}
          showHeader={false}
          onSuccess={onDrawerClose}
          onCancel={onDrawerClose}
          formMode="Add"
          addressId={AppDefaults.GUID_ID}
        />
      </CommonDrawer>
    </div>
  );
};

export default AddressSelection;
