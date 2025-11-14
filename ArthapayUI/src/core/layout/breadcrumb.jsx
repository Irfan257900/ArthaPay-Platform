import React from "react";
import { Breadcrumb as BreadCrumb } from "antd";
import AppText from "../shared/appText";
const BreadcrumbSeperator = React.memo(() => {
  return <span className="icon sm bc-arrow" />;
});
function itemRender(currentRoute) {
  const { title, handleClick, id } = currentRoute;
  return (
    <AppText
      className={`!text-breadcrum text-lg font-semibold ${
        handleClick ? "cursor-pointer cust-hover" : ""
      }`}
      key={id}
      onClick={handleClick}
    >
      {title}
    </AppText>
  );
}
const Breadcrumb = ({ breadCrumbList }) => (
  <BreadCrumb
    separator={<BreadcrumbSeperator />}
    items={breadCrumbList}
    itemRender={itemRender}
    className="cust-breadcrumb"
  />
);

export default Breadcrumb;
