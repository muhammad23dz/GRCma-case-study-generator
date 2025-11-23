export default function MethodologyView() {
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-green-900 mb-6">Methodology</h2>

            <div className="prose prose-green max-w-none text-gray-700">
                <p className="mb-4">
                    The <strong>GRCma</strong> generator is built upon a rigorous analysis of public case studies published by <strong>NCC Group</strong>, a global leader in cyber security and software escrow.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">The Framework</h3>
                <p className="mb-4">
                    Our AI model has been trained to replicate the structural logic and professional tone of top-tier consulting engagements. Each report follows a proven narrative arc:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Executive Summary:</strong> A high-level overview for C-Suite stakeholders.</li>
                    <li><strong>Drivers & Risks:</strong> The "Why" behind the engagement.</li>
                    <li><strong>Gap Analysis:</strong> A clear comparison of Current vs. Target states.</li>
                    <li><strong>Roadmap:</strong> Actionable steps for remediation and improvement.</li>
                    <li><strong>Business Impact:</strong> The tangible value delivered.</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Why This Matters</h3>
                <p>
                    By adopting this structure, organizations can communicate complex GRC challenges in a language that resonates with board members and executives, facilitating faster decision-making and budget approval.
                </p>
            </div>
        </div>
    );
}
