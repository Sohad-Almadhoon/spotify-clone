import { Figtree } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../providers/UserProvider";
import { SupabaseProvider } from "../providers/SupabaseProvider";
import Sidebar from "../components/Sidebar";
import { ModalProvider } from "../providers/ModalProvider";
import { ToasterProvider } from "../providers/ToasterProvider";
import { getSongsByUserId } from "@/src/actions/getSongsByUserId";
import Player from "../components/Player";
import { getActiveProductsWithPrices } from "../actions/getActiveProductsWithPrices";
export const revalidate = 0;
export const metadata = {
  title: "Spotify Clone",
  description: "Listen to music!",
};
const font = Figtree({ subsets: ["latin"] });
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSongs = await getSongsByUserId();
  const products = await getActiveProductsWithPrices();
  return (
    <html lang="en">
      <body className={font.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products={products} />
            <Sidebar songs={userSongs}>{children}</Sidebar>
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
