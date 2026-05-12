const { ServicePhoto, Booking } = require('../models/associations');
const { success, error } = require('../utils/response');

async function getBookingPhotos(req, res, next) {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ where: { id: bookingId, userId } });
    if (!booking) {
      return res.status(404).json(error('预约不存在'));
    }

    const photos = await ServicePhoto.findAll({
      where: { bookingId },
      order: [['createdAt', 'DESC']],
    });

    res.json(success(photos));
  } catch (err) {
    next(err);
  }
}

async function uploadBeforePhoto(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { beforePhotoUrl, remark } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ where: { id: bookingId, userId } });
    if (!booking) {
      return res.status(404).json(error('预约不存在'));
    }

    let photo = await ServicePhoto.findOne({ where: { bookingId } });
    if (!photo) {
      photo = await ServicePhoto.create({
        bookingId,
        beforePhotoUrl,
        remark: remark || '',
      });
    } else {
      photo.beforePhotoUrl = beforePhotoUrl;
      if (remark) photo.remark = remark;
      await photo.save();
    }

    res.json(success(photo, '服务前照片上传成功'));
  } catch (err) {
    next(err);
  }
}

async function uploadAfterPhoto(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { afterPhotoUrl, remark } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ where: { id: bookingId, userId } });
    if (!booking) {
      return res.status(404).json(error('预约不存在'));
    }

    let photo = await ServicePhoto.findOne({ where: { bookingId } });
    if (!photo) {
      return res.status(400).json(error('请先上传服务前照片'));
    }

    photo.afterPhotoUrl = afterPhotoUrl;
    if (remark) photo.remark = remark;
    await photo.save();

    res.json(success(photo, '服务后照片上传成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBookingPhotos,
  uploadBeforePhoto,
  uploadAfterPhoto,
};
