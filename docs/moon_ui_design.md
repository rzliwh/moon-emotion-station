# 情绪收发室 · UI设计稿 v2

> 月球背景情绪价值游戏 · 页面布局 + 视觉风格 + 月球3D设计
>
> 设计原则：**真实月球照片质感** + **深空氛围** + **3D可交互** + 极简UI
>
> v2 更新：基于老 Lee 反馈，月球从 CSS/SVG 方案升级为 **Three.js 3D 真实纹理月球**，支持拖拽旋转，旋转到背面方向时可见地球（蓝星）

---

## 一、配色方案

| 色块 | 色值 | 用途 |
|------|------|------|
| 深空黑 | `#000511` | 3D场景背景（纯黑深空） |
| 深空蓝 | `#0d1b2a` | UI面板背景 |
| 面板蓝 | `#1b263b` | 卡片/导航栏背景 |
| 月面灰 | `#c8c8d0` | 月球主体色（由纹理决定） |
| 蓝星蓝 | `#378ADD` | 地球颜色 |
| 暖光橙 | `#f4a261` | 温暖类痕迹/强调元素 |
| 电波蓝 | `#4a90d9` | 电波/交互元素 |
| 文字白 | `#e8e8e8` | 正文文字（低饱和白，不刺眼） |

**配色逻辑：** 纯黑深空压底 → 灰白月球居中 → 远处蓝色地球若隐若现 → 暖光橙和电波蓝作为"温度对比"穿插在月面痕迹上。整体偏冷，只有痕迹和互动元素是暖色，让"温暖"成为视觉上的稀缺品。

---

## 二、字体方案

| 用途 | 字体 | 说明 |
|------|------|------|
| 中文正文 | 思源黑体 / Noto Sans SC | 系统默认无衬线，清晰易读 |
| 英文/数字 | Inter / system-ui | 与中文搭配协调 |
| 电波原文 | serif（衬线体） | 增加"手写感"和真实感，与UI字体区分 |
| 回信文案 | serif（衬线体） | 同上，保持电波叙事的文体一致性 |

**字体逻辑：** UI用无衬线（干净），电波内容用衬线（有温度）。两种字体的切换本身就是"系统世界"和"人的声音"的视觉分界。

---

## 三、页面布局（移动端优先，竖屏）

```
┌─────────────────────────────┐
│  情绪收发室                  │ ← ①顶部状态栏（半透明叠加）
│  月光值 5                    │    极简，只有标题+月光值
├─────────────────────────────┤
│                             │
│                             │
│        🌕（3D月球）          │ ← ②月球3D区域（全屏Canvas）
│     可拖拽旋转 / 缩放        │    Three.js 渲染
│     背面方向可见地球蓝星     │    痕迹光点贴在月面
│                             │
│                             │
├─────────────────────────────┤
│  1条新电波等待接收           │ ← ③电波信号提示（底部叠加）
│  ┌─────────────────────┐    │
│  │ 来自地球 · 23:47     │    │ ← ③电波卡片
│  │ 「加班到现在…」       │    │    serif体
│  └─────────────────────┘    │    点击展开详情
├─────────────────────────────┤
│  📡    🌕    ✉️              │ ← ④底部导航
└─────────────────────────────┘
```

### 四个区域说明

| 区域 | 内容 | 交互 |
|------|------|------|
| ① 顶部状态栏 | 游戏标题 + 月光值 | 无交互，半透明叠加在3D场景上 |
| ② 月球3D区域 | Three.js渲染的真实月球 + 痕迹光点 | 拖拽旋转、双指缩放、点击痕迹 |
| ③ 电波卡片 | 新电波预览/回信/等待状态 | 点击展开、选择动作 |
| ④ 底部导航 | 电波收发 / 月球查看 / 回信列表 | Tab切换 |

### 页面状态流转

```
[默认状态] 月球居中 + 电波提示
    ↓ 点击电波卡片
[电波详情] 展开电波原文 + 3个动作选项
    ↓ 选择动作
[动作动画] 电波粒子从地球方向飞向月球（1.5s）
    ↓ 动画结束
[等待状态] "信号还在传输……" + 月球上对应位置开始有微弱光点
    ↓ 延迟时间到（下次打开或定时器触发）
[回信弹出] 回信内容 + 月球痕迹永久点亮
    ↓ 点击确认
[回到默认] 月球上多了一个永久痕迹
```

---

