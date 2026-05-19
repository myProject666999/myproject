package com.cloudbackup.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cloudbackup.entity.AddressBook;
import com.cloudbackup.mapper.AddressBookMapper;
import org.springframework.stereotype.Service;

@Service
public class AddressBookService extends ServiceImpl<AddressBookMapper, AddressBook> {

    public AddressBook getOrCreateByUserId(String userId) {
        AddressBook addressBook = getOne(new LambdaQueryWrapper<AddressBook>()
                .eq(AddressBook::getUserId, userId)
                .last("LIMIT 1"));

        if (addressBook == null) {
            addressBook = new AddressBook();
            addressBook.setUserId(userId);
            addressBook.setName("默认通讯录");
            addressBook.setContactCount(0);
            save(addressBook);
        }

        return addressBook;
    }
}
