function createEmptyBundle() {
  return {
    manifest: { version: 0, sprites: {} },
    images: {},
    getImage() {
      return null;
    },
    hasImage() {
      return false;
    }
  };
}

async function loadManifest(manifestPath) {
  const response = await fetch(manifestPath);
  if (!response.ok) {
    throw new Error(`manifest load failed: ${response.status}`);
  }

  return response.json();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`image load failed: ${src}`));
    image.src = src;
  });
}

export async function loadAssets({ manifestPath = './assets/meta/manifest.json' } = {}) {
  try {
    const manifest = await loadManifest(manifestPath);
    const spriteMap = manifest.sprites || {};
    const entries = Object.entries(spriteMap);

    if (entries.length === 0) {
      return createEmptyBundle();
    }

    const loadedPairs = await Promise.all(
      entries.map(async ([key, src]) => {
        try {
          const image = await loadImage(src);
          return [key, image];
        } catch {
          return [key, null];
        }
      })
    );

    const images = Object.fromEntries(loadedPairs);

    return {
      manifest,
      images,
      getImage(key) {
        return images[key] || null;
      },
      hasImage(key) {
        return Boolean(images[key]);
      }
    };
  } catch {
    return createEmptyBundle();
  }
}
