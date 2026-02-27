import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Base64 변환기 - WebTools",
    description: "Base64 문자열을 안전하게 인코딩 또는 디코딩하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
