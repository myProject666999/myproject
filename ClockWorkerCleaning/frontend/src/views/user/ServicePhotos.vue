<template>
  <div class="page-container">
    <van-nav-bar title="服务照片对比" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="text-align: center; padding: 50px" />

    <div v-else>
      <div class="photo-compare" v-if="photo">
        <div class="photo-group">
          <h3 class="photo-title">服务前</h3>
          <div v-if="photo.beforePhotoUrl" class="photo-box">
            <img :src="photo.beforePhotoUrl" alt="服务前" />
          </div>
          <div v-else class="photo-empty">
            <van-icon name="photo-o" size="48" color="#ccc" />
            <p class="text-secondary">暂未上传</p>
          </div>
          <van-button v-if="!photo.beforePhotoUrl" block type="primary" size="small" @click="uploadBefore">
            上传服务前照片
          </van-button>
        </div>

        <div class="photo-group">
          <h3 class="photo-title">服务后</h3>
          <div v-if="photo.afterPhotoUrl" class="photo-box">
            <img :src="photo.afterPhotoUrl" alt="服务后" />
          </div>
          <div v-else class="photo-empty">
            <van-icon name="photo-o" size="48" color="#ccc" />
            <p class="text-secondary">暂未上传</p>
          </div>
          <van-button v-if="photo.beforePhotoUrl && !photo.afterPhotoUrl" block type="primary" size="small" @click="uploadAfter">
            上传服务后照片
          </van-button>
          <van-button v-if="!photo.beforePhotoUrl && !photo.afterPhotoUrl" block type="primary" size="small" disabled>
            请先上传服务前照片
          </van-button>
        </div>
      </div>

      <div v-else class="no-photo">
        <van-empty description="暂无照片" />
      </div>
    </div>

    <van-popup v-model:show="showUpload" position="bottom" round>
      <div class="upload-popup">
        <div class="popup-title">上传照片</div>
        <van-field
          v-model="photoUrl"
          label="图片URL"
          placeholder="请输入图片URL（模拟上传）"
        />
        <van-field
          v-model="remark"
          label="备注"
          type="textarea"
          placeholder="备注说明（选填）"
          rows="2"
        />
        <div class="popup-actions">
          <van-button block type="primary" @click="submitUpload">确认上传</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { bookings as bookingsApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();

const bookingId = route.params.id;
const loading = ref(false);
const photo = ref(null);
const showUpload = ref(false);
const uploadType = ref('');
const photoUrl = ref('');
const remark = ref('');

async function loadPhotos() {
  loading.value = true;
  try {
    const res = await bookingsApi.getPhotos(bookingId);
    photo.value = res.data?.[0] || null;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function uploadBefore() {
  uploadType.value = 'before';
  photoUrl.value = '';
  remark.value = '';
  showUpload.value = true;
}

function uploadAfter() {
  uploadType.value = 'after';
  photoUrl.value = '';
  remark.value = '';
  showUpload.value = true;
}

async function submitUpload() {
  if (!photoUrl.value) {
    showToast('请输入图片URL');
    return;
  }

  try {
    if (uploadType.value === 'before') {
      await bookingsApi.uploadBeforePhoto(bookingId, { beforePhotoUrl: photoUrl.value, remark: remark.value });
    } else {
      await bookingsApi.uploadAfterPhoto(bookingId, { afterPhotoUrl: photoUrl.value, remark: remark.value });
    }
    showToast('上传成功');
    showUpload.value = false;
    loadPhotos();
  } catch (e) {}
}

onMounted(() => {
  loadPhotos();
});
</script>

<style scoped>
.photo-compare {
  display: flex;
  gap: 12px;
}

.photo-group {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.photo-title {
  text-align: center;
  font-size: 14px;
  margin-bottom: 12px;
  color: #333;
}

.photo-box {
  aspect-ratio: 3/4;
  background: #f7f8fa;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-empty {
  aspect-ratio: 3/4;
  background: #f7f8fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.photo-empty p {
  margin-top: 8px;
  font-size: 12px;
}

.upload-popup {
  padding: 16px;
}

.popup-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.popup-actions {
  margin-top: 16px;
}
</style>
