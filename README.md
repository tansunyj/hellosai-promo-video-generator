# HellosAI 视频生成器

一个基于 Remotion 的竖屏 AI 数字商品宣传视频生成器。

项目用于从商品目录中选择商品，自动组合商品 Logo、套餐名称、价格、商品说明、背景图和背景音乐，生成适合短视频平台发布的 9:16 宣传视频。

## 店铺地址

订阅小铺：<https://www.16688.com.cn/shop/S393570>

## 主要功能

- Web 页面操作，不需要手动修改视频代码。
- 商品目录支持搜索、分类筛选和最多 10 个商品选择。
- 商品封面最多展示前 4 个 Logo，视频主体完整展示所有已选商品。
- 视频开头包含约 2.5 秒的商品封面画面。
- 商品场景动态展示商品名称、套餐标签、价格和说明。
- 支持选择背景图片，也支持“无背景”。
- 支持选择背景音乐，也支持“无 BGM”。
- 背景图片可以在网页中悬停预览。
- 选择 BGM 后可以在网页中试听，未选择 BGM 时不显示播放按钮。
- 支持通过网页上传背景图片和背景音乐。
- 预览播放器和最终导出视频共用 `src/Video.tsx`，保证预览和导出保持一致。
- 导出完成后自动触发浏览器下载 MP4，并提供独立 PNG 封面下载。

## 环境要求

- Windows、macOS 或 Linux。
- Node.js，建议使用较新的 LTS 版本。
- npm。
- Python 3，用于生成透明 Logo 资源。
- Python Pillow，安装依赖见 `tools/requirements-logos.txt`。

## 安装依赖

在项目根目录执行：

```powershell
npm install
python -m pip install -r tools/requirements-logos.txt
```

## 启动 Web 页面

在项目根目录执行：

```powershell
npm run dev
```

然后打开：

```text
http://localhost:4174/
```

如果 4174 端口被占用，可以先查找进程：

```powershell
netstat -ano | findstr :4174
```

结束进程时使用正确的 Windows 参数：

```powershell
taskkill /PID <进程号> /F
```

不要使用 `taskkill /p`，其中 `/P` 不是结束进程 ID 的参数。

## 网页使用流程

1. 打开 `http://localhost:4174/`。
2. 在“视频素材”区域选择背景图片或“无背景”。
3. 选择背景音乐或“无”。选择音乐后，可以点击右侧播放按钮试听。
4. 在“选择商品”区域搜索或筛选商品。
5. 点击商品卡片选择商品，最多选择 10 个。
6. 在右侧视频播放器中检查封面、商品信息、价格、Logo 和结尾 CTA。
7. 点击“合成并下载 MP4 视频”。
8. 等待视频合成完成，浏览器会自动下载 MP4。
9. 页面状态区域还会提供 MP4 重下链接和 PNG 封面下载链接。

## 导出视频规格

- 画面比例：9:16。
- 分辨率：1080 × 1920。
- 帧率：24 fps。
- 时长：根据选择的商品数量自动计算。
- 输出格式：MP4。
- 封面格式：PNG。
- 输出目录：项目内的 `output/`，同时会触发浏览器下载。

浏览器下载的实际保存位置取决于浏览器设置，通常是系统“下载”文件夹。如果浏览器开启了“下载前询问保存位置”，需要按浏览器提示选择。

## 商品目录

商品目录文件位于：

```text
public/商品目录.json
```

商品目录由 `src/server/catalog.cjs` 根据店铺商品清单生成。当前服务端从 `public/商品目录.json` 读取商品数据，包括：

- 商品名称。
- 原始商品名称。
- 商品分类。
- 商品价格。
- 商品 Logo 文件名。
- 商品标签。
- 商品说明。

如果需要重新生成商品目录，在项目根目录执行：

```powershell
node src/server/catalog.cjs
```

生成前请确认商品源文件 `店铺商品.txt` 位于项目根目录，并且使用 UTF-8 编码保存。

## 素材目录

所有视频素材位于：

```text
public/assets/
```

### 商品 Logo

原始 Logo 位于：

```text
public/assets/*.png
```

透明处理后的 Logo 位于：

```text
public/assets/logos/
```

启动服务时会运行 `tools/prepare_logos.py`，根据原始 Logo 生成透明版本。商品目录通过 `src/logo-assets.json` 映射到透明 Logo。

手动重新处理 Logo：

```powershell
npm run prepare:logos
```

### 背景图片

背景图片放在：

```text
public/assets/background/
```

支持 PNG、JPG、JPEG 和 WEBP。页面启动或点击“刷新素材列表”时会自动扫描该目录。

### 背景音乐

背景音乐放在：

```text
public/assets/bgm/
```

支持 MP3、WAV 和 M4A。页面会自动扫描该目录，渲染时根据实际视频时长使用对应音频。

### 未使用素材

当前未被商品目录引用的旧图片暂时放在：

```text
public/assets/_unused/
```

这些文件没有删除，后续需要时可以移回 `public/assets/`。

## 网页上传素材

点击“上传素材”后，可以选择：

- 背景图片：PNG、JPG、JPEG、WEBP，最大 20 MB。
- 背景音乐：MP3、WAV、M4A，最大 50 MB。

上传后文件分别保存至：

```text
public/assets/background/
public/assets/bgm/
```

