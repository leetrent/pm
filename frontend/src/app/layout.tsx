import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Management - Kanban Board",
  description: "Single-board Kanban project management web application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
