"use client";
import { useEffect } from "react";
export function LanguageDocument() {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = "en";
    return () => { document.documentElement.lang = previous; };
  }, []);
  return null;
}
