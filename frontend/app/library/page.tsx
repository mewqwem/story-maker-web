// app/library/page.tsx
import { Metadata } from "next";
import LibraryManager from "@/components/LibraryPage/LibraryPage";

export const metadata: Metadata = {
  title: "Library | StoryMaker",
  description: "Manage your prompts, voices, and templates.",
};

export default function LibraryPage() {
  return <LibraryManager />;
}
