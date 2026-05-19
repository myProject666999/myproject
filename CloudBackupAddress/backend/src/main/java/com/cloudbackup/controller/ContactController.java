package com.cloudbackup.controller;

import com.cloudbackup.common.Result;
import com.cloudbackup.entity.AddressBook;
import com.cloudbackup.entity.Contact;
import com.cloudbackup.service.AddressBookService;
import com.cloudbackup.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@CrossOrigin
public class ContactController {

    private final ContactService contactService;
    private final AddressBookService addressBookService;

    @PostMapping("/upload")
    public Result<Map<String, Object>> upload(
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = contactService.uploadVCard(userId, file);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public Result<List<Contact>> list(@RequestParam("userId") String userId) {
        AddressBook addressBook = addressBookService.getOrCreateByUserId(userId);
        List<Contact> contacts = contactService.listByAddressBookId(addressBook.getId());
        return Result.success(contacts);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam("userId") String userId) {
        AddressBook addressBook = addressBookService.getOrCreateByUserId(userId);
        String vcardContent = contactService.exportToVCard(addressBook.getId());

        byte[] content = vcardContent.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "contacts.vcf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @GetMapping("/export-version/{snapshotId}")
    public ResponseEntity<byte[]> exportVersion(@PathVariable Long snapshotId) {
        String vcardContent = contactService.exportVersionToVCard(snapshotId);

        byte[] content = vcardContent.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "contacts_v" + snapshotId + ".vcf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @PostMapping("/restore/{snapshotId}")
    public Result<Map<String, Object>> restore(
            @RequestParam("userId") String userId,
            @PathVariable Long snapshotId) {
        try {
            Map<String, Object> result = contactService.restoreFromSnapshot(userId, snapshotId);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("还原失败: " + e.getMessage());
        }
    }

    @PostMapping("/merge/{snapshotId}")
    public Result<Map<String, Object>> merge(
            @RequestParam("userId") String userId,
            @PathVariable Long snapshotId) {
        try {
            Map<String, Object> result = contactService.mergeContacts(userId, snapshotId);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("合并失败: " + e.getMessage());
        }
    }

    @PostMapping("/deduplicate")
    public Result<Map<String, Object>> deduplicate(@RequestParam("userId") String userId) {
        AddressBook addressBook = addressBookService.getOrCreateByUserId(userId);
        Map<String, Object> result = contactService.deduplicate(addressBook.getId());
        return Result.success(result);
    }
}
