package com.micro.frontend.config;

import com.alibaba.fastjson2.JSON;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer(StandardCharsets.UTF_8);
        FastJson2JsonRedisSerializer jsonSerializer = new FastJson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();

        return template;
    }

    public static class FastJson2JsonRedisSerializer implements org.springframework.data.redis.serializer.RedisSerializer<Object> {

        private static final Charset DEFAULT_CHARSET = StandardCharsets.UTF_8;

        @Override
        public byte[] serialize(Object object) {
            if (object == null) {
                return new byte[0];
            }
            if (object instanceof String) {
                return ((String) object).getBytes(DEFAULT_CHARSET);
            }
            return JSON.toJSONBytes(object);
        }

        @Override
        public Object deserialize(byte[] bytes) {
            if (bytes == null || bytes.length == 0) {
                return null;
            }
            String str = new String(bytes, DEFAULT_CHARSET);
            try {
                return JSON.parse(str);
            } catch (Exception e) {
                return str;
            }
        }
    }
}
