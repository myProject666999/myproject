package com.community.gridgovernance.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class CacheUtil {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(key, value, timeout, unit);
            }
        } catch (Exception e) {
            log.warn("Redis缓存写入失败: {} - {}", key, e.getMessage());
        }
    }

    public Object get(String key) {
        try {
            if (redisTemplate != null) {
                return redisTemplate.opsForValue().get(key);
            }
        } catch (Exception e) {
            log.warn("Redis缓存读取失败: {} - {}", key, e.getMessage());
        }
        return null;
    }

    public void delete(String key) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(key);
            }
        } catch (Exception e) {
            log.warn("Redis缓存删除失败: {} - {}", key, e.getMessage());
        }
    }
}
