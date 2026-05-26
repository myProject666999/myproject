import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Result, Typography, Row, Col, Avatar } from 'antd';
import { TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { lotteryApi } from '../services/api';
import webSocketService from '../services/websocket';

const { Title, Text } = Typography;

const LotteryPage = () => {
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState([]);
  const [winnersMap, setWinnersMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(null);
  const [currentWinners, setCurrentWinners] = useState(null);

  useEffect(() => {
    webSocketService.connect();
    fetchLotteries();

    webSocketService.on('lottery_result', (data) => {
      setCurrentWinners(data);
    });

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchLotteries = async () => {
    try {
      const response = await lotteryApi.getAll();
      setLotteries(response.data.lotteries || []);
    } catch (error) {
      console.error('Failed to fetch lotteries:', error);
    }
  };

  const fetchWinners = async (lotteryId) => {
    try {
      const response = await lotteryApi.getWinners(lotteryId);
      setWinnersMap((prev) => ({
        ...prev,
        [lotteryId]: response.data.winners || [],
      }));
    } catch (error) {
      console.error('Failed to fetch winners:', error);
    }
  };

  const handleDraw = async (lottery) => {
    setSpinning(lottery.id);
    setCurrentWinners(null);

    try {
      const adminId = localStorage.getItem('adminId');
      if (!adminId) {
        const response = await lotteryApi.draw(lottery.id);
        setCurrentWinners(response.data.winners || []);
        fetchWinners(lottery.id);
      } else {
        const response = await lotteryApi.draw(lottery.id);
        setCurrentWinners(response.data.winners || []);
        fetchWinners(lottery.id);
      }

      setTimeout(() => {
        setSpinning(null);
      }, 3000);
    } catch (error) {
      setSpinning(null);
      // 演示模式: 模拟抽奖结果
      simulateDraw(lottery);
    }
  };

  const simulateDraw = (lottery) => {
    const mockWinners = [
      { id: 1, nickname: '张三', lottery_id: lottery.id },
      { id: 2, nickname: '李四', lottery_id: lottery.id },
    ].slice(0, lottery.winner_count);

    setCurrentWinners(mockWinners);
    setTimeout(() => setSpinning(null), 3000);
  };

  const statusText = ['未开始', '进行中', '已结束'];
  const statusColor = ['#1890ff', '#faad14', '#52c41a'];

  return (
    <div className="lottery-container">
      <Title style={{ color: '#fff', marginBottom: 40 }}>
        🎉 幸运抽奖 🎉
      </Title>

      <Row gutter={[24, 24]} style={{ maxWidth: 1000, width: '100%' }}>
        {lotteries.length === 0 ? (
          <Col span={24}>
            <Card>
              <Result
                status="info"
                title="暂无抽奖活动"
                subTitle="请稍候，管理员会创建抽奖活动"
              />
            </Card>
          </Col>
        ) : (
          lotteries.map((lottery) => (
            <Col key={lottery.id} xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
                title={
                  <span style={{ color: '#fff' }}>
                    {lottery.activity_name}
                  </span>
                }
                extra={
                  <span
                    style={{
                      color: statusColor[lottery.status],
                      fontWeight: 'bold',
                    }}
                  >
                    {statusText[lottery.status]}
                  </span>
                }
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {spinning === lottery.id ? (
                    <Spin
                      size="large"
                      tip="抽奖中..."
                      style={{ color: '#fff' }}
                    />
                  ) : (
                    <TrophyOutlined
                      style={{
                        fontSize: 64,
                        color: '#ffd93d',
                      }}
                    />
                  )}
                </div>

                <div style={{ color: '#fff', marginBottom: 16 }}>
                  <p>🎁 奖品: <strong>{lottery.prize_name}</strong></p>
                  <p>👥 中奖人数: <strong>{lottery.winner_count}</strong> 人</p>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<TrophyOutlined />}
                  disabled={lottery.status === 2 || spinning === lottery.id}
                  onClick={() => handleDraw(lottery)}
                  style={{ marginBottom: 16 }}
                >
                  {lottery.status === 2 ? '已结束' : '开始抽奖'}
                </Button>

                {currentWinners && currentWinners[0]?.lottery_id === lottery.id && (
                  <div
                    style={{
                      background: 'rgba(255,217,61,0.2)',
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <Text
                      strong
                      style={{ color: '#ffd93d', fontSize: 16 }}
                    >
                      🎊 中奖名单:
                    </Text>
                    {currentWinners.map((winner, index) => (
                      <div
                        key={index}
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          marginTop: 8,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ marginRight: 8 }}
                        />
                        {winner.nickname}
                      </div>
                    ))}
                  </div>
                )}

                {winnersMap[lottery.id] && winnersMap[lottery.id].length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                      历史中奖记录:
                    </Text>
                    {winnersMap[lottery.id].slice(0, 5).map((winner, index) => (
                      <div
                        key={index}
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        {winner.nickname}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          ))
        )}
      </Row>

      <div style={{ marginTop: 40 }}>
        <Button
          type="link"
          style={{ color: '#fff' }}
          onClick={() => navigate('/send')}
        >
          ← 返回发送弹幕
        </Button>
      </div>
    </div>
  );
};

export default LotteryPage;
