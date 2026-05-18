package com.example.resume.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.w3c.dom.Document;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfExportService {
    private final TemplateEngine templateEngine;

    public byte[] generatePdf(String templateName, Map<String, Object> variables) throws IOException {
        Context context = new Context();
        context.setVariables(variables);

        String htmlContent = templateEngine.process(templateName, context);

        org.jsoup.nodes.Document jsoupDoc = Jsoup.parse(htmlContent, "UTF-8");
        jsoupDoc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
        Document w3cDoc = new W3CDom().fromJsoup(jsoupDoc);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withW3cDocument(w3cDoc, "classpath:/templates/");
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        }
    }

    public byte[] generatePdfFromHtml(String htmlContent) throws IOException {
        org.jsoup.nodes.Document jsoupDoc = Jsoup.parse(htmlContent, "UTF-8");
        jsoupDoc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
        Document w3cDoc = new W3CDom().fromJsoup(jsoupDoc);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withW3cDocument(w3cDoc, "classpath:/templates/");
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        }
    }
}
