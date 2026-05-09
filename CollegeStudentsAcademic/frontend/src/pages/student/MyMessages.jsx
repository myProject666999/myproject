import { useEffect, useState } from 'react'
import { List, Button, message, Modal, Form, Input, Tag, Card, Empty } from 'antd'
import { MessageOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons'
import { studentApi } from '../../utils/api'

const statusMap = { 0: '待回复', 1: '已回复' }
const statusColor = { 0: 'orange', 1: 'green' }

function MyMessages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
