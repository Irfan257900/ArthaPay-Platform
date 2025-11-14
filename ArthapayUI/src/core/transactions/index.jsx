import React, { useMemo } from "react";
import TransactionsGrid from "./grid";
import PageHeader from "../shared/page.header";
import { useTranslation } from "react-i18next";
import Kpis from "./kpis";
const Transactions = () => {
  const { t } = useTranslation();
  const breadcrumbList = useMemo(()=>[{ id: "1", title: t("transactions.Transactions") }],[]);

  return (
    <div>
      <PageHeader breadcrumbList={breadcrumbList} />
      <Kpis />
      <TransactionsGrid />
    </div>
  );
};

export default Transactions;
