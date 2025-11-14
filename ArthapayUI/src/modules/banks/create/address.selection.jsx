import React, { useEffect, useState, useCallback } from "react";
import { Select, Tooltip } from "antd";
import CommonDrawer from "../../../core/shared/drawer";
import CustomButton from "../../../core/button/button";
import { getAddressLU } from "../http.services";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ManageAddress from "../../../core/profile/address.manage";
import AppDefaults from "../../../utils/app.config";

const { Option } = Select;

const AddressSelection = ({ form, Form, isError, selectedAddressData }) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userConfig = useSelector((store) => store.userConfig.details);
  const [addressLookup, setAddressLookup] = useState([]);

  useEffect(() => {
    fetchAddressLU();
  }, []);

  const setFetchAddressLU = (response) => {
    if (response) {
      setAddressLookup(response);
    } else {
      isError(response);
    }
  };

  const fetchAddressLU = async () => {
    await getAddressLU(setFetchAddressLU, isError);
  };

  const handleAddAddress = useCallback(() => {
    setIsDrawerOpen(true);
  }, [ setIsDrawerOpen ]);

  const onDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    fetchAddressLU();
  } ,[ fetchAddressLU ]);

  const handleAddressChange = useCallback(
    (values) => {
      const selected = addressLookup.filter((a) => values.includes(a.id));
      selectedAddressData(selected);
      form.setFieldsValue({ addressIds: values });
    },
    [addressLookup, selectedAddressData]
  );

  return (
    <div className="">
      <div className="flex gap-3 items-center mb-2">
        <div className="flex items-center gap-2">
        <h3 className="text-2xl font-semibold text-titleColor mt-4">
          Address Information <span className="text-textLightRed ml-0.5"></span>
        </h3>
        {userConfig?.accountType === "Business" &&  <Tooltip title="Please select a minimum of 2 addresses: Trading Address and Registered Address are mandatory.">
                    <span className='icon bank-info'></span>
             </Tooltip>}
          </div>
        <CustomButton
          type="normal"
          onClick={handleAddAddress}
          className="secondary-outline h-full flex gap-2 items-center"
        >
          {t("Add")} <span className="icon btn-add shrink-0 ml-2 "></span>
        </CustomButton>
      </div>

      <div className="grid md:grid-cols-1">
        <Form.Item
          label={t("cards.applyCards.Select_Address")}
          name="addressIds"
          rules={[{ required: true, message: t("cards.Is_required") }]}
          className="custom-select-float mb-0"
          colon={false}
        >
          <Select
            mode="multiple" // Enable multi-select mode
            showSearch
            className="bankaddress"
            placeholder={t("cards.applyCards.Select_Address")}
            onChange={handleAddressChange}
            value={form.getFieldValue('addressIds')}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {addressLookup?.map((item) => (
              <Option key={item?.id} value={item?.id}>
                {item?.favoriteName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <CommonDrawer
        isOpen={isDrawerOpen}
        title={"Add Address"}
        onClose={onDrawerClose}
      >
       <ManageAddress
          isDrawer={isDrawerOpen}
          showHeader={false}
          onSuccess={onDrawerClose}
          onCancel={onDrawerClose}
          formMode={"Add"}
          addressId={AppDefaults.GUID_ID}
        />
      </CommonDrawer>
    </div>
  );
};

export default AddressSelection;