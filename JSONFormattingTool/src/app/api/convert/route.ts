import { NextRequest, NextResponse } from 'next/server';
import { jsonToYaml, jsonToXml } from '@/lib/jsonUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, content } = body;

    if (!format || !content) {
      return NextResponse.json(
        { error: '格式和内容不能为空' },
        { status: 400 }
      );
    }

    let result: string;

    switch (format) {
      case 'yaml':
        result = jsonToYaml(content);
        break;
      case 'xml':
        result = jsonToXml(content);
        break;
      default:
        return NextResponse.json(
          { error: '不支持的格式' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('转换失败:', error);
    return NextResponse.json(
      { error: error.message || '转换失败' },
      { status: 400 }
    );
  }
}
