import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Controls - GRCma",
    description: "Control Library Management",
};

export default function ControlsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
