package com.insurance.repository;

import com.insurance.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByPolicyId(Long policyId);
    List<Attachment> findByClaimId(Long claimId);
}
