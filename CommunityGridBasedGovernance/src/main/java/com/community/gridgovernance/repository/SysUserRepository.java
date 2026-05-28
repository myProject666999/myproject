package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.SysUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SysUserRepository extends JpaRepository<SysUser, Long> {
    Optional<SysUser> findByUsername(String username);
    List<SysUser> findByRoleType(String roleType);
    List<SysUser> findByGridIdAndRoleType(Long gridId, String roleType);
    Optional<SysUser> findByUsernameAndPassword(String username, String password);
}
