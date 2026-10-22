(() => {
  const panel = document.querySelector('.products-panel');
  const hint = panel?.querySelector('.section-hint');
  if (!panel || !hint) return;
  const field = document.createElement('fieldset');
  field.className = 'production-mode';
  field.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;border:1px solid #dfe7e2;border-radius:10px;padding:8px 12px;margin:0 0 12px';
  field.innerHTML = '<legend>制作方式</legend><label><input type=radio name=productionMode value=special checked> 同主题专场（建议 3–4 个）</label><label><input type=radio name=productionMode value=catalog> 完整目录（最多 10 个）</label>';
  hint.before(field);
  const notice = document.getElementById('catalogNotice');
  if (notice) {
    const coverHint = document.createElement('div');
    coverHint.className = 'meta';
    coverHint.textContent = '导出时会同时下载独立 PNG 封面；可作为视频封面，改作图文内容时请另行补充页面。';
    notice.after(coverHint);
  }
  let seconds = 0;
  let count = 0;
  const update = () => {
    const mode = field.querySelector('input:checked')?.value || 'special';
    const parts = count ? ['已选 ' + count + ' 个商品，预计总时长 ' + seconds.toFixed(1) + ' 秒'] : [mode === 'special' ? '同主题专场建议选择 3–4 个商品' : '完整目录最多选择 10 个商品'];
    if (mode === 'special' && count > 4) parts.push('超过建议数量，可继续生成或拆成多条同主题视频');
    if (mode === 'catalog' && count > 4) parts.push('封面展示精选项，正文完整展示全部商品');
    parts.push('请人工核对所选商品主题是否一致，以及价格与商品详情是否相符');
    if (notice) notice.textContent = parts.join('。') + '。';
  };
  field.addEventListener('change', update);
  window.addEventListener('video-duration-updated', event => {
    seconds = Number(event.detail?.seconds) || 0;
    count = Number(event.detail?.count) || 0;
    update();
  });
  update();
})();
