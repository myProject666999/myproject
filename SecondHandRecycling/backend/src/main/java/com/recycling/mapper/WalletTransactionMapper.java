package com.recycling.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.recycling.entity.WalletTransaction;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WalletTransactionMapper extends BaseMapper<WalletTransaction> {
}
