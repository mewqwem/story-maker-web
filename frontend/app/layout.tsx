import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers"; // Твій SessionProvider тут
import "./globals.css";
import AppLayout from "@/components/AppLayout/AppLayout";

export const metadata = {
  title: "StoryMaker | AI Creative Studio",
  description: "Generate stories and voices with ease",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>
            <AppLayout>{children}</AppLayout>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
