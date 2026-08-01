# 情绪收发室 · Codex 交接文档

> 接手人：Codex  
> 交接日期：2026-08-01  
> 项目阶段：MVP 已跑通，存在技术债务需重构  
> 交接人：WorkBuddy（前期开发的 AI）

---

## 零、TL;DR（先看这段）

**结论：在现有代码基础上修改，不要从零重写。**

现有代码已跑通核心循环（3D月球 + 电波流程 + 痕迹系统 + 本地存储 + 音频），但有三个核心债务必须处理：

1. **trace 数据结构不严谨** —— 新老数据字段混杂，导致弹窗信息显示异常（已修3版仍未根治）
2. **app.js 单文件 600+ 行** —— 场景/存储/UI/游戏逻辑全混一起，难维护
3. **enrichTrace 兜底逻辑** —— 补丁式修复的产物，应整个删掉换成严格的 schema 验证

**工作边界：先只重构数据层 + enrichTrace，验证 OK 再动别的。不要一口气重构整个项目。**

---

## 一、项目背景与核心目标

### 这是什么游戏

一款月球背景的情绪价值网页小游戏。玩家是月球上的"收发员"，核心循环：

```
接收地球情绪电波 → 选择回应动作 → 等待延迟回信 → 月球上留下永久痕迹
```

### 核心体验设计

| 要素 | 设计意图 |
|------|---------|
| 月球背面 | "地球看不到的那一面"——荒凉之地，却有人在收听地球的心事 |
| 延迟回信 | 不是即时反馈，卡在"情绪已消化一半但没忘"的时间点 |
| 永久痕迹 | 每次回应都在月球上留下脚印/灯/芽/音波，可拖拽旋转回看 |
| 背面见地球 | 拖拽月球到背面方向时，远处可见蓝色地球——惊喜发现 |

### 技术约束

- **纯 HTML/CSS/JS**，无 npm/bundler，Three.js 用 CDN import map
- 部署 **GitHub Pages**，需兼容微信内置浏览器 / Windows / iOS / 安卓
- **无后端**，所有数据 localStorage + 时间戳实现延迟回信
- 设备迁移用 **Base64 编码迁移码**（前缀 `MEv1.0`）

---

## 二、当前项目状态

### 文件结构

```
moon-emotion-station/
├── index.html              # HTML + CSS + Three.js import map
├── js/
│   ├── app.js              # ⚠️ 600+行，所有逻辑混在一起（场景/存储/UI/游戏）
│   └── audio.js            # ✅ 独立音频模块（WebAudio程序化合成）
```

### 配套设计文档（在项目外层目录）

| 文件 | 内容 | 必读 |
|------|------|------|
| `moon_ui_design.md` | UI设计稿v3（布局/视觉/3D月球/痕迹细节/存储迁移） | ✅ 必读 |
| `moon_emotion_scripts.md` | 3条电波脚本 + 回信文案标准 + 延迟设计逻辑 | ✅ 必读 |
| `codex_handover.md` | 本文档 | ✅ 必读 |

### 已完成功能清单

| 模块 | 状态 | 说明 |
|------|------|------|
| Three.js 3D 月球场景 | ✅ 跑通 | 程序化Canvas纹理（MVP），后续替换NASA LRO 4K |
| OrbitControls 拖拽/缩放 | ✅ 跑通 | 单指旋转、双指缩放、阻尼效果 |
| 地球（蓝星） | ✅ 跑通 | 背面方向可见，z=8位置 |
| 星空背景 | ✅ 跑通 | 10000点 BufferGeometry |
| 电波信号卡 UI | ✅ 跑通 | 信号卡→详情→选动作→等待→回信 |
| 3条电波脚本 | ✅ 跑通 | wave_01/02/03，每条3个动作选项 |
| 延迟回信 | ✅ 跑通 | localStorage + 时间戳，下次打开检查 |
| 4种痕迹3D细节 | ⚠️ 能看但粗糙 | footprint/light/seedling/melody，按相机距离切换 |
| localStorage 存储 | ⚠️ 字段不统一 | 见下方"技术债务" |
| 设备迁移 | ✅ 跑通 | Base64编码，MEv1.0前缀 |
| 音频系统 | ✅ 跑通 | WebAudio程序化背景音 + 3个提示音 |
| 痕迹弹窗 | ❌ 有bug | 老数据显示"未知"，enrichTrace补丁式修复未根治 |

---

## 三、核心技术债务（必须处理）

### 债务1：trace 数据结构不严谨 ⚠️ 最高优先级

**问题根源：** trace 对象字段在不同版本中不一致，新老数据混杂。

**新数据（resolvePendingReply 生成，字段完整）：**
```js
{
  id: 'trace_1754024400000',
  waveId: 'wave_01',           // ✅ 有
  action: '走过去',             // ✅ 有（label字符串）
  type: 'footprint',           // ✅ 有
  color: 0xf4a261,             // ✅ 有（number）
  position: { lat, lng },      // ✅ 有
  createdAt: '2026-08-01T...', // ✅ 有（ISO字符串）
  waveText: '加班到现在...',    // ✅ 有
  replyText: '车来了...'       // ✅ 有
}
```

