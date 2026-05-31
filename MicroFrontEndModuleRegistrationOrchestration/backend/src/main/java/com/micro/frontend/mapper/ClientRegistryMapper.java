package com.micro.frontend.mapper;

import com.micro.frontend.entity.ClientRegistry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ClientRegistryMapper {

    ClientRegistry selectByClientId(@Param("clientId") String clientId);

    Integer selectOnlineCount();

    List<ClientRegistry> selectOnlineByAppCode(@Param("appCode") String appCode);

    List<ClientRegistry> selectList(
            @Param("appCode") String appCode,
            @Param("status") Integer status,
            @Param("userId") String userId,
            @Param("onlineOnly") Boolean onlineOnly,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize
    );

    Long selectCount(
            @Param("appCode") String appCode,
            @Param("status") Integer status,
            @Param("userId") String userId,
            @Param("onlineOnly") Boolean onlineOnly
    );

    int insert(ClientRegistry clientRegistry);

    int updateHeartbeat(
            @Param("clientId") String clientId,
            @Param("appCode") String appCode,
            @Param("appVersion") String appVersion,
            @Param("configVersion") Integer configVersion
    );

    int updateOffline();

    int cleanOffline();
}
