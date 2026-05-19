package com.cloudbackup.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cloudbackup.entity.VersionSnapshot;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VersionSnapshotMapper extends BaseMapper<VersionSnapshot> {
}
