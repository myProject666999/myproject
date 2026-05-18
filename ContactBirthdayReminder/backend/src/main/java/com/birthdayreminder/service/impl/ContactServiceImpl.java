package com.birthdayreminder.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.birthdayreminder.dto.BirthdayReminderDTO;
import com.birthdayreminder.dto.ContactDTO;
import com.birthdayreminder.entity.Contact;
import com.birthdayreminder.mapper.ContactMapper;
import com.birthdayreminder.service.ContactService;
import com.birthdayreminder.utils.LunarUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl extends ServiceImpl<ContactMapper, Contact> implements ContactService {

    @Override
    public List<Contact> listByUserId(Long userId) {
        LambdaQueryWrapper<Contact> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Contact::getUserId, userId);
        return list(wrapper);
    }

    @Override
    public Contact addContact(ContactDTO dto) {
        Contact contact = new Contact();
        BeanUtils.copyProperties(dto, contact);
        if (dto.getCalendarType() == 2 && dto.getLunarMonth() != null && dto.getLunarDay() != null) {
            LocalDate solarDate = LunarUtils.lunarToSolar(LocalDate.now().getYear(), dto.getLunarMonth(), dto.getLunarDay(), dto.getIsLeap() != null && dto.getIsLeap() == 1);
            contact.setBirthday(solarDate);
        }
        save(contact);
        return contact;
    }

    @Override
    public Contact updateContact(Long id, ContactDTO dto) {
        Contact contact = getById(id);
        if (contact == null) {
            return null;
        }
        BeanUtils.copyProperties(dto, contact);
        contact.setId(id);
        if (dto.getCalendarType() == 2 && dto.getLunarMonth() != null && dto.getLunarDay() != null) {
            LocalDate solarDate = LunarUtils.lunarToSolar(LocalDate.now().getYear(), dto.getLunarMonth(), dto.getLunarDay(), dto.getIsLeap() != null && dto.getIsLeap() == 1);
            contact.setBirthday(solarDate);
        }
        updateById(contact);
        return contact;
    }

    @Override
    public List<BirthdayReminderDTO> getUpcomingReminders(Long userId, int days) {
        List<Contact> contacts = listByUserId(userId);
        LocalDate today = LocalDate.now();
        return contacts.stream()
                .map(contact -> {
                    BirthdayReminderDTO dto = new BirthdayReminderDTO();
                    dto.setContactId(contact.getId());
                    dto.setName(contact.getName());
                    dto.setBirthday(contact.getBirthday());
                    dto.setCalendarType(contact.getCalendarType());
                    dto.setRelation(contact.getRelation());
                    long daysUntil = LunarUtils.getDaysUntilBirthday(contact.getBirthday(), contact.getCalendarType());
                    dto.setDaysUntil(daysUntil);
                    int age = Period.between(contact.getBirthday(), LunarUtils.getNextBirthday(contact.getBirthday(), contact.getCalendarType())).getYears();
                    dto.setAge(age);
                    return dto;
                })
                .filter(dto -> dto.getDaysUntil() <= days)
                .sorted(Comparator.comparingLong(BirthdayReminderDTO::getDaysUntil))
                .collect(Collectors.toList());
    }

    @Override
    public List<BirthdayReminderDTO> getYearlyBirthdayTable(Long userId, int year) {
        List<Contact> contacts = listByUserId(userId);
        return contacts.stream()
                .map(contact -> {
                    BirthdayReminderDTO dto = new BirthdayReminderDTO();
                    dto.setContactId(contact.getId());
                    dto.setName(contact.getName());
                    LocalDate nextBirthday;
                    if (contact.getCalendarType() == 1) {
                        nextBirthday = LocalDate.of(year, contact.getBirthday().getMonth(), contact.getBirthday().getDayOfMonth());
                    } else {
                        nextBirthday = LunarUtils.lunarToSolar(year, contact.getLunarMonth(), contact.getLunarDay(), contact.getIsLeap() != null && contact.getIsLeap() == 1);
                    }
                    dto.setBirthday(nextBirthday);
                    dto.setCalendarType(contact.getCalendarType());
                    dto.setRelation(contact.getRelation());
                    int age = Period.between(contact.getBirthday(), nextBirthday).getYears();
                    dto.setAge(age);
                    return dto;
                })
                .sorted(Comparator.comparing(BirthdayReminderDTO::getBirthday))
                .collect(Collectors.toList());
    }
}
