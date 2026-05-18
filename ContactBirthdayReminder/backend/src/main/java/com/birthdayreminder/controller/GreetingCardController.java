package com.birthdayreminder.controller;

import com.birthdayreminder.common.Result;
import com.birthdayreminder.entity.GreetingCard;
import com.birthdayreminder.service.GreetingCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/greeting-cards")
public class GreetingCardController {

    @Autowired
    private GreetingCardService greetingCardService;

    @GetMapping
    public Result<List<GreetingCard>> list(@RequestParam(required = false) String category) {
        return Result.success(greetingCardService.listByCategory(category));
    }

    @GetMapping("/{id}")
    public Result<GreetingCard> getById(@RequestParam Long id) {
        return Result.success(greetingCardService.getById(id));
    }
}
