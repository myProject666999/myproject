
<template>
  <div class="checkout-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>结账管理</span>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="结账编号">
          <el-input v-model="searchForm.checkoutNo" placeholder="请输入结账编号"></el-input>
        </el-form-item>
        <el-form-item label="包厢号">
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号"></el-input>
        </el-form-item>
        <el-form