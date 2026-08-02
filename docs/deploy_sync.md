# 上线同步与部署交接

> 用于把本仓库状态交给部署 AI 继续发布到 GitHub Pages。

## 仓库信息

- 本地项目路径：`C:\Users\l\Documents\项目开发\moon-emotion-station`
- Git 远端：`https://github.com/rzliwh/moon-emotion-station.git`
- 默认发布分支：`master`
- 当前待合并功能分支：`codex/wave-life-stages`
- GitHub Pages 预计地址：`https://rzliwh.github.io/moon-emotion-station/`

## 本次上线内容

1. 隐藏地球外侧蓝色光圈，只保留蓝星本体。
2. 地球三档亮度提升为 `0.675 / 1.125 / 1.8`。
3. 新增电波 `wave_08-12`，覆盖学习阶段、职场转折、爱情、创业、至暗时刻。
4. 页面缓存版本号更新为 `?v=20260802-wave-life-v1`。

## 需要同步/检查的文档

| 文件 | 用途 |
|------|------|
| `C:\Users\l\Documents\项目开发\moon-emotion-station\index.html` | 页面入口与缓存版本号 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\js\data\signals.js` | 游戏电波数据，已包含 12 条电波 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\js\scene\moon-scene.js` | 地球去光晕与亮度逻辑 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\js\app.js` | 月光值联动地球亮度 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\docs\moon_emotion_scripts.md` | 仓库内电波文案文档，已同步为 12 条 |
| `C:\Users\l\WorkBuddy\20260504153728\moon_emotion_scripts.md` | WorkBuddy 外部源文档，已同步为 12 条 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\docs\codex_handover.md` | 项目交接文档 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\docs\moon_ui_design.md` | 视觉与交互设计稿 |
| `C:\Users\l\Documents\项目开发\moon-emotion-station\docs\deploy_sync.md` | 本部署交接文档 |

## 部署步骤

```powershell
cd C:\Users\l\Documents\项目开发\moon-emotion-station
git push origin codex/wave-life-stages
git checkout master
git merge --no-ff codex/wave-life-stages
git push origin master
```

推送后检查 GitHub Pages：

1. 打开仓库 `Settings -> Pages`。
2. 确认 `Build and deployment` 为 `Deploy from a branch`，分支为 `master`，路径为 `/root`。
3. 等待 1-3 分钟，访问 `https://rzliwh.github.io/moon-emotion-station/`。
4. 页面加载后检查地球亮度、12 条电波轮换、回信弹窗和痕迹新增是否正常。

## 本地验证

```powershell
cd C:\Users\l\Documents\项目开发\moon-emotion-station
python -m http.server 8000
```

本地地址：`http://127.0.0.1:8000`
