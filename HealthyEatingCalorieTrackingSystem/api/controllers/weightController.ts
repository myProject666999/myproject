import { Request, Response } from 'express';
import { WeightRecord } from '../models';

interface AuthRequest extends Request {
  userId?: number;
}

export const getWeights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const weights = await WeightRecord.findAll({
      where: {
        user_id: userId,
      },
      order: [['record_date', 'DESC']],
    });

    res.json({
      success: true,
      data: weights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取体重记录失败',
    });
  }
};

export const addWeight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { weight, record_date } = req.body;

    const existingRecord = await WeightRecord.findOne({
      where: {
        user_id: userId,
        record_date: record_date || new Date().toISOString().split('T')[0],
      },
    });

    if (existingRecord) {
      await existingRecord.update({
        weight,
      });

      res.json({
        success: true,
        data: existingRecord,
        message: '体重记录更新成功',
      });
      return;
    }

    const weightRecord = await WeightRecord.create({
      user_id: userId,
      weight,
      record_date: record_date || new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      data: weightRecord,
      message: '体重记录添加成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加体重记录失败',
    });
  }
};

export default {
  getWeights,
  addWeight,
};
