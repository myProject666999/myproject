package com.birthdayreminder.controller;

import com.birthdayreminder.common.Result;
import com.birthdayreminder.dto.ContactDTO;
import com.birthdayreminder.entity.Contact;
import com.birthdayreminder.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    public Result<List<Contact>> list(@RequestParam Long userId) {
        return Result.success(contactService.listByUserId(userId));
    }

    @PostMapping
    public Result<Contact> add(@RequestBody ContactDTO dto) {
        return Result.success(contactService.addContact(dto));
    }

    @PutMapping("/{id}")
    public Result<Contact> update(@PathVariable Long id, @RequestBody ContactDTO dto) {
        Contact contact = contactService.updateContact(id, dto);
        if (contact == null) {
            return Result.error("联系人不存在");
        }
        return Result.success(contact);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        contactService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Contact> getById(@PathVariable Long id) {
        return Result.success(contactService.getById(id));
    }
}
