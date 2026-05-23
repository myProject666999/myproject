package com.oj.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.oj.common.Result;
import com.oj.entity.Problem;
import com.oj.service.ProblemService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/problem")
public class ProblemController {

    @Resource
    private ProblemService problemService;

    @GetMapping("/list")
    public Result<IPage<Problem>> getProblemList(@RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(required = false) String keyword,
                                                 @RequestParam(required = false) Integer difficulty,
                                                 HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(problemService.getProblemPage(page, size, keyword, difficulty, null, userId));
    }

    @GetMapping("/detail/{id}")
    public Result<Problem> getProblemDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(problemService.getProblemDetail(id, userId));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Problem> createProblem(@RequestBody Problem problem) {
        return Result.success(problemService.createProblem(problem));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Problem> updateProblem(@RequestBody Problem problem) {
        return Result.success(problemService.updateProblem(problem));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return Result.success("删除成功");
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<Problem>> getProblemPage(@RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(required = false) String keyword,
                                                 @RequestParam(required = false) Integer difficulty,
                                                 @RequestParam(required = false) Integer status) {
        return Result.success(problemService.getProblemPage(page, size, keyword, difficulty, status, null));
    }
}