## 四、月球3D视觉设计（v2 核心更新）

### 参考依据

参考 NASA Artemis II 任务（2026年4月）拍摄的月球背面真实照片：

- **Artemis II "Earthrise" 照片**（2026年4月6日）：从月球背面拍摄，地球呈弯月形，蓝色边缘，云系可见
- **Artemis II 月面飞越照片**：从6545公里外拍摄，环形山纹理清晰如航拍沙漠，Orientale盆地、Hertzsprung盆地、Vavilov陨石坑等特征可见
- **NASA LRO 月球3D模型**（svs.gsfc.nasa.gov/14959）：基于LRO数据制作，含色彩贴图和高度图，适用于Web交互
- **NASA CGI Moon Kit**（svs.gsfc.nasa.gov/4720）：LROC WAC自然色彩马赛克 + LOLA高程数据，免费公开

### 月球渲染方案（Three.js 3D）

| 组件 | 技术实现 | 说明 |
|------|---------|------|
| **月球本体** | `SphereGeometry(1, 128, 128)` + `MeshStandardMaterial` | 128段细分，表面光滑 |
| **色彩纹理** | NASA LRO LROC WAC 自然色彩马赛克 | 灰白月面真实颜色 |
| **凹凸贴图** | NASA LOLA 高程数据 displacement map | 陨石坑立体感，背面粗糙高地明显 |
| **光源** | `DirectionalLight`（模拟太阳光）+ `AmbientLight`（微弱环境光） | 侧光突出陨石坑阴影 |
| **星空背景** | `THREE.Points` + `PointsMaterial`，10000+星点 | 极慢漂移，偶尔闪烁 |
| **地球（蓝星）** | `SphereGeometry(0.15)` + 蓝色纹理 + 半透明glow | 远处小而蓝，仅在背面方向可见 |

### 月球纹理资源

| 资源 | 来源 | 格式 | 用途 |
|------|------|------|------|
| LROC WAC 色彩马赛克 | svs.gsfc.nasa.gov/4720 | TIFF/JPG | 月面色彩贴图 (color map) |
| LOLA 高程数据 | svs.gsfc.nasa.gov/4720 | TIFF | 凹凸/位移贴图 (bump map) |
| NASA Moon 3D Model | svs.gsfc.nasa.gov/14959 | GLB/USDZ | 可直接加载的3D模型 |
| Three.js 内置月球纹理 | threejs.org/examples/textures/planets/ | JPG | 备用低精度纹理 |

**MVP推荐方案：** 先用 Three.js 内置月球纹理（1024px，免费CDN）快速验证，后续替换为 NASA LRO 高精度纹理（4K+）提升真实感。

### 地球（蓝星）出现逻辑

```
相机方位角 (azimuthal angle)
    │
    ├── 0°（正面）────── 看不到地球
    ├── 90°（侧面）───── 地球边缘微露，极小蓝点
    ├── 180°（背面）──── 地球完整出现在月球后方远处，蓝色弯月形
    └── 270°（另一侧）── 地球再次边缘微露
```

**实现方式：**
- 地球 `Mesh` 放在月球后方 `position.z = -8` 的位置
- 当相机绕月球旋转到背面方向时，地球自然进入视野
- 地球尺寸远小于月球（半径比约 0.15:1），距离远，视觉上"小而蓝"
- 地球材质用蓝色大气层纹理 + `opacity: 0.85` + 外层半透明 `Sprite` 做光晕

**参照 Artemis II "Earthrise" 照片的效果：**
- 地球呈弯月形（半被太阳照亮）
- 蓝色边缘 + 白色云系
- 在纯黑深空背景中，蓝色格外醒目
- 这个画面就是玩家拖拽月球时偶尔瞥见的"惊喜"

### 为什么选月球背面

1. **视觉理由**：背面陨石坑密集、没有月海，纹理更丰富立体
2. **叙事理由**：背面是"地球看不到的那一面"——一个荒凉的地方，却有人在收听地球的心事
3. **交互理由**：背面方向能看到地球——玩家拖拽旋转时的惊喜发现

---

## 五、痕迹显示设计（3D空间版）

### 痕迹 = 月球表面的彩色光点（3D空间定位）

