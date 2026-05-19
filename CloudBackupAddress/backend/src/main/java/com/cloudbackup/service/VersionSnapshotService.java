package com.cloudbackup.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cloudbackup.entity.Contact;
import com.cloudbackup.entity.VersionSnapshot;
import com.cloudbackup.mapper.VersionSnapshotMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VersionSnapshotService extends ServiceImpl<VersionSnapshotMapper, VersionSnapshot> {

    private final ObjectMapper objectMapper;

    @Transactional(rollbackFor = Exception.class)
    public VersionSnapshot createSnapshot(Long addressBookId, String changeType, String description, List<Contact> contacts) {
        Integer maxVersion = getMaxVersion(addressBookId);
        int newVersion = maxVersion == null ? 1 : maxVersion + 1;

        VersionSnapshot snapshot = new VersionSnapshot();
        snapshot.setAddressBookId(addressBookId);
        snapshot.setVersion(newVersion);
        snapshot.setChangeType(changeType);
        snapshot.setDescription(description);
        snapshot.setContactCount(contacts.size());

        try {
            snapshot.setSnapshotData(objectMapper.writeValueAsString(contacts));
        } catch (JsonProcessingException e) {
            log.error("序列化联系人数据失败, 联系人数量: {}", contacts.size(), e);
            throw new RuntimeException("创建快照失败: " + e.getMessage());
        }

        save(snapshot);
        return snapshot;
    }

    public Integer getMaxVersion(Long addressBookId) {
        VersionSnapshot latest = getOne(new LambdaQueryWrapper<VersionSnapshot>()
                .eq(VersionSnapshot::getAddressBookId, addressBookId)
                .orderByDesc(VersionSnapshot::getVersion)
                .last("LIMIT 1"));
        return latest != null ? latest.getVersion() : null;
    }

    public List<VersionSnapshot> listByAddressBookId(Long addressBookId) {
        return list(new LambdaQueryWrapper<VersionSnapshot>()
                .eq(VersionSnapshot::getAddressBookId, addressBookId)
                .orderByDesc(VersionSnapshot::getVersion));
    }

    public Map<String, Object> compareVersions(Long snapshotId1, Long snapshotId2) {
        VersionSnapshot snapshot1 = getById(snapshotId1);
        VersionSnapshot snapshot2 = getById(snapshotId2);

        if (snapshot1 == null || snapshot2 == null) {
            throw new RuntimeException("版本快照不存在");
        }

        try {
            List<Contact> contacts1 = parseSnapshot(snapshot1);
            List<Contact> contacts2 = parseSnapshot(snapshot2);

            Map<String, Contact> map1 = contacts1.stream()
                    .collect(Collectors.toMap(Contact::getUid, c -> c, (a, b) -> a));
            Map<String, Contact> map2 = contacts2.stream()
                    .collect(Collectors.toMap(Contact::getUid, c -> c, (a, b) -> a));

            Set<String> allUids = new HashSet<>();
            allUids.addAll(map1.keySet());
            allUids.addAll(map2.keySet());

            List<Map<String, Object>> added = new ArrayList<>();
            List<Map<String, Object>> removed = new ArrayList<>();
            List<Map<String, Object>> updated = new ArrayList<>();
            List<Map<String, Object>> unchanged = new ArrayList<>();

            for (String uid : allUids) {
                Contact c1 = map1.get(uid);
                Contact c2 = map2.get(uid);

                Map<String, Object> diff = new LinkedHashMap<>();
                diff.put("uid", uid);

                if (c1 == null && c2 != null) {
                    diff.put("name", c2.getFormattedName());
                    added.add(diff);
                } else if (c1 != null && c2 == null) {
                    diff.put("name", c1.getFormattedName());
                    removed.add(diff);
                } else if (c1 != null && c2 != null) {
                        diff.put("name", c2.getFormattedName());
                    if (!c1.getHashCode().equals(c2.getHashCode())) {
                        List<Map<String, String>> changes = compareContactFields(c1, c2);
                        diff.put("changes", changes);
                        updated.add(diff);
                    } else {
                        unchanged.add(diff);
                    }
                }
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("version1", snapshot1.getVersion());
            result.put("version2", snapshot2.getVersion());
            result.put("summary", Map.of(
                    "added", added.size(),
                    "removed", removed.size(),
                    "updated", updated.size(),
                    "unchanged", unchanged.size()
            ));
            result.put("added", added);
            result.put("removed", removed);
            result.put("updated", updated);
            result.put("unchanged", unchanged);

            return result;
        } catch (Exception e) {
            log.error("版本对比失败", e);
            throw new RuntimeException("版本对比失败");
        }
    }

    private List<Contact> parseSnapshot(VersionSnapshot snapshot) {
        try {
            return objectMapper.readValue(
                    snapshot.getSnapshotData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Contact.class)
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Map<String, String>> compareContactFields(Contact c1, Contact c2) {
        List<Map<String, String>> changes = new ArrayList<>();

        compareField(changes, "姓名", c1.getFormattedName(), c2.getFormattedName());
        compareField(changes, "公司", c1.getOrganization(), c2.getOrganization());
        compareField(changes, "职位", c1.getTitle(), c2.getTitle());
        compareField(changes, "电话", c1.getPhones(), c2.getPhones());
        compareField(changes, "邮箱", c1.getEmails(), c2.getEmails());
        compareField(changes, "备注", c1.getNote(), c2.getNote());

        return changes;
    }

    private void compareField(List<Map<String, String>> changes, String fieldName, String oldVal, String newVal) {
        boolean oldEmpty = oldVal == null || oldVal.isEmpty() || oldVal.equals("[]");
        boolean newEmpty = newVal == null || newVal.isEmpty() || newVal.equals("[]");

        if (oldEmpty && newEmpty) return;
        if (!Objects.equals(oldVal, newVal)) {
            Map<String, String> change = new LinkedHashMap<>();
            change.put("field", fieldName);
            change.put("old", oldVal);
            change.put("new", newVal);
            changes.add(change);
        }
    }
}
