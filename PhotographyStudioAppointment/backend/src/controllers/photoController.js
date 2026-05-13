const { Photo, Appointment } = require('../models');
const path = require('path');
const fs = require('fs');

exports.list = async (req, res) => {
  try {
    const { appointmentId, type } = req.query;

    const where = {};
    if (appointmentId) {
      where.appointmentId = appointmentId;
    }
    if (type) {
      where.type = type;
    }

    const photos = await Photo.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    res.json(photos);
  } catch (error) {
    console.error('List photos error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.upload = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: '订单ID不能为空' });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: '订单不存在' });
    }

    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const photo = await Photo.create({
          appointmentId,
          filename: file.originalname,
          originalPath: `/uploads/${file.filename}`,
          type: 'original'
        });
        photos.push(photo);
      }
    }

    res.status(201).json(photos);
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.selectPhotos = async (req, res) => {
  try {
    const { photoIds, selected } = req.body;

    if (!photoIds || photoIds.length === 0) {
      return res.status(400).json({ message: '照片ID不能为空' });
    }

    await Photo.update(
      {
        isSelected: selected,
        type: selected ? 'selected' : 'original'
      },
      {
        where: {
          id: photoIds
        }
      }
    );

    res.json({ message: '操作成功' });
  } catch (error) {
    console.error('Select photos error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.updatePhotoRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const photo = await Photo.findByPk(id);
    if (!photo) {
      return res.status(404).json({ message: '照片不存在' });
    }

    photo.remark = remark;
    await photo.save();
    res.json(photo);
  } catch (error) {
    console.error('Update photo remark error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findByPk(id);
    
    if (!photo) {
      return res.status(404).json({ message: '照片不存在' });
    }

    Object.assign(photo, req.body);
    await photo.save();
    res.json(photo);
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findByPk(id);
    
    if (!photo) {
      return res.status(404).json({ message: '照片不存在' });
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    if (photo.originalPath) {
      const originalFile = path.join(uploadDir, path.basename(photo.originalPath));
      if (fs.existsSync(originalFile)) {
        fs.unlinkSync(originalFile);
      }
    }

    await photo.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
