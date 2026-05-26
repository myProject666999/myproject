package com.training.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class QRCodeUtil {

    private static final int DEFAULT_WIDTH = 300;
    private static final int DEFAULT_HEIGHT = 300;
    private static final String DEFAULT_FORMAT = "png";

    public static BufferedImage generateImage(String content) throws Exception {
        return generateImage(content, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    public static BufferedImage generateImage(String content, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    public static byte[] generateBytes(String content) throws Exception {
        return generateBytes(content, DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_FORMAT);
    }

    public static byte[] generateBytes(String content, int width, int height, String format) throws Exception {
        BufferedImage image = generateImage(content, width, height);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, format, out);
        return out.toByteArray();
    }

    public static void writeToPath(String content, Path path) throws Exception {
        writeToPath(content, path, DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_FORMAT);
    }

    public static void writeToPath(String content, Path path, int width, int height, String format) throws Exception {
        BufferedImage image = generateImage(content, width, height);
        ImageIO.write(image, format, path.toFile());
    }

    public static void writeToStream(String content, OutputStream out) throws Exception {
        writeToStream(content, out, DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_FORMAT);
    }

    public static void writeToStream(String content, OutputStream out, int width, int height, String format) throws Exception {
        BufferedImage image = generateImage(content, width, height);
        ImageIO.write(image, format, out);
    }
}
