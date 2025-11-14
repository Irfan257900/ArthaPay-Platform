import React from "react";
import { Skeleton, Card, Avatar } from "antd";
const ListLoader = () => {

  return (
    <div>
      
          <Card className="bg-cardbackground border-StrokeColor w-full !p-1 list-loader">
            <div className="flex  justify-between title-left">
              <Skeleton active title={{ width: "60%" }} style={{ width: "100%" }} paragraph={{ rows: 0 }} />
              <Skeleton.Avatar active />
            </div>
            <div className="input-skel">
              <Skeleton.Input active style={{ width: "100%", height:"45px" }} />
            </div>
            <div className="mt-4">
              {[...Array(8)].map((_, index) => (
                <Card
                  key={index}
                  className="my-3 border border-coinBr bg-coinListBg rounded-sm !py-0 list-loader"
                >
                  <Skeleton
                    active
                    title={false}
                    paragraph={{ rows: 2, width: "80%" }}
                  />
                </Card>
              ))}
            </div>
          </Card>
        
    </div>
  );
}

export default ListLoader;
