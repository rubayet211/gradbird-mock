
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                    <div className="px-5 py-2">
                        <Link href="/" className="text-base text-gray-400 hover:text-white">
                            Home
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/about" className="text-base text-gray-400 hover:text-white">
                            About
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                            Contact
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/privacy" className="text-base text-gray-400 hover:text-white">
                            Privacy Policy
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/terms" className="text-base text-gray-400 hover:text-white">
                            Terms of Service
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/faq" className="text-base text-gray-400 hover:text-white">
                            FAQ
                        </Link>
                    </div>
                </nav>
                <p className="mt-8 text-center text-base text-gray-400">
                    &copy; 2026 Gradbirds. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
