import sharp from 'sharp';
import path from 'path';

async function generateFavicons() {
    const iconPath = path.resolve(__dirname, '../../public/assets/icon-512.png');
    const publicDir = path.resolve(__dirname, '../../public');

    const sizes = [16, 32, 180, 192, 512];

    for (const size of sizes) {
        let name = `favicon-${size}x${size}.png`;
        if (size === 180) name = 'apple-touch-icon.png';
        if (size === 192) name = 'android-chrome-192x192.png';
        if (size === 512) name = 'android-chrome-512x512.png';

        await sharp(iconPath)
            .resize(size, size)
            .toFile(path.join(publicDir, name));
        console.log(`Generated ${name}`);
    }

    // Also Generate favicon.ico by just copying the 32x32 one, or converting it using sharp
    // Since sharp doesn't output .ico directly easily without multiple frames,
    // we can use a basic trick or just stick to PNGs since modern browsers accept favicon.png.
    // Actually, we can generate a 32x32 ico directly or just tell people to use the pngs via layout.tsx
    // We'll generate a 32x32 PNG, and rename it as fallback.
    await sharp(iconPath)
        .resize(32, 32)
        .toFormat('png')
        .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('Done!');
}

generateFavicons().catch(console.error);
