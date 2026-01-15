import Link from "next/link";
import Image from "next/image";

export default function AuthCard({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-[100px] opacity-60"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center mb-8">
                        <Link href="/" className="mb-6 group">
                            {/* Placeholder for Logo - replacing with text for now if no image asset is confirmed, 
                    but using emojis/text to simulate logo presence */}
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                                    G
                                </div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                                    Gradbirds
                                </span>
                            </div>
                        </Link>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-center text-sm text-gray-600 max-w-[80%]">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {children}
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Gradbirds. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
