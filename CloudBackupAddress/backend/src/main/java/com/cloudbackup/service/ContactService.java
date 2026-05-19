package com.cloudbackup.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cloudbackup.entity.Contact;
import com.cloudbackup.entity.VersionSnapshot;
import com.cloudbackup.mapper.ContactMapper;
import com.cloudbackup.util.VCardUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService extends ServiceImpl<ContactMapper, Contact> {

    private final AddressBookService addressBookService;
    private final VersionSnapshotService versionSnapshotService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> uploadVCard(String userId, MultipartFile file) throws Exception {
        var addressBook = addressBookService.getOrCreateByUserId(userId);
        List<Contact> parsedContacts = VCardUtil.parseVCardFile(file);

        List<Contact> existingContacts = list(new LambdaQueryWrapper<Contact>()
                .eq(Contact::getAddressBookId, addressBook.getId()));

        Map<String, Contact> existingMap = existingContacts.stream()
                .collect(Collectors.toMap(Contact::getUid, c -> c, (a, b) -> a));

        List<Contact> toInsert = new ArrayList<>();
        List<Contact> toUpdate = new ArrayList<>();
        Set<String> unchangedUids = new HashSet<>();

        for (Contact parsed : parsedContacts) {
            parsed.setAddressBookId(addressBook.getId());
            Contact existing = existingMap.get(parsed.getUid());

            if (existing == null) {
                toInsert.add(parsed);
            } else if (!existing.getHashCode().equals(parsed.getHashCode())) {
                parsed.setId(existing.getId());
                parsed.setCreatedTime(existing.getCreatedTime());
                toUpdate.add(parsed);
            } else {
                unchangedUids.add(existing.getUid());
            }
        }

        if (!toInsert.isEmpty()) {
            saveBatch(toInsert);
        }
        if (!toUpdate.isEmpty()) {
            updateBatchById(toUpdate);
        }

        int totalCount = toInsert.size() + toUpdate.size() + unchangedUids.size();
        addressBook.setContactCount(totalCount);
        addressBookService.updateById(addressBook);

        List<Contact> allContacts = list(new LambdaQueryWrapper<Contact>()
                .eq(Contact::getAddressBookId, addressBook.getId()));

        versionSnapshotService.createSnapshot(addressBook.getId(), "upload",
                String.format("上传vCard文件，新增%d条，更新%d条，不变%d条",
                        toInsert.size(), toUpdate.size(), unchangedUids.size()),
                allContacts);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", totalCount);
        result.put("added", toInsert.size());
        result.put("updated", toUpdate.size());
        result.put("unchanged", unchangedUids.size());
        result.put("contacts", allContacts);

        return result;
    }

    public List<Contact> listByAddressBookId(Long addressBookId) {
        return list(new LambdaQueryWrapper<Contact>()
                .eq(Contact::getAddressBookId, addressBookId)
                .orderByDesc(Contact::getUpdatedTime));
    }

    public String exportToVCard(Long addressBookId) {
        List<Contact> contacts = listByAddressBookId(addressBookId);
        return VCardUtil.contactsToVCard(contacts);
    }

    public String exportVersionToVCard(Long snapshotId) {
        VersionSnapshot snapshot = versionSnapshotService.getById(snapshotId);
        if (snapshot == null) {
            throw new RuntimeException("版本快照不存在");
        }
        try {
            List<Contact> contacts = objectMapper.readValue(
                    snapshot.getSnapshotData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Contact.class)
            );
            return VCardUtil.contactsToVCard(contacts);
        } catch (Exception e) {
            log.error("解析快照数据失败", e);
            throw new RuntimeException("解析快照数据失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> restoreFromSnapshot(String userId, Long snapshotId) {
        VersionSnapshot snapshot = versionSnapshotService.getById(snapshotId);
        if (snapshot == null) {
            throw new RuntimeException("版本快照不存在");
        }

        var addressBook = addressBookService.getOrCreateByUserId(userId);

        try {
            List<Contact> snapshotContacts = objectMapper.readValue(
                    snapshot.getSnapshotData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Contact.class)
            );

            remove(new LambdaQueryWrapper<Contact>()
                    .eq(Contact::getAddressBookId, addressBook.getId()));

            for (Contact contact : snapshotContacts) {
                contact.setId(null);
                contact.setAddressBookId(addressBook.getId());
                contact.setCreatedTime(null);
                contact.setUpdatedTime(null);
            }

            if (!snapshotContacts.isEmpty()) {
                saveBatch(snapshotContacts);
            }

            addressBook.setContactCount(snapshotContacts.size());
            addressBookService.updateById(addressBook);

            versionSnapshotService.createSnapshot(addressBook.getId(), "restore",
                    String.format("从版本%d还原，共%d条联系人", snapshot.getVersion(), snapshotContacts.size()),
                    snapshotContacts);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("total", snapshotContacts.size());
            result.put("contacts", snapshotContacts);
            return result;
        } catch (Exception e) {
            log.error("还原失败", e);
            throw new RuntimeException("还原失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> mergeContacts(String userId, Long snapshotId) {
        VersionSnapshot snapshot = versionSnapshotService.getById(snapshotId);
        if (snapshot == null) {
            throw new RuntimeException("版本快照不存在");
        }

        var addressBook = addressBookService.getOrCreateByUserId(userId);
        List<Contact> currentContacts = listByAddressBookId(addressBook.getId());
        Map<String, Contact> currentMap = currentContacts.stream()
                .collect(Collectors.toMap(Contact::getUid, c -> c, (a, b) -> a));

        try {
            List<Contact> snapshotContacts = objectMapper.readValue(
                    snapshot.getSnapshotData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Contact.class)
            );

            List<Contact> toInsert = new ArrayList<>();
            List<Contact> toUpdate = new ArrayList<>();
            int unchanged = 0;

            for (Contact snapshotContact : snapshotContacts) {
                Contact current = currentMap.get(snapshotContact.getUid());
                if (current == null) {
                    snapshotContact.setId(null);
                    snapshotContact.setAddressBookId(addressBook.getId());
                    snapshotContact.setCreatedTime(null);
                    snapshotContact.setUpdatedTime(null);
                    toInsert.add(snapshotContact);
                } else if (!current.getHashCode().equals(snapshotContact.getHashCode())) {
                    snapshotContact.setId(current.getId());
                    snapshotContact.setAddressBookId(addressBook.getId());
                    snapshotContact.setCreatedTime(current.getCreatedTime());
                    toUpdate.add(snapshotContact);
                } else {
                    unchanged++;
                }
            }

            if (!toInsert.isEmpty()) {
                saveBatch(toInsert);
            }
            if (!toUpdate.isEmpty()) {
                updateBatchById(toUpdate);
            }

            List<Contact> allContacts = listByAddressBookId(addressBook.getId());
            addressBook.setContactCount(allContacts.size());
            addressBookService.updateById(addressBook);

            versionSnapshotService.createSnapshot(addressBook.getId(), "merge",
                    String.format("合并版本%d，新增%d条，更新%d条，不变%d条",
                            snapshot.getVersion(), toInsert.size(), toUpdate.size(), unchanged),
                    allContacts);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("added", toInsert.size());
            result.put("updated", toUpdate.size());
            result.put("unchanged", unchanged);
            result.put("total", allContacts.size());
            result.put("contacts", allContacts);
            return result;
        } catch (Exception e) {
            log.error("合并失败", e);
            throw new RuntimeException("合并失败");
        }
    }

    public Map<String, Object> deduplicate(Long addressBookId) {
        List<Contact> contacts = listByAddressBookId(addressBookId);
        Map<String, List<Contact>> groupMap = new LinkedHashMap<>();

        for (Contact contact : contacts) {
            String key = generateDeduplicateKey(contact);
            groupMap.computeIfAbsent(key, k -> new ArrayList<>()).add(contact);
        }

        List<Long> toDelete = new ArrayList<>();
        int duplicateCount = 0;

        for (Map.Entry<String, List<Contact>> entry : groupMap.entrySet()) {
            List<Contact> group = entry.getValue();
            if (group.size() > 1) {
                duplicateCount += group.size() - 1;
                Contact keep = selectBestContact(group);
                for (Contact c : group) {
                    if (!c.getId().equals(keep.getId())) {
                        toDelete.add(c.getId());
                    }
                }
            }
        }

        if (!toDelete.isEmpty()) {
            removeByIds(toDelete);
        }

        int remaining = contacts.size() - toDelete.size();
        var addressBook = addressBookService.getById(addressBookId);
        addressBook.setContactCount(remaining);
        addressBookService.updateById(addressBook);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("originalCount", contacts.size());
        result.put("duplicateCount", duplicateCount);
        result.put("remainingCount", remaining);
        return result;
    }

    private String generateDeduplicateKey(Contact contact) {
        StringBuilder key = new StringBuilder();

        if (StrUtil.isNotBlank(contact.getPhones())) {
            key.append(contact.getPhones());
        }
        if (StrUtil.isNotBlank(contact.getEmails())) {
            key.append("|").append(contact.getEmails());
        }
        if (StrUtil.isNotBlank(contact.getFormattedName())) {
            key.append("|").append(contact.getFormattedName().toLowerCase());
        }

        return key.length() > 0 ? key.toString() : "empty_" + contact.getId();
    }

    private Contact selectBestContact(List<Contact> contacts) {
        return contacts.stream()
                .max(Comparator.comparingInt(c -> {
                    int score = 0;
                    if (StrUtil.isNotBlank(c.getPhones())) score += 3;
                    if (StrUtil.isNotBlank(c.getEmails())) score += 2;
                    if (StrUtil.isNotBlank(c.getOrganization())) score += 1;
                    if (StrUtil.isNotBlank(c.getNote())) score += 1;
                    return score;
                }))
                .orElse(contacts.get(0));
    }
}
