import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "విద్యా సేవ | వనపర్తి",
  description: "విద్యా సర్వే మరియు విద్యార్థుల సమస్యల నిర్వహణ వ్యవస్థ"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="te"><body>{children}</body></html>;
}
