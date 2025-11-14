import React from "react";

function MarketSecurity() {
  return (
    <div className="">
      <div className="p-3.5 border border-dbkpiStroke rounded-5">
      <div className="flex items-center space-x-2 mb-2 border-b border-StrokeColor pb-4">
        <div className="w-10 h-10 rounded-full bg-primaryColor flex items-center justify-center text-lightDark">@</div>
        <div className="items-center">
          <span className="text-xl text-dbkpiText font-semibold">Security Score :</span>
          <span className="text-xl text-dbkpiText font-semibold ms-2">0%</span>
          <p className="text-labelGrey text-base font-medium">Date reviewed by Cer.live: 30 Sep 2024</p>
        </div>       
      </div>
      <div className="space-y-2">
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey text-base">Platform Audit Coverage</span>
            <span className="font-semibold text-dbkpiText text-base">N/A</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey text-base">Insurance Score</span>
            <span className="font-semibold text-dbkpiText text-base">0%</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey text-base">Bug Bounty Score</span>
            <span className="font-semibold text-dbkpiText text-base">0%</span>
          </div>
          <div>
          <h4 class="text-lg text-titleColor font-semibold items-center hover:text-primaryColor hover:underline"><span className="">Security Details</span> <a href="#" data-discover="true"><span class="icon lg square-arrow cursor-pointer"></span> </a></h4>
          </div>
      </div>
      </div>
      <div className="mt-3">
        <p className="text-labelGrey text-base font-normal">Project security related data (eg. audit reports, ratings) are sourced from third-party providers and are not endorsed by CoinGecko. Exposure to smart contract and market risks may still be present regardless - kindly DYOR and exercise caution!</p>
      </div>
    </div>
  );
}

export default MarketSecurity;
