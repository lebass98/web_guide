import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "이미지 포맷 변환기 - WebTools",
    description: "JPG, PNG, WebP 이미지를 브라우저에서 바로 변환하세요. 서버 업로드 없이 완전 로컬 처리.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
