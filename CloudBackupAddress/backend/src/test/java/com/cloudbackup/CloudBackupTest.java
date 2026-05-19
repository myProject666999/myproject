package com.cloudbackup;

import cn.hutool.core.io.FileUtil;
import com.cloudbackup.service.ContactService;
import com.cloudbackup.service.VersionSnapshotService;
import com.cloudbackup.util.VCardUtil;
import com.cloudbackup.entity.Contact;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class CloudBackupTest {

    @Autowired
    private ContactService contactService;

    @Autowired
    private VersionSnapshotService versionSnapshotService;

    @Test
    public void testVCardParse() throws IOException {
        String vcardContent = "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                "N:张;三;;;\n" +
                "FN:张三\n" +
                "TEL;TYPE=CELL:13800138000\n" +
                "EMAIL;TYPE=WORK:zhangsan@example.com\n" +
                "ORG:科技有限公司\n" +
                "TITLE:高级工程师\n" +
                "END:VCARD\n" +
                "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                "N:李;四;;;\n" +
                "FN:李四\n" +
                "TEL;TYPE=CELL:13900139000\n" +
                "EMAIL;TYPE=WORK:lisi@example.com\n" +
                "END:VCARD";

        File tempFile = File.createTempFile("test", ".vcf");
        FileUtil.writeUtf8String(vcardContent, tempFile);

        List<Contact> contacts = VCardUtil.parseVCardFile(new org.springframework.mock.web.MockMultipartFile(
                "file", tempFile.getName(), "text/vcard", FileUtil.readBytes(tempFile)
        ));

        System.out.println("解析到 " + contacts.size() + " 个联系人");
        for (Contact contact : contacts) {
            System.out.println("姓名: " + contact.getFormattedName());
            System.out.println("电话: " + contact.getPhones());
            System.out.println("邮箱: " + contact.getEmails());
            System.out.println("公司: " + contact.getOrganization());
            System.out.println("UID: " + contact.getUid());
            System.out.println("HashCode: " + contact.getHashCode());
            System.out.println("---");
        }

        tempFile.delete();
    }

    @Test
    public void testContactToVCard() throws IOException {
        String vcardContent = "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                "N:张;三;;;\n" +
                "FN:张三\n" +
                "TEL;TYPE=CELL:13800138000\n" +
                "EMAIL;TYPE=WORK:zhangsan@example.com\n" +
                "ORG:科技有限公司\n" +
                "TITLE:高级工程师\n" +
                "END:VCARD";

        File tempFile = File.createTempFile("test", ".vcf");
        FileUtil.writeUtf8String(vcardContent, tempFile);

        List<Contact> contacts = VCardUtil.parseVCardFile(new org.springframework.mock.web.MockMultipartFile(
                "file", tempFile.getName(), "text/vcard", FileUtil.readBytes(tempFile)
        ));

        System.out.println("解析到 " + contacts.size() + " 个联系人，开始测试导出...");
        
        String exportedVCard = VCardUtil.contactsToVCard(contacts);
        System.out.println("导出的 vCard 内容:");
        System.out.println(exportedVCard);
        System.out.println("---");

        tempFile.delete();
    }

    @Test
    public void testCompareVersions() {
        Map<String, Object> result = versionSnapshotService.compareVersions(1L, 2L);
        System.out.println("对比结果: " + result);
    }
}
