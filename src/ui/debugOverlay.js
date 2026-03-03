export function createDebugOverlay(enabled) {
  if (!enabled) {
    return {
      render() {}
    };
  }

  const el = document.createElement('pre');
  el.id = 'debugOverlay';
  document.body.appendChild(el);

  return {
    render(lines) {
      el.textContent = lines.join('\n');
    }
  };
}
