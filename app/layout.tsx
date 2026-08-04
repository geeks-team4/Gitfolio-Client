import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gitfolio",
  description: "GitHub 커밋을 분석해 개발 과정과 문제 해결 기록을 복원하는 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
