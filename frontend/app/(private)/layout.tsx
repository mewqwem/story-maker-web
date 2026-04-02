import { ReactNode } from "react";
import AppLayout from "@/components/AppLayout/AppLayout";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
