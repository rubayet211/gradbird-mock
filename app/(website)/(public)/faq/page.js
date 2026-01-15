
export const metadata = {
    title: 'FAQ - Gradbirds',
    description: 'Frequently Asked Questions about our mock tests and services.',
};

const faqs = [
    {
        question: "How realistic are the mock tests?",
        answer: "Our mock tests are designed to replicate the official computer-delivered IELTS exam interface and difficulty level as closely as possible."
    },
    {
        question: "Do I get my results immediately?",
        answer: "Yes, for the Listening and Reading modules, you will receive your scores and detailed analytics immediately after submitting the test. Writing and Speaking are graded by certified examiners within 24-48 hours."
    },
    {
        question: "Can I retake a mock test?",
        answer: "Once a mock test session is completed and submitted, it cannot be retaken to preserve the integrity of your score history. However, you can review your answers and mistakes at any time."
    },
    {
        question: "How do I book a speaking test?",
        answer: "You can book a live speaking session from your dashboard. Select a slot that works for you, and you will be connected with an examiner at the scheduled time."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and mobile banking solutions available in your region."
    }
];

export default function FAQPage() {
    return (
        <div className="bg-white dark:bg-zinc-900 py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200 dark:divide-zinc-700">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl text-center mb-8">
                    Frequently Asked Questions
                </h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-200 dark:divide-zinc-700">
                    {faqs.map((faq) => (
                        <div key={faq.question} className="pt-6">
                            <dt className="text-lg">
                                <details className="group">
                                    <summary className="text-left w-full flex justify-between items-start text-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {faq.question}
                                        </span>
                                        <span className="ml-6 h-7 flex items-center">
                                            <svg className="rotate-0 group-open:-rotate-180 h-6 w-6 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <dd className="mt-2 pr-12">
                                        <p className="text-base text-gray-500 dark:text-gray-400 pl-2">
                                            {faq.answer}
                                        </p>
                                    </dd>
                                </details>
                            </dt>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}
