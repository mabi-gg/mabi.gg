import { usePageContext } from "vike-react/usePageContext";
import { render } from "vike/abort";
import { ItemDetails } from "./item-details";

export default Page;

function Page() {
  const pageContext = usePageContext();
  const itemId = Number(pageContext.routeParams.id);
  if (Number.isNaN(itemId)) {
    throw render(404);
  }
  return <ItemDetails itemId={itemId} />;
}
