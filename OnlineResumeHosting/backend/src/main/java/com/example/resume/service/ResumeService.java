package com.example.resume.service;

import com.example.resume.entity.*;
import com.example.resume.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final ResumeEducationRepository educationRepository;
    private final ResumeExperienceRepository experienceRepository;
    private final ResumeProjectRepository projectRepository;
    private final ResumeSkillRepository skillRepository;
    private final ShortLinkRepository shortLinkRepository;
    private final VisitLogRepository visitLogRepository;
    private final PdfExportService pdfExportService;

    private static final String SHORT_LINK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SHORT_LINK_LENGTH = 8;
    private final SecureRandom secureRandom = new SecureRandom();

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    public List<Resume> getPublicResumes() {
        return resumeRepository.findByIsPublicTrue();
    }

    public Optional<Resume> getResumeById(Long id) {
        return resumeRepository.findById(id).map(this::loadResumeDetails);
    }

    private Resume loadResumeDetails(Resume resume) {
        resume.setEducations(educationRepository.findByResumeIdOrderBySortOrderAsc(resume.getId()));
        resume.setExperiences(experienceRepository.findByResumeIdOrderBySortOrderAsc(resume.getId()));
        resume.setProjects(projectRepository.findByResumeIdOrderBySortOrderAsc(resume.getId()));
        resume.setSkills(skillRepository.findByResumeIdOrderBySortOrderAsc(resume.getId()));
        return resume;
    }

    public Optional<Resume> getResumeByIdAndUserId(Long id, Long userId) {
        return resumeRepository.findByIdAndUserId(id, userId);
    }

    @Transactional
    public Resume createResume(Resume resume) {
        Resume savedResume = resumeRepository.save(resume);

        if (resume.getEducations() != null) {
            for (ResumeEducation education : resume.getEducations()) {
                education.setResumeId(savedResume.getId());
                educationRepository.save(education);
            }
        }

        if (resume.getExperiences() != null) {
            for (ResumeExperience experience : resume.getExperiences()) {
                experience.setResumeId(savedResume.getId());
                experienceRepository.save(experience);
            }
        }

        if (resume.getProjects() != null) {
            for (ResumeProject project : resume.getProjects()) {
                project.setResumeId(savedResume.getId());
                projectRepository.save(project);
            }
        }

        if (resume.getSkills() != null) {
            for (ResumeSkill skill : resume.getSkills()) {
                skill.setResumeId(savedResume.getId());
                skillRepository.save(skill);
            }
        }

        return savedResume;
    }

    @Transactional
    public Resume updateResume(Long id, Resume resumeDetails) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (resumeDetails.getTitle() != null) resume.setTitle(resumeDetails.getTitle());
        if (resumeDetails.getName() != null) resume.setName(resumeDetails.getName());
        if (resumeDetails.getGender() != null) resume.setGender(resumeDetails.getGender());
        if (resumeDetails.getPhone() != null) resume.setPhone(resumeDetails.getPhone());
        if (resumeDetails.getEmail() != null) resume.setEmail(resumeDetails.getEmail());
        if (resumeDetails.getLocation() != null) resume.setLocation(resumeDetails.getLocation());
        if (resumeDetails.getAvatarUrl() != null) resume.setAvatarUrl(resumeDetails.getAvatarUrl());
        if (resumeDetails.getSummary() != null) resume.setSummary(resumeDetails.getSummary());
        if (resumeDetails.getTemplateId() != null) resume.setTemplateId(resumeDetails.getTemplateId());
        if (resumeDetails.getIsPublic() != null) resume.setIsPublic(resumeDetails.getIsPublic());

        if (resumeDetails.getEducations() != null) {
            educationRepository.deleteByResumeId(id);
            for (ResumeEducation education : resumeDetails.getEducations()) {
                education.setId(null);
                education.setResumeId(id);
                educationRepository.save(education);
            }
        }

        if (resumeDetails.getExperiences() != null) {
            experienceRepository.deleteByResumeId(id);
            for (ResumeExperience experience : resumeDetails.getExperiences()) {
                experience.setId(null);
                experience.setResumeId(id);
                experienceRepository.save(experience);
            }
        }

        if (resumeDetails.getProjects() != null) {
            projectRepository.deleteByResumeId(id);
            for (ResumeProject project : resumeDetails.getProjects()) {
                project.setId(null);
                project.setResumeId(id);
                projectRepository.save(project);
            }
        }

        if (resumeDetails.getSkills() != null) {
            skillRepository.deleteByResumeId(id);
            for (ResumeSkill skill : resumeDetails.getSkills()) {
                skill.setId(null);
                skill.setResumeId(id);
                skillRepository.save(skill);
            }
        }

        return resumeRepository.save(resume);
    }

    @Transactional
    public void deleteResume(Long id) {
        educationRepository.deleteByResumeId(id);
        experienceRepository.deleteByResumeId(id);
        projectRepository.deleteByResumeId(id);
        skillRepository.deleteByResumeId(id);
        visitLogRepository.deleteByResumeId(id);
        resumeRepository.deleteById(id);
    }

    @Transactional
    public void incrementViewCount(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        resume.setViewCount(resume.getViewCount() + 1);
        resumeRepository.save(resume);
    }

    public ShortLink createShortLink(Long resumeId, String originalUrl, LocalDateTime expireAt) {
        String shortCode = generateUniqueShortCode();

        ShortLink shortLink = new ShortLink();
        shortLink.setResumeId(resumeId);
        shortLink.setShortCode(shortCode);
        shortLink.setOriginalUrl(originalUrl);
        shortLink.setExpireAt(expireAt);

        return shortLinkRepository.save(shortLink);
    }

    private String generateUniqueShortCode() {
        String shortCode;
        do {
            shortCode = generateShortCode();
        } while (shortLinkRepository.existsByShortCode(shortCode));
        return shortCode;
    }

    private String generateShortCode() {
        StringBuilder sb = new StringBuilder(SHORT_LINK_LENGTH);
        for (int i = 0; i < SHORT_LINK_LENGTH; i++) {
            sb.append(SHORT_LINK_CHARS.charAt(secureRandom.nextInt(SHORT_LINK_CHARS.length())));
        }
        return sb.toString();
    }

    public Optional<ShortLink> getShortLink(String shortCode) {
        return shortLinkRepository.findValidShortLink(shortCode, LocalDateTime.now());
    }

    public VisitLog recordVisit(Long resumeId, HttpServletRequest request) {
        VisitLog visitLog = new VisitLog();
        visitLog.setResumeId(resumeId);
        visitLog.setIp(getClientIp(request));
        visitLog.setUserAgent(request.getHeader("User-Agent"));
        visitLog.setReferer(request.getHeader("Referer"));
        return visitLogRepository.save(visitLog);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    public List<VisitLog> getVisitLogs(Long resumeId) {
        return visitLogRepository.findByResumeIdOrderByVisitedAtDesc(resumeId);
    }

    public Long getVisitCount(Long resumeId, LocalDateTime start, LocalDateTime end) {
        return visitLogRepository.countByResumeIdAndVisitedAtBetween(resumeId, start, end);
    }

    public byte[] exportResumeToPdf(Long resumeId) throws Exception {
        Resume resume = getResumeById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        String htmlContent = generateResumeHtml(resume);
        return pdfExportService.generatePdfFromHtml(htmlContent);
    }

    private String generateResumeHtml(Resume resume) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\">");
        html.append("<title>").append(resume.getTitle()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 40px; color: #333; }");
        html.append("h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }");
        html.append("h2 { color: #34495e; margin-top: 20px; }");
        html.append(".section { margin-bottom: 20px; }");
        html.append(".item { margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #3498db; }");
        html.append(".header { text-align: center; margin-bottom: 30px; }");
        html.append(".contact { font-size: 14px; color: #666; }");
        html.append("</style></head><body>");

        html.append("<div class=\"header\">");
        html.append("<h1>").append(resume.getName() != null ? resume.getName() : "").append("</h1>");
        html.append("<div class=\"contact\">");
        if (resume.getPhone() != null) html.append(resume.getPhone()).append(" | ");
        if (resume.getEmail() != null) html.append(resume.getEmail()).append(" | ");
        if (resume.getLocation() != null) html.append(resume.getLocation());
        html.append("</div>");
        html.append("</div>");

        if (resume.getSummary() != null) {
            html.append("<div class=\"section\"><h2>个人简介</h2>");
            html.append("<p>").append(resume.getSummary()).append("</p></div>");
        }

        if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
            html.append("<div class=\"section\"><h2>教育经历</h2>");
            for (ResumeEducation edu : resume.getEducations()) {
                html.append("<div class=\"item\">");
                html.append("<strong>").append(edu.getSchool()).append("</strong>");
                if (edu.getDegree() != null || edu.getMajor() != null) {
                    html.append(" - ");
                    if (edu.getDegree() != null) html.append(edu.getDegree());
                    if (edu.getMajor() != null) html.append(" ").append(edu.getMajor());
                }
                html.append("<br>");
                if (edu.getStartDate() != null) html.append(edu.getStartDate());
                if (edu.getEndDate() != null) html.append(" - ").append(edu.getEndDate());
                if (edu.getDescription() != null) html.append("<p>").append(edu.getDescription()).append("</p>");
                html.append("</div>");
            }
            html.append("</div>");
        }

        if (resume.getExperiences() != null && !resume.getExperiences().isEmpty()) {
            html.append("<div class=\"section\"><h2>工作经历</h2>");
            for (ResumeExperience exp : resume.getExperiences()) {
                html.append("<div class=\"item\">");
                html.append("<strong>").append(exp.getCompany()).append("</strong>");
                if (exp.getPosition() != null) html.append(" - ").append(exp.getPosition());
                html.append("<br>");
                if (exp.getStartDate() != null) html.append(exp.getStartDate());
                if (exp.getEndDate() != null) html.append(" - ").append(exp.getEndDate());
                if (exp.getIsCurrent() != null && exp.getIsCurrent()) html.append(" (至今)");
                if (exp.getDescription() != null) html.append("<p>").append(exp.getDescription()).append("</p>");
                html.append("</div>");
            }
            html.append("</div>");
        }

        if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
            html.append("<div class=\"section\"><h2>项目经验</h2>");
            for (ResumeProject proj : resume.getProjects()) {
                html.append("<div class=\"item\">");
                html.append("<strong>").append(proj.getName()).append("</strong>");
                if (proj.getRole() != null) html.append(" - ").append(proj.getRole());
                html.append("<br>");
                if (proj.getStartDate() != null) html.append(proj.getStartDate());
                if (proj.getEndDate() != null) html.append(" - ").append(proj.getEndDate());
                if (proj.getTechnologies() != null) html.append("<br>技术栈：").append(proj.getTechnologies());
                if (proj.getDescription() != null) html.append("<p>").append(proj.getDescription()).append("</p>");
                html.append("</div>");
            }
            html.append("</div>");
        }

        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            html.append("<div class=\"section\"><h2>技能</h2>");
            html.append("<div class=\"item\">");
            for (ResumeSkill skill : resume.getSkills()) {
                html.append("<span style=\"display: inline-block; margin: 5px; padding: 5px 10px; ");
                html.append("background: #ecf0f1; border-radius: 3px;\">").append(skill.getName());
                html.append(" (").append(skill.getLevel()).append("/10)</span>");
            }
            html.append("</div></div>");
        }

        html.append("</body></html>");
        return html.toString();
    }
}
