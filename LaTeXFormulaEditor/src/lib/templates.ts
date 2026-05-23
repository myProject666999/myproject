export interface Template {
  id: string;
  title: string;
  category: string;
  latex: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "int-def",
    title: "定积分",
    category: "积分",
    latex: "\\int_{a}^{b} f(x)\\,dx",
  },
  {
    id: "int-indef",
    title: "不定积分",
    category: "积分",
    latex: "\\int f(x)\\,dx",
  },
  {
    id: "int-double",
    title: "二重积分",
    category: "积分",
    latex: "\\iint_{D} f(x,y)\\,dA",
  },
  {
    id: "sum",
    title: "求和",
    category: "求和",
    latex: "\\sum_{i=1}^{n} i",
  },
  {
    id: "prod",
    title: "连乘",
    category: "求和",
    latex: "\\prod_{i=1}^{n} a_i",
  },
  {
    id: "lim",
    title: "极限",
    category: "求和",
    latex: "\\lim_{x \\to a} f(x)",
  },
  {
    id: "sqrt",
    title: "平方根",
    category: "根号",
    latex: "\\sqrt{x}",
  },
  {
    id: "nth-root",
    title: "n 次根",
    category: "根号",
    latex: "\\sqrt[n]{a}",
  },
  {
    id: "fraction",
    title: "分式",
    category: "分式",
    latex: "\\frac{a}{b}",
  },
  {
    id: "binom",
    title: "二项式",
    category: "分式",
    latex: "\\binom{n}{k}",
  },
  {
    id: "matrix-2x2",
    title: "2x2 矩阵",
    category: "矩阵",
    latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  },
  {
    id: "matrix-3x3",
    title: "3x3 矩阵",
    category: "矩阵",
    latex: "\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}",
  },
  {
    id: "det",
    title: "行列式",
    category: "矩阵",
    latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
  },
  {
    id: "greek-alpha",
    title: "α",
    category: "希腊字母",
    latex: "\\alpha",
  },
  {
    id: "greek-beta",
    title: "β",
    category: "希腊字母",
    latex: "\\beta",
  },
  {
    id: "greek-gamma",
    title: "γ",
    category: "希腊字母",
    latex: "\\gamma",
  },
  {
    id: "greek-pi",
    title: "π",
    category: "希腊字母",
    latex: "\\pi",
  },
  {
    id: "greek-omega",
    title: "Ω",
    category: "希腊字母",
    latex: "\\Omega",
  },
  {
    id: "arrow-right",
    title: "向右箭头",
    category: "箭头",
    latex: "\\rightarrow",
  },
  {
    id: "arrow-implies",
    title: "蕴含",
    category: "箭头",
    latex: "\\implies",
  },
  {
    id: "arrow-equivalent",
    title: "等价",
    category: "箭头",
    latex: "\\iff",
  },
];

export const CATEGORIES = Array.from(
  new Set(TEMPLATES.map((t) => t.category))
);

export const SYMBOLS: { category: string; items: { label: string; latex: string }[] }[] = [
  {
    category: "希腊字母",
    items: [
      { label: "α", latex: "\\alpha" },
      { label: "β", latex: "\\beta" },
      { label: "γ", latex: "\\gamma" },
      { label: "δ", latex: "\\delta" },
      { label: "π", latex: "\\pi" },
      { label: "θ", latex: "\\theta" },
      { label: "φ", latex: "\\phi" },
      { label: "λ", latex: "\\lambda" },
      { label: "μ", latex: "\\mu" },
      { label: "σ", latex: "\\sigma" },
      { label: "Ω", latex: "\\Omega" },
      { label: "Δ", latex: "\\Delta" },
    ],
  },
  {
    category: "运算",
    items: [
      { label: "±", latex: "\\pm" },
      { label: "×", latex: "\\times" },
      { label: "÷", latex: "\\div" },
      { label: "·", latex: "\\cdot" },
      { label: "°", latex: "^\\circ" },
      { label: "√", latex: "\\sqrt{}" },
      { label: "a²", latex: "^{2}" },
      { label: "aⁿ", latex: "^{n}" },
      { label: "aₙ", latex: "_{n}" },
      { label: "∑", latex: "\\sum" },
      { label: "∏", latex: "\\prod" },
      { label: "∫", latex: "\\int" },
    ],
  },
  {
    category: "关系",
    items: [
      { label: "≠", latex: "\\neq" },
      { label: "≤", latex: "\\leq" },
      { label: "≥", latex: "\\geq" },
      { label: "≈", latex: "\\approx" },
      { label: "≡", latex: "\\equiv" },
      { label: "∝", latex: "\\propto" },
      { label: "∈", latex: "\\in" },
      { label: "∉", latex: "\\notin" },
      { label: "⊂", latex: "\\subset" },
      { label: "⊆", latex: "\\subseteq" },
      { label: "∪", latex: "\\cup" },
      { label: "∩", latex: "\\cap" },
    ],
  },
  {
    category: "括号",
    items: [
      { label: "()", latex: "\\left( \\right)" },
      { label: "[]", latex: "\\left[ \\right]" },
      { label: "{}", latex: "\\left\\{ \\right\\}" },
      { label: "⟨⟩", latex: "\\langle \\rangle" },
      { label: "| |", latex: "\\left| \\right|" },
      { label: "⌊⌋", latex: "\\lfloor \\rfloor" },
      { label: "⌈⌉", latex: "\\lceil \\rceil" },
    ],
  },
  {
    category: "箭头",
    items: [
      { label: "→", latex: "\\rightarrow" },
      { label: "←", latex: "\\leftarrow" },
      { label: "↔", latex: "\\leftrightarrow" },
      { label: "⇒", latex: "\\Rightarrow" },
      { label: "⇐", latex: "\\Leftarrow" },
      { label: "⇔", latex: "\\Leftrightarrow" },
      { label: "↑", latex: "\\uparrow" },
      { label: "↓", latex: "\\downarrow" },
    ],
  },
];
