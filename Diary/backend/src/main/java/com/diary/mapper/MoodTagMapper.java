package com.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diary.entity.MoodTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MoodTagMapper extends BaseMapper<MoodTag> {

    @Select("SELECT mt.* FROM mood_tag mt " +
            "INNER JOIN diary_tag dt ON mt.id = dt.tag_id " +
            "WHERE dt.diary_id = #{diaryId}")
    List<MoodTag> findByDiaryId(Long diaryId);
}
