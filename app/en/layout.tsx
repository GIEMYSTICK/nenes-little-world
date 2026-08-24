import { LanguageDocument } from "./LanguageDocument";

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><LanguageDocument />{children}</>;
}
