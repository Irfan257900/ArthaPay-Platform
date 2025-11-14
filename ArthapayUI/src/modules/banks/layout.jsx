import ListDetailLayout from "../../core/module.layouts/listdetail.layout";
import ViewHeader from "./view.header";
import CoinListLoader from "../../core/skeleton/coinList.loader";
import ContentLoader from "../../core/skeleton/common.page.loader/content.loader";
const BanksLayout = () => {
  return (
    <ListDetailLayout
      breadCrumbList={[]}
      showBreadcrumb={false}
      hasOverview={false}
      hasPageHeader={false}
      ListHeader={null}
      ListComponent={<CoinListLoader />}
      ViewHeader={<ViewHeader />}
    >
      <ContentLoader />
    </ListDetailLayout>
  );
};
export default BanksLayout;
