
export const metadata = {
    title: 'Terms of Service - Gradbirds',
    description: 'The rules and regulations for the use of Gradbirds Website.',
};

export default function TermsPage() {
    return (
        <div className="bg-white dark:bg-zinc-900 py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Terms of Service
                    </h2>
                </div>
                <div className="mt-12 prose prose-indigo prose-lg text-gray-500 dark:text-gray-400 mx-auto">
                    <p>Last updated: January 2026</p>
                    <h3>1. Agreement to Terms</h3>
                    <p>
                        By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
                    </p>
                    <h3>2. Use License</h3>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Gradbirds' website for personal, non-commercial transitory viewing only.
                    </p>
                    <h3>3. Disclaimer</h3>
                    <p>
                        The materials on Gradbirds' website are provided on an 'as is' basis. Gradbirds makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                    {/* Add more sections as needed */}
                </div>
            </div>
        </div>
    );
}
