# Bar RenewK 微信小程序

这是一个为酒吧设计的鸡尾酒选择小程序，帮助用户根据口味偏好找到合适的鸡尾酒。

## 项目结构

```
miniprogram/
├── app.js              # 小程序入口文件
├── app.json            # 小程序全局配置
├── app.wxss            # 小程序全局样式
├── sitemap.json        # 站点地图配置
├── pages/              # 页面目录
│   ├── welcome/        # 欢迎页面
│   │   ├── welcome.js
│   │   ├── welcome.json
│   │   ├── welcome.wxml
│   │   └── welcome.wxss
│   ├── steps/          # 选择流程页面
│   │   ├── steps.js
│   │   ├── steps.json
│   │   ├── steps.wxml
│   │   └── steps.wxss
│   └── result/         # 结果页面
│       ├── result.js
│       ├── result.json
│       ├── result.wxml
│       └── result.wxss
└── utils/              # 工具函数目录
    ├── data.js         # 酒品数据
    └── matcher.js      # 匹配引擎
```

## 功能特点

1. **三步选择流程**：
   - 第一步：选择口感基调（清爽气泡/酸爽利口/醇厚深邃/花香果趣）
   - 第二步：选择喜欢的口味（可多选）
   - 第三步：选择酒精度范围

2. **智能匹配**：根据用户选择计算匹配度，推荐最适合的鸡尾酒

3. **详细信息**：展示鸡尾酒的中英文名称、描述、价格、容量信息和风味雷达图

4. **容量说明**：在选择阶段就显示不同类型鸡尾酒的容量信息

## 部署说明

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号并获取 AppID
3. 在微信开发者工具中打开此项目
4. 在项目配置中填入你的 AppID
5. 点击"上传"按钮将代码上传到微信服务器
6. 在微信公众平台提交审核
7. 审核通过后即可发布

## 自定义酒品数据

所有酒品数据都存储在 `utils/data.js` 中，可以根据实际情况进行修改。

## 技术栈

- 微信小程序原生框架
- 纯 CSS 样式（使用 rpx 单位适配不同屏幕）
- Canvas 2D 绘制雷达图
