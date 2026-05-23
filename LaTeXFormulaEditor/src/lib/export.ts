import { renderSvg } from "./mathjax";
import sharp from "sharp";

export async function renderToPng(
  latex: string,
  opts: { displayMode?: boolean; bg?: string } = {}
): Promise<Buffer> {
  const bg = opts.bg || "transparent";
  const svg = await renderSvg(latex, opts.displayMode ?? true);
  const wrapped = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  ${bg !== "transparent" ? `<rect width="100%" height="100%" fill="${bg}"/>` : ""}
  <g transform="translate(40, 340) scale(3)">
    ${svg.replace(/^<\?xml[^>]*\?>/, "").trim()}
  </g>
</svg>`;
  return sharp(Buffer.from(wrapped))
    .png()
    .toBuffer();
}

export async function renderToSvg(
  latex: string,
  displayMode = true
): Promise<string> {
  return renderSvg(latex, displayMode);
}
