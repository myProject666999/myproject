package com.onsiterepair.config;

import com.onsiterepair.exception.BusinessException;
import com.onsiterepair.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "未登录或token已过期");
        }

        try {
            if (!jwtUtils.validateToken(token)) {
                throw new BusinessException(401, "token无效");
            }
            Long userId = jwtUtils.getUserIdFromToken(token);
            Integer userType = jwtUtils.getUserTypeFromToken(token);
            request.setAttribute("userId", userId);
            request.setAttribute("userType", userType);
            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("JWT验证异常", e);
            throw new BusinessException(401, "token无效");
        }
    }
}
