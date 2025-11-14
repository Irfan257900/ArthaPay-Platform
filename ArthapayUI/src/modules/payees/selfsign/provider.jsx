import { Suspense,lazy,memo } from "react";
import PlainLoader from "../../../core/shared/loaders/plain.loader";
const Wagmi = lazy(() => import("./wagmi"));
const TronWallets = lazy(() => import("./tronWallets"));
import { selfSignAssets } from "./utils/assets";
const { wagmi, tron } = selfSignAssets;
const Provider = memo(({ asset,children }) => {
  if (wagmi.includes(asset)) {
    return (
      <Suspense fallback={<PlainLoader />}>
        <Wagmi>
          {children}
        </Wagmi>
      </Suspense>
    );
  }
  if (tron.includes(asset)) {
    return (
      <Suspense fallback={<PlainLoader />}>
        <TronWallets>
          {children}
        </TronWallets>
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PlainLoader />}>
      {children}
    </Suspense>
  );
});

export default Provider;
