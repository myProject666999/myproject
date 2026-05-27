import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, Button, Empty, Spin, message, Tag, Modal } from 'antd';
import {
  DeleteOutlined,
  RollbackOutlined,
  FileTextOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { documentApi } from '../services/api';

const RecycleBin = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecycled();
  }, [spaceId]);

  const loadRecycled = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getRecycled(spaceId);
      if (res.data.code === 200) {
        setDocuments(res.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (id) => {
    Modal.confirm({
      title: '确认恢复',
      content: '恢复后文档将回到原来的位置，是否继续？',
      onOk: async () => {
        try {
          const res = await documentApi.restoreDocument(id);
          if (res.data.code === 200) {
            message.success('恢复成功');
            loadRecycled();
          }
        } catch (error) {
          message.error('恢复失败');
        }
      }
    });
  };

  return (
    <div style={{ padding: 48, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>
          <DeleteOutlined /> 回收站
        </h1>
        <Button onClick={() => navigate(`/space/${spaceId}`)}>
          返回文档
        </Button>
      </div>

      <Spin spinning={loading}>
        {documents.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={documents}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    type="text"
                    icon={<RollbackOutlined />}
                    onClick={() => handleRestore(item.id)}
                  >
                    恢复
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.isFolder ? (
                      <FolderOutlined style={{ fontSize: 24, color: '#faad14' }} />
                    ) : (
                      <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    )
                  }
                  title={item.title}
                  description={
                    <div>
                      <Tag color="default">已删除</Tag>
                      <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                        删除于 {item.deletedAt}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="回收站为空" />
        )}
      </Spin>
    </div>
  );
};

export default RecycleBin;