上传成功后页面会自动刷新素材列表并选中刚上传的素材。同名文件不会覆盖原文件，系统会自动生成新的文件名。

## 手动使用 Remotion 导出

导出前需要准备一个由网页导出流程生成的参数文件，例如：

```text
output/HellosAI_Promo_YYYYMMDD_HHmmss_props.json
```

手动导出：

```powershell
npm run render -- ShopPromoGenerator output/manual.mp4 --props=output/HellosAI_Promo_YYYYMMDD_HHmmss_props.json
```

## 项目结构

```text
.
├─ public/
│  ├─ assets/                 Logo、背景图片、BGM 和备用素材
│  ├─ 商品目录.json            商品数据
│  ├─ cover-layout.js          封面布局
│  └─ cover-layout.d.ts
├─ src/
│  ├─ Video.tsx                视频主体组件
│  ├─ preview.tsx              Web 预览播放器入口
│  ├─ index.tsx                Remotion 入口
│  ├─ renderConfig.ts          默认渲染配置
│  ├─ selectedProducts.ts      默认商品参数
│  ├─ logo-assets.json         原始 Logo 到透明 Logo 的映射
│  └─ server/
│     ├─ server.cjs            Web 服务和 Remotion 导出服务
│     ├─ catalog.cjs           生成商品目录
│     └─ single-*.cjs          单商品文案、分类与风险边界模块
├─ web/
│  └─ index.html                Web 操作页面
├─ tools/
│  ├─ prepare_logos.py          透明 Logo 处理脚本
│  ├─ build-single-products.cjs 单商品目录构建
│  ├─ audit-single-copy.cjs     单商品文案审计
│  ├─ upgrade-single-copy.cjs   单商品文案升级
│  └─ requirements-logos.txt    Python 依赖
├─ package.json                npm 命令和依赖
├─ package-lock.json           npm 锁定依赖版本
└─ remotion.config.ts          Remotion 配置
```

## 常用命令

```powershell
# 启动 Web 页面
npm run dev

# 等价的 Web 服务命令
npm run web

# 重新处理 Logo
npm run prepare:logos

# 检查服务端 JavaScript 语法
node --check src/server/server.cjs

# 检查目录生成脚本语法
node --check src/server/catalog.cjs

# 检查 TypeScript 类型
npx.cmd tsc --noEmit
```

## GitHub 上传建议

项目已经配置 `.gitignore`，默认不上传：

- `node_modules/`。
- `output/` 渲染视频、封面和参数快照。
- Remotion 缓存和构建缓存。
- 日志文件。
- `.env`、证书和密钥文件。

商品目录和素材可能包含店铺商品信息、价格以及宣传资源。如果仓库不准备公开，建议使用 GitHub Private Repository。

## 说明

- 页面预览使用真实 Remotion Player，不维护独立的假预览布局。
- 商品 Logo、商品价格和商品文案由模板统一渲染，避免手工编辑视频时出现错位。
- 删除或替换 Logo 后，建议重新执行 `npm run prepare:logos`，并在网页中刷新商品目录。
- 修改 `src/Video.tsx`、`src/server/server.cjs` 或 `web/index.html` 后，需要重启 `npm run dev` 并刷新浏览器页面。

## 2026-10-21 视频优化

- 商品目录结构不变。运行时派生短标题、库存状态，不覆盖原始名称、价格和库存。
- 缺货、未知及需确认的库存默认不能勾选；人工确认后可临时允许单个商品，本次操作不会修改目录。
- 可按分类筛选或快速选择 AI 工具、邮箱/账号；快速选择结果仍需人工核对。
- 可编辑封面主副标题、结尾品牌与文案，控制结尾网址及关注提示是否显示。
- 可选两条简短信息提示（每条最多40字），由用户核实，不自动生成售后承诺。
- 封面固定2.5秒、结尾2秒。自动模式下1～4个商品每个3.25秒，5～10个商品每个2.5秒；标准模式每个3.25秒。信息提示每条另加2秒。
- 例如4个商品无提示约17.5秒，10个商品无提示约29.5秒；不为强行缩短时长而隐藏价格。
- 预览、MP4与独立封面使用同一Remotion组件和配置。音乐循环补足并淡入淡出，支持无音乐、无背景。
- 修改后需重启服务：在原终端按 Ctrl+C，再运行 npm run dev，最后刷新页面。

AI文案候选生成、自动卡点和传播效果分析尚未实现。本工具不会保证流量或平台审核结果；商品信息须真实，发布前请自行核实。

### 动态三段式视觉补齐（2026-10-21）

当前模板版本为 `20261021-motion-v2`，预览上方会显示实际加载的版本。此版本重做了封面主题入场、商品分层卡片、独立高对比价格区域、顶部进度条和品牌 CTA，不再仅调整旧排版的配置。底部动态线条是装饰动画，不代表自动识别 BGM 节拍。

5～10 个商品的自动节奏调整为每项 3 秒，保证要点和价格出现后至少保留约 2 秒稳定阅读时间。10 个商品约 34.5 秒；1～4 个商品及标准节奏仍为每项 3.25 秒，封面 2.5 秒、结尾 2 秒。可选提示卡每张增加 2 秒。

服务启动后修改 src 下的组件，刷新页面会按文件更新时间重新构建预览脚本。修改 src/server/server.cjs 本身仍需重启服务。已有 MP4 不会自动改变，需要重新导出。


