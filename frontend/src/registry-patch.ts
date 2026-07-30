// Guard customElements.define against duplicate registrations during HMR / multiple bundle imports
if (typeof window !== 'undefined' && window.customElements) {
  const originalDefine = window.customElements.define.bind(window.customElements);
  window.customElements.define = function(name, constructor, options) {
    if (!window.customElements.get(name)) {
      originalDefine(name, constructor, options);
    }
  };
}
