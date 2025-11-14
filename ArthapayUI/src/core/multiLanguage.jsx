import React, { useCallback } from "react";
import { Popover, Space, Radio } from "antd";
import { useTranslation } from "react-i18next";
function Language() {
  const { i18n } = useTranslation()
  const changeLanguage = useCallback((e) => { i18n.changeLanguage(e.target.value); }, []);

  const popoverContent = useCallback(() => (
    <div className="p-2">
      <Radio.Group
        className="new-custom-radiobtn newcustome-radiocheck block"
        defaultValue={i18n.language}
      >
        <ul className="space-y-4">
          <li onClick={changeLanguage}><Radio value="en" className="text-base font-medium text-lightWhite">English</Radio></li>
          <li onClick={changeLanguage}><Radio value="ar" className="text-base font-medium text-lightWhite">Arab</Radio></li>
          <li onClick={changeLanguage}><Radio value="ma" className="text-base font-medium text-lightWhite">Malay</Radio></li>
          <li onClick={changeLanguage}><Radio value="ch" className="text-base font-medium text-lightWhite">Chinese</Radio></li>
        </ul>
      </Radio.Group>
    </div>
  ), [i18n.language, changeLanguage]);

  return (
    <div className="">
      <Popover
        content={popoverContent}
        trigger={["click"]}
        destroyTooltipOnHide={true}
        placement="bottomLeft"
        overlayClassName="bg-sectionBG border p-0 border-borderLightGreen rounded-xl header-notifications header-language !top-[58px] !right-[30px]"
        className="bg-transparent !rounded-xl"
      >
        <button>
          <Space>
            <div className="relative bg-sectionBG border px-6 py-0.5 rounded-3xl border-StrokeColor">
              {/* <span className="icon notification-large cursor-pointer"></span>{" "} */}
              <span className="text-lg text-primaryColor">{i18n.language?.toUpperCase()}</span>
            </div>
          </Space>
        </button>
      </Popover>
    </div>
  );
}

export default Language;
