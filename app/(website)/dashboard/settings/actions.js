'use server';

import { auth } from "@/auth";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateProfile(formData) {
    const session = await auth();
    if (!session) {
        return { error: "Not authenticated" };
    }

    const name = formData.get("name");
    const imageFile = formData.get("image");

    try {
        await dbConnect();

        const updateData = {};
        if (name) updateData.name = name;

        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = `params-${Date.now()}${path.extname(imageFile.name)}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/profiles");

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            updateData.image = `/uploads/profiles/${filename}`;
        }

        if (Object.keys(updateData).length > 0) {
            await User.findOneAndUpdate(
                { email: session.user.email },
                updateData
            );
        }

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard"); // Update sidebar/header info too
        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile" };
    }
}
