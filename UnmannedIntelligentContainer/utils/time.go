package utils

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"strings"
	"time"
)

type CustomTime time.Time

const (
	TimeFormatStandard = "2006-01-02 15:04:05"
	TimeFormatDate     = "2006-01-02"
	TimeFormatRFC3339  = time.RFC3339
)

var timeFormats = []string{
	TimeFormatStandard,
	TimeFormatDate,
	TimeFormatRFC3339,
	"2006-01-02T15:04:05",
	"2006/01/02 15:04:05",
	"2006/01/02",
}

func (ct *CustomTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" || string(data) == `""` {
		*ct = CustomTime(time.Time{})
		return nil
	}

	str := strings.Trim(string(data), `"`)

	var t time.Time
	var err error

	for _, format := range timeFormats {
		t, err = time.ParseInLocation(format, str, time.Local)
		if err == nil {
			*ct = CustomTime(t)
			return nil
		}
	}

	return fmt.Errorf("parsing time %q as supported formats: %v", str, timeFormats)
}

func (ct CustomTime) MarshalJSON() ([]byte, error) {
	t := time.Time(ct)
	if t.IsZero() {
		return []byte(`""`), nil
	}
	return []byte(fmt.Sprintf(`"%s"`, t.Format(TimeFormatStandard))), nil
}

func (ct CustomTime) Value() (driver.Value, error) {
	t := time.Time(ct)
	if t.IsZero() {
		return nil, nil
	}
	return t, nil
}

func (ct *CustomTime) Scan(value interface{}) error {
	if value == nil {
		*ct = CustomTime(time.Time{})
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		*ct = CustomTime(v)
		return nil
	case []byte:
		return ct.UnmarshalJSON(v)
	case string:
		return ct.UnmarshalJSON([]byte(fmt.Sprintf(`"%s"`, v)))
	default:
		return errors.New("unsupported data type for CustomTime")
	}
}

func (ct CustomTime) String() string {
	t := time.Time(ct)
	if t.IsZero() {
		return ""
	}
	return t.Format(TimeFormatStandard)
}

func (ct CustomTime) ToTime() time.Time {
	return time.Time(ct)
}

func (ct CustomTime) IsZero() bool {
	return time.Time(ct).IsZero()
}
