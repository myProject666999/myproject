const { Document, Slide, User, Category, Like, Favorite, Download, Comment } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const DocumentConverter = require('../services/DocumentConverter');

class DocumentController {
  static async getList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const categoryId = req.query.categoryId;
      const sortBy = req.query.sortBy || 'created_at';
      const sortOrder = req.query.sortOrder || 'DESC';

      const where = { status: 1, is_public: 1 };
      if (categoryId) {
        where.category_id = categoryId;
      }

      const { count, rows } = await Document.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset
      });

      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('获取文档列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ]
      });

      if (!document) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      if (document.status !== 1) {
        return res.status(400).json({ code: 400, message: '文档正在处理中或已删除' });
      }

      await document.increment('view_count');

      const slides = await Slide.findAll({
        where: { document_id: id },
        order: [['page_number', 'ASC']]
      });

      let isLiked = false;
      let isFavorited = false;
      if (req.user) {
        isLiked = await Like.count({
          where: { user_id: req.user.id, document_id: id }
        }) > 0;
        isFavorited = await Favorite.count({
          where: { user_id: req.user.id, document_id: id }
        }) > 0;
      }

      res.json({
        code: 200,
        data: {
          document: {
            ...document.toJSON(),
            is_liked: isLiked,
            is_favorited: isFavorited
          },
          slides
        }
      });
    } catch (error) {
      console.error('获取文档详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 400, message: '请选择要上传的文件' });
      }

      const { title, description, categoryId, tags, isPublic, allowDownload } = req.body;
      const user = req.user;

      const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const allowedTypes = ['ppt', 'pptx', 'pdf'];
      if (!allowedTypes.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ code: 400, message: '不支持的文件类型，仅支持PPT、PPTX、PDF' });
      }

      const document = await Document.create({
        user_id: user.id,
        category_id: categoryId || null,
        title: title || req.file.originalname,
        description: description || '',
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: ext,
        is_public: isPublic !== undefined ? isPublic : 1,
        allow_download: allowDownload !== undefined ? allowDownload : 1,
        tags: tags || ''
      });

      res.json({
        code: 200,
        message: '上传成功，正在转换中...',
        data: {
          document_id: document.id,
          status: document.status
        }
      });

      const converter = new DocumentConverter(document.id, req.file.path, ext);
      converter.convert().then(result => {
        if (result.success) {
          console.log(`文档 ${document.id} 转换完成，共 ${result.totalSlides} 页`);
        } else {
          console.error(`文档 ${document.id} 转换失败: ${result.error}`);
        }
      }).catch(error => {
        console.error(`文档 ${document.id} 转换异常:`, error);
      });

    } catch (error) {
      console.error('上传文档失败:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ code: 500, message: '上传失败' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { title, description, categoryId, tags, isPublic, allowDownload } = req.body;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      if (document.user_id !== user.id) {
        return res.status(403).json({ code: 403, message: '无权修改此文档' });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (categoryId !== undefined) updateData.category_id = categoryId;
      if (tags !== undefined) updateData.tags = tags;
      if (isPublic !== undefined) updateData.is_public = isPublic;
      if (allowDownload !== undefined) updateData.allow_download = allowDownload;

      await Document.update(updateData, {
        where: { id }
      });

      res.json({ code: 200, message: '更新成功' });
    } catch (error) {
      console.error('更新文档失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      if (document.user_id !== user.id) {
        return res.status(403).json({ code: 403, message: '无权删除此文档' });
      }

      await Document.update({ status: 3 }, { where: { id } });

      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除文档失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async search(req, res) {
    try {
      const { keyword } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      if (!keyword) {
        return res.status(400).json({ code: 400, message: '请输入搜索关键词' });
      }

      const { count, rows } = await Document.findAndCountAll({
        where: {
          status: 1,
          is_public: 1,
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } },
            { tags: { [Op.like]: `%${keyword}%` } }
          ]
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ],
        order: [['view_count', 'DESC']],
        limit,
        offset
      });

      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('搜索失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async download(req, res) {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);

      if (!document || document.status !== 1) {
        return res.status(404).json({ code: 404, message: '文档不存在或正在处理中' });
      }

      if (document.allow_download !== 1) {
        return res.status(403).json({ code: 403, message: '此文档不允许下载' });
      }

      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({ code: 404, message: '文件不存在' });
      }

      await Download.create({
        user_id: req.user?.id || null,
        document_id: id,
        ip_address: req.ip
      });

      await document.increment('download_count');

      res.download(document.file_path, document.file_name);
    } catch (error) {
      console.error('下载失败:', error);
      res.status(500).json({ code: 500, message: '下载失败' });
    }
  }

  static async like(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      const existingLike = await Like.findOne({
        where: { user_id: user.id, document_id: id }
      });

      if (existingLike) {
        await existingLike.destroy();
        await document.decrement('like_count');
        res.json({ code: 200, message: '取消点赞', data: { liked: false } });
      } else {
        await Like.create({
          user_id: user.id,
          document_id: id
        });
        await document.increment('like_count');
        res.json({ code: 200, message: '点赞成功', data: { liked: true } });
      }
    } catch (error) {
      console.error('点赞失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async favorite(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      const existingFavorite = await Favorite.findOne({
        where: { user_id: user.id, document_id: id }
      });

      if (existingFavorite) {
        await existingFavorite.destroy();
        res.json({ code: 200, message: '取消收藏', data: { favorited: false } });
      } else {
        await Favorite.create({
          user_id: user.id,
          document_id: id
        });
        res.json({ code: 200, message: '收藏成功', data: { favorited: true } });
      }
    } catch (error) {
      console.error('收藏失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getMyDocuments(req, res) {
    try {
      const user = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      const where = { user_id: user.id };
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await Document.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('获取我的文档失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getMyFavorites(req, res) {
    try {
      const user = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const favorites = await Favorite.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      const documentIds = favorites.map(f => f.document_id);
      const documents = await Document.findAll({
        where: { id: documentIds, status: 1 },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ]
      });

      const docMap = {};
      documents.forEach(doc => {
        docMap[doc.id] = doc;
      });

      const sortedDocuments = documentIds
        .map(id => docMap[id])
        .filter(doc => doc);

      const total = await Favorite.count({ where: { user_id: user.id } });

      res.json({
        code: 200,
        data: {
          list: sortedDocuments,
          total,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('获取收藏失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getComments(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { document_id: id, status: 1, parent_id: null },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          {
            model: Comment,
            as: 'replies',
            where: { status: 1 },
            required: false,
            include: [
              { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('获取评论失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async addComment(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { content, parentId } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ code: 400, message: '评论内容不能为空' });
      }

      const document = await Document.findByPk(id);
      if (!document || document.status !== 1) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      if (parentId) {
        const parentComment = await Comment.findByPk(parentId);
        if (!parentComment) {
          return res.status(400).json({ code: 400, message: '回复的评论不存在' });
        }
      }

      const comment = await Comment.create({
        user_id: user.id,
        document_id: id,
        content: content.trim(),
        parent_id: parentId || null
      });

      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] }
        ]
      });

      res.json({
        code: 200,
        message: '评论成功',
        data: { comment: commentWithUser }
      });
    } catch (error) {
      console.error('评论失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async share(req, res) {
    try {
      const { id } = req.params;
      const { shareType } = req.body;

      const document = await Document.findByPk(id);
      if (!document || document.status !== 1) {
        return res.status(404).json({ code: 404, message: '文档不存在' });
      }

      await Share.create({
        user_id: req.user?.id || null,
        document_id: id,
        share_type: shareType || 'link',
        ip_address: req.ip
      });

      await document.increment('share_count');

      res.json({
        code: 200,
        message: '分享成功',
        data: {
          share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/view/${id}`
        }
      });
    } catch (error) {
      console.error('分享失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
}

module.exports = DocumentController;
