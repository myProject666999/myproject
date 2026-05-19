package com.birthdayreminder.utils;

import com.nlf.calendar.Lunar;
import com.nlf.calendar.Solar;

import java.time.LocalDate;

public class LunarUtils {

    public static LocalDate lunarToSolar(int lunarYear, int lunarMonth, int lunarDay, boolean isLeap) {
        Lunar lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
        Solar solar = lunar.getSolar();
        return LocalDate.of(solar.getYear(), solar.getMonth(), solar.getDay());
    }

    public static Lunar solarToLunar(LocalDate solarDate) {
        Solar solar = Solar.fromYmd(solarDate.getYear(), solarDate.getMonthValue(), solarDate.getDayOfMonth());
        return solar.getLunar();
    }

    public static LocalDate getNextBirthday(LocalDate birthday, int calendarType) {
        LocalDate today = LocalDate.now();
        if (calendarType == 1) {
            LocalDate thisYearBirthday = LocalDate.of(today.getYear(), birthday.getMonth(), birthday.getDayOfMonth());
            if (!thisYearBirthday.isBefore(today)) {
                return thisYearBirthday;
            }
            return LocalDate.of(today.getYear() + 1, birthday.getMonth(), birthday.getDayOfMonth());
        } else {
            Lunar lunarBirthday = solarToLunar(birthday);
            int lunarMonth = lunarBirthday.getMonth();
            int lunarDay = lunarBirthday.getDay();
            int currentYear = today.getYear();
            for (int year = currentYear; year < currentYear + 2; year++) {
                try {
                    LocalDate solarBirthday = lunarToSolar(year, lunarMonth, lunarDay, false);
                    if (!solarBirthday.isBefore(today)) {
                        return solarBirthday;
                    }
                } catch (Exception e) {
                }
            }
            return lunarToSolar(currentYear + 1, lunarMonth, lunarDay, false);
        }
    }

    public static long getDaysUntilBirthday(LocalDate birthday, int calendarType) {
        LocalDate nextBirthday = getNextBirthday(birthday, calendarType);
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextBirthday);
    }
}
