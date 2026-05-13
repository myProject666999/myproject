package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.entity.UserAddress;

import java.util.List;

public interface AddressService extends IService<UserAddress> {
    List<UserAddress> getUserAddresses(Long userId);
    UserAddress getDefaultAddress(Long userId);
    UserAddress addAddress(Long userId, UserAddress address);
    UserAddress updateAddress(Long userId, UserAddress address);
    void setDefault(Long userId, Long addressId);
    void deleteAddress(Long userId, Long addressId);
}
