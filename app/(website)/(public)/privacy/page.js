
export const metadata = {
    title: 'Privacy Policy - Gradbirds',
    description: 'Our commitment to protecting your privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="bg-white dark:bg-zinc-900 py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Privacy Policy
                    </h2>
                </div>
                <div className="mt-12 prose prose-indigo prose-lg text-gray-500 dark:text-gray-400 mx-auto">
                    <p>Last updated: January 2026</p>
                    <h3>1. Introduction</h3>
                    <p>
                        Welcome to Gradbirds. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>
                    <h3>2. Data We Collect</h3>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data, Contact Data, Technical Data, and Usage Data.
                    </p>
                    <h3>3. How We Use Your Data</h3>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you.
                    </p>
                    {/* Add more sections as needed */}
                </div>
            </div>
        </div>
    );
}
