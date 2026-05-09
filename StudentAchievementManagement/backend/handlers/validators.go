package handlers

import (
	"errors"
	"student-management/database"
	"student-management/models"

	"gorm.io/gorm"
)

var (
	ErrStudentNotFound = errors.New("student not found")
	ErrCourseNotFound  = errors.New("course not found")
	ErrHasGrades       = errors.New("record has associated grades, cannot delete")
)

func StudentExists(studentNo string) (bool, error) {
	var count int64
	result := database.DB.Model(&models.Student{}).Where("student_no = ?", studentNo).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func CourseExists(courseNo string) (bool, error) {
	var count int64
	result := database.DB.Model(&models.Course{}).Where("course_no = ?", courseNo).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func StudentHasGrades(studentNo string) (bool, error) {
	var count int64
	result := database.DB.Model(&models.Grade{}).Where("student_no = ?", studentNo).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func CourseHasGrades(courseNo string) (bool, error) {
	var count int64
	result := database.DB.Model(&models.Grade{}).Where("course_no = ?", courseNo).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func IsForeignKeyError(err error) bool {
	if err == nil {
		return false
	}
	return errors.Is(err, gorm.ErrForeignKeyViolated)
}
