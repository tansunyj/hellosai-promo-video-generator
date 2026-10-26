# 单品视频情绪漏斗模板 V10

模板不再把“五问”直接当作五个栏目，而是把它们转译成五种连续情绪：

| 数据问题 | 情绪任务 | 画面表达 |
|---|---|---|
| 贵不贵？ | 防损焦虑 | “先别买贵/买错”后揭示真实页面价 |
| 是什么？ | 价格奖励 | Logo放射线、商品名、重复价格和规格 |
| 凭什么放心？ | 安心确定 | 先给安心结论，再展示三条可核对事实 |
| 怎么买？ | 轻松可执行 | 横向三步路径和当前步骤说明 |
| 现在做什么？ | 行动推动 | 动态图形、单一描边按钮和行动提示 |

## 数据结构

`copywriting.decisionFlow`升级为version 2，并增加：

```json
{
  "emotion": {
    "tension": {},
    "reveal": {},
    "reassurance": {},
    "ease": {},
    "action": {}
  }
}
```

情绪文案由`buildDecisionFlow()`根据商品类别、服务形式、商品事实和服务边界生成。正文、封面、API预览和商品目录使用同一套生成逻辑。

## 同步

```powershell
npm.cmd run sync:five-questions
```

同步目标：`public/商品文案.json`与`data/single-product/single-products.json`。
