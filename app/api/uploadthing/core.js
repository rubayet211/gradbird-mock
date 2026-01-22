import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

// FileRouter for mock test admin uploads
export const ourFileRouter = {
    // Audio uploader for listening section (MP3, WAV, OGG - max 32MB)
    mockAudioUploader: f({
        audio: {
            maxFileSize: "32MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user || session.user.role !== "admin") {
                throw new UploadThingError("Unauthorized - Admin access required");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Audio upload complete for userId:", metadata.userId);
            console.log("Audio file URL:", file.ufsUrl);
            return { url: file.ufsUrl };
        }),

    // Image uploader for diagrams, maps, charts (PNG, JPG, WebP - max 8MB)
    mockImageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user || session.user.role !== "admin") {
                throw new UploadThingError("Unauthorized - Admin access required");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Image upload complete for userId:", metadata.userId);
            console.log("Image file URL:", file.ufsUrl);
            return { url: file.ufsUrl };
        }),

    // Multi-image uploader for writing tasks (up to 4 images)
    mockMultiImageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 4,
        },
    })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user || session.user.role !== "admin") {
                throw new UploadThingError("Unauthorized - Admin access required");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Multi-image upload complete for userId:", metadata.userId);
            console.log("Image file URL:", file.ufsUrl);
            return { url: file.ufsUrl };
        }),
};

export { ourFileRouter as uploadRouter };
