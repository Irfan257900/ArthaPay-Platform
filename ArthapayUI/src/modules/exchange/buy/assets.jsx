import { useCallback, useEffect, memo, useState } from "react";
import {
  clearCryptoCoinsError,
  fetchCryptoCoins,
  setSelectedCryptoCoin,
} from "./store.reducer";
import { useNavigate, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import ListLoader from "../../../core/skeleton/common.page.loader/list.loader";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import { textStatusColors } from "../../../utils/statusColors";
import AppText from "../../../core/shared/appText";
const basePath = `/exchange/buy`;
const Asset = ({ data, handleListModalClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedCoin = useSelector(
    (state) => state.buyState.selectedCryptoCoin
  );
  const onCoinSelect = useCallback(
    (item) => {
      dispatch(setSelectedCryptoCoin(item));
      handleListModalClose?.();
      navigate(`${basePath}/${item?.code}`);
    },
    [handleListModalClose]
  );
  return (
    <ListDetailLayout.ListItem
      data={data}
      itemFields={{
        id: "id",
        title: "code",
        logo: "image",
        status: "status",
      }}
      hasStatusBadge={false}
      handleListModalClose={handleListModalClose}
      selectedRow={selectedCoin}
      onItemSelect={onCoinSelect}
      ItemDescription={null}
    >
      <div className="text-right">
        <NumericText
          value={data?.amount || 0}
          decimalScale={AppDefaults.cryptoDecimals}
          thousandSeparator
          className="block"
          displayType="text"
        />
        <AppText
          className={`coin-price ${data?.changeIn24Hours < 0
              ? textStatusColors.negative
              : textStatusColors.positive
            }`}
        >
          {/* <NumericText
            value={data?.changeIn24Hours}
            decimalScale={AppDefaults.percentageDecimals}
            fixedDecimals={null}
            prefixText={data?.changeIn24Hours < 0 ? <span className="icon down-arrow text-lg"></span> : <span className="icon up-arrow"></span>}
            suffixText={"%"}
            thousandSeparator
          /> */}
        </AppText>
      </div>
    </ListDetailLayout.ListItem>
  );
};
const Assets = () => {
  const {
    loader,
    data: cryptoCoins,
    error: listError,
    page,
    pageSize,
  } = useSelector((state) => state.buyState.cryptoCoins);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const { coinToBuy } = useParams();
  const dispatch = useDispatch();
  const setSelectedCoin = useCallback(
    (item) => {
      if (item && !pathname.includes("success")) {
        dispatch(setSelectedCryptoCoin(item));
        navigate(`${basePath}/${item?.code}`);
      } else {
        dispatch(setSelectedCryptoCoin(item));
      }
    },
    [pathname]
  );
  useEffect(() => {
    setFilteredAssets(cryptoCoins?.assets);
  }, [cryptoCoins?.assets?.length]);
  useEffect(() => {
    if (cryptoCoins?.assets?.length > 0 && !coinToBuy) {
      setSelectedCoin(cryptoCoins?.assets?.[0]);
    }
    if (cryptoCoins?.assets?.length > 0 && coinToBuy) {
      const coinToSelect = cryptoCoins?.assets?.find(
        (coin) => coin.code === coinToBuy
      );
      setSelectedCoin(coinToSelect);
    }
  }, [cryptoCoins?.assets]);
  const clearListError = useCallback(() => {
    dispatch(clearCryptoCoinsError());
  }, []);
  const fetchMoreAssets = useCallback(
    (currentPage) => {
      dispatch(
        fetchCryptoCoins({
          step: "more",
          page: currentPage + 1,
          data: cryptoCoins?.assets,
        })
      );
    },
    [cryptoCoins?.assets]
  );
  const handleSearch = useCallback(
    (value) => {
      const valueToSearch =
        typeof value === "string" ? value?.trim() : searchInput?.trim();
      setSearchInput(valueToSearch);
      let filtered;
      if (!value) {
        filtered = cryptoCoins?.assets;
      } else {
        filtered = cryptoCoins?.assets?.filter(
          (item) =>
            item.code?.toLowerCase().includes(valueToSearch.toLowerCase()) ||
            item.name?.toLowerCase().includes(valueToSearch.toLowerCase())
        );
      }
      setFilteredAssets(filtered);
    },
    [cryptoCoins?.assets]
  );
  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
  }, []);
  return (
    <ListDetailLayout.List
      showAlert={!!listError}
      alterMessage={listError}
      setShowAlert={clearListError}
      searchValue={searchInput}
      onSearch={handleSearch}
      showSearch={!loader}
      onSearchInput={handleSearchInputChange}
      searchPlaceholer=""
      ItemComponent={Asset}
      pageSize={pageSize}
      list={filteredAssets || []}
      fetchNext={fetchMoreAssets}
      currentPage={page}
      loading={loader !== ''}
      LoaderComponent={ListLoader}
    />
  );
};

export default memo(Assets);
