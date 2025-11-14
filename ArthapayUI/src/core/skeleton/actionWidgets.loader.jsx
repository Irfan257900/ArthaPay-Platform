import { Skeleton } from "antd";

export default function ActionWidgetLoader() {
  return (
    <div className="mt-8 md:w-[465px] w-full m-auto p-2">
      <div>
        <Skeleton.Input
          active
          style={{ height: 80 }}
          className="!w-full mb-1"
        />
      </div>
      <div className="flex justify-end mb-5">
        <Skeleton.Input active style={{ height: 20 }} className="" />
      </div>
      <div className="flex justify-center items-center space-x-5 mb-5">
        <Skeleton.Avatar active className="!w-10 !h-10 child-wfull" />
      </div>
      <Skeleton.Input active style={{ height: 80 }} className="!w-full mb-2" />
      <div className="mb-3 flex justify-between">
        <Skeleton.Input
          active
          style={{ height: 25 }}
          className="mb-0.5 !w-full"
        />
      </div>
      <Skeleton.Input active style={{ height: 45 }} className="!w-full mt-3" />
    </div>
  );
}
