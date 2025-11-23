export default function AboutView() {
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center">
            <h2 className="text-3xl font-bold text-green-900 mb-6">About the Creator</h2>
            <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-100 shadow-sm">
                    <img
                        src="/profile.png"
                        alt="HMAMOUCH"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Mohamed HMAMOUCH</h3>
                <p className="text-gray-600 mt-2">Information Security Specialist | GRC</p>
            </div>
            <a
                href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#0077b5] hover:bg-[#006396] text-white font-medium rounded-md transition shadow-sm"
            >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                Connect on LinkedIn
            </a>
        </div>
    );
}
