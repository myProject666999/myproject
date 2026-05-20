package com.itinerary.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itinerary.entity.Itinerary;
import com.itinerary.entity.ItineraryItem;
import com.itinerary.entity.TemplateItem;
import com.itinerary.mapper.ItineraryItemMapper;
import com.itinerary.mapper.ItineraryMapper;
import com.itinerary.service.ItineraryService;
import com.itinerary.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ItineraryServiceImpl extends ServiceImpl<ItineraryMapper, Itinerary> implements ItineraryService {

    @Autowired
    private ItineraryItemMapper itineraryItemMapper;

    @Autowired
    private TemplateService templateService;

    @Override
    public List<Itinerary> getUserItineraries(Long userId) {
        LambdaQueryWrapper<Itinerary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Itinerary::getUserId, userId)
                .orderByDesc(Itinerary::getCreatedAt);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Itinerary createItinerary(Itinerary itinerary, Long templateId, Long userId) {
        itinerary.setUserId(userId);
        itinerary.setTemplateId(templateId);
        save(itinerary);
        if (templateId != null) {
            List<TemplateItem> templateItems = templateService.getTemplateItems(templateId);
            List<ItineraryItem> itineraryItems = new ArrayList<>();
            for (TemplateItem templateItem : templateItems) {
                ItineraryItem item = new ItineraryItem();
                item.setItineraryId(itinerary.getId());
                item.setTemplateItemId(templateItem.getId());
                item.setCategoryId(templateItem.getCategoryId());
                item.setName(templateItem.getName());
                item.setDescription(templateItem.getDescription());
                item.setQuantity(templateItem.getDefaultQuantity());
                item.setIsChecked(0);
                item.setIsCustom(0);
                item.setSortOrder(templateItem.getSortOrder());
                itineraryItems.add(item);
            }
            for (ItineraryItem item : itineraryItems) {
                itineraryItemMapper.insert(item);
            }
        }
        return itinerary;
    }

    @Override
    public List<ItineraryItem> getItineraryItems(Long itineraryId) {
        LambdaQueryWrapper<ItineraryItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ItineraryItem::getItineraryId, itineraryId)
                .orderByAsc(ItineraryItem::getCategoryId, ItineraryItem::getSortOrder);
        return itineraryItemMapper.selectList(wrapper);
    }

    @Override
    public ItineraryItem addCustomItem(Long itineraryId, ItineraryItem item) {
        item.setItineraryId(itineraryId);
        item.setIsCustom(1);
        item.setIsChecked(0);
        itineraryItemMapper.insert(item);
        return item;
    }

    @Override
    public boolean checkItem(Long itemId, boolean checked) {
        ItineraryItem item = itineraryItemMapper.selectById(itemId);
        if (item == null) {
            return false;
        }
        item.setIsChecked(checked ? 1 : 0);
        item.setCheckedAt(checked ? LocalDateTime.now() : null);
        return itineraryItemMapper.updateById(item) > 0;
    }

    @Override
    public boolean deleteItineraryItem(Long itemId) {
        return itineraryItemMapper.deleteById(itemId) > 0;
    }
}
