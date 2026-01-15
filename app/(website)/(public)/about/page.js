
export const metadata = {
    title: 'About Us - Gradbirds',
    description: 'Learn more about Gradbirds and our mission to help you ace your exams.',
};

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-zinc-900 py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        About Gradbirds
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        We are dedicated to providing the most realistic and effective computer-delivered IELTS mock test experience.
                    </p>
                </div>
                <div className="mt-12">
                    <p className="text-base text-gray-500 dark:text-gray-400">
                        Gradbirds was founded with a single mission: to bridge the gap between practice and reality. We understand that the computer-delivered IELTS exam can be daunting, not just because of the content, but because of the interface. Our platform is designed to mimic the actual exam environment down to the smallest detail, ensuring that on test day, the only thing you need to focus on is your answers.
                    </p>
                    <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
                        From instant analytics for listening and reading to personalized feedback from certified examiners for writing and speaking, we provide a comprehensive ecosystem for your success.
                    </p>
                </div>
            </div>
        </div>
    );
}
