package com.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diary.entity.DiaryTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DiaryTagMapper extends BaseMapper<DiaryTag> {

    @Delete("DELETE FROM diary_tag WHERE diary_id = #{diaryId}")
    void deleteByDiaryId(@Param("diaryId") Long diaryId);
}
