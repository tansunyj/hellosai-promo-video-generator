(() => {
  const original = document.querySelector('main.layout');
  const media = document.querySelector('.media-panel');
  if (!original || !media) return;
  const byId = id => document.getElementById(id);
  const mediaHome = document.createComment('shared-media-home');
  media.before(mediaHome);
  original.id = 'catalogTabPanel';
  original.setAttribute('role', 'tabpanel');
  original.setAttribute('aria-labelledby', 'catalogTab');
  const tabs = document.createElement('nav');
  tabs.className = 'generator-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', '视频生成方式');
  tabs.innerHTML = '<button id=catalogTab type=button role=tab aria-selected=true aria-controls=catalogTabPanel>原商品视频生成</button><button id=singleTab type=button role=tab aria-selected=false aria-controls=singleTabPanel tabindex=-1>单品视频生成</button>';
  original.before(tabs);
  const panel = document.createElement('main');
  panel.id = 'singleTabPanel';
  panel.className = 'layout single-layout';
  panel.hidden = true;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'singleTab');
  panel.innerHTML = `<div class=single-editor>
    <div id=singleMediaSlot></div>
    <section class='panel single-form'>
      <h2 class=section-title>选择一个商品 · 生成15秒五幕广告</h2>
      <p class=single-help>从商品文案.json读取。选一个商品，自动填入「想做什么 → 卡在哪 → 对应服务 → 怎么办 → 核对结果」五幕文案；原商品目录不变。</p>
      <label>搜索单品目录<input id=singleSearch type=search placeholder=搜索商品名称或分类></label>
      <label>商品<select id=singleProductSelect size=7 aria-label=单品商品目录></select></label>
      <div class=single-actions><button id=reloadSingle type=button>重新加载单品数据</button><span id=singleCount class=single-help></span></div>
      <p id=singleSource class=single-help></p><p id=singleWarning class=single-warning role=status></p>
    </section>
    <section class='panel single-form' id=singleEditor hidden>
      <h2 class=section-title>解决路径 · 自动填入，可逐项修改</h2><p id=singleChain class=single-help style="white-space:pre-line;line-height:1.9"></p>
      <div class=single-two><label>视频商品短名<input id=singleProductTitle maxlength=64></label><label>品牌名称<input id=singleBrand maxlength=24></label></div>
      <label>右上角分类<input id=singleCategory maxlength=18></label>
      <button id=singleApplyScenario type=button>按当前商品重新生成场景稿（替换本页文案）</button>
      <p class=single-help>自动匹配服务类型和使用场景；已识别的人工改稿保留。支付、刷脸、验证码不能当作所有国内用户必遇的问题。</p>
      <label>适用用户<input id=singleAudience maxlength=80></label>
      <label>卡点核对依据（不进入视频画面）<textarea id=singleBasis maxlength=240 placeholder=填写已核实的咨询场景或商品适用条件，不要填写客户隐私></textarea></label>
      <label>服务范围与不能解决的问题（审核用）<textarea id=singleBoundary maxlength=100></textarea></label>
      <p id=singleFacts class=single-help></p>
      <h3>01 · 想做什么 → 遇到问题 → 怎么办？</h3><label>换一种问题切入<select id=singleHookOptions></select></label><label>主标题<input id=singleHook maxlength=24></label><label>副标题<input id=singleSubtitle maxlength=48></label>
      <h3>02 · 我有解决办法 → 对应服务</h3><label>解决机制<input id=singleOffer maxlength=48></label><p class=single-help>价格和Logo使用所选商品数据，不从其他商品复用。价格不是统一月费。</p>
      <h3>03 · 能交付什么，有何边界</h3><div id=singlePoints></div>
      <h3>04 · 具体怎么办，如何核对</h3><div id=singleSteps></div>
      <h3>05 · CTA行动引导与品牌结尾</h3><label>结尾标题<input id=singleCtaTitle maxlength=40></label><label>按钮文案<input id=singleCtaButton maxlength=24></label><label>补充说明<textarea id=singleDisclaimer maxlength=64></textarea></label>
      <div class=single-two><label>强调色<input id=singleAccent type=color></label><label>背景图片强度<input id=singleStrength type=range min=0 max=50 value=18><span id=singleStrengthValue class=single-help>18%</span></label></div>
      <label class=single-check><input id=singleAllow type=checkbox>已核对缺货、库存未知或停止销售提示，仍允许本次展示</label>
      <label class=single-check><input id=singleConfirm type=checkbox>已核对所选商品的名称、参考价、期限、交付和文案</label>
      <button id=resetSingle type=button>恢复该商品的格式化草稿</button>
    </section>
  </div>
  <aside class='panel preview-panel single-preview'><h2 class=section-title>单品视频预览 · 15秒</h2><div id=singleVideoPreview></div><button id=singleExport class=button type=button disabled>请先选择一个商品</button><p class=single-help>导出MP4、独立大字报PNG封面和注入数据JSON。封面会自动提取视频钩子、商品信息与关键事实。</p><div id=singleStatus class=status role=status></div><div id=singleDownloads></div></aside>`;
  original.after(panel);
  const style = document.createElement('style');
  style.textContent = '[role=tabpanel][hidden],.single-layout [hidden]{display:none!important}.generator-tabs{max-width:1400px;margin:20px auto 0;padding:0 22px;display:flex;gap:8px}.generator-tabs button{padding:12px 22px;border:1px solid #d5dfd9;border-radius:8px;background:#fff;color:#52635b;font:inherit;cursor:pointer}.generator-tabs [aria-selected=true]{background:#1c745d;color:#fff;border-color:#1c745d}.single-editor{display:grid;align-content:start;gap:22px;min-width:0}.single-form{display:grid;gap:14px}.single-form label{display:grid;gap:8px;font-size:13px;font-weight:700}.single-form input:not([type=checkbox]):not([type=color]):not([type=range]),.single-form textarea,.single-form select{box-sizing:border-box;width:100%;padding:11px;border:1px solid #d5dfd9;border-radius:8px;font:inherit;background:#fff;color:#15211c}.single-form select{min-height:180px}.single-form textarea{min-height:74px;resize:vertical}.single-form h3{margin:14px 0 0;font-size:14px}.single-help{font-size:12px;line-height:1.7;color:#64736b;margin:0;overflow-wrap:anywhere}.single-warning{color:#9c4b24;font-size:13px;line-height:1.7;white-space:pre-line;margin:0}.single-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.single-point,.single-step{display:grid;gap:10px;margin-bottom:14px}.single-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.single-form button{border:1px solid #d5dfd9;border-radius:8px;background:#f0f6f2;padding:10px 14px;cursor:pointer}.single-check{display:flex!important;align-items:center;line-height:1.7}.single-check input{flex:none}.single-preview{position:sticky;top:18px}.single-preview #singleVideoPreview{width:100%;max-width:320px;aspect-ratio:9/16;overflow:hidden;margin:0 auto 18px;background:#faf9f6}.single-preview a{display:block;margin-top:12px;overflow-wrap:anywhere;color:#1c745d}@media(max-width:850px){.single-preview{position:static}.single-two{grid-template-columns:1fr}.generator-tabs{padding:0 14px}}';
  document.head.append(style);
  for (let index = 0; index < 3; index++) {
    const group = document.createElement('div');
    group.className = 'single-point';
    group.innerHTML = `<label>说明${index + 1}标题<input id=singlePointTitle${index} maxlength=12></label><label>内容<textarea id=singlePointDetail${index} maxlength=48></textarea></label>`;
    byId('singlePoints').append(group);
    const step = document.createElement('label');
    step.className = 'single-step';
    step.textContent = '步骤' + (index + 1);
    const input = document.createElement('input');
    input.id = 'singleStep' + index;
    input.maxLength = 18;
    step.append(input);
    byId('singleSteps').append(step);
  }
  for (let index = 0; index < 3; index++) {
    const label = document.createElement('label'); label.textContent = '步骤' + (index + 1) + ' · 具体操作与核对';
    const input = document.createElement('input'); input.id = 'singleStepDetail' + index; input.maxLength = 48; label.append(input);
    byId('singleStep' + index).closest('label').after(label);
  }
  let catalog = [];
  let selected = null;
  let active = false;
  let exporting = false;
  let revision = 0;
  let timer;
  let latest = null;
  const drafts = new Map();
  const extraFields = {hookQuestion: ['singleQuestion', '问题转折（例如：怎么办？）', 18], hookAnswer: ['singleAnswer', '明确解法（代充/账号/接码等）', 40], hookPayoff: ['singlePayoff', '交付后的结果或边界', 48], offerScene: ['singleScene', '用户想做什么', 40], offerEvidence: ['singleEvidence', '价格下方交付要点', 64], reasonsTitle: ['singleReasons', '交付范围页标题', 24], processTitle: ['singleProcess', '办理页标题', 24], processSubtitle: ['singleProcessSubtitle', '办理页承接句', 48], ctaNote: ['singleCtaNote', '按钮下方承接句', 48]};
  const anchors = {hookQuestion: 'singleSubtitle', hookAnswer: 'singleSubtitle', hookPayoff: 'singleAnswer', offerScene: 'singleOffer', offerEvidence: 'singleScene', reasonsTitle: 'singlePoints', processTitle: 'singleSteps', processSubtitle: 'singleProcess', ctaNote: 'singleCtaButton'};
  for (const [key, [id, label, length]] of Object.entries(extraFields)) {
    const element = document.createElement('label'); element.textContent = label;
    const input = document.createElement('input'); input.id = id; input.maxLength = length; element.append(input);
    const anchor = byId(anchors[key]);
    if (['singlePoints', 'singleSteps'].includes(anchor.id)) anchor.before(element); else anchor.closest('label').after(element);
  }
  const fields = {productTitle: 'singleProductTitle', brand: 'singleBrand', category: 'singleCategory', hookTitle: 'singleHook', hookSubtitle: 'singleSubtitle', offerSubtitle: 'singleOffer', ctaTitle: 'singleCtaTitle', ctaButton: 'singleCtaButton', disclaimer: 'singleDisclaimer', accent: 'singleAccent'};
  Object.assign(fields, {scenarioAudience: 'singleAudience', scenarioBasis: 'singleBasis', serviceBoundary: 'singleBoundary'});
  byId('singleConfirm').closest('label').lastChild.textContent = '已核对真实用户卡点、服务边界、价格期限，以及五幕文案与当前商品相符';
  for (const [key, [id]] of Object.entries(extraFields)) fields[key] = id;
  function storyValue() {
    const story = Object.fromEntries(Object.entries(fields).map(([key, id]) => [key, byId(id).value]));
    return {...story, points: [0, 1, 2].map(index => ({title: byId('singlePointTitle' + index).value, detail: byId('singlePointDetail' + index).value})), steps: [0, 1, 2].map(index => byId('singleStep' + index).value), stepDetails: [0, 1, 2].map(index => byId('singleStepDetail' + index).value), backgroundStrength: Number(byId('singleStrength').value) / 100, confirmed: byId('singleConfirm').checked};
  }
  function payload() {
    return {productId: selected.id, story: storyValue(), background: byId('backgroundSelect').value, bgm: byId('bgmSelect').value, allowUnavailable: byId('singleAllow').checked};
  }
  function exportState() {
    byId('singleExport').disabled = exporting || !selected;
    byId('singleExport').textContent = exporting ? '正在导出单品视频……' : selected ? '导出单品视频、封面和JSON' : '请先选择一个商品';
  }
  function showChain() {
    if (!selected) return;
    const story = storyValue();
    byId('singleChain').textContent = '想做：' + story.offerScene + '\n卡点：' + story.hookSubtitle + '\n转折：' + story.hookQuestion + '\n解法：' + story.hookAnswer + '\n怎么办：' + story.steps.join(' → ') + '\n结果核对：' + story.hookPayoff;
  }
  function saveDraft() {if (selected) {drafts.set(selected.id, storyValue()); showChain();}}
  function loadStory(story) {
    for (const [key, id] of Object.entries(fields)) byId(id).value = story[key] || '';
    story.points.forEach((point, index) => {byId('singlePointTitle' + index).value = point.title; byId('singlePointDetail' + index).value = point.detail;});
    story.steps.forEach((step, index) => {byId('singleStep' + index).value = step; byId('singleStepDetail' + index).value = story.stepDetails?.[index] || '';});
    showChain();
    byId('singleStrength').value = story.backgroundStrength * 100;
    byId('singleStrengthValue').textContent = Math.round(story.backgroundStrength * 100) + '%';
    byId('singleConfirm').checked = false;
    byId('singleAllow').checked = false;
  }
  function choose() {
    saveDraft();
    selected = catalog.find(product => product.id === Number(byId('singleProductSelect').value)) || null;
    latest = null;
    byId('singleDownloads').replaceChildren();
    byId('singleEditor').hidden = !selected;
    byId('singleStatus').textContent = '';
    if (selected) {
      loadStory(drafts.get(selected.id) || selected.story);
      const options = byId('singleHookOptions'); options.replaceChildren();
      for (const question of selected.copywriting?.hookOptions || [selected.story.hookTitle]) {const option = document.createElement('option'); option.value = question; option.textContent = question; options.append(option);}
      options.value = byId('singleHook').value;
      byId('singleSource').textContent = '原商品：' + selected.source.rawTitle + '｜页面参考价：' + selected.product.price;
      byId('singleWarning').textContent = '快照库存：' + selected.stock + '（' + selected.stockStatus + '）\n' + selected.review.warnings.join('；');
      byId('singleFacts').style.whiteSpace = 'pre-line';
      byId('singleFacts').textContent = '商品依据：\n' + (selected.copywriting?.evidence?.productFacts || []).map(fact => fact.field + '：' + fact.value).join('\n') + '\n' + (selected.copywriting?.evidence?.note || '场景须人工核对');
      const merchantRule = selected.copywriting?.evidence?.merchantRule;
      if (merchantRule) byId('singleFacts').textContent += '\n商家补充的实际卡点：' + merchantRule.blocker + (merchantRule.warranty === 'none' ? '\n最新售后口径：' + merchantRule.risk : '');
    } else {
      byId('singleSource').textContent = '';
      byId('singleWarning').textContent = '';
      window.clearSingleVideoPreview?.();
    }
    exportState(); schedule();
  }
  function drawCatalog() {
    const previous = selected?.id;
    const query = byId('singleSearch').value.trim().toLowerCase();
    const visible = catalog.filter(product => [product.source.rawTitle, product.product.title, product.category].join(' ').toLowerCase().includes(query));
    const select = byId('singleProductSelect');
    select.replaceChildren();
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = '请选择一个商品'; select.append(placeholder);
    for (const product of visible) {
      const option = document.createElement('option'); option.value = product.id;
      option.textContent = product.product.title + ' ｜ ' + product.product.price + (product.stockStatus !== 'available' ? ' ｜ 库存需核对' : '');
      select.append(option);
    }
    if (previous && !visible.some(product => product.id === previous)) {
      const option = document.createElement('option'); option.value = selected.id; option.textContent = '当前已选：' + selected.product.title; select.append(option);
    }
    select.value = previous ? String(previous) : '';
    byId('singleCount').textContent = '独立数据共' + catalog.length + '项，本次匹配' + visible.length + '项';
  }
  async function loadCatalog() {
    const response = await fetch('/api/single-products', {cache: 'no-store'});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '单品目录读取失败');
    const previousId = selected?.id; drafts.clear(); selected = null; catalog = data.products; drawCatalog();
    if (previousId && catalog.some(product => product.id === previousId)) byId('singleProductSelect').value = String(previousId);
    choose();
  }
  function schedule() {
    revision++; clearTimeout(timer);
    if (!selected) return;
    const current = revision;
    timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/single-preview', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload())});
        const data = await response.json();
        if (current !== revision) return;
        if (!response.ok) throw new Error(data.error || '单品预览失败');
        latest = data.inputProps;
        window.updateSingleVideoPreview?.(latest);
        byId('singleStatus').textContent = '15秒 · 场景问题与商品文案已填入；核对后可导出。';
      } catch (error) {if (current === revision) byId('singleStatus').textContent = error.message;}
    }, 160);
  }
  function activate(single) {
    active = single;
    original.hidden = single; panel.hidden = !single;
    for (const [id, on] of [['catalogTab', !single], ['singleTab', single]]) {byId(id).setAttribute('aria-selected', String(on)); byId(id).tabIndex = on ? 0 : -1;}
    if (single) {byId('singleMediaSlot').append(media); schedule();}
    else mediaHome.after(media);
  }
  byId('catalogTab').onclick = () => activate(false);
  byId('singleTab').onclick = () => activate(true);
  tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const single = event.key === 'End' || event.key !== 'Home' && !active;
    activate(single); byId(single ? 'singleTab' : 'catalogTab').focus();
  });
  byId('singleProductSelect').onchange = choose;
  byId('singleApplyScenario').onclick = () => {
    if (!selected?.recommendedStory || !window.confirm('将替换当前商品的本页文案，原商品文案.json不会改动。继续？')) return;
    loadStory(selected.recommendedStory); saveDraft(); schedule();
    const options = byId('singleHookOptions'); options.replaceChildren();
    for (const question of selected.recommendedHookOptions || [selected.recommendedStory.hookTitle]) {
      const option = document.createElement('option'); option.value = question; option.textContent = question; options.append(option);
    }
  };
  byId('singleSearch').oninput = drawCatalog;
  byId('singleHookOptions').onchange = () => {byId('singleHook').value = byId('singleHookOptions').value; byId('singleConfirm').checked = false; saveDraft(); schedule();};
  byId('reloadSingle').onclick = () => loadCatalog().catch(error => byId('singleStatus').textContent = error.message);
  byId('singleEditor').addEventListener('input', event => {
    if (event.target.id !== 'singleConfirm') byId('singleConfirm').checked = false;
    byId('singleStrengthValue').textContent = byId('singleStrength').value + '%';
    saveDraft(); schedule();
  });
  byId('resetSingle').onclick = () => {if (selected) {drafts.delete(selected.id); loadStory(selected.story); schedule();}};
  window.addEventListener('media-settings-updated', () => {if (active) schedule();});
  window.addEventListener('single-preview-ready', () => {if (latest) window.updateSingleVideoPreview(latest);});
  byId('singleExport').onclick = async () => {
    if (!selected || exporting) return;
    exporting = true; exportState(); byId('singleDownloads').replaceChildren();
    try {
      const response = await fetch('/api/single-render', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload())});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '单品导出失败');
      const started = Date.now();
      for (;;) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const poll = await fetch('/api/status', {cache: 'no-store'});
        const state = await poll.json();
        if (!poll.ok) throw new Error(state.error || '读取导出状态失败');
        if (state.startedAt !== result.startedAt) throw new Error('导出任务已切换，请勿同时从多个页面提交');
        byId('singleStatus').textContent = state.message;
        if (state.status === 'error') throw new Error(state.message);
        if (state.status === 'done') {
          for (const [key, label] of [['video', '下载MP4视频'], ['cover', '下载PNG封面'], ['props', '下载注入数据JSON']]) {
            const info = state.downloads[key]; if (!info) throw new Error('导出文件缺失：' + key);
            const anchor = document.createElement('a'); anchor.href = info.url; anchor.download = info.filename; anchor.textContent = label + ' · ' + info.filename; byId('singleDownloads').append(anchor);
          }
          break;
        }
        if (Date.now() - started > 32 * 60 * 1000) throw new Error('等待导出超时，请查看服务窗口；不要重复提交任务');
      }
    } catch (error) {byId('singleStatus').textContent = error.message;}
    finally {exporting = false; exportState();}
  };
  loadCatalog().catch(error => byId('singleStatus').textContent = error.message);
})();

