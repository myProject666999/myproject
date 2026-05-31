package com.smartdoor.task;

import com.smartdoor.service.LeaseContractService;
import com.smartdoor.service.LockPasswordService;
import com.smartdoor.service.RentBillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    @Autowired
    private LockPasswordService lockPasswordService;

    @Autowired
    private RentBillService rentBillService;

    @Autowired
    private LeaseContractService leaseContractService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkPasswordExpireTask() {
        log.info("开始执行【密码过期检查】定时任务");
        try {
            lockPasswordService.checkPasswordExpire();
            log.info("【密码过期检查】定时任务执行完成");
        } catch (Exception e) {
            log.error("【密码过期检查】定时任务执行异常", e);
        }
    }

    @Scheduled(cron = "0 0 2 1 * ?")
    public void generateMonthlyBillsTask() {
        log.info("开始执行【月度账单生成】定时任务");
        try {
            rentBillService.generateMonthlyBills();
            log.info("【月度账单生成】定时任务执行完成");
        } catch (Exception e) {
            log.error("【月度账单生成】定时任务执行异常", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkBillOverdueTask() {
        log.info("开始执行【账单逾期检查】定时任务");
        try {
            rentBillService.checkBillOverdue();
            log.info("【账单逾期检查】定时任务执行完成");
        } catch (Exception e) {
            log.error("【账单逾期检查】定时任务执行异常", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendPaymentRemindersTask() {
        log.info("开始执行【缴费提醒发送】定时任务");
        try {
            rentBillService.sendPaymentReminders();
            log.info("【缴费提醒发送】定时任务执行完成");
        } catch (Exception e) {
            log.error("【缴费提醒发送】定时任务执行异常", e);
        }
    }

    @Scheduled(cron = "0 0 4 * * ?")
    public void checkContractExpireTask() {
        log.info("开始执行【租约过期检查】定时任务");
        try {
            leaseContractService.checkContractExpire();
            log.info("【租约过期检查】定时任务执行完成");
        } catch (Exception e) {
            log.error("【租约过期检查】定时任务执行异常", e);
        }
    }
}
