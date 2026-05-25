const { Category, Document } = require('../models');

class CategoryController {
  static async getList(req, res) {
    try {
      const categories = await Category.findAll({
        order: [['sort_order', 'ASC'], ['id', 'ASC']]
      });

      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const docCount = await Document.count({
            where: { category_id: category.id, status: 1, is_public: 1 }
          });
          return {
            ...category.toJSON(),
            document_count: docCount
          };
        })
      );

      res.json({
        code: 200,
        data: { list: categoriesWithCount }
      });
    } catch (error) {
      console.error('获取分类列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getHotCategories(req, res) {
    try {
      const categories = await Category.findAll({
        limit: 8,
        order: [['sort_order', 'ASC']]
      });

      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const docCount = await Document.count({
            where: { category_id: category.id, status: 1, is_public: 1 }
          });
          return {
            ...category.toJSON(),
            document_count: docCount
          };
        })
      );

      res.json({
        code: 200,
        data: { list: categoriesWithCount }
      });
    } catch (error) {
      console.error('获取热门分类失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
}

module.exports = CategoryController;
