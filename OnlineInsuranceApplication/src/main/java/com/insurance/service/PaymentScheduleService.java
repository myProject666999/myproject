package com.insurance.service;

import com.insurance.entity.InsurancePolicy;
import com.insurance.entity.PaymentRecord;
import com.insurance.entity.Reminder;
import com.insurance.repository.PaymentRecordRepository;
import com.insurance.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentScheduleService {
    @Autowired
    private PaymentRecordRepository paymentRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Transactional
    public List<PaymentRecord> generatePaymentSchedule(InsurancePolicy policy) {
        List<PaymentRecord> records = new ArrayList<>();
        BigDecimal premium = policy.getPremium();
        LocalDate effectiveDate = policy.getEffectiveDate();
        LocalDate expiryDate = policy.getExpiryDate();
        String paymentCycle = policy.getPaymentCycle();

        List<LocalDate> dueDates = calculateDueDates(effectiveDate, expiryDate, paymentCycle);
        BigDecimal paymentAmount = calculatePaymentAmount(premium, paymentCycle);

        for (int i = 0; i < dueDates.size(); i++) {
            LocalDate dueDate = dueDates.get(i);
            PaymentRecord record = new PaymentRecord();
            record.setAmount(paymentAmount);
            record.setDueDate(dueDate);
            record.setPaymentMethod("BANK_TRANSFER");
            record.setStatus(i == 0 && dueDate.isBefore(LocalDate.now()) ? "PAID" : "PENDING");
            record.setPolicy(policy);
            records.add(paymentRepository.save(record));
            createPaymentReminder(policy, record, dueDate);
        }

        return records;
    }

    private List<LocalDate> calculateDueDates(LocalDate effectiveDate, LocalDate expiryDate, String paymentCycle) {
        List<LocalDate> dueDates = new ArrayList<>();
        LocalDate currentDate = effectiveDate;

        while (!currentDate.isAfter(expiryDate)) {
            dueDates.add(currentDate);
            switch (paymentCycle.toUpperCase()) {
                case "MONTHLY":
                    currentDate = currentDate.plusMonths(1);
                    break;
                case "QUARTERLY":
                    currentDate = currentDate.plusMonths(3);
                    break;
                case "SEMI_ANNUALLY":
                    currentDate = currentDate.plusMonths(6);
                    break;
                case "ANNUALLY":
                    currentDate = currentDate.plusYears(1);
                    break;
                case "SINGLE":
                    return dueDates;
                default:
                    currentDate = currentDate.plusYears(1);
            }
        }

        return dueDates;
    }

    private BigDecimal calculatePaymentAmount(BigDecimal annualPremium, String paymentCycle) {
        String cycle = paymentCycle.toUpperCase();
        if ("MONTHLY".equals(cycle)) {
            return annualPremium.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        } else if ("QUARTERLY".equals(cycle)) {
            return annualPremium.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
        } else if ("SEMI_ANNUALLY".equals(cycle)) {
            return annualPremium.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        } else if ("ANNUALLY".equals(cycle) || "SINGLE".equals(cycle)) {
            return annualPremium.setScale(2, RoundingMode.HALF_UP);
        } else {
            return annualPremium.setScale(2, RoundingMode.HALF_UP);
        }
    }

    private void createPaymentReminder(InsurancePolicy policy, PaymentRecord record, LocalDate dueDate) {
        LocalDate reminderDate = dueDate.minusDays(7);
        if (reminderDate.isAfter(LocalDate.now())) {
            Reminder reminder = new Reminder();
            reminder.setType("PAYMENT");
            reminder.setTitle("缴费提醒 - " + policy.getPolicyNumber());
            reminder.setMessage("保单号 " + policy.getPolicyNumber() + " 的保费 " + record.getAmount() + " 元将于 " + dueDate + " 到期，请及时缴费。");
            reminder.setReminderDate(reminderDate);
            reminder.setStatus("PENDING");
            reminder.setPolicy(policy);
            reminder.setPaymentRecord(record);
            reminderRepository.save(reminder);
        }
    }
}