| 动作类型 | 痕迹颜色 | 痕迹图标 | 示例 |
|---------|---------|---------|------|
| 温暖类（拥抱/夜灯） | 暖光橙 `#f4a261` | 小夜灯、暖光点 | |
| 生长类（种子/雨） | 翠绿 `#5cb85c` | 小芽、水洼 | |
| 光亮类（灯/星） | 电波蓝 `#4a90d9` | 小灯、眨眼星 | |
| 音波类（旋律/潮汐） | 淡紫 `#c77dff` | 音波纹、波纹 | |

### 3D痕迹实现

| 技术点 | 方案 |
|--------|------|
| 痕迹定位 | 球面坐标 (theta, phi) → 月球表面 `Vector3` |
| 痕迹渲染 | `Sprite` 或 `Mesh`（小发光球体），`position` 设在月球表面略外侧 |
| 呼吸动画 | `requestAnimationFrame` 中循环调整 `material.opacity`（0.6↔1.0, 2s） |
| 点击检测 | `Raycaster` 从相机发射射线，检测点击的痕迹 Sprite |
| 旋转跟随 | 痕迹作为月球 `Group` 的子对象，随月球旋转 |
| 探索激励 | 痕迹分布在月球不同经纬度，玩家需拖拽旋转才能看到全部 |

### 痕迹交互

- **默认状态**：微弱呼吸闪烁（opacity 0.6↔1.0）
- **悬停/点击**：放大 + 显示对应电波的回信摘要（HTML overlay）
- **分布逻辑**：痕迹散布在月球不同经纬度，鼓励玩家拖拽旋转探索

---

## 六、Three.js 技术方案

### 加载方式

使用 CDN import map，无需 npm/bundler：

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
</script>
```

### OrbitControls 配置

```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;        // 阻尼效果，拖拽有惯性
controls.dampingFactor = 0.05;        // 阻尼系数
controls.enableZoom = true;           // 允许缩放
controls.enablePan = false;           // 禁止平移，焦点锁定月球
controls.minDistance = 1.5;           // 最近距离
controls.maxDistance = 8;             // 最远距离
controls.rotateSpeed = 0.5;           // 旋转速度
controls.autoRotate = false;          // 不自动旋转（玩家手动探索）
```

### 渲染循环

```javascript
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // 痕迹呼吸动画
    traces.forEach(t => {
        t.material.opacity = 0.6 + 0.4 * Math.sin(Date.now() * 0.001 + t.phase);
    });
    renderer.render(scene, camera);
}
```

### 性能考量

| 考虑点 | 方案 |
|--------|------|
| 月球细分度 | 128段足够，过高会卡顿 |
| 纹理大小 | MVP用1024px，正式版用2048px（4K太大加载慢） |
| 星空数量 | 10000点，用 `BufferGeometry` 一次绘制 |
| 移动端适配 | 检测 `devicePixelRatio`，移动端降低至1.0 |
| 触摸事件 | OrbitControls 原生支持触摸（单指旋转、双指缩放） |

---

## 七、响应式适配

| 设备 | 布局调整 |
|------|---------|
| 手机（竖屏） | 3D月球全屏，电波卡片底部叠加 |
| 手机（横屏） | 月球左半屏，电波卡片右侧展开 |
| 平板 | 月球放大，电波卡片宽度增加 |
| 桌面浏览器 | 居中显示，最大宽度 480px（保持移动端体验） |

---

## 八、动画清单

| 动画 | 触发时机 | 时长 | 实现 |
|------|---------|------|------|
| 电波粒子飞行 | 选择动作后 | 1.5s | Three.js `Sprite` 粒子 + `Tween` |
| 月球痕迹点亮 | 电波到达月球 | 0.8s | `material.opacity` transition |
| 痕迹呼吸 | 常驻 | 2s循环 | `requestAnimationFrame` sin波动 |
| 回信弹出 | 延迟时间到 | 0.5s | CSS transform + opacity (HTML overlay) |
| 月球旋转 | 用户拖拽 | 实时 | OrbitControls |
| 地球进入视野 | 旋转到背面方向 | 自然出现 | 相机角度变化，地球自然进入视锥体 |
| 页面转场 | 状态切换 | 0.3s | CSS transition |

---

## 九、文件结构规划

```
moon-emotion-station/
├── index.html              # 主页面
├── css/
│   └── style.css           # UI样式
├── js/
│   ├── main.js             # Three.js 场景初始化
│   ├── moon.js             # 月球3D模型 + 纹理加载
│   ├── earth.js            # 地球（蓝星）渲染
│   ├── stars.js            # 星空背景
│   ├── traces.js           # 痕迹光点系统
│   └── signals.js          # 电波系统 + localStorage
├── textures/
│   ├── moon_color.jpg      # NASA LRO 月面色彩纹理
│   ├── moon_bump.jpg       # NASA LOLA 高程贴图
│   └── earth.jpg           # 地球纹理
└── data/
    └── signals.json        # 电波脚本数据
