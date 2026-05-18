package com.birthdayreminder.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.birthdayreminder.dto.BirthdayReminderDTO;
import com.birthdayreminder.dto.ContactDTO;
import com.birthdayreminder.entity.Contact;

import java.util.List;

public interface ContactService extends IService<Contact> {
    List<Contact> listByUserId(Long userId);
    Contact addContact(ContactDTO dto);
    Contact updateContact(Long id, ContactDTO dto);
    List<BirthdayReminderDTO> getUpcomingReminders(Long userId, int days);
    List<BirthdayReminderDTO> getYearlyBirthdayTable(Long userId, int year);
}
