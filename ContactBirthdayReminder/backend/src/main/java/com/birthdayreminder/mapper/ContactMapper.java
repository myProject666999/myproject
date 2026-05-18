package com.birthdayreminder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.birthdayreminder.entity.Contact;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContactMapper extends BaseMapper<Contact> {
}
