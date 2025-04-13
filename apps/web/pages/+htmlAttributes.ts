import { PageContext } from "vike/types";

export const htmlAttributes = (pageContext: PageContext) => {
  return {
    "data-theme":
      pageContext.colorScheme === "dark"
        ? "dark"
        : pageContext.colorScheme === "light"
        ? "light"
        : undefined,
  };
};
