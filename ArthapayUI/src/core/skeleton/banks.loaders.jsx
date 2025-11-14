import { Skeleton } from "antd";

export const AccountSelectionLoader = () => {
  return (
    <div className="mt-5">
      <Skeleton.Input active style={{ height: 32 }} className="!mb-2 !w-full" />
      <Skeleton.Input active style={{ height: 32 }} className="!mb-4 !w-full" />
      <Skeleton.Input active style={{ height: 38 }} className="!mb-2 !w-full" />
      <Skeleton.Input active style={{ height: 38 }} className="!w-full" />
    </div>
  );
};

export const WalletSelectionTabsLoader = () => {
  return (
    <div className="flex justify-center">
      <Skeleton.Input active style={{ height: 50 }} className="" />
      <Skeleton.Input active style={{ height: 50 }} className="" />
    </div>
  );
};
