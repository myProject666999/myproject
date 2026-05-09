import { useEffect, useState } from 'react'
import { List, Button, message, Modal, Form, Input, Tag, Card, Empty } from 'antd'
import { MessageOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons'
import { studentApi } from '../../utils/api'

const statusMap = { 0: '待回复', 1: '已回复' }
const statusColor = { 0: 'orange', 1: 'green' }

function MyMessages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await studentApi.getMessages({ page: pagination.page, page_size: pagination.page_size })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: