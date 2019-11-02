# [postcss-transition](https://www.npmjs.com/package/postcss-transition)

## Installation

```
npm i postcss-transition
```

Plugin that allows you to set the **default** value for the **transition shorthand** property

## USAGE:

### Add the plugin (postcss.config)

```javascript
postcss([
  // (plugins) Anything ....

  require('postcss-transition')({
    // Everything is optional, you can set only duration, or timing-function
    // If nothing is set, then there is nothing to replace, the plugin will not do anything
    property: 'ANY_PROPERTY',
    duration: 'ANY_DURATION',
    delay: 'ANY_DELAY',
    timingFunction: 'ANY_FUNCTION',
  }),

  // (optimization) autoprefixer, postcss-clean, css-mqpacker ...
]);
```

`ANY_**` — means **any** value, just string for `javascript`, will be inserted **AS IS**

### Add property in source code

Order of values **SHOULD** be: [**property**][**duration**] [**delay**][**timing-function**], **should** be, but it's not **must** be

**!!BUT!!** duration is always **BEFORE** delay

```css
a {
  transition: ; /* (dont sure it works with pre-processors) */
  transition: color;
  transition: color 2s;
  transition: color 2s ease-in;
}
```

### See results

```css
a {
  transition: ANY_PROPERTY ANY_DURATION ANY_DELAY ANY_FUNCTION;
  /* use all defaults (ideally) */

  transition: color ANY_DURATION ANY_DELAY ANY_FUNCTION;
  /* property (exists) + duration (added) + delay (added) + timing-function (added) */

  transition: color 2s ANY_DELAY ANY_FUNCTION;
  /* property (exists) + duration (exists) + delay (added) + timing-function (added) */

  transition: color 2s ANY_DELAY ease-in;
  /* property (exists) + duration (exists) + delay (added) + timing-function (exists) */
}
```

## Reason ?

I'm (~too lazy~) tired to write the remaining values for the property

## Alternatives ?

#### 1) [Inherit](https://jsfiddle.net/notiv/k89z0arj/1/)

```css
*,
::before,
::after {
  transition-timing-function: var(--transition-function);
  transition-duration: var(--transition-duration);
  transition-property: none;
}

a {
  transition-property: color;
}
```

#### 2) Mixins

- https://www.npmjs.com/package/transition-mixin
- http://compass-style.org/reference/compass/css3/transition/
- https://gist.github.com/tobiasahlin/7a421fb9306a4f518aab
- ~my old mixin on stylus which you shouldn't see ))))~

#### 3) Do not be lazy?

## Example

#### Config:

```javascript
postcss([
  // ...

  require('postcss-transition')({
    property: 'var(--transition-property)',
    duration: 'var(--transition-duration)',
    delay: 'var(--transition-delay)',
    timingFunction: 'var(--transition-timing-function)',
  }),

  // ...
]);
```

#### Input

```css
/* just as an example of use with css variables (yes -_-, custom properties, i know) */
:root {
  --transition-property: color;
  --transition-duration: 0.2s;
  --transition-delay: 40ms;
  --transition-timing-function: ease-in-out;
}

a {
  transition: color;
}
```

#### Output

```css
:root {
  --transition-property: color;
  --transition-duration: 0.2s;
  --transition-delay: 40ms;
  --transition-timing-function: ease-in-out;
}

a {
  transition: color var(--transition-duration) var(--transition-delay) var(--transition-timing-function);
}
```

handy

## More examples

```css
/* {
  duration: '200ms'
} */

a {
  transition: color;
  /* -> */
  transition: color 200ms;
}
```

```css
/* {
  duration: '200ms',
  timingFunction: 'ease-in-out'
 } */

a {
  transition: color;
  /* -> */
  transition: color 200ms ease-in-out;
}
```

```css
/* {
  property: color,
  duration: '200ms',
  timingFunction: 'ease-in-out'
 } */

a {
  transition: ;
  /* -> */
  transition: color 200ms ease-in-out;
}

ul li a {
  transition: color, background-color;
  /* -> */
  transition: color 200ms ease-in-out, background-color 200ms ease-in-out;
}

button {
  transition: background-color;
  /* -> */
  transition: background-color 200ms ease-in-out;
}
```

```css
/* {
  duration: '200ms'
 } */

a {
  transition: ease-in 1s font-size;
  /* -> */
  transition: font-size 1s ease-in; /* just re-order in this case */
}

a {
  transition: font-size ease-in;
  /* and */
  transition: ease-in font-size;
  /* -> */
  transition: font-size 200ms ease-in; /* the same */
}

a {
  transition: ease-in font-size 1s;
  /* -> */
  transition: font-size 1s ease-in;
}

a {
  transition: 1s color ease-in;
  /* -> */
  transition: color 1s ease-in;
}

a {
  transition: 1s 2s color ease-in;
  /* -> */
  transition: color 1s 2s ease-in;
}

a {
  transition: ease-in color 1s 2s;
  /* -> */
  transition: color 1s 2s ease-in;
}
```

well, you get the idea
