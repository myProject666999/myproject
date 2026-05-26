package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Certificate;
import com.training.repository.CertificateRepository;
import com.training.util.CertificateNoGenerator;
import com.training.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    @Value("${app.certificate.upload-path:./certificates/}")
    private String uploadPath;

    public Result<Certificate> issue(Certificate certificate) {
        if (certificate.getTrainingId() != null && certificate.getStudentId() != null
                && certificateRepository.existsByTrainingIdAndStudentId(certificate.getTrainingId(), certificate.getStudentId())) {
            return Result.fail("该学员已存在该培训的证书");
        }
        LocalDateTime now = LocalDateTime.now();
        if (certificate.getCertificateNo() == null) {
            certificate.setCertificateNo(CertificateNoGenerator.generate());
        }
        if (certificate.getVerifyCode() == null) {
            certificate.setVerifyCode(CertificateNoGenerator.generateVerifyCode());
        }
        if (certificate.getIssueDate() == null) {
            certificate.setIssueDate(LocalDate.now());
        }
        if (certificate.getIsValid() == null) {
            certificate.setIsValid(1);
        }
        certificate.setCreatedAt(now);
        certificate.setUpdatedAt(now);
        Certificate saved = certificateRepository.save(certificate);
        try {
            generateCertificateFiles(saved);
        } catch (Exception e) {
            log.error("生成证书文件失败", e);
        }
        return Result.success(saved);
    }

    private void generateCertificateFiles(Certificate certificate) throws Exception {
        String certNo = certificate.getCertificateNo();
        File dir = new File(uploadPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String imagePath = uploadPath + certNo + ".png";
        String pdfPath = uploadPath + certNo + ".pdf";
        generateCertificateImage(certificate, imagePath);
        generateCertificatePdf(certificate, pdfPath);
        certificate.setCertificateUrl("/certificates/" + certNo + ".png");
        certificate.setPdfUrl("/certificates/" + certNo + ".pdf");
        certificate.setUpdatedAt(LocalDateTime.now());
        certificateRepository.save(certificate);
    }

    private void generateCertificateImage(Certificate certificate, String imagePath) throws Exception {
        int width = 1200;
        int height = 800;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setColor(new Color(255, 253, 240));
        g2d.fillRect(0, 0, width, height);
        g2d.setColor(new Color(200, 160, 50));
        g2d.setStroke(new BasicStroke(10));
        g2d.drawRect(50, 50, width - 100, height - 100);
        g2d.setStroke(new BasicStroke(3));
        g2d.drawRect(65, 65, width - 130, height - 130);
        g2d.setColor(new Color(150, 100, 30));
        g2d.setFont(new Font("Microsoft YaHei", Font.BOLD, 48));
        FontMetrics fm = g2d.getFontMetrics();
        String title = "培训结业证书";
        int titleX = (width - fm.stringWidth(title)) / 2;
        g2d.drawString(title, titleX, 150);
        g2d.setColor(new Color(100, 100, 100));
        g2d.setFont(new Font("Microsoft YaHei", Font.PLAIN, 24));
        String certNo = "证书编号：" + certificate.getCertificateNo();
        g2d.drawString(certNo, 100, 200);
        g2d.setColor(new Color(50, 50, 50));
        g2d.setFont(new Font("Microsoft YaHei", Font.BOLD, 36));
        String studentName = certificate.getStudentName();
        g2d.drawString("兹证明", 150, 320);
        g2d.setColor(new Color(200, 50, 50));
        g2d.setFont(new Font("Microsoft YaHei", Font.BOLD, 48));
        g2d.drawString(studentName, 150, 400);
        g2d.setColor(new Color(50, 50, 50));
        g2d.setFont(new Font("Microsoft YaHei", Font.PLAIN, 28));
        String content1 = "参加了 " + certificate.getTrainingName() + " 培训课程，";
        g2d.drawString(content1, 150, 470);
        String content2 = "培训期间表现良好，成绩合格，特发此证。";
        g2d.drawString(content2, 150, 510);
        if (certificate.getInstructor() != null && !certificate.getInstructor().isEmpty()) {
            g2d.setFont(new Font("Microsoft YaHei", Font.PLAIN, 24));
            g2d.drawString("讲师：" + certificate.getInstructor(), 150, 570);
        }
        if (certificate.getTotalHours() != null) {
            g2d.drawString("培训学时：" + certificate.getTotalHours() + " 学时", 150, 610);
        }
        g2d.setFont(new Font("Microsoft YaHei", Font.PLAIN, 24));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
        String issueDate = "颁发日期：" + certificate.getIssueDate().format(formatter);
        g2d.drawString(issueDate, 150, 680);
        try {
            String verifyUrl = "https://verify.example.com?code=" + certificate.getVerifyCode();
            BufferedImage qrImage = QRCodeUtil.generateImage(verifyUrl, 150, 150);
            g2d.drawImage(qrImage, width - 250, height - 250, null);
            g2d.setFont(new Font("Microsoft YaHei", Font.PLAIN, 14));
            g2d.setColor(new Color(100, 100, 100));
            g2d.drawString("扫码验证证书真伪", width - 250, height - 80);
        } catch (Exception e) {
            log.warn("生成证书二维码失败", e);
        }
        g2d.dispose();
        ImageIO.write(image, "png", new File(imagePath));
    }

    private void generateCertificatePdf(Certificate certificate, String pdfPath) throws Exception {
        com.itextpdf.text.Document document = new com.itextpdf.text.Document(
                new com.itextpdf.text.Rectangle(1200, 800), 50, 50, 50, 50);
        try {
            com.itextpdf.text.pdf.PdfWriter writer = com.itextpdf.text.pdf.PdfWriter.getInstance(
                    document, new FileOutputStream(pdfPath));
            document.open();
            com.itextpdf.text.pdf.BaseFont bfChinese = com.itextpdf.text.pdf.BaseFont.createFont(
                    "STSong-Light", "UniGB-UCS2-H", com.itextpdf.text.pdf.BaseFont.NOT_EMBEDDED);
            com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(bfChinese, 48, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Font nameFont = new com.itextpdf.text.Font(bfChinese, 48, com.itextpdf.text.Font.BOLD, new com.itextpdf.text.BaseColor(200, 50, 50));
            com.itextpdf.text.Font contentFont = new com.itextpdf.text.Font(bfChinese, 28, com.itextpdf.text.Font.NORMAL);
            com.itextpdf.text.Font smallFont = new com.itextpdf.text.Font(bfChinese, 24, com.itextpdf.text.Font.NORMAL);
            com.itextpdf.text.Paragraph title = new com.itextpdf.text.Paragraph("培训结业证书", titleFont);
            title.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(30f);
            document.add(title);
            com.itextpdf.text.Paragraph certNo = new com.itextpdf.text.Paragraph(
                    "证书编号：" + certificate.getCertificateNo(), smallFont);
            certNo.setSpacingAfter(50f);
            document.add(certNo);
            com.itextpdf.text.Paragraph p1 = new com.itextpdf.text.Paragraph("兹证明", contentFont);
            p1.setSpacingAfter(10f);
            document.add(p1);
            com.itextpdf.text.Paragraph name = new com.itextpdf.text.Paragraph(certificate.getStudentName(), nameFont);
            name.setSpacingAfter(15f);
            document.add(name);
            com.itextpdf.text.Paragraph p2 = new com.itextpdf.text.Paragraph(
                    "参加了 " + certificate.getTrainingName() + " 培训课程，", contentFont);
            p2.setSpacingAfter(10f);
            document.add(p2);
            com.itextpdf.text.Paragraph p3 = new com.itextpdf.text.Paragraph(
                    "培训期间表现良好，成绩合格，特发此证。", contentFont);
            p3.setSpacingAfter(30f);
            document.add(p3);
            if (certificate.getInstructor() != null && !certificate.getInstructor().isEmpty()) {
                com.itextpdf.text.Paragraph instructor = new com.itextpdf.text.Paragraph(
                        "讲师：" + certificate.getInstructor(), smallFont);
                instructor.setSpacingAfter(10f);
                document.add(instructor);
            }
            if (certificate.getTotalHours() != null) {
                com.itextpdf.text.Paragraph hours = new com.itextpdf.text.Paragraph(
                        "培训学时：" + certificate.getTotalHours() + " 学时", smallFont);
                hours.setSpacingAfter(10f);
                document.add(hours);
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
            com.itextpdf.text.Paragraph date = new com.itextpdf.text.Paragraph(
                    "颁发日期：" + certificate.getIssueDate().format(formatter), smallFont);
            date.setSpacingAfter(30f);
            document.add(date);
            try {
                String verifyUrl = "https://verify.example.com?code=" + certificate.getVerifyCode();
                byte[] qrBytes = QRCodeUtil.generateBytes(verifyUrl, 150, 150, "png");
                com.itextpdf.text.Image qrImage = com.itextpdf.text.Image.getInstance(qrBytes);
                qrImage.setAbsolutePosition(900, 100);
                qrImage.scaleToFit(150, 150);
                document.add(qrImage);
                com.itextpdf.text.Paragraph qrText = new com.itextpdf.text.Paragraph(
                        "扫码验证证书真伪", new com.itextpdf.text.Font(bfChinese, 14));
                qrText.setAlignment(com.itextpdf.text.Element.ALIGN_RIGHT);
                document.add(qrText);
            } catch (Exception e) {
                log.warn("PDF中添加二维码失败", e);
            }
        } finally {
            document.close();
        }
    }

    public Result<String> getCertificateImageBase64(Long id) {
        Optional<Certificate> optional = certificateRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        Certificate certificate = optional.get();
        try {
            String imagePath = uploadPath + certificate.getCertificateNo() + ".png";
            File file = new File(imagePath);
            if (!file.exists()) {
                generateCertificateImage(certificate, imagePath);
            }
            BufferedImage image = ImageIO.read(file);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            String base64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
            return Result.success(base64);
        } catch (Exception e) {
            log.error("获取证书图片失败", e);
            return Result.fail("获取证书图片失败");
        }
    }

    public Result<String> delete(Long id) {
        if (!certificateRepository.existsById(id)) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        certificateRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<Certificate> update(Certificate certificate) {
        if (certificate.getId() == null || !certificateRepository.existsById(certificate.getId())) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        Certificate db = certificateRepository.findById(certificate.getId()).get();
        if (certificate.getStudentName() != null) {
            db.setStudentName(certificate.getStudentName());
        }
        if (certificate.getTrainingName() != null) {
            db.setTrainingName(certificate.getTrainingName());
        }
        if (certificate.getInstructor() != null) {
            db.setInstructor(certificate.getInstructor());
        }
        if (certificate.getStartDate() != null) {
            db.setStartDate(certificate.getStartDate());
        }
        if (certificate.getEndDate() != null) {
            db.setEndDate(certificate.getEndDate());
        }
        if (certificate.getTotalHours() != null) {
            db.setTotalHours(certificate.getTotalHours());
        }
        if (certificate.getIssueDate() != null) {
            db.setIssueDate(certificate.getIssueDate());
        }
        if (certificate.getCertificateUrl() != null) {
            db.setCertificateUrl(certificate.getCertificateUrl());
        }
        if (certificate.getPdfUrl() != null) {
            db.setPdfUrl(certificate.getPdfUrl());
        }
        if (certificate.getIsValid() != null) {
            db.setIsValid(certificate.getIsValid());
        }
        db.setUpdatedAt(LocalDateTime.now());
        return Result.success(certificateRepository.save(db));
    }

    public Result<Certificate> getById(Long id) {
        Optional<Certificate> optional = certificateRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<Certificate> getByCertificateNo(String certificateNo) {
        Optional<Certificate> optional = certificateRepository.findByCertificateNo(certificateNo);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<Certificate> verify(String verifyCode) {
        Optional<Certificate> optional = certificateRepository.findByVerifyCode(verifyCode);
        if (!optional.isPresent()) {
            return Result.fail("证书不存在或验证码错误");
        }
        Certificate c = optional.get();
        if (c.getIsValid() == null || c.getIsValid() == 0) {
            return Result.fail("证书已吊销");
        }
        return Result.success(c);
    }

    public Result<List<Certificate>> listByTraining(Long trainingId) {
        return Result.success(certificateRepository.findByTrainingId(trainingId));
    }

    public Result<List<Certificate>> listByStudent(Long studentId) {
        return Result.success(certificateRepository.findByStudentId(studentId));
    }

    public Result<List<Certificate>> list() {
        return Result.success(certificateRepository.findAll());
    }

    public Result<String> revoke(Long id, String reason) {
        Optional<Certificate> optional = certificateRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        Certificate c = optional.get();
        c.setIsValid(0);
        c.setRevokedAt(LocalDateTime.now());
        c.setRevokedReason(reason);
        c.setUpdatedAt(LocalDateTime.now());
        certificateRepository.save(c);
        return Result.success("吊销成功");
    }
}
