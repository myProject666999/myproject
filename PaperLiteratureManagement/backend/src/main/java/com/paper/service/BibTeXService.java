package com.paper.service;

import com.paper.entity.Paper;
import com.paper.entity.Tag;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BibTeXService {

    public String exportToBibTeX(Paper paper) {
        StringBuilder sb = new StringBuilder();
        String key = generateBibTeXKey(paper);
        
        sb.append("@article{").append(key).append(",\n");
        
        if (paper.getTitle() != null) {
            sb.append("  title = {").append(escapeBibTeX(paper.getTitle())).append("},\n");
        }
        if (paper.getAuthors() != null) {
            sb.append("  author = {").append(escapeBibTeX(paper.getAuthors())).append("},\n");
        }
        if (paper.getPublicationYear() != null) {
            sb.append("  year = {").append(paper.getPublicationYear()).append("},\n");
        }
        if (paper.getJournal() != null) {
            sb.append("  journal = {").append(escapeBibTeX(paper.getJournal())).append("},\n");
        }
        if (paper.getVolume() != null) {
            sb.append("  volume = {").append(paper.getVolume()).append("},\n");
        }
        if (paper.getIssue() != null) {
            sb.append("  number = {").append(paper.getIssue()).append("},\n");
        }
        if (paper.getPages() != null) {
            sb.append("  pages = {").append(paper.getPages()).append("},\n");
        }
        if (paper.getDoi() != null) {
            sb.append("  doi = {").append(paper.getDoi()).append("},\n");
        }
        if (paper.getKeywords() != null) {
            sb.append("  keywords = {").append(escapeBibTeX(paper.getKeywords())).append("},\n");
        }
        if (paper.getAbstractText() != null) {
            sb.append("  abstract = {").append(escapeBibTeX(paper.getAbstractText())).append("},\n");
        }
        if (paper.getTags() != null && !paper.getTags().isEmpty()) {
            String tags = paper.getTags().stream()
                    .map(Tag::getName)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            sb.append("  tags = {").append(escapeBibTeX(tags)).append("},\n");
        }
        
        sb.append("}\n");
        return sb.toString();
    }

    public String exportMultipleToBibTeX(List<Paper> papers) {
        StringBuilder sb = new StringBuilder();
        for (Paper paper : papers) {
            sb.append(exportToBibTeX(paper));
            sb.append("\n");
        }
        return sb.toString();
    }

    private String generateBibTeXKey(Paper paper) {
        String author = "paper";
        if (paper.getAuthors() != null && !paper.getAuthors().trim().isEmpty()) {
            String[] authors = paper.getAuthors().split("[,;]");
            if (authors.length > 0) {
                String firstAuthor = authors[0].trim();
                String[] nameParts = firstAuthor.split("\\s+");
                if (nameParts.length > 0) {
                    author = nameParts[nameParts.length - 1].toLowerCase();
                }
            }
        }
        
        String year = paper.getPublicationYear() != null ? String.valueOf(paper.getPublicationYear()) : "0000";
        
        String titlePart = "";
        if (paper.getTitle() != null && !paper.getTitle().trim().isEmpty()) {
            String[] titleWords = paper.getTitle().split("\\s+");
            for (String word : titleWords) {
                if (!word.matches("(?i)(a|an|the|of|and|in|on|for|with|to|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|shall|can|need|dare|ought|used)")) {
                    titlePart = word.toLowerCase().replaceAll("[^a-zA-Z]", "");
                    if (titlePart.length() > 0) {
                        break;
                    }
                }
            }
        }
        
        return author + year + titlePart;
    }

    private String escapeBibTeX(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                   .replace("{", "\\{")
                   .replace("}", "\\}")
                   .replace("&", "\\&")
                   .replace("%", "\\%")
                   .replace("$", "\\$")
                   .replace("#", "\\#")
                   .replace("_", "\\_");
    }
}
