<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>家庭设置</h2>
      <el-button type="primary" @click="showCreate = true">创建家庭</el-button>
    </div>

    <el-card v-for="family in families" :key="family.id" style="margin-bottom: 20px">
      <div slot="header">
        <span>{{ family.name }}</span>
        <el-button type="text" @click="openInvite(family)" style="float: right">邀请成员</el-button>
      </div>
      <p>{{ family.description }}</p>
      <h4>成员列表：</h4>
      <el-tag v-for="member in family.members" :key="member.id" style="margin-right: 10px">
        {{ member.nickname }}
        <span v-if="member.role === 1" style="color: #409EFF">(管理员)</span>
      </el-tag>
    </el-card>

    <el-dialog title="创建家庭" :visible.sync="showCreate" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="家庭名称">
          <el-input v-model="createForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="createFamily">创建</el-button>
      </span>
    </el-dialog>

    <el-dialog title="邀请成员" :visible.sync="showInvite" width="400px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="inviteForm.email"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="inviteForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showCreate: false,
      showInvite: false,
      currentFamily: null,
      createForm: { name: '', description: '' },
      inviteForm: { email: '', name: '' },
      families: []
    }
  },
  mounted() {
    this.loadFamilies()
  },
  methods: {
    async loadFamilies() {
      try {
        const res = await this.$http.get('/family/my')
        if (res.data.code === 200) {
          this.families = res.data.data
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('加载家庭列表失败')
      }
    },
    async createFamily() {
      if (!this.createForm.name) {
        this.$message.warning('请输入家庭名称')
        return
      }
      try {
        const res = await this.$http.post('/family', this.createForm)
        if (res.data.code === 200) {
          this.$message.success('创建成功')
          this.showCreate = false
          this.createForm = { name: '', description: '' }
          this.loadFamilies()
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('创建失败')
      }
    },
    openInvite(family) {
      this.currentFamily = family
      this.inviteForm = { email: '', name: '' }
      this.showInvite = true
    },
    async sendInvite() {
      if (!this.inviteForm.email) {
        this.$message.warning('请输入邮箱')
        return
      }
      try {
        const res = await this.$http.post('/family/invite', {
          familyId: this.currentFamily.id,
          email: this.inviteForm.email,
          name: this.inviteForm.name
        })
        if (res.data.code === 200) {
          this.$message.success('邀请已发送')
          this.showInvite = false
        } else {
          this.$message.error(res.data.message)
        }
      } catch (e) {
        this.$message.error('发送邀请失败')
      }
    }
  }
}
</script>
