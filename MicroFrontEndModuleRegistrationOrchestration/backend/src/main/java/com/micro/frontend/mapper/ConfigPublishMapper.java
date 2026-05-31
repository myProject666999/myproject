package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.ConfigPublish;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ConfigPublishMapper extends BaseMapper<ConfigPublish> {

    ConfigPublish selectByPublishNo(@Param("publishNo") String publishNo);

    List<ConfigPublish> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    List<ConfigPublish> selectByAppId(@Param("appId") Long appId);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int updatePushStatus(@Param("id") Long id, @Param("pushStatus") Integer pushStatus);

    int updatePublishTime(@Param("id") Long id, @Param("publishTime") LocalDateTime publishTime);
}
