package com.insurance.service;

import com.insurance.entity.Attachment;
import com.insurance.entity.Claim;
import com.insurance.entity.InsurancePolicy;
import com.insurance.repository.AttachmentRepository;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.InsurancePolicyRepository;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public Attachment storeFile(MultipartFile file, Long policyId, Long claimId, String description) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + (fileExtension != null ? "." + fileExtension : "");

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence " + originalFileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setFileName(fileName);
            attachment.setOriginalFileName(originalFileName);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setFilePath(targetLocation.toString());
            attachment.setDescription(description);

            if (policyId != null) {
                InsurancePolicy policy = policyRepository.findById(policyId)
                        .orElseThrow(() -> new RuntimeException("Policy not found with id " + policyId));
                attachment.setPolicy(policy);
            }

            if (claimId != null) {
                Claim claim = claimRepository.findById(claimId)
                        .orElseThrow(() -> new RuntimeException("Claim not found with id " + claimId));
                attachment.setClaim(claim);
            }

            return attachmentRepository.save(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id " + attachmentId));

        try {
            Path filePath = Paths.get(attachment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + attachment.getOriginalFileName());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + attachment.getOriginalFileName(), ex);
        }
    }

    public List<Attachment> getAttachmentsByPolicyId(Long policyId) {
        return attachmentRepository.findByPolicyId(policyId);
    }

    public List<Attachment> getAttachmentsByClaimId(Long claimId) {
        return attachmentRepository.findByClaimId(claimId);
    }

    public Optional<Attachment> getAttachmentById(Long id) {
        return attachmentRepository.findById(id);
    }

    @Transactional
    public void deleteAttachment(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id " + id));

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + attachment.getOriginalFileName(), ex);
        }

        attachmentRepository.deleteById(id);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return null;
    }
}
