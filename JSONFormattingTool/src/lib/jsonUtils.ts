export function formatJson(json: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, indent);
  } catch {
    throw new Error('无效的JSON格式');
  }
}

export function minifyJson(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    throw new Error('无效的JSON格式');
  }
}

export function jsonToYaml(json: string): string {
  const yaml = require('js-yaml');
  try {
    const parsed = JSON.parse(json);
    return yaml.dump(parsed, { indent: 2, lineWidth: 120 });
  } catch {
    throw new Error('无效的JSON格式');
  }
}

export function jsonToXml(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return convertToXml(parsed);
  } catch {
    throw new Error('无效的JSON格式');
  }
}

function convertToXml(obj: any, indent: string = ''): string {
  let xml = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      xml += `${indent}<item>\n${convertToXml(item, indent + '  ')}${indent}</item>\n`;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += `${indent}<${key}>\n${convertToXml(value, indent + '  ')}${indent}</${key}>\n`;
      } else {
        xml += `${indent}<${key}>${escapeXml(String(value))}</${key}>\n`;
      }
    }
  } else {
    xml += `${indent}${escapeXml(String(obj))}\n`;
  }

  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function validateJson(json: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(json);
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}
