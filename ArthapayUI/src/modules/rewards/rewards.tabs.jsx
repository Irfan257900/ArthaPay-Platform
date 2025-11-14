import { useCallback } from "react";
import { useLocation, useNavigate, Outlet } from "react-router";
import goldImg from "../../assets/images/goldimg.svg";
import silverImg from "../../assets/images/membershipefreeimg.svg";
import bronzeImg from "../../assets/images/bronzeimag.svg";
import platinumImg from "../../assets/images/membership platinumimg.svg";
import { connect, useSelector } from "react-redux";
import { NumericFormat } from "react-number-format";

const TABS = [
  { key: "", label: "Home", icon: "icon home-icon", to: "" },
  { key: "quests", label: "Quests", icon: "quests-icon", to: "quests/available" },
  { key: "mysteryboxes", label: "Mystery Boxes", icon: "mystrey-icon", to: "mysteryboxes" },
];

const RewardsTabs = (user) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[2] || "";
  const handleTabClick = useCallback((tab) => {
    navigate(tab.to);
  }, [navigate]);
  const { data } = useSelector((state) => state.rewards.dashboard);
  const xp = data?.experiencePoints ?? 0;
  const tier = data?.tierInfo?.name ?? "Bronze";
  const rewardMultiplier = data?.tierInfo?.rewardMultiplier ?? 1;
  const nextTierXp = data?.tierInfo?.nextTierXp ?? 0;
  const nextTierGo = nextTierXp - xp;

  const progressPercent = nextTierXp > 0 ? (xp / nextTierXp) * 100 : 0;

  const tierImage = {
    bronze: bronzeImg,
    silver: silverImg,
    gold: goldImg,
    platinum: platinumImg,
  };
  const tierClass = {
    bronze: 'text-browncolor',
    silver: 'text-membershiplightsilver',
    gold: 'text-membershipgoldtext',
    platinum: 'text-membershiplightsilver',
  };
  const tierBorderClass = {
    bronze: 'border-4 border-browncolor bg-browncolor',
    silver: 'border-4 border-membershipbordersilver bg-membershipbordersilver',
    gold: 'border-4 border-membershipgoldtext bg-membershipgoldtext',
    platinum: 'border-4 border-membershipplatinumtext bg-membershipplatinumtext',
  };

  return (
    <div>
      <div className="dashboard-banner kpicardbg relative z-10 flex justify-between rounded-lg overflow-hidden px-6 py-2 mb-4">
        <div className="flex justify-center gap-10 items-center">
          <div>
            <h1 className="xl:text-4xl md:text-2xl lg:text-3xl text-xl font-bold text-lightWhite mb-3">
              Welcome Back , <span className="text-primaryColor font-medium text-3xl">{user?.user?.name}</span>
            </h1>
            <p className="text-paraColor text-lg font-medium">
              Unlock achievements, track your progress, and claim <br /> exclusive rewards.
            </p>
          </div>
        </div>
        <div className="">
          <div className="items-center gap-4 !pb-4 pr-4">
            <div className="items-center">
              <div className="relative mt-2 items-center">
                <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center bg-StrokeColor ${tierBorderClass[tier.toLowerCase()] || 'border-membershipgoldtext'}`}>
                  <img src={tierImage[tier.toLowerCase()] || goldImg} alt="" className="w-16 h-16 rounded-full" />
                </div>
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-textBlack !border-none text-[8px] px-2 py-0.5 rounded-full font-semibold ${tierBorderClass[tier.toLowerCase()] || 'bg-membershipgoldtext'}`}>
                  {tier}
                </span>
              </div>
              <div className="gap-5 justify-between items-center text-center">
                <h3 className={`text-xl font-semibold items-center text-center ${tierClass[tier.toLowerCase()] || 'text-membershipgoldtext'}`}>
                  {tier}
                </h3>
                <div className="items-center">
                  <h3 className="text-sm font-medium text-paraColor">
                    {<NumericFormat
                      value={`${(nextTierGo)}`}
                      thousandSeparator={true} displayType={"text"} />}{" "}
                    TP to next tier
                  </h3>
                  <div className="text-subTextColor">
                    <span className="text-sm font-medium">Multiplier:</span> x {rewardMultiplier}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full mt-2">
              <div className="text-sm text-paraColor mb-2 text-center">
                Next Tier TP Requirement :{" "}
                {<NumericFormat
                      value={`${(nextTierXp)}`}
                      thousandSeparator={true} displayType={"text"} />}
              </div>
              <div className="w-full h-2.5 rounded bg-tabsBg border border-StrokeColor">
                <div
                  className={`h-2.5 rounded !border-none ${tierBorderClass[tier.toLowerCase()] || 'bg-membershipgoldtext'}`}
                  style={{
                    width: `${progressPercent}%`
                  }}
                />
              </div>
              <div>
                <button
                  className="w-full rounded-5 px-4 py-2 items-center text-primaryColor text-base !border-none"
                  onClick={() => navigate("/profile/yourrewards")}
                >
                  Know Your Rewards <span className="icon btn-arrow shrink-0 ml-2"></span>
                </button>
              </div>
            </div>

            <div className="dark:text-textSubmit text-yellow-600 p-2 text-sm">
              🔄 Your tier will reset on 1st of every month.
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-12 border-b border-StrokeColor mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`py-2 px-1 text-center items-center text-base ${
              (currentTab === tab.key || (tab.key === "" && currentTab === ""))
                ? "border-b-2 border-primaryColor text-base font-medium text-primaryColor active"
                : "text-rewardsTabsText font-medium"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            <span className={`mr-1 icon ${tab.icon}`}></span>
            {tab.label}
          </button>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
  };
};
export default connect(connectStateToProps)(RewardsTabs);
