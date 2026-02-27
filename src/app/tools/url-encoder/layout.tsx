import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "URL 인코더/디코더 - WebTools",
    description: "URI 구성요소를 빠르게 인코딩 또는 디코딩하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
