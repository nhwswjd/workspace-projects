# 产品介绍相册 - 技术规范文档

## 1. Concept & Vision

一款精致的品牌产品展示相册，融合高端画廊的沉浸感与现代电商的流畅体验。通过密码权限保护产品隐私，授权用户可享受如同翻阅精装画册般的浏览体验。整体设计追求"静谧优雅"的美学——大量留白、克制的动效、细腻的质感，让产品本身成为视觉焦点。

## 2. Design Language

### 2.1 Aesthetic Direction
**风格定位**：日式侘寂美学 × 现代极简画廊
- 以产品摄影为核心，内容驱动视觉
- 强调空间感与呼吸感，避免信息过载
- 细腻的微交互动效，克制而不失灵动

### 2.2 Color Palette
```css
:root {
  --color-bg-primary: #FAFAFA;      /* 主背景 - 暖白 */
  --color-bg-secondary: #F5F5F3;    /* 次级背景 */
  --color-bg-overlay: rgba(10, 10, 10, 0.92); /* 全屏遮罩 */
  --color-text-primary: #1A1A1A;    /* 主文字 */
  --color-text-secondary: #6B6B6B;  /* 次级文字 */
  --color-text-muted: #9A9A9A;     /* 弱化文字 */
  --color-accent: #2C2C2C;          /* 强调色 */
  --color-accent-light: #E8E8E6;   /* 浅色强调 */
  --color-success: #4A7C59;         /* 成功状态 */
  --color-error: #C45C4B;           /* 错误状态 */
  --color-border: rgba(0, 0, 0, 0.08); /* 边框 */
}
```

### 2.3 Typography
```css
--font-display: 'Cormorant Garamond', 'Noto Serif SC', Georgia, serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* 字号系统 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.5rem;     /* 24px */
--text-2xl: 2rem;      /* 32px */
--text-3xl: 3rem;      /* 48px */
```

### 2.4 Spatial System
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 6rem;     /* 96px */

