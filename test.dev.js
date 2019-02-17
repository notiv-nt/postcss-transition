const postcss = require('postcss');
const postcssTransition = require('./index');
const watch = require('node-watch');
const fs = require('fs');

watch(['./index.js', './test.css'], process);

function process() {
  fs.readFile('test.css', (err, css) => {
    postcss([
      postcssTransition({
        duration: '200ms',
      }),
    ])
      .process(css, { from: 'test.css', to: 'out/test.css' })
      .then((result) => {
        fs.writeFile('out/test.css', result.css, () => true);
      });
  });
}

process();
