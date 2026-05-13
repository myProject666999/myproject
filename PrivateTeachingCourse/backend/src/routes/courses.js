const express = require('express');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  cancelCourse
} = require('../controllers/courseController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authenticateToken, requireRole(['coach', 'admin']), createCourse);
router.put('/:id', authenticateToken, requireRole(['coach', 'admin']), updateCourse);
router.delete('/:id', authenticateToken, requireRole(['coach', 'admin']), cancelCourse);

module.exports = router;