/* 圆角 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

### 2.5 Motion Philosophy
- **入场动画**：opacity 0→1 + translateY(20px→0), 600ms cubic-bezier(0.22, 1, 0.36, 1)
- **图片切换**：crossfade 400ms ease-out
- **全屏展开**：scale(0.95→1) + opacity, 350ms cubic-bezier(0.4, 0, 0.2, 1)
- **按钮交互**：scale 0.98, 150ms ease
- **页面切换**：horizontal slide + fade, 500ms

### 2.6 Visual Assets
- **图标库**：Lucide Icons（线性风格，stroke-width: 1.5）
- **图片资源**：使用 Unsplash 高质量产品摄影占位
- **装饰元素**：极简几何线条、细腻阴影层次

## 3. Layout & Structure

### 3.1 页面架构
```
┌─────────────────────────────────────────┐
│  Header (固定顶部，滚动时显示)            │
│  Logo + 导航 + 授权状态指示              │
├─────────────────────────────────────────┤
│                                         │
│  [未授权视图]                            │
│  - 品牌 Hero 区域                        │
│  - 公司介绍文字                          │
│  - 产品列表预览（模糊处理）               │
│  - 密码输入入口                          │
│                                         │
│  [授权视图]                              │
│  - 产品详情展示页面                       │
│  - 全屏照片查看器                         │
│  - 视频播放器                            │
│                                         │
├─────────────────────────────────────────┤
│  Footer (品牌信息、版权)                  │
└─────────────────────────────────────────┘
```

### 3.2 视觉节奏
- **Hero 区域**：100vh - 强烈视觉冲击
- **产品列表**：动态网格，瀑布流布局
- **详情页**：单列沉浸式浏览
- **底部留白**：40% viewport height

### 3.3 响应式断点
```css
--breakpoint-sm: 640px;   /* 手机横屏 */
--breakpoint-md: 768px;   /* 平板竖屏 */
--breakpoint-lg: 1024px;  /* 平板横屏 / 小笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
```

## 4. Features & Interactions

### 4.1 密码权限系统
- **默认状态**：未授权，所有相册内容模糊处理
- **密码验证**：输入框 + 确认按钮，支持 Enter 提交
- **验证反馈**：
  - 成功：淡入解锁动画 → 切换到授权视图
  - 失败：输入框震动 + 错误提示（3秒后消失）
- **会话保持**：localStorage 存储验证状态，刷新页面保持登录
- **退出登录**：Header 提供退出按钮，清除验证状态

### 4.2 产品列表页
- **卡片展示**：竖向图片为主 + 产品名称 + 简短描述
- **悬停效果**：图片轻微放大 + 阴影加深
- **点击行为**：进入产品详情页
- **未授权状态**：卡片图片 20px 高斯模糊 + 锁图标覆盖

### 4.3 产品详情页
- **顶部**：产品名称（大标题）+ 简介
- **相册区域**：
  - 缩略图网格（竖向3列布局）
  - 点击缩略图打开全屏查看器
  - 视频缩略图带播放按钮标识
- **视频区域**：
  - 独立视频播放器
  - 支持全屏播放
  - 自定义播放控制条

### 4.4 全屏照片查看器
- **打开动画**：从点击位置放大展开
- **关闭方式**：点击遮罩 / ESC 键 / 关闭按钮
- **图片浏览**：
  - 左右滑动手势（移动端）
  - 键盘左右箭头（桌面端）
  - 指示器显示当前位置
- **缩放功能**：双指捏合缩放 / 滚轮缩放
- **加载状态**：骨架屏占位 + 渐进加载

### 4.5 视频播放器
- **封面**：视频首帧 + 播放按钮
- **控制条**：播放/暂停、进度条、音量、全屏
- **交互**：点击播放、进度条拖拽、全屏切换
- **未授权状态**：视频封面模糊 + 锁图标

### 4.6 移动端适配
- **手势支持**：
  - 左右滑动浏览相册
  - 双指缩放图片
  - 下拉返回上一级
- **触摸反馈**：所有可点击元素有按压态
- **性能优化**：
  - 图片懒加载
  - 视频延迟加载
  - 页面切换动画简化

## 5. Component Inventory

### 5.1 Header
- **默认**：透明背景，Logo + 导航
- **滚动后**：白色背景 + 阴影
- **授权状态**：显示用户头像/锁图标
- **移动端**：汉堡菜单

### 5.2 PasswordInput
- **默认**：圆角输入框 + 眼睛切换密码可见性
- **聚焦**：边框高亮
- **错误**：红色边框 + 抖动动画 + 错误文字
- **禁用**：灰色背景 + 加载动画

### 5.3 ProductCard
- **默认**：竖向图片 + 标题 + 描述
- **悬停**：scale(1.02) + 阴影加深
- **未授权**：图片模糊 + 锁图标覆盖
- **加载**：骨架屏占位

### 5.4 PhotoViewer (全屏查看器)
- **背景**：深色遮罩 (rgba(10, 10, 10, 0.92))
- **图片**：居中显示，保持比例
- **导航**：左右箭头按钮
- **指示器**：底部圆点指示
- **关闭按钮**：右上角 X
- **缩放控制**：缩放比例指示

### 5.5 VideoPlayer
- **封面**：视频首帧 + 居中播放按钮
- **播放中**：自定义控制条
- **控制条**：渐变背景，毛玻璃效果
- **进度条**：可拖拽，显示时间

### 5.6 UnlockPrompt
- **外观**：卡片式，居中显示
- **内容**：锁图标 + 提示文字 + 密码输入
- **动画**：淡入 + 从下方滑入

### 5.7 GalleryGrid
- **布局**：响应式网格
- **图片**：圆角，object-fit: cover
- **视频标识**：播放图标角标
- **点击效果**：scale + 光晕

## 6. Technical Approach

### 6.1 技术栈
- **框架**：Next.js 16 (App Router)
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 4 + CSS Variables
- **动画**：CSS Transitions + Framer Motion
- **图标**：Lucide React

### 6.2 项目结构
```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx             # 首页（产品列表）
│   ├── product/[id]/
│   │   └── page.tsx         # 产品详情页
│   └── globals.css         # 全局样式
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   ├── PasswordInput.tsx
│   │   └── UnlockPrompt.tsx
│   ├── gallery/
│   │   ├── PhotoViewer.tsx
│   │   ├── GalleryGrid.tsx
│   │   └── VideoPlayer.tsx
│   └── product/
│       ├── ProductCard.tsx
│       └── ProductHero.tsx
├── hooks/
│   ├── useAuth.ts           # 权限状态管理
│   └── useMediaQuery.ts     # 响应式检测
├── lib/
│   └── products.ts          # 产品数据
└── types/
    └── index.ts             # 类型定义
```

### 6.3 数据模型
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  images: string[];          // 5-8张图片
  videos: Video[];            // 1-2个视频
}

interface Video {
  id: string;
  url: string;
  poster: string;             // 封面图
  duration?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  checkPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}
```

### 6.4 密码验证机制
- 密码存储在服务端环境变量
- 验证通过后设置 HttpOnly Cookie 或 localStorage
- 客户端状态通过 React Context 管理
- 验证接口：`POST /api/auth/verify`

### 6.5 性能优化
- 图片：Next.js Image 组件 + lazy loading
- 视频：延迟加载，点击时再初始化播放器
- 动画：GPU 加速属性 (transform, opacity)
- 代码分割：动态导入全屏查看器组件

### 6.6 示例数据
使用 Unsplash 高质量图片作为产品照片占位：
- 产品：3款精选产品
- 每款产品：6张竖向图片 + 1个视频
- 视频使用公开可访问的 MP4 示例
