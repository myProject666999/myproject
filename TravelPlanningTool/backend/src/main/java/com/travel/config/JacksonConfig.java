package com.travel.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.serializerByType(LocalTime.class, new LocalTimeSerializer(TIME_FORMATTER));
            builder.deserializerByType(LocalTime.class, new CustomLocalTimeDeserializer());
        };
    }

    public static class CustomLocalTimeDeserializer extends JsonDeserializer<LocalTime> {
        @Override
        public LocalTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String timeStr = p.getText();
            try {
                if (timeStr == null || timeStr.isEmpty()) {
                    return null;
                }
                
                if (timeStr.contains("T")) {
                    timeStr = timeStr.split("T")[1];
                }
                
                if (timeStr.contains("Z")) {
                    timeStr = timeStr.replace("Z", "");
                }
                
                if (timeStr.contains(".")) {
                    timeStr = timeStr.split("\\.")[0];
                }
                
                if (timeStr.length() == 5) {
                    timeStr = timeStr + ":00";
                }
                
                return LocalTime.parse(timeStr, TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                throw new RuntimeException("无法解析时间格式: " + timeStr, e);
            }
        }
    }
}
