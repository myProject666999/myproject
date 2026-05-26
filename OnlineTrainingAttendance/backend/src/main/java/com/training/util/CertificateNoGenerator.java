package com.training.util;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;

import java.util.Date;

public class CertificateNoGenerator {

    private static final String PREFIX = "CERT";

    public static String generate() {
        String datePart = DateUtil.format(new Date(), "yyyyMMddHHmmss");
        String randomPart = RandomUtil.randomNumbers(6);
        return PREFIX + datePart + randomPart;
    }

    public static String generateVerifyCode() {
        return StrUtil.upperFirst(RandomUtil.randomString(16));
    }
}
