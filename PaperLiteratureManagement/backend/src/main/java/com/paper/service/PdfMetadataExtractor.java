package com.paper.service;

import com.paper.dto.PaperRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PdfMetadataExtractor {

    public PaperRequest extractMetadata(MultipartFile file) throws IOException {
        PaperRequest request = new PaperRequest();
        
        try (InputStream is = file.getOriginalFilename() != null ? file.getInputStream() : null;
             PDDocument document = PDDocument.load(is)) {
            
            PDDocumentInformation info = document.getDocumentInformation();
            
            String title = info.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = extractTitleFromContent(document);
            }
            if (title == null || title.trim().isEmpty()) {
                String originalName = file.getOriginalFilename();
                if (originalName != null) {
                    title = originalName.replace(".pdf", "").replace("_", " ").replace("-", " ");
                }
            }
            request.setTitle(title);
            
            String authors = info.getAuthor();
            if (authors == null || authors.trim().isEmpty()) {
                authors = extractAuthorsFromContent(document);
            }
            request.setAuthors(authors);
            
            request.setKeywords(info.getKeywords());
            
            String subject = info.getSubject();
            if (subject != null && !subject.trim().isEmpty()) {
                request.setAbstractText(subject);
            }
            
            Integer year = extractYear(info);
            if (year == null) {
                year = extractYearFromContent(document);
            }
            request.setPublicationYear(year);
        }
        
        return request;
    }
    
    private String extractTitleFromContent(PDDocument document) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(1);
        stripper.setEndPage(1);
        String firstPage = stripper.getText(document);
        
        String[] lines = firstPage.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.length() > 10 && line.length() < 200 && !line.matches(".*\\d{4}.*")) {
                if (line.matches("^[A-Z][a-zA-Z0-9\\s,.:;\\-()'\"&]+$")) {
                    return line;
                }
            }
        }
        return null;
    }
    
    private String extractAuthorsFromContent(PDDocument document) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(1);
        stripper.setEndPage(2);
        String content = stripper.getText(document);
        
        Pattern emailPattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher emailMatcher = emailPattern.matcher(content);
        if (emailMatcher.find()) {
            String email = emailMatcher.group();
            String prefix = email.split("@")[0];
            String[] parts = prefix.split("[._]");
            if (parts.length >= 2) {
                StringBuilder name = new StringBuilder();
                for (String part : parts) {
                    if (!part.isEmpty()) {
                        if (name.length() > 0) name.append(" ");
                        name.append(Character.toUpperCase(part.charAt(0)));
                        if (part.length() > 1) {
                            name.append(part.substring(1).toLowerCase());
                        }
                    }
                }
                return name.toString();
            }
        }
        
        Pattern authorPattern = Pattern.compile("(?:by|By|BY)\\s+([A-Z][a-z]+\\s+[A-Z][a-z]+(?:\\s+and\\s+[A-Z][a-z]+\\s+[A-Z][a-z]+)*)");
        Matcher authorMatcher = authorPattern.matcher(content);
        if (authorMatcher.find()) {
            return authorMatcher.group(1);
        }
        
        return null;
    }
    
    private Integer extractYear(PDDocumentInformation info) {
        if (info.getCreationDate() != null) {
            return info.getCreationDate().get(Calendar.YEAR);
        }
        return null;
    }
    
    private Integer extractYearFromContent(PDDocument document) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(1);
        stripper.setEndPage(2);
        String content = stripper.getText(document);
        
        Pattern yearPattern = Pattern.compile("\\b(19|20)\\d{2}\\b");
        Matcher matcher = yearPattern.matcher(content);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group());
        }
        return null;
    }
}
