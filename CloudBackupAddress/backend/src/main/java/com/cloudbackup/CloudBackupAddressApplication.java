package com.cloudbackup;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.cloudbackup.mapper")
public class CloudBackupAddressApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudBackupAddressApplication.class, args);
    }
}
