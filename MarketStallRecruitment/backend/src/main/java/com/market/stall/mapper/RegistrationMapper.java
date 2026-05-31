package com.market.stall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.entity.Registration;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RegistrationMapper extends BaseMapper<Registration> {

    List<Registration> selectByEventId(@Param("eventId") Long eventId);

    IPage<Registration> selectPageByCondition(IPage<Registration> page,
                                              @Param("eventId") Long eventId,
                                              @Param("auditStatus") Integer auditStatus,
                                              @Param("status") Integer status);
}
