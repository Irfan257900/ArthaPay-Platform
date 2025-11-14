import { BankChargesLoader, CardChargesLoader, CommonLoader, ExchangChargesLoader } from "../../skeleton/fees.loaders";
import CommonFeesTable from "./fees.common.view";

const feesAccordionConfig = {
  Wallets: {
    key: "Wallets",
    label: "Wallet charges",
    Component: CommonFeesTable,
    Loader: CommonLoader
  },
  Exchange: {
    key: "Exchange",
    label: "Exchange charges",
    Component: CommonFeesTable,
    Loader:ExchangChargesLoader
  },
  Banks: {
    key: "Banks",
    label: "Bank charges",
    Component: CommonFeesTable,
    Loader: BankChargesLoader
  },
  Cards: {
    key: "Cards",
    label: "Card charges",
    Component: CommonFeesTable,
    Loader: CardChargesLoader

  },
  Payments: {
    key: "Payments",
    label: "Payment charges",
    Component: CommonFeesTable,
    Loader: CommonLoader
  },
};

export default feesAccordionConfig;
