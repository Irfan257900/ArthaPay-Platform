import graph from "../../assets/images/portfoliograph.png";
export default function BanksPortfolio() {

    return <div className='mt-7'>
        <h1 className='text-2xl text-titleColor font-semibold mb-2'>Portfolio</h1>
        <div className="mb-7 p-3.5 border border-dbkpiStroke rounded-5">
            <div className="md:flex justify-end space-y-2 md:space-y-0">
                <div className="flex items-center md:space-x-10 space-x-4 mb-4 md:mb-0">
                    <span className="text-sm text-labelGrey cursor-pointer">1H</span>
                    <span className="text-sm w-7 h-7 rounded-md bg-primaryColor text-lightDark flex justify-center items-center cursor-pointer">1D</span>
                    <span className="text-sm text-labelGrey cursor-pointer">1W</span>
                    <span className="text-sm text-labelGrey cursor-pointer">1M</span>
                    <span className="text-sm text-labelGrey cursor-pointer">1Y</span>
                    <span className="text-sm text-labelGrey cursor-pointer">All</span>
                    <span className="w-[1px] h-7 bg-rightincardBr cursor-pointer"></span>
                    <div className="space-x-4">
                        <span className="icon star-icon cursor-pointer"></span>
                        <span className="icon notification-small cursor-pointer"></span>
                    </div>
                </div>
            </div>
            <div className="py-4">
                <img src={graph} alt="" className="w-full" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <span className="md:text-sm text-[10px] text-labelGrey">12:30PM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">03:12PM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">04:30PM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">08:15PM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">10:15PM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">02:30AM</span>
                <span className="md:text-sm text-[10px] text-labelGrey">03:30AM</span>
            </div>

        </div>
    </div>
}