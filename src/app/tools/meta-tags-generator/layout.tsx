import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Meta Tags 생성기 - WebTools",
    description: "SEO와 소셜 공유를 위한 HTML 메타 태그를 손쉽게 생성하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
