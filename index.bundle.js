const postcss=require("postcss");const postcssValueParser=require("postcss-value-parser");const TIMING_FUNCTIONS=["cubic-bezier","steps","ease","ease-in","ease-out","ease-in-out","linear","step-start","step-end"];const GLOBAL_VALUES=["auto","inherit","initial","none","unset"];module.exports=postcss.plugin("postcss-transition",defaults=>{if(!defaults){return()=>{}}function isTimeLike(val){let floatLike=!isNaN(parseFloat(val));let hasUnit=val.endsWith("s");return floatLike&&hasUnit}function isTimingFunctionLike(val){if(TIMING_FUNCTIONS.some(v=>val.startsWith(v))){return true}return false}function splitValues(str){const valueNodes=postcssValueParser(str).nodes;const divs=valueNodes.filter(n=>n.type==="div").map(d=>d.sourceIndex);let prev=0;let out=[...divs,str.length].map(d=>{let _prev=prev;prev=d+1;return str.substring(_prev,d).trim()});return out}function splitValue(value){let out=[];let functionStart=null;let functionEnd=null;postcssValueParser(value+" ").nodes.forEach(v=>{if(v.type==="function"&&functionStart===null){functionStart=v.sourceIndex;return}else if(functionStart!==null){functionEnd=v.sourceIndex;out.push(value.substring(functionStart,functionEnd));functionStart=null;functionEnd=null}else if(v.type==="word"||v.type==="space"){out.push(v.value)}});return out.filter(v=>v.trim())}function setDefaults(decl,entry){let params=splitValue(entry);let found={};params.forEach(param=>{if(!found.duration&&isTimeLike(param)){found.duration=param}else if(!found.delay&&isTimeLike(param)){found.delay=param}else if(!found.property&&param&&!isTimingFunctionLike(param)){found.property=param}else if(!found.timingFunction){found.timingFunction=param}});let processed=Object.assign({},defaults,found);if(!processed.property){return entry}let outValue="";[processed.property,processed.duration,processed.delay,processed.timingFunction].forEach(v=>{if(v!==null&&v!==undefined){outValue+=v+" "}});return outValue.trim()}function transition(decl){let values=splitValues(decl.value).reduce((_,e)=>{if(GLOBAL_VALUES.includes(e.toLowerCase())){return null}const def=setDefaults(decl,e);_.push(def);return _},[]);if(values){decl.replaceWith({prop:"transition",value:values.join(", ")})}}return css=>{css.walkDecls("transition",transition)}});