**老数据（早期测试时存的，字段残缺）：**
```js
{
  id: 'trace_1754024400000',
  color: 0x4a90d9,             // ✅ 有（number）
  position: { lat, lng },      // ✅ 有
  // waveId: undefined          ❌ 没有
  // type: undefined            ❌ 没有
  // createdAt: undefined       ❌ 没有
  // waveText: undefined        ❌ 没有
  // replyText: undefined       ❌ 没有
}
```

**当前的"修复"方式（enrichTrace，有问题）：**
```js
// app.js 第706行
enrichTrace(trace) {
  // 1. 按 waveId 反查 → 老数据没 waveId，跳过
  // 2. 按 action label 匹配 → 老数据没 action，跳过
  // 3. 颜色反推 type → 能工作（number格式color）
  // 4. id 时间戳反推 createdAt → 能工作
  // 5. ❌ 之前有"无脑默认SIGNALS_DATA[0]作waveText" → 已删掉
  // 6. ❌ 之前有"按type找任意reply兜底" → 已删掉
}
```

**问题：** enrichTrace 是补丁式修复，每改一版都引入新 bug（v5→v6→v7，详见记忆文件）。

**你要做的：**
1. 定义严格的 trace schema（所有字段必填）
2. 写 `validateTrace(trace)` 函数，返回有效/无效
3. 加载数据时：有效 trace 正常显示，无效 trace 标记为 `{ type: 'legacy', ...原始数据 }`，弹窗显示"这是一条早期测试痕迹，详细信息已丢失"
4. **删掉 enrichTrace 整个函数**，用 schema 验证代替
5. 新数据写入时严格保证字段完整（resolvePendingReply 已经是完整的，保持）

### 债务2：app.js 单文件 600+ 行

**问题：** 场景/存储/UI/游戏逻辑全混在一个文件里，改一处容易牵连别处。

**你要做的（建议拆分）：**
```
js/
├── data/
│   └── signals.js          # SIGNALS_DATA 电波脚本数据
├── core/
│   ├── storage.js          # Storage 对象（loadData/saveData/addTrace/resolvePendingReply）
│   └── schema.js           # trace schema 定义 + validateTrace
├── scene/
│   ├── moon-scene.js       # MoonScene 类（Three.js月球场景）
│   ├── trace-detail.js     # 4种痕迹3D细节创建函数
│   └── textures.js         # 程序化纹理生成（月球/地球）
├── ui/
│   ├── ui.js               # UI 对象（DOM操作）
│   └── trace-detail-ui.js  # 痕迹弹窗显示逻辑
├── audio.js                # ✅ 已独立，保持
└── app.js                  # App 对象（协调各模块，<100行）
```

**注意：** 拆分时保持功能不变，不要借机重构业务逻辑。先拆分验证 OK，再优化内部实现。

### 债务3：痕迹3D细节粗糙

**现状：** 4种痕迹3D模型（footprint/light/seedling/melody）结构对，但美术粗糙。

**你要做的：** 参考设计稿 `moon_ui_design.md` 第十一节，优化3D细节。但这是低优先级，先把债务1和2处理掉。

---

## 四、可保留的资产清单

以下代码可以直接复用，不需要重写：

| 资产 | 位置 | 说明 |
|------|------|------|
| Three.js 场景搭建 | app.js `MoonScene` 类 | 月球/地球/星空/光照/OrbitControls 配置 |
| 程序化纹理生成 | app.js `createMoonTexture`/`createEarthTexture` | Canvas生成月球/地球纹理 |
| OrbitControls 配置 | app.js 构造函数 | damping/zoom/pan/距离限制 |
| 电波数据结构 | app.js `SIGNALS_DATA` | 3条电波 + 每条3动作 + traceType/traceColor/reply |
| 存储基础逻辑 | app.js `Storage` 对象 | loadData/saveData/initData/addPendingReply |
| resolvePendingReply | app.js 第145行 | **新数据写入逻辑正确，字段完整，保持** |
| 设备迁移 | app.js `exportData`/`importData` | Base64编码，MEv1.0前缀 |
| 音频系统 | audio.js `AudioManager` | 完整独立模块，保持不动 |
| 4种痕迹3D细节 | app.js `createFootprintDetail`等 | 结构参考，美术可优化 |
| HTML/CSS 布局 | index.html | 顶部栏/底部导航/弹窗结构 |

---

## 五、设计决策沉淀（为什么这么做）

这些是老 Lee 在开发过程中确认的决策，**不要擅自更改**：

