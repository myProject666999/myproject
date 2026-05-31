package com.smartdoor.utils;

import cn.hutool.core.util.RandomUtil;

public class PasswordGenerator {

    public static String generateLockPassword() {
        return RandomUtil.randomNumbers(6);
    }

    public static String generatePasswordNo() {
        return "PWD" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateBillNo() {
        return "BILL" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateContractNo() {
        return "CON" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateSettlementNo() {
        return "SET" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateRecordNo() {
        return "REC" + System.currentTimeMillis() + RandomUtil.randomNumbers(4);
    }

    public static String generateRequestId() {
        return "REQ" + System.currentTimeMillis() + RandomUtil.randomNumbers(8);
    }
}
