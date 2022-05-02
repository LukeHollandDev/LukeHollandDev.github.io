const p$2 = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p$2();
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i2 = 0; i2 < list.length; i2++) {
    map[list[i2]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const GLOBALS_WHITE_LISTED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt";
const isGloballyWhitelisted = /* @__PURE__ */ makeMap(GLOBALS_WHITE_LISTED);
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i2 = 0; i2 < value.length; i2++) {
      const item = value[i2];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value)) {
    return value;
  } else if (isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i2 = 0; i2 < value.length; i2++) {
      const normalized = normalizeClass(value[i2]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props)
    return null;
  let { class: klass, style } = props;
  if (klass && !isString(klass)) {
    props.class = normalizeClass(klass);
  }
  if (style) {
    props.style = normalizeStyle(style);
  }
  return props;
}
function looseCompareArrays(a2, b2) {
  if (a2.length !== b2.length)
    return false;
  let equal = true;
  for (let i2 = 0; equal && i2 < a2.length; i2++) {
    equal = looseEqual(a2[i2], b2[i2]);
  }
  return equal;
}
function looseEqual(a2, b2) {
  if (a2 === b2)
    return true;
  let aValidType = isDate(a2);
  let bValidType = isDate(b2);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a2.getTime() === b2.getTime() : false;
  }
  aValidType = isArray(a2);
  bValidType = isArray(b2);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a2, b2) : false;
  }
  aValidType = isObject(a2);
  bValidType = isObject(b2);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a2).length;
    const bKeysCount = Object.keys(b2).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a2) {
      const aHasKey = a2.hasOwnProperty(key);
      const bHasKey = b2.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a2[key], b2[key])) {
        return false;
      }
    }
  }
  return String(a2) === String(b2);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend$1 = Object.assign;
const remove = (arr, el) => {
  const i2 = arr.indexOf(el);
  if (i2 > -1) {
    arr.splice(i2, 1);
  }
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => val instanceof Date;
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c2) => c2 ? c2.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i2 = 0; i2 < fns.length; i2++) {
    fns[i2](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const toNumber = (val) => {
  const n2 = parseFloat(val);
  return isNaN(n2) ? val : n2;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof window !== "undefined" ? window : {});
};
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.active = true;
    this.effects = [];
    this.cleanups = [];
    if (!detached && activeEffectScope) {
      this.parent = activeEffectScope;
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
  }
  run(fn) {
    if (this.active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  on() {
    activeEffectScope = this;
  }
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this.active) {
      let i2, l2;
      for (i2 = 0, l2 = this.effects.length; i2 < l2; i2++) {
        this.effects[i2].stop();
      }
      for (i2 = 0, l2 = this.cleanups.length; i2 < l2; i2++) {
        this.cleanups[i2]();
      }
      if (this.scopes) {
        for (i2 = 0, l2 = this.scopes.length; i2 < l2; i2++) {
          this.scopes[i2].stop(true);
        }
      }
      if (this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(fn) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn);
  }
}
const createDep = (effects) => {
  const dep = new Set(effects);
  dep.w = 0;
  dep.n = 0;
  return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
  if (deps.length) {
    for (let i2 = 0; i2 < deps.length; i2++) {
      deps[i2].w |= trackOpBit;
    }
  }
};
const finalizeDepMarkers = (effect2) => {
  const { deps } = effect2;
  if (deps.length) {
    let ptr = 0;
    for (let i2 = 0; i2 < deps.length; i2++) {
      const dep = deps[i2];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect2);
      } else {
        deps[ptr++] = dep;
      }
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
const targetMap = /* @__PURE__ */ new WeakMap();
let effectTrackDepth = 0;
let trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }
      trackOpBit = 1 << --effectTrackDepth;
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = void 0;
      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect2) {
  const { deps } = effect2;
  if (deps.length) {
    for (let i2 = 0; i2 < deps.length; i2++) {
      deps[i2].delete(effect2);
    }
    deps.length = 0;
  }
}
function effect(fn, options) {
  if (fn.effect) {
    fn = fn.effect.fn;
  }
  const _effect = new ReactiveEffect(fn);
  if (options) {
    extend$1(_effect, options);
    if (options.scope)
      recordEffectScope(_effect, options.scope);
  }
  if (!options || !options.lazy) {
    _effect.run();
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
function stop(runner) {
  runner.effect.stop();
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep, debuggerEventExtraInfo) {
  let shouldTrack2 = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack2 = !wasTracked(dep);
    }
  } else {
    shouldTrack2 = !dep.has(activeEffect);
  }
  if (shouldTrack2) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger$1(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  if (deps.length === 1) {
    if (deps[0]) {
      {
        triggerEffects(deps[0]);
      }
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    {
      triggerEffects(createDep(effects));
    }
  }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
  for (const effect2 of isArray(dep) ? dep : [...dep]) {
    if (effect2 !== activeEffect || effect2.allowRecurse) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
const get = /* @__PURE__ */ createGetter();
const shallowGet = /* @__PURE__ */ createGetter(false, true);
const readonlyGet = /* @__PURE__ */ createGetter(true);
const shallowReadonlyGet = /* @__PURE__ */ createGetter(true, true);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i2 = 0, l2 = this.length; i2 < l2; i2++) {
        track(arr, "get", i2 + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function createGetter(isReadonly2 = false, shallow = false) {
  return function get2(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2 && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
      return shouldUnwrap ? res.value : res;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  };
}
const set = /* @__PURE__ */ createSetter();
const shallowSet = /* @__PURE__ */ createSetter(true);
function createSetter(shallow = false) {
  return function set2(target, key, value, receiver) {
    let oldValue = target[key];
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false;
    }
    if (!shallow && !isReadonly(value)) {
      if (!isShallow(value)) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger$1(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger$1(target, "set", key, value);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger$1(target, "delete", key, void 0);
  }
  return result;
}
function has(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys$1(target) {
  track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys: ownKeys$1
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    return true;
  },
  deleteProperty(target, key) {
    return true;
  }
};
const shallowReactiveHandlers = /* @__PURE__ */ extend$1({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet
});
const shallowReadonlyHandlers = /* @__PURE__ */ extend$1({}, readonlyHandlers, {
  get: shallowReadonlyGet
});
const toShallow = (value) => value;
const getProto = (v2) => Reflect.getPrototypeOf(v2);
function get$1(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly2 && track(rawTarget, "get", key);
  }
  !isReadonly2 && track(rawTarget, "get", rawKey);
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly2 && track(rawTarget, "has", key);
  }
  !isReadonly2 && track(rawTarget, "has", rawKey);
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger$1(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger$1(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger$1(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger$1(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger$1(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;
const toReadonly = (value) => isObject(value) ? readonly(value) : value;
function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    {
      trackEffects(ref2.dep || (ref2.dep = createDep()));
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  if (ref2.dep) {
    {
      triggerEffects(ref2.dep);
    }
  }
}
function isRef(r2) {
  return !!(r2 && r2.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    newVal = this.__v_isShallow ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this.__v_isShallow ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}
function triggerRef(ref2) {
  triggerRefValue(ref2);
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
  constructor(factory) {
    this.dep = void 0;
    this.__v_isRef = true;
    const { get: get2, set: set2 } = factory(() => trackRefValue(this), () => triggerRefValue(this));
    this._get = get2;
    this._set = set2;
  }
  get value() {
    return this._get();
  }
  set value(newVal) {
    this._set(newVal);
  }
}
function customRef(factory) {
  return new CustomRefImpl(factory);
}
function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this.__v_isRef = true;
  }
  get value() {
    const val = this._object[this._key];
    return val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}
function toRef(object, key, defaultValue) {
  const val = object[key];
  return isRef(val) ? val : new ObjectRefImpl(object, key, defaultValue);
}
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty || !self2._cacheable) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
const stack = [];
function warn(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(appWarnHandler, instance, 11, [
      msg + args.join(""),
      instance && instance.proxy,
      trace.map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`).join("\n"),
      trace
    ]);
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i2) => {
    logs.push(...i2 === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i2 = 0; i2 < fn.length; i2++) {
    values.push(callWithAsyncErrorHandling(fn[i2], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i2 = 0; i2 < errorCapturedHooks.length; i2++) {
          if (errorCapturedHooks[i2](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(appErrorHandler, null, 10, [err, exposedInstance, errorInfo]);
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue$2 = [];
let flushIndex = 0;
const pendingPreFlushCbs = [];
let activePreFlushCbs = null;
let preFlushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
let currentPreFlushParentJob = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue$2.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJobId = getId(queue$2[middle]);
    middleJobId < id ? start = middle + 1 : end = middle;
  }
  return start;
}
function queueJob(job) {
  if ((!queue$2.length || !queue$2.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) && job !== currentPreFlushParentJob) {
    if (job.id == null) {
      queue$2.push(job);
    } else {
      queue$2.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i2 = queue$2.indexOf(job);
  if (i2 > flushIndex) {
    queue$2.splice(i2, 1);
  }
}
function queueCb(cb, activeQueue, pendingQueue, index2) {
  if (!isArray(cb)) {
    if (!activeQueue || !activeQueue.includes(cb, cb.allowRecurse ? index2 + 1 : index2)) {
      pendingQueue.push(cb);
    }
  } else {
    pendingQueue.push(...cb);
  }
  queueFlush();
}
function queuePreFlushCb(cb) {
  queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
}
function queuePostFlushCb(cb) {
  queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
}
function flushPreFlushCbs(seen, parentJob = null) {
  if (pendingPreFlushCbs.length) {
    currentPreFlushParentJob = parentJob;
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
    pendingPreFlushCbs.length = 0;
    for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
      activePreFlushCbs[preFlushIndex]();
    }
    activePreFlushCbs = null;
    preFlushIndex = 0;
    currentPreFlushParentJob = null;
    flushPreFlushCbs(seen, parentJob);
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    activePostFlushCbs.sort((a2, b2) => getId(a2) - getId(b2));
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  flushPreFlushCbs(seen);
  queue$2.sort((a2, b2) => getId(a2) - getId(b2));
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue$2.length; flushIndex++) {
      const job = queue$2[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue$2.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue$2.length || pendingPreFlushCbs.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
let devtools;
let buffer$1 = [];
function setDevtoolsHook(hook, target) {
  var _a, _b;
  devtools = hook;
  if (devtools) {
    devtools.enabled = true;
    buffer$1.forEach(({ event, args }) => devtools.emit(event, ...args));
    buffer$1 = [];
  } else if (typeof window !== "undefined" && window.HTMLElement && !((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.includes("jsdom"))) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook(newHook, target);
    });
    setTimeout(() => {
      if (!devtools) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        buffer$1 = [];
      }
    }, 3e3);
  } else {
    buffer$1 = [];
  }
}
function emit$1(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a2) => a2.trim());
    } else if (number) {
      args = rawArgs.map(toNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6, args);
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend$1(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    cache.set(comp, null);
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend$1(normalized, raw);
  }
  cache.set(comp, normalized);
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
const withScopeId = (_id) => withCtx;
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    const res = fn(...args);
    setCurrentRenderingInstance(prevInstance);
    if (renderFnWithContext._d) {
      setBlockTracking(1);
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render: render2, renderCache, data, setupState, ctx, inheritAttrs } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(render2.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render3 = Component;
      if (false)
        ;
      result = normalizeVNode(render3.length > 1 ? render3(props, false ? {
        get attrs() {
          markAttrsAccessed();
          return attrs;
        },
        slots,
        emit
      } : { attrs, slots, emit }) : render3(props, null));
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
function filterSingleRoot(children) {
  let singleRoot;
  for (let i2 = 0; i2 < children.length; i2++) {
    const child = children[i2];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i2 = 0; i2 < dynamicProps.length; i2++) {
        const key = dynamicProps[i2];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i2 = 0; i2 < nextKeys.length; i2++) {
    const key = nextKeys[i2];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && parent.subTree === vnode) {
    (vnode = parent.vnode).el = el;
    parent = parent.parent;
  }
}
const isSuspense = (type) => type.__isSuspense;
const SuspenseImpl = {
  name: "Suspense",
  __isSuspense: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals) {
    if (n1 == null) {
      mountSuspense(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals);
    } else {
      patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, rendererInternals);
    }
  },
  hydrate: hydrateSuspense,
  create: createSuspenseBoundary,
  normalize: normalizeSuspenseChildren
};
const Suspense = SuspenseImpl;
function triggerEvent(vnode, name) {
  const eventListener = vnode.props && vnode.props[name];
  if (isFunction(eventListener)) {
    eventListener();
  }
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals) {
  const { p: patch, o: { createElement } } = rendererInternals;
  const hiddenContainer = createElement("div");
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals);
  patch(null, suspense.pendingBranch = vnode.ssContent, hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds);
  if (suspense.deps > 0) {
    triggerEvent(vnode, "onPending");
    triggerEvent(vnode, "onFallback");
    patch(null, vnode.ssFallback, container, anchor, parentComponent, null, isSVG, slotScopeIds);
    setActiveBranch(suspense, vnode.ssFallback);
  } else {
    suspense.resolve();
  }
}
function patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
  const suspense = n2.suspense = n1.suspense;
  suspense.vnode = n2;
  n2.el = n1.el;
  const newBranch = n2.ssContent;
  const newFallback = n2.ssFallback;
  const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
  if (pendingBranch) {
    suspense.pendingBranch = newBranch;
    if (isSameVNodeType(newBranch, pendingBranch)) {
      patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else if (isInFallback) {
        patch(activeBranch, newFallback, container, anchor, parentComponent, null, isSVG, slotScopeIds, optimized);
        setActiveBranch(suspense, newFallback);
      }
    } else {
      suspense.pendingId++;
      if (isHydrating) {
        suspense.isHydrating = false;
        suspense.activeBranch = pendingBranch;
      } else {
        unmount(pendingBranch, parentComponent, suspense);
      }
      suspense.deps = 0;
      suspense.effects.length = 0;
      suspense.hiddenContainer = createElement("div");
      if (isInFallback) {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        if (suspense.deps <= 0) {
          suspense.resolve();
        } else {
          patch(activeBranch, newFallback, container, anchor, parentComponent, null, isSVG, slotScopeIds, optimized);
          setActiveBranch(suspense, newFallback);
        }
      } else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
        patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        suspense.resolve(true);
      } else {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        if (suspense.deps <= 0) {
          suspense.resolve();
        }
      }
    }
  } else {
    if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
      patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      setActiveBranch(suspense, newBranch);
    } else {
      triggerEvent(n2, "onPending");
      suspense.pendingBranch = newBranch;
      suspense.pendingId++;
      patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else {
        const { timeout, pendingId } = suspense;
        if (timeout > 0) {
          setTimeout(() => {
            if (suspense.pendingId === pendingId) {
              suspense.fallback(newFallback);
            }
          }, timeout);
        } else if (timeout === 0) {
          suspense.fallback(newFallback);
        }
      }
    }
  }
}
function createSuspenseBoundary(vnode, parent, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
  const { p: patch, m: move, um: unmount, n: next, o: { parentNode, remove: remove2 } } = rendererInternals;
  const timeout = toNumber(vnode.props && vnode.props.timeout);
  const suspense = {
    vnode,
    parent,
    parentComponent,
    isSVG,
    container,
    hiddenContainer,
    anchor,
    deps: 0,
    pendingId: 0,
    timeout: typeof timeout === "number" ? timeout : -1,
    activeBranch: null,
    pendingBranch: null,
    isInFallback: true,
    isHydrating,
    isUnmounted: false,
    effects: [],
    resolve(resume = false) {
      const { vnode: vnode2, activeBranch, pendingBranch, pendingId, effects, parentComponent: parentComponent2, container: container2 } = suspense;
      if (suspense.isHydrating) {
        suspense.isHydrating = false;
      } else if (!resume) {
        const delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
        if (delayEnter) {
          activeBranch.transition.afterLeave = () => {
            if (pendingId === suspense.pendingId) {
              move(pendingBranch, container2, anchor2, 0);
            }
          };
        }
        let { anchor: anchor2 } = suspense;
        if (activeBranch) {
          anchor2 = next(activeBranch);
          unmount(activeBranch, parentComponent2, suspense, true);
        }
        if (!delayEnter) {
          move(pendingBranch, container2, anchor2, 0);
        }
      }
      setActiveBranch(suspense, pendingBranch);
      suspense.pendingBranch = null;
      suspense.isInFallback = false;
      let parent2 = suspense.parent;
      let hasUnresolvedAncestor = false;
      while (parent2) {
        if (parent2.pendingBranch) {
          parent2.effects.push(...effects);
          hasUnresolvedAncestor = true;
          break;
        }
        parent2 = parent2.parent;
      }
      if (!hasUnresolvedAncestor) {
        queuePostFlushCb(effects);
      }
      suspense.effects = [];
      triggerEvent(vnode2, "onResolve");
    },
    fallback(fallbackVNode) {
      if (!suspense.pendingBranch) {
        return;
      }
      const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, isSVG: isSVG2 } = suspense;
      triggerEvent(vnode2, "onFallback");
      const anchor2 = next(activeBranch);
      const mountFallback = () => {
        if (!suspense.isInFallback) {
          return;
        }
        patch(null, fallbackVNode, container2, anchor2, parentComponent2, null, isSVG2, slotScopeIds, optimized);
        setActiveBranch(suspense, fallbackVNode);
      };
      const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
      if (delayEnter) {
        activeBranch.transition.afterLeave = mountFallback;
      }
      suspense.isInFallback = true;
      unmount(activeBranch, parentComponent2, null, true);
      if (!delayEnter) {
        mountFallback();
      }
    },
    move(container2, anchor2, type) {
      suspense.activeBranch && move(suspense.activeBranch, container2, anchor2, type);
      suspense.container = container2;
    },
    next() {
      return suspense.activeBranch && next(suspense.activeBranch);
    },
    registerDep(instance, setupRenderEffect) {
      const isInPendingSuspense = !!suspense.pendingBranch;
      if (isInPendingSuspense) {
        suspense.deps++;
      }
      const hydratedEl = instance.vnode.el;
      instance.asyncDep.catch((err) => {
        handleError(err, instance, 0);
      }).then((asyncSetupResult) => {
        if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) {
          return;
        }
        instance.asyncResolved = true;
        const { vnode: vnode2 } = instance;
        handleSetupResult(instance, asyncSetupResult, false);
        if (hydratedEl) {
          vnode2.el = hydratedEl;
        }
        const placeholder = !hydratedEl && instance.subTree.el;
        setupRenderEffect(instance, vnode2, parentNode(hydratedEl || instance.subTree.el), hydratedEl ? null : next(instance.subTree), suspense, isSVG, optimized);
        if (placeholder) {
          remove2(placeholder);
        }
        updateHOCHostEl(instance, vnode2.el);
        if (isInPendingSuspense && --suspense.deps === 0) {
          suspense.resolve();
        }
      });
    },
    unmount(parentSuspense, doRemove) {
      suspense.isUnmounted = true;
      if (suspense.activeBranch) {
        unmount(suspense.activeBranch, parentComponent, parentSuspense, doRemove);
      }
      if (suspense.pendingBranch) {
        unmount(suspense.pendingBranch, parentComponent, parentSuspense, doRemove);
      }
    }
  };
  return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals, hydrateNode) {
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, node.parentNode, document.createElement("div"), null, isSVG, slotScopeIds, optimized, rendererInternals, true);
  const result = hydrateNode(node, suspense.pendingBranch = vnode.ssContent, parentComponent, suspense, slotScopeIds, optimized);
  if (suspense.deps === 0) {
    suspense.resolve();
  }
  return result;
}
function normalizeSuspenseChildren(vnode) {
  const { shapeFlag, children } = vnode;
  const isSlotChildren = shapeFlag & 32;
  vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
  vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment);
}
function normalizeSuspenseSlot(s2) {
  let block;
  if (isFunction(s2)) {
    const trackBlock = isBlockTreeEnabled && s2._c;
    if (trackBlock) {
      s2._d = false;
      openBlock();
    }
    s2 = s2();
    if (trackBlock) {
      s2._d = true;
      block = currentBlock;
      closeBlock();
    }
  }
  if (isArray(s2)) {
    const singleChild = filterSingleRoot(s2);
    s2 = singleChild;
  }
  s2 = normalizeVNode(s2);
  if (block && !s2.dynamicChildren) {
    s2.dynamicChildren = block.filter((c2) => c2 !== s2);
  }
  return s2;
}
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
function setActiveBranch(suspense, branch) {
  suspense.activeBranch = branch;
  const { vnode, parentComponent } = suspense;
  const el = vnode.el = branch.el;
  if (parentComponent && parentComponent.subTree === vnode) {
    parentComponent.vnode.el = el;
    updateHOCHostEl(parentComponent, el);
  }
}
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance) {
    const provides = instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance.proxy) : defaultValue;
    } else
      ;
  }
}
function watchEffect(effect2, options) {
  return doWatch(effect2, null, options);
}
function watchPostEffect(effect2, options) {
  return doWatch(effect2, null, { flush: "post" });
}
function watchSyncEffect(effect2, options) {
  return doWatch(effect2, null, { flush: "sync" });
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  const instance = currentInstance;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some(isReactive);
    getter = () => source.map((s2) => {
      if (isRef(s2)) {
        return s2.value;
      } else if (isReactive(s2)) {
        return traverse(s2);
      } else if (isFunction(s2)) {
        return callWithErrorHandling(s2, instance, 2);
      } else
        ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, instance, 3, [onCleanup]);
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
    };
  };
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    return NOOP;
  }
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v2, i2) => hasChanged(v2, oldValue[i2])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    scheduler = () => {
      if (!instance || instance.isMounted) {
        queuePreFlushCb(job);
      } else {
        job();
      }
    };
  }
  const effect2 = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(effect2.run.bind(effect2), instance && instance.suspense);
  } else {
    effect2.run();
  }
  return () => {
    effect2.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect2);
    }
  };
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const cur = currentInstance;
  setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  if (cur) {
    setCurrentInstance(cur);
  } else {
    unsetCurrentInstance();
  }
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i2 = 0; i2 < segments.length && cur; i2++) {
      cur = cur[segments[i2]];
    }
    return cur;
  };
}
function traverse(value, seen) {
  if (!isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i2 = 0; i2 < value.length; i2++) {
      traverse(value[i2], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v2) => {
      traverse(v2, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  return value;
}
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    onBeforeEnter: TransitionHookValidator,
    onEnter: TransitionHookValidator,
    onAfterEnter: TransitionHookValidator,
    onEnterCancelled: TransitionHookValidator,
    onBeforeLeave: TransitionHookValidator,
    onLeave: TransitionHookValidator,
    onAfterLeave: TransitionHookValidator,
    onLeaveCancelled: TransitionHookValidator,
    onBeforeAppear: TransitionHookValidator,
    onAppear: TransitionHookValidator,
    onAfterAppear: TransitionHookValidator,
    onAppearCancelled: TransitionHookValidator
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevTransitionKey;
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      let child = children[0];
      if (children.length > 1) {
        for (const c2 of children) {
          if (c2.type !== Comment) {
            child = c2;
            break;
          }
        }
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getKeepAliveChild(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
      setTransitionHooks(innerChild, enterHooks);
      const oldChild = instance.subTree;
      const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
      let transitionKeyChanged = false;
      const { getTransitionKey } = innerChild.type;
      if (getTransitionKey) {
        const key = getTransitionKey();
        if (prevTransitionKey === void 0) {
          prevTransitionKey = key;
        } else if (key !== prevTransitionKey) {
          prevTransitionKey = key;
          transitionKeyChanged = true;
        }
      }
      if (oldInnerChild && oldInnerChild.type !== Comment && (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
        const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in") {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            instance.update();
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el._leaveCb = () => {
              earlyRemove();
              el._leaveCb = void 0;
              delete enterHooks.delayedLeave;
            };
            enterHooks.delayedLeave = delayedLeave;
          };
        }
      }
      return child;
    };
  }
};
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
  const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(hook, instance, 9, args);
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el._leaveCb) {
        el._leaveCb(true);
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el._leaveCb) {
        leavingVNode.el._leaveCb();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      const done = el._enterCb = (cancelled) => {
        if (called)
          return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el._enterCb = void 0;
      };
      if (hook) {
        hook(el, done);
        if (hook.length <= 1) {
          done();
        }
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el._enterCb) {
        el._enterCb(true);
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el._leaveCb = (cancelled) => {
        if (called)
          return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el._leaveCb = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        onLeave(el, done);
        if (onLeave.length <= 1) {
          done();
        }
      } else {
        done();
      }
    },
    clone(vnode2) {
      return resolveTransitionHooks(vnode2, props, state, instance);
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getKeepAliveChild(vnode) {
  return isKeepAlive(vnode) ? vnode.children ? vnode.children[0] : void 0 : vnode;
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i2 = 0; i2 < children.length; i2++) {
    let child = children[i2];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i2);
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i2 = 0; i2 < ret.length; i2++) {
      ret[i2].patchFlag = -2;
    }
  }
  return ret;
}
function defineComponent(options) {
  return isFunction(options) ? { setup: options, name: options.name } : options;
}
const isAsyncWrapper = (i2) => !!i2.type.__asyncLoader;
function defineAsyncComponent(source) {
  if (isFunction(source)) {
    source = { loader: source };
  }
  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout,
    suspensible = true,
    onError: userOnError
  } = source;
  let pendingRequest = null;
  let resolvedComp;
  let retries = 0;
  const retry = () => {
    retries++;
    pendingRequest = null;
    return load();
  };
  const load = () => {
    let thisRequest;
    return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
      err = err instanceof Error ? err : new Error(String(err));
      if (userOnError) {
        return new Promise((resolve2, reject) => {
          const userRetry = () => resolve2(retry());
          const userFail = () => reject(err);
          userOnError(err, userRetry, userFail, retries + 1);
        });
      } else {
        throw err;
      }
    }).then((comp) => {
      if (thisRequest !== pendingRequest && pendingRequest) {
        return pendingRequest;
      }
      if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) {
        comp = comp.default;
      }
      resolvedComp = comp;
      return comp;
    }));
  };
  return defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: load,
    get __asyncResolved() {
      return resolvedComp;
    },
    setup() {
      const instance = currentInstance;
      if (resolvedComp) {
        return () => createInnerComp(resolvedComp, instance);
      }
      const onError = (err) => {
        pendingRequest = null;
        handleError(err, instance, 13, !errorComponent);
      };
      if (suspensible && instance.suspense || isInSSRComponentSetup) {
        return load().then((comp) => {
          return () => createInnerComp(comp, instance);
        }).catch((err) => {
          onError(err);
          return () => errorComponent ? createVNode(errorComponent, {
            error: err
          }) : null;
        });
      }
      const loaded = ref(false);
      const error = ref();
      const delayed = ref(!!delay);
      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }
      if (timeout != null) {
        setTimeout(() => {
          if (!loaded.value && !error.value) {
            const err = new Error(`Async component timed out after ${timeout}ms.`);
            onError(err);
            error.value = err;
          }
        }, timeout);
      }
      load().then(() => {
        loaded.value = true;
        if (instance.parent && isKeepAlive(instance.parent.vnode)) {
          queueJob(instance.parent.update);
        }
      }).catch((err) => {
        onError(err);
        error.value = err;
      });
      return () => {
        if (loaded.value && resolvedComp) {
          return createInnerComp(resolvedComp, instance);
        } else if (error.value && errorComponent) {
          return createVNode(errorComponent, {
            error: error.value
          });
        } else if (loadingComponent && !delayed.value) {
          return createVNode(loadingComponent);
        }
      };
    }
  });
}
function createInnerComp(comp, { vnode: { ref: ref2, props, children } }) {
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref2;
  return vnode;
}
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
const KeepAliveImpl = {
  name: `KeepAlive`,
  __isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    if (!sharedContext.renderer) {
      return slots.default;
    }
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    let current = null;
    const parentSuspense = instance.suspense;
    const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
    const storageContainer = createElement("div");
    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance2 = vnode.component;
      move(vnode, container, anchor, 0, parentSuspense);
      patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
      queuePostRenderEffect(() => {
        instance2.isDeactivated = false;
        if (instance2.a) {
          invokeArrayFns(instance2.a);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
      }, parentSuspense);
    };
    sharedContext.deactivate = (vnode) => {
      const instance2 = vnode.component;
      move(vnode, storageContainer, null, 1, parentSuspense);
      queuePostRenderEffect(() => {
        if (instance2.da) {
          invokeArrayFns(instance2.da);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
        instance2.isDeactivated = true;
      }, parentSuspense);
    };
    function unmount(vnode) {
      resetShapeFlag(vnode);
      _unmount(vnode, instance, parentSuspense, true);
    }
    function pruneCache(filter) {
      cache.forEach((vnode, key) => {
        const name = getComponentName(vnode.type);
        if (name && (!filter || !filter(name))) {
          pruneCacheEntry(key);
        }
      });
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key);
      if (!current || cached.type !== current.type) {
        unmount(cached);
      } else if (current) {
        resetShapeFlag(current);
      }
      cache.delete(key);
      keys.delete(key);
    }
    watch(() => [props.include, props.exclude], ([include, exclude]) => {
      include && pruneCache((name) => matches$1(include, name));
      exclude && pruneCache((name) => !matches$1(exclude, name));
    }, { flush: "post", deep: true });
    let pendingCacheKey = null;
    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, getInnerChild(instance.subTree));
      }
    };
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    onBeforeUnmount(() => {
      cache.forEach((cached) => {
        const { subTree, suspense } = instance;
        const vnode = getInnerChild(subTree);
        if (cached.type === vnode.type) {
          resetShapeFlag(vnode);
          const da = vnode.component.da;
          da && queuePostRenderEffect(da, suspense);
          return;
        }
        unmount(cached);
      });
    });
    return () => {
      pendingCacheKey = null;
      if (!slots.default) {
        return null;
      }
      const children = slots.default();
      const rawVNode = children[0];
      if (children.length > 1) {
        current = null;
        return children;
      } else if (!isVNode(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
        current = null;
        return rawVNode;
      }
      let vnode = getInnerChild(rawVNode);
      const comp = vnode.type;
      const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
      const { include, exclude, max } = props;
      if (include && (!name || !matches$1(include, name)) || exclude && name && matches$1(exclude, name)) {
        current = vnode;
        return rawVNode;
      }
      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);
      if (vnode.el) {
        vnode = cloneVNode(vnode);
        if (rawVNode.shapeFlag & 128) {
          rawVNode.ssContent = vnode;
        }
      }
      pendingCacheKey = key;
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;
        if (vnode.transition) {
          setTransitionHooks(vnode, vnode.transition);
        }
        vnode.shapeFlag |= 512;
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) {
          pruneCacheEntry(keys.values().next().value);
        }
      }
      vnode.shapeFlag |= 256;
      current = vnode;
      return rawVNode;
    };
  }
};
const KeepAlive = KeepAliveImpl;
function matches$1(pattern, name) {
  if (isArray(pattern)) {
    return pattern.some((p2) => matches$1(p2, name));
  } else if (isString(pattern)) {
    return pattern.split(",").includes(name);
  } else if (pattern.test) {
    return pattern.test(name);
  }
  return false;
}
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(type, hook, keepAliveRoot, true);
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function resetShapeFlag(vnode) {
  let shapeFlag = vnode.shapeFlag;
  if (shapeFlag & 256) {
    shapeFlag -= 256;
  }
  if (shapeFlag & 512) {
    shapeFlag -= 512;
  }
  vnode.shapeFlag = shapeFlag;
}
function getInnerChild(vnode) {
  return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      unsetCurrentInstance();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, hook, target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    expose,
    inheritAttrs,
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c2 = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c2.value,
        set: (v2) => c2.value = v2
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(opt.from || key, opt.default, true);
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      if (unwrapRef) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v2) => injected.value = v2
        });
      } else {
        ctx[key] = injected;
      }
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r2) => createWatcher(r2, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach((m2) => mergeOptions$1(resolved, m2, optionMergeStrategies, true));
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  cache.set(base, resolved);
  return resolved;
}
function mergeOptions$1(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach((m2) => mergeOptions$1(to, m2, strats, true));
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend$1(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i2 = 0; i2 < raw.length; i2++) {
      res[raw[i2]] = raw[i2];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend$1(extend$1(/* @__PURE__ */ Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend$1(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i2 = 0; i2 < propsToUpdate.length; i2++) {
        let key = propsToUpdate[i2];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger$1(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i2 = 0; i2 < needCastKeys.length; i2++) {
      const key = needCastKeys[i2];
      props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(null, props);
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[0]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend$1(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    cache.set(comp, EMPTY_ARR);
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i2 = 0; i2 < raw.length; i2++) {
      const normalizedKey = camelize(raw[i2]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : opt;
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[0] = booleanIndex > -1;
          prop[1] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  cache.set(comp, res);
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ctor === null ? "null" : "";
}
function isSameType(a2, b2) {
  return getType(a2) === getType(b2);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray(expectedTypes)) {
    return expectedTypes.findIndex((t2) => isSameType(t2, type));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot$1 = (key, rawSlot, ctx) => {
  const normalized = withCtx((...args) => {
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(children, instance.slots = {});
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend$1(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
        delete slots[key];
      }
    }
  }
};
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(internalInstance) || internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i2 = 0; i2 < directives.length; i2++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i2];
    if (isFunction(dir)) {
      dir = {
        mounted: dir,
        updated: dir
      };
    }
    if (dir.deep) {
      traverse(value);
    }
    bindings.push({
      dir,
      instance,
      value,
      oldValue: void 0,
      arg,
      modifiers
    });
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i2 = 0; i2 < bindings.length; i2++) {
    const binding = bindings[i2];
    if (oldBindings) {
      binding.oldValue = oldBindings[i2].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid = 0;
function createAppAPI(render2, hydrate2) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = Object.assign({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new Set();
    let isMounted = false;
    const app2 = context.app = {
      _uid: uid++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version: version$1,
      get config() {
        return context.config;
      },
      set config(v2) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app2, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app2, ...options);
        } else
          ;
        return app2;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app2;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app2;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app2;
      },
      mount(rootContainer, isHydrate, isSVG) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (isHydrate && hydrate2) {
            hydrate2(vnode, rootContainer);
          } else {
            render2(vnode, rootContainer, isSVG);
          }
          isMounted = true;
          app2._container = rootContainer;
          rootContainer.__vue_app__ = app2;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render2(null, app2._container);
          delete app2._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app2;
      }
    };
    return app2;
  };
}
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach((r2, i2) => setRef(r2, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i2] : oldRawRef), parentSuspense, vnode, isUnmount));
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (isRef(ref2)) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
let hasMismatch = false;
const isSVGContainer = (container) => /svg/.test(container.namespaceURI) && container.tagName !== "foreignObject";
const isComment = (node) => node.nodeType === 8;
function createHydrationFunctions(rendererInternals) {
  const { mt: mountComponent, p: patch, o: { patchProp: patchProp2, nextSibling, parentNode, remove: remove2, insert, createComment } } = rendererInternals;
  const hydrate2 = (vnode, container) => {
    if (!container.hasChildNodes()) {
      patch(null, vnode, container);
      flushPostFlushCbs();
      return;
    }
    hasMismatch = false;
    hydrateNode(container.firstChild, vnode, null, null, null);
    flushPostFlushCbs();
    if (hasMismatch && true) {
      console.error(`Hydration completed but contains mismatches.`);
    }
  };
  const hydrateNode = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false) => {
    const isFragmentStart = isComment(node) && node.data === "[";
    const onMismatch = () => handleMismatch(node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragmentStart);
    const { type, ref: ref2, shapeFlag } = vnode;
    const domType = node.nodeType;
    vnode.el = node;
    let nextNode = null;
    switch (type) {
      case Text:
        if (domType !== 3) {
          nextNode = onMismatch();
        } else {
          if (node.data !== vnode.children) {
            hasMismatch = true;
            node.data = vnode.children;
          }
          nextNode = nextSibling(node);
        }
        break;
      case Comment:
        if (domType !== 8 || isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = nextSibling(node);
        }
        break;
      case Static:
        if (domType !== 1) {
          nextNode = onMismatch();
        } else {
          nextNode = node;
          const needToAdoptContent = !vnode.children.length;
          for (let i2 = 0; i2 < vnode.staticCount; i2++) {
            if (needToAdoptContent)
              vnode.children += nextNode.outerHTML;
            if (i2 === vnode.staticCount - 1) {
              vnode.anchor = nextNode;
            }
            nextNode = nextSibling(nextNode);
          }
          return nextNode;
        }
        break;
      case Fragment:
        if (!isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
        }
        break;
      default:
        if (shapeFlag & 1) {
          if (domType !== 1 || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) {
            nextNode = onMismatch();
          } else {
            nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
          }
        } else if (shapeFlag & 6) {
          vnode.slotScopeIds = slotScopeIds;
          const container = parentNode(node);
          mountComponent(vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), optimized);
          nextNode = isFragmentStart ? locateClosingAsyncAnchor(node) : nextSibling(node);
          if (isAsyncWrapper(vnode)) {
            let subTree;
            if (isFragmentStart) {
              subTree = createVNode(Fragment);
              subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
            } else {
              subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
            }
            subTree.el = node;
            vnode.component.subTree = subTree;
          }
        } else if (shapeFlag & 64) {
          if (domType !== 8) {
            nextNode = onMismatch();
          } else {
            nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, rendererInternals, hydrateChildren);
          }
        } else if (shapeFlag & 128) {
          nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, isSVGContainer(parentNode(node)), slotScopeIds, optimized, rendererInternals, hydrateNode);
        } else
          ;
    }
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode);
    }
    return nextNode;
  };
  const hydrateElement = (el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const { type, props, patchFlag, shapeFlag, dirs } = vnode;
    const forcePatchValue = type === "input" && dirs || type === "option";
    if (forcePatchValue || patchFlag !== -1) {
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      if (props) {
        if (forcePatchValue || !optimized || patchFlag & (16 | 32)) {
          for (const key in props) {
            if (forcePatchValue && key.endsWith("value") || isOn(key) && !isReservedProp(key)) {
              patchProp2(el, key, null, props[key], false, void 0, parentComponent);
            }
          }
        } else if (props.onClick) {
          patchProp2(el, "onClick", null, props.onClick, false, void 0, parentComponent);
        }
      }
      let vnodeHooks;
      if (vnodeHooks = props && props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHooks, parentComponent, vnode);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      if ((vnodeHooks = props && props.onVnodeMounted) || dirs) {
        queueEffectWithSuspense(() => {
          vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
      if (shapeFlag & 16 && !(props && (props.innerHTML || props.textContent))) {
        let next = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense, slotScopeIds, optimized);
        while (next) {
          hasMismatch = true;
          const cur = next;
          next = next.nextSibling;
          remove2(cur);
        }
      } else if (shapeFlag & 8) {
        if (el.textContent !== vnode.children) {
          hasMismatch = true;
          el.textContent = vnode.children;
        }
      }
    }
    return el.nextSibling;
  };
  const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!parentVNode.dynamicChildren;
    const children = parentVNode.children;
    const l2 = children.length;
    for (let i2 = 0; i2 < l2; i2++) {
      const vnode = optimized ? children[i2] : children[i2] = normalizeVNode(children[i2]);
      if (node) {
        node = hydrateNode(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
      } else if (vnode.type === Text && !vnode.children) {
        continue;
      } else {
        hasMismatch = true;
        patch(null, vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
      }
    }
    return node;
  };
  const hydrateFragment = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    const { slotScopeIds: fragmentSlotScopeIds } = vnode;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    const container = parentNode(node);
    const next = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense, slotScopeIds, optimized);
    if (next && isComment(next) && next.data === "]") {
      return nextSibling(vnode.anchor = next);
    } else {
      hasMismatch = true;
      insert(vnode.anchor = createComment(`]`), container, next);
      return next;
    }
  };
  const handleMismatch = (node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment) => {
    hasMismatch = true;
    vnode.el = null;
    if (isFragment) {
      const end = locateClosingAsyncAnchor(node);
      while (true) {
        const next2 = nextSibling(node);
        if (next2 && next2 !== end) {
          remove2(next2);
        } else {
          break;
        }
      }
    }
    const next = nextSibling(node);
    const container = parentNode(node);
    remove2(node);
    patch(null, vnode, container, next, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
    return next;
  };
  const locateClosingAsyncAnchor = (node) => {
    let match = 0;
    while (node) {
      node = nextSibling(node);
      if (node && isComment(node)) {
        if (node.data === "[")
          match++;
        if (node.data === "]") {
          if (match === 0) {
            return nextSibling(node);
          } else {
            match--;
          }
        }
      }
    }
    return node;
  };
  return [hydrate2, hydrateNode];
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function createHydrationRenderer(options) {
  return baseCreateRenderer(options, createHydrationFunctions);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG);
        }
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & 1) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 6) {
          processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 64) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else if (shapeFlag & 128) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    isSVG = isSVG || n2.type === "svg";
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode;
    if (vnode.el && hostCloneNode !== void 0 && patchFlag === -1) {
      el = vnode.el = hostCloneNode(vnode.el);
    } else {
      el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== "foreignObject", slotScopeIds, optimized);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i2 = 0; i2 < slotScopeIds.length; i2++) {
        hostSetScopeId(el, slotScopeIds[i2]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
    for (let i2 = start; i2 < children.length; i2++) {
      const child = children[i2] = optimized ? cloneIfMounted(children[i2]) : normalizeVNode(children[i2]);
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    const areChildrenSVG = isSVG && n2.type !== "foreignObject";
    if (dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
    } else if (!optimized) {
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, isSVG);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, isSVG);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i2 = 0; i2 < propsToUpdate.length; i2++) {
            const key = propsToUpdate[i2];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
    for (let i2 = 0; i2 < newChildren.length; i2++) {
      const oldVNode = oldChildren[i2];
      const newVNode = newChildren[i2];
      const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : fallbackContainer;
      patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
        if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
          traverseStaticChildren(n1, n2, true);
        }
      } else {
        patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
      } else {
        mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
      return;
    }
    setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.update();
      }
    } else {
      n2.component = n1.component;
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m: m2, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(() => !instance.isUnmounted && hydrateSubTree());
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
          initialVNode.el = subTree.el;
        }
        if (m2) {
          queuePostRenderEffect(m2, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
        }
        if (initialVNode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u: u2, parent, vnode } = instance;
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, isSVG);
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u2) {
          queuePostRenderEffect(u2, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
        }
      }
    };
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update), instance.scope);
    const update = instance.update = effect2.run.bind(effect2);
    update.id = instance.uid;
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(void 0, instance.update);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i2;
    for (i2 = 0; i2 < commonLength; i2++) {
      const nextChild = c2[i2] = optimized ? cloneIfMounted(c2[i2]) : normalizeVNode(c2[i2]);
      patch(c1[i2], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let i2 = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i2 <= e1 && i2 <= e2) {
      const n1 = c1[i2];
      const n2 = c2[i2] = optimized ? cloneIfMounted(c2[i2]) : normalizeVNode(c2[i2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i2++;
    }
    while (i2 <= e1 && i2 <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i2 > e1) {
      if (i2 <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i2 <= e2) {
          patch(null, c2[i2] = optimized ? cloneIfMounted(c2[i2]) : normalizeVNode(c2[i2]), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          i2++;
        }
      }
    } else if (i2 > e2) {
      while (i2 <= e1) {
        unmount(c1[i2], parentComponent, parentSuspense, true);
        i2++;
      }
    } else {
      const s1 = i2;
      const s2 = i2;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i2 = s2; i2 <= e2; i2++) {
        const nextChild = c2[i2] = optimized ? cloneIfMounted(c2[i2]) : normalizeVNode(c2[i2]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i2);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved2 = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i2 = 0; i2 < toBePatched; i2++)
        newIndexToOldIndexMap[i2] = 0;
      for (i2 = s1; i2 <= e1; i2++) {
        const prevChild = c1[i2];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex2;
        if (prevChild.key != null) {
          newIndex2 = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex2 = j;
              break;
            }
          }
        }
        if (newIndex2 === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex2 - s2] = i2 + 1;
          if (newIndex2 >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex2;
          } else {
            moved2 = true;
          }
          patch(prevChild, c2[newIndex2], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved2 ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i2 = toBePatched - 1; i2 >= 0; i2--) {
        const nextIndex = s2 + i2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i2] === 0) {
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (moved2) {
          if (j < 0 || i2 !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i2 = 0; i2 < children.length; i2++) {
        move(children[i2], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove3 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove3();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove3, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
      } else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update) {
      update.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i2 = start; i2 < children.length; i2++) {
      unmount(children[i2], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  const render2 = (vnode, container, isSVG) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null, null, isSVG);
    }
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate2;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate2, hydrateNode] = createHydrationFns(internals);
  }
  return {
    render: render2,
    hydrate: hydrate2,
    createApp: createAppAPI(render2, hydrate2)
  };
}
function toggleRecurse({ effect: effect2, update }, allowed) {
  effect2.allowRecurse = update.allowRecurse = allowed;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i2 = 0; i2 < ch1.length; i2++) {
      const c1 = ch1[i2];
      let c2 = ch2[i2];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i2] = cloneIfMounted(ch2[i2]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i2, j, u2, v2, c2;
  const len2 = arr.length;
  for (i2 = 0; i2 < len2; i2++) {
    const arrI = arr[i2];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i2] = j;
        result.push(i2);
        continue;
      }
      u2 = 0;
      v2 = result.length - 1;
      while (u2 < v2) {
        c2 = u2 + v2 >> 1;
        if (arr[result[c2]] < arrI) {
          u2 = c2 + 1;
        } else {
          v2 = c2;
        }
      }
      if (arrI < arr[result[u2]]) {
        if (u2 > 0) {
          p2[i2] = result[u2 - 1];
        }
        result[u2] = i2;
      }
    }
  }
  u2 = result.length;
  v2 = result[u2 - 1];
  while (u2-- > 0) {
    result[u2] = v2;
    v2 = p2[v2];
  }
  return result;
}
const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
const isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
const resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString(targetSelector)) {
    if (!select) {
      return null;
    } else {
      const target = select(targetSelector);
      return target;
    }
  } else {
    return targetSelector;
  }
};
const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals) {
    const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { shapeFlag, children, dynamicChildren } = n2;
    if (n1 == null) {
      const placeholder = n2.el = createText("");
      const mainAnchor = n2.anchor = createText("");
      insert(placeholder, container, anchor);
      insert(mainAnchor, container, anchor);
      const target = n2.target = resolveTarget(n2.props, querySelector);
      const targetAnchor = n2.targetAnchor = createText("");
      if (target) {
        insert(targetAnchor, target);
        isSVG = isSVG || isTargetSVG(target);
      }
      const mount2 = (container2, anchor2) => {
        if (shapeFlag & 16) {
          mountChildren(children, container2, anchor2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      };
      if (disabled) {
        mount2(container, mainAnchor);
      } else if (target) {
        mount2(target, targetAnchor);
      }
    } else {
      n2.el = n1.el;
      const mainAnchor = n2.anchor = n1.anchor;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      isSVG = isSVG || isTargetSVG(target);
      if (dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG, slotScopeIds);
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, false);
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(n2, container, mainAnchor, internals, 1);
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
          if (nextTarget) {
            moveTeleport(n2, nextTarget, null, internals, 0);
          }
        } else if (wasDisabled) {
          moveTeleport(n2, target, targetAnchor, internals, 1);
        }
      }
    }
  },
  remove(vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
    if (target) {
      hostRemove(targetAnchor);
    }
    if (doRemove || !isTeleportDisabled(props)) {
      hostRemove(anchor);
      if (shapeFlag & 16) {
        for (let i2 = 0; i2 < children.length; i2++) {
          const child = children[i2];
          unmount(child, parentComponent, parentSuspense, true, !!child.dynamicChildren);
        }
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
  if (moveType === 0) {
    insert(vnode.targetAnchor, container, parentAnchor);
  }
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) {
    insert(el, container, parentAnchor);
  }
  if (!isReorder || isTeleportDisabled(props)) {
    if (shapeFlag & 16) {
      for (let i2 = 0; i2 < children.length; i2++) {
        move(children[i2], container, parentAnchor, 2);
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector } }, hydrateChildren) {
  const target = vnode.target = resolveTarget(vnode.props, querySelector);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (isTeleportDisabled(vnode.props)) {
        vnode.anchor = hydrateChildren(nextSibling(node), vnode, parentNode(node), parentComponent, parentSuspense, slotScopeIds, optimized);
        vnode.targetAnchor = targetNode;
      } else {
        vnode.anchor = nextSibling(node);
        vnode.targetAnchor = hydrateChildren(targetNode, vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
      }
      target._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
const COMPONENTS = "components";
const DIRECTIVES = "directives";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveDynamicComponent(component) {
  if (isString(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveDirective(name) {
  return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(Component);
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
const Fragment = Symbol(void 0);
const Text = Symbol(void 0);
const Comment = Symbol(void 0);
const Static = Symbol(void 0);
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function transformVNodeArgs(transformer) {
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref: ref2, ref_key, ref_for }) => {
  return ref2 != null ? isString(ref2) || isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true);
    if (children) {
      normalizeChildren(cloned, children);
    }
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend$1({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend$1({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref2, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition: vnode.transition,
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor
  };
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(Fragment, null, child.slice());
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i2 = 0; i2 < args.length; i2++) {
    const toMerge = args[i2];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
function renderList(source, renderItem, cache, index2) {
  let ret;
  const cached = cache && cache[index2];
  if (isArray(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i2 = 0, l2 = source.length; i2 < l2; i2++) {
      ret[i2] = renderItem(source[i2], i2, void 0, cached && cached[i2]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i2 = 0; i2 < source; i2++) {
      ret[i2] = renderItem(i2 + 1, i2, void 0, cached && cached[i2]);
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i2) => renderItem(item, i2, void 0, cached && cached[i2]));
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
        const key = keys[i2];
        ret[i2] = renderItem(source[key], key, i2, cached && cached[i2]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index2] = ret;
  }
  return ret;
}
function createSlots(slots, dynamicSlots) {
  for (let i2 = 0; i2 < dynamicSlots.length; i2++) {
    const slot = dynamicSlots[i2];
    if (isArray(slot)) {
      for (let j = 0; j < slot.length; j++) {
        slots[slot[j].name] = slot[j].fn;
      }
    } else if (slot) {
      slots[slot.name] = slot.fn;
    }
  }
  return slots;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
    return createVNode("slot", name === "default" ? null : { name }, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(Fragment, { key: props.key || `_${name}` }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
  if (!noSlotted && rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true;
    if (child.type === Comment)
      return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
function toHandlers(obj) {
  const ret = {};
  for (const key in obj) {
    ret[toHandlerKey(key)] = obj[key];
  }
  return ret;
}
const getPublicInstance = (i2) => {
  if (!i2)
    return null;
  if (isStatefulComponent(i2))
    return getExposeProxy(i2) || i2.proxy;
  return getPublicInstance(i2.parent);
};
const publicPropertiesMap = /* @__PURE__ */ extend$1(/* @__PURE__ */ Object.create(null), {
  $: (i2) => i2,
  $el: (i2) => i2.vnode.el,
  $data: (i2) => i2.data,
  $props: (i2) => i2.props,
  $attrs: (i2) => i2.attrs,
  $slots: (i2) => i2.slots,
  $refs: (i2) => i2.refs,
  $parent: (i2) => getPublicInstance(i2.parent),
  $root: (i2) => getPublicInstance(i2.root),
  $emit: (i2) => i2.emit,
  $options: (i2) => resolveMergedOptions(i2),
  $forceUpdate: (i2) => () => queueJob(i2.update),
  $nextTick: (i2) => nextTick.bind(i2.proxy),
  $watch: (i2) => instanceWatch.bind(i2)
});
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n2 = accessCache[key];
      if (n2 !== void 0) {
        switch (n2) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if ((normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || setupState !== EMPTY_OBJ && hasOwn(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
const RuntimeCompiledPublicInstanceProxyHandlers = /* @__PURE__ */ extend$1({}, PublicInstanceProxyHandlers, {
  get(target, key) {
    if (key === Symbol.unscopables) {
      return;
    }
    return PublicInstanceProxyHandlers.get(target, key, target);
  },
  has(_, key) {
    const has2 = key[0] !== "_" && !isGloballyWhitelisted(key);
    return has2;
  }
});
const emptyAppContext = createAppContext();
let uid$1 = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid$1++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(true),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    emit: null,
    emitted: null,
    propsDefaults: EMPTY_OBJ,
    inheritAttrs: type.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit$1.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
  currentInstance = instance;
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isInSSRComponentSetup = isSSR;
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isInSSRComponentSetup = false;
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
    resetTracking();
    unsetCurrentInstance();
    if (isPromise(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e2) => {
          handleError(e2, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile$1;
let installWithProxy;
function registerRuntimeCompiler(_compile) {
  compile$1 = _compile;
  installWithProxy = (i2) => {
    if (i2.render._rc) {
      i2.withProxy = new Proxy(i2.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
    }
  };
}
const isRuntimeOnly = () => !compile$1;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile$1 && !Component.render) {
      const template = Component.template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend$1(extend$1({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile$1(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
    if (installWithProxy) {
      installWithProxy(instance);
    }
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    applyOptions(instance);
    resetTracking();
    unsetCurrentInstance();
  }
}
function createAttrsProxy(instance) {
  return new Proxy(instance.attrs, {
    get(target, key) {
      track(instance, "get", "$attrs");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  let attrs;
  {
    return {
      get attrs() {
        return attrs || (attrs = createAttrsProxy(instance));
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c2) => c2.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components || instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function defineProps() {
  return null;
}
function defineEmits() {
  return null;
}
function defineExpose(exposed) {
}
function withDefaults(props, defaults2) {
  return null;
}
function useSlots() {
  return getContext().slots;
}
function useAttrs() {
  return getContext().attrs;
}
function getContext() {
  const i2 = getCurrentInstance();
  return i2.setupContext || (i2.setupContext = createSetupContext(i2));
}
function mergeDefaults(raw, defaults2) {
  const props = isArray(raw) ? raw.reduce((normalized, p2) => (normalized[p2] = {}, normalized), {}) : raw;
  for (const key in defaults2) {
    const opt = props[key];
    if (opt) {
      if (isArray(opt) || isFunction(opt)) {
        props[key] = { type: opt, default: defaults2[key] };
      } else {
        opt.default = defaults2[key];
      }
    } else if (opt === null) {
      props[key] = { default: defaults2[key] };
    } else
      ;
  }
  return props;
}
function createPropsRestProxy(props, excludedKeys) {
  const ret = {};
  for (const key in props) {
    if (!excludedKeys.includes(key)) {
      Object.defineProperty(ret, key, {
        enumerable: true,
        get: () => props[key]
      });
    }
  }
  return ret;
}
function withAsyncContext(getAwaitable) {
  const ctx = getCurrentInstance();
  let awaitable = getAwaitable();
  unsetCurrentInstance();
  if (isPromise(awaitable)) {
    awaitable = awaitable.catch((e2) => {
      setCurrentInstance(ctx);
      throw e2;
    });
  }
  return [awaitable, () => setCurrentInstance(ctx)];
}
function h$1(type, propsOrChildren, children) {
  const l2 = arguments.length;
  if (l2 === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l2 > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l2 === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
const ssrContextKey = Symbol(``);
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    if (!ctx) {
      warn(`Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`);
    }
    return ctx;
  }
};
function initCustomFormatter() {
  {
    return;
  }
}
function withMemo(memo, render2, cache, index2) {
  const cached = cache[index2];
  if (cached && isMemoSame(cached, memo)) {
    return cached;
  }
  const ret = render2();
  ret.memo = memo.slice();
  return cache[index2] = ret;
}
function isMemoSame(cached, memo) {
  const prev = cached.memo;
  if (prev.length != memo.length) {
    return false;
  }
  for (let i2 = 0; i2 < prev.length; i2++) {
    if (prev[i2] !== memo[i2]) {
      return false;
    }
  }
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(cached);
  }
  return true;
}
const version$1 = "3.2.33";
const _ssrUtils = {
  createComponentInstance,
  setupComponent,
  renderComponentRoot,
  setCurrentRenderingInstance,
  isVNode,
  normalizeVNode
};
const ssrUtils = _ssrUtils;
const resolveFilter = null;
const compatUtils = null;
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, isSVG, is2, props) => {
    const el = isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is2 ? { is: is2 } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  cloneNode(el) {
    const cloned = el.cloneNode(true);
    if (`_value` in el) {
      cloned._value = el._value;
    }
    return cloned;
  },
  insertStaticContent(content, parent, anchor, isSVG, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
      const template = templateContainer.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      before ? before.nextSibling : parent.firstChild,
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
function patchClass(el, value, isSVG) {
  const transitionClasses = el._vtc;
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  if (next && !isCssString) {
    for (const key in next) {
      setStyle(style, key, next[key]);
    }
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, "");
        }
      }
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prev !== next) {
        style.cssText = next;
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
    if ("_vod" in el) {
      style.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v2) => setStyle(style, name, v2));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i2 = 0; i2 < prefixes.length; i2++) {
    const prefixed = prefixes[i2] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  if (key === "value" && el.tagName !== "PROGRESS" && !el.tagName.includes("-")) {
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue || el.tagName === "OPTION") {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e2) {
  }
  needRemove && el.removeAttribute(key);
}
const [_getNow, skipTimestampCheck] = /* @__PURE__ */ (() => {
  let _getNow2 = Date.now;
  let skipTimestampCheck2 = false;
  if (typeof window !== "undefined") {
    if (Date.now() > document.createEvent("Event").timeStamp) {
      _getNow2 = () => performance.now();
    }
    const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i);
    skipTimestampCheck2 = !!(ffMatch && Number(ffMatch[1]) <= 53);
  }
  return [_getNow2, skipTimestampCheck2];
})();
let cachedNow = 0;
const p$1 = /* @__PURE__ */ Promise.resolve();
const reset = () => {
  cachedNow = 0;
};
const getNow = () => cachedNow || (p$1.then(reset), cachedNow = _getNow());
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m2;
    while (m2 = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m2[0].length);
      options[m2[0].toLowerCase()] = true;
    }
  }
  return [hyphenate(name.slice(2)), options];
}
function createInvoker(initialValue, instance) {
  const invoker = (e2) => {
    const timeStamp = e2.timeStamp || _getNow();
    if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
      callWithAsyncErrorHandling(patchStopImmediatePropagation(e2, invoker.value), instance, 5, [e2]);
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e2, value) {
  if (isArray(value)) {
    const originalStop = e2.stopImmediatePropagation;
    e2.stopImmediatePropagation = () => {
      originalStop.call(e2);
      e2._stopped = true;
    };
    return value.map((fn) => (e3) => !e3._stopped && fn && fn(e3));
  } else {
    return value;
  }
}
const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && nativeOnRE.test(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (nativeOnRE.test(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function defineCustomElement(options, hydate) {
  const Comp = defineComponent(options);
  class VueCustomElement extends VueElement {
    constructor(initialProps) {
      super(Comp, initialProps, hydate);
    }
  }
  VueCustomElement.def = Comp;
  return VueCustomElement;
}
const defineSSRCustomElement = (options) => {
  return defineCustomElement(options, hydrate);
};
const BaseClass = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
class VueElement extends BaseClass {
  constructor(_def, _props = {}, hydrate2) {
    super();
    this._def = _def;
    this._props = _props;
    this._instance = null;
    this._connected = false;
    this._resolved = false;
    this._numberProps = null;
    if (this.shadowRoot && hydrate2) {
      hydrate2(this._createVNode(), this.shadowRoot);
    } else {
      this.attachShadow({ mode: "open" });
    }
  }
  connectedCallback() {
    this._connected = true;
    if (!this._instance) {
      this._resolveDef();
    }
  }
  disconnectedCallback() {
    this._connected = false;
    nextTick(() => {
      if (!this._connected) {
        render(null, this.shadowRoot);
        this._instance = null;
      }
    });
  }
  _resolveDef() {
    if (this._resolved) {
      return;
    }
    this._resolved = true;
    for (let i2 = 0; i2 < this.attributes.length; i2++) {
      this._setAttr(this.attributes[i2].name);
    }
    new MutationObserver((mutations) => {
      for (const m2 of mutations) {
        this._setAttr(m2.attributeName);
      }
    }).observe(this, { attributes: true });
    const resolve2 = (def2) => {
      const { props, styles } = def2;
      const hasOptions = !isArray(props);
      const rawKeys = props ? hasOptions ? Object.keys(props) : props : [];
      let numberProps;
      if (hasOptions) {
        for (const key in this._props) {
          const opt = props[key];
          if (opt === Number || opt && opt.type === Number) {
            this._props[key] = toNumber(this._props[key]);
            (numberProps || (numberProps = /* @__PURE__ */ Object.create(null)))[key] = true;
          }
        }
      }
      this._numberProps = numberProps;
      for (const key of Object.keys(this)) {
        if (key[0] !== "_") {
          this._setProp(key, this[key], true, false);
        }
      }
      for (const key of rawKeys.map(camelize)) {
        Object.defineProperty(this, key, {
          get() {
            return this._getProp(key);
          },
          set(val) {
            this._setProp(key, val);
          }
        });
      }
      this._applyStyles(styles);
      this._update();
    };
    const asyncDef = this._def.__asyncLoader;
    if (asyncDef) {
      asyncDef().then(resolve2);
    } else {
      resolve2(this._def);
    }
  }
  _setAttr(key) {
    let value = this.getAttribute(key);
    if (this._numberProps && this._numberProps[key]) {
      value = toNumber(value);
    }
    this._setProp(camelize(key), value, false);
  }
  _getProp(key) {
    return this._props[key];
  }
  _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
    if (val !== this._props[key]) {
      this._props[key] = val;
      if (shouldUpdate && this._instance) {
        this._update();
      }
      if (shouldReflect) {
        if (val === true) {
          this.setAttribute(hyphenate(key), "");
        } else if (typeof val === "string" || typeof val === "number") {
          this.setAttribute(hyphenate(key), val + "");
        } else if (!val) {
          this.removeAttribute(hyphenate(key));
        }
      }
    }
  }
  _update() {
    render(this._createVNode(), this.shadowRoot);
  }
  _createVNode() {
    const vnode = createVNode(this._def, extend$1({}, this._props));
    if (!this._instance) {
      vnode.ce = (instance) => {
        this._instance = instance;
        instance.isCE = true;
        instance.emit = (event, ...args) => {
          this.dispatchEvent(new CustomEvent(event, {
            detail: args
          }));
        };
        let parent = this;
        while (parent = parent && (parent.parentNode || parent.host)) {
          if (parent instanceof VueElement) {
            instance.parent = parent._instance;
            break;
          }
        }
      };
    }
    return vnode;
  }
  _applyStyles(styles) {
    if (styles) {
      styles.forEach((css2) => {
        const s2 = document.createElement("style");
        s2.textContent = css2;
        this.shadowRoot.appendChild(s2);
      });
    }
  }
}
function useCssModule(name = "$style") {
  {
    const instance = getCurrentInstance();
    if (!instance) {
      return EMPTY_OBJ;
    }
    const modules = instance.type.__cssModules;
    if (!modules) {
      return EMPTY_OBJ;
    }
    const mod = modules[name];
    if (!mod) {
      return EMPTY_OBJ;
    }
    return mod;
  }
}
function useCssVars(getter) {
  const instance = getCurrentInstance();
  if (!instance) {
    return;
  }
  const setVars = () => setVarsOnVNode(instance.subTree, getter(instance.proxy));
  watchPostEffect(setVars);
  onMounted(() => {
    const ob = new MutationObserver(setVars);
    ob.observe(instance.subTree.el.parentNode, { childList: true });
    onUnmounted(() => ob.disconnect());
  });
}
function setVarsOnVNode(vnode, vars) {
  if (vnode.shapeFlag & 128) {
    const suspense = vnode.suspense;
    vnode = suspense.activeBranch;
    if (suspense.pendingBranch && !suspense.isHydrating) {
      suspense.effects.push(() => {
        setVarsOnVNode(suspense.activeBranch, vars);
      });
    }
  }
  while (vnode.component) {
    vnode = vnode.component.subTree;
  }
  if (vnode.shapeFlag & 1 && vnode.el) {
    setVarsOnNode(vnode.el, vars);
  } else if (vnode.type === Fragment) {
    vnode.children.forEach((c2) => setVarsOnVNode(c2, vars));
  } else if (vnode.type === Static) {
    let { el, anchor } = vnode;
    while (el) {
      setVarsOnNode(el, vars);
      if (el === anchor)
        break;
      el = el.nextSibling;
    }
  }
}
function setVarsOnNode(el, vars) {
  if (el.nodeType === 1) {
    const style = el.style;
    for (const key in vars) {
      style.setProperty(`--${key}`, vars[key]);
    }
  }
}
const TRANSITION = "transition";
const ANIMATION = "animation";
const Transition = (props, { slots }) => h$1(BaseTransition, resolveTransitionProps(props), slots);
Transition.displayName = "Transition";
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = Transition.props = /* @__PURE__ */ extend$1({}, BaseTransition.props, DOMTransitionPropsValidators);
const callHook = (hook, args = []) => {
  if (isArray(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
        }
      });
    };
  };
  return extend$1(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      forceReflow();
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n2 = NumberOf(duration);
    return [n2, n2];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c2) => c2 && el.classList.add(c2));
  (el._vtc || (el._vtc = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c2) => c2 && el.classList.remove(c2));
  const { _vtc } = el;
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el._vtc = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e2) => {
    if (e2.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(TRANSITION + "Delay");
  const transitionDurations = getStyleProperties(TRANSITION + "Duration");
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(ANIMATION + "Delay");
  const animationDurations = getStyleProperties(ANIMATION + "Duration");
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(transform|all)(,|$)/.test(styles[TRANSITION + "Property"]);
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d2, i2) => toMs(d2) + toMs(delays[i2])));
}
function toMs(s2) {
  return Number(s2.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow() {
  return document.body.offsetHeight;
}
const positionMap = /* @__PURE__ */ new WeakMap();
const newPositionMap = /* @__PURE__ */ new WeakMap();
const TransitionGroupImpl = {
  name: "TransitionGroup",
  props: /* @__PURE__ */ extend$1({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevChildren;
    let children;
    onUpdated(() => {
      if (!prevChildren.length) {
        return;
      }
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
        return;
      }
      prevChildren.forEach(callPendingCbs);
      prevChildren.forEach(recordPosition);
      const movedChildren = prevChildren.filter(applyTranslation);
      forceReflow();
      movedChildren.forEach((c2) => {
        const el = c2.el;
        const style = el.style;
        addTransitionClass(el, moveClass);
        style.transform = style.webkitTransform = style.transitionDuration = "";
        const cb = el._moveCb = (e2) => {
          if (e2 && e2.target !== el) {
            return;
          }
          if (!e2 || /transform$/.test(e2.propertyName)) {
            el.removeEventListener("transitionend", cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        };
        el.addEventListener("transitionend", cb);
      });
    });
    return () => {
      const rawProps = toRaw(props);
      const cssTransitionProps = resolveTransitionProps(rawProps);
      let tag = rawProps.tag || Fragment;
      prevChildren = children;
      children = slots.default ? getTransitionRawChildren(slots.default()) : [];
      for (let i2 = 0; i2 < children.length; i2++) {
        const child = children[i2];
        if (child.key != null) {
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
        }
      }
      if (prevChildren) {
        for (let i2 = 0; i2 < prevChildren.length; i2++) {
          const child = prevChildren[i2];
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
          positionMap.set(child, child.el.getBoundingClientRect());
        }
      }
      return createVNode(tag, null, children);
    };
  }
};
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c2) {
  const el = c2.el;
  if (el._moveCb) {
    el._moveCb();
  }
  if (el._enterCb) {
    el._enterCb();
  }
}
function recordPosition(c2) {
  newPositionMap.set(c2, c2.el.getBoundingClientRect());
}
function applyTranslation(c2) {
  const oldPos = positionMap.get(c2);
  const newPos = newPositionMap.get(c2);
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    const s2 = c2.el.style;
    s2.transform = s2.webkitTransform = `translate(${dx}px,${dy}px)`;
    s2.transitionDuration = "0s";
    return c2;
  }
}
function hasCSSTransform(el, root, moveClass) {
  const clone2 = el.cloneNode();
  if (el._vtc) {
    el._vtc.forEach((cls) => {
      cls.split(/\s+/).forEach((c2) => c2 && clone2.classList.remove(c2));
    });
  }
  moveClass.split(/\s+/).forEach((c2) => c2 && clone2.classList.add(c2));
  clone2.style.display = "none";
  const container = root.nodeType === 1 ? root : root.parentNode;
  container.appendChild(clone2);
  const { hasTransform } = getTransitionInfo(clone2);
  container.removeChild(clone2);
  return hasTransform;
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"];
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e2) {
  e2.target.composing = true;
}
function onCompositionEnd(e2) {
  const target = e2.target;
  if (target.composing) {
    target.composing = false;
    trigger(target, "input");
  }
}
function trigger(el, type) {
  const e2 = document.createEvent("HTMLEvents");
  e2.initEvent(type, true, true);
  el.dispatchEvent(e2);
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e2) => {
      if (e2.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      } else if (castToNumber) {
        domValue = toNumber(domValue);
      }
      el._assign(domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el) {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && toNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  }
};
const vModelCheckbox = {
  deep: true,
  created(el, _, vnode) {
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign2 = el._assign;
      if (isArray(modelValue)) {
        const index2 = looseIndexOf(modelValue, elementValue);
        const found = index2 !== -1;
        if (checked && !found) {
          assign2(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index2, 1);
          assign2(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign2(cloned);
      } else {
        assign2(getCheckboxValue(el, checked));
      }
    });
  },
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el._assign = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  if (isArray(value)) {
    el.checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    el.checked = value.has(vnode.props.value);
  } else if (value !== oldValue) {
    el.checked = looseEqual(value, getCheckboxValue(el, true));
  }
}
const vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el._assign(getValue(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (value !== oldValue) {
      el.checked = looseEqual(value, vnode.props.value);
    }
  }
};
const vModelSelect = {
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o2) => o2.selected).map((o2) => number ? toNumber(getValue(o2)) : getValue(o2));
      el._assign(el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
    });
    el._assign = getModelAssigner(vnode);
  },
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el._assign = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    setSelected(el, value);
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  if (isMultiple && !isArray(value) && !isSet(value)) {
    return;
  }
  for (let i2 = 0, l2 = el.options.length; i2 < l2; i2++) {
    const option2 = el.options[i2];
    const optionValue = getValue(option2);
    if (isMultiple) {
      if (isArray(value)) {
        option2.selected = looseIndexOf(value, optionValue) > -1;
      } else {
        option2.selected = value.has(optionValue);
      }
    } else {
      if (looseEqual(getValue(option2), value)) {
        if (el.selectedIndex !== i2)
          el.selectedIndex = i2;
        return;
      }
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const vModelDynamic = {
  created(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "created");
  },
  mounted(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "mounted");
  },
  beforeUpdate(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "beforeUpdate");
  },
  updated(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "updated");
  }
};
function callModelHook(el, binding, vnode, prevVNode, hook) {
  let modelToUse;
  switch (el.tagName) {
    case "SELECT":
      modelToUse = vModelSelect;
      break;
    case "TEXTAREA":
      modelToUse = vModelText;
      break;
    default:
      switch (vnode.props && vnode.props.type) {
        case "checkbox":
          modelToUse = vModelCheckbox;
          break;
        case "radio":
          modelToUse = vModelRadio;
          break;
        default:
          modelToUse = vModelText;
      }
  }
  const fn = modelToUse[hook];
  fn && fn(el, binding, vnode, prevVNode);
}
function initVModelForSSR() {
  vModelText.getSSRProps = ({ value }) => ({ value });
  vModelRadio.getSSRProps = ({ value }, vnode) => {
    if (vnode.props && looseEqual(vnode.props.value, value)) {
      return { checked: true };
    }
  };
  vModelCheckbox.getSSRProps = ({ value }, vnode) => {
    if (isArray(value)) {
      if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) {
        return { checked: true };
      }
    } else if (isSet(value)) {
      if (vnode.props && value.has(vnode.props.value)) {
        return { checked: true };
      }
    } else if (value) {
      return { checked: true };
    }
  };
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e2) => e2.stopPropagation(),
  prevent: (e2) => e2.preventDefault(),
  self: (e2) => e2.target !== e2.currentTarget,
  ctrl: (e2) => !e2.ctrlKey,
  shift: (e2) => !e2.shiftKey,
  alt: (e2) => !e2.altKey,
  meta: (e2) => !e2.metaKey,
  left: (e2) => "button" in e2 && e2.button !== 0,
  middle: (e2) => "button" in e2 && e2.button !== 1,
  right: (e2) => "button" in e2 && e2.button !== 2,
  exact: (e2, modifiers) => systemModifiers.some((m2) => e2[`${m2}Key`] && !modifiers.includes(m2))
};
const withModifiers = (fn, modifiers) => {
  return (event, ...args) => {
    for (let i2 = 0; i2 < modifiers.length; i2++) {
      const guard = modifierGuards[modifiers[i2]];
      if (guard && guard(event, modifiers))
        return;
    }
    return fn(event, ...args);
  };
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  return (event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) {
      return fn(event);
    }
  };
};
const vShow = {
  beforeMount(el, { value }, { transition }) {
    el._vod = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue)
      return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el._vod : "none";
}
function initVShowForSSR() {
  vShow.getSSRProps = ({ value }) => {
    if (!value) {
      return { style: { display: "none" } };
    }
  };
}
const rendererOptions = /* @__PURE__ */ extend$1({ patchProp }, nodeOps);
let renderer;
let enabledHydration = false;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
function ensureHydrationRenderer() {
  renderer = enabledHydration ? renderer : createHydrationRenderer(rendererOptions);
  enabledHydration = true;
  return renderer;
}
const render = (...args) => {
  ensureRenderer().render(...args);
};
const hydrate = (...args) => {
  ensureHydrationRenderer().hydrate(...args);
};
const createApp = (...args) => {
  const app2 = ensureRenderer().createApp(...args);
  const { mount: mount2 } = app2;
  app2.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app2._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount2(container, false, container instanceof SVGElement);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app2;
};
const createSSRApp = (...args) => {
  const app2 = ensureHydrationRenderer().createApp(...args);
  const { mount: mount2 } = app2;
  app2.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (container) {
      return mount2(container, true, container instanceof SVGElement);
    }
  };
  return app2;
};
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
let ssrDirectiveInitialized = false;
const initDirectivesForSSR = () => {
  if (!ssrDirectiveInitialized) {
    ssrDirectiveInitialized = true;
    initVModelForSSR();
    initVShowForSSR();
  }
};
const compile = () => {
};
var vue_runtime_esmBundler = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  compile,
  EffectScope,
  ReactiveEffect,
  customRef,
  effect,
  effectScope,
  getCurrentScope,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  isShallow,
  markRaw,
  onScopeDispose,
  proxyRefs,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  stop,
  toRaw,
  toRef,
  toRefs,
  triggerRef,
  unref,
  camelize,
  capitalize,
  normalizeClass,
  normalizeProps,
  normalizeStyle,
  toDisplayString,
  toHandlerKey,
  BaseTransition,
  Comment,
  Fragment,
  KeepAlive,
  Static,
  Suspense,
  Teleport,
  Text,
  callWithAsyncErrorHandling,
  callWithErrorHandling,
  cloneVNode,
  compatUtils,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode: createBaseVNode,
  createHydrationRenderer,
  createPropsRestProxy,
  createRenderer,
  createSlots,
  createStaticVNode,
  createTextVNode,
  createVNode,
  defineAsyncComponent,
  defineComponent,
  defineEmits,
  defineExpose,
  defineProps,
  get devtools() {
    return devtools;
  },
  getCurrentInstance,
  getTransitionRawChildren,
  guardReactiveProps,
  h: h$1,
  handleError,
  initCustomFormatter,
  inject,
  isMemoSame,
  isRuntimeOnly,
  isVNode,
  mergeDefaults,
  mergeProps,
  nextTick,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onErrorCaptured,
  onMounted,
  onRenderTracked,
  onRenderTriggered,
  onServerPrefetch,
  onUnmounted,
  onUpdated,
  openBlock,
  popScopeId,
  provide,
  pushScopeId,
  queuePostFlushCb,
  registerRuntimeCompiler,
  renderList,
  renderSlot,
  resolveComponent,
  resolveDirective,
  resolveDynamicComponent,
  resolveFilter,
  resolveTransitionHooks,
  setBlockTracking,
  setDevtoolsHook,
  setTransitionHooks,
  ssrContextKey,
  ssrUtils,
  toHandlers,
  transformVNodeArgs,
  useAttrs,
  useSSRContext,
  useSlots,
  useTransitionState,
  version: version$1,
  warn,
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  withAsyncContext,
  withCtx,
  withDefaults,
  withDirectives,
  withMemo,
  withScopeId,
  Transition,
  TransitionGroup,
  VueElement,
  createApp,
  createSSRApp,
  defineCustomElement,
  defineSSRCustomElement,
  hydrate,
  initDirectivesForSSR,
  render,
  useCssModule,
  useCssVars,
  vModelCheckbox,
  vModelDynamic,
  vModelRadio,
  vModelSelect,
  vModelText,
  vShow,
  withKeys,
  withModifiers
}, Symbol.toStringTag, { value: "Module" }));
/*!
  * vue-router v4.0.14
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
const hasSymbol = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
const PolySymbol = (name) => hasSymbol ? Symbol(name) : "_vr_" + name;
const matchedRouteKey = /* @__PURE__ */ PolySymbol("rvlm");
const viewDepthKey = /* @__PURE__ */ PolySymbol("rvd");
const routerKey = /* @__PURE__ */ PolySymbol("r");
const routeLocationKey = /* @__PURE__ */ PolySymbol("rl");
const routerViewLocationKey = /* @__PURE__ */ PolySymbol("rvl");
const isBrowser = typeof window !== "undefined";
function isESModule(obj) {
  return obj.__esModule || hasSymbol && obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop$1 = () => {
};
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const searchPos = location2.indexOf("?");
  const hashPos = location2.indexOf("#", searchPos > -1 ? searchPos : 0);
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash
  };
}
function stringifyURL(stringifyQuery2, location2) {
  const query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a2, b2) {
  const aLastIndex = a2.matched.length - 1;
  const bLastIndex = b2.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a2.matched[aLastIndex], b2.matched[bLastIndex]) && isSameRouteLocationParams(a2.params, b2.params) && stringifyQuery2(a2.query) === stringifyQuery2(b2.query) && a2.hash === b2.hash;
}
function isSameRouteRecord(a2, b2) {
  return (a2.aliasOf || a2) === (b2.aliasOf || b2);
}
function isSameRouteLocationParams(a2, b2) {
  if (Object.keys(a2).length !== Object.keys(b2).length)
    return false;
  for (const key in a2) {
    if (!isSameRouteLocationParamsValue(a2[key], b2[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a2, b2) {
  return Array.isArray(a2) ? isEquivalentArray(a2, b2) : Array.isArray(b2) ? isEquivalentArray(b2, a2) : a2 === b2;
}
function isEquivalentArray(a2, b2) {
  return Array.isArray(b2) ? a2.length === b2.length && a2.every((value, i2) => value === b2[i2]) : a2.length === 1 && a2[0] === b2;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (position === 1 || segment === ".")
      continue;
    if (segment === "..")
      position--;
    else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.pageXOffset,
  top: window.pageYOffset
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const { pathname, search, hash } = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index2 = listeners.indexOf(callback);
      if (index2 > -1)
        listeners.splice(index2, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const { history: history2 } = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
  }
  function destroy2() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy: destroy2
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history2, location: location2 } = window;
  const currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  const historyState = { value: history2.state };
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      position: history2.length - 1,
      replaced: true,
      scroll: null
    }, true);
  }
  function changeLocation(to, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        console.error(err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    const state = assign({}, history2.state, buildState(historyState.value.back, to, historyState.value.forward, true), data, { position: historyState.value.position });
    changeLocation(to, state, true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign({}, historyState.value, history2.state, {
      forward: to,
      scroll: computeScrollPosition()
    });
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
    changeLocation(to, state, false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = /* @__PURE__ */ PolySymbol("nf");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type, params) {
  {
    return assign(new Error(), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [90];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i2 = score.length - 1;
    score[i2][score[i2].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict)
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i2 = 1; i2 < match.length; i2++) {
      const value = match[i2] || "";
      const key = keys[i2 - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (Array.isArray(param) && !repeatable)
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          const text = Array.isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path;
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a2, b2) {
  let i2 = 0;
  while (i2 < a2.length && i2 < b2.length) {
    const diff = b2[i2] - a2[i2];
    if (diff)
      return diff;
    i2++;
  }
  if (a2.length < b2.length) {
    return a2.length === 1 && a2[0] === 40 + 40 ? -1 : 1;
  } else if (a2.length > b2.length) {
    return b2.length === 1 && b2[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a2, b2) {
  let i2 = 0;
  const aScore = a2.score;
  const bScore = b2.score;
  while (i2 < aScore.length && i2 < bScore.length) {
    const comp = compareScoreArray(aScore[i2], bScore[i2]);
    if (comp)
      return comp;
    i2++;
  }
  return bScore.length - aScore.length;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer2}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i2 = 0;
  let char;
  let buffer2 = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer2)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer2
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer2}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer2,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer2 = "";
  }
  function addCharToBuffer() {
    buffer2 += char;
  }
  while (i2 < path.length) {
    char = path[i2++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer2) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i2--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i2--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer2}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if ("children" in mainNormalizedRecord) {
        const children = mainNormalizedRecord.children;
        for (let i2 = 0; i2 < children.length; i2++) {
          addRoute(children[i2], matcher, originalRecord && originalRecord.children[i2]);
        }
      }
      originalRecord = originalRecord || matcher;
      insertMatcher(matcher);
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop$1;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index2 = matchers.indexOf(matcherRef);
      if (index2 > -1) {
        matchers.splice(index2, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i2 = 0;
    while (i2 < matchers.length && comparePathParserScore(matcher, matchers[i2]) >= 0 && (matcher.record.path !== matchers[i2].record.path || !isRecordChildOf(matcher, matchers[i2])))
      i2++;
    matchers.splice(i2, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve2(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(paramsFromLocation(currentLocation.params, matcher.keys.filter((k) => !k.optional).map((k) => k.name)), location2.params);
      path = matcher.stringify(params);
    } else if ("path" in location2) {
      path = location2.path;
      matcher = matchers.find((m2) => m2.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m2) => m2.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  return { addRoute, resolve: resolve2, removeRoute, getRoutes, getRecordMatcher };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || {} : { default: record.component }
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "boolean" ? props : props[name];
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults2, partialOptions) {
  const options = {};
  for (const key in defaults2) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults2[key];
  }
  return options;
}
function isRecordChildOf(record, parent) {
  return parent.children.some((child) => child === record || isRecordChildOf(record, child));
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i2 = 0; i2 < searchParams.length; ++i2) {
    const searchParam = searchParams[i2].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!Array.isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = Array.isArray(value) ? value.map((v2) => v2 && encodeQueryValue(v2)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = Array.isArray(value) ? value.map((v2) => v2 == null ? null : "" + v2) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
function useCallbacks() {
  let handlers = [];
  function add2(handler) {
    handlers.push(handler);
    return () => {
      const i2 = handlers.indexOf(handler);
      if (i2 > -1)
        handlers.splice(i2, 1);
    };
  }
  function reset2() {
    handlers = [];
  }
  return {
    add: add2,
    list: () => handlers,
    reset: reset2
  };
}
function guardToPromiseFn(guard, to, from, record, name) {
  const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = (valid) => {
      if (valid === false)
        reject(createRouterError(4, {
          from,
          to
        }));
      else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function")
          enterCallbackArray.push(valid);
        resolve2();
      }
    };
    const guardReturn = guard.call(record && record.instances[name], to, from, next);
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const options = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => router2.resolve(unref(props.to)));
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index2 = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index2 > -1)
      return index2;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index2;
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e2 = {}) {
    if (guardEvent(e2)) {
      return router2[unref(props.replace) ? "replace" : "push"](unref(props.to)).catch(noop$1);
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : h$1("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e2) {
  if (e2.metaKey || e2.altKey || e2.ctrlKey || e2.shiftKey)
    return;
  if (e2.defaultPrevented)
    return;
  if (e2.button !== void 0 && e2.button !== 0)
    return;
  if (e2.currentTarget && e2.currentTarget.getAttribute) {
    const target = e2.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e2.preventDefault)
    e2.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!Array.isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i2) => value !== outerValue[i2]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const depth = inject(viewDepthKey, 0);
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth]);
    provide(viewDepthKey, depth + 1);
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) {
            to.leaveGuards = from.leaveGuards;
          }
          if (!to.updateGuards.size) {
            to.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[props.name];
      const currentName = props.name;
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[props.name];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h$1(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return normalizeSlot(slots.default, { Component: component, route }) || component;
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if ("path" in rawLocation) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(rawLocation.params)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      hash,
      query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        params: to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
        state: data,
        force,
        replace: replace2
      }), redirectedFrom || targetLocation);
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(from, from, true, false);
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, 2) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(failure2, 2)) {
          return pushWithRedirect(assign(locationAsObject(failure2.to), {
            state: data,
            force,
            replace: replace2
          }), redirectedFrom || toLocation);
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of to.matched) {
        if (record.beforeEnter && !from.matched.includes(record)) {
          if (Array.isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(err, 8) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list())
      guard(to, from, failure);
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      const toLocation = resolve2(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop$1);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(error, 4 | 8)) {
          return error;
        }
        if (isNavigationFailure(error, 2)) {
          pushWithRedirect(error.to, toLocation).then((failure) => {
            if (isNavigationFailure(failure, 4 | 16) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop$1);
          return Promise.reject();
        }
        if (info.delta)
          routerHistory.go(-info.delta, false);
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(toLocation, from, false);
        if (failure) {
          if (info.delta) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(failure, 4 | 16)) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop$1);
    });
  }
  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorHandlers.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve3, reject) => {
      readyHandlers.add([resolve3, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve3, reject]) => err ? reject(err) : resolve3());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app2) {
      const router3 = this;
      app2.component("RouterLink", RouterLink);
      app2.component("RouterView", RouterView);
      app2.config.globalProperties.$router = router3;
      Object.defineProperty(app2.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }
      app2.provide(routerKey, router3);
      app2.provide(routeLocationKey, reactive(reactiveRoute));
      app2.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app2.unmount;
      installedApps.add(app2);
      app2.unmount = function() {
        installedApps.delete(app2);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  return router2;
}
function runGuardQueue(guards) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len2 = Math.max(from.matched.length, to.matched.length);
  for (let i2 = 0; i2 < len2; i2++) {
    const recordFrom = from.matched[i2];
    if (recordFrom) {
      if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i2];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$8 = {};
const _hoisted_1$7 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "25",
  height: "25",
  fill: "currentColor",
  viewBox: "0 0 512 512"
};
const _hoisted_2$7 = /* @__PURE__ */ createBaseVNode("path", { d: "M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z" }, null, -1);
const _hoisted_3$7 = [
  _hoisted_2$7
];
function _sfc_render$2(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$7, _hoisted_3$7);
}
var BarsIcon = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$2]]);
const _sfc_main$7 = {};
const _hoisted_1$6 = {
  xmlns: "http://www.w3.org/2000/svg",
  height: "40px",
  fill: "currentColor",
  viewBox: "0 0 512 512"
};
const _hoisted_2$6 = /* @__PURE__ */ createBaseVNode("path", { d: "M320 464C328.8 464 336 456.8 336 448V416H384V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V416H48V448C48 456.8 55.16 464 64 464H320zM256 160C238.3 160 224 145.7 224 128V48H64C55.16 48 48 55.16 48 64V192H0V64C0 28.65 28.65 0 64 0H229.5C246.5 0 262.7 6.743 274.7 18.75L365.3 109.3C377.3 121.3 384 137.5 384 154.5V192H336V160H256zM88 224C118.9 224 144 249.1 144 280C144 310.9 118.9 336 88 336H80V368C80 376.8 72.84 384 64 384C55.16 384 48 376.8 48 368V240C48 231.2 55.16 224 64 224H88zM112 280C112 266.7 101.3 256 88 256H80V304H88C101.3 304 112 293.3 112 280zM160 240C160 231.2 167.2 224 176 224H200C226.5 224 248 245.5 248 272V336C248 362.5 226.5 384 200 384H176C167.2 384 160 376.8 160 368V240zM192 352H200C208.8 352 216 344.8 216 336V272C216 263.2 208.8 256 200 256H192V352zM336 224C344.8 224 352 231.2 352 240C352 248.8 344.8 256 336 256H304V288H336C344.8 288 352 295.2 352 304C352 312.8 344.8 320 336 320H304V368C304 376.8 296.8 384 288 384C279.2 384 272 376.8 272 368V240C272 231.2 279.2 224 288 224H336z" }, null, -1);
const _hoisted_3$6 = [
  _hoisted_2$6
];
function _sfc_render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$6, _hoisted_3$6);
}
var PDFIcon = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$1]]);
const _sfc_main$6 = {};
const _hoisted_1$5 = {
  xmlns: "http://www.w3.org/2000/svg",
  height: "40px",
  fill: "currentColor",
  viewBox: "0 0 512 512"
};
const _hoisted_2$5 = /* @__PURE__ */ createBaseVNode("path", { d: "M448 352V48C448 21.53 426.5 0 400 0h-320C35.89 0 0 35.88 0 80v352C0 476.1 35.89 512 80 512h344c13.25 0 24-10.75 24-24s-10.75-24-24-24H416v-66.95C434.6 390.4 448 372.8 448 352zM368 464h-288c-17.64 0-32-14.34-32-32s14.36-32 32-32h288V464zM400 352h-320c-11.38 0-22.2 2.375-32 6.688V80c0-17.66 14.36-32 32-32h320V352zM152 160h176C341.3 160 352 149.3 352 136S341.3 112 328 112h-176C138.8 112 128 122.8 128 136S138.8 160 152 160zM152 240h176C341.3 240 352 229.3 352 216S341.3 192 328 192h-176C138.8 192 128 202.8 128 216S138.8 240 152 240z" }, null, -1);
const _hoisted_3$5 = [
  _hoisted_2$5
];
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$5, _hoisted_3$5);
}
var BookIcon = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render]]);
var NavBar_vue_vue_type_style_index_0_scoped_true_lang = "";
const _withScopeId$4 = (n2) => (pushScopeId("data-v-9bbc360a"), n2 = n2(), popScopeId(), n2);
const _hoisted_1$4 = { class: "title" };
const _hoisted_2$4 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("h2", null, "Tools", -1));
const _hoisted_3$4 = { class: "options-container" };
const _hoisted_4$3 = /* @__PURE__ */ createTextVNode(" PDF Merger ");
const _hoisted_5$3 = /* @__PURE__ */ createTextVNode(" Word Count ");
const _sfc_main$5 = {
  props: {
    collapsed: {
      type: Boolean,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["container", { collapsed: __props.collapsed }])
      }, [
        createBaseVNode("div", _hoisted_1$4, [
          _hoisted_2$4,
          createBaseVNode("div", {
            class: "menu-icon",
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("invCollapsed"))
          }, [
            createVNode(BarsIcon)
          ])
        ]),
        createBaseVNode("div", _hoisted_3$4, [
          createVNode(unref(RouterLink), { to: "/pdf-merge" }, {
            default: withCtx(() => [
              createBaseVNode("div", {
                class: normalizeClass(["option", { selected: _ctx.$route.path.slice(1) === "pdf-merge" }])
              }, [
                createVNode(PDFIcon),
                _hoisted_4$3
              ], 2)
            ]),
            _: 1
          }),
          createVNode(unref(RouterLink), { to: "/word-count" }, {
            default: withCtx(() => [
              createBaseVNode("div", {
                class: normalizeClass(["option", { selected: _ctx.$route.path.slice(1) === "word-count" }])
              }, [
                createVNode(BookIcon),
                _hoisted_5$3
              ], 2)
            ]),
            _: 1
          })
        ])
      ], 2);
    };
  }
};
var NavBar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-9bbc360a"]]);
var TopBar_vue_vue_type_style_index_0_scoped_true_lang = "";
const _withScopeId$3 = (n2) => (pushScopeId("data-v-6457d768"), n2 = n2(), popScopeId(), n2);
const _hoisted_1$3 = { class: "container" };
const _hoisted_2$3 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("h1", null, "Web Utilities", -1));
const _hoisted_3$3 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("hr", null, null, -1));
const _sfc_main$4 = {
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createVNode(unref(RouterLink), { to: "/" }, {
          default: withCtx(() => [
            _hoisted_2$3
          ]),
          _: 1
        }),
        _hoisted_3$3
      ]);
    };
  }
};
var TopBar = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-6457d768"]]);
var App_vue_vue_type_style_index_0_lang = "";
const _sfc_main$3 = {
  setup(__props) {
    const navCollapsed = ref(false);
    function invNavCollapsed() {
      navCollapsed.value = !navCollapsed.value;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(NavBar, {
          collapsed: navCollapsed.value,
          onInvCollapsed: invNavCollapsed
        }, null, 8, ["collapsed"]),
        createVNode(TopBar),
        createVNode(unref(RouterView), { navCollapsed: navCollapsed.value }, null, 8, ["navCollapsed"])
      ], 64);
    };
  }
};
var HomeView_vue_vue_type_style_index_0_scoped_true_lang = "";
const _withScopeId$2 = (n2) => (pushScopeId("data-v-7d89f1f6"), n2 = n2(), popScopeId(), n2);
const _hoisted_1$2 = { class: "view-container" };
const _hoisted_2$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("h2", null, "Web Utilities", -1));
const _hoisted_3$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("hr", null, null, -1));
const _hoisted_4$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("h4", null, " This website provides a variety of tools to achieve different tasks. ", -1));
const _hoisted_5$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("h4", null, " Currently supported tools can be seen below and in the side bar on the left! ", -1));
const _hoisted_6$2 = { class: "items" };
const _hoisted_7$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_8$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("p", null, "PDF Merger", -1));
const _hoisted_9$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_10$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("p", null, "Word Count", -1));
const _sfc_main$2 = {
  props: {
    navCollapsed: {
      type: Boolean,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("main", {
        class: normalizeClass({ navCollapsed: __props.navCollapsed })
      }, [
        createBaseVNode("div", _hoisted_1$2, [
          _hoisted_2$2,
          _hoisted_3$2,
          _hoisted_4$2,
          _hoisted_5$2,
          createBaseVNode("div", _hoisted_6$2, [
            createVNode(unref(RouterLink), { to: "/pdf-merge" }, {
              default: withCtx(() => [
                createVNode(PDFIcon),
                _hoisted_7$2,
                _hoisted_8$2
              ]),
              _: 1
            }),
            createVNode(unref(RouterLink), { to: "/word-count" }, {
              default: withCtx(() => [
                createVNode(BookIcon),
                _hoisted_9$2,
                _hoisted_10$2
              ]),
              _: 1
            })
          ])
        ])
      ], 2);
    };
  }
};
var HomeView = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-7d89f1f6"]]);
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n2) {
  if (n2.__esModule)
    return n2;
  var a2 = Object.defineProperty({}, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a2, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a2;
}
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var index_common = {};
var require$$0$1 = /* @__PURE__ */ getAugmentedNamespace(vue_runtime_esmBundler);
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t2[0] & 1)
      throw t2[1];
    return t2[1];
  }, trys: [], ops: [] }, f2, y2, t2, g2;
  return g2 = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
    return this;
  }), g2;
  function verb(n2) {
    return function(v2) {
      return step([n2, v2]);
    };
  }
  function step(op) {
    if (f2)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f2 = 1, y2 && (t2 = op[0] & 2 ? y2["return"] : op[0] ? y2["throw"] || ((t2 = y2["return"]) && t2.call(y2), 0) : y2.next) && !(t2 = t2.call(y2, op[1])).done)
          return t2;
        if (y2 = 0, t2)
          op = [op[0] & 2, t2.value];
        switch (op[0]) {
          case 0:
          case 1:
            t2 = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y2 = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t2 = _.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t2[1]) {
              _.label = t2[1];
              t2 = op;
              break;
            }
            if (t2 && _.label < t2[2]) {
              _.label = t2[2];
              _.ops.push(op);
              break;
            }
            if (t2[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e2) {
        op = [6, e2];
        y2 = 0;
      } finally {
        f2 = t2 = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __read(o2, n2) {
  var m2 = typeof Symbol === "function" && o2[Symbol.iterator];
  if (!m2)
    return o2;
  var i2 = m2.call(o2), r2, ar = [], e2;
  try {
    while ((n2 === void 0 || n2-- > 0) && !(r2 = i2.next()).done)
      ar.push(r2.value);
  } catch (error) {
    e2 = { error };
  } finally {
    try {
      if (r2 && !r2.done && (m2 = i2["return"]))
        m2.call(i2);
    } finally {
      if (e2)
        throw e2.error;
    }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i2 = 0; i2 < arguments.length; i2++)
    ar = ar.concat(__read(arguments[i2]));
  return ar;
}
var COMMON_MIME_TYPES = /* @__PURE__ */ new Map([
  ["avi", "video/avi"],
  ["gif", "image/gif"],
  ["ico", "image/x-icon"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["mkv", "video/x-matroska"],
  ["mov", "video/quicktime"],
  ["mp4", "video/mp4"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["zip", "application/zip"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
]);
function toFileWithPath(file, path) {
  var f2 = withMimeType(file);
  if (typeof f2.path !== "string") {
    var webkitRelativePath = file.webkitRelativePath;
    Object.defineProperty(f2, "path", {
      value: typeof path === "string" ? path : typeof webkitRelativePath === "string" && webkitRelativePath.length > 0 ? webkitRelativePath : file.name,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
  return f2;
}
function withMimeType(file) {
  var name = file.name;
  var hasExtension = name && name.lastIndexOf(".") !== -1;
  if (hasExtension && !file.type) {
    var ext = name.split(".").pop().toLowerCase();
    var type = COMMON_MIME_TYPES.get(ext);
    if (type) {
      Object.defineProperty(file, "type", {
        value: type,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
  }
  return file;
}
var FILES_TO_IGNORE = [
  ".DS_Store",
  "Thumbs.db"
];
function fromEvent(evt) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, isDragEvt(evt) && evt.dataTransfer ? getDataTransferFiles(evt.dataTransfer, evt.type) : getInputFiles(evt)];
    });
  });
}
function isDragEvt(value) {
  return !!value.dataTransfer;
}
function getInputFiles(evt) {
  var files = isInput(evt.target) ? evt.target.files ? fromList(evt.target.files) : [] : [];
  return files.map(function(file) {
    return toFileWithPath(file);
  });
}
function isInput(value) {
  return value !== null;
}
function getDataTransferFiles(dt, type) {
  return __awaiter(this, void 0, void 0, function() {
    var items, files;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          if (!dt.items)
            return [3, 2];
          items = fromList(dt.items).filter(function(item) {
            return item.kind === "file";
          });
          if (type !== "drop") {
            return [2, items];
          }
          return [4, Promise.all(items.map(toFilePromises))];
        case 1:
          files = _a.sent();
          return [2, noIgnoredFiles(flatten(files))];
        case 2:
          return [2, noIgnoredFiles(fromList(dt.files).map(function(file) {
            return toFileWithPath(file);
          }))];
      }
    });
  });
}
function noIgnoredFiles(files) {
  return files.filter(function(file) {
    return FILES_TO_IGNORE.indexOf(file.name) === -1;
  });
}
function fromList(items) {
  var files = [];
  for (var i2 = 0; i2 < items.length; i2++) {
    var file = items[i2];
    files.push(file);
  }
  return files;
}
function toFilePromises(item) {
  if (typeof item.webkitGetAsEntry !== "function") {
    return fromDataTransferItem(item);
  }
  var entry = item.webkitGetAsEntry();
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry);
  }
  return fromDataTransferItem(item);
}
function flatten(items) {
  return items.reduce(function(acc, files) {
    return __spread(acc, Array.isArray(files) ? flatten(files) : [files]);
  }, []);
}
function fromDataTransferItem(item) {
  var file = item.getAsFile();
  if (!file) {
    return Promise.reject(item + " is not a File");
  }
  var fwp = toFileWithPath(file);
  return Promise.resolve(fwp);
}
function fromEntry(entry) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
    });
  });
}
function fromDirEntry(entry) {
  var reader = entry.createReader();
  return new Promise(function(resolve2, reject) {
    var entries = [];
    function readEntries() {
      var _this = this;
      reader.readEntries(function(batch) {
        return __awaiter(_this, void 0, void 0, function() {
          var files, err_1, items;
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (!!batch.length)
                  return [3, 5];
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, Promise.all(entries)];
              case 2:
                files = _a.sent();
                resolve2(files);
                return [3, 4];
              case 3:
                err_1 = _a.sent();
                reject(err_1);
                return [3, 4];
              case 4:
                return [3, 6];
              case 5:
                items = Promise.all(batch.map(fromEntry));
                entries.push(items);
                readEntries();
                _a.label = 6;
              case 6:
                return [2];
            }
          });
        });
      }, function(err) {
        reject(err);
      });
    }
    readEntries();
  });
}
function fromFileEntry(entry) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, new Promise(function(resolve2, reject) {
        entry.file(function(file) {
          var fwp = toFileWithPath(file, entry.fullPath);
          resolve2(fwp);
        }, function(err) {
          reject(err);
        });
      })];
    });
  });
}
var es5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fromEvent
}, Symbol.toStringTag, { value: "Module" }));
var require$$1$1 = /* @__PURE__ */ getAugmentedNamespace(es5);
var es = {};
es.__esModule = true;
es.default = function(file, acceptedFiles) {
  if (file && acceptedFiles) {
    var acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(",");
    var fileName = file.name || "";
    var mimeType = (file.type || "").toLowerCase();
    var baseMimeType = mimeType.replace(/\/.*$/, "");
    return acceptedFilesArray.some(function(type) {
      var validType = type.trim().toLowerCase();
      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType);
      } else if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "");
      }
      return mimeType === validType;
    });
  }
  return true;
};
Object.defineProperty(index_common, "__esModule", { value: true });
var e = require$$0$1, n = require$$1$1;
function t(e2) {
  return e2 && typeof e2 == "object" && "default" in e2 ? e2 : { default: e2 };
}
var r = t(es), o = function() {
  return (o = Object.assign || function(e2) {
    for (var n2, t2 = 1, r2 = arguments.length; t2 < r2; t2++)
      for (var o2 in n2 = arguments[t2])
        Object.prototype.hasOwnProperty.call(n2, o2) && (e2[o2] = n2[o2]);
    return e2;
  }).apply(this, arguments);
};
function i$1(e2, n2) {
  var t2 = {};
  for (var r2 in e2)
    Object.prototype.hasOwnProperty.call(e2, r2) && n2.indexOf(r2) < 0 && (t2[r2] = e2[r2]);
  if (e2 != null && typeof Object.getOwnPropertySymbols == "function") {
    var o2 = 0;
    for (r2 = Object.getOwnPropertySymbols(e2); o2 < r2.length; o2++)
      n2.indexOf(r2[o2]) < 0 && Object.prototype.propertyIsEnumerable.call(e2, r2[o2]) && (t2[r2[o2]] = e2[r2[o2]]);
  }
  return t2;
}
function a(e2, n2, t2, r2) {
  return new (t2 || (t2 = Promise))(function(o2, i2) {
    function a2(e3) {
      try {
        l2(r2.next(e3));
      } catch (e4) {
        i2(e4);
      }
    }
    function u2(e3) {
      try {
        l2(r2.throw(e3));
      } catch (e4) {
        i2(e4);
      }
    }
    function l2(e3) {
      var n3;
      e3.done ? o2(e3.value) : (n3 = e3.value, n3 instanceof t2 ? n3 : new t2(function(e4) {
        e4(n3);
      })).then(a2, u2);
    }
    l2((r2 = r2.apply(e2, n2 || [])).next());
  });
}
function u(e2, n2) {
  var t2, r2, o2, i2, a2 = { label: 0, sent: function() {
    if (1 & o2[0])
      throw o2[1];
    return o2[1];
  }, trys: [], ops: [] };
  return i2 = { next: u2(0), throw: u2(1), return: u2(2) }, typeof Symbol == "function" && (i2[Symbol.iterator] = function() {
    return this;
  }), i2;
  function u2(i3) {
    return function(u3) {
      return function(i4) {
        if (t2)
          throw new TypeError("Generator is already executing.");
        for (; a2; )
          try {
            if (t2 = 1, r2 && (o2 = 2 & i4[0] ? r2.return : i4[0] ? r2.throw || ((o2 = r2.return) && o2.call(r2), 0) : r2.next) && !(o2 = o2.call(r2, i4[1])).done)
              return o2;
            switch (r2 = 0, o2 && (i4 = [2 & i4[0], o2.value]), i4[0]) {
              case 0:
              case 1:
                o2 = i4;
                break;
              case 4:
                return a2.label++, { value: i4[1], done: false };
              case 5:
                a2.label++, r2 = i4[1], i4 = [0];
                continue;
              case 7:
                i4 = a2.ops.pop(), a2.trys.pop();
                continue;
              default:
                if (!(o2 = a2.trys, (o2 = o2.length > 0 && o2[o2.length - 1]) || i4[0] !== 6 && i4[0] !== 2)) {
                  a2 = 0;
                  continue;
                }
                if (i4[0] === 3 && (!o2 || i4[1] > o2[0] && i4[1] < o2[3])) {
                  a2.label = i4[1];
                  break;
                }
                if (i4[0] === 6 && a2.label < o2[1]) {
                  a2.label = o2[1], o2 = i4;
                  break;
                }
                if (o2 && a2.label < o2[2]) {
                  a2.label = o2[2], a2.ops.push(i4);
                  break;
                }
                o2[2] && a2.ops.pop(), a2.trys.pop();
                continue;
            }
            i4 = n2.call(e2, a2);
          } catch (e3) {
            i4 = [6, e3], r2 = 0;
          } finally {
            t2 = o2 = 0;
          }
        if (5 & i4[0])
          throw i4[1];
        return { value: i4[0] ? i4[1] : void 0, done: true };
      }([i3, u3]);
    };
  }
}
function l(e2, n2) {
  for (var t2 = 0, r2 = n2.length, o2 = e2.length; t2 < r2; t2++, o2++)
    e2[o2] = n2[t2];
  return e2;
}
function c(e2) {
  e2.preventDefault();
}
function s(e2) {
  return e2.dataTransfer ? Array.prototype.some.call(e2.dataTransfer.types, function(e3) {
    return e3 === "Files" || e3 === "application/x-moz-file";
  }) : !!e2.target && !!e2.target.files;
}
function f(e2) {
  return typeof e2.isPropagationStopped == "function" ? e2.isPropagationStopped() : e2.cancelBubble !== void 0 && e2.cancelBubble;
}
var v = { code: "too-many-files", message: "Too many files" }, p = function(e2) {
  return e2 = Array.isArray(e2) && e2.length === 1 ? e2[0] : e2, { code: "file-invalid-type", message: "File type must be " + (Array.isArray(e2) ? "one of " + e2.join(", ") : e2) };
};
function g(e2) {
  return e2 != null;
}
function d(e2, n2) {
  var t2 = e2.type === "application/x-moz-file" || r.default(e2, n2);
  return [t2, t2 ? null : p(n2)];
}
var D = function(e2) {
  return { code: "file-too-large", message: "File is larger than " + e2 + " bytes" };
}, y = function(e2) {
  return { code: "file-too-small", message: "File is smaller than " + e2 + " bytes" };
};
function m(e2, n2, t2) {
  if (g(e2.size) && e2.size)
    if (g(n2) && g(t2)) {
      if (e2.size > t2)
        return [false, D(t2)];
      if (e2.size < n2)
        return [false, y(n2)];
    } else {
      if (g(n2) && e2.size < n2)
        return [false, y(n2)];
      if (g(t2) && e2.size > t2)
        return [false, D(t2)];
    }
  return [true, null];
}
function b() {
  for (var e2 = [], n2 = 0; n2 < arguments.length; n2++)
    e2[n2] = arguments[n2];
  return function(n3) {
    for (var t2 = [], r2 = 1; r2 < arguments.length; r2++)
      t2[r2 - 1] = arguments[r2];
    return e2.some(function(e3) {
      return !f(n3) && e3 && e3.apply(void 0, l([n3], t2)), f(n3);
    });
  };
}
var h = { disabled: false, getFilesFromEvent: n.fromEvent, maxSize: 1 / 0, minSize: 0, multiple: true, maxFiles: 0, preventDropOnDocument: true, noClick: false, noKeyboard: false, noDrag: false, noDragEventsBubbling: false };
function F(e2, n2) {
  switch (n2.type) {
    case "focus":
      return o(o({}, e2), { isFocused: true });
    case "blur":
      return o(o({}, e2), { isFocused: false });
    case "openDialog":
      return o(o({}, e2), { isFileDialogActive: true });
    case "closeDialog":
      return o(o({}, e2), { isFileDialogActive: false });
    case "setDraggedFiles":
      var t2 = n2.isDragActive, r2 = n2.draggedFiles;
      return o(o({}, e2), { draggedFiles: r2, isDragActive: t2 });
    case "setFiles":
      return o(o({}, e2), { acceptedFiles: n2.acceptedFiles, fileRejections: n2.fileRejections });
    case "reset":
      return o(o({}, e2), { isFileDialogActive: false, isDragActive: false, draggedFiles: [], acceptedFiles: [], fileRejections: [] });
    default:
      return e2;
  }
}
var useDropzone = index_common.useDropzone = function(n2) {
  n2 === void 0 && (n2 = {});
  var t2 = e.ref(o(o({}, h), n2));
  e.watch(function() {
    return o({}, n2);
  }, function(e2) {
    t2.value = o(o({}, t2.value), e2);
  });
  var r2 = e.ref(), p2 = e.ref(), g2 = function(n3, t3, r3) {
    var o2 = e.reactive(t3), i2 = function(t4) {
      var r4 = n3(e.toRaw(o2), t4);
      Object.keys(r4).forEach(function(e2) {
        o2[e2] = r4[e2];
      });
    };
    return r3 != null && i2(r3), [o2, i2];
  }(F, { isFocused: false, isFileDialogActive: false, isDragActive: false, isDragAccept: false, isDragReject: false, draggedFiles: [], acceptedFiles: [], fileRejections: [] }), D2 = g2[0], y2 = g2[1], w = function() {
    p2.value && (y2({ type: "openDialog" }), p2.value.value = "", p2.value.click());
  }, E = function() {
    var e2 = t2.value.onFileDialogCancel;
    D2.isFileDialogActive && setTimeout(function() {
      if (p2.value) {
        var n3 = p2.value.files;
        n3 && !n3.length && (y2({ type: "closeDialog" }), typeof e2 == "function" && e2());
      }
    }, 300);
  };
  function x(e2) {
    r2.value && ((r2.value.$el || r2.value).isEqualNode(e2.target) && (e2.keyCode !== 32 && e2.keyCode !== 13 || (e2.preventDefault(), w())));
  }
  function O() {
    y2({ type: "focus" });
  }
  function A() {
    y2({ type: "blur" });
  }
  function z() {
    var e2;
    t2.value.noClick || (e2 === void 0 && (e2 = window.navigator.userAgent), function(e3) {
      return e3.includes("MSIE") || e3.includes("Trident/");
    }(e2) || function(e3) {
      return e3.includes("Edge/");
    }(e2) ? setTimeout(w, 0) : w());
  }
  var j = e.ref([]), S = function(e2) {
    r2.value && ((r2.value.$el || r2.value).contains(e2.target) || (e2.preventDefault(), j.value = []));
  };
  function k(e2) {
    t2.value.noDragEventsBubbling && e2.stopPropagation();
  }
  function C(e2) {
    return a(this, void 0, void 0, function() {
      var n3, r3, o2, i2, a2;
      return u(this, function(u2) {
        switch (u2.label) {
          case 0:
            return n3 = t2.value, r3 = n3.getFilesFromEvent, o2 = n3.noDragEventsBubbling, i2 = n3.onDragEnter, e2.preventDefault(), k(e2), j.value = l(l([], j.value), [e2.target]), s(e2) ? r3 ? [4, r3(e2)] : [2] : [3, 2];
          case 1:
            if ((a2 = u2.sent()) || (a2 = []), f(e2) && !o2)
              return [2];
            y2({ draggedFiles: a2, isDragActive: true, type: "setDraggedFiles" }), i2 && i2(e2), u2.label = 2;
          case 2:
            return [2];
        }
      });
    });
  }
  function P(e2) {
    var n3 = t2.value.onDragOver;
    if (e2.preventDefault(), k(e2), e2.dataTransfer)
      try {
        e2.dataTransfer.dropEffect = "copy";
      } catch (e3) {
      }
    return s(e2) && n3 && n3(e2), false;
  }
  function R(e2) {
    e2.preventDefault(), k(e2);
    var n3 = j.value.filter(function(e3) {
      return !!r2.value && (r2.value.$el || r2.value).contains(e3);
    }), o2 = n3.indexOf(e2.target);
    if (o2 !== -1 && n3.splice(o2, 1), j.value = n3, !(n3.length > 0)) {
      y2({ isDragActive: false, type: "setDraggedFiles", draggedFiles: [] });
      var i2 = t2.value.onDragLeave;
      s(e2) && i2 && i2(e2);
    }
  }
  function B(e2) {
    e2.preventDefault(), k(e2), j.value = [];
    var n3 = t2.value, r3 = n3.getFilesFromEvent, o2 = n3.noDragEventsBubbling, i2 = n3.accept, a2 = n3.minSize, u2 = n3.maxSize, l2 = n3.multiple, c2 = n3.maxFiles, p3 = n3.onDrop, g3 = n3.onDropRejected, D3 = n3.onDropAccepted;
    if (s(e2)) {
      if (!r3)
        return;
      Promise.resolve(r3(e2)).then(function(n4) {
        if (!f(e2) || o2) {
          var t3 = [], r4 = [];
          n4.forEach(function(e3) {
            var n5 = d(e3, i2), o3 = n5[0], l3 = n5[1], c3 = m(e3, a2, u2), s2 = c3[0], f2 = c3[1];
            if (o3 && s2)
              t3.push(e3);
            else {
              var v2 = [l3, f2].filter(function(e4) {
                return e4;
              });
              r4.push({ file: e3, errors: v2 });
            }
          }), (!l2 && t3.length > 1 || l2 && c2 >= 1 && t3.length > c2) && (t3.forEach(function(e3) {
            r4.push({ file: e3, errors: [v] });
          }), t3.splice(0)), y2({ acceptedFiles: t3, fileRejections: r4, type: "setFiles" }), p3 && p3(t3, r4, e2), r4.length > 0 && g3 && g3(r4, e2), t3.length > 0 && D3 && D3(t3, e2);
        }
      });
    }
    y2({ type: "reset" });
  }
  e.onMounted(function() {
    window.addEventListener("focus", E, false), t2.value.preventDropOnDocument && (document.addEventListener("dragover", c, false), document.addEventListener("drop", S, false));
  }), e.onUnmounted(function() {
    window.removeEventListener("focus", E, false), t2.value.preventDropOnDocument && (document.removeEventListener("dragover", c), document.removeEventListener("drop", S));
  });
  var L = function(e2) {
    return t2.value.disabled ? null : e2;
  }, T = function(e2) {
    return t2.value.noKeyboard ? null : L(e2);
  }, K = function(e2) {
    return t2.value.noDrag ? null : L(e2);
  }, I = function(e2) {
    e2.stopPropagation();
  }, q = e.computed(function() {
    return D2.draggedFiles ? D2.draggedFiles.length : 0;
  }), M = e.computed(function() {
    return q.value > 0 && function(e2) {
      var n3 = e2.files, t3 = e2.accept, r3 = e2.minSize, o2 = e2.maxSize, i2 = e2.multiple, a2 = e2.maxFiles;
      return !(!i2 && n3.length > 1 || i2 && a2 >= 1 && n3.length > a2) && n3.every(function(e3) {
        var n4 = d(e3, t3)[0], i3 = m(e3, r3, o2)[0];
        return n4 && i3;
      });
    }({ files: D2.draggedFiles, accept: t2.value.accept, minSize: t2.value.minSize, maxSize: t2.value.maxSize, multiple: t2.value.multiple, maxFiles: t2.value.maxFiles });
  }), $ = e.computed(function() {
    return q.value > 0 && !M.value;
  });
  return o(o({}, e.toRefs(D2)), { isDragAccept: M, isDragReject: $, isFocused: e.computed(function() {
    return D2.isFocused && !t2.value.disabled;
  }), getRootProps: function(e2) {
    e2 === void 0 && (e2 = {});
    var n3 = e2.onKeyDown, a2 = e2.onFocus, u2 = e2.onBlur, l2 = e2.onClick, c2 = e2.onDragEnter, s2 = e2.onDragenter, f2 = e2.onDragOver, v2 = e2.onDragover, p3 = e2.onDragLeave, g3 = e2.onDragleave, d2 = e2.onDrop, D3 = i$1(e2, ["onKeyDown", "onFocus", "onBlur", "onClick", "onDragEnter", "onDragenter", "onDragOver", "onDragover", "onDragLeave", "onDragleave", "onDrop"]);
    return o(o({ onKeyDown: T(b(n3, x)), onFocus: T(b(a2, O)), onBlur: T(b(u2, A)), onClick: L(b(l2, z)), onDragenter: K(b(c2, s2, C)), onDragover: K(b(f2, v2, P)), onDragleave: K(b(p3, g3, R)), onDrop: K(b(d2, B)), ref: r2 }, t2.value.disabled || t2.value.noKeyboard ? {} : { tabIndex: 0 }), D3);
  }, getInputProps: function(e2) {
    e2 === void 0 && (e2 = {});
    var n3 = e2.onChange, r3 = e2.onClick, a2 = i$1(e2, ["onChange", "onClick"]), u2 = { accept: t2.value.accept, multiple: t2.value.multiple, style: "display: none", type: "file", onChange: L(b(n3, B)), onClick: L(b(r3, I)), autoComplete: "off", tabIndex: -1, ref: p2 };
    return o(o({}, u2), a2);
  }, rootRef: r2, inputRef: p2, open: L(w) });
};
var vuedraggable_umd = { exports: {} };
/**!
 * Sortable 1.14.0
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i2;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
      key = sourceSymbolKeys[i2];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _unsupportedIterableToArray(o2, minLen) {
  if (!o2)
    return;
  if (typeof o2 === "string")
    return _arrayLikeToArray(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor)
    n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set")
    return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2))
    return _arrayLikeToArray(o2, minLen);
}
function _arrayLikeToArray(arr, len2) {
  if (len2 == null || len2 > arr.length)
    len2 = arr.length;
  for (var i2 = 0, arr2 = new Array(len2); i2 < len2; i2++)
    arr2[i2] = arr[i2];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var version = "1.14.0";
function userAgent(pattern) {
  if (typeof window !== "undefined" && window.navigator) {
    return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
  }
}
var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
var Edge = userAgent(/Edge/i);
var FireFox = userAgent(/firefox/i);
var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
var IOS = userAgent(/iP(ad|od|hone)/i);
var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
var captureMode = {
  capture: false,
  passive: false
};
function on(el, event, fn) {
  el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
  el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches(el, selector) {
  if (!selector)
    return;
  selector[0] === ">" && (selector = selector.substring(1));
  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }
  return false;
}
function getParentOrHost(el) {
  return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
}
function closest(el, selector, ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx)
        break;
    } while (el = getParentOrHost(el));
  }
  return null;
}
var R_SPACE = /\s+/g;
function toggleClass(el, name, state) {
  if (el && name) {
    if (el.classList) {
      el.classList[state ? "add" : "remove"](name);
    } else {
      var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
      el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
    }
  }
}
function css(el, prop, val) {
  var style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, "");
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf("webkit") === -1) {
        prop = "-webkit-" + prop;
      }
      style[prop] = val + (typeof val === "string" ? "" : "px");
    }
  }
}
function matrix(el, selfOnly) {
  var appliedTransforms = "";
  if (typeof el === "string") {
    appliedTransforms = el;
  } else {
    do {
      var transform = css(el, "transform");
      if (transform && transform !== "none") {
        appliedTransforms = transform + " " + appliedTransforms;
      }
    } while (!selfOnly && (el = el.parentNode));
  }
  var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator) {
  if (ctx) {
    var list = ctx.getElementsByTagName(tagName), i2 = 0, n2 = list.length;
    if (iterator) {
      for (; i2 < n2; i2++) {
        iterator(list[i2], i2);
      }
    }
    return list;
  }
  return [];
}
function getWindowScrollingElement() {
  var scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    return scrollingElement;
  } else {
    return document.documentElement;
  }
}
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
  if (!el.getBoundingClientRect && el !== window)
    return;
  var elRect, top, left, bottom, right, height, width;
  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }
  if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
    container = container || el.parentNode;
    if (!IE11OrLess) {
      do {
        if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
          var containerRect = container.getBoundingClientRect();
          top -= containerRect.top + parseInt(css(container, "border-top-width"));
          left -= containerRect.left + parseInt(css(container, "border-left-width"));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
      } while (container = container.parentNode);
    }
  }
  if (undoScale && el !== window) {
    var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
    if (elMatrix) {
      top /= scaleY;
      left /= scaleX;
      width /= scaleX;
      height /= scaleY;
      bottom = top + height;
      right = left + width;
    }
  }
  return {
    top,
    left,
    bottom,
    right,
    width,
    height
  };
}
function isScrolledPast(el, elSide, parentSide) {
  var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
  while (parent) {
    var parentSideVal = getRect(parent)[parentSide], visible = void 0;
    if (parentSide === "top" || parentSide === "left") {
      visible = elSideVal >= parentSideVal;
    } else {
      visible = elSideVal <= parentSideVal;
    }
    if (!visible)
      return parent;
    if (parent === getWindowScrollingElement())
      break;
    parent = getParentAutoScrollElement(parent, false);
  }
  return false;
}
function getChild(el, childNum, options, includeDragEl) {
  var currentChild = 0, i2 = 0, children = el.children;
  while (i2 < children.length) {
    if (children[i2].style.display !== "none" && children[i2] !== Sortable.ghost && (includeDragEl || children[i2] !== Sortable.dragged) && closest(children[i2], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i2];
      }
      currentChild++;
    }
    i2++;
  }
  return null;
}
function lastChild(el, selector) {
  var last = el.lastElementChild;
  while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
    last = last.previousElementSibling;
  }
  return last || null;
}
function index(el, selector) {
  var index2 = 0;
  if (!el || !el.parentNode) {
    return -1;
  }
  while (el = el.previousElementSibling) {
    if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
      index2++;
    }
  }
  return index2;
}
function getRelativeScrollOffset(el) {
  var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
  if (el) {
    do {
      var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
      offsetLeft += el.scrollLeft * scaleX;
      offsetTop += el.scrollTop * scaleY;
    } while (el !== winScroller && (el = el.parentNode));
  }
  return [offsetLeft, offsetTop];
}
function indexOfObject(arr, obj) {
  for (var i2 in arr) {
    if (!arr.hasOwnProperty(i2))
      continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i2][key])
        return Number(i2);
    }
  }
  return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
  if (!el || !el.getBoundingClientRect)
    return getWindowScrollingElement();
  var elem = el;
  var gotSelf = false;
  do {
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      var elemCSS = css(elem);
      if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
        if (!elem.getBoundingClientRect || elem === document.body)
          return getWindowScrollingElement();
        if (gotSelf || includeSelf)
          return elem;
        gotSelf = true;
      }
    }
  } while (elem = elem.parentNode);
  return getWindowScrollingElement();
}
function extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }
  return dst;
}
function isRectEqual(rect1, rect2) {
  return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
var _throttleTimeout;
function throttle(callback, ms) {
  return function() {
    if (!_throttleTimeout) {
      var args = arguments, _this = this;
      if (args.length === 1) {
        callback.call(_this, args[0]);
      } else {
        callback.apply(_this, args);
      }
      _throttleTimeout = setTimeout(function() {
        _throttleTimeout = void 0;
      }, ms);
    }
  };
}
function cancelThrottle() {
  clearTimeout(_throttleTimeout);
  _throttleTimeout = void 0;
}
function scrollBy(el, x, y2) {
  el.scrollLeft += x;
  el.scrollTop += y2;
}
function clone(el) {
  var Polymer = window.Polymer;
  var $ = window.jQuery || window.Zepto;
  if (Polymer && Polymer.dom) {
    return Polymer.dom(el).cloneNode(true);
  } else if ($) {
    return $(el).clone(true)[0];
  } else {
    return el.cloneNode(true);
  }
}
function setRect(el, rect) {
  css(el, "position", "absolute");
  css(el, "top", rect.top);
  css(el, "left", rect.left);
  css(el, "width", rect.width);
  css(el, "height", rect.height);
}
function unsetRect(el) {
  css(el, "position", "");
  css(el, "top", "");
  css(el, "left", "");
  css(el, "width", "");
  css(el, "height", "");
}
var expando = "Sortable" + new Date().getTime();
function AnimationStateManager() {
  var animationStates = [], animationCallbackId;
  return {
    captureAnimationState: function captureAnimationState() {
      animationStates = [];
      if (!this.options.animation)
        return;
      var children = [].slice.call(this.el.children);
      children.forEach(function(child) {
        if (css(child, "display") === "none" || child === Sortable.ghost)
          return;
        animationStates.push({
          target: child,
          rect: getRect(child)
        });
        var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
        if (child.thisAnimationDuration) {
          var childMatrix = matrix(child, true);
          if (childMatrix) {
            fromRect.top -= childMatrix.f;
            fromRect.left -= childMatrix.e;
          }
        }
        child.fromRect = fromRect;
      });
    },
    addAnimationState: function addAnimationState(state) {
      animationStates.push(state);
    },
    removeAnimationState: function removeAnimationState(target) {
      animationStates.splice(indexOfObject(animationStates, {
        target
      }), 1);
    },
    animateAll: function animateAll(callback) {
      var _this = this;
      if (!this.options.animation) {
        clearTimeout(animationCallbackId);
        if (typeof callback === "function")
          callback();
        return;
      }
      var animating = false, animationTime = 0;
      animationStates.forEach(function(state) {
        var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
        if (targetMatrix) {
          toRect.top -= targetMatrix.f;
          toRect.left -= targetMatrix.e;
        }
        target.toRect = toRect;
        if (target.thisAnimationDuration) {
          if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
            time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
          }
        }
        if (!isRectEqual(toRect, fromRect)) {
          target.prevFromRect = fromRect;
          target.prevToRect = toRect;
          if (!time) {
            time = _this.options.animation;
          }
          _this.animate(target, animatingRect, toRect, time);
        }
        if (time) {
          animating = true;
          animationTime = Math.max(animationTime, time);
          clearTimeout(target.animationResetTimer);
          target.animationResetTimer = setTimeout(function() {
            target.animationTime = 0;
            target.prevFromRect = null;
            target.fromRect = null;
            target.prevToRect = null;
            target.thisAnimationDuration = null;
          }, time);
          target.thisAnimationDuration = time;
        }
      });
      clearTimeout(animationCallbackId);
      if (!animating) {
        if (typeof callback === "function")
          callback();
      } else {
        animationCallbackId = setTimeout(function() {
          if (typeof callback === "function")
            callback();
        }, animationTime);
      }
      animationStates = [];
    },
    animate: function animate(target, currentRect, toRect, duration) {
      if (duration) {
        css(target, "transition", "");
        css(target, "transform", "");
        var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
        target.animatingX = !!translateX;
        target.animatingY = !!translateY;
        css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
        this.forRepaintDummy = repaint(target);
        css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
        css(target, "transform", "translate3d(0,0,0)");
        typeof target.animated === "number" && clearTimeout(target.animated);
        target.animated = setTimeout(function() {
          css(target, "transition", "");
          css(target, "transform", "");
          target.animated = false;
          target.animatingX = false;
          target.animatingY = false;
        }, duration);
      }
    }
  };
}
function repaint(target) {
  return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
  return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}
var plugins = [];
var defaults = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    for (var option2 in defaults) {
      if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
        plugin[option2] = defaults[option2];
      }
    }
    plugins.forEach(function(p2) {
      if (p2.pluginName === plugin.pluginName) {
        throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
      }
    });
    plugins.push(plugin);
  },
  pluginEvent: function pluginEvent2(eventName, sortable, evt) {
    var _this = this;
    this.eventCanceled = false;
    evt.cancel = function() {
      _this.eventCanceled = true;
    };
    var eventNameGlobal = eventName + "Global";
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName])
        return;
      if (sortable[plugin.pluginName][eventNameGlobal]) {
        sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
          sortable
        }, evt));
      }
      if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
        sortable[plugin.pluginName][eventName](_objectSpread2({
          sortable
        }, evt));
      }
    });
  },
  initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
    plugins.forEach(function(plugin) {
      var pluginName = plugin.pluginName;
      if (!sortable.options[pluginName] && !plugin.initializeByDefault)
        return;
      var initialized = new plugin(sortable, el, sortable.options);
      initialized.sortable = sortable;
      initialized.options = sortable.options;
      sortable[pluginName] = initialized;
      _extends(defaults2, initialized.defaults);
    });
    for (var option2 in sortable.options) {
      if (!sortable.options.hasOwnProperty(option2))
        continue;
      var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
      if (typeof modified !== "undefined") {
        sortable.options[option2] = modified;
      }
    }
  },
  getEventProperties: function getEventProperties(name, sortable) {
    var eventProperties = {};
    plugins.forEach(function(plugin) {
      if (typeof plugin.eventProperties !== "function")
        return;
      _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
    });
    return eventProperties;
  },
  modifyOption: function modifyOption(sortable, name, value) {
    var modifiedValue;
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName])
        return;
      if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
        modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
      }
    });
    return modifiedValue;
  }
};
function dispatchEvent(_ref) {
  var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
  sortable = sortable || rootEl2 && rootEl2[expando];
  if (!sortable)
    return;
  var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent(name, {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent(name, true, true);
  }
  evt.to = toEl || rootEl2;
  evt.from = fromEl || rootEl2;
  evt.item = targetEl || rootEl2;
  evt.clone = cloneEl2;
  evt.oldIndex = oldIndex2;
  evt.newIndex = newIndex2;
  evt.oldDraggableIndex = oldDraggableIndex2;
  evt.newDraggableIndex = newDraggableIndex2;
  evt.originalEvent = originalEvent;
  evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
  var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
  for (var option2 in allEventProperties) {
    evt[option2] = allEventProperties[option2];
  }
  if (rootEl2) {
    rootEl2.dispatchEvent(evt);
  }
  if (options[onName]) {
    options[onName].call(sortable, evt);
  }
}
var _excluded = ["evt"];
var pluginEvent = function pluginEvent3(eventName, sortable) {
  var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
  PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
    dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    dragStarted: moved,
    putSortable,
    activeSortable: Sortable.active,
    originalEvent,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex,
    hideGhostForTarget: _hideGhostForTarget,
    unhideGhostForTarget: _unhideGhostForTarget,
    cloneNowHidden: function cloneNowHidden() {
      cloneHidden = true;
    },
    cloneNowShown: function cloneNowShown() {
      cloneHidden = false;
    },
    dispatchSortableEvent: function dispatchSortableEvent(name) {
      _dispatchEvent({
        sortable,
        name,
        originalEvent
      });
    }
  }, data));
};
function _dispatchEvent(info) {
  dispatchEvent(_objectSpread2({
    putSortable,
    cloneEl,
    targetEl: dragEl,
    rootEl,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex
  }, info));
}
var dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted = false, ignoreNextClick = false, sortables = [], tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh = false, isCircumstantialInvert = false, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
  if (!documentExists)
    return;
  if (IE11OrLess) {
    return false;
  }
  var el = document.createElement("x");
  el.style.cssText = "pointer-events:auto";
  return el.style.pointerEvents === "auto";
}(), _detectDirection = function _detectDirection2(el, options) {
  var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
  if (elCSS.display === "flex") {
    return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  }
  if (elCSS.display === "grid") {
    return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  }
  if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
    var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
    return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
  }
  return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
}, _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
  var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
  return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
}, _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y2) {
  var ret;
  sortables.some(function(sortable) {
    var threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold || lastChild(sortable))
      return;
    var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y2 >= rect.top - threshold && y2 <= rect.bottom + threshold;
    if (insideHorizontally && insideVertically) {
      return ret = sortable;
    }
  });
  return ret;
}, _prepareGroup = function _prepareGroup2(options) {
  function toFn(value, pull) {
    return function(to, from, dragEl2, evt) {
      var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
      if (value == null && (pull || sameGroup)) {
        return true;
      } else if (value == null || value === false) {
        return false;
      } else if (pull && value === "clone") {
        return value;
      } else if (typeof value === "function") {
        return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
      } else {
        var otherGroup = (pull ? to : from).options.group.name;
        return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
      }
    };
  }
  var group = {};
  var originalGroup = options.group;
  if (!originalGroup || _typeof(originalGroup) != "object") {
    originalGroup = {
      name: originalGroup
    };
  }
  group.name = originalGroup.name;
  group.checkPull = toFn(originalGroup.pull, true);
  group.checkPut = toFn(originalGroup.put);
  group.revertClone = originalGroup.revertClone;
  options.group = group;
}, _hideGhostForTarget = function _hideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "none");
  }
}, _unhideGhostForTarget = function _unhideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "");
  }
};
if (documentExists) {
  document.addEventListener("click", function(evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false;
    }
  }, true);
}
var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
    if (nearest) {
      var event = {};
      for (var i2 in evt) {
        if (evt.hasOwnProperty(i2)) {
          event[i2] = evt[i2];
        }
      }
      event.target = event.rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      nearest[expando]._onDragOver(event);
    }
  }
};
var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
  if (dragEl) {
    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
  }
};
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
  }
  this.el = el;
  this.options = options = _extends({}, options);
  el[expando] = this;
  var defaults2 = {
    group: null,
    sort: true,
    disabled: false,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    invertSwap: false,
    invertedSwapThreshold: null,
    removeCloneOnHide: true,
    direction: function direction() {
      return _detectDirection(el, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: true,
    animation: 0,
    easing: null,
    setData: function setData(dataTransfer, dragEl2) {
      dataTransfer.setData("Text", dragEl2.textContent);
    },
    dropBubble: false,
    dragoverBubble: false,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: false,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: false,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
    emptyInsertThreshold: 5
  };
  PluginManager.initializePlugins(this, el, defaults2);
  for (var name in defaults2) {
    !(name in options) && (options[name] = defaults2[name]);
  }
  _prepareGroup(options);
  for (var fn in this) {
    if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
      this[fn] = this[fn].bind(this);
    }
  }
  this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  if (this.nativeDraggable) {
    this.options.touchStartThreshold = 1;
  }
  if (options.supportPointer) {
    on(el, "pointerdown", this._onTapStart);
  } else {
    on(el, "mousedown", this._onTapStart);
    on(el, "touchstart", this._onTapStart);
  }
  if (this.nativeDraggable) {
    on(el, "dragover", this);
    on(el, "dragenter", this);
  }
  sortables.push(this.el);
  options.store && options.store.get && this.sort(options.store.get(this) || []);
  _extends(this, AnimationStateManager());
}
Sortable.prototype = {
  constructor: Sortable,
  _isOutsideThisEl: function _isOutsideThisEl(target) {
    if (!this.el.contains(target) && target !== this.el) {
      lastTarget = null;
    }
  },
  _getDirection: function _getDirection(evt, target) {
    return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
  },
  _onTapStart: function _onTapStart(evt) {
    if (!evt.cancelable)
      return;
    var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
    _saveInputCheckedState(el);
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
      return;
    }
    if (originalTarget.isContentEditable) {
      return;
    }
    if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
      return;
    }
    target = closest(target, options.draggable, el, false);
    if (target && target.animated) {
      return;
    }
    if (lastDownEl === target) {
      return;
    }
    oldIndex = index(target);
    oldDraggableIndex = index(target, options.draggable);
    if (typeof filter === "function") {
      if (filter.call(this, evt, target, this)) {
        _dispatchEvent({
          sortable: _this,
          rootEl: originalTarget,
          name: "filter",
          targetEl: target,
          toEl: el,
          fromEl: el
        });
        pluginEvent("filter", _this, {
          evt
        });
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    } else if (filter) {
      filter = filter.split(",").some(function(criteria) {
        criteria = closest(originalTarget, criteria.trim(), el, false);
        if (criteria) {
          _dispatchEvent({
            sortable: _this,
            rootEl: criteria,
            name: "filter",
            targetEl: target,
            fromEl: el,
            toEl: el
          });
          pluginEvent("filter", _this, {
            evt
          });
          return true;
        }
      });
      if (filter) {
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    }
    if (options.handle && !closest(originalTarget, options.handle, el, false)) {
      return;
    }
    this._prepareDragStart(evt, touch, target);
  },
  _prepareDragStart: function _prepareDragStart(evt, touch, target) {
    var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
    if (target && !dragEl && target.parentNode === el) {
      var dragRect = getRect(target);
      rootEl = el;
      dragEl = target;
      parentEl = dragEl.parentNode;
      nextEl = dragEl.nextSibling;
      lastDownEl = target;
      activeGroup = options.group;
      Sortable.dragged = dragEl;
      tapEvt = {
        target: dragEl,
        clientX: (touch || evt).clientX,
        clientY: (touch || evt).clientY
      };
      tapDistanceLeft = tapEvt.clientX - dragRect.left;
      tapDistanceTop = tapEvt.clientY - dragRect.top;
      this._lastX = (touch || evt).clientX;
      this._lastY = (touch || evt).clientY;
      dragEl.style["will-change"] = "all";
      dragStartFn = function dragStartFn2() {
        pluginEvent("delayEnded", _this, {
          evt
        });
        if (Sortable.eventCanceled) {
          _this._onDrop();
          return;
        }
        _this._disableDelayedDragEvents();
        if (!FireFox && _this.nativeDraggable) {
          dragEl.draggable = true;
        }
        _this._triggerDragStart(evt, touch);
        _dispatchEvent({
          sortable: _this,
          name: "choose",
          originalEvent: evt
        });
        toggleClass(dragEl, options.chosenClass, true);
      };
      options.ignore.split(",").forEach(function(criteria) {
        find(dragEl, criteria.trim(), _disableDraggable);
      });
      on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mouseup", _this._onDrop);
      on(ownerDocument, "touchend", _this._onDrop);
      on(ownerDocument, "touchcancel", _this._onDrop);
      if (FireFox && this.nativeDraggable) {
        this.options.touchStartThreshold = 4;
        dragEl.draggable = true;
      }
      pluginEvent("delayStart", this, {
        evt
      });
      if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        on(ownerDocument, "mouseup", _this._disableDelayedDrag);
        on(ownerDocument, "touchend", _this._disableDelayedDrag);
        on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
        on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
        on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
        options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
      } else {
        dragStartFn();
      }
    }
  },
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e2) {
    var touch = e2.touches ? e2.touches[0] : e2;
    if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
      this._disableDelayedDrag();
    }
  },
  _disableDelayedDrag: function _disableDelayedDrag() {
    dragEl && _disableDraggable(dragEl);
    clearTimeout(this._dragStartTimer);
    this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function _disableDelayedDragEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._disableDelayedDrag);
    off(ownerDocument, "touchend", this._disableDelayedDrag);
    off(ownerDocument, "touchcancel", this._disableDelayedDrag);
    off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function _triggerDragStart(evt, touch) {
    touch = touch || evt.pointerType == "touch" && evt;
    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(document, "pointermove", this._onTouchMove);
      } else if (touch) {
        on(document, "touchmove", this._onTouchMove);
      } else {
        on(document, "mousemove", this._onTouchMove);
      }
    } else {
      on(dragEl, "dragend", this);
      on(rootEl, "dragstart", this._onDragStart);
    }
    try {
      if (document.selection) {
        _nextTick(function() {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (err) {
    }
  },
  _dragStarted: function _dragStarted(fallback, evt) {
    awaitingDragStarted = false;
    if (rootEl && dragEl) {
      pluginEvent("dragStarted", this, {
        evt
      });
      if (this.nativeDraggable) {
        on(document, "dragover", _checkOutsideTargetEl);
      }
      var options = this.options;
      !fallback && toggleClass(dragEl, options.dragClass, false);
      toggleClass(dragEl, options.ghostClass, true);
      Sortable.active = this;
      fallback && this._appendGhost();
      _dispatchEvent({
        sortable: this,
        name: "start",
        originalEvent: evt
      });
    } else {
      this._nulling();
    }
  },
  _emulateDragOver: function _emulateDragOver() {
    if (touchEvt) {
      this._lastX = touchEvt.clientX;
      this._lastY = touchEvt.clientY;
      _hideGhostForTarget();
      var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
      var parent = target;
      while (target && target.shadowRoot) {
        target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        if (target === parent)
          break;
        parent = target;
      }
      dragEl.parentNode[expando]._isOutsideThisEl(target);
      if (parent) {
        do {
          if (parent[expando]) {
            var inserted = void 0;
            inserted = parent[expando]._onDragOver({
              clientX: touchEvt.clientX,
              clientY: touchEvt.clientY,
              target,
              rootEl: parent
            });
            if (inserted && !this.options.dragoverBubble) {
              break;
            }
          }
          target = parent;
        } while (parent = parent.parentNode);
      }
      _unhideGhostForTarget();
    }
  },
  _onTouchMove: function _onTouchMove(evt) {
    if (tapEvt) {
      var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
      if (!Sortable.active && !awaitingDragStarted) {
        if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
          return;
        }
        this._onDragStart(evt, true);
      }
      if (ghostEl) {
        if (ghostMatrix) {
          ghostMatrix.e += dx - (lastDx || 0);
          ghostMatrix.f += dy - (lastDy || 0);
        } else {
          ghostMatrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: dx,
            f: dy
          };
        }
        var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
        css(ghostEl, "webkitTransform", cssMatrix);
        css(ghostEl, "mozTransform", cssMatrix);
        css(ghostEl, "msTransform", cssMatrix);
        css(ghostEl, "transform", cssMatrix);
        lastDx = dx;
        lastDy = dy;
        touchEvt = touch;
      }
      evt.cancelable && evt.preventDefault();
    }
  },
  _appendGhost: function _appendGhost() {
    if (!ghostEl) {
      var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
      if (PositionGhostAbsolutely) {
        ghostRelativeParent = container;
        while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
          ghostRelativeParent = ghostRelativeParent.parentNode;
        }
        if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
          if (ghostRelativeParent === document)
            ghostRelativeParent = getWindowScrollingElement();
          rect.top += ghostRelativeParent.scrollTop;
          rect.left += ghostRelativeParent.scrollLeft;
        } else {
          ghostRelativeParent = getWindowScrollingElement();
        }
        ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
      }
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, false);
      toggleClass(ghostEl, options.fallbackClass, true);
      toggleClass(ghostEl, options.dragClass, true);
      css(ghostEl, "transition", "");
      css(ghostEl, "transform", "");
      css(ghostEl, "box-sizing", "border-box");
      css(ghostEl, "margin", 0);
      css(ghostEl, "top", rect.top);
      css(ghostEl, "left", rect.left);
      css(ghostEl, "width", rect.width);
      css(ghostEl, "height", rect.height);
      css(ghostEl, "opacity", "0.8");
      css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
      css(ghostEl, "zIndex", "100000");
      css(ghostEl, "pointerEvents", "none");
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
    }
  },
  _onDragStart: function _onDragStart(evt, fallback) {
    var _this = this;
    var dataTransfer = evt.dataTransfer;
    var options = _this.options;
    pluginEvent("dragStart", this, {
      evt
    });
    if (Sortable.eventCanceled) {
      this._onDrop();
      return;
    }
    pluginEvent("setupClone", this);
    if (!Sortable.eventCanceled) {
      cloneEl = clone(dragEl);
      cloneEl.draggable = false;
      cloneEl.style["will-change"] = "";
      this._hideClone();
      toggleClass(cloneEl, this.options.chosenClass, false);
      Sortable.clone = cloneEl;
    }
    _this.cloneId = _nextTick(function() {
      pluginEvent("clone", _this);
      if (Sortable.eventCanceled)
        return;
      if (!_this.options.removeCloneOnHide) {
        rootEl.insertBefore(cloneEl, dragEl);
      }
      _this._hideClone();
      _dispatchEvent({
        sortable: _this,
        name: "clone"
      });
    });
    !fallback && toggleClass(dragEl, options.dragClass, true);
    if (fallback) {
      ignoreNextClick = true;
      _this._loopId = setInterval(_this._emulateDragOver, 50);
    } else {
      off(document, "mouseup", _this._onDrop);
      off(document, "touchend", _this._onDrop);
      off(document, "touchcancel", _this._onDrop);
      if (dataTransfer) {
        dataTransfer.effectAllowed = "move";
        options.setData && options.setData.call(_this, dataTransfer, dragEl);
      }
      on(document, "drop", _this);
      css(dragEl, "transform", "translateZ(0)");
    }
    awaitingDragStarted = true;
    _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
    on(document, "selectstart", _this);
    moved = true;
    if (Safari) {
      css(document.body, "user-select", "none");
    }
  },
  _onDragOver: function _onDragOver(evt) {
    var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
    if (_silent)
      return;
    function dragOverEvent(name, extra) {
      pluginEvent(name, _this, _objectSpread2({
        evt,
        isOwner,
        axis: vertical ? "vertical" : "horizontal",
        revert,
        dragRect,
        targetRect,
        canSort,
        fromSortable,
        target,
        completed,
        onMove: function onMove(target2, after2) {
          return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
        },
        changed
      }, extra));
    }
    function capture() {
      dragOverEvent("dragOverAnimationCapture");
      _this.captureAnimationState();
      if (_this !== fromSortable) {
        fromSortable.captureAnimationState();
      }
    }
    function completed(insertion) {
      dragOverEvent("dragOverCompleted", {
        insertion
      });
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        } else {
          activeSortable._showClone(_this);
        }
        if (_this !== fromSortable) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
          toggleClass(dragEl, options.ghostClass, true);
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this;
        } else if (_this === Sortable.active && putSortable) {
          putSortable = null;
        }
        if (fromSortable === _this) {
          _this._ignoreWhileAnimating = target;
        }
        _this.animateAll(function() {
          dragOverEvent("dragOverAnimationComplete");
          _this._ignoreWhileAnimating = null;
        });
        if (_this !== fromSortable) {
          fromSortable.animateAll();
          fromSortable._ignoreWhileAnimating = null;
        }
      }
      if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
        lastTarget = null;
      }
      if (!options.dragoverBubble && !evt.rootEl && target !== document) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        !insertion && nearestEmptyInsertDetectEvent(evt);
      }
      !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
      return completedFired = true;
    }
    function changed() {
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      _dispatchEvent({
        sortable: _this,
        name: "change",
        toEl: el,
        newIndex,
        newDraggableIndex,
        originalEvent: evt
      });
    }
    if (evt.preventDefault !== void 0) {
      evt.cancelable && evt.preventDefault();
    }
    target = closest(target, options.draggable, el, true);
    dragOverEvent("dragOver");
    if (Sortable.eventCanceled)
      return completedFired;
    if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
      return completed(false);
    }
    ignoreNextClick = false;
    if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
      vertical = this._getDirection(evt, target) === "vertical";
      dragRect = getRect(dragEl);
      dragOverEvent("dragOverValid");
      if (Sortable.eventCanceled)
        return completedFired;
      if (revert) {
        parentEl = rootEl;
        capture();
        this._hideClone();
        dragOverEvent("revert");
        if (!Sortable.eventCanceled) {
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl);
          } else {
            rootEl.appendChild(dragEl);
          }
        }
        return completed(true);
      }
      var elLastChild = lastChild(el, options.draggable);
      if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
        if (elLastChild === dragEl) {
          return completed(false);
        }
        if (elLastChild && el === evt.target) {
          target = elLastChild;
        }
        if (target) {
          targetRect = getRect(target);
        }
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
          capture();
          el.appendChild(dragEl);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
        var firstChild = getChild(el, 0, options, true);
        if (firstChild === dragEl) {
          return completed(false);
        }
        target = firstChild;
        targetRect = getRect(target);
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
          capture();
          el.insertBefore(dragEl, firstChild);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (target.parentNode === el) {
        targetRect = getRect(target);
        var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
        if (lastTarget !== target) {
          targetBeforeFirstSwap = targetRect[side1];
          pastFirstInvertThresh = false;
          isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
        }
        direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
        var sibling;
        if (direction !== 0) {
          var dragIndex = index(dragEl);
          do {
            dragIndex -= direction;
            sibling = parentEl.children[dragIndex];
          } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
        }
        if (direction === 0 || sibling === target) {
          return completed(false);
        }
        lastTarget = target;
        lastDirection = direction;
        var nextSibling = target.nextElementSibling, after = false;
        after = direction === 1;
        var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
        if (moveVector !== false) {
          if (moveVector === 1 || moveVector === -1) {
            after = moveVector === 1;
          }
          _silent = true;
          setTimeout(_unsilent, 30);
          capture();
          if (after && !nextSibling) {
            el.appendChild(dragEl);
          } else {
            target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
          }
          if (scrolledPastTop) {
            scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
          }
          parentEl = dragEl.parentNode;
          if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
            targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
          }
          changed();
          return completed(true);
        }
      }
      if (el.contains(dragEl)) {
        return completed(false);
      }
    }
    return false;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function _offMoveEvents() {
    off(document, "mousemove", this._onTouchMove);
    off(document, "touchmove", this._onTouchMove);
    off(document, "pointermove", this._onTouchMove);
    off(document, "dragover", nearestEmptyInsertDetectEvent);
    off(document, "mousemove", nearestEmptyInsertDetectEvent);
    off(document, "touchmove", nearestEmptyInsertDetectEvent);
  },
  _offUpEvents: function _offUpEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._onDrop);
    off(ownerDocument, "touchend", this._onDrop);
    off(ownerDocument, "pointerup", this._onDrop);
    off(ownerDocument, "touchcancel", this._onDrop);
    off(document, "selectstart", this);
  },
  _onDrop: function _onDrop(evt) {
    var el = this.el, options = this.options;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    pluginEvent("drop", this, {
      evt
    });
    parentEl = dragEl && dragEl.parentNode;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    if (Sortable.eventCanceled) {
      this._nulling();
      return;
    }
    awaitingDragStarted = false;
    isCircumstantialInvert = false;
    pastFirstInvertThresh = false;
    clearInterval(this._loopId);
    clearTimeout(this._dragStartTimer);
    _cancelNextTick(this.cloneId);
    _cancelNextTick(this._dragStartId);
    if (this.nativeDraggable) {
      off(document, "drop", this);
      off(el, "dragstart", this._onDragStart);
    }
    this._offMoveEvents();
    this._offUpEvents();
    if (Safari) {
      css(document.body, "user-select", "");
    }
    css(dragEl, "transform", "");
    if (evt) {
      if (moved) {
        evt.cancelable && evt.preventDefault();
        !options.dropBubble && evt.stopPropagation();
      }
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      if (dragEl) {
        if (this.nativeDraggable) {
          off(dragEl, "dragend", this);
        }
        _disableDraggable(dragEl);
        dragEl.style["will-change"] = "";
        if (moved && !awaitingDragStarted) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
        }
        toggleClass(dragEl, this.options.chosenClass, false);
        _dispatchEvent({
          sortable: this,
          name: "unchoose",
          toEl: parentEl,
          newIndex: null,
          newDraggableIndex: null,
          originalEvent: evt
        });
        if (rootEl !== parentEl) {
          if (newIndex >= 0) {
            _dispatchEvent({
              rootEl: parentEl,
              name: "add",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "remove",
              toEl: parentEl,
              originalEvent: evt
            });
            _dispatchEvent({
              rootEl: parentEl,
              name: "sort",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "sort",
              toEl: parentEl,
              originalEvent: evt
            });
          }
          putSortable && putSortable.save();
        } else {
          if (newIndex !== oldIndex) {
            if (newIndex >= 0) {
              _dispatchEvent({
                sortable: this,
                name: "update",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
          }
        }
        if (Sortable.active) {
          if (newIndex == null || newIndex === -1) {
            newIndex = oldIndex;
            newDraggableIndex = oldDraggableIndex;
          }
          _dispatchEvent({
            sortable: this,
            name: "end",
            toEl: parentEl,
            originalEvent: evt
          });
          this.save();
        }
      }
    }
    this._nulling();
  },
  _nulling: function _nulling() {
    pluginEvent("nulling", this);
    rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
    savedInputChecked.forEach(function(el) {
      el.checked = true;
    });
    savedInputChecked.length = lastDx = lastDy = 0;
  },
  handleEvent: function handleEvent(evt) {
    switch (evt.type) {
      case "drop":
      case "dragend":
        this._onDrop(evt);
        break;
      case "dragenter":
      case "dragover":
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt);
        }
        break;
      case "selectstart":
        evt.preventDefault();
        break;
    }
  },
  toArray: function toArray() {
    var order = [], el, children = this.el.children, i2 = 0, n2 = children.length, options = this.options;
    for (; i2 < n2; i2++) {
      el = children[i2];
      if (closest(el, options.draggable, this.el, false)) {
        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
      }
    }
    return order;
  },
  sort: function sort(order, useAnimation) {
    var items = {}, rootEl2 = this.el;
    this.toArray().forEach(function(id, i2) {
      var el = rootEl2.children[i2];
      if (closest(el, this.options.draggable, rootEl2, false)) {
        items[id] = el;
      }
    }, this);
    useAnimation && this.captureAnimationState();
    order.forEach(function(id) {
      if (items[id]) {
        rootEl2.removeChild(items[id]);
        rootEl2.appendChild(items[id]);
      }
    });
    useAnimation && this.animateAll();
  },
  save: function save() {
    var store = this.options.store;
    store && store.set && store.set(this);
  },
  closest: function closest$1(el, selector) {
    return closest(el, selector || this.options.draggable, this.el, false);
  },
  option: function option(name, value) {
    var options = this.options;
    if (value === void 0) {
      return options[name];
    } else {
      var modifiedValue = PluginManager.modifyOption(this, name, value);
      if (typeof modifiedValue !== "undefined") {
        options[name] = modifiedValue;
      } else {
        options[name] = value;
      }
      if (name === "group") {
        _prepareGroup(options);
      }
    }
  },
  destroy: function destroy() {
    pluginEvent("destroy", this);
    var el = this.el;
    el[expando] = null;
    off(el, "mousedown", this._onTapStart);
    off(el, "touchstart", this._onTapStart);
    off(el, "pointerdown", this._onTapStart);
    if (this.nativeDraggable) {
      off(el, "dragover", this);
      off(el, "dragenter", this);
    }
    Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
      el2.removeAttribute("draggable");
    });
    this._onDrop();
    this._disableDelayedDragEvents();
    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = el = null;
  },
  _hideClone: function _hideClone() {
    if (!cloneHidden) {
      pluginEvent("hideClone", this);
      if (Sortable.eventCanceled)
        return;
      css(cloneEl, "display", "none");
      if (this.options.removeCloneOnHide && cloneEl.parentNode) {
        cloneEl.parentNode.removeChild(cloneEl);
      }
      cloneHidden = true;
    }
  },
  _showClone: function _showClone(putSortable2) {
    if (putSortable2.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (cloneHidden) {
      pluginEvent("showClone", this);
      if (Sortable.eventCanceled)
        return;
      if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
        rootEl.insertBefore(cloneEl, dragEl);
      } else if (nextEl) {
        rootEl.insertBefore(cloneEl, nextEl);
      } else {
        rootEl.appendChild(cloneEl);
      }
      if (this.options.group.revertClone) {
        this.animate(dragEl, cloneEl);
      }
      css(cloneEl, "display", "");
      cloneHidden = false;
    }
  }
};
function _globalDragOver(evt) {
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = "move";
  }
  evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
  var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent("move", {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent("move", true, true);
  }
  evt.to = toEl;
  evt.from = fromEl;
  evt.dragged = dragEl2;
  evt.draggedRect = dragRect;
  evt.related = targetEl || toEl;
  evt.relatedRect = targetRect || getRect(toEl);
  evt.willInsertAfter = willInsertAfter;
  evt.originalEvent = originalEvent;
  fromEl.dispatchEvent(evt);
  if (onMoveFn) {
    retVal = onMoveFn.call(sortable, evt, originalEvent);
  }
  return retVal;
}
function _disableDraggable(el) {
  el.draggable = false;
}
function _unsilent() {
  _silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
  var rect = getRect(getChild(sortable.el, 0, sortable.options, true));
  var spacer = 10;
  return vertical ? evt.clientX < rect.left - spacer || evt.clientY < rect.top && evt.clientX < rect.right : evt.clientY < rect.top - spacer || evt.clientY < rect.bottom && evt.clientX < rect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
  var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
  var spacer = 10;
  return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
  var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
  if (!invertSwap) {
    if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
      if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
        pastFirstInvertThresh = true;
      }
      if (!pastFirstInvertThresh) {
        if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
          return -lastDirection;
        }
      } else {
        invert = true;
      }
    } else {
      if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
        return _getInsertDirection(target);
      }
    }
  }
  invert = invert || invertSwap;
  if (invert) {
    if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
      return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
    }
  }
  return 0;
}
function _getInsertDirection(target) {
  if (index(dragEl) < index(target)) {
    return 1;
  } else {
    return -1;
  }
}
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent, i2 = str.length, sum = 0;
  while (i2--) {
    sum += str.charCodeAt(i2);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root) {
  savedInputChecked.length = 0;
  var inputs = root.getElementsByTagName("input");
  var idx = inputs.length;
  while (idx--) {
    var el = inputs[idx];
    el.checked && savedInputChecked.push(el);
  }
}
function _nextTick(fn) {
  return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
  return clearTimeout(id);
}
if (documentExists) {
  on(document, "touchmove", function(evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault();
    }
  });
}
Sortable.utils = {
  on,
  off,
  css,
  find,
  is: function is(el, selector) {
    return !!closest(el, selector, el, false);
  },
  extend,
  throttle,
  closest,
  toggleClass,
  clone,
  index,
  nextTick: _nextTick,
  cancelNextTick: _cancelNextTick,
  detectDirection: _detectDirection,
  getChild
};
Sortable.get = function(element) {
  return element[expando];
};
Sortable.mount = function() {
  for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
    plugins2[_key] = arguments[_key];
  }
  if (plugins2[0].constructor === Array)
    plugins2 = plugins2[0];
  plugins2.forEach(function(plugin) {
    if (!plugin.prototype || !plugin.prototype.constructor) {
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
    }
    if (plugin.utils)
      Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
    PluginManager.mount(plugin);
  });
};
Sortable.create = function(el, options) {
  return new Sortable(el, options);
};
Sortable.version = version;
var autoScrolls = [], scrollEl, scrollRootEl, scrolling = false, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval;
function AutoScrollPlugin() {
  function AutoScroll() {
    this.defaults = {
      scroll: true,
      forceAutoScrollFallback: false,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true
    };
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
  }
  AutoScroll.prototype = {
    dragStarted: function dragStarted2(_ref) {
      var originalEvent = _ref.originalEvent;
      if (this.sortable.nativeDraggable) {
        on(document, "dragover", this._handleAutoScroll);
      } else {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._handleFallbackAutoScroll);
        } else if (originalEvent.touches) {
          on(document, "touchmove", this._handleFallbackAutoScroll);
        } else {
          on(document, "mousemove", this._handleFallbackAutoScroll);
        }
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref2) {
      var originalEvent = _ref2.originalEvent;
      if (!this.options.dragOverBubble && !originalEvent.rootEl) {
        this._handleAutoScroll(originalEvent);
      }
    },
    drop: function drop3() {
      if (this.sortable.nativeDraggable) {
        off(document, "dragover", this._handleAutoScroll);
      } else {
        off(document, "pointermove", this._handleFallbackAutoScroll);
        off(document, "touchmove", this._handleFallbackAutoScroll);
        off(document, "mousemove", this._handleFallbackAutoScroll);
      }
      clearPointerElemChangedInterval();
      clearAutoScrolls();
      cancelThrottle();
    },
    nulling: function nulling() {
      touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
      autoScrolls.length = 0;
    },
    _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
      this._handleAutoScroll(evt, true);
    },
    _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
      var _this = this;
      var x = (evt.touches ? evt.touches[0] : evt).clientX, y2 = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y2);
      touchEvt$1 = evt;
      if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
        autoScroll(evt, this.options, elem, fallback);
        var ogElemScroller = getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y2 !== lastAutoScrollY)) {
          pointerElemChangedInterval && clearPointerElemChangedInterval();
          pointerElemChangedInterval = setInterval(function() {
            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y2), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              clearAutoScrolls();
            }
            autoScroll(evt, _this.options, newElem, fallback);
          }, 10);
          lastAutoScrollX = x;
          lastAutoScrollY = y2;
        }
      } else {
        if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
          clearAutoScrolls();
          return;
        }
        autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
      }
    }
  };
  return _extends(AutoScroll, {
    pluginName: "scroll",
    initializeByDefault: true
  });
}
function clearAutoScrolls() {
  autoScrolls.forEach(function(autoScroll2) {
    clearInterval(autoScroll2.pid);
  });
  autoScrolls = [];
}
function clearPointerElemChangedInterval() {
  clearInterval(pointerElemChangedInterval);
}
var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
  if (!options.scroll)
    return;
  var x = (evt.touches ? evt.touches[0] : evt).clientX, y2 = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
  var scrollThisInstance = false, scrollCustomFn;
  if (scrollRootEl !== rootEl2) {
    scrollRootEl = rootEl2;
    clearAutoScrolls();
    scrollEl = options.scroll;
    scrollCustomFn = options.scrollFn;
    if (scrollEl === true) {
      scrollEl = getParentAutoScrollElement(rootEl2, true);
    }
  }
  var layersOut = 0;
  var currentParent = scrollEl;
  do {
    var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
    if (el === winScroller) {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
    } else {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
    }
    var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
    var vy = canScrollY && (Math.abs(bottom - y2) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y2) <= sens && !!scrollPosY);
    if (!autoScrolls[layersOut]) {
      for (var i2 = 0; i2 <= layersOut; i2++) {
        if (!autoScrolls[i2]) {
          autoScrolls[i2] = {};
        }
      }
    }
    if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
      autoScrolls[layersOut].el = el;
      autoScrolls[layersOut].vx = vx;
      autoScrolls[layersOut].vy = vy;
      clearInterval(autoScrolls[layersOut].pid);
      if (vx != 0 || vy != 0) {
        scrollThisInstance = true;
        autoScrolls[layersOut].pid = setInterval(function() {
          if (isFallback && this.layer === 0) {
            Sortable.active._onTouchMove(touchEvt$1);
          }
          var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
          var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
          if (typeof scrollCustomFn === "function") {
            if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
              return;
            }
          }
          scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
        }.bind({
          layer: layersOut
        }), 24);
      }
    }
    layersOut++;
  } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  scrolling = scrollThisInstance;
}, 30);
var drop = function drop2(_ref) {
  var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
  if (!originalEvent)
    return;
  var toSortable = putSortable2 || activeSortable;
  hideGhostForTarget();
  var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  unhideGhostForTarget();
  if (toSortable && !toSortable.el.contains(target)) {
    dispatchSortableEvent("spill");
    this.onSpill({
      dragEl: dragEl2,
      putSortable: putSortable2
    });
  }
};
function Revert() {
}
Revert.prototype = {
  startIndex: null,
  dragStart: function dragStart(_ref2) {
    var oldDraggableIndex2 = _ref2.oldDraggableIndex;
    this.startIndex = oldDraggableIndex2;
  },
  onSpill: function onSpill(_ref3) {
    var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
    this.sortable.captureAnimationState();
    if (putSortable2) {
      putSortable2.captureAnimationState();
    }
    var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
    if (nextSibling) {
      this.sortable.el.insertBefore(dragEl2, nextSibling);
    } else {
      this.sortable.el.appendChild(dragEl2);
    }
    this.sortable.animateAll();
    if (putSortable2) {
      putSortable2.animateAll();
    }
  },
  drop
};
_extends(Revert, {
  pluginName: "revertOnSpill"
});
function Remove() {
}
Remove.prototype = {
  onSpill: function onSpill2(_ref4) {
    var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
    var parentSortable = putSortable2 || this.sortable;
    parentSortable.captureAnimationState();
    dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
    parentSortable.animateAll();
  },
  drop
};
_extends(Remove, {
  pluginName: "removeOnSpill"
});
var lastSwapEl;
function SwapPlugin() {
  function Swap() {
    this.defaults = {
      swapClass: "sortable-swap-highlight"
    };
  }
  Swap.prototype = {
    dragStart: function dragStart2(_ref) {
      var dragEl2 = _ref.dragEl;
      lastSwapEl = dragEl2;
    },
    dragOverValid: function dragOverValid(_ref2) {
      var completed = _ref2.completed, target = _ref2.target, onMove = _ref2.onMove, activeSortable = _ref2.activeSortable, changed = _ref2.changed, cancel = _ref2.cancel;
      if (!activeSortable.options.swap)
        return;
      var el = this.sortable.el, options = this.options;
      if (target && target !== el) {
        var prevSwapEl = lastSwapEl;
        if (onMove(target) !== false) {
          toggleClass(target, options.swapClass, true);
          lastSwapEl = target;
        } else {
          lastSwapEl = null;
        }
        if (prevSwapEl && prevSwapEl !== lastSwapEl) {
          toggleClass(prevSwapEl, options.swapClass, false);
        }
      }
      changed();
      completed(true);
      cancel();
    },
    drop: function drop3(_ref3) {
      var activeSortable = _ref3.activeSortable, putSortable2 = _ref3.putSortable, dragEl2 = _ref3.dragEl;
      var toSortable = putSortable2 || this.sortable;
      var options = this.options;
      lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
      if (lastSwapEl && (options.swap || putSortable2 && putSortable2.options.swap)) {
        if (dragEl2 !== lastSwapEl) {
          toSortable.captureAnimationState();
          if (toSortable !== activeSortable)
            activeSortable.captureAnimationState();
          swapNodes(dragEl2, lastSwapEl);
          toSortable.animateAll();
          if (toSortable !== activeSortable)
            activeSortable.animateAll();
        }
      }
    },
    nulling: function nulling() {
      lastSwapEl = null;
    }
  };
  return _extends(Swap, {
    pluginName: "swap",
    eventProperties: function eventProperties() {
      return {
        swapItem: lastSwapEl
      };
    }
  });
}
function swapNodes(n1, n2) {
  var p1 = n1.parentNode, p2 = n2.parentNode, i1, i2;
  if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1))
    return;
  i1 = index(n1);
  i2 = index(n2);
  if (p1.isEqualNode(p2) && i1 < i2) {
    i2++;
  }
  p1.insertBefore(n2, p1.children[i1]);
  p2.insertBefore(n1, p2.children[i2]);
}
var multiDragElements = [], multiDragClones = [], lastMultiDragSelect, multiDragSortable, initialFolding = false, folding = false, dragStarted = false, dragEl$1, clonesFromRect, clonesHidden;
function MultiDragPlugin() {
  function MultiDrag(sortable) {
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    if (sortable.options.supportPointer) {
      on(document, "pointerup", this._deselectMultiDrag);
    } else {
      on(document, "mouseup", this._deselectMultiDrag);
      on(document, "touchend", this._deselectMultiDrag);
    }
    on(document, "keydown", this._checkKeyDown);
    on(document, "keyup", this._checkKeyUp);
    this.defaults = {
      selectedClass: "sortable-selected",
      multiDragKey: null,
      setData: function setData(dataTransfer, dragEl2) {
        var data = "";
        if (multiDragElements.length && multiDragSortable === sortable) {
          multiDragElements.forEach(function(multiDragElement, i2) {
            data += (!i2 ? "" : ", ") + multiDragElement.textContent;
          });
        } else {
          data = dragEl2.textContent;
        }
        dataTransfer.setData("Text", data);
      }
    };
  }
  MultiDrag.prototype = {
    multiDragKeyDown: false,
    isMultiDrag: false,
    delayStartGlobal: function delayStartGlobal(_ref) {
      var dragged = _ref.dragEl;
      dragEl$1 = dragged;
    },
    delayEnded: function delayEnded() {
      this.isMultiDrag = ~multiDragElements.indexOf(dragEl$1);
    },
    setupClone: function setupClone(_ref2) {
      var sortable = _ref2.sortable, cancel = _ref2.cancel;
      if (!this.isMultiDrag)
        return;
      for (var i2 = 0; i2 < multiDragElements.length; i2++) {
        multiDragClones.push(clone(multiDragElements[i2]));
        multiDragClones[i2].sortableIndex = multiDragElements[i2].sortableIndex;
        multiDragClones[i2].draggable = false;
        multiDragClones[i2].style["will-change"] = "";
        toggleClass(multiDragClones[i2], this.options.selectedClass, false);
        multiDragElements[i2] === dragEl$1 && toggleClass(multiDragClones[i2], this.options.chosenClass, false);
      }
      sortable._hideClone();
      cancel();
    },
    clone: function clone2(_ref3) {
      var sortable = _ref3.sortable, rootEl2 = _ref3.rootEl, dispatchSortableEvent = _ref3.dispatchSortableEvent, cancel = _ref3.cancel;
      if (!this.isMultiDrag)
        return;
      if (!this.options.removeCloneOnHide) {
        if (multiDragElements.length && multiDragSortable === sortable) {
          insertMultiDragClones(true, rootEl2);
          dispatchSortableEvent("clone");
          cancel();
        }
      }
    },
    showClone: function showClone(_ref4) {
      var cloneNowShown = _ref4.cloneNowShown, rootEl2 = _ref4.rootEl, cancel = _ref4.cancel;
      if (!this.isMultiDrag)
        return;
      insertMultiDragClones(false, rootEl2);
      multiDragClones.forEach(function(clone2) {
        css(clone2, "display", "");
      });
      cloneNowShown();
      clonesHidden = false;
      cancel();
    },
    hideClone: function hideClone(_ref5) {
      var _this = this;
      _ref5.sortable;
      var cloneNowHidden = _ref5.cloneNowHidden, cancel = _ref5.cancel;
      if (!this.isMultiDrag)
        return;
      multiDragClones.forEach(function(clone2) {
        css(clone2, "display", "none");
        if (_this.options.removeCloneOnHide && clone2.parentNode) {
          clone2.parentNode.removeChild(clone2);
        }
      });
      cloneNowHidden();
      clonesHidden = true;
      cancel();
    },
    dragStartGlobal: function dragStartGlobal(_ref6) {
      _ref6.sortable;
      if (!this.isMultiDrag && multiDragSortable) {
        multiDragSortable.multiDrag._deselectMultiDrag();
      }
      multiDragElements.forEach(function(multiDragElement) {
        multiDragElement.sortableIndex = index(multiDragElement);
      });
      multiDragElements = multiDragElements.sort(function(a2, b2) {
        return a2.sortableIndex - b2.sortableIndex;
      });
      dragStarted = true;
    },
    dragStarted: function dragStarted2(_ref7) {
      var _this2 = this;
      var sortable = _ref7.sortable;
      if (!this.isMultiDrag)
        return;
      if (this.options.sort) {
        sortable.captureAnimationState();
        if (this.options.animation) {
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1)
              return;
            css(multiDragElement, "position", "absolute");
          });
          var dragRect = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1)
              return;
            setRect(multiDragElement, dragRect);
          });
          folding = true;
          initialFolding = true;
        }
      }
      sortable.animateAll(function() {
        folding = false;
        initialFolding = false;
        if (_this2.options.animation) {
          multiDragElements.forEach(function(multiDragElement) {
            unsetRect(multiDragElement);
          });
        }
        if (_this2.options.sort) {
          removeMultiDragElements();
        }
      });
    },
    dragOver: function dragOver(_ref8) {
      var target = _ref8.target, completed = _ref8.completed, cancel = _ref8.cancel;
      if (folding && ~multiDragElements.indexOf(target)) {
        completed(false);
        cancel();
      }
    },
    revert: function revert(_ref9) {
      var fromSortable = _ref9.fromSortable, rootEl2 = _ref9.rootEl, sortable = _ref9.sortable, dragRect = _ref9.dragRect;
      if (multiDragElements.length > 1) {
        multiDragElements.forEach(function(multiDragElement) {
          sortable.addAnimationState({
            target: multiDragElement,
            rect: folding ? getRect(multiDragElement) : dragRect
          });
          unsetRect(multiDragElement);
          multiDragElement.fromRect = dragRect;
          fromSortable.removeAnimationState(multiDragElement);
        });
        folding = false;
        insertMultiDragElements(!this.options.removeCloneOnHide, rootEl2);
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref10) {
      var sortable = _ref10.sortable, isOwner = _ref10.isOwner, insertion = _ref10.insertion, activeSortable = _ref10.activeSortable, parentEl2 = _ref10.parentEl, putSortable2 = _ref10.putSortable;
      var options = this.options;
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        }
        initialFolding = false;
        if (options.animation && multiDragElements.length > 1 && (folding || !isOwner && !activeSortable.options.sort && !putSortable2)) {
          var dragRectAbsolute = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1)
              return;
            setRect(multiDragElement, dragRectAbsolute);
            parentEl2.appendChild(multiDragElement);
          });
          folding = true;
        }
        if (!isOwner) {
          if (!folding) {
            removeMultiDragElements();
          }
          if (multiDragElements.length > 1) {
            var clonesHiddenBefore = clonesHidden;
            activeSortable._showClone(sortable);
            if (activeSortable.options.animation && !clonesHidden && clonesHiddenBefore) {
              multiDragClones.forEach(function(clone2) {
                activeSortable.addAnimationState({
                  target: clone2,
                  rect: clonesFromRect
                });
                clone2.fromRect = clonesFromRect;
                clone2.thisAnimationDuration = null;
              });
            }
          } else {
            activeSortable._showClone(sortable);
          }
        }
      }
    },
    dragOverAnimationCapture: function dragOverAnimationCapture(_ref11) {
      var dragRect = _ref11.dragRect, isOwner = _ref11.isOwner, activeSortable = _ref11.activeSortable;
      multiDragElements.forEach(function(multiDragElement) {
        multiDragElement.thisAnimationDuration = null;
      });
      if (activeSortable.options.animation && !isOwner && activeSortable.multiDrag.isMultiDrag) {
        clonesFromRect = _extends({}, dragRect);
        var dragMatrix = matrix(dragEl$1, true);
        clonesFromRect.top -= dragMatrix.f;
        clonesFromRect.left -= dragMatrix.e;
      }
    },
    dragOverAnimationComplete: function dragOverAnimationComplete() {
      if (folding) {
        folding = false;
        removeMultiDragElements();
      }
    },
    drop: function drop3(_ref12) {
      var evt = _ref12.originalEvent, rootEl2 = _ref12.rootEl, parentEl2 = _ref12.parentEl, sortable = _ref12.sortable, dispatchSortableEvent = _ref12.dispatchSortableEvent, oldIndex2 = _ref12.oldIndex, putSortable2 = _ref12.putSortable;
      var toSortable = putSortable2 || this.sortable;
      if (!evt)
        return;
      var options = this.options, children = parentEl2.children;
      if (!dragStarted) {
        if (options.multiDragKey && !this.multiDragKeyDown) {
          this._deselectMultiDrag();
        }
        toggleClass(dragEl$1, options.selectedClass, !~multiDragElements.indexOf(dragEl$1));
        if (!~multiDragElements.indexOf(dragEl$1)) {
          multiDragElements.push(dragEl$1);
          dispatchEvent({
            sortable,
            rootEl: rootEl2,
            name: "select",
            targetEl: dragEl$1,
            originalEvt: evt
          });
          if (evt.shiftKey && lastMultiDragSelect && sortable.el.contains(lastMultiDragSelect)) {
            var lastIndex = index(lastMultiDragSelect), currentIndex = index(dragEl$1);
            if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
              var n2, i2;
              if (currentIndex > lastIndex) {
                i2 = lastIndex;
                n2 = currentIndex;
              } else {
                i2 = currentIndex;
                n2 = lastIndex + 1;
              }
              for (; i2 < n2; i2++) {
                if (~multiDragElements.indexOf(children[i2]))
                  continue;
                toggleClass(children[i2], options.selectedClass, true);
                multiDragElements.push(children[i2]);
                dispatchEvent({
                  sortable,
                  rootEl: rootEl2,
                  name: "select",
                  targetEl: children[i2],
                  originalEvt: evt
                });
              }
            }
          } else {
            lastMultiDragSelect = dragEl$1;
          }
          multiDragSortable = toSortable;
        } else {
          multiDragElements.splice(multiDragElements.indexOf(dragEl$1), 1);
          lastMultiDragSelect = null;
          dispatchEvent({
            sortable,
            rootEl: rootEl2,
            name: "deselect",
            targetEl: dragEl$1,
            originalEvt: evt
          });
        }
      }
      if (dragStarted && this.isMultiDrag) {
        folding = false;
        if ((parentEl2[expando].options.sort || parentEl2 !== rootEl2) && multiDragElements.length > 1) {
          var dragRect = getRect(dragEl$1), multiDragIndex = index(dragEl$1, ":not(." + this.options.selectedClass + ")");
          if (!initialFolding && options.animation)
            dragEl$1.thisAnimationDuration = null;
          toSortable.captureAnimationState();
          if (!initialFolding) {
            if (options.animation) {
              dragEl$1.fromRect = dragRect;
              multiDragElements.forEach(function(multiDragElement) {
                multiDragElement.thisAnimationDuration = null;
                if (multiDragElement !== dragEl$1) {
                  var rect = folding ? getRect(multiDragElement) : dragRect;
                  multiDragElement.fromRect = rect;
                  toSortable.addAnimationState({
                    target: multiDragElement,
                    rect
                  });
                }
              });
            }
            removeMultiDragElements();
            multiDragElements.forEach(function(multiDragElement) {
              if (children[multiDragIndex]) {
                parentEl2.insertBefore(multiDragElement, children[multiDragIndex]);
              } else {
                parentEl2.appendChild(multiDragElement);
              }
              multiDragIndex++;
            });
            if (oldIndex2 === index(dragEl$1)) {
              var update = false;
              multiDragElements.forEach(function(multiDragElement) {
                if (multiDragElement.sortableIndex !== index(multiDragElement)) {
                  update = true;
                  return;
                }
              });
              if (update) {
                dispatchSortableEvent("update");
              }
            }
          }
          multiDragElements.forEach(function(multiDragElement) {
            unsetRect(multiDragElement);
          });
          toSortable.animateAll();
        }
        multiDragSortable = toSortable;
      }
      if (rootEl2 === parentEl2 || putSortable2 && putSortable2.lastPutMode !== "clone") {
        multiDragClones.forEach(function(clone2) {
          clone2.parentNode && clone2.parentNode.removeChild(clone2);
        });
      }
    },
    nullingGlobal: function nullingGlobal() {
      this.isMultiDrag = dragStarted = false;
      multiDragClones.length = 0;
    },
    destroyGlobal: function destroyGlobal() {
      this._deselectMultiDrag();
      off(document, "pointerup", this._deselectMultiDrag);
      off(document, "mouseup", this._deselectMultiDrag);
      off(document, "touchend", this._deselectMultiDrag);
      off(document, "keydown", this._checkKeyDown);
      off(document, "keyup", this._checkKeyUp);
    },
    _deselectMultiDrag: function _deselectMultiDrag(evt) {
      if (typeof dragStarted !== "undefined" && dragStarted)
        return;
      if (multiDragSortable !== this.sortable)
        return;
      if (evt && closest(evt.target, this.options.draggable, this.sortable.el, false))
        return;
      if (evt && evt.button !== 0)
        return;
      while (multiDragElements.length) {
        var el = multiDragElements[0];
        toggleClass(el, this.options.selectedClass, false);
        multiDragElements.shift();
        dispatchEvent({
          sortable: this.sortable,
          rootEl: this.sortable.el,
          name: "deselect",
          targetEl: el,
          originalEvt: evt
        });
      }
    },
    _checkKeyDown: function _checkKeyDown(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = true;
      }
    },
    _checkKeyUp: function _checkKeyUp(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = false;
      }
    }
  };
  return _extends(MultiDrag, {
    pluginName: "multiDrag",
    utils: {
      select: function select(el) {
        var sortable = el.parentNode[expando];
        if (!sortable || !sortable.options.multiDrag || ~multiDragElements.indexOf(el))
          return;
        if (multiDragSortable && multiDragSortable !== sortable) {
          multiDragSortable.multiDrag._deselectMultiDrag();
          multiDragSortable = sortable;
        }
        toggleClass(el, sortable.options.selectedClass, true);
        multiDragElements.push(el);
      },
      deselect: function deselect(el) {
        var sortable = el.parentNode[expando], index2 = multiDragElements.indexOf(el);
        if (!sortable || !sortable.options.multiDrag || !~index2)
          return;
        toggleClass(el, sortable.options.selectedClass, false);
        multiDragElements.splice(index2, 1);
      }
    },
    eventProperties: function eventProperties() {
      var _this3 = this;
      var oldIndicies = [], newIndicies = [];
      multiDragElements.forEach(function(multiDragElement) {
        oldIndicies.push({
          multiDragElement,
          index: multiDragElement.sortableIndex
        });
        var newIndex2;
        if (folding && multiDragElement !== dragEl$1) {
          newIndex2 = -1;
        } else if (folding) {
          newIndex2 = index(multiDragElement, ":not(." + _this3.options.selectedClass + ")");
        } else {
          newIndex2 = index(multiDragElement);
        }
        newIndicies.push({
          multiDragElement,
          index: newIndex2
        });
      });
      return {
        items: _toConsumableArray(multiDragElements),
        clones: [].concat(multiDragClones),
        oldIndicies,
        newIndicies
      };
    },
    optionListeners: {
      multiDragKey: function multiDragKey(key) {
        key = key.toLowerCase();
        if (key === "ctrl") {
          key = "Control";
        } else if (key.length > 1) {
          key = key.charAt(0).toUpperCase() + key.substr(1);
        }
        return key;
      }
    }
  });
}
function insertMultiDragElements(clonesInserted, rootEl2) {
  multiDragElements.forEach(function(multiDragElement, i2) {
    var target = rootEl2.children[multiDragElement.sortableIndex + (clonesInserted ? Number(i2) : 0)];
    if (target) {
      rootEl2.insertBefore(multiDragElement, target);
    } else {
      rootEl2.appendChild(multiDragElement);
    }
  });
}
function insertMultiDragClones(elementsInserted, rootEl2) {
  multiDragClones.forEach(function(clone2, i2) {
    var target = rootEl2.children[clone2.sortableIndex + (elementsInserted ? Number(i2) : 0)];
    if (target) {
      rootEl2.insertBefore(clone2, target);
    } else {
      rootEl2.appendChild(clone2);
    }
  });
}
function removeMultiDragElements() {
  multiDragElements.forEach(function(multiDragElement) {
    if (multiDragElement === dragEl$1)
      return;
    multiDragElement.parentNode && multiDragElement.parentNode.removeChild(multiDragElement);
  });
}
Sortable.mount(new AutoScrollPlugin());
Sortable.mount(Remove, Revert);
var sortable_esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": Sortable,
  MultiDrag: MultiDragPlugin,
  Sortable,
  Swap: SwapPlugin
}, Symbol.toStringTag, { value: "Module" }));
var require$$1 = /* @__PURE__ */ getAugmentedNamespace(sortable_esm);
(function(module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
    module.exports = factory(require$$0$1, require$$1);
  })(typeof self !== "undefined" ? self : commonjsGlobal, function(__WEBPACK_EXTERNAL_MODULE__8bbf__, __WEBPACK_EXTERNAL_MODULE_a352__) {
    return function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module2 = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };
        modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
        module2.l = true;
        return module2.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.d = function(exports2, name, getter) {
        if (!__webpack_require__.o(exports2, name)) {
          Object.defineProperty(exports2, name, { enumerable: true, get: getter });
        }
      };
      __webpack_require__.r = function(exports2) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports2, "__esModule", { value: true });
      };
      __webpack_require__.t = function(value, mode) {
        if (mode & 1)
          value = __webpack_require__(value);
        if (mode & 8)
          return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule)
          return value;
        var ns = /* @__PURE__ */ Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", { enumerable: true, value });
        if (mode & 2 && typeof value != "string")
          for (var key in value)
            __webpack_require__.d(ns, key, function(key2) {
              return value[key2];
            }.bind(null, key));
        return ns;
      };
      __webpack_require__.n = function(module2) {
        var getter = module2 && module2.__esModule ? function getDefault() {
          return module2["default"];
        } : function getModuleExports() {
          return module2;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = "fb15");
    }({
      "00ee": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        var TO_STRING_TAG = wellKnownSymbol("toStringTag");
        var test = {};
        test[TO_STRING_TAG] = "z";
        module2.exports = String(test) === "[object z]";
      },
      "0366": function(module2, exports2, __webpack_require__) {
        var aFunction = __webpack_require__("1c0b");
        module2.exports = function(fn, that, length) {
          aFunction(fn);
          if (that === void 0)
            return fn;
          switch (length) {
            case 0:
              return function() {
                return fn.call(that);
              };
            case 1:
              return function(a2) {
                return fn.call(that, a2);
              };
            case 2:
              return function(a2, b2) {
                return fn.call(that, a2, b2);
              };
            case 3:
              return function(a2, b2, c2) {
                return fn.call(that, a2, b2, c2);
              };
          }
          return function() {
            return fn.apply(that, arguments);
          };
        };
      },
      "057f": function(module2, exports2, __webpack_require__) {
        var toIndexedObject = __webpack_require__("fc6a");
        var nativeGetOwnPropertyNames = __webpack_require__("241c").f;
        var toString = {}.toString;
        var windowNames = typeof window == "object" && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
        var getWindowNames = function(it) {
          try {
            return nativeGetOwnPropertyNames(it);
          } catch (error) {
            return windowNames.slice();
          }
        };
        module2.exports.f = function getOwnPropertyNames(it) {
          return windowNames && toString.call(it) == "[object Window]" ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
        };
      },
      "06cf": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var propertyIsEnumerableModule = __webpack_require__("d1e7");
        var createPropertyDescriptor = __webpack_require__("5c6c");
        var toIndexedObject = __webpack_require__("fc6a");
        var toPrimitive = __webpack_require__("c04e");
        var has2 = __webpack_require__("5135");
        var IE8_DOM_DEFINE = __webpack_require__("0cfb");
        var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        exports2.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
          O = toIndexedObject(O);
          P = toPrimitive(P, true);
          if (IE8_DOM_DEFINE)
            try {
              return nativeGetOwnPropertyDescriptor(O, P);
            } catch (error) {
            }
          if (has2(O, P))
            return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
        };
      },
      "0cfb": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var fails = __webpack_require__("d039");
        var createElement = __webpack_require__("cc12");
        module2.exports = !DESCRIPTORS && !fails(function() {
          return Object.defineProperty(createElement("div"), "a", {
            get: function() {
              return 7;
            }
          }).a != 7;
        });
      },
      "13d5": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $reduce = __webpack_require__("d58f").left;
        var arrayMethodIsStrict = __webpack_require__("a640");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var STRICT_METHOD = arrayMethodIsStrict("reduce");
        var USES_TO_LENGTH = arrayMethodUsesToLength("reduce", { 1: 0 });
        $({ target: "Array", proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
          reduce: function reduce(callbackfn) {
            return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
      },
      "14c3": function(module2, exports2, __webpack_require__) {
        var classof = __webpack_require__("c6b6");
        var regexpExec = __webpack_require__("9263");
        module2.exports = function(R, S) {
          var exec = R.exec;
          if (typeof exec === "function") {
            var result = exec.call(R, S);
            if (typeof result !== "object") {
              throw TypeError("RegExp exec method returned something other than an Object or null");
            }
            return result;
          }
          if (classof(R) !== "RegExp") {
            throw TypeError("RegExp#exec called on incompatible receiver");
          }
          return regexpExec.call(R, S);
        };
      },
      "159b": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var DOMIterables = __webpack_require__("fdbc");
        var forEach = __webpack_require__("17c2");
        var createNonEnumerableProperty = __webpack_require__("9112");
        for (var COLLECTION_NAME in DOMIterables) {
          var Collection = window[COLLECTION_NAME];
          var CollectionPrototype = Collection && Collection.prototype;
          if (CollectionPrototype && CollectionPrototype.forEach !== forEach)
            try {
              createNonEnumerableProperty(CollectionPrototype, "forEach", forEach);
            } catch (error) {
              CollectionPrototype.forEach = forEach;
            }
        }
      },
      "17c2": function(module2, exports2, __webpack_require__) {
        var $forEach = __webpack_require__("b727").forEach;
        var arrayMethodIsStrict = __webpack_require__("a640");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var STRICT_METHOD = arrayMethodIsStrict("forEach");
        var USES_TO_LENGTH = arrayMethodUsesToLength("forEach");
        module2.exports = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach(callbackfn) {
          return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
        } : [].forEach;
      },
      "1be4": function(module2, exports2, __webpack_require__) {
        var getBuiltIn = __webpack_require__("d066");
        module2.exports = getBuiltIn("document", "documentElement");
      },
      "1c0b": function(module2, exports2) {
        module2.exports = function(it) {
          if (typeof it != "function") {
            throw TypeError(String(it) + " is not a function");
          }
          return it;
        };
      },
      "1c7e": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        var ITERATOR = wellKnownSymbol("iterator");
        var SAFE_CLOSING = false;
        try {
          var called = 0;
          var iteratorWithReturn = {
            next: function() {
              return { done: !!called++ };
            },
            "return": function() {
              SAFE_CLOSING = true;
            }
          };
          iteratorWithReturn[ITERATOR] = function() {
            return this;
          };
          Array.from(iteratorWithReturn, function() {
            throw 2;
          });
        } catch (error) {
        }
        module2.exports = function(exec, SKIP_CLOSING) {
          if (!SKIP_CLOSING && !SAFE_CLOSING)
            return false;
          var ITERATION_SUPPORT = false;
          try {
            var object = {};
            object[ITERATOR] = function() {
              return {
                next: function() {
                  return { done: ITERATION_SUPPORT = true };
                }
              };
            };
            exec(object);
          } catch (error) {
          }
          return ITERATION_SUPPORT;
        };
      },
      "1d80": function(module2, exports2) {
        module2.exports = function(it) {
          if (it == void 0)
            throw TypeError("Can't call method on " + it);
          return it;
        };
      },
      "1dde": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        var wellKnownSymbol = __webpack_require__("b622");
        var V8_VERSION = __webpack_require__("2d00");
        var SPECIES = wellKnownSymbol("species");
        module2.exports = function(METHOD_NAME) {
          return V8_VERSION >= 51 || !fails(function() {
            var array = [];
            var constructor = array.constructor = {};
            constructor[SPECIES] = function() {
              return { foo: 1 };
            };
            return array[METHOD_NAME](Boolean).foo !== 1;
          });
        };
      },
      "23cb": function(module2, exports2, __webpack_require__) {
        var toInteger = __webpack_require__("a691");
        var max = Math.max;
        var min = Math.min;
        module2.exports = function(index2, length) {
          var integer = toInteger(index2);
          return integer < 0 ? max(integer + length, 0) : min(integer, length);
        };
      },
      "23e7": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var getOwnPropertyDescriptor = __webpack_require__("06cf").f;
        var createNonEnumerableProperty = __webpack_require__("9112");
        var redefine = __webpack_require__("6eeb");
        var setGlobal = __webpack_require__("ce4e");
        var copyConstructorProperties = __webpack_require__("e893");
        var isForced = __webpack_require__("94ca");
        module2.exports = function(options, source) {
          var TARGET = options.target;
          var GLOBAL = options.global;
          var STATIC = options.stat;
          var FORCED, target, key, targetProperty, sourceProperty, descriptor;
          if (GLOBAL) {
            target = window;
          } else if (STATIC) {
            target = window[TARGET] || setGlobal(TARGET, {});
          } else {
            target = (window[TARGET] || {}).prototype;
          }
          if (target)
            for (key in source) {
              sourceProperty = source[key];
              if (options.noTargetGet) {
                descriptor = getOwnPropertyDescriptor(target, key);
                targetProperty = descriptor && descriptor.value;
              } else
                targetProperty = target[key];
              FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
              if (!FORCED && targetProperty !== void 0) {
                if (typeof sourceProperty === typeof targetProperty)
                  continue;
                copyConstructorProperties(sourceProperty, targetProperty);
              }
              if (options.sham || targetProperty && targetProperty.sham) {
                createNonEnumerableProperty(sourceProperty, "sham", true);
              }
              redefine(target, key, sourceProperty, options);
            }
        };
      },
      "241c": function(module2, exports2, __webpack_require__) {
        var internalObjectKeys = __webpack_require__("ca84");
        var enumBugKeys = __webpack_require__("7839");
        var hiddenKeys = enumBugKeys.concat("length", "prototype");
        exports2.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
          return internalObjectKeys(O, hiddenKeys);
        };
      },
      "25f0": function(module2, exports2, __webpack_require__) {
        var redefine = __webpack_require__("6eeb");
        var anObject = __webpack_require__("825a");
        var fails = __webpack_require__("d039");
        var flags = __webpack_require__("ad6d");
        var TO_STRING = "toString";
        var RegExpPrototype = RegExp.prototype;
        var nativeToString = RegExpPrototype[TO_STRING];
        var NOT_GENERIC = fails(function() {
          return nativeToString.call({ source: "a", flags: "b" }) != "/a/b";
        });
        var INCORRECT_NAME = nativeToString.name != TO_STRING;
        if (NOT_GENERIC || INCORRECT_NAME) {
          redefine(RegExp.prototype, TO_STRING, function toString() {
            var R = anObject(this);
            var p2 = String(R.source);
            var rf = R.flags;
            var f2 = String(rf === void 0 && R instanceof RegExp && !("flags" in RegExpPrototype) ? flags.call(R) : rf);
            return "/" + p2 + "/" + f2;
          }, { unsafe: true });
        }
      },
      "2ca0": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var getOwnPropertyDescriptor = __webpack_require__("06cf").f;
        var toLength = __webpack_require__("50c4");
        var notARegExp = __webpack_require__("5a34");
        var requireObjectCoercible = __webpack_require__("1d80");
        var correctIsRegExpLogic = __webpack_require__("ab13");
        var IS_PURE = __webpack_require__("c430");
        var nativeStartsWith = "".startsWith;
        var min = Math.min;
        var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic("startsWith");
        var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function() {
          var descriptor = getOwnPropertyDescriptor(String.prototype, "startsWith");
          return descriptor && !descriptor.writable;
        }();
        $({ target: "String", proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
          startsWith: function startsWith(searchString) {
            var that = String(requireObjectCoercible(this));
            notARegExp(searchString);
            var index2 = toLength(min(arguments.length > 1 ? arguments[1] : void 0, that.length));
            var search = String(searchString);
            return nativeStartsWith ? nativeStartsWith.call(that, search, index2) : that.slice(index2, index2 + search.length) === search;
          }
        });
      },
      "2d00": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var userAgent2 = __webpack_require__("342f");
        var process2 = window.process;
        var versions = process2 && process2.versions;
        var v8 = versions && versions.v8;
        var match, version2;
        if (v8) {
          match = v8.split(".");
          version2 = match[0] + match[1];
        } else if (userAgent2) {
          match = userAgent2.match(/Edge\/(\d+)/);
          if (!match || match[1] >= 74) {
            match = userAgent2.match(/Chrome\/(\d+)/);
            if (match)
              version2 = match[1];
          }
        }
        module2.exports = version2 && +version2;
      },
      "342f": function(module2, exports2, __webpack_require__) {
        var getBuiltIn = __webpack_require__("d066");
        module2.exports = getBuiltIn("navigator", "userAgent") || "";
      },
      "35a1": function(module2, exports2, __webpack_require__) {
        var classof = __webpack_require__("f5df");
        var Iterators = __webpack_require__("3f8c");
        var wellKnownSymbol = __webpack_require__("b622");
        var ITERATOR = wellKnownSymbol("iterator");
        module2.exports = function(it) {
          if (it != void 0)
            return it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)];
        };
      },
      "37e8": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var definePropertyModule = __webpack_require__("9bf2");
        var anObject = __webpack_require__("825a");
        var objectKeys = __webpack_require__("df75");
        module2.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
          anObject(O);
          var keys = objectKeys(Properties);
          var length = keys.length;
          var index2 = 0;
          var key;
          while (length > index2)
            definePropertyModule.f(O, key = keys[index2++], Properties[key]);
          return O;
        };
      },
      "3bbe": function(module2, exports2, __webpack_require__) {
        var isObject2 = __webpack_require__("861d");
        module2.exports = function(it) {
          if (!isObject2(it) && it !== null) {
            throw TypeError("Can't set " + String(it) + " as a prototype");
          }
          return it;
        };
      },
      "3ca3": function(module2, exports2, __webpack_require__) {
        var charAt = __webpack_require__("6547").charAt;
        var InternalStateModule = __webpack_require__("69f3");
        var defineIterator = __webpack_require__("7dd0");
        var STRING_ITERATOR = "String Iterator";
        var setInternalState = InternalStateModule.set;
        var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);
        defineIterator(String, "String", function(iterated) {
          setInternalState(this, {
            type: STRING_ITERATOR,
            string: String(iterated),
            index: 0
          });
        }, function next() {
          var state = getInternalState(this);
          var string = state.string;
          var index2 = state.index;
          var point;
          if (index2 >= string.length)
            return { value: void 0, done: true };
          point = charAt(string, index2);
          state.index += point.length;
          return { value: point, done: false };
        });
      },
      "3f8c": function(module2, exports2) {
        module2.exports = {};
      },
      "4160": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var forEach = __webpack_require__("17c2");
        $({ target: "Array", proto: true, forced: [].forEach != forEach }, {
          forEach
        });
      },
      "428f": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        module2.exports = window;
      },
      "44ad": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        var classof = __webpack_require__("c6b6");
        var split = "".split;
        module2.exports = fails(function() {
          return !Object("z").propertyIsEnumerable(0);
        }) ? function(it) {
          return classof(it) == "String" ? split.call(it, "") : Object(it);
        } : Object;
      },
      "44d2": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        var create = __webpack_require__("7c73");
        var definePropertyModule = __webpack_require__("9bf2");
        var UNSCOPABLES = wellKnownSymbol("unscopables");
        var ArrayPrototype = Array.prototype;
        if (ArrayPrototype[UNSCOPABLES] == void 0) {
          definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
            configurable: true,
            value: create(null)
          });
        }
        module2.exports = function(key) {
          ArrayPrototype[UNSCOPABLES][key] = true;
        };
      },
      "44e7": function(module2, exports2, __webpack_require__) {
        var isObject2 = __webpack_require__("861d");
        var classof = __webpack_require__("c6b6");
        var wellKnownSymbol = __webpack_require__("b622");
        var MATCH = wellKnownSymbol("match");
        module2.exports = function(it) {
          var isRegExp;
          return isObject2(it) && ((isRegExp = it[MATCH]) !== void 0 ? !!isRegExp : classof(it) == "RegExp");
        };
      },
      "4930": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        module2.exports = !!Object.getOwnPropertySymbols && !fails(function() {
          return !String(Symbol());
        });
      },
      "4d64": function(module2, exports2, __webpack_require__) {
        var toIndexedObject = __webpack_require__("fc6a");
        var toLength = __webpack_require__("50c4");
        var toAbsoluteIndex = __webpack_require__("23cb");
        var createMethod = function(IS_INCLUDES) {
          return function($this, el, fromIndex) {
            var O = toIndexedObject($this);
            var length = toLength(O.length);
            var index2 = toAbsoluteIndex(fromIndex, length);
            var value;
            if (IS_INCLUDES && el != el)
              while (length > index2) {
                value = O[index2++];
                if (value != value)
                  return true;
              }
            else
              for (; length > index2; index2++) {
                if ((IS_INCLUDES || index2 in O) && O[index2] === el)
                  return IS_INCLUDES || index2 || 0;
              }
            return !IS_INCLUDES && -1;
          };
        };
        module2.exports = {
          includes: createMethod(true),
          indexOf: createMethod(false)
        };
      },
      "4de4": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $filter = __webpack_require__("b727").filter;
        var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("filter");
        var USES_TO_LENGTH = arrayMethodUsesToLength("filter");
        $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
          filter: function filter(callbackfn) {
            return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
      },
      "4df4": function(module2, exports2, __webpack_require__) {
        var bind = __webpack_require__("0366");
        var toObject = __webpack_require__("7b0b");
        var callWithSafeIterationClosing = __webpack_require__("9bdd");
        var isArrayIteratorMethod = __webpack_require__("e95a");
        var toLength = __webpack_require__("50c4");
        var createProperty = __webpack_require__("8418");
        var getIteratorMethod = __webpack_require__("35a1");
        module2.exports = function from(arrayLike) {
          var O = toObject(arrayLike);
          var C = typeof this == "function" ? this : Array;
          var argumentsLength = arguments.length;
          var mapfn = argumentsLength > 1 ? arguments[1] : void 0;
          var mapping = mapfn !== void 0;
          var iteratorMethod = getIteratorMethod(O);
          var index2 = 0;
          var length, result, step, iterator, next, value;
          if (mapping)
            mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : void 0, 2);
          if (iteratorMethod != void 0 && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
            iterator = iteratorMethod.call(O);
            next = iterator.next;
            result = new C();
            for (; !(step = next.call(iterator)).done; index2++) {
              value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index2], true) : step.value;
              createProperty(result, index2, value);
            }
          } else {
            length = toLength(O.length);
            result = new C(length);
            for (; length > index2; index2++) {
              value = mapping ? mapfn(O[index2], index2) : O[index2];
              createProperty(result, index2, value);
            }
          }
          result.length = index2;
          return result;
        };
      },
      "4fad": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $entries = __webpack_require__("6f53").entries;
        $({ target: "Object", stat: true }, {
          entries: function entries(O) {
            return $entries(O);
          }
        });
      },
      "50c4": function(module2, exports2, __webpack_require__) {
        var toInteger = __webpack_require__("a691");
        var min = Math.min;
        module2.exports = function(argument) {
          return argument > 0 ? min(toInteger(argument), 9007199254740991) : 0;
        };
      },
      "5135": function(module2, exports2) {
        var hasOwnProperty2 = {}.hasOwnProperty;
        module2.exports = function(it, key) {
          return hasOwnProperty2.call(it, key);
        };
      },
      "5319": function(module2, exports2, __webpack_require__) {
        var fixRegExpWellKnownSymbolLogic = __webpack_require__("d784");
        var anObject = __webpack_require__("825a");
        var toObject = __webpack_require__("7b0b");
        var toLength = __webpack_require__("50c4");
        var toInteger = __webpack_require__("a691");
        var requireObjectCoercible = __webpack_require__("1d80");
        var advanceStringIndex = __webpack_require__("8aa5");
        var regExpExec = __webpack_require__("14c3");
        var max = Math.max;
        var min = Math.min;
        var floor = Math.floor;
        var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
        var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;
        var maybeToString = function(it) {
          return it === void 0 ? it : String(it);
        };
        fixRegExpWellKnownSymbolLogic("replace", 2, function(REPLACE, nativeReplace, maybeCallNative, reason) {
          var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
          var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
          var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? "$" : "$0";
          return [
            function replace(searchValue, replaceValue) {
              var O = requireObjectCoercible(this);
              var replacer2 = searchValue == void 0 ? void 0 : searchValue[REPLACE];
              return replacer2 !== void 0 ? replacer2.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
            },
            function(regexp, replaceValue) {
              if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === "string" && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
                var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
                if (res.done)
                  return res.value;
              }
              var rx = anObject(regexp);
              var S = String(this);
              var functionalReplace = typeof replaceValue === "function";
              if (!functionalReplace)
                replaceValue = String(replaceValue);
              rx.global;
              if (window) {
                var fullUnicode = rx.unicode;
                rx.lastIndex = 0;
              }
              var results = [];
              while (true) {
                var result = regExpExec(rx, S);
                if (result === null)
                  break;
                results.push(result);
                if (!window)
                  break;
                var matchStr = String(result[0]);
                if (matchStr === "")
                  rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
              }
              var accumulatedResult = "";
              var nextSourcePosition = 0;
              for (var i2 = 0; i2 < results.length; i2++) {
                result = results[i2];
                var matched = String(result[0]);
                var position = max(min(toInteger(result.index), S.length), 0);
                var captures = [];
                for (var j = 1; j < result.length; j++)
                  captures.push(maybeToString(result[j]));
                var namedCaptures = result.groups;
                if (functionalReplace) {
                  var replacerArgs = [matched].concat(captures, position, S);
                  if (namedCaptures !== void 0)
                    replacerArgs.push(namedCaptures);
                  var replacement = String(replaceValue.apply(void 0, replacerArgs));
                } else {
                  replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
                }
                if (position >= nextSourcePosition) {
                  accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
                  nextSourcePosition = position + matched.length;
                }
              }
              return accumulatedResult + S.slice(nextSourcePosition);
            }
          ];
          function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
            var tailPos = position + matched.length;
            var m2 = captures.length;
            var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
            if (namedCaptures !== void 0) {
              namedCaptures = toObject(namedCaptures);
              symbols = SUBSTITUTION_SYMBOLS;
            }
            return nativeReplace.call(replacement, symbols, function(match, ch) {
              var capture;
              switch (ch.charAt(0)) {
                case "$":
                  return "$";
                case "&":
                  return matched;
                case "`":
                  return str.slice(0, position);
                case "'":
                  return str.slice(tailPos);
                case "<":
                  capture = namedCaptures[ch.slice(1, -1)];
                  break;
                default:
                  var n2 = +ch;
                  if (n2 === 0)
                    return match;
                  if (n2 > m2) {
                    var f2 = floor(n2 / 10);
                    if (f2 === 0)
                      return match;
                    if (f2 <= m2)
                      return captures[f2 - 1] === void 0 ? ch.charAt(1) : captures[f2 - 1] + ch.charAt(1);
                    return match;
                  }
                  capture = captures[n2 - 1];
              }
              return capture === void 0 ? "" : capture;
            });
          }
        });
      },
      "5692": function(module2, exports2, __webpack_require__) {
        var IS_PURE = __webpack_require__("c430");
        var store = __webpack_require__("c6cd");
        (module2.exports = function(key, value) {
          return store[key] || (store[key] = value !== void 0 ? value : {});
        })("versions", []).push({
          version: "3.6.5",
          mode: IS_PURE ? "pure" : "window",
          copyright: "\xA9 2020 Denis Pushkarev (zloirock.ru)"
        });
      },
      "56ef": function(module2, exports2, __webpack_require__) {
        var getBuiltIn = __webpack_require__("d066");
        var getOwnPropertyNamesModule = __webpack_require__("241c");
        var getOwnPropertySymbolsModule = __webpack_require__("7418");
        var anObject = __webpack_require__("825a");
        module2.exports = getBuiltIn("Reflect", "ownKeys") || function ownKeys2(it) {
          var keys = getOwnPropertyNamesModule.f(anObject(it));
          var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
          return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
        };
      },
      "5a34": function(module2, exports2, __webpack_require__) {
        var isRegExp = __webpack_require__("44e7");
        module2.exports = function(it) {
          if (isRegExp(it)) {
            throw TypeError("The method doesn't accept regular expressions");
          }
          return it;
        };
      },
      "5c6c": function(module2, exports2) {
        module2.exports = function(bitmap, value) {
          return {
            enumerable: !(bitmap & 1),
            configurable: !(bitmap & 2),
            writable: !(bitmap & 4),
            value
          };
        };
      },
      "5db7": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var flattenIntoArray = __webpack_require__("a2bf");
        var toObject = __webpack_require__("7b0b");
        var toLength = __webpack_require__("50c4");
        var aFunction = __webpack_require__("1c0b");
        var arraySpeciesCreate = __webpack_require__("65f0");
        $({ target: "Array", proto: true }, {
          flatMap: function flatMap(callbackfn) {
            var O = toObject(this);
            var sourceLen = toLength(O.length);
            var A;
            aFunction(callbackfn);
            A = arraySpeciesCreate(O, 0);
            A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
            return A;
          }
        });
      },
      "6547": function(module2, exports2, __webpack_require__) {
        var toInteger = __webpack_require__("a691");
        var requireObjectCoercible = __webpack_require__("1d80");
        var createMethod = function(CONVERT_TO_STRING) {
          return function($this, pos) {
            var S = String(requireObjectCoercible($this));
            var position = toInteger(pos);
            var size2 = S.length;
            var first, second;
            if (position < 0 || position >= size2)
              return CONVERT_TO_STRING ? "" : void 0;
            first = S.charCodeAt(position);
            return first < 55296 || first > 56319 || position + 1 === size2 || (second = S.charCodeAt(position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
          };
        };
        module2.exports = {
          codeAt: createMethod(false),
          charAt: createMethod(true)
        };
      },
      "65f0": function(module2, exports2, __webpack_require__) {
        var isObject2 = __webpack_require__("861d");
        var isArray2 = __webpack_require__("e8b5");
        var wellKnownSymbol = __webpack_require__("b622");
        var SPECIES = wellKnownSymbol("species");
        module2.exports = function(originalArray, length) {
          var C;
          if (isArray2(originalArray)) {
            C = originalArray.constructor;
            if (typeof C == "function" && (C === Array || isArray2(C.prototype)))
              C = void 0;
            else if (isObject2(C)) {
              C = C[SPECIES];
              if (C === null)
                C = void 0;
            }
          }
          return new (C === void 0 ? Array : C)(length === 0 ? 0 : length);
        };
      },
      "69f3": function(module2, exports2, __webpack_require__) {
        var NATIVE_WEAK_MAP = __webpack_require__("7f9a");
        __webpack_require__("da84");
        var isObject2 = __webpack_require__("861d");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var objectHas = __webpack_require__("5135");
        var sharedKey = __webpack_require__("f772");
        var hiddenKeys = __webpack_require__("d012");
        var WeakMap2 = window.WeakMap;
        var set2, get2, has2;
        var enforce = function(it) {
          return has2(it) ? get2(it) : set2(it, {});
        };
        var getterFor = function(TYPE) {
          return function(it) {
            var state;
            if (!isObject2(it) || (state = get2(it)).type !== TYPE) {
              throw TypeError("Incompatible receiver, " + TYPE + " required");
            }
            return state;
          };
        };
        if (NATIVE_WEAK_MAP) {
          var store = new WeakMap2();
          var wmget = store.get;
          var wmhas = store.has;
          var wmset = store.set;
          set2 = function(it, metadata) {
            wmset.call(store, it, metadata);
            return metadata;
          };
          get2 = function(it) {
            return wmget.call(store, it) || {};
          };
          has2 = function(it) {
            return wmhas.call(store, it);
          };
        } else {
          var STATE = sharedKey("state");
          hiddenKeys[STATE] = true;
          set2 = function(it, metadata) {
            createNonEnumerableProperty(it, STATE, metadata);
            return metadata;
          };
          get2 = function(it) {
            return objectHas(it, STATE) ? it[STATE] : {};
          };
          has2 = function(it) {
            return objectHas(it, STATE);
          };
        }
        module2.exports = {
          set: set2,
          get: get2,
          has: has2,
          enforce,
          getterFor
        };
      },
      "6eeb": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var has2 = __webpack_require__("5135");
        var setGlobal = __webpack_require__("ce4e");
        var inspectSource = __webpack_require__("8925");
        var InternalStateModule = __webpack_require__("69f3");
        var getInternalState = InternalStateModule.get;
        var enforceInternalState = InternalStateModule.enforce;
        var TEMPLATE = String(String).split("String");
        (module2.exports = function(O, key, value, options) {
          var unsafe = options ? !!options.unsafe : false;
          var simple = options ? !!options.enumerable : false;
          var noTargetGet = options ? !!options.noTargetGet : false;
          if (typeof value == "function") {
            if (typeof key == "string" && !has2(value, "name"))
              createNonEnumerableProperty(value, "name", key);
            enforceInternalState(value).source = TEMPLATE.join(typeof key == "string" ? key : "");
          }
          if (O === window) {
            if (simple)
              O[key] = value;
            else
              setGlobal(key, value);
            return;
          } else if (!unsafe) {
            delete O[key];
          } else if (!noTargetGet && O[key]) {
            simple = true;
          }
          if (simple)
            O[key] = value;
          else
            createNonEnumerableProperty(O, key, value);
        })(Function.prototype, "toString", function toString() {
          return typeof this == "function" && getInternalState(this).source || inspectSource(this);
        });
      },
      "6f53": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var objectKeys = __webpack_require__("df75");
        var toIndexedObject = __webpack_require__("fc6a");
        var propertyIsEnumerable = __webpack_require__("d1e7").f;
        var createMethod = function(TO_ENTRIES) {
          return function(it) {
            var O = toIndexedObject(it);
            var keys = objectKeys(O);
            var length = keys.length;
            var i2 = 0;
            var result = [];
            var key;
            while (length > i2) {
              key = keys[i2++];
              if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
                result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
              }
            }
            return result;
          };
        };
        module2.exports = {
          entries: createMethod(true),
          values: createMethod(false)
        };
      },
      "73d9": function(module2, exports2, __webpack_require__) {
        var addToUnscopables = __webpack_require__("44d2");
        addToUnscopables("flatMap");
      },
      "7418": function(module2, exports2) {
        exports2.f = Object.getOwnPropertySymbols;
      },
      "746f": function(module2, exports2, __webpack_require__) {
        var path = __webpack_require__("428f");
        var has2 = __webpack_require__("5135");
        var wrappedWellKnownSymbolModule = __webpack_require__("e538");
        var defineProperty = __webpack_require__("9bf2").f;
        module2.exports = function(NAME) {
          var Symbol2 = path.Symbol || (path.Symbol = {});
          if (!has2(Symbol2, NAME))
            defineProperty(Symbol2, NAME, {
              value: wrappedWellKnownSymbolModule.f(NAME)
            });
        };
      },
      "7839": function(module2, exports2) {
        module2.exports = [
          "constructor",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "toLocaleString",
          "toString",
          "valueOf"
        ];
      },
      "7b0b": function(module2, exports2, __webpack_require__) {
        var requireObjectCoercible = __webpack_require__("1d80");
        module2.exports = function(argument) {
          return Object(requireObjectCoercible(argument));
        };
      },
      "7c73": function(module2, exports2, __webpack_require__) {
        var anObject = __webpack_require__("825a");
        var defineProperties = __webpack_require__("37e8");
        var enumBugKeys = __webpack_require__("7839");
        var hiddenKeys = __webpack_require__("d012");
        var html = __webpack_require__("1be4");
        var documentCreateElement = __webpack_require__("cc12");
        var sharedKey = __webpack_require__("f772");
        var GT = ">";
        var LT = "<";
        var PROTOTYPE = "prototype";
        var SCRIPT = "script";
        var IE_PROTO = sharedKey("IE_PROTO");
        var EmptyConstructor = function() {
        };
        var scriptTag = function(content) {
          return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
        };
        var NullProtoObjectViaActiveX = function(activeXDocument2) {
          activeXDocument2.write(scriptTag(""));
          activeXDocument2.close();
          var temp = activeXDocument2.parentWindow.Object;
          activeXDocument2 = null;
          return temp;
        };
        var NullProtoObjectViaIFrame = function() {
          var iframe = documentCreateElement("iframe");
          var JS = "java" + SCRIPT + ":";
          var iframeDocument;
          iframe.style.display = "none";
          html.appendChild(iframe);
          iframe.src = String(JS);
          iframeDocument = iframe.contentWindow.document;
          iframeDocument.open();
          iframeDocument.write(scriptTag("document.F=Object"));
          iframeDocument.close();
          return iframeDocument.F;
        };
        var activeXDocument;
        var NullProtoObject = function() {
          try {
            activeXDocument = document.domain && new ActiveXObject("htmlfile");
          } catch (error) {
          }
          NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
          var length = enumBugKeys.length;
          while (length--)
            delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
          return NullProtoObject();
        };
        hiddenKeys[IE_PROTO] = true;
        module2.exports = Object.create || function create(O, Properties) {
          var result;
          if (O !== null) {
            EmptyConstructor[PROTOTYPE] = anObject(O);
            result = new EmptyConstructor();
            EmptyConstructor[PROTOTYPE] = null;
            result[IE_PROTO] = O;
          } else
            result = NullProtoObject();
          return Properties === void 0 ? result : defineProperties(result, Properties);
        };
      },
      "7dd0": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var createIteratorConstructor = __webpack_require__("9ed3");
        var getPrototypeOf = __webpack_require__("e163");
        var setPrototypeOf = __webpack_require__("d2bb");
        var setToStringTag = __webpack_require__("d44e");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var redefine = __webpack_require__("6eeb");
        var wellKnownSymbol = __webpack_require__("b622");
        var IS_PURE = __webpack_require__("c430");
        var Iterators = __webpack_require__("3f8c");
        var IteratorsCore = __webpack_require__("ae93");
        var IteratorPrototype = IteratorsCore.IteratorPrototype;
        var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
        var ITERATOR = wellKnownSymbol("iterator");
        var KEYS = "keys";
        var VALUES = "values";
        var ENTRIES = "entries";
        var returnThis = function() {
          return this;
        };
        module2.exports = function(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
          createIteratorConstructor(IteratorConstructor, NAME, next);
          var getIterationMethod = function(KIND) {
            if (KIND === DEFAULT && defaultIterator)
              return defaultIterator;
            if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype)
              return IterablePrototype[KIND];
            switch (KIND) {
              case KEYS:
                return function keys() {
                  return new IteratorConstructor(this, KIND);
                };
              case VALUES:
                return function values() {
                  return new IteratorConstructor(this, KIND);
                };
              case ENTRIES:
                return function entries() {
                  return new IteratorConstructor(this, KIND);
                };
            }
            return function() {
              return new IteratorConstructor(this);
            };
          };
          var TO_STRING_TAG = NAME + " Iterator";
          var INCORRECT_VALUES_NAME = false;
          var IterablePrototype = Iterable.prototype;
          var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype["@@iterator"] || DEFAULT && IterablePrototype[DEFAULT];
          var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
          var anyNativeIterator = NAME == "Array" ? IterablePrototype.entries || nativeIterator : nativeIterator;
          var CurrentIteratorPrototype, methods, KEY;
          if (anyNativeIterator) {
            CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
            if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
              if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
                if (setPrototypeOf) {
                  setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
                } else if (typeof CurrentIteratorPrototype[ITERATOR] != "function") {
                  createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
                }
              }
              setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
              if (IS_PURE)
                Iterators[TO_STRING_TAG] = returnThis;
            }
          }
          if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
            INCORRECT_VALUES_NAME = true;
            defaultIterator = function values() {
              return nativeIterator.call(this);
            };
          }
          if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
            createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
          }
          Iterators[NAME] = defaultIterator;
          if (DEFAULT) {
            methods = {
              values: getIterationMethod(VALUES),
              keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
              entries: getIterationMethod(ENTRIES)
            };
            if (FORCED)
              for (KEY in methods) {
                if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
                  redefine(IterablePrototype, KEY, methods[KEY]);
                }
              }
            else
              $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
          }
          return methods;
        };
      },
      "7f9a": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var inspectSource = __webpack_require__("8925");
        var WeakMap2 = window.WeakMap;
        module2.exports = typeof WeakMap2 === "function" && /native code/.test(inspectSource(WeakMap2));
      },
      "825a": function(module2, exports2, __webpack_require__) {
        var isObject2 = __webpack_require__("861d");
        module2.exports = function(it) {
          if (!isObject2(it)) {
            throw TypeError(String(it) + " is not an object");
          }
          return it;
        };
      },
      "83ab": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        module2.exports = !fails(function() {
          return Object.defineProperty({}, 1, { get: function() {
            return 7;
          } })[1] != 7;
        });
      },
      "8418": function(module2, exports2, __webpack_require__) {
        var toPrimitive = __webpack_require__("c04e");
        var definePropertyModule = __webpack_require__("9bf2");
        var createPropertyDescriptor = __webpack_require__("5c6c");
        module2.exports = function(object, key, value) {
          var propertyKey = toPrimitive(key);
          if (propertyKey in object)
            definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
          else
            object[propertyKey] = value;
        };
      },
      "861d": function(module2, exports2) {
        module2.exports = function(it) {
          return typeof it === "object" ? it !== null : typeof it === "function";
        };
      },
      "8875": function(module2, exports2, __webpack_require__) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        (function(root, factory) {
          {
            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          }
        })(typeof self !== "undefined" ? self : this, function() {
          function getCurrentScript() {
            var descriptor = Object.getOwnPropertyDescriptor(document, "currentScript");
            if (!descriptor && "currentScript" in document && document.currentScript) {
              return document.currentScript;
            }
            if (descriptor && descriptor.get !== getCurrentScript && document.currentScript) {
              return document.currentScript;
            }
            try {
              throw new Error();
            } catch (err) {
              var ieStackRegExp = /.*at [^(]*\((.*):(.+):(.+)\)$/ig, ffStackRegExp = /@([^@]*):(\d+):(\d+)\s*$/ig, stackDetails = ieStackRegExp.exec(err.stack) || ffStackRegExp.exec(err.stack), scriptLocation = stackDetails && stackDetails[1] || false, line = stackDetails && stackDetails[2] || false, currentLocation = document.location.href.replace(document.location.hash, ""), pageSource, inlineScriptSourceRegExp, inlineScriptSource, scripts = document.getElementsByTagName("script");
              if (scriptLocation === currentLocation) {
                pageSource = document.documentElement.outerHTML;
                inlineScriptSourceRegExp = new RegExp("(?:[^\\n]+?\\n){0," + (line - 2) + "}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*", "i");
                inlineScriptSource = pageSource.replace(inlineScriptSourceRegExp, "$1").trim();
              }
              for (var i2 = 0; i2 < scripts.length; i2++) {
                if (scripts[i2].readyState === "interactive") {
                  return scripts[i2];
                }
                if (scripts[i2].src === scriptLocation) {
                  return scripts[i2];
                }
                if (scriptLocation === currentLocation && scripts[i2].innerHTML && scripts[i2].innerHTML.trim() === inlineScriptSource) {
                  return scripts[i2];
                }
              }
              return null;
            }
          }
          return getCurrentScript;
        });
      },
      "8925": function(module2, exports2, __webpack_require__) {
        var store = __webpack_require__("c6cd");
        var functionToString = Function.toString;
        if (typeof store.inspectSource != "function") {
          store.inspectSource = function(it) {
            return functionToString.call(it);
          };
        }
        module2.exports = store.inspectSource;
      },
      "8aa5": function(module2, exports2, __webpack_require__) {
        var charAt = __webpack_require__("6547").charAt;
        module2.exports = function(S, index2, unicode) {
          return index2 + (unicode ? charAt(S, index2).length : 1);
        };
      },
      "8bbf": function(module2, exports2) {
        module2.exports = __WEBPACK_EXTERNAL_MODULE__8bbf__;
      },
      "90e3": function(module2, exports2) {
        var id = 0;
        var postfix = Math.random();
        module2.exports = function(key) {
          return "Symbol(" + String(key === void 0 ? "" : key) + ")_" + (++id + postfix).toString(36);
        };
      },
      "9112": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var definePropertyModule = __webpack_require__("9bf2");
        var createPropertyDescriptor = __webpack_require__("5c6c");
        module2.exports = DESCRIPTORS ? function(object, key, value) {
          return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
        } : function(object, key, value) {
          object[key] = value;
          return object;
        };
      },
      "9263": function(module2, exports2, __webpack_require__) {
        var regexpFlags = __webpack_require__("ad6d");
        var stickyHelpers = __webpack_require__("9f7f");
        var nativeExec = RegExp.prototype.exec;
        var nativeReplace = String.prototype.replace;
        var patchedExec = nativeExec;
        var UPDATES_LAST_INDEX_WRONG = function() {
          var re1 = /a/;
          var re2 = /b*/g;
          nativeExec.call(re1, "a");
          nativeExec.call(re2, "a");
          return re1.lastIndex !== 0 || re2.lastIndex !== 0;
        }();
        var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;
        var NPCG_INCLUDED = /()??/.exec("")[1] !== void 0;
        var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;
        if (PATCH) {
          patchedExec = function exec(str) {
            var re = this;
            var lastIndex, reCopy, match, i2;
            var sticky = UNSUPPORTED_Y && re.sticky;
            var flags = regexpFlags.call(re);
            var source = re.source;
            var charsAdded = 0;
            var strCopy = str;
            if (sticky) {
              flags = flags.replace("y", "");
              if (flags.indexOf("g") === -1) {
                flags += "g";
              }
              strCopy = String(str).slice(re.lastIndex);
              if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== "\n")) {
                source = "(?: " + source + ")";
                strCopy = " " + strCopy;
                charsAdded++;
              }
              reCopy = new RegExp("^(?:" + source + ")", flags);
            }
            if (NPCG_INCLUDED) {
              reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
            }
            if (UPDATES_LAST_INDEX_WRONG)
              lastIndex = re.lastIndex;
            match = nativeExec.call(sticky ? reCopy : re, strCopy);
            if (sticky) {
              if (match) {
                match.input = match.input.slice(charsAdded);
                match[0] = match[0].slice(charsAdded);
                match.index = re.lastIndex;
                re.lastIndex += match[0].length;
              } else
                re.lastIndex = 0;
            } else if (UPDATES_LAST_INDEX_WRONG && match) {
              re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
            }
            if (NPCG_INCLUDED && match && match.length > 1) {
              nativeReplace.call(match[0], reCopy, function() {
                for (i2 = 1; i2 < arguments.length - 2; i2++) {
                  if (arguments[i2] === void 0)
                    match[i2] = void 0;
                }
              });
            }
            return match;
          };
        }
        module2.exports = patchedExec;
      },
      "94ca": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        var replacement = /#|\.prototype\./;
        var isForced = function(feature, detection) {
          var value = data[normalize2(feature)];
          return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == "function" ? fails(detection) : !!detection;
        };
        var normalize2 = isForced.normalize = function(string) {
          return String(string).replace(replacement, ".").toLowerCase();
        };
        var data = isForced.data = {};
        var NATIVE = isForced.NATIVE = "N";
        var POLYFILL = isForced.POLYFILL = "P";
        module2.exports = isForced;
      },
      "99af": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var fails = __webpack_require__("d039");
        var isArray2 = __webpack_require__("e8b5");
        var isObject2 = __webpack_require__("861d");
        var toObject = __webpack_require__("7b0b");
        var toLength = __webpack_require__("50c4");
        var createProperty = __webpack_require__("8418");
        var arraySpeciesCreate = __webpack_require__("65f0");
        var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
        var wellKnownSymbol = __webpack_require__("b622");
        var V8_VERSION = __webpack_require__("2d00");
        var IS_CONCAT_SPREADABLE = wellKnownSymbol("isConcatSpreadable");
        var MAX_SAFE_INTEGER = 9007199254740991;
        var MAXIMUM_ALLOWED_INDEX_EXCEEDED = "Maximum allowed index exceeded";
        var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function() {
          var array = [];
          array[IS_CONCAT_SPREADABLE] = false;
          return array.concat()[0] !== array;
        });
        var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("concat");
        var isConcatSpreadable = function(O) {
          if (!isObject2(O))
            return false;
          var spreadable = O[IS_CONCAT_SPREADABLE];
          return spreadable !== void 0 ? !!spreadable : isArray2(O);
        };
        var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;
        $({ target: "Array", proto: true, forced: FORCED }, {
          concat: function concat(arg) {
            var O = toObject(this);
            var A = arraySpeciesCreate(O, 0);
            var n2 = 0;
            var i2, k, length, len2, E;
            for (i2 = -1, length = arguments.length; i2 < length; i2++) {
              E = i2 === -1 ? O : arguments[i2];
              if (isConcatSpreadable(E)) {
                len2 = toLength(E.length);
                if (n2 + len2 > MAX_SAFE_INTEGER)
                  throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                for (k = 0; k < len2; k++, n2++)
                  if (k in E)
                    createProperty(A, n2, E[k]);
              } else {
                if (n2 >= MAX_SAFE_INTEGER)
                  throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                createProperty(A, n2++, E);
              }
            }
            A.length = n2;
            return A;
          }
        });
      },
      "9bdd": function(module2, exports2, __webpack_require__) {
        var anObject = __webpack_require__("825a");
        module2.exports = function(iterator, fn, value, ENTRIES) {
          try {
            return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
          } catch (error) {
            var returnMethod = iterator["return"];
            if (returnMethod !== void 0)
              anObject(returnMethod.call(iterator));
            throw error;
          }
        };
      },
      "9bf2": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var IE8_DOM_DEFINE = __webpack_require__("0cfb");
        var anObject = __webpack_require__("825a");
        var toPrimitive = __webpack_require__("c04e");
        var nativeDefineProperty = Object.defineProperty;
        exports2.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
          anObject(O);
          P = toPrimitive(P, true);
          anObject(Attributes);
          if (IE8_DOM_DEFINE)
            try {
              return nativeDefineProperty(O, P, Attributes);
            } catch (error) {
            }
          if ("get" in Attributes || "set" in Attributes)
            throw TypeError("Accessors not supported");
          if ("value" in Attributes)
            O[P] = Attributes.value;
          return O;
        };
      },
      "9ed3": function(module2, exports2, __webpack_require__) {
        var IteratorPrototype = __webpack_require__("ae93").IteratorPrototype;
        var create = __webpack_require__("7c73");
        var createPropertyDescriptor = __webpack_require__("5c6c");
        var setToStringTag = __webpack_require__("d44e");
        var Iterators = __webpack_require__("3f8c");
        var returnThis = function() {
          return this;
        };
        module2.exports = function(IteratorConstructor, NAME, next) {
          var TO_STRING_TAG = NAME + " Iterator";
          IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
          setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
          Iterators[TO_STRING_TAG] = returnThis;
          return IteratorConstructor;
        };
      },
      "9f7f": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        function RE(s2, f2) {
          return RegExp(s2, f2);
        }
        exports2.UNSUPPORTED_Y = fails(function() {
          var re = RE("a", "y");
          re.lastIndex = 2;
          return re.exec("abcd") != null;
        });
        exports2.BROKEN_CARET = fails(function() {
          var re = RE("^r", "gy");
          re.lastIndex = 2;
          return re.exec("str") != null;
        });
      },
      "a2bf": function(module2, exports2, __webpack_require__) {
        var isArray2 = __webpack_require__("e8b5");
        var toLength = __webpack_require__("50c4");
        var bind = __webpack_require__("0366");
        var flattenIntoArray = function(target, original, source, sourceLen, start, depth, mapper, thisArg) {
          var targetIndex = start;
          var sourceIndex = 0;
          var mapFn = mapper ? bind(mapper, thisArg, 3) : false;
          var element;
          while (sourceIndex < sourceLen) {
            if (sourceIndex in source) {
              element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
              if (depth > 0 && isArray2(element)) {
                targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
              } else {
                if (targetIndex >= 9007199254740991)
                  throw TypeError("Exceed the acceptable array length");
                target[targetIndex] = element;
              }
              targetIndex++;
            }
            sourceIndex++;
          }
          return targetIndex;
        };
        module2.exports = flattenIntoArray;
      },
      "a352": function(module2, exports2) {
        module2.exports = __WEBPACK_EXTERNAL_MODULE_a352__;
      },
      "a434": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var toAbsoluteIndex = __webpack_require__("23cb");
        var toInteger = __webpack_require__("a691");
        var toLength = __webpack_require__("50c4");
        var toObject = __webpack_require__("7b0b");
        var arraySpeciesCreate = __webpack_require__("65f0");
        var createProperty = __webpack_require__("8418");
        var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("splice");
        var USES_TO_LENGTH = arrayMethodUsesToLength("splice", { ACCESSORS: true, 0: 0, 1: 2 });
        var max = Math.max;
        var min = Math.min;
        var MAX_SAFE_INTEGER = 9007199254740991;
        var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = "Maximum allowed length exceeded";
        $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
          splice: function splice(start, deleteCount) {
            var O = toObject(this);
            var len2 = toLength(O.length);
            var actualStart = toAbsoluteIndex(start, len2);
            var argumentsLength = arguments.length;
            var insertCount, actualDeleteCount, A, k, from, to;
            if (argumentsLength === 0) {
              insertCount = actualDeleteCount = 0;
            } else if (argumentsLength === 1) {
              insertCount = 0;
              actualDeleteCount = len2 - actualStart;
            } else {
              insertCount = argumentsLength - 2;
              actualDeleteCount = min(max(toInteger(deleteCount), 0), len2 - actualStart);
            }
            if (len2 + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
              throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
            }
            A = arraySpeciesCreate(O, actualDeleteCount);
            for (k = 0; k < actualDeleteCount; k++) {
              from = actualStart + k;
              if (from in O)
                createProperty(A, k, O[from]);
            }
            A.length = actualDeleteCount;
            if (insertCount < actualDeleteCount) {
              for (k = actualStart; k < len2 - actualDeleteCount; k++) {
                from = k + actualDeleteCount;
                to = k + insertCount;
                if (from in O)
                  O[to] = O[from];
                else
                  delete O[to];
              }
              for (k = len2; k > len2 - actualDeleteCount + insertCount; k--)
                delete O[k - 1];
            } else if (insertCount > actualDeleteCount) {
              for (k = len2 - actualDeleteCount; k > actualStart; k--) {
                from = k + actualDeleteCount - 1;
                to = k + insertCount - 1;
                if (from in O)
                  O[to] = O[from];
                else
                  delete O[to];
              }
            }
            for (k = 0; k < insertCount; k++) {
              O[k + actualStart] = arguments[k + 2];
            }
            O.length = len2 - actualDeleteCount + insertCount;
            return A;
          }
        });
      },
      "a4d3": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        __webpack_require__("da84");
        var getBuiltIn = __webpack_require__("d066");
        var IS_PURE = __webpack_require__("c430");
        var DESCRIPTORS = __webpack_require__("83ab");
        var NATIVE_SYMBOL = __webpack_require__("4930");
        var USE_SYMBOL_AS_UID = __webpack_require__("fdbf");
        var fails = __webpack_require__("d039");
        var has2 = __webpack_require__("5135");
        var isArray2 = __webpack_require__("e8b5");
        var isObject2 = __webpack_require__("861d");
        var anObject = __webpack_require__("825a");
        var toObject = __webpack_require__("7b0b");
        var toIndexedObject = __webpack_require__("fc6a");
        var toPrimitive = __webpack_require__("c04e");
        var createPropertyDescriptor = __webpack_require__("5c6c");
        var nativeObjectCreate = __webpack_require__("7c73");
        var objectKeys = __webpack_require__("df75");
        var getOwnPropertyNamesModule = __webpack_require__("241c");
        var getOwnPropertyNamesExternal = __webpack_require__("057f");
        var getOwnPropertySymbolsModule = __webpack_require__("7418");
        var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
        var definePropertyModule = __webpack_require__("9bf2");
        var propertyIsEnumerableModule = __webpack_require__("d1e7");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var redefine = __webpack_require__("6eeb");
        var shared = __webpack_require__("5692");
        var sharedKey = __webpack_require__("f772");
        var hiddenKeys = __webpack_require__("d012");
        var uid2 = __webpack_require__("90e3");
        var wellKnownSymbol = __webpack_require__("b622");
        var wrappedWellKnownSymbolModule = __webpack_require__("e538");
        var defineWellKnownSymbol = __webpack_require__("746f");
        var setToStringTag = __webpack_require__("d44e");
        var InternalStateModule = __webpack_require__("69f3");
        var $forEach = __webpack_require__("b727").forEach;
        var HIDDEN = sharedKey("hidden");
        var SYMBOL = "Symbol";
        var PROTOTYPE = "prototype";
        var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
        var setInternalState = InternalStateModule.set;
        var getInternalState = InternalStateModule.getterFor(SYMBOL);
        var ObjectPrototype = Object[PROTOTYPE];
        var $Symbol = window.Symbol;
        var $stringify = getBuiltIn("JSON", "stringify");
        var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
        var nativeDefineProperty = definePropertyModule.f;
        var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
        var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
        var AllSymbols = shared("symbols");
        var ObjectPrototypeSymbols = shared("op-symbols");
        var StringToSymbolRegistry = shared("string-to-symbol-registry");
        var SymbolToStringRegistry = shared("symbol-to-string-registry");
        var WellKnownSymbolsStore = shared("wks");
        var QObject = window.QObject;
        var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
        var setSymbolDescriptor = DESCRIPTORS && fails(function() {
          return nativeObjectCreate(nativeDefineProperty({}, "a", {
            get: function() {
              return nativeDefineProperty(this, "a", { value: 7 }).a;
            }
          })).a != 7;
        }) ? function(O, P, Attributes) {
          var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
          if (ObjectPrototypeDescriptor)
            delete ObjectPrototype[P];
          nativeDefineProperty(O, P, Attributes);
          if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
            nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
          }
        } : nativeDefineProperty;
        var wrap = function(tag, description) {
          var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
          setInternalState(symbol, {
            type: SYMBOL,
            tag,
            description
          });
          if (!DESCRIPTORS)
            symbol.description = description;
          return symbol;
        };
        var isSymbol2 = USE_SYMBOL_AS_UID ? function(it) {
          return typeof it == "symbol";
        } : function(it) {
          return Object(it) instanceof $Symbol;
        };
        var $defineProperty = function defineProperty(O, P, Attributes) {
          if (O === ObjectPrototype)
            $defineProperty(ObjectPrototypeSymbols, P, Attributes);
          anObject(O);
          var key = toPrimitive(P, true);
          anObject(Attributes);
          if (has2(AllSymbols, key)) {
            if (!Attributes.enumerable) {
              if (!has2(O, HIDDEN))
                nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
              O[HIDDEN][key] = true;
            } else {
              if (has2(O, HIDDEN) && O[HIDDEN][key])
                O[HIDDEN][key] = false;
              Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
            }
            return setSymbolDescriptor(O, key, Attributes);
          }
          return nativeDefineProperty(O, key, Attributes);
        };
        var $defineProperties = function defineProperties(O, Properties) {
          anObject(O);
          var properties = toIndexedObject(Properties);
          var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
          $forEach(keys, function(key) {
            if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key))
              $defineProperty(O, key, properties[key]);
          });
          return O;
        };
        var $create = function create(O, Properties) {
          return Properties === void 0 ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
        };
        var $propertyIsEnumerable = function propertyIsEnumerable(V) {
          var P = toPrimitive(V, true);
          var enumerable = nativePropertyIsEnumerable.call(this, P);
          if (this === ObjectPrototype && has2(AllSymbols, P) && !has2(ObjectPrototypeSymbols, P))
            return false;
          return enumerable || !has2(this, P) || !has2(AllSymbols, P) || has2(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
        };
        var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
          var it = toIndexedObject(O);
          var key = toPrimitive(P, true);
          if (it === ObjectPrototype && has2(AllSymbols, key) && !has2(ObjectPrototypeSymbols, key))
            return;
          var descriptor = nativeGetOwnPropertyDescriptor(it, key);
          if (descriptor && has2(AllSymbols, key) && !(has2(it, HIDDEN) && it[HIDDEN][key])) {
            descriptor.enumerable = true;
          }
          return descriptor;
        };
        var $getOwnPropertyNames = function getOwnPropertyNames(O) {
          var names = nativeGetOwnPropertyNames(toIndexedObject(O));
          var result = [];
          $forEach(names, function(key) {
            if (!has2(AllSymbols, key) && !has2(hiddenKeys, key))
              result.push(key);
          });
          return result;
        };
        var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
          var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
          var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
          var result = [];
          $forEach(names, function(key) {
            if (has2(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has2(ObjectPrototype, key))) {
              result.push(AllSymbols[key]);
            }
          });
          return result;
        };
        if (!NATIVE_SYMBOL) {
          $Symbol = function Symbol2() {
            if (this instanceof $Symbol)
              throw TypeError("Symbol is not a constructor");
            var description = !arguments.length || arguments[0] === void 0 ? void 0 : String(arguments[0]);
            var tag = uid2(description);
            var setter = function(value) {
              if (this === ObjectPrototype)
                setter.call(ObjectPrototypeSymbols, value);
              if (has2(this, HIDDEN) && has2(this[HIDDEN], tag))
                this[HIDDEN][tag] = false;
              setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
            };
            if (DESCRIPTORS && USE_SETTER)
              setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
            return wrap(tag, description);
          };
          redefine($Symbol[PROTOTYPE], "toString", function toString() {
            return getInternalState(this).tag;
          });
          redefine($Symbol, "withoutSetter", function(description) {
            return wrap(uid2(description), description);
          });
          propertyIsEnumerableModule.f = $propertyIsEnumerable;
          definePropertyModule.f = $defineProperty;
          getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
          getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
          getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;
          wrappedWellKnownSymbolModule.f = function(name) {
            return wrap(wellKnownSymbol(name), name);
          };
          if (DESCRIPTORS) {
            nativeDefineProperty($Symbol[PROTOTYPE], "description", {
              configurable: true,
              get: function description() {
                return getInternalState(this).description;
              }
            });
            if (!IS_PURE) {
              redefine(ObjectPrototype, "propertyIsEnumerable", $propertyIsEnumerable, { unsafe: true });
            }
          }
        }
        $({ window: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
          Symbol: $Symbol
        });
        $forEach(objectKeys(WellKnownSymbolsStore), function(name) {
          defineWellKnownSymbol(name);
        });
        $({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
          "for": function(key) {
            var string = String(key);
            if (has2(StringToSymbolRegistry, string))
              return StringToSymbolRegistry[string];
            var symbol = $Symbol(string);
            StringToSymbolRegistry[string] = symbol;
            SymbolToStringRegistry[symbol] = string;
            return symbol;
          },
          keyFor: function keyFor(sym) {
            if (!isSymbol2(sym))
              throw TypeError(sym + " is not a symbol");
            if (has2(SymbolToStringRegistry, sym))
              return SymbolToStringRegistry[sym];
          },
          useSetter: function() {
            USE_SETTER = true;
          },
          useSimple: function() {
            USE_SETTER = false;
          }
        });
        $({ target: "Object", stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
          create: $create,
          defineProperty: $defineProperty,
          defineProperties: $defineProperties,
          getOwnPropertyDescriptor: $getOwnPropertyDescriptor
        });
        $({ target: "Object", stat: true, forced: !NATIVE_SYMBOL }, {
          getOwnPropertyNames: $getOwnPropertyNames,
          getOwnPropertySymbols: $getOwnPropertySymbols
        });
        $({ target: "Object", stat: true, forced: fails(function() {
          getOwnPropertySymbolsModule.f(1);
        }) }, {
          getOwnPropertySymbols: function getOwnPropertySymbols(it) {
            return getOwnPropertySymbolsModule.f(toObject(it));
          }
        });
        if ($stringify) {
          var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails(function() {
            var symbol = $Symbol();
            return $stringify([symbol]) != "[null]" || $stringify({ a: symbol }) != "{}" || $stringify(Object(symbol)) != "{}";
          });
          $({ target: "JSON", stat: true, forced: FORCED_JSON_STRINGIFY }, {
            stringify: function stringify(it, replacer2, space) {
              var args = [it];
              var index2 = 1;
              var $replacer;
              while (arguments.length > index2)
                args.push(arguments[index2++]);
              $replacer = replacer2;
              if (!isObject2(replacer2) && it === void 0 || isSymbol2(it))
                return;
              if (!isArray2(replacer2))
                replacer2 = function(key, value) {
                  if (typeof $replacer == "function")
                    value = $replacer.call(this, key, value);
                  if (!isSymbol2(value))
                    return value;
                };
              args[1] = replacer2;
              return $stringify.apply(null, args);
            }
          });
        }
        if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
          createNonEnumerableProperty($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
        }
        setToStringTag($Symbol, SYMBOL);
        hiddenKeys[HIDDEN] = true;
      },
      "a630": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var from = __webpack_require__("4df4");
        var checkCorrectnessOfIteration = __webpack_require__("1c7e");
        var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function(iterable) {
          Array.from(iterable);
        });
        $({ target: "Array", stat: true, forced: INCORRECT_ITERATION }, {
          from
        });
      },
      "a640": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        module2.exports = function(METHOD_NAME, argument) {
          var method = [][METHOD_NAME];
          return !!method && fails(function() {
            method.call(null, argument || function() {
              throw 1;
            }, 1);
          });
        };
      },
      "a691": function(module2, exports2) {
        var ceil = Math.ceil;
        var floor = Math.floor;
        module2.exports = function(argument) {
          return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
        };
      },
      "ab13": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        var MATCH = wellKnownSymbol("match");
        module2.exports = function(METHOD_NAME) {
          var regexp = /./;
          try {
            "/./"[METHOD_NAME](regexp);
          } catch (e2) {
            try {
              regexp[MATCH] = false;
              return "/./"[METHOD_NAME](regexp);
            } catch (f2) {
            }
          }
          return false;
        };
      },
      "ac1f": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var exec = __webpack_require__("9263");
        $({ target: "RegExp", proto: true, forced: /./.exec !== exec }, {
          exec
        });
      },
      "ad6d": function(module2, exports2, __webpack_require__) {
        var anObject = __webpack_require__("825a");
        module2.exports = function() {
          var that = anObject(this);
          var result = "";
          if (that.global)
            result += "g";
          if (that.ignoreCase)
            result += "i";
          if (that.multiline)
            result += "m";
          if (that.dotAll)
            result += "s";
          if (that.unicode)
            result += "u";
          if (that.sticky)
            result += "y";
          return result;
        };
      },
      "ae40": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var fails = __webpack_require__("d039");
        var has2 = __webpack_require__("5135");
        var defineProperty = Object.defineProperty;
        var cache = {};
        var thrower = function(it) {
          throw it;
        };
        module2.exports = function(METHOD_NAME, options) {
          if (has2(cache, METHOD_NAME))
            return cache[METHOD_NAME];
          if (!options)
            options = {};
          var method = [][METHOD_NAME];
          var ACCESSORS = has2(options, "ACCESSORS") ? options.ACCESSORS : false;
          var argument0 = has2(options, 0) ? options[0] : thrower;
          var argument1 = has2(options, 1) ? options[1] : void 0;
          return cache[METHOD_NAME] = !!method && !fails(function() {
            if (ACCESSORS && !DESCRIPTORS)
              return true;
            var O = { length: -1 };
            if (ACCESSORS)
              defineProperty(O, 1, { enumerable: true, get: thrower });
            else
              O[1] = 1;
            method.call(O, argument0, argument1);
          });
        };
      },
      "ae93": function(module2, exports2, __webpack_require__) {
        var getPrototypeOf = __webpack_require__("e163");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var has2 = __webpack_require__("5135");
        var wellKnownSymbol = __webpack_require__("b622");
        var IS_PURE = __webpack_require__("c430");
        var ITERATOR = wellKnownSymbol("iterator");
        var BUGGY_SAFARI_ITERATORS = false;
        var returnThis = function() {
          return this;
        };
        var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;
        if ([].keys) {
          arrayIterator = [].keys();
          if (!("next" in arrayIterator))
            BUGGY_SAFARI_ITERATORS = true;
          else {
            PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
            if (PrototypeOfArrayIteratorPrototype !== Object.prototype)
              IteratorPrototype = PrototypeOfArrayIteratorPrototype;
          }
        }
        if (IteratorPrototype == void 0)
          IteratorPrototype = {};
        if (!IS_PURE && !has2(IteratorPrototype, ITERATOR)) {
          createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
        }
        module2.exports = {
          IteratorPrototype,
          BUGGY_SAFARI_ITERATORS
        };
      },
      "b041": function(module2, exports2, __webpack_require__) {
        var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
        var classof = __webpack_require__("f5df");
        module2.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
          return "[object " + classof(this) + "]";
        };
      },
      "b0c0": function(module2, exports2, __webpack_require__) {
        var DESCRIPTORS = __webpack_require__("83ab");
        var defineProperty = __webpack_require__("9bf2").f;
        var FunctionPrototype = Function.prototype;
        var FunctionPrototypeToString = FunctionPrototype.toString;
        var nameRE = /^\s*function ([^ (]*)/;
        var NAME = "name";
        if (DESCRIPTORS && !(NAME in FunctionPrototype)) {
          defineProperty(FunctionPrototype, NAME, {
            configurable: true,
            get: function() {
              try {
                return FunctionPrototypeToString.call(this).match(nameRE)[1];
              } catch (error) {
                return "";
              }
            }
          });
        }
      },
      "b622": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var shared = __webpack_require__("5692");
        var has2 = __webpack_require__("5135");
        var uid2 = __webpack_require__("90e3");
        var NATIVE_SYMBOL = __webpack_require__("4930");
        var USE_SYMBOL_AS_UID = __webpack_require__("fdbf");
        var WellKnownSymbolsStore = shared("wks");
        var Symbol2 = window.Symbol;
        var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2 : Symbol2 && Symbol2.withoutSetter || uid2;
        module2.exports = function(name) {
          if (!has2(WellKnownSymbolsStore, name)) {
            if (NATIVE_SYMBOL && has2(Symbol2, name))
              WellKnownSymbolsStore[name] = Symbol2[name];
            else
              WellKnownSymbolsStore[name] = createWellKnownSymbol("Symbol." + name);
          }
          return WellKnownSymbolsStore[name];
        };
      },
      "b64b": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var toObject = __webpack_require__("7b0b");
        var nativeKeys = __webpack_require__("df75");
        var fails = __webpack_require__("d039");
        var FAILS_ON_PRIMITIVES = fails(function() {
          nativeKeys(1);
        });
        $({ target: "Object", stat: true, forced: FAILS_ON_PRIMITIVES }, {
          keys: function keys(it) {
            return nativeKeys(toObject(it));
          }
        });
      },
      "b727": function(module2, exports2, __webpack_require__) {
        var bind = __webpack_require__("0366");
        var IndexedObject = __webpack_require__("44ad");
        var toObject = __webpack_require__("7b0b");
        var toLength = __webpack_require__("50c4");
        var arraySpeciesCreate = __webpack_require__("65f0");
        var push = [].push;
        var createMethod = function(TYPE) {
          var IS_MAP = TYPE == 1;
          var IS_FILTER = TYPE == 2;
          var IS_SOME = TYPE == 3;
          var IS_EVERY = TYPE == 4;
          var IS_FIND_INDEX = TYPE == 6;
          var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
          return function($this, callbackfn, that, specificCreate) {
            var O = toObject($this);
            var self2 = IndexedObject(O);
            var boundFunction = bind(callbackfn, that, 3);
            var length = toLength(self2.length);
            var index2 = 0;
            var create = specificCreate || arraySpeciesCreate;
            var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : void 0;
            var value, result;
            for (; length > index2; index2++)
              if (NO_HOLES || index2 in self2) {
                value = self2[index2];
                result = boundFunction(value, index2, O);
                if (TYPE) {
                  if (IS_MAP)
                    target[index2] = result;
                  else if (result)
                    switch (TYPE) {
                      case 3:
                        return true;
                      case 5:
                        return value;
                      case 6:
                        return index2;
                      case 2:
                        push.call(target, value);
                    }
                  else if (IS_EVERY)
                    return false;
                }
              }
            return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
          };
        };
        module2.exports = {
          forEach: createMethod(0),
          map: createMethod(1),
          filter: createMethod(2),
          some: createMethod(3),
          every: createMethod(4),
          find: createMethod(5),
          findIndex: createMethod(6)
        };
      },
      "c04e": function(module2, exports2, __webpack_require__) {
        var isObject2 = __webpack_require__("861d");
        module2.exports = function(input, PREFERRED_STRING) {
          if (!isObject2(input))
            return input;
          var fn, val;
          if (PREFERRED_STRING && typeof (fn = input.toString) == "function" && !isObject2(val = fn.call(input)))
            return val;
          if (typeof (fn = input.valueOf) == "function" && !isObject2(val = fn.call(input)))
            return val;
          if (!PREFERRED_STRING && typeof (fn = input.toString) == "function" && !isObject2(val = fn.call(input)))
            return val;
          throw TypeError("Can't convert object to primitive value");
        };
      },
      "c430": function(module2, exports2) {
        module2.exports = false;
      },
      "c6b6": function(module2, exports2) {
        var toString = {}.toString;
        module2.exports = function(it) {
          return toString.call(it).slice(8, -1);
        };
      },
      "c6cd": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var setGlobal = __webpack_require__("ce4e");
        var SHARED = "__core-js_shared__";
        var store = window[SHARED] || setGlobal(SHARED, {});
        module2.exports = store;
      },
      "c740": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $findIndex = __webpack_require__("b727").findIndex;
        var addToUnscopables = __webpack_require__("44d2");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var FIND_INDEX = "findIndex";
        var SKIPS_HOLES = true;
        var USES_TO_LENGTH = arrayMethodUsesToLength(FIND_INDEX);
        if (FIND_INDEX in [])
          Array(1)[FIND_INDEX](function() {
            SKIPS_HOLES = false;
          });
        $({ target: "Array", proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH }, {
          findIndex: function findIndex(callbackfn) {
            return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
        addToUnscopables(FIND_INDEX);
      },
      "c8ba": function(module2, exports2) {
        var g2;
        g2 = function() {
          return this;
        }();
        try {
          g2 = g2 || new Function("return this")();
        } catch (e2) {
          if (typeof window === "object")
            g2 = window;
        }
        module2.exports = g2;
      },
      "c975": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $indexOf = __webpack_require__("4d64").indexOf;
        var arrayMethodIsStrict = __webpack_require__("a640");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var nativeIndexOf = [].indexOf;
        var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
        var STRICT_METHOD = arrayMethodIsStrict("indexOf");
        var USES_TO_LENGTH = arrayMethodUsesToLength("indexOf", { ACCESSORS: true, 1: 0 });
        $({ target: "Array", proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH }, {
          indexOf: function indexOf(searchElement) {
            return NEGATIVE_ZERO ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
      },
      "ca84": function(module2, exports2, __webpack_require__) {
        var has2 = __webpack_require__("5135");
        var toIndexedObject = __webpack_require__("fc6a");
        var indexOf = __webpack_require__("4d64").indexOf;
        var hiddenKeys = __webpack_require__("d012");
        module2.exports = function(object, names) {
          var O = toIndexedObject(object);
          var i2 = 0;
          var result = [];
          var key;
          for (key in O)
            !has2(hiddenKeys, key) && has2(O, key) && result.push(key);
          while (names.length > i2)
            if (has2(O, key = names[i2++])) {
              ~indexOf(result, key) || result.push(key);
            }
          return result;
        };
      },
      "caad": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $includes = __webpack_require__("4d64").includes;
        var addToUnscopables = __webpack_require__("44d2");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var USES_TO_LENGTH = arrayMethodUsesToLength("indexOf", { ACCESSORS: true, 1: 0 });
        $({ target: "Array", proto: true, forced: !USES_TO_LENGTH }, {
          includes: function includes(el) {
            return $includes(this, el, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
        addToUnscopables("includes");
      },
      "cc12": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var isObject2 = __webpack_require__("861d");
        var document2 = window.document;
        var EXISTS = isObject2(document2) && isObject2(document2.createElement);
        module2.exports = function(it) {
          return EXISTS ? document2.createElement(it) : {};
        };
      },
      "ce4e": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var createNonEnumerableProperty = __webpack_require__("9112");
        module2.exports = function(key, value) {
          try {
            createNonEnumerableProperty(window, key, value);
          } catch (error) {
            window[key] = value;
          }
          return value;
        };
      },
      "d012": function(module2, exports2) {
        module2.exports = {};
      },
      "d039": function(module2, exports2) {
        module2.exports = function(exec) {
          try {
            return !!exec();
          } catch (error) {
            return true;
          }
        };
      },
      "d066": function(module2, exports2, __webpack_require__) {
        var path = __webpack_require__("428f");
        __webpack_require__("da84");
        var aFunction = function(variable) {
          return typeof variable == "function" ? variable : void 0;
        };
        module2.exports = function(namespace, method) {
          return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(window[namespace]) : path[namespace] && path[namespace][method] || window[namespace] && window[namespace][method];
        };
      },
      "d1e7": function(module2, exports2, __webpack_require__) {
        var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);
        exports2.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
          var descriptor = getOwnPropertyDescriptor(this, V);
          return !!descriptor && descriptor.enumerable;
        } : nativePropertyIsEnumerable;
      },
      "d28b": function(module2, exports2, __webpack_require__) {
        var defineWellKnownSymbol = __webpack_require__("746f");
        defineWellKnownSymbol("iterator");
      },
      "d2bb": function(module2, exports2, __webpack_require__) {
        var anObject = __webpack_require__("825a");
        var aPossiblePrototype = __webpack_require__("3bbe");
        module2.exports = Object.setPrototypeOf || ("__proto__" in {} ? function() {
          var CORRECT_SETTER = false;
          var test = {};
          var setter;
          try {
            setter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
            setter.call(test, []);
            CORRECT_SETTER = test instanceof Array;
          } catch (error) {
          }
          return function setPrototypeOf(O, proto) {
            anObject(O);
            aPossiblePrototype(proto);
            if (CORRECT_SETTER)
              setter.call(O, proto);
            else
              O.__proto__ = proto;
            return O;
          };
        }() : void 0);
      },
      "d3b7": function(module2, exports2, __webpack_require__) {
        var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
        var redefine = __webpack_require__("6eeb");
        var toString = __webpack_require__("b041");
        if (!TO_STRING_TAG_SUPPORT) {
          redefine(Object.prototype, "toString", toString, { unsafe: true });
        }
      },
      "d44e": function(module2, exports2, __webpack_require__) {
        var defineProperty = __webpack_require__("9bf2").f;
        var has2 = __webpack_require__("5135");
        var wellKnownSymbol = __webpack_require__("b622");
        var TO_STRING_TAG = wellKnownSymbol("toStringTag");
        module2.exports = function(it, TAG, STATIC) {
          if (it && !has2(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
            defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
          }
        };
      },
      "d58f": function(module2, exports2, __webpack_require__) {
        var aFunction = __webpack_require__("1c0b");
        var toObject = __webpack_require__("7b0b");
        var IndexedObject = __webpack_require__("44ad");
        var toLength = __webpack_require__("50c4");
        var createMethod = function(IS_RIGHT) {
          return function(that, callbackfn, argumentsLength, memo) {
            aFunction(callbackfn);
            var O = toObject(that);
            var self2 = IndexedObject(O);
            var length = toLength(O.length);
            var index2 = IS_RIGHT ? length - 1 : 0;
            var i2 = IS_RIGHT ? -1 : 1;
            if (argumentsLength < 2)
              while (true) {
                if (index2 in self2) {
                  memo = self2[index2];
                  index2 += i2;
                  break;
                }
                index2 += i2;
                if (IS_RIGHT ? index2 < 0 : length <= index2) {
                  throw TypeError("Reduce of empty array with no initial value");
                }
              }
            for (; IS_RIGHT ? index2 >= 0 : length > index2; index2 += i2)
              if (index2 in self2) {
                memo = callbackfn(memo, self2[index2], index2, O);
              }
            return memo;
          };
        };
        module2.exports = {
          left: createMethod(false),
          right: createMethod(true)
        };
      },
      "d784": function(module2, exports2, __webpack_require__) {
        __webpack_require__("ac1f");
        var redefine = __webpack_require__("6eeb");
        var fails = __webpack_require__("d039");
        var wellKnownSymbol = __webpack_require__("b622");
        var regexpExec = __webpack_require__("9263");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var SPECIES = wellKnownSymbol("species");
        var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function() {
          var re = /./;
          re.exec = function() {
            var result = [];
            result.groups = { a: "7" };
            return result;
          };
          return "".replace(re, "$<a>") !== "7";
        });
        var REPLACE_KEEPS_$0 = function() {
          return "a".replace(/./, "$0") === "$0";
        }();
        var REPLACE = wellKnownSymbol("replace");
        var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function() {
          if (/./[REPLACE]) {
            return /./[REPLACE]("a", "$0") === "";
          }
          return false;
        }();
        var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function() {
          var re = /(?:)/;
          var originalExec = re.exec;
          re.exec = function() {
            return originalExec.apply(this, arguments);
          };
          var result = "ab".split(re);
          return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
        });
        module2.exports = function(KEY, length, exec, sham) {
          var SYMBOL = wellKnownSymbol(KEY);
          var DELEGATES_TO_SYMBOL = !fails(function() {
            var O = {};
            O[SYMBOL] = function() {
              return 7;
            };
            return ""[KEY](O) != 7;
          });
          var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function() {
            var execCalled = false;
            var re = /a/;
            if (KEY === "split") {
              re = {};
              re.constructor = {};
              re.constructor[SPECIES] = function() {
                return re;
              };
              re.flags = "";
              re[SYMBOL] = /./[SYMBOL];
            }
            re.exec = function() {
              execCalled = true;
              return null;
            };
            re[SYMBOL]("");
            return !execCalled;
          });
          if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === "replace" && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === "split" && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
            var nativeRegExpMethod = /./[SYMBOL];
            var methods = exec(SYMBOL, ""[KEY], function(nativeMethod, regexp, str, arg2, forceStringMethod) {
              if (regexp.exec === regexpExec) {
                if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
                  return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
                }
                return { done: true, value: nativeMethod.call(str, regexp, arg2) };
              }
              return { done: false };
            }, {
              REPLACE_KEEPS_$0,
              REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
            });
            var stringMethod = methods[0];
            var regexMethod = methods[1];
            redefine(String.prototype, KEY, stringMethod);
            redefine(RegExp.prototype, SYMBOL, length == 2 ? function(string, arg) {
              return regexMethod.call(string, this, arg);
            } : function(string) {
              return regexMethod.call(string, this);
            });
          }
          if (sham)
            createNonEnumerableProperty(RegExp.prototype[SYMBOL], "sham", true);
        };
      },
      "d81d": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var $map = __webpack_require__("b727").map;
        var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("map");
        var USES_TO_LENGTH = arrayMethodUsesToLength("map");
        $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
          map: function map(callbackfn) {
            return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
      },
      "da84": function(module2, exports2, __webpack_require__) {
        (function(window2) {
          var check = function(it) {
            return it && it.Math == Math && it;
          };
          module2.exports = check(typeof globalThis == "object" && globalThis) || check(typeof window2 == "object" && window2) || check(typeof self == "object" && self) || check(typeof window2 == "object" && window2) || Function("return this")();
        }).call(this, __webpack_require__("c8ba"));
      },
      "dbb4": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var DESCRIPTORS = __webpack_require__("83ab");
        var ownKeys2 = __webpack_require__("56ef");
        var toIndexedObject = __webpack_require__("fc6a");
        var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
        var createProperty = __webpack_require__("8418");
        $({ target: "Object", stat: true, sham: !DESCRIPTORS }, {
          getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
            var O = toIndexedObject(object);
            var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
            var keys = ownKeys2(O);
            var result = {};
            var index2 = 0;
            var key, descriptor;
            while (keys.length > index2) {
              descriptor = getOwnPropertyDescriptor(O, key = keys[index2++]);
              if (descriptor !== void 0)
                createProperty(result, key, descriptor);
            }
            return result;
          }
        });
      },
      "dbf1": function(module2, __webpack_exports__, __webpack_require__) {
        (function(window2) {
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return console2;
          });
          function getConsole() {
            if (typeof window2 !== "undefined") {
              return window2.console;
            }
            return window2.console;
          }
          var console2 = getConsole();
        }).call(this, __webpack_require__("c8ba"));
      },
      "ddb0": function(module2, exports2, __webpack_require__) {
        __webpack_require__("da84");
        var DOMIterables = __webpack_require__("fdbc");
        var ArrayIteratorMethods = __webpack_require__("e260");
        var createNonEnumerableProperty = __webpack_require__("9112");
        var wellKnownSymbol = __webpack_require__("b622");
        var ITERATOR = wellKnownSymbol("iterator");
        var TO_STRING_TAG = wellKnownSymbol("toStringTag");
        var ArrayValues = ArrayIteratorMethods.values;
        for (var COLLECTION_NAME in DOMIterables) {
          var Collection = window[COLLECTION_NAME];
          var CollectionPrototype = Collection && Collection.prototype;
          if (CollectionPrototype) {
            if (CollectionPrototype[ITERATOR] !== ArrayValues)
              try {
                createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
              } catch (error) {
                CollectionPrototype[ITERATOR] = ArrayValues;
              }
            if (!CollectionPrototype[TO_STRING_TAG]) {
              createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
            }
            if (DOMIterables[COLLECTION_NAME])
              for (var METHOD_NAME in ArrayIteratorMethods) {
                if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME])
                  try {
                    createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
                  } catch (error) {
                    CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
                  }
              }
          }
        }
      },
      "df75": function(module2, exports2, __webpack_require__) {
        var internalObjectKeys = __webpack_require__("ca84");
        var enumBugKeys = __webpack_require__("7839");
        module2.exports = Object.keys || function keys(O) {
          return internalObjectKeys(O, enumBugKeys);
        };
      },
      "e01a": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var DESCRIPTORS = __webpack_require__("83ab");
        __webpack_require__("da84");
        var has2 = __webpack_require__("5135");
        var isObject2 = __webpack_require__("861d");
        var defineProperty = __webpack_require__("9bf2").f;
        var copyConstructorProperties = __webpack_require__("e893");
        var NativeSymbol = window.Symbol;
        if (DESCRIPTORS && typeof NativeSymbol == "function" && (!("description" in NativeSymbol.prototype) || NativeSymbol().description !== void 0)) {
          var EmptyStringDescriptionStore = {};
          var SymbolWrapper = function Symbol2() {
            var description = arguments.length < 1 || arguments[0] === void 0 ? void 0 : String(arguments[0]);
            var result = this instanceof SymbolWrapper ? new NativeSymbol(description) : description === void 0 ? NativeSymbol() : NativeSymbol(description);
            if (description === "")
              EmptyStringDescriptionStore[result] = true;
            return result;
          };
          copyConstructorProperties(SymbolWrapper, NativeSymbol);
          var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
          symbolPrototype.constructor = SymbolWrapper;
          var symbolToString = symbolPrototype.toString;
          var native = String(NativeSymbol("test")) == "Symbol(test)";
          var regexp = /^Symbol\((.*)\)[^)]+$/;
          defineProperty(symbolPrototype, "description", {
            configurable: true,
            get: function description() {
              var symbol = isObject2(this) ? this.valueOf() : this;
              var string = symbolToString.call(symbol);
              if (has2(EmptyStringDescriptionStore, symbol))
                return "";
              var desc = native ? string.slice(7, -1) : string.replace(regexp, "$1");
              return desc === "" ? void 0 : desc;
            }
          });
          $({ window: true, forced: true }, {
            Symbol: SymbolWrapper
          });
        }
      },
      "e163": function(module2, exports2, __webpack_require__) {
        var has2 = __webpack_require__("5135");
        var toObject = __webpack_require__("7b0b");
        var sharedKey = __webpack_require__("f772");
        var CORRECT_PROTOTYPE_GETTER = __webpack_require__("e177");
        var IE_PROTO = sharedKey("IE_PROTO");
        var ObjectPrototype = Object.prototype;
        module2.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function(O) {
          O = toObject(O);
          if (has2(O, IE_PROTO))
            return O[IE_PROTO];
          if (typeof O.constructor == "function" && O instanceof O.constructor) {
            return O.constructor.prototype;
          }
          return O instanceof Object ? ObjectPrototype : null;
        };
      },
      "e177": function(module2, exports2, __webpack_require__) {
        var fails = __webpack_require__("d039");
        module2.exports = !fails(function() {
          function F2() {
          }
          F2.prototype.constructor = null;
          return Object.getPrototypeOf(new F2()) !== F2.prototype;
        });
      },
      "e260": function(module2, exports2, __webpack_require__) {
        var toIndexedObject = __webpack_require__("fc6a");
        var addToUnscopables = __webpack_require__("44d2");
        var Iterators = __webpack_require__("3f8c");
        var InternalStateModule = __webpack_require__("69f3");
        var defineIterator = __webpack_require__("7dd0");
        var ARRAY_ITERATOR = "Array Iterator";
        var setInternalState = InternalStateModule.set;
        var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);
        module2.exports = defineIterator(Array, "Array", function(iterated, kind) {
          setInternalState(this, {
            type: ARRAY_ITERATOR,
            target: toIndexedObject(iterated),
            index: 0,
            kind
          });
        }, function() {
          var state = getInternalState(this);
          var target = state.target;
          var kind = state.kind;
          var index2 = state.index++;
          if (!target || index2 >= target.length) {
            state.target = void 0;
            return { value: void 0, done: true };
          }
          if (kind == "keys")
            return { value: index2, done: false };
          if (kind == "values")
            return { value: target[index2], done: false };
          return { value: [index2, target[index2]], done: false };
        }, "values");
        Iterators.Arguments = Iterators.Array;
        addToUnscopables("keys");
        addToUnscopables("values");
        addToUnscopables("entries");
      },
      "e439": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var fails = __webpack_require__("d039");
        var toIndexedObject = __webpack_require__("fc6a");
        var nativeGetOwnPropertyDescriptor = __webpack_require__("06cf").f;
        var DESCRIPTORS = __webpack_require__("83ab");
        var FAILS_ON_PRIMITIVES = fails(function() {
          nativeGetOwnPropertyDescriptor(1);
        });
        var FORCED = !DESCRIPTORS || FAILS_ON_PRIMITIVES;
        $({ target: "Object", stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
          getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
            return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
          }
        });
      },
      "e538": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        exports2.f = wellKnownSymbol;
      },
      "e893": function(module2, exports2, __webpack_require__) {
        var has2 = __webpack_require__("5135");
        var ownKeys2 = __webpack_require__("56ef");
        var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
        var definePropertyModule = __webpack_require__("9bf2");
        module2.exports = function(target, source) {
          var keys = ownKeys2(source);
          var defineProperty = definePropertyModule.f;
          var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
          for (var i2 = 0; i2 < keys.length; i2++) {
            var key = keys[i2];
            if (!has2(target, key))
              defineProperty(target, key, getOwnPropertyDescriptor(source, key));
          }
        };
      },
      "e8b5": function(module2, exports2, __webpack_require__) {
        var classof = __webpack_require__("c6b6");
        module2.exports = Array.isArray || function isArray2(arg) {
          return classof(arg) == "Array";
        };
      },
      "e95a": function(module2, exports2, __webpack_require__) {
        var wellKnownSymbol = __webpack_require__("b622");
        var Iterators = __webpack_require__("3f8c");
        var ITERATOR = wellKnownSymbol("iterator");
        var ArrayPrototype = Array.prototype;
        module2.exports = function(it) {
          return it !== void 0 && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
        };
      },
      "f5df": function(module2, exports2, __webpack_require__) {
        var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
        var classofRaw = __webpack_require__("c6b6");
        var wellKnownSymbol = __webpack_require__("b622");
        var TO_STRING_TAG = wellKnownSymbol("toStringTag");
        var CORRECT_ARGUMENTS = classofRaw(function() {
          return arguments;
        }()) == "Arguments";
        var tryGet = function(it, key) {
          try {
            return it[key];
          } catch (error) {
          }
        };
        module2.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
          var O, tag, result;
          return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) == "Object" && typeof O.callee == "function" ? "Arguments" : result;
        };
      },
      "f772": function(module2, exports2, __webpack_require__) {
        var shared = __webpack_require__("5692");
        var uid2 = __webpack_require__("90e3");
        var keys = shared("keys");
        module2.exports = function(key) {
          return keys[key] || (keys[key] = uid2(key));
        };
      },
      "fb15": function(module2, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        if (typeof window !== "undefined") {
          var currentScript = window.document.currentScript;
          {
            var getCurrentScript = __webpack_require__("8875");
            currentScript = getCurrentScript();
            if (!("currentScript" in document)) {
              Object.defineProperty(document, "currentScript", { get: getCurrentScript });
            }
          }
          var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/);
          if (src) {
            __webpack_require__.p = src[1];
          }
        }
        __webpack_require__("99af");
        __webpack_require__("4de4");
        __webpack_require__("4160");
        __webpack_require__("c975");
        __webpack_require__("d81d");
        __webpack_require__("a434");
        __webpack_require__("159b");
        __webpack_require__("a4d3");
        __webpack_require__("e439");
        __webpack_require__("dbb4");
        __webpack_require__("b64b");
        function _defineProperty2(obj, key, value) {
          if (key in obj) {
            Object.defineProperty(obj, key, {
              value,
              enumerable: true,
              configurable: true,
              writable: true
            });
          } else {
            obj[key] = value;
          }
          return obj;
        }
        function ownKeys2(object, enumerableOnly) {
          var keys = Object.keys(object);
          if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly)
              symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
              });
            keys.push.apply(keys, symbols);
          }
          return keys;
        }
        function _objectSpread22(target) {
          for (var i2 = 1; i2 < arguments.length; i2++) {
            var source = arguments[i2] != null ? arguments[i2] : {};
            if (i2 % 2) {
              ownKeys2(Object(source), true).forEach(function(key) {
                _defineProperty2(target, key, source[key]);
              });
            } else if (Object.getOwnPropertyDescriptors) {
              Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
              ownKeys2(Object(source)).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
              });
            }
          }
          return target;
        }
        function _arrayWithHoles(arr) {
          if (Array.isArray(arr))
            return arr;
        }
        __webpack_require__("e01a");
        __webpack_require__("d28b");
        __webpack_require__("e260");
        __webpack_require__("d3b7");
        __webpack_require__("3ca3");
        __webpack_require__("ddb0");
        function _iterableToArrayLimit(arr, i2) {
          if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr)))
            return;
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = void 0;
          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);
              if (i2 && _arr.length === i2)
                break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"] != null)
                _i["return"]();
            } finally {
              if (_d)
                throw _e;
            }
          }
          return _arr;
        }
        __webpack_require__("a630");
        __webpack_require__("fb6a");
        __webpack_require__("b0c0");
        __webpack_require__("25f0");
        function _arrayLikeToArray2(arr, len2) {
          if (len2 == null || len2 > arr.length)
            len2 = arr.length;
          for (var i2 = 0, arr2 = new Array(len2); i2 < len2; i2++) {
            arr2[i2] = arr[i2];
          }
          return arr2;
        }
        function _unsupportedIterableToArray2(o2, minLen) {
          if (!o2)
            return;
          if (typeof o2 === "string")
            return _arrayLikeToArray2(o2, minLen);
          var n2 = Object.prototype.toString.call(o2).slice(8, -1);
          if (n2 === "Object" && o2.constructor)
            n2 = o2.constructor.name;
          if (n2 === "Map" || n2 === "Set")
            return Array.from(o2);
          if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2))
            return _arrayLikeToArray2(o2, minLen);
        }
        function _nonIterableRest() {
          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function _slicedToArray(arr, i2) {
          return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i2) || _unsupportedIterableToArray2(arr, i2) || _nonIterableRest();
        }
        function _arrayWithoutHoles2(arr) {
          if (Array.isArray(arr))
            return _arrayLikeToArray2(arr);
        }
        function _iterableToArray2(iter) {
          if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
            return Array.from(iter);
        }
        function _nonIterableSpread2() {
          throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function _toConsumableArray2(arr) {
          return _arrayWithoutHoles2(arr) || _iterableToArray2(arr) || _unsupportedIterableToArray2(arr) || _nonIterableSpread2();
        }
        var external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_ = __webpack_require__("a352");
        var external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_default = /* @__PURE__ */ __webpack_require__.n(external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_);
        function removeNode(node) {
          if (node.parentElement !== null) {
            node.parentElement.removeChild(node);
          }
        }
        function insertNodeAt(fatherNode, node, position) {
          var refNode = position === 0 ? fatherNode.children[0] : fatherNode.children[position - 1].nextSibling;
          fatherNode.insertBefore(node, refNode);
        }
        var console2 = __webpack_require__("dbf1");
        __webpack_require__("13d5");
        __webpack_require__("4fad");
        __webpack_require__("ac1f");
        __webpack_require__("5319");
        function cached(fn) {
          var cache = /* @__PURE__ */ Object.create(null);
          return function cachedFn(str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str));
          };
        }
        var regex = /-(\w)/g;
        var camelize2 = cached(function(str) {
          return str.replace(regex, function(_, c2) {
            return c2.toUpperCase();
          });
        });
        __webpack_require__("5db7");
        __webpack_require__("73d9");
        var manageAndEmit = ["Start", "Add", "Remove", "Update", "End"];
        var emit = ["Choose", "Unchoose", "Sort", "Filter", "Clone"];
        var manage = ["Move"];
        var eventHandlerNames = [manage, manageAndEmit, emit].flatMap(function(events2) {
          return events2;
        }).map(function(evt) {
          return "on".concat(evt);
        });
        var events = {
          manage,
          manageAndEmit,
          emit
        };
        function isReadOnly(eventName) {
          return eventHandlerNames.indexOf(eventName) !== -1;
        }
        __webpack_require__("caad");
        __webpack_require__("2ca0");
        var tags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "math", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
        function isHtmlTag(name) {
          return tags.includes(name);
        }
        function isTransition(name) {
          return ["transition-group", "TransitionGroup"].includes(name);
        }
        function isHtmlAttribute(value) {
          return ["id", "class", "role", "style"].includes(value) || value.startsWith("data-") || value.startsWith("aria-") || value.startsWith("on");
        }
        function project(entries) {
          return entries.reduce(function(res, _ref) {
            var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], value = _ref2[1];
            res[key] = value;
            return res;
          }, {});
        }
        function getComponentAttributes(_ref3) {
          var $attrs = _ref3.$attrs, _ref3$componentData = _ref3.componentData, componentData = _ref3$componentData === void 0 ? {} : _ref3$componentData;
          var attributes = project(Object.entries($attrs).filter(function(_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2), key = _ref5[0];
            _ref5[1];
            return isHtmlAttribute(key);
          }));
          return _objectSpread22(_objectSpread22({}, attributes), componentData);
        }
        function createSortableOption(_ref6) {
          var $attrs = _ref6.$attrs, callBackBuilder = _ref6.callBackBuilder;
          var options = project(getValidSortableEntries($attrs));
          Object.entries(callBackBuilder).forEach(function(_ref7) {
            var _ref8 = _slicedToArray(_ref7, 2), eventType = _ref8[0], eventBuilder = _ref8[1];
            events[eventType].forEach(function(event) {
              options["on".concat(event)] = eventBuilder(event);
            });
          });
          var draggable2 = "[data-draggable]".concat(options.draggable || "");
          return _objectSpread22(_objectSpread22({}, options), {}, {
            draggable: draggable2
          });
        }
        function getValidSortableEntries(value) {
          return Object.entries(value).filter(function(_ref9) {
            var _ref10 = _slicedToArray(_ref9, 2), key = _ref10[0];
            _ref10[1];
            return !isHtmlAttribute(key);
          }).map(function(_ref11) {
            var _ref12 = _slicedToArray(_ref11, 2), key = _ref12[0], value2 = _ref12[1];
            return [camelize2(key), value2];
          }).filter(function(_ref13) {
            var _ref14 = _slicedToArray(_ref13, 2), key = _ref14[0];
            _ref14[1];
            return !isReadOnly(key);
          });
        }
        __webpack_require__("c740");
        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        function _defineProperties(target, props2) {
          for (var i2 = 0; i2 < props2.length; i2++) {
            var descriptor = props2[i2];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        function _createClass(Constructor, protoProps, staticProps) {
          if (protoProps)
            _defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            _defineProperties(Constructor, staticProps);
          return Constructor;
        }
        var getHtmlElementFromNode = function getHtmlElementFromNode2(_ref) {
          var el = _ref.el;
          return el;
        };
        var addContext = function addContext2(domElement, context) {
          return domElement.__draggable_context = context;
        };
        var getContext2 = function getContext3(domElement) {
          return domElement.__draggable_context;
        };
        var componentStructure_ComponentStructure = /* @__PURE__ */ function() {
          function ComponentStructure(_ref2) {
            var _ref2$nodes = _ref2.nodes, header = _ref2$nodes.header, defaultNodes = _ref2$nodes.default, footer = _ref2$nodes.footer, root = _ref2.root, realList = _ref2.realList;
            _classCallCheck(this, ComponentStructure);
            this.defaultNodes = defaultNodes;
            this.children = [].concat(_toConsumableArray2(header), _toConsumableArray2(defaultNodes), _toConsumableArray2(footer));
            this.externalComponent = root.externalComponent;
            this.rootTransition = root.transition;
            this.tag = root.tag;
            this.realList = realList;
          }
          _createClass(ComponentStructure, [{
            key: "render",
            value: function render2(h2, attributes) {
              var tag = this.tag, children = this.children, _isRootComponent = this._isRootComponent;
              var option2 = !_isRootComponent ? children : {
                default: function _default() {
                  return children;
                }
              };
              return h2(tag, attributes, option2);
            }
          }, {
            key: "updated",
            value: function updated() {
              var defaultNodes = this.defaultNodes, realList = this.realList;
              defaultNodes.forEach(function(node, index2) {
                addContext(getHtmlElementFromNode(node), {
                  element: realList[index2],
                  index: index2
                });
              });
            }
          }, {
            key: "getUnderlyingVm",
            value: function getUnderlyingVm(domElement) {
              return getContext2(domElement);
            }
          }, {
            key: "getVmIndexFromDomIndex",
            value: function getVmIndexFromDomIndex(domIndex, element) {
              var defaultNodes = this.defaultNodes;
              var length = defaultNodes.length;
              var domChildren = element.children;
              var domElement = domChildren.item(domIndex);
              if (domElement === null) {
                return length;
              }
              var context = getContext2(domElement);
              if (context) {
                return context.index;
              }
              if (length === 0) {
                return 0;
              }
              var firstDomListElement = getHtmlElementFromNode(defaultNodes[0]);
              var indexFirstDomListElement = _toConsumableArray2(domChildren).findIndex(function(element2) {
                return element2 === firstDomListElement;
              });
              return domIndex < indexFirstDomListElement ? 0 : length;
            }
          }, {
            key: "_isRootComponent",
            get: function get2() {
              return this.externalComponent || this.rootTransition;
            }
          }]);
          return ComponentStructure;
        }();
        var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");
        function getSlot(slots, key) {
          var slotValue = slots[key];
          return slotValue ? slotValue() : [];
        }
        function computeNodes(_ref) {
          var $slots = _ref.$slots, realList = _ref.realList, getKey = _ref.getKey;
          var normalizedList = realList || [];
          var _map = ["header", "footer"].map(function(name) {
            return getSlot($slots, name);
          }), _map2 = _slicedToArray(_map, 2), header = _map2[0], footer = _map2[1];
          var item = $slots.item;
          if (!item) {
            throw new Error("draggable element must have an item slot");
          }
          var defaultNodes = normalizedList.flatMap(function(element, index2) {
            return item({
              element,
              index: index2
            }).map(function(node) {
              node.key = getKey(element);
              node.props = _objectSpread22(_objectSpread22({}, node.props || {}), {}, {
                "data-draggable": true
              });
              return node;
            });
          });
          if (defaultNodes.length !== normalizedList.length) {
            throw new Error("Item slot must have only one child");
          }
          return {
            header,
            footer,
            default: defaultNodes
          };
        }
        function getRootInformation(tag) {
          var transition = isTransition(tag);
          var externalComponent = !isHtmlTag(tag) && !transition;
          return {
            transition,
            externalComponent,
            tag: externalComponent ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])(tag) : transition ? external_commonjs_vue_commonjs2_vue_root_Vue_["TransitionGroup"] : tag
          };
        }
        function computeComponentStructure(_ref2) {
          var $slots = _ref2.$slots, tag = _ref2.tag, realList = _ref2.realList, getKey = _ref2.getKey;
          var nodes = computeNodes({
            $slots,
            realList,
            getKey
          });
          var root = getRootInformation(tag);
          return new componentStructure_ComponentStructure({
            nodes,
            root,
            realList
          });
        }
        function _emit(evtName, evtData) {
          var _this = this;
          Object(external_commonjs_vue_commonjs2_vue_root_Vue_["nextTick"])(function() {
            return _this.$emit(evtName.toLowerCase(), evtData);
          });
        }
        function _manage(evtName) {
          var _this2 = this;
          return function(evtData, originalElement) {
            if (_this2.realList !== null) {
              return _this2["onDrag".concat(evtName)](evtData, originalElement);
            }
          };
        }
        function _manageAndEmit(evtName) {
          var _this3 = this;
          var delegateCallBack = _manage.call(this, evtName);
          return function(evtData, originalElement) {
            delegateCallBack.call(_this3, evtData, originalElement);
            _emit.call(_this3, evtName, evtData);
          };
        }
        var draggingElement = null;
        var props = {
          list: {
            type: Array,
            required: false,
            default: null
          },
          modelValue: {
            type: Array,
            required: false,
            default: null
          },
          itemKey: {
            type: [String, Function],
            required: true
          },
          clone: {
            type: Function,
            default: function _default(original) {
              return original;
            }
          },
          tag: {
            type: String,
            default: "div"
          },
          move: {
            type: Function,
            default: null
          },
          componentData: {
            type: Object,
            required: false,
            default: null
          }
        };
        var emits = ["update:modelValue", "change"].concat(_toConsumableArray2([].concat(_toConsumableArray2(events.manageAndEmit), _toConsumableArray2(events.emit)).map(function(evt) {
          return evt.toLowerCase();
        })));
        var draggableComponent = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
          name: "draggable",
          inheritAttrs: false,
          props,
          emits,
          data: function data() {
            return {
              error: false
            };
          },
          render: function render2() {
            try {
              this.error = false;
              var $slots = this.$slots, $attrs = this.$attrs, tag = this.tag, componentData = this.componentData, realList = this.realList, getKey = this.getKey;
              var componentStructure = computeComponentStructure({
                $slots,
                tag,
                realList,
                getKey
              });
              this.componentStructure = componentStructure;
              var attributes = getComponentAttributes({
                $attrs,
                componentData
              });
              return componentStructure.render(external_commonjs_vue_commonjs2_vue_root_Vue_["h"], attributes);
            } catch (err) {
              this.error = true;
              return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["h"])("pre", {
                style: {
                  color: "red"
                }
              }, err.stack);
            }
          },
          created: function created() {
            if (this.list !== null && this.modelValue !== null) {
              console2["a"].error("modelValue and list props are mutually exclusive! Please set one or another.");
            }
          },
          mounted: function mounted() {
            var _this4 = this;
            if (this.error) {
              return;
            }
            var $attrs = this.$attrs, $el = this.$el, componentStructure = this.componentStructure;
            componentStructure.updated();
            var sortableOptions = createSortableOption({
              $attrs,
              callBackBuilder: {
                manageAndEmit: function manageAndEmit2(event) {
                  return _manageAndEmit.call(_this4, event);
                },
                emit: function emit2(event) {
                  return _emit.bind(_this4, event);
                },
                manage: function manage2(event) {
                  return _manage.call(_this4, event);
                }
              }
            });
            var targetDomElement = $el.nodeType === 1 ? $el : $el.parentElement;
            this._sortable = new external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_default.a(targetDomElement, sortableOptions);
            this.targetDomElement = targetDomElement;
            targetDomElement.__draggable_component__ = this;
          },
          updated: function updated() {
            this.componentStructure.updated();
          },
          beforeUnmount: function beforeUnmount() {
            if (this._sortable !== void 0)
              this._sortable.destroy();
          },
          computed: {
            realList: function realList() {
              var list = this.list;
              return list ? list : this.modelValue;
            },
            getKey: function getKey() {
              var itemKey = this.itemKey;
              if (typeof itemKey === "function") {
                return itemKey;
              }
              return function(element) {
                return element[itemKey];
              };
            }
          },
          watch: {
            $attrs: {
              handler: function handler(newOptionValue) {
                var _sortable = this._sortable;
                if (!_sortable)
                  return;
                getValidSortableEntries(newOptionValue).forEach(function(_ref) {
                  var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], value = _ref2[1];
                  _sortable.option(key, value);
                });
              },
              deep: true
            }
          },
          methods: {
            getUnderlyingVm: function getUnderlyingVm(domElement) {
              return this.componentStructure.getUnderlyingVm(domElement) || null;
            },
            getUnderlyingPotencialDraggableComponent: function getUnderlyingPotencialDraggableComponent(htmElement) {
              return htmElement.__draggable_component__;
            },
            emitChanges: function emitChanges(evt) {
              var _this5 = this;
              Object(external_commonjs_vue_commonjs2_vue_root_Vue_["nextTick"])(function() {
                return _this5.$emit("change", evt);
              });
            },
            alterList: function alterList(onList) {
              if (this.list) {
                onList(this.list);
                return;
              }
              var newList = _toConsumableArray2(this.modelValue);
              onList(newList);
              this.$emit("update:modelValue", newList);
            },
            spliceList: function spliceList() {
              var _arguments = arguments;
              var spliceList2 = function spliceList3(list) {
                return list.splice.apply(list, _toConsumableArray2(_arguments));
              };
              this.alterList(spliceList2);
            },
            updatePosition: function updatePosition(oldIndex2, newIndex2) {
              var updatePosition2 = function updatePosition3(list) {
                return list.splice(newIndex2, 0, list.splice(oldIndex2, 1)[0]);
              };
              this.alterList(updatePosition2);
            },
            getRelatedContextFromMoveEvent: function getRelatedContextFromMoveEvent(_ref3) {
              var to = _ref3.to, related = _ref3.related;
              var component = this.getUnderlyingPotencialDraggableComponent(to);
              if (!component) {
                return {
                  component
                };
              }
              var list = component.realList;
              var context = {
                list,
                component
              };
              if (to !== related && list) {
                var destination = component.getUnderlyingVm(related) || {};
                return _objectSpread22(_objectSpread22({}, destination), context);
              }
              return context;
            },
            getVmIndexFromDomIndex: function getVmIndexFromDomIndex(domIndex) {
              return this.componentStructure.getVmIndexFromDomIndex(domIndex, this.targetDomElement);
            },
            onDragStart: function onDragStart(evt) {
              this.context = this.getUnderlyingVm(evt.item);
              evt.item._underlying_vm_ = this.clone(this.context.element);
              draggingElement = evt.item;
            },
            onDragAdd: function onDragAdd(evt) {
              var element = evt.item._underlying_vm_;
              if (element === void 0) {
                return;
              }
              removeNode(evt.item);
              var newIndex2 = this.getVmIndexFromDomIndex(evt.newIndex);
              this.spliceList(newIndex2, 0, element);
              var added = {
                element,
                newIndex: newIndex2
              };
              this.emitChanges({
                added
              });
            },
            onDragRemove: function onDragRemove(evt) {
              insertNodeAt(this.$el, evt.item, evt.oldIndex);
              if (evt.pullMode === "clone") {
                removeNode(evt.clone);
                return;
              }
              var _this$context = this.context, oldIndex2 = _this$context.index, element = _this$context.element;
              this.spliceList(oldIndex2, 1);
              var removed = {
                element,
                oldIndex: oldIndex2
              };
              this.emitChanges({
                removed
              });
            },
            onDragUpdate: function onDragUpdate(evt) {
              removeNode(evt.item);
              insertNodeAt(evt.from, evt.item, evt.oldIndex);
              var oldIndex2 = this.context.index;
              var newIndex2 = this.getVmIndexFromDomIndex(evt.newIndex);
              this.updatePosition(oldIndex2, newIndex2);
              var moved2 = {
                element: this.context.element,
                oldIndex: oldIndex2,
                newIndex: newIndex2
              };
              this.emitChanges({
                moved: moved2
              });
            },
            computeFutureIndex: function computeFutureIndex(relatedContext, evt) {
              if (!relatedContext.element) {
                return 0;
              }
              var domChildren = _toConsumableArray2(evt.to.children).filter(function(el) {
                return el.style["display"] !== "none";
              });
              var currentDomIndex = domChildren.indexOf(evt.related);
              var currentIndex = relatedContext.component.getVmIndexFromDomIndex(currentDomIndex);
              var draggedInList = domChildren.indexOf(draggingElement) !== -1;
              return draggedInList || !evt.willInsertAfter ? currentIndex : currentIndex + 1;
            },
            onDragMove: function onDragMove(evt, originalEvent) {
              var move = this.move, realList = this.realList;
              if (!move || !realList) {
                return true;
              }
              var relatedContext = this.getRelatedContextFromMoveEvent(evt);
              var futureIndex = this.computeFutureIndex(relatedContext, evt);
              var draggedContext = _objectSpread22(_objectSpread22({}, this.context), {}, {
                futureIndex
              });
              var sendEvent = _objectSpread22(_objectSpread22({}, evt), {}, {
                relatedContext,
                draggedContext
              });
              return move(sendEvent, originalEvent);
            },
            onDragEnd: function onDragEnd() {
              draggingElement = null;
            }
          }
        });
        var vuedraggable = draggableComponent;
        __webpack_exports__["default"] = vuedraggable;
      },
      "fb6a": function(module2, exports2, __webpack_require__) {
        var $ = __webpack_require__("23e7");
        var isObject2 = __webpack_require__("861d");
        var isArray2 = __webpack_require__("e8b5");
        var toAbsoluteIndex = __webpack_require__("23cb");
        var toLength = __webpack_require__("50c4");
        var toIndexedObject = __webpack_require__("fc6a");
        var createProperty = __webpack_require__("8418");
        var wellKnownSymbol = __webpack_require__("b622");
        var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
        var arrayMethodUsesToLength = __webpack_require__("ae40");
        var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("slice");
        var USES_TO_LENGTH = arrayMethodUsesToLength("slice", { ACCESSORS: true, 0: 0, 1: 2 });
        var SPECIES = wellKnownSymbol("species");
        var nativeSlice = [].slice;
        var max = Math.max;
        $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
          slice: function slice(start, end) {
            var O = toIndexedObject(this);
            var length = toLength(O.length);
            var k = toAbsoluteIndex(start, length);
            var fin = toAbsoluteIndex(end === void 0 ? length : end, length);
            var Constructor, result, n2;
            if (isArray2(O)) {
              Constructor = O.constructor;
              if (typeof Constructor == "function" && (Constructor === Array || isArray2(Constructor.prototype))) {
                Constructor = void 0;
              } else if (isObject2(Constructor)) {
                Constructor = Constructor[SPECIES];
                if (Constructor === null)
                  Constructor = void 0;
              }
              if (Constructor === Array || Constructor === void 0) {
                return nativeSlice.call(O, k, fin);
              }
            }
            result = new (Constructor === void 0 ? Array : Constructor)(max(fin - k, 0));
            for (n2 = 0; k < fin; k++, n2++)
              if (k in O)
                createProperty(result, n2, O[k]);
            result.length = n2;
            return result;
          }
        });
      },
      "fc6a": function(module2, exports2, __webpack_require__) {
        var IndexedObject = __webpack_require__("44ad");
        var requireObjectCoercible = __webpack_require__("1d80");
        module2.exports = function(it) {
          return IndexedObject(requireObjectCoercible(it));
        };
      },
      "fdbc": function(module2, exports2) {
        module2.exports = {
          CSSRuleList: 0,
          CSSStyleDeclaration: 0,
          CSSValueList: 0,
          ClientRectList: 0,
          DOMRectList: 0,
          DOMStringList: 0,
          DOMTokenList: 1,
          DataTransferItemList: 0,
          FileList: 0,
          HTMLAllCollection: 0,
          HTMLCollection: 0,
          HTMLFormElement: 0,
          HTMLSelectElement: 0,
          MediaList: 0,
          MimeTypeArray: 0,
          NamedNodeMap: 0,
          NodeList: 1,
          PaintRequestList: 0,
          Plugin: 0,
          PluginArray: 0,
          SVGLengthList: 0,
          SVGNumberList: 0,
          SVGPathSegList: 0,
          SVGPointList: 0,
          SVGStringList: 0,
          SVGTransformList: 0,
          SourceBufferList: 0,
          StyleSheetList: 0,
          TextTrackCueList: 0,
          TextTrackList: 0,
          TouchList: 0
        };
      },
      "fdbf": function(module2, exports2, __webpack_require__) {
        var NATIVE_SYMBOL = __webpack_require__("4930");
        module2.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
      }
    })["default"];
  });
})(vuedraggable_umd);
var draggable = /* @__PURE__ */ getDefaultExportFromCjs(vuedraggable_umd.exports);
var PDFMergeView_vue_vue_type_style_index_0_scoped_true_lang = "";
const _withScopeId$1 = (n2) => (pushScopeId("data-v-5f1b001a"), n2 = n2(), popScopeId(), n2);
const _hoisted_1$1 = { class: "view-container" };
const _hoisted_2$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h2", null, "PDF Merger", -1));
const _hoisted_3$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("hr", null, null, -1));
const _hoisted_4$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h4", null, " Add your PDF files using them prompt below, you can upload them one at a time or multiple at once. ", -1));
const _hoisted_5$1 = { key: 0 };
const _hoisted_6$1 = { key: 1 };
const _hoisted_7$1 = {
  key: 0,
  class: "error"
};
const _hoisted_8$1 = { key: 1 };
const _hoisted_9$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h3", null, "Selected PDFs (drag to re-order)", -1));
const _hoisted_10$1 = { class: "files" };
const _hoisted_11$1 = ["onClick"];
const _hoisted_12 = { key: 0 };
const _hoisted_13 = ["disabled"];
const _hoisted_14 = {
  key: 0,
  class: "loader"
};
const _sfc_main$1 = {
  props: {
    navCollapsed: {
      type: Boolean,
      required: true
    }
  },
  setup(__props) {
    const files = ref([]);
    const error = ref("");
    const loading = ref(false);
    function onDrop(acceptFiles, rejectReasons) {
      if (acceptFiles) {
        files.value = [...files.value, ...acceptFiles];
      }
      if (rejectReasons.length > 0) {
        error.value = "File type must be .pdf!";
      } else {
        error.value = "";
      }
    }
    function removeFile(index2) {
      files.value.splice(index2, 1);
    }
    function merge() {
      console.log("hello");
    }
    const options = {
      onDrop,
      accept: ".pdf"
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone(options);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("main", {
        class: normalizeClass({ navCollapsed: __props.navCollapsed })
      }, [
        createBaseVNode("div", _hoisted_1$1, [
          _hoisted_2$1,
          _hoisted_3$1,
          _hoisted_4$1,
          createBaseVNode("div", mergeProps({ class: "file-area" }, unref(getRootProps)()), [
            createBaseVNode("input", normalizeProps(guardReactiveProps(unref(getInputProps)())), null, 16),
            unref(isDragActive) ? (openBlock(), createElementBlock("p", _hoisted_5$1, "Drop the files here ...")) : (openBlock(), createElementBlock("p", _hoisted_6$1, " Drag and drop the PDF files here, or click in this area to select your files! "))
          ], 16),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_7$1, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          files.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_8$1, [
            _hoisted_9$1,
            createBaseVNode("div", _hoisted_10$1, [
              createBaseVNode("ol", null, [
                createVNode(unref(draggable), {
                  modelValue: files.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => files.value = $event),
                  "item-key": "id"
                }, {
                  item: withCtx(({ element, index: index2 }) => [
                    createBaseVNode("li", null, [
                      createTextVNode(toDisplayString(element.name) + " ", 1),
                      createBaseVNode("span", {
                        class: "remove",
                        onClick: ($event) => removeFile(index2)
                      }, "X", 8, _hoisted_11$1)
                    ])
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ])
            ]),
            files.value.length > 1 ? (openBlock(), createElementBlock("div", _hoisted_12, [
              createBaseVNode("button", {
                onClick: merge,
                disabled: loading.value
              }, "Merge PDFs", 8, _hoisted_13),
              loading.value ? (openBlock(), createElementBlock("div", _hoisted_14)) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
};
var PDFMergeView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-5f1b001a"]]);
var pluralize$3 = { exports: {} };
(function(module, exports) {
  (function(root, pluralize2) {
    if (typeof commonjsRequire === "function" && true && true) {
      module.exports = pluralize2();
    } else {
      root.pluralize = pluralize2();
    }
  })(commonjsGlobal, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index2) {
        return args[index2] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index2) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index2 - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len2 = rules.length;
      while (len2--) {
        var rule = rules[len2];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      ["genus", "genera"],
      ["viscus", "viscera"],
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["whiskey", "whiskies"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|tlas|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[emjzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/(m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/(m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|tlas|gas|(?:her|at|gr)o|ris)(?:es)?$/i, "$1"],
      [/(analy|ba|diagno|parenthe|progno|synop|the|empha|cri)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "alcohol",
      "ammo",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "manga",
      "news",
      "pike",
      "plankton",
      "pliers",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transporation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /[^aeiou]ese$/i,
      /deer$/i,
      /fish$/i,
      /measles$/i,
      /o[iu]s$/i,
      /pox$/i,
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
})(pluralize$3);
var normalizeStrings = { exports: {} };
var require$$0 = {
  "105": "i",
  "192": "A",
  "193": "A",
  "194": "A",
  "195": "A",
  "196": "A",
  "197": "A",
  "199": "C",
  "200": "E",
  "201": "E",
  "202": "E",
  "203": "E",
  "204": "I",
  "205": "I",
  "206": "I",
  "207": "I",
  "209": "N",
  "210": "O",
  "211": "O",
  "212": "O",
  "213": "O",
  "214": "O",
  "216": "O",
  "217": "U",
  "218": "U",
  "219": "U",
  "220": "U",
  "221": "Y",
  "224": "a",
  "225": "a",
  "226": "a",
  "227": "a",
  "228": "a",
  "229": "a",
  "231": "c",
  "232": "e",
  "233": "e",
  "234": "e",
  "235": "e",
  "236": "i",
  "237": "i",
  "238": "i",
  "239": "i",
  "241": "n",
  "242": "o",
  "243": "o",
  "244": "o",
  "245": "o",
  "246": "o",
  "248": "o",
  "249": "u",
  "250": "u",
  "251": "u",
  "252": "u",
  "253": "y",
  "255": "y",
  "256": "A",
  "257": "a",
  "258": "A",
  "259": "a",
  "260": "A",
  "261": "a",
  "262": "C",
  "263": "c",
  "264": "C",
  "265": "c",
  "266": "C",
  "267": "c",
  "268": "C",
  "269": "c",
  "270": "D",
  "271": "d",
  "272": "D",
  "273": "d",
  "274": "E",
  "275": "e",
  "276": "E",
  "277": "e",
  "278": "E",
  "279": "e",
  "280": "E",
  "281": "e",
  "282": "E",
  "283": "e",
  "284": "G",
  "285": "g",
  "286": "G",
  "287": "g",
  "288": "G",
  "289": "g",
  "290": "G",
  "291": "g",
  "292": "H",
  "293": "h",
  "294": "H",
  "295": "h",
  "296": "I",
  "297": "i",
  "298": "I",
  "299": "i",
  "300": "I",
  "301": "i",
  "302": "I",
  "303": "i",
  "304": "I",
  "308": "J",
  "309": "j",
  "310": "K",
  "311": "k",
  "313": "L",
  "314": "l",
  "315": "L",
  "316": "l",
  "317": "L",
  "318": "l",
  "319": "L",
  "320": "l",
  "321": "L",
  "322": "l",
  "323": "N",
  "324": "n",
  "325": "N",
  "326": "n",
  "327": "N",
  "328": "n",
  "332": "O",
  "333": "o",
  "334": "O",
  "335": "o",
  "336": "O",
  "337": "o",
  "338": "O",
  "339": "o",
  "340": "R",
  "341": "r",
  "342": "R",
  "343": "r",
  "344": "R",
  "345": "r",
  "346": "S",
  "347": "s",
  "348": "S",
  "349": "s",
  "350": "S",
  "351": "s",
  "352": "S",
  "353": "s",
  "354": "T",
  "355": "t",
  "356": "T",
  "357": "t",
  "358": "T",
  "359": "t",
  "360": "U",
  "361": "u",
  "362": "U",
  "363": "u",
  "364": "U",
  "365": "u",
  "366": "U",
  "367": "u",
  "368": "U",
  "369": "u",
  "370": "U",
  "371": "u",
  "372": "W",
  "373": "w",
  "374": "Y",
  "375": "y",
  "376": "Y",
  "377": "Z",
  "378": "z",
  "379": "Z",
  "380": "z",
  "381": "Z",
  "382": "z",
  "384": "b",
  "385": "B",
  "386": "B",
  "387": "b",
  "390": "O",
  "391": "C",
  "392": "c",
  "393": "D",
  "394": "D",
  "395": "D",
  "396": "d",
  "398": "E",
  "400": "E",
  "401": "F",
  "402": "f",
  "403": "G",
  "407": "I",
  "408": "K",
  "409": "k",
  "410": "l",
  "412": "M",
  "413": "N",
  "414": "n",
  "415": "O",
  "416": "O",
  "417": "o",
  "420": "P",
  "421": "p",
  "422": "R",
  "427": "t",
  "428": "T",
  "429": "t",
  "430": "T",
  "431": "U",
  "432": "u",
  "434": "V",
  "435": "Y",
  "436": "y",
  "437": "Z",
  "438": "z",
  "461": "A",
  "462": "a",
  "463": "I",
  "464": "i",
  "465": "O",
  "466": "o",
  "467": "U",
  "468": "u",
  "477": "e",
  "484": "G",
  "485": "g",
  "486": "G",
  "487": "g",
  "488": "K",
  "489": "k",
  "490": "O",
  "491": "o",
  "500": "G",
  "501": "g",
  "504": "N",
  "505": "n",
  "512": "A",
  "513": "a",
  "514": "A",
  "515": "a",
  "516": "E",
  "517": "e",
  "518": "E",
  "519": "e",
  "520": "I",
  "521": "i",
  "522": "I",
  "523": "i",
  "524": "O",
  "525": "o",
  "526": "O",
  "527": "o",
  "528": "R",
  "529": "r",
  "530": "R",
  "531": "r",
  "532": "U",
  "533": "u",
  "534": "U",
  "535": "u",
  "536": "S",
  "537": "s",
  "538": "T",
  "539": "t",
  "542": "H",
  "543": "h",
  "544": "N",
  "545": "d",
  "548": "Z",
  "549": "z",
  "550": "A",
  "551": "a",
  "552": "E",
  "553": "e",
  "558": "O",
  "559": "o",
  "562": "Y",
  "563": "y",
  "564": "l",
  "565": "n",
  "566": "t",
  "567": "j",
  "570": "A",
  "571": "C",
  "572": "c",
  "573": "L",
  "574": "T",
  "575": "s",
  "576": "z",
  "579": "B",
  "580": "U",
  "581": "V",
  "582": "E",
  "583": "e",
  "584": "J",
  "585": "j",
  "586": "Q",
  "587": "q",
  "588": "R",
  "589": "r",
  "590": "Y",
  "591": "y",
  "592": "a",
  "593": "a",
  "595": "b",
  "596": "o",
  "597": "c",
  "598": "d",
  "599": "d",
  "600": "e",
  "603": "e",
  "604": "e",
  "605": "e",
  "606": "e",
  "607": "j",
  "608": "g",
  "609": "g",
  "610": "g",
  "613": "h",
  "614": "h",
  "616": "i",
  "618": "i",
  "619": "l",
  "620": "l",
  "621": "l",
  "623": "m",
  "624": "m",
  "625": "m",
  "626": "n",
  "627": "n",
  "628": "n",
  "629": "o",
  "633": "r",
  "634": "r",
  "635": "r",
  "636": "r",
  "637": "r",
  "638": "r",
  "639": "r",
  "640": "r",
  "641": "r",
  "642": "s",
  "647": "t",
  "648": "t",
  "649": "u",
  "651": "v",
  "652": "v",
  "653": "w",
  "654": "y",
  "655": "y",
  "656": "z",
  "657": "z",
  "663": "c",
  "665": "b",
  "666": "e",
  "667": "g",
  "668": "h",
  "669": "j",
  "670": "k",
  "671": "l",
  "672": "q",
  "686": "h",
  "688": "h",
  "690": "j",
  "691": "r",
  "692": "r",
  "694": "r",
  "695": "w",
  "696": "y",
  "737": "l",
  "738": "s",
  "739": "x",
  "780": "v",
  "829": "x",
  "851": "x",
  "867": "a",
  "868": "e",
  "869": "i",
  "870": "o",
  "871": "u",
  "872": "c",
  "873": "d",
  "874": "h",
  "875": "m",
  "876": "r",
  "877": "t",
  "878": "v",
  "879": "x",
  "7424": "a",
  "7427": "b",
  "7428": "c",
  "7429": "d",
  "7431": "e",
  "7432": "e",
  "7433": "i",
  "7434": "j",
  "7435": "k",
  "7436": "l",
  "7437": "m",
  "7438": "n",
  "7439": "o",
  "7440": "o",
  "7441": "o",
  "7442": "o",
  "7443": "o",
  "7446": "o",
  "7447": "o",
  "7448": "p",
  "7449": "r",
  "7450": "r",
  "7451": "t",
  "7452": "u",
  "7453": "u",
  "7454": "u",
  "7455": "m",
  "7456": "v",
  "7457": "w",
  "7458": "z",
  "7522": "i",
  "7523": "r",
  "7524": "u",
  "7525": "v",
  "7680": "A",
  "7681": "a",
  "7682": "B",
  "7683": "b",
  "7684": "B",
  "7685": "b",
  "7686": "B",
  "7687": "b",
  "7690": "D",
  "7691": "d",
  "7692": "D",
  "7693": "d",
  "7694": "D",
  "7695": "d",
  "7696": "D",
  "7697": "d",
  "7698": "D",
  "7699": "d",
  "7704": "E",
  "7705": "e",
  "7706": "E",
  "7707": "e",
  "7710": "F",
  "7711": "f",
  "7712": "G",
  "7713": "g",
  "7714": "H",
  "7715": "h",
  "7716": "H",
  "7717": "h",
  "7718": "H",
  "7719": "h",
  "7720": "H",
  "7721": "h",
  "7722": "H",
  "7723": "h",
  "7724": "I",
  "7725": "i",
  "7728": "K",
  "7729": "k",
  "7730": "K",
  "7731": "k",
  "7732": "K",
  "7733": "k",
  "7734": "L",
  "7735": "l",
  "7738": "L",
  "7739": "l",
  "7740": "L",
  "7741": "l",
  "7742": "M",
  "7743": "m",
  "7744": "M",
  "7745": "m",
  "7746": "M",
  "7747": "m",
  "7748": "N",
  "7749": "n",
  "7750": "N",
  "7751": "n",
  "7752": "N",
  "7753": "n",
  "7754": "N",
  "7755": "n",
  "7764": "P",
  "7765": "p",
  "7766": "P",
  "7767": "p",
  "7768": "R",
  "7769": "r",
  "7770": "R",
  "7771": "r",
  "7774": "R",
  "7775": "r",
  "7776": "S",
  "7777": "s",
  "7778": "S",
  "7779": "s",
  "7786": "T",
  "7787": "t",
  "7788": "T",
  "7789": "t",
  "7790": "T",
  "7791": "t",
  "7792": "T",
  "7793": "t",
  "7794": "U",
  "7795": "u",
  "7796": "U",
  "7797": "u",
  "7798": "U",
  "7799": "u",
  "7804": "V",
  "7805": "v",
  "7806": "V",
  "7807": "v",
  "7808": "W",
  "7809": "w",
  "7810": "W",
  "7811": "w",
  "7812": "W",
  "7813": "w",
  "7814": "W",
  "7815": "w",
  "7816": "W",
  "7817": "w",
  "7818": "X",
  "7819": "x",
  "7820": "X",
  "7821": "x",
  "7822": "Y",
  "7823": "y",
  "7824": "Z",
  "7825": "z",
  "7826": "Z",
  "7827": "z",
  "7828": "Z",
  "7829": "z",
  "7835": "s",
  "7840": "A",
  "7841": "a",
  "7842": "A",
  "7843": "a",
  "7864": "E",
  "7865": "e",
  "7866": "E",
  "7867": "e",
  "7868": "E",
  "7869": "e",
  "7880": "I",
  "7881": "i",
  "7882": "I",
  "7883": "i",
  "7884": "O",
  "7885": "o",
  "7886": "O",
  "7887": "o",
  "7908": "U",
  "7909": "u",
  "7910": "U",
  "7911": "u",
  "7922": "Y",
  "7923": "y",
  "7924": "Y",
  "7925": "y",
  "7926": "Y",
  "7927": "y",
  "7928": "Y",
  "7929": "y",
  "8305": "i",
  "8341": "h",
  "8342": "k",
  "8343": "l",
  "8344": "m",
  "8345": "n",
  "8346": "p",
  "8347": "s",
  "8348": "t",
  "8450": "c",
  "8458": "g",
  "8459": "h",
  "8460": "h",
  "8461": "h",
  "8464": "i",
  "8465": "i",
  "8466": "l",
  "8467": "l",
  "8468": "l",
  "8469": "n",
  "8472": "p",
  "8473": "p",
  "8474": "q",
  "8475": "r",
  "8476": "r",
  "8477": "r",
  "8484": "z",
  "8488": "z",
  "8492": "b",
  "8493": "c",
  "8495": "e",
  "8496": "e",
  "8497": "f",
  "8498": "F",
  "8499": "m",
  "8500": "o",
  "8506": "q",
  "8513": "g",
  "8514": "l",
  "8515": "l",
  "8516": "y",
  "8517": "d",
  "8518": "d",
  "8519": "e",
  "8520": "i",
  "8521": "j",
  "8526": "f",
  "8579": "C",
  "8580": "c",
  "8765": "s",
  "8766": "s",
  "8959": "z",
  "8999": "x",
  "9746": "x",
  "9776": "i",
  "9866": "i",
  "10005": "x",
  "10006": "x",
  "10007": "x",
  "10008": "x",
  "10625": "z",
  "10626": "z",
  "11362": "L",
  "11364": "R",
  "11365": "a",
  "11366": "t",
  "11373": "A",
  "11374": "M",
  "11375": "A",
  "11390": "S",
  "11391": "Z",
  "19904": "i",
  "42893": "H",
  "42922": "H",
  "42923": "E",
  "42924": "G",
  "42925": "L",
  "42928": "K",
  "42929": "T",
  "62937": "x"
};
(function(module) {
  (function(window2, factory) {
    if (module.exports) {
      module.exports = factory(window2, window2.document);
    } else {
      window2.normalize = factory(window2, window2.document);
    }
  })(typeof window !== "undefined" ? window : commonjsGlobal, function(window2, document2) {
    var charmap = require$$0;
    var regex = null;
    var current_charmap;
    var old_charmap;
    function normalize2(str, custom_charmap) {
      old_charmap = current_charmap;
      current_charmap = custom_charmap || charmap;
      regex = regex && old_charmap === current_charmap ? regex : buildRegExp(current_charmap);
      return str.replace(regex, function(charToReplace) {
        return current_charmap[charToReplace.charCodeAt(0)] || charToReplace;
      });
    }
    function buildRegExp(charmap2) {
      return new RegExp("[" + Object.keys(charmap2).map(function(code2) {
        return String.fromCharCode(code2);
      }).join(" ") + "]", "g");
    }
    return normalize2;
  });
})(normalizeStrings);
const abalone = 4;
const abare = 3;
const abbruzzese = 4;
const abed = 2;
const aborigine = 5;
const abruzzese = 4;
const acreage = 3;
const adame = 3;
const adieu = 2;
const adobe = 3;
const anemone = 4;
const apache = 3;
const aphrodite = 4;
const apostrophe = 4;
const ariadne = 4;
const cafe = 2;
const calliope = 4;
const catastrophe = 4;
const chile = 2;
const chloe = 2;
const circe = 2;
const coyote = 3;
const daphne = 2;
const epitome = 4;
const eurydice = 4;
const euterpe = 3;
const every = 2;
const everywhere = 3;
const forever = 3;
const gethsemane = 4;
const guacamole = 4;
const hermione = 4;
const hyperbole = 4;
const jesse = 2;
const jukebox = 2;
const karate = 3;
const machete = 3;
const maybe = 2;
const newlywed = 3;
const penelope = 4;
const people = 2;
const persephone = 4;
const phoebe = 2;
const pulse = 1;
const queue$1 = 1;
const recipe = 3;
const riverbed = 3;
const sesame = 3;
const shoreline = 2;
const simile = 3;
const snuffleupagus = 5;
const sometimes = 2;
const syncope = 3;
const tamale = 3;
const waterbed = 3;
const wednesday = 2;
const yosemite = 4;
const zoe = 2;
var require$$2 = {
  abalone,
  abare,
  abbruzzese,
  abed,
  aborigine,
  abruzzese,
  acreage,
  adame,
  adieu,
  adobe,
  anemone,
  apache,
  aphrodite,
  apostrophe,
  ariadne,
  cafe,
  calliope,
  catastrophe,
  chile,
  chloe,
  circe,
  coyote,
  daphne,
  epitome,
  eurydice,
  euterpe,
  every,
  everywhere,
  forever,
  gethsemane,
  guacamole,
  hermione,
  hyperbole,
  jesse,
  jukebox,
  karate,
  machete,
  maybe,
  newlywed,
  penelope,
  people,
  persephone,
  phoebe,
  pulse,
  queue: queue$1,
  recipe,
  riverbed,
  sesame,
  shoreline,
  simile,
  snuffleupagus,
  sometimes,
  syncope,
  tamale,
  waterbed,
  wednesday,
  yosemite,
  zoe
};
var pluralize$2 = pluralize$3.exports;
var normalize = normalizeStrings.exports;
var problematic = require$$2;
var syllable_1 = syllables;
var own = {}.hasOwnProperty;
var EXPRESSION_MONOSYLLABIC_ONE = new RegExp([
  "cia(?:l|$)",
  "tia",
  "cius",
  "cious",
  "[^aeiou]giu",
  "[aeiouy][^aeiouy]ion",
  "iou",
  "sia$",
  "eous$",
  "[oa]gue$",
  ".[^aeiuoycgltdb]{2,}ed$",
  ".ely$",
  "^jua",
  "uai",
  "eau",
  "^busi$",
  "(?:[aeiouy](?:" + [
    "[bcfgklmnprsvwxyz]",
    "ch",
    "dg",
    "g[hn]",
    "lch",
    "l[lv]",
    "mm",
    "nch",
    "n[cgn]",
    "r[bcnsv]",
    "squ",
    "s[chkls]",
    "th"
  ].join("|") + ")ed$)",
  "(?:[aeiouy](?:" + [
    "[bdfklmnprstvy]",
    "ch",
    "g[hn]",
    "lch",
    "l[lv]",
    "mm",
    "nch",
    "nn",
    "r[nsv]",
    "squ",
    "s[cklst]",
    "th"
  ].join("|") + ")es$)"
].join("|"), "g");
var EXPRESSION_MONOSYLLABIC_TWO = new RegExp("[aeiouy](?:" + [
  "[bcdfgklmnprstvyz]",
  "ch",
  "dg",
  "g[hn]",
  "l[lv]",
  "mm",
  "n[cgn]",
  "r[cnsv]",
  "squ",
  "s[cklst]",
  "th"
].join("|") + ")e$", "g");
var EXPRESSION_DOUBLE_SYLLABIC_ONE = new RegExp("(?:" + [
  "([^aeiouy])\\1l",
  "[^aeiouy]ie(?:r|s?t)",
  "[aeiouym]bl",
  "eo",
  "ism",
  "asm",
  "thm",
  "dnt",
  "snt",
  "uity",
  "dea",
  "gean",
  "oa",
  "ua",
  "react?",
  "orbed",
  "eings?",
  "[aeiouy]sh?e[rs]"
].join("|") + ")$", "g");
var EXPRESSION_DOUBLE_SYLLABIC_TWO = new RegExp([
  "creat(?!u)",
  "[^gq]ua[^auieo]",
  "[aeiou]{3}",
  "^(?:ia|mc|coa[dglx].)",
  "^re(app|es|im|us)"
].join("|"), "g");
var EXPRESSION_DOUBLE_SYLLABIC_THREE = new RegExp([
  "[^aeiou]y[ae]",
  "[^l]lien",
  "riet",
  "dien",
  "iu",
  "io",
  "ii",
  "uen",
  "real",
  "iell",
  "eo[^aeiou]",
  "[aeiou]y[aeiou]"
].join("|"), "g");
var EXPRESSION_DOUBLE_SYLLABIC_FOUR = /[^s]ia/;
var EXPRESSION_SINGLE = new RegExp([
  "^(?:" + [
    "un",
    "fore",
    "ware",
    "none?",
    "out",
    "post",
    "sub",
    "pre",
    "pro",
    "dis",
    "side",
    "some"
  ].join("|") + ")",
  "(?:" + [
    "ly",
    "less",
    "some",
    "ful",
    "ers?",
    "ness",
    "cians?",
    "ments?",
    "ettes?",
    "villes?",
    "ships?",
    "sides?",
    "ports?",
    "shires?",
    "tion(?:ed|s)?"
  ].join("|") + ")$"
].join("|"), "g");
var EXPRESSION_DOUBLE = new RegExp([
  "^(?:" + [
    "above",
    "anti",
    "ante",
    "counter",
    "hyper",
    "afore",
    "agri",
    "infra",
    "intra",
    "inter",
    "over",
    "semi",
    "ultra",
    "under",
    "extra",
    "dia",
    "micro",
    "mega",
    "kilo",
    "pico",
    "nano",
    "macro",
    "somer"
  ].join("|") + ")",
  "(?:" + ["fully", "berry", "woman", "women", "edly"].join("|") + ")$"
].join("|"), "g");
var EXPRESSION_TRIPLE = /(creations?|ology|ologist|onomy|onomist)$/g;
var SPLIT = /\b/g;
var APOSTROPHE = /['’]/g;
var EXPRESSION_NONALPHABETIC = /[^a-z]/g;
function syllables(value) {
  var values = normalize(String(value)).toLowerCase().replace(APOSTROPHE, "").split(SPLIT);
  var length = values.length;
  var index2 = -1;
  var total = 0;
  while (++index2 < length) {
    total += syllable$1(values[index2].replace(EXPRESSION_NONALPHABETIC, ""));
  }
  return total;
}
function syllable$1(value) {
  var count = 0;
  var index2;
  var length;
  var singular;
  var parts;
  var addOne;
  var subtractOne;
  if (value.length === 0) {
    return count;
  }
  if (value.length < 3) {
    return 1;
  }
  if (own.call(problematic, value)) {
    return problematic[value];
  }
  singular = pluralize$2(value, 1);
  if (own.call(problematic, singular)) {
    return problematic[singular];
  }
  addOne = returnFactory(1);
  subtractOne = returnFactory(-1);
  value = value.replace(EXPRESSION_TRIPLE, countFactory(3)).replace(EXPRESSION_DOUBLE, countFactory(2)).replace(EXPRESSION_SINGLE, countFactory(1));
  parts = value.split(/[^aeiouy]+/);
  index2 = -1;
  length = parts.length;
  while (++index2 < length) {
    if (parts[index2] !== "") {
      count++;
    }
  }
  value.replace(EXPRESSION_MONOSYLLABIC_ONE, subtractOne).replace(EXPRESSION_MONOSYLLABIC_TWO, subtractOne);
  value.replace(EXPRESSION_DOUBLE_SYLLABIC_ONE, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_TWO, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_THREE, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_FOUR, addOne);
  return count || 1;
  function countFactory(addition) {
    return counter;
    function counter() {
      count += addition;
      return "";
    }
  }
  function returnFactory(addition) {
    return returner;
    function returner($0) {
      count += addition;
      return $0;
    }
  }
}
var pluralize$1 = { exports: {} };
(function(module, exports) {
  (function(root, pluralize2) {
    if (typeof commonjsRequire === "function" && true && true) {
      module.exports = pluralize2();
    } else {
      root.pluralize = pluralize2();
    }
  })(commonjsGlobal, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index2) {
        return args[index2] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index2) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index2 - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len2 = rules.length;
      while (len2--) {
        var rule = rules[len2];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      ["genus", "genera"],
      ["viscus", "viscera"],
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      /[^aeiou]ese$/i,
      /deer$/i,
      /fish$/i,
      /measles$/i,
      /o[iu]s$/i,
      /pox$/i,
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
})(pluralize$1);
const easyWords$1 = [
  "a",
  "able",
  "aboard",
  "about",
  "above",
  "absent",
  "accept",
  "accident",
  "account",
  "ache",
  "aching",
  "acorn",
  "acre",
  "across",
  "act",
  "acts",
  "add",
  "address",
  "admire",
  "adventure",
  "afar",
  "afraid",
  "after",
  "afternoon",
  "afterward",
  "afterwards",
  "again",
  "against",
  "age",
  "aged",
  "ago",
  "agree",
  "ah",
  "ahead",
  "aid",
  "aim",
  "air",
  "airfield",
  "airplane",
  "airport",
  "airship",
  "airy",
  "alarm",
  "alike",
  "alive",
  "all",
  "alley",
  "alligator",
  "allow",
  "almost",
  "alone",
  "along",
  "aloud",
  "already",
  "also",
  "always",
  "am",
  "america",
  "american",
  "among",
  "amount",
  "an",
  "and",
  "angel",
  "anger",
  "angry",
  "animal",
  "another",
  "answer",
  "ant",
  "any",
  "anybody",
  "anyhow",
  "anyone",
  "anything",
  "anyway",
  "anywhere",
  "apart",
  "apartment",
  "ape",
  "apiece",
  "appear",
  "apple",
  "april",
  "apron",
  "are",
  "aren't",
  "arise",
  "arithmetic",
  "arm",
  "armful",
  "army",
  "arose",
  "around",
  "arrange",
  "arrive",
  "arrived",
  "arrow",
  "art",
  "artist",
  "as",
  "ash",
  "ashes",
  "aside",
  "ask",
  "asleep",
  "at",
  "ate",
  "attack",
  "attend",
  "attention",
  "august",
  "aunt",
  "author",
  "auto",
  "automobile",
  "autumn",
  "avenue",
  "awake",
  "awaken",
  "away",
  "awful",
  "awfully",
  "awhile",
  "ax",
  "axe",
  "baa",
  "babe",
  "babies",
  "back",
  "background",
  "backward",
  "backwards",
  "bacon",
  "bad",
  "badge",
  "badly",
  "bag",
  "bake",
  "baker",
  "bakery",
  "baking",
  "ball",
  "balloon",
  "banana",
  "band",
  "bandage",
  "bang",
  "banjo",
  "bank",
  "banker",
  "bar",
  "barber",
  "bare",
  "barefoot",
  "barely",
  "bark",
  "barn",
  "barrel",
  "base",
  "baseball",
  "basement",
  "basket",
  "bat",
  "batch",
  "bath",
  "bathe",
  "bathing",
  "bathroom",
  "bathtub",
  "battle",
  "battleship",
  "bay",
  "be",
  "beach",
  "bead",
  "beam",
  "bean",
  "bear",
  "beard",
  "beast",
  "beat",
  "beating",
  "beautiful",
  "beautify",
  "beauty",
  "became",
  "because",
  "become",
  "becoming",
  "bed",
  "bedbug",
  "bedroom",
  "bedspread",
  "bedtime",
  "bee",
  "beech",
  "beef",
  "beefsteak",
  "beehive",
  "been",
  "beer",
  "beet",
  "before",
  "beg",
  "began",
  "beggar",
  "begged",
  "begin",
  "beginning",
  "begun",
  "behave",
  "behind",
  "being",
  "believe",
  "bell",
  "belong",
  "below",
  "belt",
  "bench",
  "bend",
  "beneath",
  "bent",
  "berries",
  "berry",
  "beside",
  "besides",
  "best",
  "bet",
  "better",
  "between",
  "bib",
  "bible",
  "bicycle",
  "bid",
  "big",
  "bigger",
  "bill",
  "billboard",
  "bin",
  "bind",
  "bird",
  "birth",
  "birthday",
  "biscuit",
  "bit",
  "bite",
  "biting",
  "bitter",
  "black",
  "blackberry",
  "blackbird",
  "blackboard",
  "blackness",
  "blacksmith",
  "blame",
  "blank",
  "blanket",
  "blast",
  "blaze",
  "bleed",
  "bless",
  "blessing",
  "blew",
  "blind",
  "blindfold",
  "blinds",
  "block",
  "blood",
  "bloom",
  "blossom",
  "blot",
  "blow",
  "blue",
  "blueberry",
  "bluebird",
  "blush",
  "board",
  "boast",
  "boat",
  "bob",
  "bobwhite",
  "bodies",
  "body",
  "boil",
  "boiler",
  "bold",
  "bone",
  "bonnet",
  "boo",
  "book",
  "bookcase",
  "bookkeeper",
  "boom",
  "boot",
  "born",
  "borrow",
  "boss",
  "both",
  "bother",
  "bottle",
  "bottom",
  "bought",
  "bounce",
  "bow",
  "bowl",
  "bow-wow",
  "box",
  "boxcar",
  "boxer",
  "boxes",
  "boy",
  "boyhood",
  "bracelet",
  "brain",
  "brake",
  "bran",
  "branch",
  "brass",
  "brave",
  "bread",
  "break",
  "breakfast",
  "breast",
  "breath",
  "breathe",
  "breeze",
  "brick",
  "bride",
  "bridge",
  "bright",
  "brightness",
  "bring",
  "broad",
  "broadcast",
  "broke",
  "broken",
  "brook",
  "broom",
  "brother",
  "brought",
  "brown",
  "brush",
  "bubble",
  "bucket",
  "buckle",
  "bud",
  "buffalo",
  "bug",
  "buggy",
  "build",
  "building",
  "built",
  "bulb",
  "bull",
  "bullet",
  "bum",
  "bumblebee",
  "bump",
  "bun",
  "bunch",
  "bundle",
  "bunny",
  "burn",
  "burst",
  "bury",
  "bus",
  "bush",
  "bushel",
  "business",
  "busy",
  "but",
  "butcher",
  "butt",
  "butter",
  "buttercup",
  "butterfly",
  "buttermilk",
  "butterscotch",
  "button",
  "buttonhole",
  "buy",
  "buzz",
  "by",
  "bye",
  "cab",
  "cabbage",
  "cabin",
  "cabinet",
  "cackle",
  "cage",
  "cake",
  "calendar",
  "calf",
  "call",
  "caller",
  "calling",
  "came",
  "camel",
  "camp",
  "campfire",
  "can",
  "canal",
  "canary",
  "candle",
  "candlestick",
  "candy",
  "cane",
  "cannon",
  "cannot",
  "canoe",
  "can't",
  "canyon",
  "cap",
  "cape",
  "capital",
  "captain",
  "car",
  "card",
  "cardboard",
  "care",
  "careful",
  "careless",
  "carelessness",
  "carload",
  "carpenter",
  "carpet",
  "carriage",
  "carrot",
  "carry",
  "cart",
  "carve",
  "case",
  "cash",
  "cashier",
  "castle",
  "cat",
  "catbird",
  "catch",
  "catcher",
  "caterpillar",
  "catfish",
  "catsup",
  "cattle",
  "caught",
  "cause",
  "cave",
  "ceiling",
  "cell",
  "cellar",
  "cent",
  "center",
  "cereal",
  "certain",
  "certainly",
  "chain",
  "chair",
  "chalk",
  "champion",
  "chance",
  "change",
  "chap",
  "charge",
  "charm",
  "chart",
  "chase",
  "chatter",
  "cheap",
  "cheat",
  "check",
  "checkers",
  "cheek",
  "cheer",
  "cheese",
  "cherry",
  "chest",
  "chew",
  "chick",
  "chicken",
  "chief",
  "child",
  "childhood",
  "children",
  "chill",
  "chilly",
  "chimney",
  "chin",
  "china",
  "chip",
  "chipmunk",
  "chocolate",
  "choice",
  "choose",
  "chop",
  "chorus",
  "chose",
  "chosen",
  "christen",
  "christmas",
  "church",
  "churn",
  "cigarette",
  "circle",
  "circus",
  "citizen",
  "city",
  "clang",
  "clap",
  "class",
  "classmate",
  "classroom",
  "claw",
  "clay",
  "clean",
  "cleaner",
  "clear",
  "clerk",
  "clever",
  "click",
  "cliff",
  "climb",
  "clip",
  "cloak",
  "clock",
  "close",
  "closet",
  "cloth",
  "clothes",
  "clothing",
  "cloud",
  "cloudy",
  "clover",
  "clown",
  "club",
  "cluck",
  "clump",
  "coach",
  "coal",
  "coast",
  "coat",
  "cob",
  "cobbler",
  "cocoa",
  "coconut",
  "cocoon",
  "cod",
  "codfish",
  "coffee",
  "coffeepot",
  "coin",
  "cold",
  "collar",
  "college",
  "color",
  "colored",
  "colt",
  "column",
  "comb",
  "come",
  "comfort",
  "comic",
  "coming",
  "company",
  "compare",
  "conductor",
  "cone",
  "connect",
  "coo",
  "cook",
  "cooked",
  "cooking",
  "cookie",
  "cookies",
  "cool",
  "cooler",
  "coop",
  "copper",
  "copy",
  "cord",
  "cork",
  "corn",
  "corner",
  "correct",
  "cost",
  "cot",
  "cottage",
  "cotton",
  "couch",
  "cough",
  "could",
  "couldn't",
  "count",
  "counter",
  "country",
  "county",
  "course",
  "court",
  "cousin",
  "cover",
  "cow",
  "coward",
  "cowardly",
  "cowboy",
  "cozy",
  "crab",
  "crack",
  "cracker",
  "cradle",
  "cramps",
  "cranberry",
  "crank",
  "cranky",
  "crash",
  "crawl",
  "crazy",
  "cream",
  "creamy",
  "creek",
  "creep",
  "crept",
  "cried",
  "croak",
  "crook",
  "crooked",
  "crop",
  "cross",
  "crossing",
  "cross-eyed",
  "crow",
  "crowd",
  "crowded",
  "crown",
  "cruel",
  "crumb",
  "crumble",
  "crush",
  "crust",
  "cry",
  "cries",
  "cub",
  "cuff",
  "cup",
  "cuff",
  "cup",
  "cupboard",
  "cupful",
  "cure",
  "curl",
  "curly",
  "curtain",
  "curve",
  "cushion",
  "custard",
  "customer",
  "cut",
  "cute",
  "cutting",
  "dab",
  "dad",
  "daddy",
  "daily",
  "dairy",
  "daisy",
  "dam",
  "damage",
  "dame",
  "damp",
  "dance",
  "dancer",
  "dancing",
  "dandy",
  "danger",
  "dangerous",
  "dare",
  "dark",
  "darkness",
  "darling",
  "darn",
  "dart",
  "dash",
  "date",
  "daughter",
  "dawn",
  "day",
  "daybreak",
  "daytime",
  "dead",
  "deaf",
  "deal",
  "dear",
  "death",
  "december",
  "decide",
  "deck",
  "deed",
  "deep",
  "deer",
  "defeat",
  "defend",
  "defense",
  "delight",
  "den",
  "dentist",
  "depend",
  "deposit",
  "describe",
  "desert",
  "deserve",
  "desire",
  "desk",
  "destroy",
  "devil",
  "dew",
  "diamond",
  "did",
  "didn't",
  "die",
  "died",
  "dies",
  "difference",
  "different",
  "dig",
  "dim",
  "dime",
  "dine",
  "ding-dong",
  "dinner",
  "dip",
  "direct",
  "direction",
  "dirt",
  "dirty",
  "discover",
  "dish",
  "dislike",
  "dismiss",
  "ditch",
  "dive",
  "diver",
  "divide",
  "do",
  "dock",
  "doctor",
  "does",
  "doesn't",
  "dog",
  "doll",
  "dollar",
  "dolly",
  "done",
  "donkey",
  "don't",
  "door",
  "doorbell",
  "doorknob",
  "doorstep",
  "dope",
  "dot",
  "double",
  "dough",
  "dove",
  "down",
  "downstairs",
  "downtown",
  "dozen",
  "drag",
  "drain",
  "drank",
  "draw",
  "drawer",
  "draw",
  "drawing",
  "dream",
  "dress",
  "dresser",
  "dressmaker",
  "drew",
  "dried",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "driven",
  "driver",
  "drop",
  "drove",
  "drown",
  "drowsy",
  "drub",
  "drum",
  "drunk",
  "dry",
  "duck",
  "due",
  "dug",
  "dull",
  "dumb",
  "dump",
  "during",
  "dust",
  "dusty",
  "duty",
  "dwarf",
  "dwell",
  "dwelt",
  "dying",
  "each",
  "eager",
  "eagle",
  "ear",
  "early",
  "earn",
  "earth",
  "east",
  "eastern",
  "easy",
  "eat",
  "eaten",
  "edge",
  "egg",
  "eh",
  "eight",
  "eighteen",
  "eighth",
  "eighty",
  "either",
  "elbow",
  "elder",
  "eldest",
  "electric",
  "electricity",
  "elephant",
  "eleven",
  "elf",
  "elm",
  "else",
  "elsewhere",
  "empty",
  "end",
  "ending",
  "enemy",
  "engine",
  "engineer",
  "english",
  "enjoy",
  "enough",
  "enter",
  "envelope",
  "equal",
  "erase",
  "eraser",
  "errand",
  "escape",
  "eve",
  "even",
  "evening",
  "ever",
  "every",
  "everybody",
  "everyday",
  "everyone",
  "everything",
  "everywhere",
  "evil",
  "exact",
  "except",
  "exchange",
  "excited",
  "exciting",
  "excuse",
  "exit",
  "expect",
  "explain",
  "extra",
  "eye",
  "eyebrow",
  "fable",
  "face",
  "facing",
  "fact",
  "factory",
  "fail",
  "faint",
  "fair",
  "fairy",
  "faith",
  "fake",
  "fall",
  "false",
  "family",
  "fan",
  "fancy",
  "far",
  "faraway",
  "fare",
  "farmer",
  "farm",
  "farming",
  "far-off",
  "farther",
  "fashion",
  "fast",
  "fasten",
  "fat",
  "father",
  "fault",
  "favor",
  "favorite",
  "fear",
  "feast",
  "feather",
  "february",
  "fed",
  "feed",
  "feel",
  "feet",
  "fell",
  "fellow",
  "felt",
  "fence",
  "fever",
  "few",
  "fib",
  "fiddle",
  "field",
  "fife",
  "fifteen",
  "fifth",
  "fifty",
  "fig",
  "fight",
  "figure",
  "file",
  "fill",
  "film",
  "finally",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firearm",
  "firecracker",
  "fireplace",
  "fireworks",
  "firing",
  "first",
  "fish",
  "fisherman",
  "fist",
  "fit",
  "fits",
  "five",
  "fix",
  "flag",
  "flake",
  "flame",
  "flap",
  "flash",
  "flashlight",
  "flat",
  "flea",
  "flesh",
  "flew",
  "flies",
  "flight",
  "flip",
  "flip-flop",
  "float",
  "flock",
  "flood",
  "floor",
  "flop",
  "flour",
  "flow",
  "flower",
  "flowery",
  "flutter",
  "fly",
  "foam",
  "fog",
  "foggy",
  "fold",
  "folks",
  "follow",
  "following",
  "fond",
  "food",
  "fool",
  "foolish",
  "foot",
  "football",
  "footprint",
  "for",
  "forehead",
  "forest",
  "forget",
  "forgive",
  "forgot",
  "forgotten",
  "fork",
  "form",
  "fort",
  "forth",
  "fortune",
  "forty",
  "forward",
  "fought",
  "found",
  "fountain",
  "four",
  "fourteen",
  "fourth",
  "fox",
  "frame",
  "free",
  "freedom",
  "freeze",
  "freight",
  "french",
  "fresh",
  "fret",
  "friday",
  "fried",
  "friend",
  "friendly",
  "friendship",
  "frighten",
  "frog",
  "from",
  "front",
  "frost",
  "frown",
  "froze",
  "fruit",
  "fry",
  "fudge",
  "fuel",
  "full",
  "fully",
  "fun",
  "funny",
  "fur",
  "furniture",
  "further",
  "fuzzy",
  "gain",
  "gallon",
  "gallop",
  "game",
  "gang",
  "garage",
  "garbage",
  "garden",
  "gas",
  "gasoline",
  "gate",
  "gather",
  "gave",
  "gay",
  "gear",
  "geese",
  "general",
  "gentle",
  "gentleman",
  "gentlemen",
  "geography",
  "get",
  "getting",
  "giant",
  "gift",
  "gingerbread",
  "girl",
  "give",
  "given",
  "giving",
  "glad",
  "gladly",
  "glance",
  "glass",
  "glasses",
  "gleam",
  "glide",
  "glory",
  "glove",
  "glow",
  "glue",
  "go",
  "going",
  "goes",
  "goal",
  "goat",
  "gobble",
  "god",
  "god",
  "godmother",
  "gold",
  "golden",
  "goldfish",
  "golf",
  "gone",
  "good",
  "goods",
  "goodbye",
  "good-by",
  "goodbye",
  "good-bye",
  "good-looking",
  "goodness",
  "goody",
  "goose",
  "gooseberry",
  "got",
  "govern",
  "government",
  "gown",
  "grab",
  "gracious",
  "grade",
  "grain",
  "grand",
  "grandchild",
  "grandchildren",
  "granddaughter",
  "grandfather",
  "grandma",
  "grandmother",
  "grandpa",
  "grandson",
  "grandstand",
  "grape",
  "grapes",
  "grapefruit",
  "grass",
  "grasshopper",
  "grateful",
  "grave",
  "gravel",
  "graveyard",
  "gravy",
  "gray",
  "graze",
  "grease",
  "great",
  "green",
  "greet",
  "grew",
  "grind",
  "groan",
  "grocery",
  "ground",
  "group",
  "grove",
  "grow",
  "guard",
  "guess",
  "guest",
  "guide",
  "gulf",
  "gum",
  "gun",
  "gunpowder",
  "guy",
  "ha",
  "habit",
  "had",
  "hadn't",
  "hail",
  "hair",
  "haircut",
  "hairpin",
  "half",
  "hall",
  "halt",
  "ham",
  "hammer",
  "hand",
  "handful",
  "handkerchief",
  "handle",
  "handwriting",
  "hang",
  "happen",
  "happily",
  "happiness",
  "happy",
  "harbor",
  "hard",
  "hardly",
  "hardship",
  "hardware",
  "hare",
  "hark",
  "harm",
  "harness",
  "harp",
  "harvest",
  "has",
  "hasn't",
  "haste",
  "hasten",
  "hasty",
  "hat",
  "hatch",
  "hatchet",
  "hate",
  "haul",
  "have",
  "haven't",
  "having",
  "hawk",
  "hay",
  "hayfield",
  "haystack",
  "he",
  "head",
  "headache",
  "heal",
  "health",
  "healthy",
  "heap",
  "hear",
  "hearing",
  "heard",
  "heart",
  "heat",
  "heater",
  "heaven",
  "heavy",
  "he'd",
  "heel",
  "height",
  "held",
  "hell",
  "he'll",
  "hello",
  "helmet",
  "help",
  "helper",
  "helpful",
  "hem",
  "hen",
  "henhouse",
  "her",
  "hers",
  "herd",
  "here",
  "here's",
  "hero",
  "herself",
  "he's",
  "hey",
  "hickory",
  "hid",
  "hidden",
  "hide",
  "high",
  "highway",
  "hill",
  "hillside",
  "hilltop",
  "hilly",
  "him",
  "himself",
  "hind",
  "hint",
  "hip",
  "hire",
  "his",
  "hiss",
  "history",
  "hit",
  "hitch",
  "hive",
  "ho",
  "hoe",
  "hog",
  "hold",
  "holder",
  "hole",
  "holiday",
  "hollow",
  "holy",
  "home",
  "homely",
  "homesick",
  "honest",
  "honey",
  "honeybee",
  "honeymoon",
  "honk",
  "honor",
  "hood",
  "hoof",
  "hook",
  "hoop",
  "hop",
  "hope",
  "hopeful",
  "hopeless",
  "horn",
  "horse",
  "horseback",
  "horseshoe",
  "hose",
  "hospital",
  "host",
  "hot",
  "hotel",
  "hound",
  "hour",
  "house",
  "housetop",
  "housewife",
  "housework",
  "how",
  "however",
  "howl",
  "hug",
  "huge",
  "hum",
  "humble",
  "hump",
  "hundred",
  "hung",
  "hunger",
  "hungry",
  "hunk",
  "hunt",
  "hunter",
  "hurrah",
  "hurried",
  "hurry",
  "hurt",
  "husband",
  "hush",
  "hut",
  "hymn",
  "i",
  "ice",
  "icy",
  "i'd",
  "idea",
  "ideal",
  "if",
  "ill",
  "i'll",
  "i'm",
  "important",
  "impossible",
  "improve",
  "in",
  "inch",
  "inches",
  "income",
  "indeed",
  "indian",
  "indoors",
  "ink",
  "inn",
  "insect",
  "inside",
  "instant",
  "instead",
  "insult",
  "intend",
  "interested",
  "interesting",
  "into",
  "invite",
  "iron",
  "is",
  "island",
  "isn't",
  "it",
  "its",
  "it's",
  "itself",
  "i've",
  "ivory",
  "ivy",
  "jacket",
  "jacks",
  "jail",
  "jam",
  "january",
  "jar",
  "jaw",
  "jay",
  "jelly",
  "jellyfish",
  "jerk",
  "jig",
  "job",
  "jockey",
  "join",
  "joke",
  "joking",
  "jolly",
  "journey",
  "joy",
  "joyful",
  "joyous",
  "judge",
  "jug",
  "juice",
  "juicy",
  "july",
  "jump",
  "june",
  "junior",
  "junk",
  "just",
  "keen",
  "keep",
  "kept",
  "kettle",
  "key",
  "kick",
  "kid",
  "kill",
  "killed",
  "kind",
  "kindly",
  "kindness",
  "king",
  "kingdom",
  "kiss",
  "kitchen",
  "kite",
  "kitten",
  "kitty",
  "knee",
  "kneel",
  "knew",
  "knife",
  "knit",
  "knives",
  "knob",
  "knock",
  "knot",
  "know",
  "known",
  "lace",
  "lad",
  "ladder",
  "ladies",
  "lady",
  "laid",
  "lake",
  "lamb",
  "lame",
  "lamp",
  "land",
  "lane",
  "language",
  "lantern",
  "lap",
  "lard",
  "large",
  "lash",
  "lass",
  "last",
  "late",
  "laugh",
  "laundry",
  "law",
  "lawn",
  "lawyer",
  "lay",
  "lazy",
  "lead",
  "leader",
  "leaf",
  "leak",
  "lean",
  "leap",
  "learn",
  "learned",
  "least",
  "leather",
  "leave",
  "leaving",
  "led",
  "left",
  "leg",
  "lemon",
  "lemonade",
  "lend",
  "length",
  "less",
  "lesson",
  "let",
  "let's",
  "letter",
  "letting",
  "lettuce",
  "level",
  "liberty",
  "library",
  "lice",
  "lick",
  "lid",
  "lie",
  "life",
  "lift",
  "light",
  "lightness",
  "lightning",
  "like",
  "likely",
  "liking",
  "lily",
  "limb",
  "lime",
  "limp",
  "line",
  "linen",
  "lion",
  "lip",
  "list",
  "listen",
  "lit",
  "little",
  "live",
  "lives",
  "lively",
  "liver",
  "living",
  "lizard",
  "load",
  "loaf",
  "loan",
  "loaves",
  "lock",
  "locomotive",
  "log",
  "lone",
  "lonely",
  "lonesome",
  "long",
  "look",
  "lookout",
  "loop",
  "loose",
  "lord",
  "lose",
  "loser",
  "loss",
  "lost",
  "lot",
  "loud",
  "love",
  "lovely",
  "lover",
  "low",
  "luck",
  "lucky",
  "lumber",
  "lump",
  "lunch",
  "lying",
  "machine",
  "machinery",
  "mad",
  "made",
  "magazine",
  "magic",
  "maid",
  "mail",
  "mailbox",
  "mailman",
  "major",
  "make",
  "making",
  "male",
  "mama",
  "mamma",
  "man",
  "manager",
  "mane",
  "manger",
  "many",
  "map",
  "maple",
  "marble",
  "march",
  "march",
  "mare",
  "mark",
  "market",
  "marriage",
  "married",
  "marry",
  "mask",
  "mast",
  "master",
  "mat",
  "match",
  "matter",
  "mattress",
  "may",
  "may",
  "maybe",
  "mayor",
  "maypole",
  "me",
  "meadow",
  "meal",
  "mean",
  "means",
  "meant",
  "measure",
  "meat",
  "medicine",
  "meet",
  "meeting",
  "melt",
  "member",
  "men",
  "mend",
  "meow",
  "merry",
  "mess",
  "message",
  "met",
  "metal",
  "mew",
  "mice",
  "middle",
  "midnight",
  "might",
  "mighty",
  "mile",
  "milk",
  "milkman",
  "mill",
  "miler",
  "million",
  "mind",
  "mine",
  "miner",
  "mint",
  "minute",
  "mirror",
  "mischief",
  "miss",
  "miss",
  "misspell",
  "mistake",
  "misty",
  "mitt",
  "mitten",
  "mix",
  "moment",
  "monday",
  "money",
  "monkey",
  "month",
  "moo",
  "moon",
  "moonlight",
  "moose",
  "mop",
  "more",
  "morning",
  "morrow",
  "moss",
  "most",
  "mostly",
  "mother",
  "motor",
  "mount",
  "mountain",
  "mouse",
  "mouth",
  "move",
  "movie",
  "movies",
  "moving",
  "mow",
  "mr.",
  "mrs.",
  "much",
  "mud",
  "muddy",
  "mug",
  "mule",
  "multiply",
  "murder",
  "music",
  "must",
  "my",
  "myself",
  "nail",
  "name",
  "nap",
  "napkin",
  "narrow",
  "nasty",
  "naughty",
  "navy",
  "near",
  "nearby",
  "nearly",
  "neat",
  "neck",
  "necktie",
  "need",
  "needle",
  "needn't",
  "negro",
  "neighbor",
  "neighborhood",
  "neither",
  "nerve",
  "nest",
  "net",
  "never",
  "nevermore",
  "new",
  "news",
  "newspaper",
  "next",
  "nibble",
  "nice",
  "nickel",
  "night",
  "nightgown",
  "nine",
  "nineteen",
  "ninety",
  "no",
  "nobody",
  "nod",
  "noise",
  "noisy",
  "none",
  "noon",
  "nor",
  "north",
  "northern",
  "nose",
  "not",
  "note",
  "nothing",
  "notice",
  "november",
  "now",
  "nowhere",
  "number",
  "nurse",
  "nut",
  "oak",
  "oar",
  "oatmeal",
  "oats",
  "obey",
  "ocean",
  "o'clock",
  "october",
  "odd",
  "of",
  "off",
  "offer",
  "office",
  "officer",
  "often",
  "oh",
  "oil",
  "old",
  "old-fashioned",
  "on",
  "once",
  "one",
  "onion",
  "only",
  "onward",
  "open",
  "or",
  "orange",
  "orchard",
  "order",
  "ore",
  "organ",
  "other",
  "otherwise",
  "ouch",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "outdoors",
  "outfit",
  "outlaw",
  "outline",
  "outside",
  "outward",
  "oven",
  "over",
  "overalls",
  "overcoat",
  "overeat",
  "overhead",
  "overhear",
  "overnight",
  "overturn",
  "owe",
  "owing",
  "owl",
  "own",
  "owner",
  "ox",
  "pa",
  "pace",
  "pack",
  "package",
  "pad",
  "page",
  "paid",
  "pail",
  "pain",
  "painful",
  "paint",
  "painter",
  "painting",
  "pair",
  "pal",
  "palace",
  "pale",
  "pan",
  "pancake",
  "pane",
  "pansy",
  "pants",
  "papa",
  "paper",
  "parade",
  "pardon",
  "parent",
  "park",
  "part",
  "partly",
  "partner",
  "party",
  "pass",
  "passenger",
  "past",
  "paste",
  "pasture",
  "pat",
  "patch",
  "path",
  "patter",
  "pave",
  "pavement",
  "paw",
  "pay",
  "payment",
  "pea",
  "peas",
  "peace",
  "peaceful",
  "peach",
  "peaches",
  "peak",
  "peanut",
  "pear",
  "pearl",
  "peck",
  "peek",
  "peel",
  "peep",
  "peg",
  "pen",
  "pencil",
  "penny",
  "people",
  "pepper",
  "peppermint",
  "perfume",
  "perhaps",
  "person",
  "pet",
  "phone",
  "piano",
  "pick",
  "pickle",
  "picnic",
  "picture",
  "pie",
  "piece",
  "pig",
  "pigeon",
  "piggy",
  "pile",
  "pill",
  "pillow",
  "pin",
  "pine",
  "pineapple",
  "pink",
  "pint",
  "pipe",
  "pistol",
  "pit",
  "pitch",
  "pitcher",
  "pity",
  "place",
  "plain",
  "plan",
  "plane",
  "plant",
  "plate",
  "platform",
  "platter",
  "play",
  "player",
  "playground",
  "playhouse",
  "playmate",
  "plaything",
  "pleasant",
  "please",
  "pleasure",
  "plenty",
  "plow",
  "plug",
  "plum",
  "pocket",
  "pocketbook",
  "poem",
  "point",
  "poison",
  "poke",
  "pole",
  "police",
  "policeman",
  "polish",
  "polite",
  "pond",
  "ponies",
  "pony",
  "pool",
  "poor",
  "pop",
  "popcorn",
  "popped",
  "porch",
  "pork",
  "possible",
  "post",
  "postage",
  "postman",
  "pot",
  "potato",
  "potatoes",
  "pound",
  "pour",
  "powder",
  "power",
  "powerful",
  "praise",
  "pray",
  "prayer",
  "prepare",
  "present",
  "pretty",
  "price",
  "prick",
  "prince",
  "princess",
  "print",
  "prison",
  "prize",
  "promise",
  "proper",
  "protect",
  "proud",
  "prove",
  "prune",
  "public",
  "puddle",
  "puff",
  "pull",
  "pump",
  "pumpkin",
  "punch",
  "punish",
  "pup",
  "pupil",
  "puppy",
  "pure",
  "purple",
  "purse",
  "push",
  "puss",
  "pussy",
  "pussycat",
  "put",
  "putting",
  "puzzle",
  "quack",
  "quart",
  "quarter",
  "queen",
  "queer",
  "question",
  "quick",
  "quickly",
  "quiet",
  "quilt",
  "quit",
  "quite",
  "rabbit",
  "race",
  "rack",
  "radio",
  "radish",
  "rag",
  "rail",
  "railroad",
  "railway",
  "rain",
  "rainy",
  "rainbow",
  "raise",
  "raisin",
  "rake",
  "ram",
  "ran",
  "ranch",
  "rang",
  "rap",
  "rapidly",
  "rat",
  "rate",
  "rather",
  "rattle",
  "raw",
  "ray",
  "reach",
  "read",
  "reader",
  "reading",
  "ready",
  "real",
  "really",
  "reap",
  "rear",
  "reason",
  "rebuild",
  "receive",
  "recess",
  "record",
  "red",
  "redbird",
  "redbreast",
  "refuse",
  "reindeer",
  "rejoice",
  "remain",
  "remember",
  "remind",
  "remove",
  "rent",
  "repair",
  "repay",
  "repeat",
  "report",
  "rest",
  "return",
  "review",
  "reward",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "rid",
  "riddle",
  "ride",
  "rider",
  "riding",
  "right",
  "rim",
  "ring",
  "rip",
  "ripe",
  "rise",
  "rising",
  "river",
  "road",
  "roadside",
  "roar",
  "roast",
  "rob",
  "robber",
  "robe",
  "robin",
  "rock",
  "rocky",
  "rocket",
  "rode",
  "roll",
  "roller",
  "roof",
  "room",
  "rooster",
  "root",
  "rope",
  "rose",
  "rosebud",
  "rot",
  "rotten",
  "rough",
  "round",
  "route",
  "row",
  "rowboat",
  "royal",
  "rub",
  "rubbed",
  "rubber",
  "rubbish",
  "rug",
  "rule",
  "ruler",
  "rumble",
  "run",
  "rung",
  "runner",
  "running",
  "rush",
  "rust",
  "rusty",
  "rye",
  "sack",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "safety",
  "said",
  "sail",
  "sailboat",
  "sailor",
  "saint",
  "salad",
  "sale",
  "salt",
  "same",
  "sand",
  "sandy",
  "sandwich",
  "sang",
  "sank",
  "sap",
  "sash",
  "sat",
  "satin",
  "satisfactory",
  "saturday",
  "sausage",
  "savage",
  "save",
  "savings",
  "saw",
  "say",
  "scab",
  "scales",
  "scare",
  "scarf",
  "school",
  "schoolboy",
  "schoolhouse",
  "schoolmaster",
  "schoolroom",
  "scorch",
  "score",
  "scrap",
  "scrape",
  "scratch",
  "scream",
  "screen",
  "screw",
  "scrub",
  "sea",
  "seal",
  "seam",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "see",
  "seeing",
  "seed",
  "seek",
  "seem",
  "seen",
  "seesaw",
  "select",
  "self",
  "selfish",
  "sell",
  "send",
  "sense",
  "sent",
  "sentence",
  "separate",
  "september",
  "servant",
  "serve",
  "service",
  "set",
  "setting",
  "settle",
  "settlement",
  "seven",
  "seventeen",
  "seventh",
  "seventy",
  "several",
  "sew",
  "shade",
  "shadow",
  "shady",
  "shake",
  "shaker",
  "shaking",
  "shall",
  "shame",
  "shan't",
  "shape",
  "share",
  "sharp",
  "shave",
  "she",
  "she'd",
  "she'll",
  "she's",
  "shear",
  "shears",
  "shed",
  "sheep",
  "sheet",
  "shelf",
  "shell",
  "shepherd",
  "shine",
  "shining",
  "shiny",
  "ship",
  "shirt",
  "shock",
  "shoe",
  "shoemaker",
  "shone",
  "shook",
  "shoot",
  "shop",
  "shopping",
  "shore",
  "short",
  "shot",
  "should",
  "shoulder",
  "shouldn't",
  "shout",
  "shovel",
  "show",
  "shower",
  "shut",
  "shy",
  "sick",
  "sickness",
  "side",
  "sidewalk",
  "sideways",
  "sigh",
  "sight",
  "sign",
  "silence",
  "silent",
  "silk",
  "sill",
  "silly",
  "silver",
  "simple",
  "sin",
  "since",
  "sing",
  "singer",
  "single",
  "sink",
  "sip",
  "sir",
  "sis",
  "sissy",
  "sister",
  "sit",
  "sitting",
  "six",
  "sixteen",
  "sixth",
  "sixty",
  "size",
  "skate",
  "skater",
  "ski",
  "skin",
  "skip",
  "skirt",
  "sky",
  "slam",
  "slap",
  "slate",
  "slave",
  "sled",
  "sleep",
  "sleepy",
  "sleeve",
  "sleigh",
  "slept",
  "slice",
  "slid",
  "slide",
  "sling",
  "slip",
  "slipped",
  "slipper",
  "slippery",
  "slit",
  "slow",
  "slowly",
  "sly",
  "smack",
  "small",
  "smart",
  "smell",
  "smile",
  "smoke",
  "smooth",
  "snail",
  "snake",
  "snap",
  "snapping",
  "sneeze",
  "snow",
  "snowy",
  "snowball",
  "snowflake",
  "snuff",
  "snug",
  "so",
  "soak",
  "soap",
  "sob",
  "socks",
  "sod",
  "soda",
  "sofa",
  "soft",
  "soil",
  "sold",
  "soldier",
  "sole",
  "some",
  "somebody",
  "somehow",
  "someone",
  "something",
  "sometime",
  "sometimes",
  "somewhere",
  "son",
  "song",
  "soon",
  "sore",
  "sorrow",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "sour",
  "south",
  "southern",
  "space",
  "spade",
  "spank",
  "sparrow",
  "speak",
  "speaker",
  "spear",
  "speech",
  "speed",
  "spell",
  "spelling",
  "spend",
  "spent",
  "spider",
  "spike",
  "spill",
  "spin",
  "spinach",
  "spirit",
  "spit",
  "splash",
  "spoil",
  "spoke",
  "spook",
  "spoon",
  "sport",
  "spot",
  "spread",
  "spring",
  "springtime",
  "sprinkle",
  "square",
  "squash",
  "squeak",
  "squeeze",
  "squirrel",
  "stable",
  "stack",
  "stage",
  "stair",
  "stall",
  "stamp",
  "stand",
  "star",
  "stare",
  "start",
  "starve",
  "state",
  "station",
  "stay",
  "steak",
  "steal",
  "steam",
  "steamboat",
  "steamer",
  "steel",
  "steep",
  "steeple",
  "steer",
  "stem",
  "step",
  "stepping",
  "stick",
  "sticky",
  "stiff",
  "still",
  "stillness",
  "sting",
  "stir",
  "stitch",
  "stock",
  "stocking",
  "stole",
  "stone",
  "stood",
  "stool",
  "stoop",
  "stop",
  "stopped",
  "stopping",
  "store",
  "stork",
  "stories",
  "storm",
  "stormy",
  "story",
  "stove",
  "straight",
  "strange",
  "stranger",
  "strap",
  "straw",
  "strawberry",
  "stream",
  "street",
  "stretch",
  "string",
  "strip",
  "stripes",
  "strong",
  "stuck",
  "study",
  "stuff",
  "stump",
  "stung",
  "subject",
  "such",
  "suck",
  "sudden",
  "suffer",
  "sugar",
  "suit",
  "sum",
  "summer",
  "sun",
  "sunday",
  "sunflower",
  "sung",
  "sunk",
  "sunlight",
  "sunny",
  "sunrise",
  "sunset",
  "sunshine",
  "supper",
  "suppose",
  "sure",
  "surely",
  "surface",
  "surprise",
  "swallow",
  "swam",
  "swamp",
  "swan",
  "swat",
  "swear",
  "sweat",
  "sweater",
  "sweep",
  "sweet",
  "sweetness",
  "sweetheart",
  "swell",
  "swept",
  "swift",
  "swim",
  "swimming",
  "swing",
  "switch",
  "sword",
  "swore",
  "table",
  "tablecloth",
  "tablespoon",
  "tablet",
  "tack",
  "tag",
  "tail",
  "tailor",
  "take",
  "taken",
  "taking",
  "tale",
  "talk",
  "talker",
  "tall",
  "tame",
  "tan",
  "tank",
  "tap",
  "tape",
  "tar",
  "tardy",
  "task",
  "taste",
  "taught",
  "tax",
  "tea",
  "teach",
  "teacher",
  "team",
  "tear",
  "tease",
  "teaspoon",
  "teeth",
  "telephone",
  "tell",
  "temper",
  "ten",
  "tennis",
  "tent",
  "term",
  "terrible",
  "test",
  "than",
  "thank",
  "thanks",
  "thankful",
  "thanksgiving",
  "that",
  "that's",
  "the",
  "theater",
  "thee",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "thick",
  "thief",
  "thimble",
  "thin",
  "thing",
  "think",
  "third",
  "thirsty",
  "thirteen",
  "thirty",
  "this",
  "thorn",
  "those",
  "though",
  "thought",
  "thousand",
  "thread",
  "three",
  "threw",
  "throat",
  "throne",
  "through",
  "throw",
  "thrown",
  "thumb",
  "thunder",
  "thursday",
  "thy",
  "tick",
  "ticket",
  "tickle",
  "tie",
  "tiger",
  "tight",
  "till",
  "time",
  "tin",
  "tinkle",
  "tiny",
  "tip",
  "tiptoe",
  "tire",
  "tired",
  "title",
  "to",
  "toad",
  "toadstool",
  "toast",
  "tobacco",
  "today",
  "toe",
  "together",
  "toilet",
  "told",
  "tomato",
  "tomorrow",
  "ton",
  "tone",
  "tongue",
  "tonight",
  "too",
  "took",
  "tool",
  "toot",
  "tooth",
  "toothbrush",
  "toothpick",
  "top",
  "tore",
  "torn",
  "toss",
  "touch",
  "tow",
  "toward",
  "towards",
  "towel",
  "tower",
  "town",
  "toy",
  "trace",
  "track",
  "trade",
  "train",
  "tramp",
  "trap",
  "tray",
  "treasure",
  "treat",
  "tree",
  "trick",
  "tricycle",
  "tried",
  "trim",
  "trip",
  "trolley",
  "trouble",
  "truck",
  "true",
  "truly",
  "trunk",
  "trust",
  "truth",
  "try",
  "tub",
  "tuesday",
  "tug",
  "tulip",
  "tumble",
  "tune",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twig",
  "twin",
  "two",
  "ugly",
  "umbrella",
  "uncle",
  "under",
  "understand",
  "underwear",
  "undress",
  "unfair",
  "unfinished",
  "unfold",
  "unfriendly",
  "unhappy",
  "unhurt",
  "uniform",
  "united",
  "states",
  "unkind",
  "unknown",
  "unless",
  "unpleasant",
  "until",
  "unwilling",
  "up",
  "upon",
  "upper",
  "upset",
  "upside",
  "upstairs",
  "uptown",
  "upward",
  "us",
  "use",
  "used",
  "useful",
  "valentine",
  "valley",
  "valuable",
  "value",
  "vase",
  "vegetable",
  "velvet",
  "very",
  "vessel",
  "victory",
  "view",
  "village",
  "vine",
  "violet",
  "visit",
  "visitor",
  "voice",
  "vote",
  "wag",
  "wagon",
  "waist",
  "wait",
  "wake",
  "waken",
  "walk",
  "wall",
  "walnut",
  "want",
  "war",
  "warm",
  "warn",
  "was",
  "wash",
  "washer",
  "washtub",
  "wasn't",
  "waste",
  "watch",
  "watchman",
  "water",
  "watermelon",
  "waterproof",
  "wave",
  "wax",
  "way",
  "wayside",
  "we",
  "weak",
  "weakness",
  "weaken",
  "wealth",
  "weapon",
  "wear",
  "weary",
  "weather",
  "weave",
  "web",
  "we'd",
  "wedding",
  "wednesday",
  "wee",
  "weed",
  "week",
  "we'll",
  "weep",
  "weigh",
  "welcome",
  "well",
  "went",
  "were",
  "we're",
  "west",
  "western",
  "wet",
  "we've",
  "whale",
  "what",
  "what's",
  "wheat",
  "wheel",
  "when",
  "whenever",
  "where",
  "which",
  "while",
  "whip",
  "whipped",
  "whirl",
  "whisky",
  "whiskey",
  "whisper",
  "whistle",
  "white",
  "who",
  "who'd",
  "whole",
  "who'll",
  "whom",
  "who's",
  "whose",
  "why",
  "wicked",
  "wide",
  "wife",
  "wiggle",
  "wild",
  "wildcat",
  "will",
  "willing",
  "willow",
  "win",
  "wind",
  "windy",
  "windmill",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wipe",
  "wire",
  "wise",
  "wish",
  "wit",
  "witch",
  "with",
  "without",
  "woke",
  "wolf",
  "woman",
  "women",
  "won",
  "wonder",
  "wonderful",
  "won't",
  "wood",
  "wooden",
  "woodpecker",
  "woods",
  "wool",
  "woolen",
  "word",
  "wore",
  "work",
  "worker",
  "workman",
  "world",
  "worm",
  "worn",
  "worry",
  "worse",
  "worst",
  "worth",
  "would",
  "wouldn't",
  "wound",
  "wove",
  "wrap",
  "wrapped",
  "wreck",
  "wren",
  "wring",
  "write",
  "writing",
  "written",
  "wrong",
  "wrote",
  "wrung",
  "yard",
  "yarn",
  "year",
  "yell",
  "yellow",
  "yes",
  "yesterday",
  "yet",
  "yolk",
  "yonder",
  "you",
  "you'd",
  "you'll",
  "young",
  "youngster",
  "your",
  "yours",
  "you're",
  "yourself",
  "yourselves",
  "youth",
  "you've"
];
var easy_words = easyWords$1;
const syllable = syllable_1;
const pluralize = pluralize$1.exports;
const punctuationRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/g;
const easyWords = easy_words;
const easyWordSet = new Set(easyWords);
Math.copySign = (x, y2) => {
  return x * (y2 / Math.abs(y2));
};
Math.legacyRound = (number, points = 0) => {
  const p2 = 10 ** points;
  return Math.floor(number * p2 + Math.copySign(0.5, number)) / p2;
};
class Readability {
  static getGradeSuffix(grade) {
    grade = Math.floor(grade);
    const gradeMap = {
      1: "st",
      2: "nd",
      3: "rd"
    };
    return gradeMap[grade] ? gradeMap[grade] : "th";
  }
  charCount(text, ignoreSpaces = true) {
    if (ignoreSpaces)
      text = text.replace(/ /g, "");
    return text.length;
  }
  letterCount(text, ignoreSpaces = true) {
    if (ignoreSpaces)
      text = text.replace(/ /g, "");
    return this.removePunctuation(text).length;
  }
  removePunctuation(text) {
    text = text.replace(punctuationRE, "");
    return text;
  }
  static split(text) {
    text = text.split(/,| |\n|\r/g);
    text = text.filter((n2) => n2);
    return text;
  }
  lexiconCount(text, removePunctuation = true) {
    if (removePunctuation)
      text = this.removePunctuation(text);
    text = text.split(/,| |\n|\r/g);
    text = text.filter((n2) => n2);
    return text.length;
  }
  syllableCount(text, lang = "en-US") {
    text = text.toLocaleLowerCase(lang);
    text = this.removePunctuation(text);
    if (!text)
      return 0;
    const count = syllable(text);
    return count;
  }
  sentenceCount(text) {
    let ignoreCount = 0;
    let sentences = text.split(/ *[.?!]['")\]]*[ |\n](?=[A-Z])/g);
    for (let sentence of sentences) {
      if (this.lexiconCount(sentence) <= 2)
        ignoreCount += 1;
    }
    const validSentences = sentences.length - ignoreCount;
    return validSentences > 1 ? validSentences : 1;
  }
  averageSentenceLength(text) {
    const asl = this.lexiconCount(text) / this.sentenceCount(text);
    const returnVal = Math.legacyRound(asl, 1);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  averageSyllablePerWord(text) {
    const syllables2 = this.syllableCount(text);
    const words = this.lexiconCount(text);
    const syllablePerWord = syllables2 / words;
    const returnVal = Math.legacyRound(syllablePerWord, 1);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  averageCharacterPerWord(text) {
    const charactersPerWord = this.charCount(text) / this.lexiconCount(text);
    const returnVal = Math.legacyRound(charactersPerWord, 2);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  averageLetterPerWord(text) {
    const lettersPerWord = this.letterCount(text) / this.lexiconCount(text);
    const returnVal = Math.legacyRound(lettersPerWord, 2);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  averageSentencePerWord(text) {
    const sentencesPerWord = this.sentenceCount(text) / this.lexiconCount(text);
    const returnVal = Math.legacyRound(sentencesPerWord, 2);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  fleschReadingEase(text) {
    const sentenceLength = this.averageSentenceLength(text);
    const syllablesPerWord = this.averageSyllablePerWord(text);
    const flesch = 206.835 - 1.015 * sentenceLength - 84.6 * syllablesPerWord;
    const returnVal = Math.legacyRound(flesch, 2);
    return returnVal;
  }
  fleschReadingEaseToGrade(score) {
    if (score < 100 && score >= 90)
      return 5;
    else if (score < 90 && score >= 80)
      return 6;
    else if (score < 80 && score >= 70)
      return 7;
    else if (score < 70 && score >= 60)
      return 8.5;
    else if (score < 60 && score >= 50)
      return 11;
    else if (score < 50 && score >= 40)
      return 13;
    else if (score < 40 && score >= 30)
      return 15;
    else
      return 16;
  }
  fleschKincaidGrade(text) {
    const sentenceLength = this.averageSentenceLength(text);
    const syllablePerWord = this.averageSyllablePerWord(text);
    const flesch = 0.39 * sentenceLength + 11.8 * syllablePerWord - 15.59;
    const returnVal = Math.legacyRound(flesch, 1);
    return returnVal;
  }
  polySyllableCount(text) {
    let count = 0;
    let wrds;
    for (let word of Readability.split(text)) {
      wrds = this.syllableCount(word);
      if (wrds >= 3)
        count += 1;
    }
    return count;
  }
  smogIndex(text) {
    const sentences = this.sentenceCount(text);
    if (sentences >= 3) {
      const polySyllab = this.polySyllableCount(text);
      const smog = 1.043 * (30 * (polySyllab / sentences)) ** 0.5 + 3.1291;
      const returnVal = Math.legacyRound(smog, 1);
      return !isNaN(returnVal) ? returnVal : 0;
    }
    return 0;
  }
  colemanLiauIndex(text) {
    const letters = Math.legacyRound(this.averageLetterPerWord(text) * 100, 2);
    const sentences = Math.legacyRound(this.averageSentencePerWord(text) * 100, 2);
    const coleman = 0.058 * letters - 0.296 * sentences - 15.8;
    return Math.legacyRound(coleman, 2);
  }
  automatedReadabilityIndex(text) {
    const characters = this.charCount(text);
    const words = this.lexiconCount(text);
    const sentences = this.sentenceCount(text);
    const averageCharacterPerWord = characters / words;
    const averageWordPerSentence = words / sentences;
    const readability2 = 4.71 * Math.legacyRound(averageCharacterPerWord, 2) + 0.5 * Math.legacyRound(averageWordPerSentence, 2) - 21.43;
    const returnVal = Math.legacyRound(readability2, 1);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  linsearWriteFormula(text) {
    let easyWord = 0;
    let difficultWord = 0;
    let textList = Readability.split(text).slice(0, 100);
    for (let word of textList) {
      if (this.syllableCount(word) < 3) {
        easyWord += 1;
      } else {
        difficultWord += 1;
      }
    }
    text = textList.join(" ");
    let number = (easyWord * 1 + difficultWord * 3) / this.sentenceCount(text);
    let returnVal = number <= 20 ? (number - 2) / 2 : number / 2;
    returnVal = Math.legacyRound(returnVal, 1);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  presentTense(word) {
    if (word.length < 6)
      return word;
    if (word.endsWith("ed")) {
      if (easyWordSet.has(word.slice(0, -1)))
        return word.slice(0, -1);
      else
        return word.slice(0, -2);
    }
    if (word.endsWith("ing")) {
      const suffixIngToE = word.slice(0, -3) + "e";
      if (easyWordSet.has(suffixIngToE))
        return suffixIngToE;
      else
        return word.slice(0, -3);
    }
    return word;
  }
  difficultWords(text, syllableThreshold = 2) {
    const textList = text.match(/[\w=‘’]+/g);
    const diffWordsSet = /* @__PURE__ */ new Set();
    if (textList === null)
      return diffWordsSet;
    for (let word of textList) {
      const normalized = this.presentTense(pluralize(word.toLocaleLowerCase(), 1));
      if (!easyWordSet.has(normalized) && this.syllableCount(word) >= syllableThreshold) {
        diffWordsSet.add(word);
      }
    }
    return [...diffWordsSet].length;
  }
  daleChallReadabilityScore(text) {
    const wordCount = this.lexiconCount(text);
    const count = wordCount - this.difficultWords(text);
    const per = count / wordCount * 100;
    if (isNaN(per))
      return 0;
    const difficultWords = 100 - per;
    let score = 0.1579 * difficultWords + 0.0496 * this.averageSentenceLength(text);
    if (difficultWords > 5)
      score += 3.6365;
    return Math.legacyRound(score, 2);
  }
  daleChallToGrade(score) {
    if (score <= 4.9)
      return 4;
    if (score < 5.9)
      return 5;
    if (score < 6.9)
      return 7;
    if (score < 7.9)
      return 9;
    if (score < 8.9)
      return 11;
    if (score < 9.9)
      return 13;
    else
      return 16;
  }
  gunningFog(text) {
    const perDiffWords = this.difficultWords(text, 3) / this.lexiconCount(text) * 100;
    const grade = 0.4 * (this.averageSentenceLength(text) + perDiffWords);
    const returnVal = Math.legacyRound(grade, 2);
    return !isNaN(returnVal) ? returnVal : 0;
  }
  lix(text) {
    const words = Readability.split(text);
    const wordsLen = words.length;
    const longWords = words.filter((wrd) => wrd.length > 6).length;
    const perLongWords = longWords * 100 / wordsLen;
    const asl = this.averageSentenceLength(text);
    const lix = asl + perLongWords;
    return Math.legacyRound(lix, 2);
  }
  rix(text) {
    const words = Readability.split(text);
    const longWordsCount = words.filter((wrd) => wrd.length > 6).length;
    const sentencesCount = this.sentenceCount(text);
    const rix = longWordsCount / sentencesCount;
    return !isNaN(rix) ? Math.legacyRound(rix, 2) : 0;
  }
  textStandard(text, floatOutput = null) {
    const grade = [];
    let lower = Math.legacyRound(this.fleschKincaidGrade(text));
    let upper = Math.ceil(this.fleschKincaidGrade(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    let score = this.fleschReadingEase(text);
    let freGrade = this.fleschReadingEaseToGrade(score);
    grade.push(freGrade);
    lower = Math.legacyRound(this.smogIndex(text));
    upper = Math.ceil(this.smogIndex(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    lower = Math.legacyRound(this.colemanLiauIndex(text));
    upper = Math.ceil(this.colemanLiauIndex(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    lower = Math.legacyRound(this.automatedReadabilityIndex(text));
    upper = Math.ceil(this.automatedReadabilityIndex(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    lower = Math.legacyRound(this.daleChallToGrade(this.daleChallReadabilityScore(text)));
    upper = Math.ceil(this.daleChallToGrade(this.daleChallReadabilityScore(text)));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    lower = Math.legacyRound(this.linsearWriteFormula(text));
    upper = Math.ceil(this.linsearWriteFormula(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    lower = Math.legacyRound(this.gunningFog(text));
    upper = Math.ceil(this.gunningFog(text));
    grade.push(Math.floor(lower));
    grade.push(Math.floor(upper));
    const counterMap = [...new Set(grade)].map((x) => [x, grade.filter((y2) => y2 === x).length]);
    const finalGrade = counterMap.reduce((x, y2) => y2[1] >= x[1] ? y2 : x);
    score = finalGrade[0];
    if (floatOutput)
      return score;
    const lowerScore = Math.floor(score) - 1;
    const upperScore = lowerScore + 1;
    return `${lowerScore}${Readability.getGradeSuffix(lowerScore)} and ${upperScore}${Readability.getGradeSuffix(upperScore)} grade`;
  }
  textMedian(text) {
    const grade = [];
    grade.push(this.fleschKincaidGrade(text));
    const score = this.fleschReadingEase(text);
    const freGrade = this.fleschReadingEaseToGrade(score);
    grade.push(freGrade);
    grade.push(this.smogIndex(text));
    grade.push(this.colemanLiauIndex(text));
    grade.push(this.automatedReadabilityIndex(text));
    grade.push(this.daleChallToGrade(this.daleChallReadabilityScore(text)));
    grade.push(this.linsearWriteFormula(text));
    grade.push(this.gunningFog(text));
    grade.sort(function(a2, b2) {
      return a2 - b2;
    });
    let half = Math.floor(grade.length / 2);
    if (half & 1)
      return (grade[half - 1] + grade[half]) / 2;
    else
      return grade[half];
  }
}
const readability = new Readability();
var main = readability;
var WordCountView_vue_vue_type_style_index_0_scoped_true_lang = "";
const _withScopeId = (n2) => (pushScopeId("data-v-8505eed6"), n2 = n2(), popScopeId(), n2);
const _hoisted_1 = { class: "view-container" };
const _hoisted_2 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h2", null, "Word Count", -1));
const _hoisted_3 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("hr", null, null, -1));
const _hoisted_4 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h4", null, " Enter your text into the field below, and the statistics below will automatically update! ", -1));
const _hoisted_5 = { class: "counts" };
const _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("div", null, [
  /* @__PURE__ */ createTextVNode(" Words "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode(" Characters "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode(" Syllables "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode(" Time to Read "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode(" Reading Level ")
], -1));
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_8 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_10 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_11 = { class: "text-input" };
const _sfc_main = {
  props: {
    navCollapsed: {
      type: Boolean,
      required: true
    }
  },
  setup(__props) {
    const words = ref(0);
    const characters = ref(0);
    const readingDifficulty = ref("Very Easy");
    const syllables2 = ref(0);
    const readingTime = ref(0);
    function setWords(text) {
      words.value = main.lexiconCount(text);
    }
    function setLetters(text) {
      characters.value = text.replace(/\s/g, "").length;
    }
    function setReadingDifficulty(text) {
      const value = main.fleschReadingEase(text);
      if (value <= 29) {
        readingDifficulty.value = "Very Confusing";
      } else if (value <= 49) {
        readingDifficulty.value = "Difficult";
      } else if (value <= 59) {
        readingDifficulty.value = "Fairly Difficult";
      } else if (value <= 69) {
        readingDifficulty.value = "Standard";
      } else if (value <= 79) {
        readingDifficulty.value = "Fairly Easy";
      } else if (value <= 89) {
        readingDifficulty.value = "Easy";
      } else {
        readingDifficulty.value = "Very Easy";
      }
    }
    function setSyllables(text) {
      syllables2.value = main.syllableCount(text);
    }
    function setReadingTime(text) {
      const words2 = main.lexiconCount(text);
      readingTime.value = Math.round(words2 / 238);
    }
    function updateText(e2) {
      setWords(e2.target.value);
      setLetters(e2.target.value);
      setReadingDifficulty(e2.target.value);
      setSyllables(e2.target.value);
      setReadingTime(e2.target.value);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("main", {
        class: normalizeClass({ navCollapsed: __props.navCollapsed })
      }, [
        createBaseVNode("div", _hoisted_1, [
          _hoisted_2,
          _hoisted_3,
          _hoisted_4,
          createBaseVNode("div", _hoisted_5, [
            _hoisted_6,
            createBaseVNode("div", null, [
              createBaseVNode("b", null, toDisplayString(words.value), 1),
              _hoisted_7,
              createBaseVNode("b", null, toDisplayString(characters.value), 1),
              _hoisted_8,
              createBaseVNode("b", null, toDisplayString(syllables2.value), 1),
              _hoisted_9,
              createBaseVNode("b", null, toDisplayString(readingTime.value) + " minute(s)", 1),
              _hoisted_10,
              createBaseVNode("b", null, toDisplayString(readingDifficulty.value), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_11, [
            createBaseVNode("textarea", {
              placeholder: "Enter text content here!",
              onInput: updateText,
              rows: "30"
            }, null, 32)
          ])
        ])
      ], 2);
    };
  }
};
var WordCountView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8505eed6"]]);
const router = createRouter({
  history: createWebHistory("/web-utilities/"),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      props: { navCollapsed: String }
    },
    {
      path: "/pdf-merge",
      name: "pdf merge",
      component: PDFMergeView,
      props: { navCollapsed: String }
    },
    {
      path: "/word-count",
      name: "word count",
      component: WordCountView,
      props: { navCollapsed: String }
    }
  ]
});
var buffer = {};
var base64Js = {};
base64Js.byteLength = byteLength;
base64Js.toByteArray = toByteArray;
base64Js.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len2 = b64.length;
  if (len2 % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1)
    validLen = len2;
  var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i2;
  for (i2 = 0; i2 < len2; i2 += 4) {
    tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
    arr[curByte++] = tmp >> 16 & 255;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i2 = start; i2 < end; i2 += 3) {
    tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len2 = uint8.length;
  var extraBytes = len2 % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
    parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
  }
  if (extraBytes === 1) {
    tmp = uint8[len2 - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
  }
  return parts.join("");
}
var ieee754 = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
ieee754.read = function(buffer2, offset, isLE, mLen, nBytes) {
  var e2, m2;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i2 = isLE ? nBytes - 1 : 0;
  var d2 = isLE ? -1 : 1;
  var s2 = buffer2[offset + i2];
  i2 += d2;
  e2 = s2 & (1 << -nBits) - 1;
  s2 >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e2 = e2 * 256 + buffer2[offset + i2], i2 += d2, nBits -= 8) {
  }
  m2 = e2 & (1 << -nBits) - 1;
  e2 >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m2 = m2 * 256 + buffer2[offset + i2], i2 += d2, nBits -= 8) {
  }
  if (e2 === 0) {
    e2 = 1 - eBias;
  } else if (e2 === eMax) {
    return m2 ? NaN : (s2 ? -1 : 1) * Infinity;
  } else {
    m2 = m2 + Math.pow(2, mLen);
    e2 = e2 - eBias;
  }
  return (s2 ? -1 : 1) * m2 * Math.pow(2, e2 - mLen);
};
ieee754.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
  var e2, m2, c2;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i2 = isLE ? 0 : nBytes - 1;
  var d2 = isLE ? 1 : -1;
  var s2 = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m2 = isNaN(value) ? 1 : 0;
    e2 = eMax;
  } else {
    e2 = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c2 = Math.pow(2, -e2)) < 1) {
      e2--;
      c2 *= 2;
    }
    if (e2 + eBias >= 1) {
      value += rt / c2;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c2 >= 2) {
      e2++;
      c2 /= 2;
    }
    if (e2 + eBias >= eMax) {
      m2 = 0;
      e2 = eMax;
    } else if (e2 + eBias >= 1) {
      m2 = (value * c2 - 1) * Math.pow(2, mLen);
      e2 = e2 + eBias;
    } else {
      m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e2 = 0;
    }
  }
  for (; mLen >= 8; buffer2[offset + i2] = m2 & 255, i2 += d2, m2 /= 256, mLen -= 8) {
  }
  e2 = e2 << mLen | m2;
  eLen += mLen;
  for (; eLen > 0; buffer2[offset + i2] = e2 & 255, i2 += d2, e2 /= 256, eLen -= 8) {
  }
  buffer2[offset + i2 - d2] |= s2 * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(exports) {
  const base64 = base64Js;
  const ieee754$1 = ieee754;
  const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;
  const K_MAX_LENGTH = 2147483647;
  exports.kMaxLength = K_MAX_LENGTH;
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
    console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  }
  function typedArraySupport() {
    try {
      const arr = new Uint8Array(1);
      const proto = { foo: function() {
        return 42;
      } };
      Object.setPrototypeOf(proto, Uint8Array.prototype);
      Object.setPrototypeOf(arr, proto);
      return arr.foo() === 42;
    } catch (e2) {
      return false;
    }
  }
  Object.defineProperty(Buffer.prototype, "parent", {
    enumerable: true,
    get: function() {
      if (!Buffer.isBuffer(this))
        return void 0;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer.prototype, "offset", {
    enumerable: true,
    get: function() {
      if (!Buffer.isBuffer(this))
        return void 0;
      return this.byteOffset;
    }
  });
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, Buffer.prototype);
    return buf;
  }
  function Buffer(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new TypeError('The "string" argument must be of type string. Received type number');
      }
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }
  Buffer.poolSize = 8192;
  function from(value, encodingOrOffset, length) {
    if (typeof value === "string") {
      return fromString(value, encodingOrOffset);
    }
    if (ArrayBuffer.isView(value)) {
      return fromArrayView(value);
    }
    if (value == null) {
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === "number") {
      throw new TypeError('The "value" argument must not be of type number. Received type number');
    }
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
      return Buffer.from(valueOf, encodingOrOffset, length);
    }
    const b2 = fromObject(value);
    if (b2)
      return b2;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
      return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    }
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
  }
  Buffer.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(Buffer, Uint8Array);
  function assertSize(size2) {
    if (typeof size2 !== "number") {
      throw new TypeError('"size" argument must be of type number');
    } else if (size2 < 0) {
      throw new RangeError('The value "' + size2 + '" is invalid for option "size"');
    }
  }
  function alloc(size2, fill, encoding) {
    assertSize(size2);
    if (size2 <= 0) {
      return createBuffer(size2);
    }
    if (fill !== void 0) {
      return typeof encoding === "string" ? createBuffer(size2).fill(fill, encoding) : createBuffer(size2).fill(fill);
    }
    return createBuffer(size2);
  }
  Buffer.alloc = function(size2, fill, encoding) {
    return alloc(size2, fill, encoding);
  };
  function allocUnsafe(size2) {
    assertSize(size2);
    return createBuffer(size2 < 0 ? 0 : checked(size2) | 0);
  }
  Buffer.allocUnsafe = function(size2) {
    return allocUnsafe(size2);
  };
  Buffer.allocUnsafeSlow = function(size2) {
    return allocUnsafe(size2);
  };
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
    const length = byteLength2(string, encoding) | 0;
    let buf = createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) {
      buf = buf.slice(0, actual);
    }
    return buf;
  }
  function fromArrayLike(array) {
    const length = array.length < 0 ? 0 : checked(array.length) | 0;
    const buf = createBuffer(length);
    for (let i2 = 0; i2 < length; i2 += 1) {
      buf[i2] = array[i2] & 255;
    }
    return buf;
  }
  function fromArrayView(arrayView) {
    if (isInstance(arrayView, Uint8Array)) {
      const copy = new Uint8Array(arrayView);
      return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
  }
  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds');
    }
    let buf;
    if (byteOffset === void 0 && length === void 0) {
      buf = new Uint8Array(array);
    } else if (length === void 0) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }
    Object.setPrototypeOf(buf, Buffer.prototype);
    return buf;
  }
  function fromObject(obj) {
    if (Buffer.isBuffer(obj)) {
      const len2 = checked(obj.length) | 0;
      const buf = createBuffer(len2);
      if (buf.length === 0) {
        return buf;
      }
      obj.copy(buf, 0, 0, len2);
      return buf;
    }
    if (obj.length !== void 0) {
      if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
        return createBuffer(0);
      }
      return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data);
    }
  }
  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
    }
    return length | 0;
  }
  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }
    return Buffer.alloc(+length);
  }
  Buffer.isBuffer = function isBuffer(b2) {
    return b2 != null && b2._isBuffer === true && b2 !== Buffer.prototype;
  };
  Buffer.compare = function compare(a2, b2) {
    if (isInstance(a2, Uint8Array))
      a2 = Buffer.from(a2, a2.offset, a2.byteLength);
    if (isInstance(b2, Uint8Array))
      b2 = Buffer.from(b2, b2.offset, b2.byteLength);
    if (!Buffer.isBuffer(a2) || !Buffer.isBuffer(b2)) {
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    }
    if (a2 === b2)
      return 0;
    let x = a2.length;
    let y2 = b2.length;
    for (let i2 = 0, len2 = Math.min(x, y2); i2 < len2; ++i2) {
      if (a2[i2] !== b2[i2]) {
        x = a2[i2];
        y2 = b2[i2];
        break;
      }
    }
    if (x < y2)
      return -1;
    if (y2 < x)
      return 1;
    return 0;
  };
  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
      return Buffer.alloc(0);
    }
    let i2;
    if (length === void 0) {
      length = 0;
      for (i2 = 0; i2 < list.length; ++i2) {
        length += list[i2].length;
      }
    }
    const buffer2 = Buffer.allocUnsafe(length);
    let pos = 0;
    for (i2 = 0; i2 < list.length; ++i2) {
      let buf = list[i2];
      if (isInstance(buf, Uint8Array)) {
        if (pos + buf.length > buffer2.length) {
          if (!Buffer.isBuffer(buf))
            buf = Buffer.from(buf);
          buf.copy(buffer2, pos);
        } else {
          Uint8Array.prototype.set.call(buffer2, buf, pos);
        }
      } else if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      } else {
        buf.copy(buffer2, pos);
      }
      pos += buf.length;
    }
    return buffer2;
  };
  function byteLength2(string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length;
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    }
    const len2 = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len2 === 0)
      return 0;
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len2;
        case "utf8":
        case "utf-8":
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len2 * 2;
        case "hex":
          return len2 >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length;
          }
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength2;
  function slowToString(encoding, start, end) {
    let loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding)
      encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.prototype._isBuffer = true;
  function swap(b2, n2, m2) {
    const i2 = b2[n2];
    b2[n2] = b2[m2];
    b2[m2] = i2;
  }
  Buffer.prototype.swap16 = function swap16() {
    const len2 = this.length;
    if (len2 % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 2) {
      swap(this, i2, i2 + 1);
    }
    return this;
  };
  Buffer.prototype.swap32 = function swap32() {
    const len2 = this.length;
    if (len2 % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 4) {
      swap(this, i2, i2 + 3);
      swap(this, i2 + 1, i2 + 2);
    }
    return this;
  };
  Buffer.prototype.swap64 = function swap64() {
    const len2 = this.length;
    if (len2 % 8 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 8) {
      swap(this, i2, i2 + 7);
      swap(this, i2 + 1, i2 + 6);
      swap(this, i2 + 2, i2 + 5);
      swap(this, i2 + 3, i2 + 4);
    }
    return this;
  };
  Buffer.prototype.toString = function toString() {
    const length = this.length;
    if (length === 0)
      return "";
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer.prototype.toLocaleString = Buffer.prototype.toString;
  Buffer.prototype.equals = function equals(b2) {
    if (!Buffer.isBuffer(b2))
      throw new TypeError("Argument must be a Buffer");
    if (this === b2)
      return true;
    return Buffer.compare(this, b2) === 0;
  };
  Buffer.prototype.inspect = function inspect() {
    let str = "";
    const max = exports.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max)
      str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol) {
    Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
  }
  Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer.from(target, target.offset, target.byteLength);
    }
    if (!Buffer.isBuffer(target)) {
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    }
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = target ? target.length : 0;
    }
    if (thisStart === void 0) {
      thisStart = 0;
    }
    if (thisEnd === void 0) {
      thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }
    if (thisStart >= thisEnd) {
      return -1;
    }
    if (start >= end) {
      return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target)
      return 0;
    let x = thisEnd - thisStart;
    let y2 = end - start;
    const len2 = Math.min(x, y2);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for (let i2 = 0; i2 < len2; ++i2) {
      if (thisCopy[i2] !== targetCopy[i2]) {
        x = thisCopy[i2];
        y2 = targetCopy[i2];
        break;
      }
    }
    if (x < y2)
      return -1;
    if (y2 < x)
      return 1;
    return 0;
  };
  function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
    if (buffer2.length === 0)
      return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (numberIsNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer2.length - 1;
    }
    if (byteOffset < 0)
      byteOffset = buffer2.length + byteOffset;
    if (byteOffset >= buffer2.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer2.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer.from(val, encoding);
    }
    if (Buffer.isBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read(buf, i3) {
      if (indexSize === 1) {
        return buf[i3];
      } else {
        return buf.readUInt16BE(i3 * indexSize);
      }
    }
    let i2;
    if (dir) {
      let foundIndex = -1;
      for (i2 = byteOffset; i2 < arrLength; i2++) {
        if (read(arr, i2) === read(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i2;
          if (i2 - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i2 -= i2 - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i2 = byteOffset; i2 >= 0; i2--) {
        let found = true;
        for (let j = 0; j < valLength; j++) {
          if (read(arr, i2 + j) !== read(val, j)) {
            found = false;
            break;
          }
        }
        if (found)
          return i2;
      }
    }
    return -1;
  }
  Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    const strLen = string.length;
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    let i2;
    for (i2 = 0; i2 < length; ++i2) {
      const parsed = parseInt(string.substr(i2 * 2, 2), 16);
      if (numberIsNaN(parsed))
        return i2;
      buf[offset + i2] = parsed;
    }
    return i2;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === void 0) {
      encoding = "utf8";
      length = this.length;
      offset = 0;
    } else if (length === void 0 && typeof offset === "string") {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === void 0)
          encoding = "utf8";
      } else {
        encoding = length;
        length = void 0;
      }
    } else {
      throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    }
    const remaining = this.length - offset;
    if (length === void 0 || length > remaining)
      length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding)
      encoding = "utf8";
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "hex":
          return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
          return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
          return asciiWrite(this, string, offset, length);
        case "base64":
          return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i2 = start;
    while (i2 < end) {
      const firstByte = buf[i2];
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i2 + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i2 + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i2 + 1];
            thirdByte = buf[i2 + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i2 + 1];
            thirdByte = buf[i2 + 2];
            fourthByte = buf[i2 + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i2 += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  const MAX_ARGUMENTS_LENGTH = 4096;
  function decodeCodePointsArray(codePoints) {
    const len2 = codePoints.length;
    if (len2 <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i2 = 0;
    while (i2 < len2) {
      res += String.fromCharCode.apply(String, codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start; i2 < end; ++i2) {
      ret += String.fromCharCode(buf[i2] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start; i2 < end; ++i2) {
      ret += String.fromCharCode(buf[i2]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    const len2 = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len2)
      end = len2;
    let out = "";
    for (let i2 = start; i2 < end; ++i2) {
      out += hexSliceLookupTable[buf[i2]];
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = "";
    for (let i2 = 0; i2 < bytes.length - 1; i2 += 2) {
      res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
    }
    return res;
  }
  Buffer.prototype.slice = function slice(start, end) {
    const len2 = this.length;
    start = ~~start;
    end = end === void 0 ? len2 : ~~end;
    if (start < 0) {
      start += len2;
      if (start < 0)
        start = 0;
    } else if (start > len2) {
      start = len2;
    }
    if (end < 0) {
      end += len2;
      if (end < 0)
        end = 0;
    } else if (end > len2) {
      end = len2;
    }
    if (end < start)
      end = start;
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer.prototype);
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i2 = 0;
    while (++i2 < byteLength3 && (mul *= 256)) {
      val += this[offset + i2] * mul;
    }
    return val;
  };
  Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength3, this.length);
    }
    let val = this[offset + --byteLength3];
    let mul = 1;
    while (byteLength3 > 0 && (mul *= 256)) {
      val += this[offset + --byteLength3] * mul;
    }
    return val;
  };
  Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
  });
  Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
  });
  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i2 = 0;
    while (++i2 < byteLength3 && (mul *= 256)) {
      val += this[offset + i2] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let i2 = byteLength3;
    let mul = 1;
    let val = this[offset + --i2];
    while (i2 > 0 && (mul *= 256)) {
      val += this[offset + --i2] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
      return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
  });
  Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
  });
  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, true, 23, 4);
  };
  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, false, 23, 4);
  };
  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, true, 52, 8);
  };
  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let mul = 1;
    let i2 = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength3 && (mul *= 256)) {
      this[offset + i2] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let i2 = byteLength3 - 1;
    let mul = 1;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256)) {
      this[offset + i2] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
  };
  Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  function wrtBigUInt64LE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
  }
  function wrtBigUInt64BE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
  }
  Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
    }
    let i2 = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength3 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0) {
        sub = 1;
      }
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
    }
    let i2 = byteLength3 - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0) {
        sub = 1;
      }
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
      value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };
  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
      value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer.isBuffer(target))
      throw new TypeError("argument should be a Buffer");
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length)
      throw new RangeError("Index out of range");
    if (end < 0)
      throw new RangeError("sourceEnd out of bounds");
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    const len2 = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
      this.copyWithin(targetStart, start, end);
    } else {
      Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    }
    return len2;
  };
  Buffer.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
      if (typeof start === "string") {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === "string") {
        encoding = end;
        end = this.length;
      }
      if (encoding !== void 0 && typeof encoding !== "string") {
        throw new TypeError("encoding must be a string");
      }
      if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      if (val.length === 1) {
        const code2 = val.charCodeAt(0);
        if (encoding === "utf8" && code2 < 128 || encoding === "latin1") {
          val = code2;
        }
      }
    } else if (typeof val === "number") {
      val = val & 255;
    } else if (typeof val === "boolean") {
      val = Number(val);
    }
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError("Out of range index");
    }
    if (end <= start) {
      return this;
    }
    start = start >>> 0;
    end = end === void 0 ? this.length : end >>> 0;
    if (!val)
      val = 0;
    let i2;
    if (typeof val === "number") {
      for (i2 = start; i2 < end; ++i2) {
        this[i2] = val;
      }
    } else {
      const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
      const len2 = bytes.length;
      if (len2 === 0) {
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      }
      for (i2 = 0; i2 < end - start; ++i2) {
        this[i2 + start] = bytes[i2 % len2];
      }
    }
    return this;
  };
  const errors = {};
  function E(sym, getMessage, Base) {
    errors[sym] = class NodeError extends Base {
      constructor() {
        super();
        Object.defineProperty(this, "message", {
          value: getMessage.apply(this, arguments),
          writable: true,
          configurable: true
        });
        this.name = `${this.name} [${sym}]`;
        this.stack;
        delete this.name;
      }
      get code() {
        return sym;
      }
      set code(value) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${sym}]: ${this.message}`;
      }
    };
  }
  E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
    if (name) {
      return `${name} is outside of buffer bounds`;
    }
    return "Attempt to access memory outside buffer bounds";
  }, RangeError);
  E("ERR_INVALID_ARG_TYPE", function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
  }, TypeError);
  E("ERR_OUT_OF_RANGE", function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`;
    let received = input;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === "bigint") {
      received = String(input);
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received);
      }
      received += "n";
    }
    msg += ` It must be ${range}. Received ${received}`;
    return msg;
  }, RangeError);
  function addNumericalSeparator(val) {
    let res = "";
    let i2 = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for (; i2 >= start + 4; i2 -= 3) {
      res = `_${val.slice(i2 - 3, i2)}${res}`;
    }
    return `${val.slice(0, i2)}${res}`;
  }
  function checkBounds(buf, offset, byteLength3) {
    validateNumber(offset, "offset");
    if (buf[offset] === void 0 || buf[offset + byteLength3] === void 0) {
      boundsError(offset, buf.length - (byteLength3 + 1));
    }
  }
  function checkIntBI(value, min, max, buf, offset, byteLength3) {
    if (value > max || value < min) {
      const n2 = typeof min === "bigint" ? "n" : "";
      let range;
      if (byteLength3 > 3) {
        if (min === 0 || min === BigInt(0)) {
          range = `>= 0${n2} and < 2${n2} ** ${(byteLength3 + 1) * 8}${n2}`;
        } else {
          range = `>= -(2${n2} ** ${(byteLength3 + 1) * 8 - 1}${n2}) and < 2 ** ${(byteLength3 + 1) * 8 - 1}${n2}`;
        }
      } else {
        range = `>= ${min}${n2} and <= ${max}${n2}`;
      }
      throw new errors.ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds(buf, offset, byteLength3);
  }
  function validateNumber(value, name) {
    if (typeof value !== "number") {
      throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
  }
  function boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
      validateNumber(value, type);
      throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    }
    if (length < 0) {
      throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new errors.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
  }
  const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2)
      return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for (let i2 = 0; i2 < length; ++i2) {
      codePoint = string.charCodeAt(i2);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i2 + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    const byteArray = [];
    for (let i2 = 0; i2 < str.length; ++i2) {
      byteArray.push(str.charCodeAt(i2) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    let c2, hi, lo;
    const byteArray = [];
    for (let i2 = 0; i2 < str.length; ++i2) {
      if ((units -= 2) < 0)
        break;
      c2 = str.charCodeAt(i2);
      hi = c2 >> 8;
      lo = c2 % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    let i2;
    for (i2 = 0; i2 < length; ++i2) {
      if (i2 + offset >= dst.length || i2 >= src.length)
        break;
      dst[i2 + offset] = src[i2];
    }
    return i2;
  }
  function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
  }
  function numberIsNaN(obj) {
    return obj !== obj;
  }
  const hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for (let i2 = 0; i2 < 16; ++i2) {
      const i16 = i2 * 16;
      for (let j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i2] + alphabet[j];
      }
    }
    return table;
  }();
  function defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
  }
  function BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
  }
})(buffer);
var browser = { exports: {} };
var process = browser.exports = {};
var cachedSetTimeout;
var cachedClearTimeout;
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
(function() {
  try {
    if (typeof setTimeout === "function") {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e2) {
    cachedSetTimeout = defaultSetTimout;
  }
  try {
    if (typeof clearTimeout === "function") {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e2) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e2) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e3) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e2) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e3) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len2 = queue.length;
  while (len2) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len2) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len2 = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
process.nextTick = function(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      args[i2 - 1] = arguments[i2];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
};
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
process.title = "browser";
process.browser = true;
process.env = {};
process.argv = [];
process.version = "";
process.versions = {};
function noop() {
}
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;
process.listeners = function(name) {
  return [];
};
process.binding = function(name) {
  throw new Error("process.binding is not supported");
};
process.cwd = function() {
  return "/";
};
process.chdir = function(dir) {
  throw new Error("process.chdir is not supported");
};
process.umask = function() {
  return 0;
};
var process$1 = browser.exports;
window.Buffer = buffer.Buffer;
window.process = process$1;
const app = createApp(_sfc_main$3);
app.use(router);
app.mount("#app");
