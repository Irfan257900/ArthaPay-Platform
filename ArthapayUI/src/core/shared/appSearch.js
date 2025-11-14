import { Input } from "antd";
import { useCallback } from "react";
const { Search } = Input;

const AppSearch = (props) => {
  return <Search {...props}>{props.children}</Search>;
};
const SearchButton = ({ onSearch, searchParams = [] }) => {
  const handleSearch = useCallback(() => {
    onSearch(...searchParams)
  }, [searchParams])
  return <button
    type="button"
    className="border-none outline-none bg-transparent focus:bg-transparent focus:border-none"
    onClick={handleSearch}
  >
    <span className="icon md search c-pointer" />
  </button>
}
AppSearch.SearchButton = SearchButton
export default AppSearch;