import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Carousel } from "antd";
import { useLocation, useNavigate} from "react-router";
import PageHeader from "../core/shared/page.header";
import CarouselLoader from "../core/skeleton/carousel.loader";

const Cases =({
  showBreadCrumb=true,
  navigation=true,
  onClickHandler,
})=>{
  const {pathname}=useLocation();
  const navigate=useNavigate();
  const pageName = pathname?.split('/')[2];
  const basePath = pathname?.split('/')[1];
   const casesInfo = useSelector((store) => store.userConfig.userCasesInfo);
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: basePath?.charAt(0).toUpperCase() + basePath?.slice(1) ,handleClick:()=>navigateToDashboard()},
      { id: "2", title: pageName?.charAt(0).toUpperCase() + pageName?.slice(1) },
    ];
    return defaultList;
  }, [pageName]);
  const navigateToDashboard = () => {
    navigate(`/${basePath}`);
}
    const handleNavigateToProfile = (item)=>{
      const id = item?.typeId;
      if(navigation){
        navigate(`/support/${id}`);
      }else{
        onClickHandler(item);
      }
    };
    
   return(<>
   {showBreadCrumb && <PageHeader breadcrumbList={breadCrumbList} />}
   {casesInfo?.loader && <CarouselLoader />}
   {!casesInfo?.loader && casesInfo?.data?.length > 0 &&
        <Carousel autoplay className="cases-slider mb-4" >
          {casesInfo?.data?.map((item) => (
            <div key={item?.id} className='!flex justify-between items-center bg-tableheaderBlack border-StrokeColor border rounded-5 md:p-6 p-3 mb-4'>
             <div className="flex items-center space-x-3">
              <div><span className="icon lg close cursor-pointer"></span></div>
             <div>
                <h2 className="carousal-title text-lg  font-semibold mb-0">{item.title}</h2>
                <p className="carousal-content font-medium">{item.message}</p>
             </div>
             </div>
              <button onClick={()=>handleNavigateToProfile(item)} className="text-primaryColor cursor-pointer">View details</button>
            </div>
          ))}
        </Carousel>
      }
   </>)
}
export default Cases