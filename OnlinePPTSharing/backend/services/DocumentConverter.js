const { fromPath } = require('pdf2pic');
const path = require('path');
const fs = require('fs');
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
        slides = await this.convertPdfToImages();
      } else if (['ppt', 'pptx'].includes(this.fileType)) {
        slides = await this.convertPptToImages();
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

  async convertPdfToImages() {
    const options = {
      density: 100,
      saveFilename: 'slide',
      savePath: this.outputDir,
      format: 'png',
      width: 1280,
      height: 720
    };

    const result = await fromPath(this.filePath, options).bulk(-1, false);

    const slides = result.map((item, index) => ({
      document_id: this.documentId,
      page_number: index + 1,
      image_path: item.path,
      image_url: `/uploads/converted/${this.documentId}/${item.name}`,
      width: 1280,
      height: 720
    }));

    return slides;
  }

  async convertPptToImages() {
    return this.convertPdfToImages();
  }
}

module.exports = DocumentConverter;
