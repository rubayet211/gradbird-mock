"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";

export default function AudioUploader({ value, onChange, className = "" }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleDelete = () => {
        onChange("");
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {value ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span className="text-sm text-green-700 font-medium">Audio Uploaded</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                    <audio controls className="w-full" src={value}>
                        Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-gray-400 mt-2 truncate">{value}</p>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p className="text-sm text-gray-500 mb-3">Upload audio file (MP3, WAV, OGG)</p>
                            <UploadButton
                                endpoint="mockAudioUploader"
                                onUploadBegin={() => setIsUploading(true)}
                                onClientUploadComplete={(res) => {
                                    setIsUploading(false);
                                    const fileUrl = res?.[0]?.url || res?.[0]?.ufsUrl;
                                    if (fileUrl) {
                                        onChange(fileUrl);
                                    }
                                }}
                                onUploadError={(error) => {
                                    setIsUploading(false);
                                    alert(`Upload failed: ${error.message}`);
                                }}
                                appearance={{
                                    button: "bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ut-uploading:bg-blue-400",
                                    allowedContent: "text-xs text-gray-400",
                                }}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
