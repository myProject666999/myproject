package com.cloudbackup.util;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.SecureUtil;
import com.cloudbackup.entity.Contact;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ezvcard.Ezvcard;
import ezvcard.VCard;
import ezvcard.parameter.EmailType;
import ezvcard.parameter.TelephoneType;
import ezvcard.property.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class VCardUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<Contact> parseVCardFile(MultipartFile file) throws IOException {
        List<Contact> contacts = new ArrayList<>();
        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            List<VCard> vCards = Ezvcard.parse(reader).all();
            for (VCard vCard : vCards) {
                Contact contact = convertToContact(vCard);
                contacts.add(contact);
            }
        }
        return contacts;
    }

    public static Contact convertToContact(VCard vCard) {
        Contact contact = new Contact();

        contact.setVcardUid(vCard.getUid() != null ? vCard.getUid().getValue() : "");

        StructuredName structuredName = vCard.getStructuredName();
        if (structuredName != null) {
            contact.setFirstName(structuredName.getGiven());
            contact.setLastName(structuredName.getFamily());
            contact.setMiddleName(StrUtil.join(" ", structuredName.getAdditionalNames()));
        }

        FormattedName formattedName = vCard.getFormattedName();
        if (formattedName != null) {
            contact.setFormattedName(formattedName.getValue());
        } else {
            String fullName = buildFullName(contact);
            contact.setFormattedName(fullName);
        }

        Nickname nickname = vCard.getNickname();
        if (nickname != null) {
            contact.setNickname(StrUtil.join(" ", nickname.getValues()));
        }

        List<Title> titles = vCard.getTitles();
        if (titles != null && !titles.isEmpty()) {
            contact.setTitle(titles.get(0).getValue());
        }

        Organization organization = vCard.getOrganization();
        if (organization != null) {
            contact.setOrganization(StrUtil.join(" ", organization.getValues()));
        }

        contact.setEmails(toJson(convertEmails(vCard.getEmails())));
        contact.setPhones(toJson(convertPhones(vCard.getTelephoneNumbers())));
        contact.setAddresses(toJson(convertAddresses(vCard.getAddresses())));
        contact.setUrls(toJson(convertUrls(vCard.getUrls())));

        Birthday birthday = vCard.getBirthday();
        if (birthday != null && birthday.getDate() != null) {
            if (birthday.getDate() instanceof java.time.LocalDate) {
                contact.setBirthday(java.sql.Date.valueOf((java.time.LocalDate) birthday.getDate()));
            } else if (birthday.getDate() instanceof java.util.Date) {
                contact.setBirthday((java.util.Date) birthday.getDate());
            }
        }

        List<Note> notes = vCard.getNotes();
        if (notes != null && !notes.isEmpty()) {
            contact.setNote(notes.get(0).getValue());
        }

        List<Photo> photos = vCard.getPhotos();
        if (photos != null && !photos.isEmpty() && photos.get(0).getData() != null) {
            contact.setPhoto(Base64.getEncoder().encodeToString(photos.get(0).getData()));
        }

        contact.setVcardData(Ezvcard.write(vCard).go());

        contact.setUid(generateUid(contact));
        contact.setHashCode(generateHashCode(contact));

        return contact;
    }

    private static String buildFullName(Contact contact) {
        List<String> parts = new ArrayList<>();
        if (StrUtil.isNotBlank(contact.getLastName())) {
            parts.add(contact.getLastName());
        }
        if (StrUtil.isNotBlank(contact.getFirstName())) {
            parts.add(contact.getFirstName());
        }
        if (StrUtil.isNotBlank(contact.getMiddleName())) {
            parts.add(contact.getMiddleName());
        }
        return String.join(" ", parts);
    }

    private static List<Map<String, String>> convertEmails(List<Email> emails) {
        return emails.stream().map(email -> {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("value", email.getValue());
            map.put("types", email.getTypes().stream()
                    .map(EmailType::getValue)
                    .collect(Collectors.joining(",")));
            return map;
        }).collect(Collectors.toList());
    }

    private static List<Map<String, String>> convertPhones(List<Telephone> phones) {
        return phones.stream().map(phone -> {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("value", phone.getText());
            map.put("types", phone.getTypes().stream()
                    .map(TelephoneType::getValue)
                    .collect(Collectors.joining(",")));
            return map;
        }).collect(Collectors.toList());
    }

    private static List<Map<String, String>> convertAddresses(List<Address> addresses) {
        return addresses.stream().map(addr -> {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("street", addr.getStreetAddress());
            map.put("city", addr.getLocality());
            map.put("region", addr.getRegion());
            map.put("postalCode", addr.getPostalCode());
            map.put("country", addr.getCountry());
            map.put("label", addr.getLabel());
            return map;
        }).collect(Collectors.toList());
    }

    private static List<Map<String, String>> convertUrls(List<Url> urls) {
        return urls.stream().map(url -> {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("value", url.getValue());
            return map;
        }).collect(Collectors.toList());
    }

    private static String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("序列化失败", e);
            return "[]";
        }
    }

    public static <T> T fromJson(String json, TypeReference<T> typeRef) {
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            log.error("反序列化失败", e);
            return null;
        }
    }

    public static String generateUid(Contact contact) {
        StringBuilder sb = new StringBuilder();
        if (StrUtil.isNotBlank(contact.getVcardUid())) {
            sb.append(contact.getVcardUid());
        } else {
            sb.append(contact.getFormattedName());
            sb.append("|");
            sb.append(contact.getPhones());
            sb.append("|");
            sb.append(contact.getEmails());
        }
        return SecureUtil.md5(sb.toString());
    }

    public static String generateHashCode(Contact contact) {
        StringBuilder sb = new StringBuilder();
        sb.append(contact.getFormattedName()).append("|");
        sb.append(contact.getFirstName()).append("|");
        sb.append(contact.getLastName()).append("|");
        sb.append(contact.getPhones()).append("|");
        sb.append(contact.getEmails()).append("|");
        sb.append(contact.getOrganization()).append("|");
        sb.append(contact.getTitle()).append("|");
        sb.append(contact.getNote());
        return SecureUtil.sha256(sb.toString());
    }

    public static String contactsToVCard(List<Contact> contacts) {
        List<VCard> vCards = contacts.stream()
                .map(VCardUtil::contactToVCard)
                .collect(Collectors.toList());
        return Ezvcard.write(vCards).go();
    }

    public static VCard contactToVCard(Contact contact) {
        VCard vcard = new VCard();

        if (StrUtil.isNotBlank(contact.getVcardUid())) {
            vcard.setUid(contact.getVcardUid());
        }

        vcard.setFormattedName(contact.getFormattedName());

        StructuredName structuredName = new StructuredName();
        if (StrUtil.isNotBlank(contact.getLastName())) {
            structuredName.setFamily(contact.getLastName());
        }
        if (StrUtil.isNotBlank(contact.getFirstName())) {
            structuredName.setGiven(contact.getFirstName());
        }
        vcard.setStructuredName(structuredName);

        if (StrUtil.isNotBlank(contact.getNickname())) {
            vcard.setNickname(contact.getNickname());
        }

        if (StrUtil.isNotBlank(contact.getTitle())) {
            vcard.setTitle(contact.getTitle());
        }

        if (StrUtil.isNotBlank(contact.getOrganization())) {
            vcard.setOrganization(contact.getOrganization());
        }

        if (StrUtil.isNotBlank(contact.getEmails())) {
            List<Map<String, String>> emailList = fromJson(contact.getEmails(), new TypeReference<List<Map<String, String>>>() {});
            if (emailList != null) {
                for (Map<String, String> emailMap : emailList) {
                    Email email = new Email(emailMap.get("value"));
                    String types = emailMap.get("types");
                    if (StrUtil.isNotBlank(types)) {
                        for (String type : types.split(",")) {
                            email.getTypes().add(EmailType.get(type));
                        }
                    }
                    vcard.addEmail(email);
                }
            }
        }

        if (StrUtil.isNotBlank(contact.getPhones())) {
            List<Map<String, String>> phoneList = fromJson(contact.getPhones(), new TypeReference<List<Map<String, String>>>() {});
            if (phoneList != null) {
                for (Map<String, String> phoneMap : phoneList) {
                    Telephone phone = new Telephone(phoneMap.get("value"));
                    String types = phoneMap.get("types");
                    if (StrUtil.isNotBlank(types)) {
                        for (String type : types.split(",")) {
                            phone.getTypes().add(TelephoneType.get(type));
                        }
                    }
                    vcard.addTelephoneNumber(phone);
                }
            }
        }

        if (StrUtil.isNotBlank(contact.getNote())) {
            vcard.addNote(contact.getNote());
        }

        if (contact.getBirthday() != null) {
            vcard.setBirthday(contact.getBirthday());
        }

        return vcard;
    }
}
