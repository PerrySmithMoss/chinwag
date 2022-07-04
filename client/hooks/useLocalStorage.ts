import { useEffect, useState } from "react";
import { isServer } from "../utils/isServer";

const PREFIX = process.env.NEXT_PUBLIC_LOCAL_STORAGE_PREFIX;

export default function useLocalStorage(key: string, initialValue?: any) {
  const prefixedKey = PREFIX + key;

  const [value, setValue] = useState(() => {
    if (isServer() === false) {
      const jsonValue = localStorage.getItem(prefixedKey);

      if (jsonValue !== "undefined" && jsonValue !== null)
        return JSON.parse(jsonValue);

      if (typeof initialValue === "function") {
        return initialValue();
      } else {
        return initialValue;
      }
    }
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  return [value, setValue];
}
