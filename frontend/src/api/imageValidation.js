export const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i;

export function validateImageFiles(existing, incoming, { maxFiles = 5, maxMB = MAX_IMAGE_MB } = {}) {
  const accepted = [];
  const problems = [];

  for (const file of incoming) {
    const typeOk = ALLOWED_TYPES.includes(file.type) || (!file.type && ALLOWED_EXT.test(file.name));
    if (!typeOk) {
      const heic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
      problems.push(
        heic
          ? `"${file.name}" is a HEIC photo. Please use JPG or PNG (on iPhone: Settings > Camera > Formats > Most Compatible).`
          : `"${file.name}" is not a supported image (use JPG, PNG, WEBP or GIF).`
      );
      continue;
    }
    if (file.size > maxMB * 1024 * 1024) {
      problems.push(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum is ${maxMB} MB per photo.`);
      continue;
    }
    if (existing.length + accepted.length >= maxFiles) {
      problems.push(`You can attach at most ${maxFiles} photos.`);
      break;
    }
    accepted.push(file);
  }

  return { accepted, error: problems.join(' ') };
}