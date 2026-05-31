package com.meeting.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Component
public class RedisLockUtil {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String LOCK_PREFIX = "lock:";

    private static final String UNLOCK_SCRIPT =
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) " +
                    "else return 0 end";

    public boolean tryLock(String key, long timeout, TimeUnit unit) {
        String lockKey = LOCK_PREFIX + key;
        String value = Thread.currentThread().getId() + ":" + System.currentTimeMillis();
        long timeoutSeconds = unit.toSeconds(timeout);

        Boolean result = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, value, timeoutSeconds, TimeUnit.SECONDS);

        return Boolean.TRUE.equals(result);
    }

    public void unlock(String key) {
        String lockKey = LOCK_PREFIX + key;
        String value = Thread.currentThread().getId() + ":" + System.currentTimeMillis();

        DefaultRedisScript<Long> script = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);
        redisTemplate.execute(script, Collections.singletonList(lockKey), value);
    }
}
