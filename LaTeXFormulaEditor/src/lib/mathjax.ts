import { init } from "mathjax";

let mathJaxPromise: Promise<any> | null = null;

async function ensureMathJax() {
  if (mathJaxPromise) return mathJaxPromise;
  mathJaxPromise = init({
    loader: { load: ["input/tex", "output/svg"] },
    tex: {
      packages: { "[+]": ["ams", "newcommand", "configmacros"] },
    },
    svg: { fontCache: "none" },
  });
  return mathJaxPromise;
}

export interface RenderResult {
  html: string;
  svg: string;
}

export async function renderTex(
  latex: string,
  displayMode = true
): Promise<RenderResult> {
  const mj = await ensureMathJax();
  const node = mj.tex2svg(latex || "", { display: displayMode });
  const adaptor = mj.startup.adaptor;
  const html = adaptor.outerHTML(node);
  return { html, svg: html };
}

export async function renderSvg(
  latex: string,
  displayMode = true
): Promise<string> {
  const mj = await ensureMathJax();
  const node = mj.tex2svg(latex || "", { display: displayMode });
  const adaptor = mj.startup.adaptor;
  return adaptor.outerHTML(node);
}
