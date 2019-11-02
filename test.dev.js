const postcss = require('postcss');
const postcssTransition = require('./index');
const watch = require('node-watch');
const fs = require('fs');

watch(['./index.js', './test.css'], run);

function run() {
  fs.readFile('test.css', (err, css) => {
    postcss([
      postcssTransition({
        duration: '$$$',
        delay: '@@@',
        timingFunction: '###',
      }),
    ])
      .process(css, { from: 'test.css', to: 'out/test.css' })
      .then((result) => {
        console.log(result.css);
        // fs.writeFile('out/test.css', result.css, () => true);
      });
  });
}

run();
