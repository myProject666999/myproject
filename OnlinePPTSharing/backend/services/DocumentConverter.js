const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { Document, Slide } = require('../models');

const convertDir = process.env.CONVERT_DIR || './converted';

if (!fs.existsSync(convertDir)) {
  fs.mkdirSync(convertDir, { recursive: true });
}

class DocumentConverter {
  constructor(documentId, filePath, fileType) {
    this.documentId = documentId;
    this.filePath = filePath;
    this.fileType = fileType;
    this.outputDir = path.join(convertDir, documentId.toString());
  }

  async convert() {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      let slides = [];

      if (this.fileType === 'pdf') {
        slides = await this.convertPdf();
      } else if (['ppt', 'pptx'].includes(this.fileType)) {
        slides = await this.convertPpt();
      } else {
        throw new Error('不支持的文件类型');
      }

      if (slides.length > 0) {
        await Document.update({
          status: 1,
          total_slides: slides.length,
          cover_image: slides[0].image_url
        }, {
          where: { id: this.documentId }
        });

        await Slide.bulkCreate(slides);
      } else {
        throw new Error('转换失败：未生成任何幻灯片');
      }

      return { success: true, totalSlides: slides.length };
    } catch (error) {
      console.error('文档转换失败:', error);
      await Document.update({
        status: 2
      }, {
        where: { id: this.documentId }
      });
      return { success: false, error: error.message };
    }
  }

  async convertPdf() {
    try {
      const dataBuffer = fs.readFileSync(this.filePath);
      const pdfData = await pdfParse(dataBuffer);
      const numPages = pdfData.numpages || 1;

      const pdfFileName = path.basename(this.filePath);
      const pdfUrl = `/uploads/${path.relative('uploads', this.filePath).replace(/\\/g, '/')}`;

      const slides = [];
      for (let i = 1; i <= numPages; i++) {
        slides.push({
          document_id: this.documentId,
          page_number: i,
          image_path: this.filePath,
          image_url: `${pdfUrl}#page=${i}`,
          width: 1280,
          height: 720
        });
      }

      return slides;
    } catch (error) {
      console.error('PDF解析失败:', error);
      return [{
        document_id: this.documentId,
        page_number: 1,
        image_path: this.filePath,
        image_url: `/uploads/${path.relative('uploads', this.filePath).replace(/\\/g, '/')}`,
        width: 1280,
        height: 720
      }];
    }
  }

  async convertPpt() {
    return [{
      document_id: this.documentId,
      page_number: 1,
      image_path: this.filePath,
      image_url: `/uploads/${path.relative('uploads', this.filePath).replace(/\\/g, '/')}`,
      width: 1280,
      height: 720
    }];
  }
}

module.exports = DocumentConverter;
