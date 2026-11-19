(() => {
  const focusArea = document.querySelector('#keyboard-focus');
  const focusStatus = document.querySelector('#focus-status');
  const lastKey = document.querySelector('#last-key');
  const eventKey = document.querySelector('#event-key');
  const eventCode = document.querySelector('#event-code');
  const eventType = document.querySelector('#event-type');
  const eventLog = document.querySelector('#event-log');
  const clearButton = document.querySelector('#clear-events');
  const languageToggle = document.querySelector('#language-toggle');
  const themeToggle = document.querySelector('#theme-toggle');
  const keyboardLayout = document.querySelector('#keyboard-layout');
  const modelSelect = document.querySelector('#keyboard-model');
  const fnSwapOption = document.querySelector('#fn-swap-option');
  const swapFnCtrl = document.querySelector('#swap-fn-ctrl');
  const modifierCards = [...document.querySelectorAll('.modifier-card')];
  const pressedKeys = new Map();
  const eventHistory = [];
  let visualKeys = [];
  let capsLockOn = false;
  let language = 'zh';
  let selectedLayout = 'compact-usb';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let themeMode = localStorage.getItem('keyboard-theme') || 'system';
  if (!['system', 'light', 'dark'].includes(themeMode)) themeMode = 'system';

  const translations = {
    zh: {
      shortcutHint: '测试区获得焦点时，会拦截浏览器允许屏蔽的按键功能与快捷键；点击区域外恢复。系统级快捷键无法屏蔽。',
      eyebrow: 'MAC KEYBOARD CHECKER', title: 'Mac 键盘状态检测器', intro: '点击下方区域后按键，实时查看按键是否被网页正确识别。',
      waiting: '等待输入', testerLabel: '键盘测试区域', focusLabel: '键盘输入测试区域', keyboardLayoutLabel: 'Mac 键盘布局', modelPickerLabel: '键盘型号选择', swapFnCtrl: '交换 Fn 与 Ctrl', pressHere: '在这里按下键盘', pressHint: '支持普通按键、组合键和 Mac 修饰键',
      modelCompactUsb: 'Magic Keyboard USB‑C · 紧凑版 · US English', modelNumericClassic: 'Magic Keyboard with Numeric Keypad · 数字区 · 经典版', modelPc104: '标准104美式键盘 英语-美国', modelLaptopPc: '常见笔记本电脑键盘（带独立数字区）', modelMacbookPro: 'MacBook Pro · M2 及之后机型', modelMacbookAir: 'MacBook Air · M2 及之后机型', modelMacbookNeo: 'MacBook Neo · A18 及之后机型',
      modifierLabel: '修饰键状态', command: 'Command', option: 'Option', control: 'Control', shift: 'Shift', capsLock: 'Caps Lock', notPressed: '未按下', notEnabled: '未开启', pressed: '按下', enabled: '已开启',
      liveEvent: 'LIVE EVENT', latestInput: '最近一次输入', clear: '清空记录', key: '按键', code: '代码', type: '类型', emptyLog: '按键事件会显示在这里',
      macNotes: 'MAC NOTES', usage: '使用说明', noteCommand: 'Command 会被浏览器识别为 <code>Meta</code>。', noteOption: 'Option 对应 <code>Alt</code>，可与其他按键组成组合键。', noteCaps: 'Caps Lock 松开后仍保持“开启”状态，再按一次即可关闭。', privacy: '所有检测只在当前页面完成，不会上传按键信息。', footer: '提示：切换到其他应用或浏览器标签页后，网页无法读取系统级键盘状态。',
      switchLabel: 'Switch to English', switchText: 'English', themeSystem: '跟随系统主题', themeLight: '切换到浅色模式', themeDark: '切换到深色模式', keyup: '松开', keydown: '按下', repeat: '持续按下', event: '事件'
    },
    en: {
      shortcutHint: 'While the test area has focus, cancelable key actions and browser shortcuts are blocked. Click outside to restore them. System shortcuts cannot be blocked.',
      eyebrow: 'MAC KEYBOARD CHECKER', title: 'Mac Keyboard Status Checker', intro: 'Click the area below, then press a key to see how the browser detects it in real time.',
      waiting: 'Waiting for input', testerLabel: 'Keyboard test area', focusLabel: 'Keyboard input test area', keyboardLayoutLabel: 'Mac keyboard layout', modelPickerLabel: 'Keyboard model selector', swapFnCtrl: 'Swap Fn and Ctrl', pressHere: 'Press a key here', pressHint: 'Supports regular keys, combinations, and Mac modifier keys',
      modelCompactUsb: 'Magic Keyboard USB‑C · Compact · US English', modelNumericClassic: 'Magic Keyboard with Numeric Keypad · Numeric keypad · Classic', modelPc104: 'Standard 104-key US keyboard · English (United States)', modelLaptopPc: 'Common laptop keyboard with a dedicated numeric keypad', modelMacbookPro: 'MacBook Pro · M2 and later', modelMacbookAir: 'MacBook Air · M2 and later', modelMacbookNeo: 'MacBook Neo · A18 and later',
      modifierLabel: 'Modifier key status', command: 'Command', option: 'Option', control: 'Control', shift: 'Shift', capsLock: 'Caps Lock', notPressed: 'Not pressed', notEnabled: 'Off', pressed: 'Pressed', enabled: 'On',
      liveEvent: 'LIVE EVENT', latestInput: 'Latest input', clear: 'Clear log', key: 'Key', code: 'Code', type: 'Type', emptyLog: 'Key events will appear here',
      macNotes: 'MAC NOTES', usage: 'How it works', noteCommand: 'Command is reported by the browser as <code>Meta</code>.', noteOption: 'Option maps to <code>Alt</code> and can be used in combinations.', noteCaps: 'Caps Lock stays on after release; press it again to turn it off.', privacy: 'All detection happens in this page. No key data is uploaded.', footer: 'Note: the page cannot read system-wide keyboard state while another app or tab is active.',
      switchLabel: '切换到中文', switchText: '中文', themeSystem: 'Follow system theme', themeLight: 'Switch to light mode', themeDark: 'Switch to dark mode', keyup: 'Released', keydown: 'Pressed', repeat: 'Held', event: 'event'
    }
  };

  const keyNames = {
    MetaLeft: '⌘ Command', MetaRight: '⌘ Command',
    AltLeft: '⌥ Option', AltRight: '⌥ Option',
    ControlLeft: '⌃ Control', ControlRight: '⌃ Control',
    ShiftLeft: '⇧ Shift', ShiftRight: '⇧ Shift',
    CapsLock: '⇪ Caps Lock',
    Space: 'Space', Enter: 'Return', Escape: 'Esc',
    Backspace: 'Delete', Tab: 'Tab',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
    F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
    Power: 'Lock', KeyboardLock: 'Lock', Fn: 'fn'
  };

  function t(key) { return translations[language][key]; }

  function localizeKey(event) {
    const localNames = { Space: language === 'zh' ? '空格' : 'Space', Enter: language === 'zh' ? '回车' : 'Return', Backspace: language === 'zh' ? '删除' : 'Delete' };
    if (['Power', 'KeyboardLock', 'Lock'].includes(event.code) || ['Power', 'KeyboardLock', 'Lock'].includes(event.key)) return 'Lock';
    return localNames[event.code] || keyNames[event.code] || (event.key && event.key.length === 1 ? event.key.toUpperCase() : event.key || event.code);
  }

  function visualCode(event) {
    return ['Power', 'KeyboardLock', 'Lock'].includes(event.code) || ['Power', 'KeyboardLock', 'Lock'].includes(event.key) ? 'Power' : event.code;
  }

  const letterRows = [
    [{ code: 'Tab', label: 'tab', className: 'key-wide' }, 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', { code: 'BracketLeft', label: '{', sub: '[' }, { code: 'BracketRight', label: '}', sub: ']' }, { code: 'Backslash', label: '|', sub: '\\' }],
    [{ code: 'CapsLock', label: 'caps lock', className: 'key-caps' }, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', { code: 'Semicolon', label: ':', sub: ';' }, { code: 'Quote', label: '&quot;', sub: "'" }, { code: 'Enter', label: 'return', className: 'key-enter' }],
    [{ code: 'ShiftLeft', label: 'shift', className: 'key-shift' }, 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', { code: 'Comma', label: '&lt;', sub: ',' }, { code: 'Period', label: '&gt;', sub: '.' }, { code: 'Slash', label: '?', sub: '/', }, { code: 'ShiftRight', label: 'shift', className: 'key-shift' }],
    [{ code: 'Fn', label: 'fn', className: 'key-small' }, { code: 'ControlLeft', label: 'control', className: 'key-small' }, { code: 'AltLeft', label: 'option', className: 'key-small' }, { code: 'MetaLeft', label: 'command', className: 'key-small' }, { code: 'Space', label: '', className: 'key-space' }, { code: 'MetaRight', label: 'command', className: 'key-small' }, { code: 'AltRight', label: 'option', className: 'key-small' }, { code: 'ControlRight', label: 'control', className: 'key-small' }]
  ];

  const compactLetterRows = [
    [{ code: 'Tab', label: '⇥', className: 'key-wide' }, 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', { code: 'BracketLeft', label: '{', sub: '[' }, { code: 'BracketRight', label: '}', sub: ']' }, { code: 'Backslash', label: '|', sub: '\\' }],
    [{ code: 'CapsLock', label: '中/英', sub: 'caps lock', className: 'key-caps' }, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', { code: 'Semicolon', label: ':', sub: ';' }, { code: 'Quote', label: '&quot;', sub: "'" }, { code: 'Enter', label: '↵', className: 'key-enter' }],
    [{ code: 'ShiftLeft', label: '⇧', className: 'key-shift' }, 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', { code: 'Comma', label: '&lt;', sub: ',' }, { code: 'Period', label: '&gt;', sub: '.' }, { code: 'Slash', label: '?', sub: '/' }, { code: 'ShiftRight', label: '⇧', className: 'key-shift' }],
    [{ code: 'Fn', label: '◎', className: 'key-small compact-globe' }, { code: 'ControlLeft', label: '⌃', sub: 'control', className: 'key-small' }, { code: 'AltLeft', label: '⌥', sub: 'option', className: 'key-small' }, { code: 'MetaLeft', label: '⌘', sub: 'command', className: 'key-small' }, { code: 'Space', label: '', className: 'key-space' }, { code: 'MetaRight', label: '⌘', sub: 'command', className: 'key-small' }, { code: 'AltRight', label: '⌥', sub: 'option', className: 'key-small' }, { code: 'ArrowLeft', label: '◀', className: 'arrow-key' }, { code: 'ArrowUp', label: '▲', className: 'arrow-key' }, { code: 'ArrowDown', label: '▼', className: 'arrow-key' }, { code: 'ArrowRight', label: '▶', className: 'arrow-key' }]
  ];

  const numberRow = [{ code: 'Backquote', label: '~', sub: '`', className: 'key-medium' }, { code: 'Digit1', label: '!', sub: '1' }, { code: 'Digit2', label: '@', sub: '2' }, { code: 'Digit3', label: '#', sub: '3' }, { code: 'Digit4', label: '$', sub: '4' }, { code: 'Digit5', label: '%', sub: '5' }, { code: 'Digit6', label: '^', sub: '6' }, { code: 'Digit7', label: '&amp;', sub: '7' }, { code: 'Digit8', label: '*', sub: '8' }, { code: 'Digit9', label: '(', sub: '9' }, { code: 'Digit0', label: ')', sub: '0' }, { code: 'Minus', label: '_', sub: '-' }, { code: 'Equal', label: '+', sub: '=' }, { code: 'Backspace', label: 'delete', className: 'key-wide' }];
  const topSymbolCodes = new Set(['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal']);

  function makeKey(def) {
    const numpadLabels = { Numpad0: '0', Numpad1: '1', Numpad2: '2', Numpad3: '3', Numpad4: '4', Numpad5: '5', Numpad6: '6', Numpad7: '7', Numpad8: '8', Numpad9: '9' };
    const item = typeof def === 'string' ? { code: def, label: numpadLabels[def] || def.replace(/^Key/, '') } : def;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = `key ${item.className || ''} ${item.sub ? 'has-sub' : ''}`.trim();
    button.dataset.code = item.code;
    button.innerHTML = item.sub ? `${item.label}<small>${item.sub}</small>` : (item.label || '&nbsp;');
    return button;
  }

  function makeRow(defs, className = '') {
    const row = document.createElement('div');
    row.className = `key-row ${className}`.trim();
    defs.forEach((def) => row.append(def === 'spacer' ? Object.assign(document.createElement('span'), { className: 'key-spacer' }) : makeKey(def)));
    return row;
  }

  function makeFunctionRow(compact = false) {
    const defs = [{ code: 'Escape', label: 'esc', className: 'key-escape' }];
    if (!compact) defs.push('spacer');
    const compactLabels = ['☼', '☼', '▦', '⌕', '♩', '☾', '◀◀', '▶‖', '▶▶', '◀', '▶', '◉'];
    for (let i = 1; i <= 12; i += 1) defs.push({ code: `F${i}`, label: compact ? compactLabels[i - 1] : `F${i}`, sub: compact ? `F${i}` : undefined });
    defs.push({ code: 'Power', label: 'Lock', className: 'key-symbol' });
    return makeRow(defs, 'function-row');
  }

  function makeNumericPad() {
    const pad = document.createElement('div');
    pad.className = 'numpad';
    [
      [{ code: 'NumLock', label: 'clear' }, { code: 'NumpadDivide', label: '÷' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '−' }],
      ['Numpad7', 'Numpad8', 'Numpad9', { code: 'NumpadAdd', label: '+', className: 'key-tall' }],
      ['Numpad4', 'Numpad5', 'Numpad6'],
      ['Numpad1', 'Numpad2', 'Numpad3', { code: 'NumpadEnter', label: 'enter', className: 'key-tall' }],
      [{ code: 'Numpad0', label: '0', className: 'key-zero' }, { code: 'NumpadDecimal', label: '.' }]
    ].forEach((row) => row.forEach((def) => pad.append(makeKey(def))));
    return pad;
  }

  const compactHotspots = (() => {
    const spots = [];
    const addRow = (y, h, values) => values.forEach(([code, x, width]) => spots.push({ code, x, y, width, height: h }));
    addRow(4, 53, [['Escape', 4, 80], ['F1', 92, 50], ['F2', 147, 50], ['F3', 203, 51], ['F4', 259, 50], ['F5', 315, 50], ['F6', 371, 50], ['F7', 427, 50], ['F8', 483, 50], ['F9', 539, 50], ['F10', 595, 50], ['F11', 651, 50], ['F12', 707, 50], ['Power', 763, 64]]);
    addRow(63, 51, [['Backquote', 4, 52], ['Digit1', 61, 52], ['Digit2', 118, 52], ['Digit3', 175, 52], ['Digit4', 232, 52], ['Digit5', 289, 52], ['Digit6', 346, 52], ['Digit7', 403, 52], ['Digit8', 460, 52], ['Digit9', 517, 52], ['Digit0', 574, 52], ['Minus', 631, 52], ['Equal', 688, 52], ['Backspace', 745, 82]]);
    addRow(120, 48, [['Tab', 4, 80], ['KeyQ', 91, 51], ['KeyW', 147, 51], ['KeyE', 203, 51], ['KeyR', 259, 51], ['KeyT', 315, 51], ['KeyY', 371, 51], ['KeyU', 427, 51], ['KeyI', 483, 51], ['KeyO', 539, 51], ['KeyP', 595, 51], ['BracketLeft', 651, 51], ['BracketRight', 707, 51], ['Backslash', 763, 64]]);
    addRow(176, 49, [['CapsLock', 4, 95], ['KeyA', 104, 51], ['KeyS', 160, 51], ['KeyD', 216, 51], ['KeyF', 272, 51], ['KeyG', 328, 51], ['KeyH', 384, 51], ['KeyJ', 440, 51], ['KeyK', 496, 51], ['KeyL', 552, 51], ['Semicolon', 608, 51], ['Quote', 664, 51], ['Enter', 720, 107]]);
    addRow(233, 48, [['ShiftLeft', 4, 123], ['KeyZ', 136, 51], ['KeyX', 192, 51], ['KeyC', 248, 51], ['KeyV', 304, 51], ['KeyB', 360, 51], ['KeyN', 416, 51], ['KeyM', 472, 51], ['Comma', 528, 51], ['Period', 584, 51], ['Slash', 640, 51], ['ShiftRight', 696, 131]]);
    addRow(287, 50, [['Fn', 4, 49], ['ControlLeft', 59, 50], ['AltLeft', 114, 50], ['MetaLeft', 169, 66], ['Space', 240, 289], ['MetaRight', 536, 66], ['AltRight', 607, 50], ['ArrowLeft', 662, 50], ['ArrowRight', 776, 50]]);
    spots.push({ code: 'ArrowUp', x: 718, y: 287, width: 50, height: 24 }, { code: 'ArrowDown', x: 718, y: 313, width: 50, height: 24 });
    return spots;
  })();

  function compactKeyLabel(code) {
    const labels = {
      Escape: ['esc'], F1: ['F1'], F2: ['F2'], F3: ['F3'], F4: ['F4'], F5: ['F5'], F6: ['F6'], F7: ['F7'], F8: ['F8'], F9: ['F9'], F10: ['F10'], F11: ['F11'], F12: ['F12'], Power: ['Lock'],
      Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '¥ $'], Digit5: ['5', '%'], Digit6: ['6', '… ^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'], Backspace: ['⌫'],
      Tab: ['⇥'], CapsLock: ['⇪', 'Caps Lock'], Enter: ['↵'], ShiftLeft: ['⇧'], ShiftRight: ['⇧'], Fn: ['fn'], ControlLeft: ['⌃', 'control'], AltLeft: ['⌥', 'option'], MetaLeft: ['⌘', 'command'], MetaRight: ['⌘', 'command'], AltRight: ['⌥', 'option'], Space: [''], ArrowLeft: ['◀'], ArrowUp: ['▲'], ArrowDown: ['▼'], ArrowRight: ['▶'],
      BracketLeft: ['{', '['], BracketRight: ['}', ']'], Backslash: ['|', '\\'], Semicolon: [':', ';'], Quote: ['&quot;', "'"], Comma: ['&lt;', ','], Period: ['&gt;', '.'], Slash: ['?', '/']
    };
    if (labels[code]) return labels[code];
    if (code.startsWith('Key')) return [code.slice(3)];
    return [code];
  }

  function makeCompactKeyboard(laptop = false) {
    const frame = document.createElement('div');
    frame.className = 'compact-keyboard';
    compactHotspots.forEach((sourceSpot) => {
      const spot = { ...sourceSpot };
      if (laptop && (spot.code === 'ArrowLeft' || spot.code === 'ArrowRight')) {
        spot.y = 313;
        spot.height = 24;
      }
      const key = document.createElement('button');
      key.type = 'button';
      key.tabIndex = -1;
      key.className = 'compact-render-key';
      if (topSymbolCodes.has(spot.code)) key.classList.add('compact-top-symbol');
      key.dataset.code = spot.code;
      key.style.left = `${spot.x / 831 * 100}%`;
      key.style.top = `${spot.y / 342 * 100}%`;
      key.style.width = `${spot.width / 831 * 100}%`;
      key.style.height = `${spot.height / 342 * 100}%`;
      const [label, sub] = compactKeyLabel(spot.code);
      key.innerHTML = sub ? `${label}<small>${sub}</small>` : (label || '&nbsp;');
      key.setAttribute('aria-label', spot.code);
      frame.append(key);
    });
    return frame;
  }

  const numericHotspots = (() => {
    const scaleX = 560 / 831;
    const scaleY = 232 / 342;
    const arrowCodes = new Set(['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']);
    const spots = compactHotspots.filter((spot) => !arrowCodes.has(spot.code)).map((spot) => ({
      code: spot.code, x: spot.x * scaleX, y: spot.y * scaleY, width: spot.width * scaleX, height: spot.height * scaleY
    }));
    const add = (code, x, y, width, height, label) => spots.push({ code, x, y, width, height, label });
    const setSpot = (code, values) => Object.assign(spots.find((spot) => spot.code === code), values);
    setSpot('Space', { x: 162, width: 228 });
    setSpot('MetaRight', { x: 394, width: 54 });
    setSpot('AltRight', { x: 453, width: 48 });
    add('ControlRight', 506, 195, 52, 33, ['⌃', 'control']);
    const topRight = ['F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19'];
    const topRightX = [570, 610, 650, 698, 736, 774, 812];
    topRight.forEach((code, index) => add(code, topRightX[index], 4, 35, 34, code));
    [['Insert', 'insert'], ['Home', 'home'], ['PageUp', 'page up'], ['Delete', 'delete'], ['End', 'end'], ['PageDown', 'page down']].forEach(([code, label], index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      add(code, 570 + col * 40, 43 + row * 38, 35, 33, label);
    });
    add('ArrowUp', 610, 157, 35, 33, '▲');
    add('ArrowLeft', 570, 195, 35, 33, '◀');
    add('ArrowDown', 610, 195, 35, 33, '▼');
    add('ArrowRight', 650, 195, 35, 33, '▶');
    [['NumLock', 'clear'], ['NumpadEqual', '='], ['NumpadDivide', '/'], ['NumpadMultiply', '*']].forEach(([code, label], col) => add(code, 698 + col * 38, 43, 34, 34, label));
    [['Numpad7', '7'], ['Numpad8', '8'], ['Numpad9', '9'], ['NumpadSubtract', '−']].forEach(([code, label], col) => add(code, 698 + col * 38, 81, 34, 34, label));
    [['Numpad4', '4'], ['Numpad5', '5'], ['Numpad6', '6'], ['NumpadAdd', '+']].forEach(([code, label], col) => add(code, 698 + col * 38, 119, 34, 34, label));
    [['Numpad1', '1'], ['Numpad2', '2'], ['Numpad3', '3']].forEach(([code, label], col) => add(code, 698 + col * 38, 157, 34, 34, label));
    add('NumpadEnter', 812, 157, 34, 72, 'enter');
    add('Numpad0', 698, 195, 72, 34, '0');
    add('NumpadDecimal', 774, 195, 34, 34, '.');
    return spots;
  })();

  function makeNumericKeyboard(pc = false, laptopPc = false, swapFn = false) {
    const frame = document.createElement('div');
    frame.className = `numeric-keyboard${laptopPc ? ' laptop-pc-keyboard' : ''}`;
    const canvasHeight = laptopPc ? 270 : 232;
    const mainLeft = numericHotspots.find((spot) => spot.code === 'Backquote').x;
    const mainBackspace = numericHotspots.find((spot) => spot.code === 'Backspace');
    const mainRight = mainBackspace.x + mainBackspace.width;
    const bottomCodes = new Set(['Fn', 'ControlLeft', 'AltLeft', 'MetaLeft', 'Space', 'MetaRight', 'AltRight', 'ControlRight']);
    const pcNumpadCodes = new Set(['NumLock', 'NumpadEqual', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract', 'NumpadAdd', 'Numpad7', 'Numpad8', 'Numpad9', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter', 'Numpad0', 'NumpadDecimal']);
    const laptopNavCodes = new Set(['Delete', 'End', 'PageDown', 'Insert', 'Home', 'PageUp', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']);
    const laptopMainCodes = new Set(compactHotspots.filter((spot) => spot.y >= 63 && !bottomCodes.has(spot.code) && !['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Power'].includes(spot.code)).map((spot) => spot.code));
    const renderSpots = pc ? numericHotspots.filter((spot) => !bottomCodes.has(spot.code) && !pcNumpadCodes.has(spot.code) && !(laptopPc && (laptopNavCodes.has(spot.code) || laptopMainCodes.has(spot.code)))) : numericHotspots;
    if (laptopPc) {
      compactHotspots.filter((spot) => laptopMainCodes.has(spot.code)).forEach((spot) => renderSpots.push({ ...spot, x: spot.x * (710 / 831), y: spot.y * (270 / 342), width: spot.width * (710 / 831), height: spot.height * (270 / 342) }));
    }
    if (pc) {
      const nx = laptopPc ? 714 : 698;
      const ns = laptopPc ? 35 : 38;
      const nw = laptopPc ? 31 : 34;
      renderSpots.push(
        { code: 'NumLock', x: nx, y: 43, width: nw, height: 34, label: 'Num Lock' },
        { code: 'NumpadDivide', x: nx + ns, y: 43, width: nw, height: 34, label: '/' },
        { code: 'NumpadMultiply', x: nx + ns * 2, y: 43, width: nw, height: 34, label: '*' },
        { code: 'NumpadSubtract', x: nx + ns * 3, y: 43, width: nw, height: 34, label: '-' },
        { code: 'Numpad7', x: nx, y: 81, width: nw, height: 34, label: '7' },
        { code: 'Numpad8', x: nx + ns, y: 81, width: nw, height: 34, label: '8' },
        { code: 'Numpad9', x: nx + ns * 2, y: 81, width: nw, height: 34, label: '9' },
        { code: 'NumpadAdd', x: nx + ns * 3, y: 81, width: nw, height: 72, label: '+' },
        { code: 'Numpad4', x: nx, y: 119, width: nw, height: 34, label: '4' },
        { code: 'Numpad5', x: nx + ns, y: 119, width: nw, height: 34, label: '5' },
        { code: 'Numpad6', x: nx + ns * 2, y: 119, width: nw, height: 34, label: '6' },
        { code: 'Numpad1', x: nx, y: 157, width: nw, height: 34, label: '1' },
        { code: 'Numpad2', x: nx + ns, y: 157, width: nw, height: 34, label: '2' },
        { code: 'Numpad3', x: nx + ns * 2, y: 157, width: nw, height: 34, label: '3' },
        { code: 'NumpadEnter', x: nx + ns * 3, y: 157, width: nw, height: 72, label: 'Enter' },
        { code: 'Numpad0', x: nx, y: 195, width: nw * 2 + 4, height: 34, label: '0' },
        { code: 'NumpadDecimal', x: nx + ns * 2, y: 195, width: nw, height: 34, label: '.' }
      );
      if (laptopPc) {
        // Align the laptop keypad with the five typing rows and bottom modifiers.
        const keypadRows = new Map([
          [43, { y: 63 * 270 / 342, height: 51 * 270 / 342 }],
          [81, { y: 120 * 270 / 342, height: 48 * 270 / 342 }],
          [119, { y: 176 * 270 / 342, height: 49 * 270 / 342 }],
          [157, { y: 233 * 270 / 342, height: 48 * 270 / 342 }],
          [195, { y: 227, height: 33 }]
        ]);
        const keypadLabels = {
          Numpad7: ['7', 'Home'], Numpad8: ['8', '↑'], Numpad9: ['9', 'PgUp'],
          Numpad4: ['4', '←'], Numpad6: ['6', '→'], Numpad1: ['1', 'End'],
          Numpad2: ['2', '↓'], Numpad3: ['3', 'PgDn'], Numpad0: ['0', 'Ins'],
          NumpadDecimal: ['.', 'Del']
        };
        renderSpots.filter((spot) => pcNumpadCodes.has(spot.code)).forEach((spot) => {
          Object.assign(spot, keypadRows.get(spot.y));
          if (spot.code === 'NumpadAdd') spot.height = (176 + 49 - 120) * 270 / 342;
          if (spot.code === 'NumpadEnter') spot.height = 260 - spot.y;
          if (keypadLabels[spot.code]) spot.label = keypadLabels[spot.code];
        });
        [
          ['NumpadEqual', '='], ['NumpadParenLeft', '('],
          ['NumpadParenRight', ')'], ['Backspace', 'Backspace']
        ].forEach(([code, label], index) => renderSpots.push({
          code, label, x: nx + ns * index, y: 4, width: nw, height: 36
        }));
        const mKey = renderSpots.find((spot) => spot.code === 'KeyM');
        const spaceRight = mKey.x + mKey.width;
        const bottomGap = 5;
        const navigationLeft = 591;
        const rightKeyWidth = (navigationLeft - spaceRight - bottomGap * 4) / 3;
        const rightKeyLeft = (index) => spaceRight + bottomGap + index * (rightKeyWidth + bottomGap);
        renderSpots.push(
          { code: swapFn ? 'ControlLeft' : 'Fn', x: 4, y: 195, width: 35, height: 33, label: swapFn ? 'Ctrl' : 'fn' },
          { code: swapFn ? 'Fn' : 'ControlLeft', x: 44, y: 195, width: 35, height: 33, label: swapFn ? 'fn' : 'Ctrl' },
          { code: 'MetaLeft', x: 84, y: 195, width: 35, height: 33, label: 'Win' },
          { code: 'AltLeft', x: 124, y: 195, width: 35, height: 33, label: 'Alt' },
          { code: 'Space', x: 164, y: 195, width: spaceRight - 164, height: 33, label: '' },
          { code: 'AltRight', x: rightKeyLeft(0), y: 195, width: rightKeyWidth, height: 33, label: 'Alt' },
          { code: 'MetaRight', x: rightKeyLeft(1), y: 195, width: rightKeyWidth, height: 33, label: 'PrtSc' },
          { code: 'ControlRight', x: rightKeyLeft(2), y: 195, width: rightKeyWidth, height: 33, label: 'Ctrl' }
        );
        renderSpots.push(
          { code: 'PageUp', x: 591, y: 195, width: 35, height: 15, label: 'PgUp' },
          { code: 'ArrowUp', x: 631, y: 195, width: 35, height: 15, label: '▲' },
          { code: 'PageDown', x: 671, y: 195, width: 35, height: 15, label: 'PgDn' },
          { code: 'ArrowLeft', x: 591, y: 213, width: 35, height: 15, label: '◀' },
          { code: 'ArrowDown', x: 631, y: 213, width: 35, height: 15, label: '▼' },
          { code: 'ArrowRight', x: 671, y: 213, width: 35, height: 15, label: '▶' }
        );
      } else {
        renderSpots.push(
          { code: 'ControlLeft', x: 4, y: 195, width: 35, height: 33, label: 'Ctrl' },
          { code: 'MetaLeft', x: 44, y: 195, width: 35, height: 33, label: 'Win' },
          { code: 'AltLeft', x: 84, y: 195, width: 35, height: 33, label: 'Alt' },
          { code: 'Space', x: 124, y: 195, width: 280, height: 33, label: '' },
          { code: 'AltRight', x: 409, y: 195, width: 35, height: 33, label: 'Alt' },
          { code: 'MetaRight', x: 449, y: 195, width: 35, height: 33, label: 'Win' },
          { code: 'Fn', x: 489, y: 195, width: 35, height: 33, label: 'fn' },
          { code: 'ControlRight', x: 529, y: 195, width: 29, height: 33, label: 'Ctrl' }
        );
      }
    }
    renderSpots.forEach((spot) => {
      if (pc && spot.code === 'Power') return;
      if (pc && !laptopPc && ['F16', 'F17', 'F18', 'F19'].includes(spot.code)) return;
      if (laptopPc && ['F17', 'F18', 'F19'].includes(spot.code)) return;
      const key = document.createElement('button');
      key.type = 'button';
      key.tabIndex = -1;
      key.className = 'numeric-render-key';
      if (topSymbolCodes.has(spot.code)) key.classList.add('compact-top-symbol');
      let code = spot.code;
      let x = spot.x;
      let width = spot.width;
      let height = spot.height;
      if (pc) {
        const pcFunctionX = { Escape: 4, F1: 65, F2: 105, F3: 145, F4: 185, F5: 231, F6: 271, F7: 311, F8: 351, F9: 397, F10: 437, F11: 477, F12: 517 };
        if (pcFunctionX[code] !== undefined) { x = pcFunctionX[code]; width = code === 'Escape' ? 44 : 35; }
        if (!laptopPc) {
          if (pcFunctionX[code] !== undefined) {
            x = mainLeft + (pcFunctionX[code] - 4) * (mainRight - 35 - mainLeft) / (517 - 4);
          }
          if (code === 'ControlLeft') x = mainLeft;
          if (code === 'ControlRight') width = mainRight - x;
        }
        if (laptopPc) {
          const laptopFunction = {
            Escape: [3, 44], F1: [55, 35], F2: [94, 35], F3: [133, 35], F4: [172, 35],
            F5: [219, 35], F6: [258, 35], F7: [297, 35], F8: [336, 35],
            F9: [383, 35], F10: [422, 35], F11: [461, 35], F12: [500, 35],
            F13: [540, 38.5], F14: [582.5, 38.5], F15: [625, 38.5], F16: [667.5, 38.5]
          };
          if (laptopFunction[code]) {
            [x, width] = laptopFunction[code];
            height = 36;
          }
        }
      }
      key.dataset.code = code;
      key.style.left = `${x / 850 * 100}%`;
      // Keep the laptop bottom row below Shift; both navigation rows fit in its height.
      const laptopBottomKey = laptopPc && (bottomCodes.has(code) || laptopNavCodes.has(code));
      const laptopTopKey = laptopPc && (code === 'Escape' || /^F(?:[1-9]|1[0-6])$/.test(code));
      const keyY = laptopTopKey ? 4 : laptopBottomKey ? spot.y + 32 : spot.y;
      key.style.top = `${keyY / canvasHeight * 100}%`;
      key.style.width = `${width / 850 * 100}%`;
      key.style.height = `${height / canvasHeight * 100}%`;
      let label = Array.isArray(spot.label) ? spot.label[0] : spot.label || compactKeyLabel(spot.code)[0];
      let sub = Array.isArray(spot.label) ? spot.label[1] : spot.label ? '' : compactKeyLabel(spot.code)[1];
      if (pc) {
        const pcNavTop = laptopPc ? { F13: 'Home', F14: 'End', F15: 'Insert', F16: 'Delete' } : { F13: 'Print Scr', F14: 'Scroll Lock', F15: 'Pause' };
        if (pcNavTop[code]) label = pcNavTop[code];
        const pcLabels = { Fn: ['fn'], Tab: ['Tab'], CapsLock: ['Caps Lock'], Enter: ['Enter'], Backspace: ['Backspace'], ControlLeft: ['Ctrl'], AltLeft: ['Alt'], MetaLeft: ['Win'], MetaRight: ['Win'], AltRight: ['Alt'], ControlRight: ['Ctrl'] };
        if (pcLabels[code]) [label, sub] = pcLabels[code];
        if (laptopPc && code === 'MetaRight') label = 'PrtSc';
        if (code === 'NumpadEnter') label = 'Enter';
      }
      key.dataset.code = code;
      key.innerHTML = sub ? `${label}<small>${sub}</small>` : (label || '&nbsp;');
      if (laptopPc && code === 'Backspace' && spot.y === 4) {
        key.classList.add('laptop-keypad-backspace');
        key.innerHTML = 'Back<br>space';
      }
      key.setAttribute('aria-label', spot.code);
      frame.append(key);
    });
    return frame;
  }

  function renderKeyboardLayout(layout = selectedLayout) {
    selectedLayout = layout;
    modelSelect.value = layout;
    const compact = layout.startsWith('compact') || layout.startsWith('macbook-');
    const laptop = layout.startsWith('macbook-');
    const laptopPc = layout === 'laptop-pc';
    const pc = layout === 'pc-104' || laptopPc;
    focusArea.classList.toggle('has-numpad', !compact);
    keyboardLayout.innerHTML = '';
    keyboardLayout.dataset.layout = laptop ? layout : laptopPc ? 'pc-104' : pc ? 'pc-104' : compact ? 'compact' : 'numeric';
    fnSwapOption.hidden = !laptopPc;
    const keyboard = document.createElement('div');
    keyboard.className = 'desktop-keyboard';
    if (compact) {
      keyboard.classList.add('compact-keyboard-wrapper');
      keyboard.append(makeCompactKeyboard(laptop));
      keyboardLayout.append(keyboard);
      visualKeys = [...keyboardLayout.querySelectorAll('.key[data-code], .compact-render-key[data-code]')];
      visualKeys.forEach((key) => key.setAttribute('aria-label', key.textContent.trim() || key.dataset.code));
      fitNativeKeyboard();
      return;
    }
    keyboard.classList.add('numeric-keyboard-wrapper');
    keyboard.append(makeNumericKeyboard(pc, laptopPc, swapFnCtrl.checked));
    keyboardLayout.append(keyboard);
    visualKeys = [...keyboardLayout.querySelectorAll('.numeric-render-key[data-code]')];
    visualKeys.forEach((key) => key.setAttribute('aria-label', key.textContent.trim() || key.dataset.code));
    fitNativeKeyboard();
  }

  function fitNativeKeyboard() {
    if (document.documentElement.dataset.nativeApp !== 'true') return;
    const frame = keyboardLayout.querySelector('.compact-keyboard, .numeric-keyboard');
    if (!frame) return;
    const compact = frame.classList.contains('compact-keyboard');
    const baseWidth = compact ? 831 : 850;
    const baseHeight = compact ? 342 : frame.classList.contains('laptop-pc-keyboard') ? 270 : 232;
    const maxWidth = compact ? 1100 : 1480;
    const scale = Math.max(0, Math.min(
      maxWidth / baseWidth,
      (keyboardLayout.clientWidth - 12) / baseWidth,
      (keyboardLayout.clientHeight - 12) / baseHeight
    ));
    frame.style.width = `${baseWidth * scale}px`;
    frame.style.height = `${baseHeight * scale}px`;
    frame.style.setProperty('--native-key-scale', String(baseWidth * scale / 1100));
    keyboardLayout.style.setProperty('--native-keyboard-width', `${baseWidth * scale}px`);
  }

  function applyTheme() {
    const resolvedTheme = themeMode === 'system' ? (systemTheme.matches ? 'dark' : 'light') : themeMode;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    themeToggle.textContent = themeMode === 'system' ? '◐' : resolvedTheme === 'dark' ? '☀︎' : '☾';
    const label = themeMode === 'system' ? t('themeSystem') : resolvedTheme === 'dark' ? t('themeLight') : t('themeDark');
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
  }

  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = t(element.dataset.i18n);
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(',').forEach((entry) => {
        const [attribute, key] = entry.split(':');
        element.setAttribute(attribute, t(key));
      });
    });
    const modelLabels = { 'compact-usb': 'modelCompactUsb', 'numeric-classic': 'modelNumericClassic', 'pc-104': 'modelPc104', 'laptop-pc': 'modelLaptopPc', 'macbook-pro': 'modelMacbookPro', 'macbook-air': 'modelMacbookAir', 'macbook-neo': 'modelMacbookNeo' };
    [...modelSelect.options].forEach((option) => { option.textContent = t(modelLabels[option.value]); });
    languageToggle.textContent = t('switchText');
    languageToggle.setAttribute('aria-label', t('switchLabel'));
    applyTheme();
    focusStatus.querySelector('span:last-child').textContent = focusStatus.dataset.active === 'true' ? (language === 'zh' ? '正在监听' : 'Listening') : t('waiting');
    modifierCards.forEach((card) => {
      const pill = card.querySelector('.state-pill');
      if (card.dataset.modifier === 'caps') pill.textContent = capsLockOn ? t('enabled') : t('notEnabled');
      else pill.textContent = card.classList.contains('is-down') ? t('pressed') : t('notPressed');
    });
    visualKeys.forEach((key) => key.setAttribute('aria-label', key.textContent.trim() || (language === 'zh' ? '空格' : 'Space')));
    renderEventLog();
    if (eventType.textContent !== t('waiting')) eventType.textContent = eventType.dataset.eventType === 'keyup' ? t('keyup') : eventType.dataset.eventType === 'repeat' ? t('repeat') : t('keydown');
  }

  function setFocus(active) {
    focusStatus.dataset.active = String(active);
    focusStatus.querySelector('span:last-child').textContent = active ? (language === 'zh' ? '正在监听' : 'Listening') : t('waiting');
    focusArea.classList.toggle('is-active', active);
  }

  function setModifierState(code, isDown) {
    const modifierAliases = { MetaLeft: 'meta', MetaRight: 'meta', AltLeft: 'alt', AltRight: 'alt', ControlLeft: 'ctrl', ControlRight: 'ctrl', ShiftLeft: 'shift', ShiftRight: 'shift' };
    const card = modifierCards.find((item) => item.dataset.code === code || item.dataset.modifier === modifierAliases[code]);
    if (!card) return;
    const isCaps = card.dataset.modifier === 'caps';
    const isOn = isCaps && capsLockOn;
    card.classList.toggle('is-down', isDown);
    card.classList.toggle('is-on', isOn);
    const pill = card.querySelector('.state-pill');
    pill.textContent = isCaps ? (capsLockOn ? t('enabled') : t('notEnabled')) : (isDown ? t('pressed') : t('notPressed'));
  }

  function setVisualKey(code, isDown) {
    const aliases = code === 'Power' || code === 'KeyboardLock' || code === 'Lock' ? ['Power', 'KeyboardLock', 'Lock'] : [code];
    visualKeys.filter((key) => aliases.includes(key.dataset.code)).forEach((key) => {
      key.classList.toggle('is-down', isDown);
      if (key.dataset.code === 'CapsLock') key.classList.toggle('is-on', capsLockOn);
    });
  }

  function renderEventLog() {
    eventLog.innerHTML = '';
    if (!eventHistory.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-log';
      empty.textContent = t('emptyLog');
      eventLog.append(empty);
      return;
    }
    eventHistory.forEach((entry) => {
      const item = document.createElement('li');
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      const modifiers = [entry.metaKey && '⌘', entry.altKey && '⌥', entry.ctrlKey && '⌃', entry.shiftKey && '⇧'].filter(Boolean).join(' ');
      strong.textContent = modifiers ? `${modifiers} ${localizeKey(entry)}` : localizeKey(entry);
      span.textContent = `${entry.type === 'keydown' ? t('keydown') : t('keyup')} · ${entry.code}`;
      item.append(strong, span);
      eventLog.append(item);
    });
  }

  function addEvent(event, type) {
    eventHistory.unshift({ code: event.code, key: event.key, metaKey: event.metaKey, altKey: event.altKey, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, type });
    while (eventHistory.length > 8) eventHistory.pop();
    renderEventLog();
  }

  function updateSummary(event, type) {
    const label = localizeKey(event);
    lastKey.textContent = label;
    eventKey.textContent = label;
    eventCode.textContent = event.code;
    const eventKeyType = type === 'keydown' ? (event.repeat ? 'repeat' : 'keydown') : 'keyup';
    eventType.dataset.eventType = eventKeyType;
    eventType.textContent = eventKeyType === 'repeat' ? t('repeat') : eventKeyType === 'keydown' ? t('keydown') : t('keyup');
  }

  function handleKeyDown(event) {
    setFocus(true);
    if (event.code === 'CapsLock' && !event.repeat) capsLockOn = !capsLockOn;
    if (!pressedKeys.has(event.code)) pressedKeys.set(event.code, event);
    setModifierState(event.code, true);
    setVisualKey(visualCode(event), true);
    updateSummary(event, 'keydown');
    if (!event.repeat) addEvent(event, 'keydown');
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.code);
    setModifierState(event.code, false);
    setVisualKey(visualCode(event), false);
    updateSummary(event, 'keyup');
    addEvent(event, 'keyup');
  }

  function resetPressedKeys() {
    pressedKeys.clear();
    modifierCards.forEach((card) => {
      card.classList.remove('is-down');
      const pill = card.querySelector('.state-pill');
      if (card.dataset.modifier !== 'caps') pill.textContent = t('notPressed');
    });
    visualKeys.forEach((key) => {
      key.classList.remove('is-down');
      if (key.dataset.code === 'CapsLock') key.classList.toggle('is-on', capsLockOn);
    });
  }

  function routeTestKey(event) {
    // Controls inside the test area, including the model picker, keep native behavior.
    if (document.activeElement !== focusArea) return;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === 'keydown') handleKeyDown(event);
    else handleKeyUp(event);
  }

  window.addEventListener('keydown', routeTestKey, { capture: true });
  window.addEventListener('keyup', routeTestKey, { capture: true });
  document.addEventListener('pointerdown', (event) => {
    if (document.activeElement === focusArea && !focusArea.contains(event.target)) focusArea.blur();
  }, { capture: true });
  focusArea.addEventListener('focus', () => setFocus(true));
  focusArea.addEventListener('blur', () => { resetPressedKeys(); setFocus(false); });
  focusArea.addEventListener('click', (event) => {
    if (event.target.closest('.model-picker')) return;
    focusArea.focus();
  });
  modelSelect.addEventListener('click', (event) => event.stopPropagation());
  modelSelect.addEventListener('mousedown', (event) => event.stopPropagation());
  clearButton.addEventListener('click', () => {
    eventHistory.length = 0;
    renderEventLog();
    lastKey.textContent = '—';
    eventKey.textContent = '—';
    eventCode.textContent = '—';
    eventType.textContent = t('waiting');
  });

  languageToggle.addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    applyLanguage();
  });

  modelSelect.addEventListener('change', () => renderKeyboardLayout(modelSelect.value));
  swapFnCtrl.addEventListener('change', () => { if (selectedLayout === 'laptop-pc') renderKeyboardLayout(selectedLayout); });
  themeToggle.addEventListener('click', () => {
    themeMode = themeMode === 'system' ? 'dark' : themeMode === 'dark' ? 'light' : 'system';
    localStorage.setItem('keyboard-theme', themeMode);
    applyTheme();
  });
  systemTheme.addEventListener('change', () => { if (themeMode === 'system') applyTheme(); });

  window.addEventListener('blur', () => { resetPressedKeys(); setFocus(false); });
  window.addEventListener('focus', () => setFocus(document.activeElement === focusArea));
  if (document.documentElement.dataset.nativeApp === 'true') {
    const keyboardResizeObserver = new ResizeObserver(fitNativeKeyboard);
    keyboardResizeObserver.observe(keyboardLayout);
    window.addEventListener('resize', fitNativeKeyboard);
  }
  renderKeyboardLayout();
  applyTheme();
  applyLanguage();
  focusArea.focus();
})();
