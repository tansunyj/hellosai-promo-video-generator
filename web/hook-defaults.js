(() => {
  const title = document.getElementById('hookTitle');
  const subtitle = document.getElementById('hookSubtitle');
  if (!title || !subtitle) return;
  title.value = '';
  subtitle.value = '';
  title.placeholder = '留空：按所选商品生成开场钩子，可手动填写';
  subtitle.placeholder = '留空：自动生成简短承接文案';
  title.dispatchEvent(new Event('input', {bubbles: true}));
})();
