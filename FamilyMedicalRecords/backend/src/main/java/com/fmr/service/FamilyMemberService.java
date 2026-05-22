package com.fmr.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fmr.entity.FamilyMember;
import com.fmr.mapper.FamilyMemberMapper;
import com.fmr.util.AesEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilyMemberService extends ServiceImpl<FamilyMemberMapper, FamilyMember> {

    @Autowired
    private AesEncryptor aesEncryptor;

    public List<FamilyMember> listAll() {
        List<FamilyMember> list = this.list();
        list.forEach(this::decryptMember);
        return list;
    }

    public FamilyMember getMemberById(Long id) {
        FamilyMember m = this.getById(id);
        if (m != null) decryptMember(m);
        return m;
    }

    public boolean saveMember(FamilyMember member) {
        encryptMember(member);
        return this.save(member);
    }

    public boolean updateMember(FamilyMember member) {
        encryptMember(member);
        return this.updateById(member);
    }

    public boolean removeMember(Long id) {
        return this.removeById(id);
    }

    private void encryptMember(FamilyMember m) {
        if (m.getName() != null) m.setName(aesEncryptor.encrypt(m.getName()));
        if (m.getIdCardNo() != null) m.setIdCardNo(aesEncryptor.encrypt(m.getIdCardNo()));
        if (m.getPhone() != null) m.setPhone(aesEncryptor.encrypt(m.getPhone()));
        if (m.getAddress() != null) m.setAddress(aesEncryptor.encrypt(m.getAddress()));
    }

    private void decryptMember(FamilyMember m) {
        try {
            if (m.getName() != null) m.setName(aesEncryptor.decrypt(m.getName()));
            if (m.getIdCardNo() != null) m.setIdCardNo(aesEncryptor.decrypt(m.getIdCardNo()));
            if (m.getPhone() != null) m.setPhone(aesEncryptor.decrypt(m.getPhone()));
            if (m.getAddress() != null) m.setAddress(aesEncryptor.decrypt(m.getAddress()));
        } catch (Exception ignored) {
        }
    }
}
