module.exports = class StringCursor {
  constructor(str, mode) {
    this.str = str;
    this.mode = mode || 'lax';
    this.cursor = 0;
  }

  get peekChar() {
    return this.str[this.cursor];
  }

  get peekPrevChar() {
    return this.str[this.cursor - 1];
  }

  get peekNextChar() {
    return this.str[this.cursor + 1];
  }

  firstLine() {
    this.cursor = 0;

    while (
      this.peekNextChar &&
      ['\t', ' '].includes(this.peekNextChar)
    ) {
      ++this.cursor;
    }

    this.updateSelectionEnd();
    return true;
  }

  lastLine() {
    this.cursor = this.str.length;
    this.lineStart();

    this.updateSelectionEnd();
    return true;
  }

  backtrack() {
    if (!this.peekPrevChar) {
      if (this.mode === 'strict') {
        throw new Error(`backtrack: No more data`);
      }

      return false;
    }

    --this.cursor;
    return true;
  }

  advance() {
    if (!this.peekChar) {
      if (this.mode === 'strict') {
        throw new Error(`advance: No more data`);
      }

      return false;
    }

    ++this.cursor;
    return true;
  }

  afterPrevCharInLine(c) {
    let reset = this.cursor;

    while (
      this.peekPrevChar &&
      this.peekPrevChar !== '\n'
    ) {
      --this.cursor;

      if (this.peekChar === c) {
        ++this.cursor;

        this.updateSelectionEnd();
        return true;
      }
    }

    this.cursor = reset;

    if (this.mode === 'strict') {
      throw new Error(`prevCharInLine: Not found`);
    }

    return false;
  }

  prevCharInLine(c) {
    if (this.afterPrevCharInLine(c)) {
      --this.cursor;

      this.updateSelectionEnd();
      return true;
    }

    return false;
  }

  beforeNextCharInLine(c) {
    let reset = this.cursor;

    while (
      this.peekNextChar &&
      this.peekNextChar !== '\n'
    ) {
      ++this.cursor;

      if (this.peekChar === c) {
        --this.cursor;

        this.updateSelectionEnd();
        return true;
      }
    }

    this.cursor = reset;

    if (this.mode === 'strict') {
      throw new Error(`nextCharInLine: Not found`);
    }

    return false;
  }

  nextCharInLine(c) {
    if (this.beforeNextCharInLine(c)) {
      ++this.cursor;

      this.updateSelectionEnd();
      return true;
    }

    return false;
  }

  lineStart() {
    while (this.peekPrevChar) {
      --this.cursor;

      if (this.peekChar === '\n') {
        break;
      }
    }

    while (
      this.peekNextChar &&
      ['\n', '\t', ' '].includes(this.peekChar)
    ) {
      ++this.cursor;
    }

    this.updateSelectionEnd();
    return true;
  }

  lineStartHard() {
    while (this.peekPrevChar) {
      --this.cursor;

      if (this.peekChar === '\n') {
        break;
      }
    }

    if (this.peekNextChar) {
      ++this.cursor;
    }

    this.updateSelectionEnd();
    return true;
  }

  get peekLine() {
    let reset = this.cursor;

    this.lineStart();
    let i = this.cursor;

    this.lineEnd();
    let j = this.cursor + 1;

    this.cursor = reset;

    return this.str.substring(i, j);
  }

  lineEnd() {
    if (this.peekChar === '\n') {
      if (this.peekPrevChar) {
        --this.cursor;
      }

      this.updateSelectionEnd();
      return true;
    }

    while (
      this.peekNextChar &&
      this.peekNextChar !== '\n'
    ) {
      ++this.cursor;
    }

    this.updateSelectionEnd();
    return true;
  }

  prevLine() {
    let lineFound = false;
    let reset = this.cursor;

    while (this.peekPrevChar) {
      --this.cursor;

      if (this.peekChar === '\n') {
        lineFound = true;
        break;
      }
    }

    if (!lineFound) {
      this.cursor = reset;

      if (this.mode === 'strict') {
        throw new Error(`prevLine: No more lines`);
      }

      return false;
    }

    this.lineStart();

    this.updateSelectionEnd();
    return true;
  }

  nextLine() {
    let lineFound = false;
    let reset = this.cursor;

    while (this.peekNextChar) {
      ++this.cursor;

      if (this.peekChar === '\n') {
        ++this.cursor;
        lineFound = true;

        break;
      }
    }

    if (!lineFound) {
      this.cursor = reset;

      if (this.mode === 'strict') {
        throw new Error(`nextLine: No more lines`);
      }

      return false;
    }

    this.updateSelectionEnd();
    return true;
  }

  get peekSelStart() {
    return this.str[this.selStart];
  }

  get peekSelEnd() {
    return this.str[this.selEnd];
  }

  startSelection(mode) {
    this.selMode = mode || 'regular';

    switch (this.selMode) {
      case 'regular':
        this.selStart = this.selEnd = this.cursor;
        break;

      case 'line': {
        let c = new StringCursor(this.str);

        c.cursor = this.cursor;
        c.lineStartHard();

        this.selStart = this.selEnd = c.cursor;
        break;
      }
    }

    return true;
  }

  updateSelectionEnd() {
    switch (this.selMode) {
      case 'regular':
        if (!this.peekChar) {
          this.selEnd = this.str.length - 1;
          break;
        }

        this.selEnd = this.cursor;
        break;

      case 'line': {
        let c = new StringCursor(this.str);
        c.cursor = this.cursor;

        c.lineEnd();
        this.selEnd = c.cursor;
        break;
      }
    }

    return true;
  }

  get peekSelection() {
    if (!this.selMode) {
      return '';
    }

    let { selStart, selEnd } = this;

    if (selStart > selEnd) {
      let oldSelStart = selStart;
      selStart = selEnd;
      selEnd = oldSelStart;

      if (this.selMode === 'line') {
        let c = new StringCursor(this.str);

        c.cursor = selStart;
        c.lineStartHard();
        selStart = c.cursor;

        c.cursor = selEnd;
        c.lineEnd();
        selEnd = c.cursor;
      }
    }

    return this.str.substring(
      selStart, selEnd + 1
    );
  }

  endSelection() {
    let sel = this.peekSelection;
    this.selMode = this.selStart = this.selEnd = null;

    return sel;
  }
};
