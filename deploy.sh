#!/bin/bash

# 安装依赖
npm install

# 构建前端
cd ../ibCode-2.0
npm install
npm run build

# 复制前端构建文件到后端
cp -r dist ../back/

# 回到后端目录
cd ../back

# 启动服务
pm2 start ecosystem.config.js 