import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Risks - GRCma",
    description: "Risk Assessment Dashboard",
};

export default function RisksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
