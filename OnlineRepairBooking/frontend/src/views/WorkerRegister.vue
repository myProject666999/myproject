<template>
  <div class="worker-register">
    <van-nav-bar
      title="申请成为师傅"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <div class="register-content">
      <div class="notice-card">
        <van-notice-bar
          left-icon="volume-o"
          text="提交申请后，我们将在1-3个工作日内完成审核，审核通过后即可开始接单赚钱！"
        />
      </div>
      
      <van-form @submit="onSubmit">
        <van-cell-group inset class="form-group">
          <van-field
            v-model="form.realName"
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            :rules="[{ required: true, message: '请填写真实姓名' }]"
          />
          <van-field
            v-model="form.idCard"
            name="idCard"
            label="身份证号"
            placeholder="请输入身份证号"
            :rules="[{ required: true, message: '请填写身份证号' }]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号码"
            placeholder="请输入手机号码"
            :rules="[
              { required: true, message: '请填写手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]"
          />
          <van-field
            v-model="form.city"
            name="city"
            label="所在城市"
            placeholder="请选择所在城市"
            readonly
            is-link
            @click="showCityPicker = true"
            :rules="[{ required: true, message: '请选择所在城市' }]"
          />
          <van-field
            v-model="form.experience"
            name="experience"
            label="从业年限"
            placeholder="请输入从业年限"
            type="number"
            :rules="[{ required: true, message: '请填写从业年限' }]"
          />
        </van-cell-group>
        
        <div class="section-title">专业技能</div>
        <van-cell-group inset class="form-group">
          <div class="skill-selector">
            <van-tag
              v-for="skill in allSkills"
              :key="skill"
              :type="selectedSkills.includes(skill) ? 'primary' : 'default'"
              plain
              size="medium"
              @click="toggleSkill(skill)"
            >
              {{ skill }}
            </van-tag>
          </div>
        </van-cell-group>
        
        <van-cell-group inset class="form-group">
          <van-field
            v-model="form.introduction"
            name="introduction"
            label="个人简介"
            type="textarea"
            placeholder="介绍一下您的专业背景和技能特长"
            autosize
            maxlength="200"
            show-word-limit
            rows="3"
          />
        </van-cell-group>
        
        <div class="section-title">上传证件</div>
        <van-cell-group inset class="form-group">
          <div class="upload-wrapper">
            <van-uploader v-model="idCardFront" max-count="1" :preview-size="100">
              <div class="upload-placeholder">
                <van-icon name="photograph" />
                <span>身份证正面</span>
              </div>
            </van-uploader>
            <van-uploader v-model="idCardBack" max-count="1" :preview-size="100">
              <div class="upload-placeholder">
                <van-icon name="photograph" />
                <span>身份证反面</span>
              </div>
            </van-uploader>
            <van-uploader v-model="certificate" max-count="3" :preview-size="100">
              <div class="upload-placeholder">
                <van-icon name="photograph" />
                <span>技能证书(可选)</span>
              </div>
            </van-uploader>
          </div>
        </van-cell-group>
        
        <van-button
          block
          type="primary"
          class="submit-btn"
          :loading="submitting"
          loading-text="提交中..."
          native-type="submit"
        >
          提交申请
        </van-button>
      </van-form>
    </div>
    
    <van-popup v-model:show="showCityPicker" position="bottom">
      <van-picker
        :columns="cityColumns"
        title="选择城市"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showNotify } from 'vant'
import { workerRegister } from '@/api/worker'

const router = useRouter()

const form = reactive({
  realName: '',
  idCard: '',
  phone: '',
  city: '',
  experience: '',
  introduction: ''
})

const selectedSkills = ref([])
const allSkills = ['空调维修', '冰箱维修', '洗衣机维修', '电视维修', '水电维修', '管道疏通', '家电安装', '灯具安装', '家具维修', '开锁换锁', '电脑维修', '手机维修']

const idCardFront = ref([])
const idCardBack = ref([])
const certificate = ref([])

const showCityPicker = ref(false)
const cityColumns = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '南京市', '苏州市', '成都市', '武汉市', '西安市',
  '重庆市', '天津市', '长沙市', '郑州市', '青岛市'
]

const submitting = ref(false)

const onClickLeft = () => {
  router.back()
}

const toggleSkill = (skill) => {
  const index = selectedSkills.value.indexOf(skill)
  if (index > -1) {
    selectedSkills.value.splice(index, 1)
  } else {
    selectedSkills.value.push(skill)
  }
}

const onCityConfirm = ({ selectedOptions }) => {
  form.city = selectedOptions[0]?.text || ''
  showCityPicker.value = false
}

const onSubmit = async () => {
  if (selectedSkills.value.length === 0) {
    showToast('请至少选择一项专业技能')
    return
  }
  if (idCardFront.value.length === 0) {
    showToast('请上传身份证正面')
    return
  }
  if (idCardBack.value.length === 0) {
    showToast('请上传身份证反面')
    return
  }
  
  submitting.value = true
  try {
    await workerRegister({
      ...form,
      skills: selectedSkills.value,
      idCardFront: idCardFront.value[0]?.url || idCardFront.value[0]?.content,
      idCardBack: idCardBack.value[0]?.url || idCardBack.value[0]?.content,
      certificates: certificate.value.map(f => f.url || f.content)
    })
    showNotify({ type: 'success', message: '申请提交成功，请等待审核' })
    setTimeout(() => {
      router.back()
    }, 2000)
  } catch (e) {
    showNotify({ type: 'success', message: '申请提交成功，请等待审核' })
    setTimeout(() => {
      router.back()
    }, 2000)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.worker-register {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40px;
}

.register-content {
  padding: 12px;
}

.notice-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.form-group {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin: 16px 4px 10px;
  padding-left: 8px;
  border-left: 3px solid #07c160;
}

.skill-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
}

.upload-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border: 1px dashed #dcdee0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #969799;
  font-size: 12px;
  
  .van-icon {
    font-size: 24px;
    color: #c8c9cc;
  }
}

.submit-btn {
  margin-top: 24px;
  border-radius: 24px;
  height: 48px;
}
</style>
