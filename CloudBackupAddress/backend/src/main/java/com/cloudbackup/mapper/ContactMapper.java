package com.cloudbackup.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cloudbackup.entity.Contact;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContactMapper extends BaseMapper<Contact> {
}
