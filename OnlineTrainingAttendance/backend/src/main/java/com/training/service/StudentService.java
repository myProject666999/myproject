package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Student;
import com.training.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public Result<Student> add(Student student) {
        if (student.getIdCard() != null && studentRepository.existsByIdCard(student.getIdCard())) {
            return Result.fail("身份证号已存在");
        }
        if (student.getPhone() != null && studentRepository.existsByPhone(student.getPhone())) {
            return Result.fail("手机号已存在");
        }
        if (student.getEmail() != null && studentRepository.existsByEmail(student.getEmail())) {
            return Result.fail("邮箱已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        student.setCreatedAt(now);
        student.setUpdatedAt(now);
        return Result.success(studentRepository.save(student));
    }

    public Result<String> delete(Long id) {
        if (!studentRepository.existsById(id)) {
            return Result.fail(ResultCode.STUDENT_NOT_FOUND);
        }
        studentRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<Student> update(Student student) {
        if (student.getId() == null || !studentRepository.existsById(student.getId())) {
            return Result.fail(ResultCode.STUDENT_NOT_FOUND);
        }
        Student db = studentRepository.findById(student.getId()).get();
        if (student.getName() != null) {
            db.setName(student.getName());
        }
        if (student.getIdCard() != null && !student.getIdCard().equals(db.getIdCard())) {
            if (studentRepository.existsByIdCard(student.getIdCard())) {
                return Result.fail("身份证号已存在");
            }
            db.setIdCard(student.getIdCard());
        }
        if (student.getPhone() != null && !student.getPhone().equals(db.getPhone())) {
            if (studentRepository.existsByPhone(student.getPhone())) {
                return Result.fail("手机号已存在");
            }
            db.setPhone(student.getPhone());
        }
        if (student.getEmail() != null && !student.getEmail().equals(db.getEmail())) {
            if (studentRepository.existsByEmail(student.getEmail())) {
                return Result.fail("邮箱已存在");
            }
            db.setEmail(student.getEmail());
        }
        if (student.getGender() != null) {
            db.setGender(student.getGender());
        }
        if (student.getAvatar() != null) {
            db.setAvatar(student.getAvatar());
        }
        db.setUpdatedAt(LocalDateTime.now());
        return Result.success(studentRepository.save(db));
    }

    public Result<Student> getById(Long id) {
        Optional<Student> optional = studentRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.STUDENT_NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<Student> getByIdCard(String idCard) {
        Optional<Student> optional = studentRepository.findByIdCard(idCard);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.STUDENT_NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<List<Student>> list(String name, Integer gender) {
        List<Student> list;
        if (name != null && !name.isEmpty() && gender != null) {
            list = studentRepository.findByNameContainingAndGender(name, gender);
        } else if (name != null && !name.isEmpty()) {
            list = studentRepository.findByNameContaining(name);
        } else if (gender != null) {
            list = studentRepository.findByGender(gender);
        } else {
            list = studentRepository.findAll();
        }
        return Result.success(list);
    }

    public Result<String> batchImport(List<Student> students) {
        if (students == null || students.isEmpty()) {
            return Result.fail("导入数据不能为空");
        }
        LocalDateTime now = LocalDateTime.now();
        List<Student> toSave = new ArrayList<>();
        for (Student s : students) {
            if (s.getIdCard() != null && studentRepository.existsByIdCard(s.getIdCard())) {
                continue;
            }
            s.setCreatedAt(now);
            s.setUpdatedAt(now);
            toSave.add(s);
        }
        studentRepository.saveAll(toSave);
        return Result.success("成功导入 " + toSave.size() + " 条数据（共 " + students.size() + " 条，跳过 " + (students.size() - toSave.size()) + " 条重复）");
    }
}
