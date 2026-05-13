package com.recycling.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.recycling.entity.UserAddress;
import com.recycling.mapper.UserAddressMapper;
import com.recycling.service.AddressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressServiceImpl extends ServiceImpl<UserAddressMapper, UserAddress> implements AddressService {

    @Override
    public List<UserAddress> getUserAddresses(Long userId) {
        return list(new LambdaQueryWrapper<UserAddress>()
                .eq(UserAddress::getUserId, userId)
                .eq(UserAddress::getDeleted, 0)
                .orderByDesc(UserAddress::getIsDefault)
                .orderByDesc(UserAddress::getCreateTime));
    }

    @Override
    public UserAddress getDefaultAddress(Long userId) {
        return getOne(new LambdaQueryWrapper<UserAddress>()
                .eq(UserAddress::getUserId, userId)
                .eq(UserAddress::getIsDefault, 1)
                .eq(UserAddress::getDeleted, 0));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddress addAddress(Long userId, UserAddress address) {
        address.setUserId(userId);
        
        if (address.getIsDefault() != null && address.getIsDefault() == 1) {
            clearDefaultAddress(userId);
        }
        
        if (getUserAddresses(userId).isEmpty()) {
            address.setIsDefault(1);
        }
        
        save(address);
        return address;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefault(Long userId, Long addressId) {
        clearDefaultAddress(userId);
        
        UserAddress address = getById(addressId);
        if (address != null && address.getUserId().equals(userId)) {
            address.setIsDefault(1);
            updateById(address);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddress updateAddress(Long userId, UserAddress address) {
        UserAddress existing = getById(address.getId());
        if (existing == null || !existing.getUserId().equals(userId)) {
            return null;
        }

        if (address.getIsDefault() != null && address.getIsDefault() == 1) {
            clearDefaultAddress(userId);
        }

        address.setUserId(userId);
        updateById(address);
        return getById(address.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = getById(addressId);
        if (address != null && address.getUserId().equals(userId)) {
            removeById(addressId);
        }
    }

    private void clearDefaultAddress(Long userId) {
        List<UserAddress> addresses = list(new LambdaQueryWrapper<UserAddress>()
                .eq(UserAddress::getUserId, userId)
                .eq(UserAddress::getIsDefault, 1));
        
        for (UserAddress addr : addresses) {
            addr.setIsDefault(0);
            updateById(addr);
        }
    }
}