| 决策 | 理由 |
|------|------|
| 月球用程序化纹理（MVP） | 先跑通逻辑，正式版替换NASA LRO 4K纹理 |
| 延迟回信用 localStorage + 时间戳 | 纯前端无后端，正式版也用此方案（不是临时方案） |
| 地球放在 z=8（不是z=-6） | z=-6时不可见，改为z=8背面方向能看到 |
| 痕迹3D细节按相机距离切换 | dist<2.0显示特写，否则显示光点 |
| detail group 朝向月面法线 | `up.copy(normal) + lookAt(0,0,0)` |
| 背景音用WebAudio程序化合成 | 零版权风险，不依赖外部音频文件 |
| 提示音也用WebAudio合成 | 同上，零版权风险 |
| 背景音10秒淡入 | 避免突然进游戏被吓到 |
| 声音主题不切换 | 老Lee确认 |
| 设置入口是右上角齿轮 | 不要放底部tab |
| 底部三个tab：电波/月球/记忆 | 不要改成别的 |

### 回信文案三标准（电波脚本设计原则）

1. **不感谢，只描述** — 不说"谢谢你的帮助"，说具体发生了什么
2. **轻轻挂钩动作** — 把玩家的动作和对方生活缝在一起，但不硬连
3. **留未确认悬念** — "不知道是不是你哼的那首"——不确定但愿意相信

---

## 六、给 Codex 的明确边界

### ✅ 你可以做的

1. 重构 trace 数据结构 + schema 验证（债务1）
2. 拆分 app.js 为多模块（债务2）
3. 优化痕迹3D细节美术（债务3，低优先级）
4. 修复已知bug
5. 添加清空数据按钮（设置页）
6. 优化代码可读性、加注释

### ❌ 你不要做的

1. **不要重写 Three.js 月球场景** —— 跑通的代码不要动
2. **不要改电波脚本内容**（SIGNALS_DATA）—— 文案是老 Lee 审过的
3. **不要改音频系统**（audio.js）—— 独立模块，保持不动
4. **不要改 HTML/CSS 布局结构** —— 顶部栏/底部导航/弹窗结构保持
5. **不要引入 npm/bundler** —— 纯 CDN import map，保持
6. **不要引入后端** —— 纯前端 localStorage，保持
7. **不要擅自改设计决策**（见第五节）—— 有疑问先问老 Lee

### ⚠️ 工作方式要求

1. **先出方案再动手** —— 看完本文档后，写一份"我打算怎么改"的方案给老 Lee 审核
2. **单条验证再批量** —— 改完一个模块先验证，再改下一个
3. **每步 git commit** —— 方便回滚
4. **不要一次改太多** —— 上次 Codex 擅改导致项目改废的教训

---

## 七、已知 Bug 清单

| Bug | 状态 | 说明 |
|------|------|------|
| 老痕迹弹窗显示"未知" | 待修复 | 需用 schema 验证 + legacy标记方案（见债务1） |
| 蓝色光点偏亮 | 已缓解 | glow/halo参数已降，可进一步调 |
| 痕迹3D细节美术粗糙 | 待优化 | 低优先级 |
| 设置页缺"清空数据"按钮 | 待添加 | 老Lee需要清空重玩 |

---

## 八、验收标准

重构完成后，以下场景必须正常工作：

1. **全新玩家**：打开页面 → 开始收听 → 收到电波 → 选动作 → 等待 → 收到回信 → 月球出现痕迹 → 点痕迹看弹窗 → 弹窗信息完整（类型/日期/电波原文/回信）
2. **老数据玩家**：打开页面 → 月球显示旧痕迹（颜色正确）→ 点旧痕迹 → 弹窗显示"早期测试痕迹，详细信息已丢失"（而不是"未知痕迹/末班车"）
3. **设备迁移**：导出迁移码 → 新设备导入 → 痕迹完整保留
4. **音频**：开始收听后背景音10秒淡入 → 收到电波/发出回应/收到回信各有提示音
5. **月球交互**：拖拽旋转流畅 → 背面方向可见地球 → 放大到特写显示3D痕迹细节

---

## 九、本地运行方式

```bash
# 直接用浏览器打开，或用本地服务器
cd moon-emotion-station
python -m http.server 8000
# 浏览器访问 http://localhost:8000
```

**调试技巧：** 浏览器控制台执行 `window.MOON_DEBUG = true` 可开启调试日志。

---

## 十、参考资源

| 资源 | 用途 |
|------|------|
| `moon_ui_design.md` | UI设计稿v3，含布局/视觉/3D月球/痕迹细节/存储迁移完整设计 |
| `moon_emotion_scripts.md` | 3条电波脚本 + 回信文案标准 + 延迟设计逻辑 |
| NASA LRO 纹理 | svs.gsfc.nasa.gov/4720，正式版替换程序化纹理 |
| Artemis II Earthrise 照片 | 月球背面看地球的视觉参考 |

---

*文档版本：v1 · 2026-08-01*  
*交接人：WorkBuddy*  
*有任何疑问，问老 Lee，不要自己猜。*
