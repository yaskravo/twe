// * Whether this computer is likely to stutter under the interface's effects — the case Expert's
// * light mode is on for when it is left on automatic (Settings → Expert → Performance): few
// * processor cores, little memory, or graphics drawn without a GPU. Worked out once.
let weak: boolean;

function hasSoftwareGraphics() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if(!gl) {
      // * no WebGL says nothing of the speed: it can be turned off, or not there at all
      return false;
    }

    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer: string = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch(err) {
    return false;
  }
}

export default function isWeakDevice() {
  if(weak !== undefined) {
    return weak;
  }

  // * a browser driven by tests: it often draws without a GPU, and the suites must see the interface
  // * as it is set, not lightened
  if(navigator.webdriver) {
    return weak = false;
  }

  const cores = navigator.hardwareConcurrency || 4;
  // * in gigabytes, rounded down to a power of two; only Chromium says it
  const memory: number = (navigator as any).deviceMemory;
  return weak = cores <= 2 ||
    (memory !== undefined && (memory <= 2 || (cores <= 4 && memory <= 4))) ||
    hasSoftwareGraphics();
}
