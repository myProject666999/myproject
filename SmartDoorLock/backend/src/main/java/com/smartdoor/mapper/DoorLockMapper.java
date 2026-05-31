package com.smartdoor.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartdoor.entity.DoorLock;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DoorLockMapper extends BaseMapper<DoorLock> {
}
