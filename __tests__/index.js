const postcss = require('postcss');
const plugin = require('../index');

function run(input, output, opts) {
  return postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      // console.log(result.css, output);
      expect(result.css).toEqual(output);
      expect(result.warnings()).toHaveLength(0);
    });
}

function normalize(str) {
  return str.replace(/\n/gm, ' ').replace(/\s+/gm, ' ');
}

test('do nothing without defaults', () => {
  return Promise.all([
    run(`a { transition: color 1s 2ms ease; }`, `a { transition: color 1s 2ms ease; }`),
    run(`a { transition: color 1s 2ms; }`, `a { transition: color 1s 2ms; }`),
    run(`a { transition: ; }`, `a { transition: ; }`),
  ]);
});

test('process global values', () => {
  const options = {
    duration: '$$$',
    delay: '@@@',
    timingFunction: '###',
  };

  return Promise.all([
    //
    run(`a { transition: auto; }`, `a { transition: auto; }`, options),
    run(`a { transition: inherit; }`, `a { transition: inherit; }`, options),
    run(`a { transition: initial; }`, `a { transition: initial; }`, options),
    run(`a { transition: none; }`, `a { transition: none; }`, options),
    run(`a { transition: unset; }`, `a { transition: unset; }`, options),
  ]);
});

// Is it necessary at all? and how?
// test.skip('set property', () => {
//   const params = {
//     property: '$p$',
//   };

//   return Promise.all([run(`a { transition: 1s 2ms ease; }`, `a { transition: $p$ 1s 2ms ease; }`, params)]);
// });

test('set duration', () => {
  const params = {
    duration: '$$$',
  };

  return Promise.all([
    run(
      `a { transition: color, color 1s, color 1s 2s, color 1s 2s ease; }`,
      `a { transition: color $$$, color 1s, color 1s 2s, color 1s 2s ease; }`,
      params
    ),
  ]);
});

test('set delay', () => {
  const params = {
    delay: '$$$',
  };

  return Promise.all([
    run(
      `a { transition: color, color 1s, color 1s 2s, color 1s 2s ease; }`,
      `a { transition: color $$$, color 1s $$$, color 1s 2s, color 1s 2s ease; }`,
      params
    ),
  ]);
});

test('set timing function', () => {
  const params = {
    timingFunction: '$$$',
  };

  return Promise.all([
    run(
      `a { transition: color, color 1s, color 1s 2s, color 1s 2s ease; }`,
      `a { transition: color $$$, color 1s $$$, color 1s 2s $$$, color 1s 2s ease; }`,
      params
    ),
  ]);
});

test('set property', () => {
  const params = {
    property: '$$$',
  };

  return Promise.all([
    run(`a { transition: , 1s, 1s 2s, 1s 2s ease; }`, `a { transition: $$$, $$$ 1s, $$$ 1s 2s, $$$ 1s 2s ease; }`, params),
  ]);
});

test('spec 1', () => {
  const params = {
    duration: '$$$',
    delay: '@@@',
    timingFunction: '###',
  };

  return Promise.all([
    run(
      `a { transition: color ease, color step-start, color cubic-bezier(0.1, 0.7, 1.0, 0.1); }`,
      `a { transition: color $$$ @@@ ease, color $$$ @@@ step-start, color $$$ @@@ cubic-bezier(0.1, 0.7, 1.0, 0.1); }`,
      params
    ),
  ]);
});

test('skip if no property found', () => {
  const options = {
    duration: '$$$',
    delay: '@@@',
    timingFunction: '###',
  };

  return run(`a { transition: 1s; }`, `a { transition: 1s; }`, options);
});

test('stress test', () => {
  return Promise.all([
    run(
      normalize(`a {
        transition:
          color calc(rgba(#000, .3) * 3) .3ms 20s 0 cubic-bezier(0, 0, 0, 0) ease-in-out repeat(1fr, minmax(320px, 1fr)),
          font-size 2s .3s,
          as 20,
          as 10s,
          as 10s 20ms;
      }`),
      normalize(`a {
        transition:
          color .3ms 20s calc(rgba(#000, .3) * 3),
          font-size 2s .3s,
          as $$$ 20,
          as 10s,
          as 10s 20ms;
      }`),
      {
        duration: '$$$',
      }
    ),

    run(
      normalize(`a {
        transition:
          color calc(rgba(#000, .3) * 3) .3ms 20s 0 cubic-bezier(0, 0, 0, 0) ease-in-out repeat(1fr, minmax(320px, 1fr)),
          font-size 2s .3s,
          as 20,
          as 10s,
          as 10s 20ms;
      }`),
      normalize(`a {
        transition:
          color .3ms 20s calc(rgba(#000, .3) * 3),
          font-size 2s .3s ###,
          as $$$ @@@ 20,
          as 10s @@@ ###,
          as 10s 20ms ###;
      }`),
      {
        duration: '$$$',
        delay: '@@@',
        timingFunction: '###',
      }
    ),
  ]);
});
