let StringCursor = require('./StringCursor');

let str = `
  first line
  second line
  blockTest {
    Hello, world!
  }
  fakeFunc(a, b, c,
    d, e, f, g, h, i)
  last line
`;

console.log('Input string: `' + str + '`');

console.log();
console.log('---');


let c = new StringCursor(str);

console.log();
console.log('1) nextLine:');
c.nextLine();
console.log(c.peekLine);

console.log();
console.log('2) lastLine:');
c.lastLine();
console.log(c.peekLine);

console.log();
console.log('3) nextCharInLine, advance, regular selection:');
c.prevLine();
c.prevLine();
c.nextCharInLine('(');
c.advance();
c.startSelection();
c.nextLine();
c.beforeNextCharInLine(')');
console.log(c.endSelection());

console.log();
console.log('4) line selection:');
c.prevLine();
c.prevLine();
c.prevLine();
c.prevLine();
c.startSelection('line');
c.nextLine();
c.nextLine();
console.log(c.endSelection());

console.log();
console.log('5) prevLine, reverse line selection:');
c.startSelection('line');
c.prevLine();
c.prevLine();
console.log(c.endSelection());

console.log();
console.log('6) firstLine:');
c.firstLine();
console.log(c.peekLine);
