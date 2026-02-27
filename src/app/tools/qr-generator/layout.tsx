import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "QR 코드 생성기 - WebTools",
    description: "즉시 사용 가능한 QR 코드를 생성하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
