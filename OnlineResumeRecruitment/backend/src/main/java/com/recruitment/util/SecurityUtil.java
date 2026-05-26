package com.recruitment.util;

import com.recruitment.entity.User;
import com.recruitment.enums.RoleEnum;
import com.recruitment.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    private static UserMapper userMapper;

    @Autowired
    public void setUserMapper(UserMapper userMapper) {
        SecurityUtil.userMapper = userMapper;
    }

    private SecurityUtil() {
    }

    public static Long getCurrentUserId() {
        String username = getCurrentUsername();
        if (username != null && userMapper != null) {
            User user = userMapper.selectByUsername(username);
            if (user != null) {
                return user.getId();
            }
        }
        return null;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return null;
    }

    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userDetails.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse(null);
        }
        return null;
    }

    public static boolean isJobSeeker() {
        String role = getCurrentUserRole();
        return RoleEnum.JOB_SEEKER.name().equals(role);
    }

    public static boolean isHR() {
        String role = getCurrentUserRole();
        return RoleEnum.HR.name().equals(role);
    }
}
