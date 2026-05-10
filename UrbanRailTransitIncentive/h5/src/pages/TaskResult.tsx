import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar, Button, Cell, CellGroup, Field, Form, Uploader, showToast, Image as VanImage
} from 'vant'
import { LocationO, CameraO } from '@vant/icons'
import { userApi } from '../api'

const TaskResultPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [images, setImages] = useState<any[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          showToast('定位成功')
        },
        () => {
          showToast('定位失败')
        }
      )
    } else {
      showToast('浏览器不支持定位')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const imageUrls = images
        .filter(img => !img.isImage)
        .map(img => img.url || img.file?.preview)
        .join(',')

      const data: any = {
        ...values,
        image_urls: imageUrls
      }

      if (location) {
        data.latitude = location.lat
        data.longitude = location.lng
      }

      await userApi.submitResult(Number(id), data)
      showToast('提交成功')
      navigate('/my/results')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <NavBar title="提交任务结果" leftText="返回" onClickLeft={() => navigate(-1)} />

      <Form form={form} onFinish={handleSubmit}>
        <CellGroup title="任务描述">
          <Field
            name="description"
            type="textarea"
            rows={4}
            placeholder="请描述任务完成情况"
            autosize
            rules={[{ required: true, message: '请填写任务描述' }]}
          />
        </CellGroup>

        <CellGroup title="图片证据">
          <div style={{ padding: 16 }}>
            <Uploader
              v-model={images}
              multiple
              max-count={9}
            />
          </div>
        </CellGroup>

        <CellGroup title="视频链接（可选）">
          <Field
            name="video_url"
            placeholder="请输入视频链接"
          />
        </CellGroup>

        <CellGroup title="位置信息">
          <Cell
            title="当前位置"
            value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '点击获取'}
            isLink
            onClick={getCurrentLocation}
            icon={<LocationO />}
          />
        </CellGroup>

        <div style={{ padding: 16 }}>
          <Button type="primary" block nativeType="submit" loading={loading}>
            提交结果
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default TaskResultPage
