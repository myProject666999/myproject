package com.insurance.config;

import com.insurance.entity.*;
import com.insurance.service.InsurancePolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private InsurancePolicyService policyService;

    @Override
    public void run(String... args) {
        if (policyService.getAllPolicies().isEmpty()) {
            try {
                createSamplePolicies();
            } catch (Exception e) {
                System.err.println("Data initialization failed: " + e.getMessage());
            }
        }
    }

    private void createSamplePolicies() {
        createLifeInsurancePolicy();
        createHealthInsurancePolicy();
        createAutoInsurancePolicy();
    }

    private void createLifeInsurancePolicy() {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setInsuranceType("LIFE");
        policy.setSumInsured(new BigDecimal("1000000.00"));
        policy.setPremium(new BigDecimal("5000.00"));
        policy.setPaymentCycle("ANNUALLY");
        policy.setEffectiveDate(LocalDate.now().minusYears(1));
        policy.setExpiryDate(LocalDate.now().plusYears(4));
        policy.setInsuranceCompany("平安人寿");
        policy.setRemarks("终身寿险，保障全面");
        policy.setStatus("ACTIVE");

        InsuredPerson insured = new InsuredPerson();
        insured.setName("张三");
        insured.setIdCard("110101199001011234");
        insured.setBirthDate(LocalDate.of(1990, 1, 1));
        insured.setGender("MALE");
        insured.setPhone("13800138001");
        insured.setEmail("zhangsan@example.com");
        insured.setAddress("北京市朝阳区");
        policy.setInsuredPerson(insured);

        List<Beneficiary> beneficiaries = new ArrayList<>();
        Beneficiary b1 = new Beneficiary();
        b1.setName("张小明");
        b1.setIdCard("110101201501011234");
        b1.setRelationship("子女");
        b1.setBenefitPercentage(new BigDecimal("50.00"));
        b1.setPhone("13800138002");
        beneficiaries.add(b1);

        Beneficiary b2 = new Beneficiary();
        b2.setName("李华");
        b2.setIdCard("110101198901011234");
        b2.setRelationship("配偶");
        b2.setBenefitPercentage(new BigDecimal("50.00"));
        b2.setPhone("13800138003");
        beneficiaries.add(b2);

        policy.setBeneficiaries(beneficiaries);
        policyService.createPolicy(policy);
    }

    private void createHealthInsurancePolicy() {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setInsuranceType("HEALTH");
        policy.setSumInsured(new BigDecimal("500000.00"));
        policy.setPremium(new BigDecimal("3000.00"));
        policy.setPaymentCycle("ANNUALLY");
        policy.setEffectiveDate(LocalDate.now().minusMonths(6));
        policy.setExpiryDate(LocalDate.now().plusYears(1).minusMonths(6));
        policy.setInsuranceCompany("泰康在线");
        policy.setRemarks("百万医疗险，涵盖重疾");
        policy.setStatus("ACTIVE");

        InsuredPerson insured = new InsuredPerson();
        insured.setName("李四");
        insured.setIdCard("310101198505055678");
        insured.setBirthDate(LocalDate.of(1985, 5, 5));
        insured.setGender("FEMALE");
        insured.setPhone("13900139001");
        insured.setEmail("lisi@example.com");
        insured.setAddress("上海市浦东新区");
        policy.setInsuredPerson(insured);

        List<Beneficiary> beneficiaries = new ArrayList<>();
        Beneficiary b1 = new Beneficiary();
        b1.setName("李小华");
        b1.setIdCard("310101201005055678");
        b1.setRelationship("子女");
        b1.setBenefitPercentage(new BigDecimal("100.00"));
        b1.setPhone("13900139002");
        beneficiaries.add(b1);

        policy.setBeneficiaries(beneficiaries);
        policyService.createPolicy(policy);
    }

    private void createAutoInsurancePolicy() {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setInsuranceType("AUTO");
        policy.setSumInsured(new BigDecimal("2000000.00"));
        policy.setPremium(new BigDecimal("4500.00"));
        policy.setPaymentCycle("ANNUALLY");
        policy.setEffectiveDate(LocalDate.now().minusMonths(3));
        policy.setExpiryDate(LocalDate.now().plusYears(1).minusMonths(3));
        policy.setInsuranceCompany("中国人保");
        policy.setRemarks("车险，含交强险和商业险");
        policy.setStatus("ACTIVE");

        InsuredPerson insured = new InsuredPerson();
        insured.setName("王五");
        insured.setIdCard("440101198808089012");
        insured.setBirthDate(LocalDate.of(1988, 8, 8));
        insured.setGender("MALE");
        insured.setPhone("13700137001");
        insured.setEmail("wangwu@example.com");
        insured.setAddress("广州市天河区");
        policy.setInsuredPerson(insured);

        List<Beneficiary> beneficiaries = new ArrayList<>();
        Beneficiary b1 = new Beneficiary();
        b1.setName("王五");
        b1.setIdCard("440101198808089012");
        b1.setRelationship("本人");
        b1.setBenefitPercentage(new BigDecimal("100.00"));
        beneficiaries.add(b1);

        policy.setBeneficiaries(beneficiaries);
        policyService.createPolicy(policy);
    }
}
