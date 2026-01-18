import { auth } from "@/auth";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { updateProfile } from "./actions";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
        // Handle edge case where session exists but user DB record doesn't (rare)
        return <div>User not found.</div>
    }

    // Determine account status
    const isPremium = user.mocksAvailable > 0;
    const status = isPremium ? "Premium" : "Standard";

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Account Settings
                </h1>
                <p className="text-gray-500 mt-2">Manage your profile and account preferences</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                        <form action={updateProfile} className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="shrink-0 relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-gray-100">
                                        <Image
                                            src={user.image || "/placeholder-avatar.png"} // Ensure you have a placeholder or handle null
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <title>Upload Image</title>
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            defaultValue={user.name || ""}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar / Status Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-full ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                                {isPremium ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{status} Plan</p>
                                <p className="text-sm text-gray-500">{isPremium ? 'Active subscription' : 'Basic access'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Available Mocks</span>
                                <span className="font-semibold">{user.mocksAvailable}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Role</span>
                                <span className="font-medium capitalize">{user.role}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Member Since</span>
                                <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {!isPremium && (
                            <div className="mt-6 pt-6 border-t border-gray-50">
                                <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition shadow-sm">
                                    Upgrade to Premium
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
