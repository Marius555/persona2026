/**
 * Client-side dominant-colour sampling. Used by the onboarding "smart
 * placeholder": when a creator uploads an avatar but skips the banner, we
 * sample the avatar's average colour and turn it into a profile gradient so
 * their page still looks custom on day one.
 */

type Rgb = { r: number; g: number; b: number };

/** Average the (non-transparent) pixels of an image into a single colour. */
export function averageColor(src: string): Promise<Rgb | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 24;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, size, size);

      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, size, size).data;
      } catch {
        return resolve(null); // tainted canvas
      }

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 125) continue; // skip near-transparent pixels
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      if (!count) return resolve(null);
      resolve({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Build a pleasant diagonal gradient from a base colour. */
export function gradientFromRgb({ r, g, b }: Rgb): string {
  const dark = `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`;
  return `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), ${dark})`;
}

/** Convenience: image source → gradient string, or null if it can't be read. */
export async function dominantGradient(src: string): Promise<string | null> {
  const color = await averageColor(src);
  return color ? gradientFromRgb(color) : null;
}
