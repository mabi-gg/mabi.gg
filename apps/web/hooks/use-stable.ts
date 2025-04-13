import { replaceEqualDeep } from "@tanstack/react-query";
import { useRef, useEffect } from "react";

export function useStable<T>(value: T) {
  const ref = useRef(value);
  const stable = replaceEqualDeep(ref.current, value);
  useEffect(() => {
    ref.current = stable;
  }, [stable]);
  return stable;
}
