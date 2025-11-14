import { useEffect } from "react"
import { processSilentRenew } from "redux-oidc";
import PlainLoader from "../shared/loaders/plain.loader";
const SilentSignIn = () => {
    useEffect(() => {
        processSilentRenew();
    }, []);//eslint-disable-line react-hooks/exhaustive-deps
    return <PlainLoader/>;
}

export default SilentSignIn;