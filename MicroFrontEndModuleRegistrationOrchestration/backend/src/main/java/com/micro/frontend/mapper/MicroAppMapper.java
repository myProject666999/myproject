package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.MicroApp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MicroAppMapper extends BaseMapper<MicroApp> {

    MicroApp selectByAppCode(@Param("appCode") String appCode);

    List<MicroApp> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    List<MicroApp> selectAllActive();

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int updateCurrentVersion(@Param("id") Long id, @Param("version") String version);
}
