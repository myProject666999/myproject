package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.BillSplit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BillSplitMapper extends BaseMapper<BillSplit> {

    @Select("SELECT * FROM bill_split WHERE bill_id = #{billId}")
    List<BillSplit> selectByBillId(Long billId);
}
