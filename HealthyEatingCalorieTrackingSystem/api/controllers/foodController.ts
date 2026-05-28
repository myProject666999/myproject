import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Food } from '../models';

export const getFoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (name && typeof name === 'string') {
      where.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (category && typeof category === 'string') {
      where.category = category;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Food.findAndCountAll({
      where,
      offset,
      limit: Number(limit),
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取食物列表失败',
    });
  }
};

export const getFoodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const food = await Food.findByPk(id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: '食物不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取食物详情失败',
    });
  }
};

export default {
  getFoods,
  getFoodById,
};
