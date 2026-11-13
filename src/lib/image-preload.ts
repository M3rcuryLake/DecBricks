import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

export const BLOCK_IMAGE_WIDTHS = [328, 660, 736, 820] as const;

// Same responsive sizes as AboutBlock / ServiceBlock's media column
// (lg:260 / xl:300 / 3xl:360 / 4xl:410, 2x DPR on the smallest steps).
export const BLOCK_IMAGE_SIZES =
  '(min-width: 1920px) 410px, (min-width: 1660px) 360px, (min-width: 1280px) 300px, (min-width: 1024px) 260px, calc(100vw - 47px)';

export interface BlockImagePreload {
  href: string;
  imagesrcset: string;
  imagesizes: string;
  type: string;
  fetchpriority?: 'high';
}

/**
 * Resolve exact AVIF srcset preload descriptors matching `<Picture>` output for
 * AboutBlock and ServiceBlock so `<head>` preloads hit the exact built files.
 */
export async function getBlockImagePreloads(
  items: ReadonlyArray<{ src: ImageMetadata; quality: number; position?: string }>
): Promise<BlockImagePreload[]> {
  return Promise.all(
    items.map(async ({ src, quality, position }, index) => {
      const optimized = await getImage({
        src,
        widths: [...BLOCK_IMAGE_WIDTHS],
        format: 'avif',
        quality,
        ...(position ? { position } : {}),
      });
      return {
        href: optimized.src,
        imagesrcset: optimized.srcSet.attribute || optimized.src,
        imagesizes: BLOCK_IMAGE_SIZES,
        type: 'image/avif',
        ...(index === 0 ? { fetchpriority: 'high' as const } : {}),
      };
    })
  );
}
