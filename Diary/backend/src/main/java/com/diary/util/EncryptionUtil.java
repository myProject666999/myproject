package com.diary.util;

import cn.hutool.crypto.SecureUtil;
import cn.hutool.crypto.symmetric.AES;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class EncryptionUtil {

    private static String secret;

    @Value("${diary.encryption.secret}")
    public void setSecret(String secret) {
        EncryptionUtil.secret = secret;
    }

    private static AES getAes() {
        byte[] key = SecureUtil.md5(secret).getBytes(StandardCharsets.UTF_8);
        return SecureUtil.aes(key);
    }

    public static String encrypt(String content) {
        if (content == null) {
            return null;
        }
        return getAes().encryptHex(content);
    }

    public static String decrypt(String encryptedContent) {
        if (encryptedContent == null) {
            return null;
        }
        return getAes().decryptStr(encryptedContent);
    }
}
