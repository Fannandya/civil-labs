import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FAKULTAS TEKNIK - Universitas Muhammadiyah Yogyakarta",
  description: "Laboratorium visual 3D untuk mempelajari elemen struktur, pembebanan, dan konsep teknik sipil."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
