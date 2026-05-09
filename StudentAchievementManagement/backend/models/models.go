package models

type Student struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentNo string `gorm:"uniqueIndex;not null;size:50" json:"studentNo"`
	Name      string `gorm:"not null;size:100" json:"name"`
	Gender    string `gorm:"size:10" json:"gender"`
	BirthDate string `gorm:"size:20" json:"birthDate"`
	Major     string `gorm:"size:100" json:"major"`
	Class     string `gorm:"size:50" json:"class"`
}

type Course struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	CourseNo string `gorm:"uniqueIndex;not null;size:50" json:"courseNo"`
	Name     string `gorm:"not null;size:100" json:"name"`
	Teacher  string `gorm:"size:100" json:"teacher"`
	Credits  float64 `gorm:"not null" json:"credits"`
	Hours    int    `json:"hours"`
}

type Grade struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentNo string  `gorm:"index;not null;size:50" json:"studentNo"`
	CourseNo  string  `gorm:"index;not null;size:50" json:"courseNo"`
	Score     float64 `gorm:"not null" json:"score"`
	ExamDate  string  `gorm:"size:20" json:"examDate"`
}
