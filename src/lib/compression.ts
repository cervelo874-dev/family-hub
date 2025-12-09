
/**
 * Compresses an image file to be under a certain size limit.
 * Uses Canvas API to resize and reduce quality.
 * 
 * @param file - The original image file
 * @param maxWidth - Max width of the output image (default 1200px)
 * @param maxSizeBytes - Max file size in bytes (default 1MB)
 * @returns Promise<File> - The compressed file
 */
export async function compressImage(file: File, maxWidth = 1200, maxSizeBytes = 1024 * 1024): Promise<File> {
    // If already small enough, return original
    if (file.size <= maxSizeBytes) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Resize if too big
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                // Fallback if context creation fails (unlikely)
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.8 quality first
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file); // Fail gracefully
                    return;
                }

                // If still too big, try lower quality
                if (blob.size > maxSizeBytes) {
                    // Recursive or just simpler second pass? 
                    // Let's just try a stronger compression if first failed, or return what we have if it's better than original.
                    // For now, simpler: reduce quality based on ratio
                    const newQuality = 0.6;
                    canvas.toBlob((blob2) => {
                        if (blob2 && blob2.size < file.size) {
                            resolve(new File([blob2], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        } else {
                            // If compression made it bigger (unlikely with JPEG) or failed, return best effort
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        }
                    }, 'image/jpeg', newQuality);
                } else {
                    resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                }
            }, 'image/jpeg', 0.8);
        };

        reader.readAsDataURL(file);
    });
}
