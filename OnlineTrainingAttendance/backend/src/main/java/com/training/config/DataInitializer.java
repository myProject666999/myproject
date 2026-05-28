package com.training.config;

import com.training.entity.Admin;
import com.training.entity.Student;
import com.training.entity.Training;
import com.training.repository.AdminRepository;
import com.training.repository.StudentRepository;
import com.training.repository.TrainingRepository;
import com.training.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final TrainingRepository trainingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!adminRepository.existsByUsername("admin")) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("系统管理员");
            admin.setEmail("admin@example.com");
            admin.setPhone("13800138000");
            admin.setStatus(1);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            adminRepository.save(admin);
            log.info("Created default admin: admin/admin123");
        }

        if (studentRepository.count() == 0) {
            String[] names = {"张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"};
            for (int i = 0; i < names.length; i++) {
                Student s = new Student();
                s.setName(names[i]);
                s.setIdCard(String.format("1101011990%02d%02d%03d%c", (i % 12) + 1, (i % 28) + 1, 100 + i, (i % 2 == 0 ? 'X' : '2')));
                s.setPhone(String.format("138%08d", 10000000 + i));
                s.setEmail("student" + (i + 1) + "@example.com");
                s.setGender(i % 2);
                s.setCreatedAt(LocalDateTime.now());
                s.setUpdatedAt(LocalDateTime.now());
                studentRepository.save(s);
            }
            log.info("Created 8 sample students");
        }

        if (trainingRepository.count() == 0) {
            String[] trainingNames = {"Java开发培训班", "Python数据分析班", "Web前端开发班", "人工智能入门班"};
            String[] instructors = {"张教授", "李教授", "王教授", "赵教授"};
            for (int i = 0; i < trainingNames.length; i++) {
                Training t = new Training();
                t.setName(trainingNames[i]);
                t.setDescription(trainingNames[i] + "，从零基础到精通，系统学习核心技术，掌握实战技能。");
                t.setInstructor(instructors[i]);
                t.setStartDate(LocalDate.now().plusDays(i * 2 - 1));
                t.setEndDate(LocalDate.now().plusDays(i * 2 + 14));
                t.setTotalHours(BigDecimal.valueOf(40.0 + i * 8));
                t.setMinAttendanceRate(BigDecimal.valueOf(80.0));
                t.setStatus(i == 0 ? 1 : (i == 1 ? 0 : 2));
                String token = UUID.randomUUID().toString().replace("-", "");
                String content = "/training/" + (i + 1) + "?token=" + token;
                byte[] qrBytes = QRCodeUtil.generateBytes(content);
                String dataUrl = "data:image/png;base64," + Base64.getEncoder().encodeToString(qrBytes);
                t.setQrCode(dataUrl);
                t.setCreatedAt(LocalDateTime.now());
                t.setUpdatedAt(LocalDateTime.now());
                trainingRepository.save(t);
            }
            log.info("Created 4 sample trainings");
        }
    }
}
