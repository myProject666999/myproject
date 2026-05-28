import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveImage(base64Image: string): Promise<string> {
    const matches = base64Image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image');
    }

    const ext = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    return `/uploads/${filename}`;
  }
}
