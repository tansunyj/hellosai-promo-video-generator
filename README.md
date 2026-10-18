# HellosAI 视频生成器

## 启动

在本项目目录执行 `npm run dev`，然后打开 `http://localhost:4174/`。

## 预览和导出

- 选择 1–10 个商品，并选择背景图和 BGM；两者均可选择“无”。
- 右侧是真实视频播放器，可播放、暂停和拖动进度，查看封面、商品动画、价格和结尾。
- 预览和 MP4 直接使用 `src/Video.tsx` 的 `ShopPromoGenerator`，不再维护另一套预览文案或排版。
- 两者共用服务端 `prepareInput` 生成的参数，分辨率 1080×1920，24 fps，开头封面 2.5 秒。
- 点击“合成并下载 MP4 视频”后，先合成视频，完成时自动触发浏览器下载；页面同时提供视频重下和独立 PNG 封面下载链接。
- 文件保存到浏览器设置的下载位置（通常为“下载”文件夹）；如开启“下载前询问保存位置”，请按浏览器提示选择。
- 项目 `output` 仍保留 MP4、`_cover.png` 独立封面和 `_props.json` 本次参数快照。
- 修改模板代码后需重启 `npm run dev` 并刷新网页，启动时会重新构建播放器。

## 手动重现导出

```powershell
npm run render -- ShopPromoGenerator "output/manual.mp4" --props="output/HellosAI_Promo_TIMESTAMP_props.json"
```


## 透明 Logo

启动时会处理现有支持的 Logo 素材，结果保存到 `public/assets/logos`，不覆盖原图。预览和导出共用透明素材，封面不再添加白色商品卡片。部分白色单色标志转为深色版以便在浅色背景上识别。

需要 Python 和 `tools/requirements-logos.txt` 中的依赖。当前电脑已具备这些依赖；更换电脑时执行 `python -m pip install -r tools/requirements-logos.txt`。手动更新可执行 `npm run prepare:logos`。复杂照片与渐变素材使用按文件名调整的提取规则，不是通用 AI 抠图；更换为不同构图时需复核结果。微软原素材是楼体照片，改用透明四色窗格标志。

## 网页上传素材

视频素材区的“上传素材”支持上传背景图片（PNG/JPG/WEBP，20 MB 以内）和背景音乐（MP3/WAV/M4A，50 MB 以内）。分别保存至 `public/assets/background/`、`public/assets/bgm/`，完成后自动刷新并选用。重名文件另存，不覆盖旧素材。