```

---

## 十、Artemis II 参考照片清单

| 照片 | 拍摄时间 | 参考用途 |
|------|---------|---------|
| Earthrise（地球升起） | 2026-04-06 19:22 ET | 地球在月球背面方向的样子（弯月形蓝星） |
| Earthset（地球落下） | 2026-04-06 18:41 ET | 地球沉入月球弧线，Orientale盆地边缘可见 |
| 月面飞越特写 | 2026-04-06 | 月面陨石坑纹理细节（6545km距离拍摄） |
| 日全食 + 月球剪影 | 2026-04-06 | 月球轮廓 + 深空背景的极致黑 |
| 月球与地球同框 | 2026-04-06 | 月球前景细节 + 地球远景小蓝点的比例参考 |

**核心参照画面：** Artemis II 拍的 Earthrise — 月球背面粗糙的高地在前景，地球像一颗蓝色弯月悬在深空中。这就是玩家拖拽月球到背面时应该看到的画面。

---

---

## 十一、放大查看痕迹（v3 新增）

### 需求

玩家在月球上放大到某个痕迹时，看到的不仅是光点，而是**具体的3D痕迹细节**——留下的脚印、种下的种子发的芽。

### 三级缩放视图

| 视角 | 缩放级别 | 痕迹表现 |
|------|---------|---------|
| **远景** | 默认（distance 4-8） | 月球全貌，痕迹是暖色小光点（呼吸闪烁） |
| **中景** | 放大到 distance 2-4 | 区域可见，光点变大，可辨认痕迹类型图标 |
| **特写** | 放大到 distance 1.5-2 | 痕迹细节3D渲染：脚印/种子芽清晰可见 |

### 两种痕迹类型的3D细节

**1. 脚印痕迹**

| 属性 | 设计 |
|------|------|
| 来源动作 | "走过去" / "轻轻走过去" |
| 3D表现 | 灰色月面上凹陷的脚印序列（3-5个），方向朝电波来源 |
| 技术实现 | `PlaneGeometry` + bump map（脚印凹凸贴图），或 `ShapeGeometry` 自定义脚印形状 |
| 旁边标注 | 小型 HTML overlay：日期 + 电波编号 + 电波原文首句 |
| 光照效果 | 脚印凹槽内有微弱暖光（模拟"走过的路还留着温度"） |

**2. 种子发芽**

| 属性 | 设计 |
|------|------|
| 来源动作 | "种点什么" / "留一颗种子" |
| 3D表现 | 月面裂缝中一株绿色小芽，2-3片叶子 |
| 技术实现 | 自定义 `BufferGeometry`（茎+叶），`MeshStandardMaterial` 绿色 + 微透光 |
| 生长机制 | `scale.y` 根据 `createdAt` 到现在的时间差计算，越久越高（有上限） |
| 特效 | 叶尖有露珠 `Sprite`（小光点），轻微闪烁 |
| 旁边标注 | 小型 HTML overlay：种下日期 + "已经长了X天" |

### 放大触发逻辑

```javascript
controls.addEventListener('change', () => {
    const distance = camera.position.distanceTo(moon.position);
    
    if (distance < 2.0) {
        // 特写模式：显示痕迹3D细节
        showTraceDetail();
    } else if (distance < 4.0) {
        // 中景模式：光点变大，显示类型图标
        showTraceIcons();
    } else {
        // 远景模式：小光点
        showTraceDots();
    }
});
```

### 痕迹位置检测

当玩家放大到特写级别时，检测相机正前方最近的痕迹，自动聚焦展示其3D细节：

```javascript
function findNearestTrace() {
    const ray = new THREE.Raycaster();
    ray.setFromCamera({x: 0, y: 0}, camera); // 屏幕中心
    const hits = ray.intersectObjects(traceMeshes);
    return hits.length > 0 ? hits[0].object : null;
}
```

---

## 十二、本地存储与设备迁移（v3 新增）

### 需求

所有游戏互动痕迹在本地保存，支持设备迁移。

### localStorage 数据结构

```json
{
  "version": "1.0",
  "createdAt": "2026-08-01T15:55:00Z",
  "lastActive": "2026-08-01T16:30:00Z",
  "moonlight": 5,
  "traces": [
    {
      "id": "trace_001",
      "waveId": "wave_01",
      "action": "walk_over",
      "type": "footprint",
      "position": { "lat": 23.5, "lng": 145.2 },
      "createdAt": "2026-08-01T23:50:00Z",
      "waveText": "加班到现在，末班车走了，在等网约车。风吹得有点冷。",
      "replyReceived": true,
      "replyText": "车来了。司机问要不要开暖风，我说不用。..."
    },
    {
      "id": "trace_002",
      "waveId": "wave_02",
      "action": "plant_seed",
      "type": "seedling",
      "position": { "lat": -15.3, "lng": 90.7 },
      "createdAt": "2026-08-01T14:55:00Z",
      "waveText": "中午在食堂摔了餐盘，红烧肉糖醋汁溅了一身...",
      "replyReceived": true,
      "replyText": "会开完了。衣服上还沾着糖醋汁..."
    }
  ],
  "pendingReplies": [
    {
      "waveId": "wave_03",
      "action": "leave_light",
      "respondedAt": "2026-08-01T02:20:00Z",
      "replyAt": "2026-08-01T10:00:00Z",
      "waveText": "搬进新房第一晚。..."
    }
  ]
}
```

### 存储策略

| 数据 | 存储方式 | 说明 |
|------|---------|------|
| 痕迹列表 `traces` | localStorage | 每次新增痕迹时追加 |
| 待回信 `pendingReplies` | localStorage | 记录等待中的回信，打开页面时检查是否到时间 |
| 月光值 | localStorage | 随痕迹一起更新 |
| 电波原文快照 | localStorage | 存在 `traces[].waveText` 中，不依赖外部数据源 |
| 回信内容 | localStorage | 存在 `traces[].replyText` 中 |

### 设备迁移方案

**三步迁移流程：**

| 步骤 | 操作 | 实现 |
|------|------|------|
| **Step 1 导出** | 设置页点"导出我的月球" → 生成迁移码 | `btoa(encodeURIComponent(JSON.stringify(data)))` 编码为 Base64 字符串 |
| **Step 2 传输** | 复制文字 / 扫码 / 导出JSON文件 | 三种方式可选，迁移码是一串文本，微信/邮件均可传 |
| **Step 3 导入** | 新设备设置页点"导入月球" → 粘贴码/选文件 | `JSON.parse(decodeURIComponent(atob(code)))` 解码恢复 |

### 迁移码格式

```
MEv1.0eyJ2ZXJzaW9uIjoiMS4wIiwiY3JlYXRlZEF0IjoiMjAyNi0wOC0wMVQxNTo1N...==
```

- 前缀 `MEv1.0`：Moon Emotion v1.0，标识游戏和版本
- 后续为 Base64 编码的完整 JSON 数据
- 玩家复制这串文字，发给自己，新设备粘贴即可

### 迁移注意事项

| 场景 | 处理 |
|------|------|
| 新设备已有数据 | 提示"当前设备已有X个痕迹，导入会合并/覆盖？" → 用户选择 |
| 版本不一致 | 迁移码带版本号，导入时做兼容处理 |
| 迁移码损坏 | `try/catch` 解码失败 → 提示"迁移码格式有误，请检查" |
| 数据量过大 | localStorage 上限 5-10MB，100条痕迹约 50KB，远在限制内 |

### 设置页 UI

```
┌─────────────────────────────┐
│  设置                        │
├─────────────────────────────┤
│  我的月球                    │
│  ├ 痕迹数量：5               │
│  ├ 月光值：5                 │
│  └ 创建时间：2026-08-01      │
├─────────────────────────────┤
│  数据管理                    │
│  ├ [导出我的月球]  → 生成码  │
│  ├ [导入月球]      → 粘贴码  │
│  └ [清除所有数据]  → 二次确认 │
└─────────────────────────────┘
```

---

*文件版本：v3 · 2026-08-01*
*v2 更新：月球升级为 Three.js 3D 真实纹理月球，支持拖拽旋转，背面方向可见地球*
*v3 更新：新增放大查看痕迹细节（脚印/种子芽3D） + 本地存储数据结构 + 设备迁移方案*
*下次更新：开发阶段补充交互细节 + 纹理资源准备*
