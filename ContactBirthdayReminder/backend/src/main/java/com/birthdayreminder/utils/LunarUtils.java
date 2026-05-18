package com.birthdayreminder.utils;

import cn.threeten.lunar.LunarDate;
import cn.threeten.lunar.SolarDate;

import java.time.LocalDate;

public class LunarUtils {

    public static LocalDate lunarToSolar(int lunarYear, int lunarMonth, int lunarDay, boolean isLeap) {
        LunarDate lunarDate = LunarDate.of(lunarYear, lunarMonth, lunarDay, isLeap);
        SolarDate solarDate = lunarDate.toSolar();
        return LocalDate.of(solarDate.getYear(), solarDate.getMonth(), solarDate.getDay());
    }

    public static LunarDate solarToLunar(LocalDate solarDate) {
        SolarDate solar = SolarDate.of(solarDate.getYear(), solarDate.getMonthValue(), solarDate.getDayOfMonth());
        return solar.toLunar();
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
            LunarDate lunarBirthday = solarToLunar(birthday);
            int currentYear = today.getYear();
            for (int year = currentYear; year < currentYear + 2; year++) {
                try {
                    LocalDate solarBirthday = lunarToSolar(year, lunarBirthday.getMonth(), lunarBirthday.getDay(), lunarBirthday.isLeap());
                    if (!solarBirthday.isBefore(today)) {
                        return solarBirthday;
                    }
                } catch (Exception e) {
                    LocalDate solarBirthday = lunarToSolar(year, lunarBirthday.getMonth(), lunarBirthday.getDay(), false);
                    if (!solarBirthday.isBefore(today)) {
                        return solarBirthday;
                    }
                }
            }
            return lunarToSolar(currentYear + 1, lunarBirthday.getMonth(), lunarBirthday.getDay(), false);
        }
    }

    public static long getDaysUntilBirthday(LocalDate birthday, int calendarType) {
        LocalDate nextBirthday = getNextBirthday(birthday, calendarType);
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextBirthday);
    }
}
