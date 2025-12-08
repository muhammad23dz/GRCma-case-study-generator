import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vendors - GRCma",
    description: "Vendor Risk Management",
};

export default function VendorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
