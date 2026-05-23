package com.oj.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.oj.common.Result;
import com.oj.entity.Contest;
import com.oj.entity.ContestUser;
import com.oj.service.ContestService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contest")
public class ContestController {

    @Resource
    private ContestService contestService;

    @GetMapping("/list")
    public Result<IPage<Contest>> getContestList(@RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(required = false) String keyword,
                                                 @RequestParam(required = false) Integer status) {
        return Result.success(contestService.getContestPage(page, size, keyword, status));
    }

    @GetMapping("/detail/{id}")
    public Result<Contest> getContestDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(contestService.getContestDetail(id, userId));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Contest> createContest(@RequestBody Contest contest) {
        return Result.success(contestService.createContest(contest));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Contest> updateContest(@RequestBody Contest contest) {
        return Result.success(contestService.updateContest(contest));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteContest(@PathVariable Long id) {
        contestService.deleteContest(id);
        return Result.success("删除成功");
    }

    @PostMapping("/join/{id}")
    public Result<String> joinContest(@PathVariable Long id, @RequestBody(required = false) Contest contest,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        String password = contest != null ? contest.getPassword() : null;
        contestService.joinContest(id, userId, password);
        return Result.success("加入成功");
    }

    @GetMapping("/rank/{id}")
    public Result<List<ContestUser>> getContestRank(@PathVariable Long id) {
        return Result.success(contestService.getContestRank(id));
    }
}
