package com.creator.platform.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "creator:platform:";
    private static final long DEFAULT_EXPIRE = 30;
    private static final TimeUnit DEFAULT_UNIT = TimeUnit.MINUTES;

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(CACHE_PREFIX + key, value, DEFAULT_EXPIRE, DEFAULT_UNIT);
    }

    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(CACHE_PREFIX + key, value, timeout, unit);
    }

    public Object get(String key) {
        return redisTemplate.opsForValue().get(CACHE_PREFIX + key);
    }

    public <T> T get(String key, Class<T> clazz) {
        Object value = redisTemplate.opsForValue().get(CACHE_PREFIX + key);
        if (value == null) {
            return null;
        }
        return com.alibaba.fastjson2.JSON.parseObject(com.alibaba.fastjson2.JSON.toJSONString(value), clazz);
    }

    public <T> List<T> getList(String key, Class<T> clazz) {
        Object value = redisTemplate.opsForValue().get(CACHE_PREFIX + key);
        if (value == null) {
            return null;
        }
        return com.alibaba.fastjson2.JSON.parseArray(com.alibaba.fastjson2.JSON.toJSONString(value), clazz);
    }

    public Boolean delete(String key) {
        return redisTemplate.delete(CACHE_PREFIX + key);
    }

    public void deleteBatch(Set<String> keys) {
        redisTemplate.delete(keys.stream().map(k -> CACHE_PREFIX + k).toList());
    }

    public Boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(CACHE_PREFIX + key));
    }

    public void expire(String key, long timeout, TimeUnit unit) {
        redisTemplate.expire(CACHE_PREFIX + key, timeout, unit);
    }

    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(CACHE_PREFIX + key, hashKey, value);
    }

    public Object hGet(String key, String hashKey) {
        return redisTemplate.opsForHash().get(CACHE_PREFIX + key, hashKey);
    }

    public Map<Object, Object> hGetAll(String key) {
        return redisTemplate.opsForHash().entries(CACHE_PREFIX + key);
    }

    public void hDel(String key, Object... hashKeys) {
        redisTemplate.opsForHash().delete(CACHE_PREFIX + key, hashKeys);
    }

    public Set<String> keys(String pattern) {
        return redisTemplate.keys(CACHE_PREFIX + pattern);
    }
}
