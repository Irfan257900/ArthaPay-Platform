import { Suspense } from "react";
import PlainLoader from "./loaders/plain.loader";

const withSuspense = (Component,extraProps={},Loader=<PlainLoader/>) => (
  <Suspense fallback={Loader}>
    <Component {...extraProps}/>
  </Suspense>
);
export default withSuspense;
