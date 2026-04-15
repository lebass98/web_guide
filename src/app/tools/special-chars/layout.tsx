import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "특수문자 모음 - WebTools",
    description: "Unicode 특수문자를 카테고리별로 탐색하고 클릭하여 복사하세요. HTML 엔티티와 코드포인트도 확인할 수 있습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
