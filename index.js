const postcssValueParser = require('postcss-value-parser');
const TIMING_FUNCTIONS = [
  'cubic-bezier',
  'steps',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'step-start',
  'step-end',
];
const GLOBAL_VALUES = ['auto', 'inherit', 'initial', 'none', 'unset'];
const PLUGIN_NAME = 'postcss-transition';

module.exports = (defaults) => {
  // nothing to process, if no defaults set
  if (!defaults) {
    return {
      postcssPlugin: PLUGIN_NAME,
      Once() {},
    };
  }

  function isTimeLike(val) {
    let floatLike = !isNaN(parseFloat(val));
    let hasUnit = val.endsWith('s');

    return floatLike && hasUnit;
  }

  function isTimingFunctionLike(val) {
    if (TIMING_FUNCTIONS.some((v) => val.startsWith(v))) {
      return true;
    }

    return false;
  }

  /**
   * full value > values[]
   * from: color cubic-bezier(0, 0, 0, 0), font-size 2s .3s, 20
   * to:   [ 'color cubic-bezier(0, 0, 0, 0)', 'font-size 2s .3s', '20' ]
   */
  function splitValues(str) {
    const valueNodes = postcssValueParser(str).nodes;
    const divs = valueNodes.filter((n) => n.type === 'div').map((d) => d.sourceIndex);

    let prev = 0;
    let out = [...divs, str.length].map((d) => {
      let _prev = prev;

      prev = d + 1;

      return str.substring(_prev, d).trim();
    });

    return out;
  }

  /**
   * split one value into units
   * from: color cubic-bezier(0, 1, 0, 1)
   * to:   [ 'color', 'cubic-bezier(0, 1, 0, 1)' ]
   */
  function splitValue(value) {
    let out = [];
    let functionStart = null;
    let functionEnd = null;

    postcssValueParser(value + ' ').nodes.forEach((v) => {
      if (v.type === 'function' && functionStart === null) {
        functionStart = v.sourceIndex;
        return;
      }

      // On next element
      else if (functionStart !== null) {
        functionEnd = v.sourceIndex;
        out.push(value.substring(functionStart, functionEnd));
        functionStart = null;
        functionEnd = null;
      }

      // Just a word, set as is
      else if (v.type === 'word' || v.type === 'space') {
        out.push(v.value);
      }
    });

    return out.filter((v) => v.trim());
  }

  function setDefaults(decl, entry) {
    let params = splitValue(entry);
    let found = {};

    /**
     * order matters
     * property
     * (2) duration | delay
     * timing function
     */
    params.forEach((param) => {
      if (!found.duration && isTimeLike(param)) {
        found.duration = param;
      } else if (!found.delay && isTimeLike(param)) {
        found.delay = param;
      } else if (!found.property && param && !isTimingFunctionLike(param)) {
        found.property = param;
      } else if (!found.timingFunction) {
        found.timingFunction = param;
      }
    });

    let processed = Object.assign({}, defaults, found);

    if (!processed.property) {
      return entry;
    }

    let outValue = '';

    [/* 1 */ processed.property, /* 2 */ processed.duration, /* 3 */ processed.delay, /* 4 */ processed.timingFunction].forEach(
      (v) => {
        if (v !== null && v !== undefined) {
          outValue += v + ' ';
        }
      }
    );

    return outValue.trim();
  }

  function transition(decl) {
    /**
     * values[] > values[] with defaults
     */

    let values = splitValues(decl.value).reduce((_, e) => {
      if (GLOBAL_VALUES.includes(e.toLowerCase())) {
        return null;
      }

      const def = setDefaults(decl, e);

      _.push(def);
      return _;
    }, []);

    if (values) {
      decl.value = values.join(', ');

      // decl.replaceWith({
      //   prop: 'transition',
      //   value: values.join(', '),
      // });
    }
  }

  return {
    postcssPlugin: PLUGIN_NAME,
    Once(css) {
      css.walkDecls('transition', transition);
    },
  };
};
