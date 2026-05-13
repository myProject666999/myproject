<template>
  <div class="page-container">
    <van-nav-bar title="智能估价" left-arrow @click-left="router.back()" fixed placeholder />

    <div class="content-wrapper">
      <van-card
        :title="category.name"
        :desc="category.description"
        :thumb="category.icon"
        :price="category.basePrice"
        :currency="''"
      >
        <template #tags>
          <van-tag plain type="primary" v-if="category.unit">
            {{ category.unit }}计价
          </van-tag>
        </template>
        <template #footer>
          <span>基础参考价</span>
        </template>
      </van-card>

      <div v-if="factors.length > 0" class="factors-section">
        <div class="section-title">估价因素</div>
        <van-cell-group inset>
          <template v-for="factor in factors" :key="factor.id">
            <van-cell
              v-if="factor.factorType === 'SELECT'"
              :title="factor.factorName"
              :value="getSelectedOption(factor.id)"
              is-link
              @click="showFactorPicker(factor)"
            />
            <van-field
              v-else-if="factor.factorType === 'NUMBER'"
              v-model.number="numberValues[factor.id]"
              :label="factor.factorName"
              type="number"
              :placeholder="`请输入${factor.factorName}`"
              @change="calculatePrice"
            />
          </template>
        </van-cell-group>
      </div>

      <div class="quantity-section">
        <div class="section-title">数量预估</div>
        <van-field
          v-model.number="quantity"
          label="预估数量"
          type="number"
          :placeholder="`请输入${category.unit || '数量'}`"
          @change="calculatePrice"
        />
      </div>

      <div class="description-section">
        <div class="section-title">物品描述</div>
        <van-field
          v-model="description"
          type="textarea"
          :rows="3"
          placeholder="请描述物品的详细情况，有助于更准确的估价..."
          maxlength="500"
          show-word-limit
        />
      </div>

      <div class="images-section">
        <div class="section-title">上传图片</div>
        <van-uploader v-model="images" multiple :max-count="6" />
      </div>

      <div v-if="estimateResult" class="result-card">
        <div class="result-header">
          <span>预估价格</span>
          <span class="result-price">¥{{ estimateResult.estimatedPrice }}</span>
        </div>
        <div class="result-range">
          价格区间：¥{{ estimateResult.minPrice }} - ¥{{ estimateResult.maxPrice }}
        </div>
        <div class="result-tip">{{ estimateResult.description }}</div>
      </div>

      <div class="button-group">
        <van-button type="primary" block round @click="goAppointment">
          预约上门回收
        </van-button>
      </div>
    </div>

    <van-popup
      v-model:show="pickerVisible"
      position="bottom"
      round
      :style="{ height: '40%' }"
    >
      <van-picker
        :title="currentFactor?.factorName"
        :columns="factorOptions"
        :default-index="currentPickerIndex"
        @confirm="onFactorConfirm"
        @cancel="pickerVisible = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { categoryApi, estimateApi } from '@/api'

const route = useRoute()
const router = useRouter()

const categoryId = route.params.categoryId
const category = ref({})
const factors = ref([])
const quantity = ref(1)
const description = ref('')
const images = ref([])
const selectedOptions = ref({})
const numberValues = ref({})
const estimateResult = ref(null)
const pickerVisible = ref(false)
const currentFactor = ref(null)
const currentPickerIndex = ref(0)

const factorOptions = computed(() => {
  if (!currentFactor.value?.options) return []
  try {
    const opts = JSON.parse(currentFactor.value.options)
    if (Array.isArray(opts) && opts.length > 0) {
      if (typeof opts[0] === 'string') {
        return opts.map(opt => ({ text: opt, value: opt }))
      }
      return opts
    }
    return []
  } catch (e) {
    console.error('Parse options error:', e)
    return []
  }
})

const getSelectedOption = (factorId) => {
  return selectedOptions.value[factorId] || '请选择'
}

const showFactorPicker = (factor) => {
  currentFactor.value = factor
  const selected = selectedOptions.value[factor.id]
  if (selected) {
    const opts = factorOptions.value
    const idx = opts.findIndex(o => o.text === selected || o.value === selected)
    currentPickerIndex.value = idx >= 0 ? idx : 0
  } else {
    currentPickerIndex.value = 0
  }
  pickerVisible.value = true
}

const onFactorConfirm = ({ selectedValues }) => {
  if (currentFactor.value && selectedValues && selectedValues.length > 0) {
    selectedOptions.value[currentFactor.value.id] = selectedValues[0].text || selectedValues[0]
    pickerVisible.value = false
    calculatePrice()
  }
}

const loadCategory = async () => {
  try {
    const res = await categoryApi.getById(categoryId)
    category.value = res.data || {}
  } catch (e) {
    showToast('加载失败')
  }
}

const loadFactors = async () => {
  try {
    const res = await estimateApi.getFactors(categoryId)
    factors.value = res.data || []
  } catch (e) {
    factors.value = []
  }
}

const calculatePrice = async () => {
  try {
    const factorAnswers = []
    
    for (const factor of factors.value) {
      const answer = { factorId: factor.id }
      if (factor.factorType === 'SELECT' && selectedOptions.value[factor.id]) {
        answer.selectedOption = selectedOptions.value[factor.id]
      } else if (factor.factorType === 'NUMBER' && numberValues.value[factor.id]) {
        answer.numberValue = numberValues.value[factor.id]
      }
      if (answer.selectedOption || answer.numberValue) {
        factorAnswers.push(answer)
      }
    }
    
    const res = await estimateApi.calculate({
      categoryId: categoryId,
      quantity: quantity.value,
      factorAnswers
    })
    estimateResult.value = res.data
  } catch (e) {
    console.error('Calculate price error:', e)
  }
}

const goAppointment = () => {
  if (!estimateResult.value) {
    showToast('请先完成估价')
    return
  }
  
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  
  localStorage.setItem('estimateInfo', JSON.stringify({
    categoryId: categoryId,
    categoryName: category.value.name,
    quantity: quantity.value,
    estimatedPrice: estimateResult.value.estimatedPrice,
    description: description.value,
    images: images.value
  }))
  
  router.push('/appointment')
}

onMounted(() => {
  loadCategory()
  loadFactors()
})
</script>

<style lang="less" scoped>
.section-title {
  padding: 16px 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.factors-section,
.quantity-section,
.description-section,
.images-section {
  margin-bottom: 16px;
}

.result-card {
  background: linear-gradient(135deg, #07c160 0%, #69d17c 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .result-price {
      font-size: 28px;
      font-weight: 700;
    }
  }
  
  .result-range {
    font-size: 13px;
    opacity: 0.9;
    margin-bottom: 8px;
  }
  
  .result-tip {
    font-size: 12px;
    opacity: 0.8;
  }
}

.button-group {
  padding: 24px 0 80px;
}
</style>
