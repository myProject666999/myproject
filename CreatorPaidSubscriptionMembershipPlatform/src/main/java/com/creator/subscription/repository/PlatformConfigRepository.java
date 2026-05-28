package com.creator.subscription.repository;

import com.creator.subscription.entity.PlatformConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformConfigRepository extends JpaRepository<PlatformConfig, Long> {
    Optional<PlatformConfig> findByConfigKey(String configKey);
    boolean existsByConfigKey(String configKey);
}
