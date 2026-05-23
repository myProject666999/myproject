export async function fetchFavicon(url: string): Promise<string | null> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const candidates = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
    ];

    for (const faviconUrl of candidates) {
      try {
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (response.ok) {
          return faviconUrl;
        }
      } catch {
        continue;
      }
    }

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return url;
  }
}
