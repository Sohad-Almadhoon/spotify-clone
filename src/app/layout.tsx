import { Figtree } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../providers/UserProvider";
import { SupabaseProvider } from "../providers/SupabaseProvider";
import Sidebar from "../components/Sidebar";
import { ModalProvider } from "../providers/ModalProvider";
import { ToasterProvider } from "../providers/ToasterProvider";
import { getSongsByUserId } from "@/actions/getSongsByUserId";
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
  return (
    <html lang="en">
      <body className={font.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products={[]} />
            <Sidebar songs={userSongs}>{children}</Sidebar>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
