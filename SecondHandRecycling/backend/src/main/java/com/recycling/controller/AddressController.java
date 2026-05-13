package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.entity.UserAddress;
import com.recycling.security.UserPrincipal;
import com.recycling.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/address")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping("/list")
    public Result<List<UserAddress>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(addressService.getUserAddresses(principal.getUserId()));
    }

    @GetMapping("/default")
    public Result<UserAddress> getDefault(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(addressService.getDefaultAddress(principal.getUserId()));
    }

    @PostMapping("/add")
    public Result<UserAddress> add(@AuthenticationPrincipal UserPrincipal principal,
                                   @RequestBody UserAddress address) {
        return Result.success(addressService.addAddress(principal.getUserId(), address));
    }

    @PostMapping("/update")
    public Result<UserAddress> update(@AuthenticationPrincipal UserPrincipal principal,
                                      @RequestBody UserAddress address) {
        return Result.success(addressService.updateAddress(principal.getUserId(), address));
    }

    @PostMapping("/setDefault/{id}")
    public Result<Void> setDefault(@AuthenticationPrincipal UserPrincipal principal,
                                   @PathVariable Long id) {
        addressService.setDefault(principal.getUserId(), id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                               @PathVariable Long id) {
        addressService.deleteAddress(principal.getUserId(), id);
        return Result.success();
    }
}
