import cron from 'node-cron';
import pool from '../config/database';

const triggeredAlerts: Map<number, string> = new Map();

export const startAlertCron = () => {
  console.log('启动提醒定时任务...');

  cron.schedule('* * * * *', async () => {
    try {
      const [alerts] = await pool.query(
        `SELECT a.id, a.user_id, a.symbol, a.type, a.threshold, s.price, s.change_percent
         FROM alerts a
         LEFT JOIN stocks s ON a.symbol = s.symbol
         WHERE a.enabled = 1 AND a.triggered = 0`
      ) as any;

      for (const alert of alerts) {
        let shouldTrigger = false;
        let message = '';

        switch (alert.type) {
          case 'price_above':
            if (alert.price >= alert.threshold) {
              shouldTrigger = true;
              message = `${alert.symbol} 价格已上涨至 ${alert.price}，超过您设置的 ${alert.threshold}`;
            }
            break;
          case 'price_below':
            if (alert.price <= alert.threshold) {
              shouldTrigger = true;
              message = `${alert.symbol} 价格已下跌至 ${alert.price}，低于您设置的 ${alert.threshold}`;
            }
            break;
          case 'change_percent':
            if (Math.abs(alert.change_percent) >= Math.abs(alert.threshold)) {
              shouldTrigger = true;
              message = `${alert.symbol} 涨跌幅已达 ${alert.change_percent}%`;
            }
            break;
        }

        if (shouldTrigger) {
          console.log(`提醒触发: ${message}`);
          triggeredAlerts.set(alert.id, message);

          await pool.query(
            'UPDATE alerts SET triggered = 1 WHERE id = ?',
            [alert.id]
          );
        }
      }
    } catch (error) {
      console.error('提醒检查错误:', error);
    }
  });
};

export const getTriggeredAlerts = (userId: number) => {
  const alerts: string[] = [];
  triggeredAlerts.forEach((message, id) => {
    alerts.push(message);
    triggeredAlerts.delete(id);
  });
  return alerts;
};
