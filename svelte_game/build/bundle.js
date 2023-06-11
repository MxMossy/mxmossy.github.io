
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    new Set();

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    // Needs to be written like this to pass the tree-shake-test
    'WeakMap' in globals ? new WeakMap() : undefined;
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    new Map();

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const _boolean_attributes = [
        'allowfullscreen',
        'allowpaymentrequest',
        'async',
        'autofocus',
        'autoplay',
        'checked',
        'controls',
        'default',
        'defer',
        'disabled',
        'formnovalidate',
        'hidden',
        'inert',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nomodule',
        'novalidate',
        'open',
        'playsinline',
        'readonly',
        'required',
        'reversed',
        'selected'
    ];
    /**
     * List of HTML boolean attributes (e.g. `<input disabled>`).
     * Source: https://html.spec.whatwg.org/multipage/indices.html
     */
    new Set([..._boolean_attributes]);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    // Some props for the app
    const width = writable(window.innerWidth);
    const height = writable(window.innerHeight);
    const pixelRatio = writable(window.devicePixelRatio);
    const context = writable();
    const canvas = writable();
    const time = writable(0);

    // A more convenient store for grabbing all game props
    const props = deriveObject({
    	context,
    	canvas,
    	width,
    	height,
    	pixelRatio,
    	time
    });

    const key = Symbol();

    const renderable = (render) => {
    	const api = getContext(key);
    	const element = {
    		ready: false,
    		mounted: false
    	};
    	if (typeof render === 'function') element.render = render;
    	else if (render) {
    		if (render.render) element.render = render.render;
    		if (render.setup) element.setup = render.setup;
    	}
    	api.add(element);
    	onMount(() => {
    		element.mounted = true;
    		return () => {
    			api.remove(element);
    			element.mounted = false;
    		};
    	});
    };

    function deriveObject (obj) {
    	const keys = Object.keys(obj);
    	const list = keys.map(key => {
    		return obj[key];
    	});
    	return derived(list, (array) => {
    		return array.reduce((dict, value, i) => {
    			dict[keys[i]] = value;
    			return dict;
    		}, {});
    	});
    }

    /* src/Canvas.svelte generated by Svelte v3.59.1 */

    const { console: console_1, window: window_1 } = globals;

    const file = "src/Canvas.svelte";

    function create_fragment$6(ctx) {
    	let canvas_1;
    	let canvas_1_width_value;
    	let canvas_1_height_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(canvas_1, "width", canvas_1_width_value = /*$width*/ ctx[2] * /*$pixelRatio*/ ctx[1]);
    			attr_dev(canvas_1, "height", canvas_1_height_value = /*$height*/ ctx[3] * /*$pixelRatio*/ ctx[1]);
    			set_style(canvas_1, "width", /*$width*/ ctx[2] + "px");
    			set_style(canvas_1, "height", /*$height*/ ctx[3] + "px");
    			add_location(canvas_1, file, 97, 0, 1908);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[9](canvas_1);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*handleResize*/ ctx[4], { passive: true }, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$width, $pixelRatio*/ 6 && canvas_1_width_value !== (canvas_1_width_value = /*$width*/ ctx[2] * /*$pixelRatio*/ ctx[1])) {
    				attr_dev(canvas_1, "width", canvas_1_width_value);
    			}

    			if (!current || dirty & /*$height, $pixelRatio*/ 10 && canvas_1_height_value !== (canvas_1_height_value = /*$height*/ ctx[3] * /*$pixelRatio*/ ctx[1])) {
    				attr_dev(canvas_1, "height", canvas_1_height_value);
    			}

    			if (!current || dirty & /*$width*/ 4) {
    				set_style(canvas_1, "width", /*$width*/ ctx[2] + "px");
    			}

    			if (!current || dirty & /*$height*/ 8) {
    				set_style(canvas_1, "height", /*$height*/ ctx[3] + "px");
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[9](null);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $props;
    	let $pixelRatio;
    	let $width;
    	let $height;
    	validate_store(props, 'props');
    	component_subscribe($$self, props, $$value => $$invalidate(12, $props = $$value));
    	validate_store(pixelRatio, 'pixelRatio');
    	component_subscribe($$self, pixelRatio, $$value => $$invalidate(1, $pixelRatio = $$value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, $$value => $$invalidate(2, $width = $$value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, $$value => $$invalidate(3, $height = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Canvas', slots, ['default']);
    	let { killLoopOnError = true } = $$props;
    	let { attributes = {} } = $$props;
    	let listeners = [];
    	let canvas$1;
    	let context$1;
    	let frame;

    	onMount(() => {
    		// prepare canvas stores
    		context$1 = canvas$1.getContext('2d', attributes);

    		canvas.set(canvas$1);
    		context.set(context$1);

    		// setup entities
    		listeners.forEach(async entity => {
    			if (entity.setup) {
    				let p = entity.setup($props);
    				if (p && p.then) await p;
    			}

    			entity.ready = true;
    		});

    		// start game loop
    		return createLoop((elapsed, dt) => {
    			time.set(elapsed);
    			render(dt);
    		});
    	});

    	setContext(key, {
    		add(fn) {
    			this.remove(fn);
    			listeners.push(fn);
    		},
    		remove(fn) {
    			const idx = listeners.indexOf(fn);
    			if (idx >= 0) listeners.splice(idx, 1);
    		}
    	});

    	function render(dt) {
    		context$1.save();
    		context$1.scale($pixelRatio, $pixelRatio);

    		listeners.forEach(entity => {
    			try {
    				if (entity.mounted && entity.ready && entity.render) {
    					entity.render($props, dt);
    				}
    			} catch(err) {
    				console.error(err);

    				if (killLoopOnError) {
    					cancelAnimationFrame(frame);
    					console.warn('Animation loop stopped due to an error');
    				}
    			}
    		});

    		context$1.restore();
    	}

    	function handleResize() {
    		width.set(window.innerWidth);
    		height.set(window.innerHeight);
    		pixelRatio.set(window.devicePixelRatio);
    	}

    	function createLoop(fn) {
    		let elapsed = 0;
    		let lastTime = performance.now();

    		(function loop() {
    			frame = requestAnimationFrame(loop);
    			const beginTime = performance.now();
    			const dt = (beginTime - lastTime) / 1000;
    			lastTime = beginTime;
    			elapsed += dt;
    			fn(elapsed, dt);
    		})();

    		return () => {
    			cancelAnimationFrame(frame);
    		};
    	}

    	const writable_props = ['killLoopOnError', 'attributes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas$1 = $$value;
    			$$invalidate(0, canvas$1);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('killLoopOnError' in $$props) $$invalidate(5, killLoopOnError = $$props.killLoopOnError);
    		if ('attributes' in $$props) $$invalidate(6, attributes = $$props.attributes);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		setContext,
    		key,
    		width,
    		height,
    		canvasStore: canvas,
    		contextStore: context,
    		pixelRatio,
    		props,
    		time,
    		killLoopOnError,
    		attributes,
    		listeners,
    		canvas: canvas$1,
    		context: context$1,
    		frame,
    		render,
    		handleResize,
    		createLoop,
    		$props,
    		$pixelRatio,
    		$width,
    		$height
    	});

    	$$self.$inject_state = $$props => {
    		if ('killLoopOnError' in $$props) $$invalidate(5, killLoopOnError = $$props.killLoopOnError);
    		if ('attributes' in $$props) $$invalidate(6, attributes = $$props.attributes);
    		if ('listeners' in $$props) listeners = $$props.listeners;
    		if ('canvas' in $$props) $$invalidate(0, canvas$1 = $$props.canvas);
    		if ('context' in $$props) context$1 = $$props.context;
    		if ('frame' in $$props) frame = $$props.frame;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		canvas$1,
    		$pixelRatio,
    		$width,
    		$height,
    		handleResize,
    		killLoopOnError,
    		attributes,
    		$$scope,
    		slots,
    		canvas_1_binding
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { killLoopOnError: 5, attributes: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get killLoopOnError() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set killLoopOnError(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get attributes() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set attributes(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Background.svelte generated by Svelte v3.59.1 */

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Background', slots, ['default']);
    	let { color = null } = $$props;

    	renderable(props => {
    		const { context, width, height } = props;
    		context.clearRect(0, 0, width, height);

    		if (color) {
    			context.fillStyle = color;
    			context.fillRect(0, 0, width, height);
    		}
    	});

    	const writable_props = ['color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ renderable, color });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, $$scope, slots];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get color() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DotGrid.svelte generated by Svelte v3.59.1 */

    function create_fragment$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DotGrid', slots, ['default']);
    	let { color = 'black' } = $$props;
    	let { divisions = 20 } = $$props;
    	let { pointSize = 1 } = $$props;

    	renderable(props => {
    		const { context, width, height } = props;
    		const aspect = width / height;
    		context.save();

    		for (let y = 0; y < divisions; y++) {
    			context.beginPath();

    			for (let x = 0; x < divisions; x++) {
    				const u = divisions <= 1 ? 0.5 : x / (divisions - 1);
    				const v = divisions <= 1 ? 0.5 : y / (divisions - 1);
    				let px, py;

    				if (width > height) {
    					px = u * width;
    					py = v * aspect * height;
    				} else {
    					px = u / aspect * width;
    					py = v * height;
    				}

    				context.arc(px, py, pointSize, 0, Math.PI * 2);
    			}

    			context.fillStyle = color;
    			context.fill();
    		}

    		context.restore();
    	});

    	const writable_props = ['color', 'divisions', 'pointSize'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DotGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('divisions' in $$props) $$invalidate(1, divisions = $$props.divisions);
    		if ('pointSize' in $$props) $$invalidate(2, pointSize = $$props.pointSize);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ renderable, color, divisions, pointSize });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('divisions' in $$props) $$invalidate(1, divisions = $$props.divisions);
    		if ('pointSize' in $$props) $$invalidate(2, pointSize = $$props.pointSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, divisions, pointSize, $$scope, slots];
    }

    class DotGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { color: 0, divisions: 1, pointSize: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DotGrid",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get color() {
    		throw new Error("<DotGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<DotGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get divisions() {
    		throw new Error("<DotGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set divisions(value) {
    		throw new Error("<DotGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointSize() {
    		throw new Error("<DotGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointSize(value) {
    		throw new Error("<DotGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Text.svelte generated by Svelte v3.59.1 */

    function create_fragment$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, ['default']);
    	let { color = 'hsl(0, 0%, 100%)' } = $$props;
    	let { align = 'center' } = $$props;
    	let { baseline = 'middle' } = $$props;
    	let { text = '' } = $$props;
    	let { x = 0 } = $$props;
    	let { y = 0 } = $$props;
    	let { fontSize = 16 } = $$props;
    	let { fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica' } = $$props;

    	renderable(props => {
    		const { context, width, height } = props;

    		if (text) {
    			context.fillStyle = color;
    			context.font = `${fontSize}px ${fontFamily}`;
    			context.textAlign = align;
    			context.textBaseline = baseline;
    			context.fillText(text, x, y);
    		}
    	});

    	const writable_props = ['color', 'align', 'baseline', 'text', 'x', 'y', 'fontSize', 'fontFamily'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('align' in $$props) $$invalidate(1, align = $$props.align);
    		if ('baseline' in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('fontSize' in $$props) $$invalidate(6, fontSize = $$props.fontSize);
    		if ('fontFamily' in $$props) $$invalidate(7, fontFamily = $$props.fontFamily);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		renderable,
    		color,
    		align,
    		baseline,
    		text,
    		x,
    		y,
    		fontSize,
    		fontFamily
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('align' in $$props) $$invalidate(1, align = $$props.align);
    		if ('baseline' in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('fontSize' in $$props) $$invalidate(6, fontSize = $$props.fontSize);
    		if ('fontFamily' in $$props) $$invalidate(7, fontFamily = $$props.fontFamily);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, align, baseline, text, x, y, fontSize, fontFamily, $$scope, slots];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			color: 0,
    			align: 1,
    			baseline: 2,
    			text: 3,
    			x: 4,
    			y: 5,
    			fontSize: 6,
    			fontFamily: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get color() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get baseline() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseline(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontFamily() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontFamily(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var epsilon = 0.000001;

    var create_1 = create;

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */
    function create() {
        var out = new Float32Array(2);
        out[0] = 0;
        out[1] = 0;
        return out
    }

    var clone_1 = clone;

    /**
     * Creates a new vec2 initialized with values from an existing vector
     *
     * @param {vec2} a vector to clone
     * @returns {vec2} a new 2D vector
     */
    function clone(a) {
        var out = new Float32Array(2);
        out[0] = a[0];
        out[1] = a[1];
        return out
    }

    var fromValues_1 = fromValues;

    /**
     * Creates a new vec2 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} a new 2D vector
     */
    function fromValues(x, y) {
        var out = new Float32Array(2);
        out[0] = x;
        out[1] = y;
        return out
    }

    var copy_1 = copy;

    /**
     * Copy the values from one vec2 to another
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the source vector
     * @returns {vec2} out
     */
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out
    }

    var set_1 = set;

    /**
     * Set the components of a vec2 to the given values
     *
     * @param {vec2} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} out
     */
    function set(out, x, y) {
        out[0] = x;
        out[1] = y;
        return out
    }

    var equals_1 = equals;

    var EPSILON = epsilon;

    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function equals(a, b) {
      var a0 = a[0];
      var a1 = a[1];
      var b0 = b[0];
      var b1 = b[1];
      return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
              Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)))
    }

    var exactEquals_1 = exactEquals;

    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function exactEquals(a, b) {
      return a[0] === b[0] && a[1] === b[1]
    }

    var add_1 = add;

    /**
     * Adds two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out
    }

    var subtract_1 = subtract;

    /**
     * Subtracts vector b from vector a
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function subtract(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out
    }

    var sub = subtract_1;

    var multiply_1 = multiply;

    /**
     * Multiplies two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function multiply(out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out
    }

    var mul = multiply_1;

    var divide_1 = divide;

    /**
     * Divides two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function divide(out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out
    }

    var div = divide_1;

    var inverse_1 = inverse;

    /**
     * Returns the inverse of the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to invert
     * @returns {vec2} out
     */
    function inverse(out, a) {
      out[0] = 1.0 / a[0];
      out[1] = 1.0 / a[1];
      return out
    }

    var min_1 = min;

    /**
     * Returns the minimum of two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function min(out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out
    }

    var max_1 = max;

    /**
     * Returns the maximum of two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function max(out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out
    }

    var rotate_1 = rotate;

    /**
     * Rotates a vec2 by an angle
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to rotate
     * @param {Number} angle the angle of rotation (in radians)
     * @returns {vec2} out
     */
    function rotate(out, a, angle) {
      var c = Math.cos(angle),
          s = Math.sin(angle);
      var x = a[0],
          y = a[1];

      out[0] = x * c - y * s;
      out[1] = x * s + y * c;

      return out
    }

    var floor_1 = floor;

    /**
     * Math.floor the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to floor
     * @returns {vec2} out
     */
    function floor(out, a) {
      out[0] = Math.floor(a[0]);
      out[1] = Math.floor(a[1]);
      return out
    }

    var ceil_1 = ceil;

    /**
     * Math.ceil the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to ceil
     * @returns {vec2} out
     */
    function ceil(out, a) {
      out[0] = Math.ceil(a[0]);
      out[1] = Math.ceil(a[1]);
      return out
    }

    var round_1 = round;

    /**
     * Math.round the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to round
     * @returns {vec2} out
     */
    function round(out, a) {
      out[0] = Math.round(a[0]);
      out[1] = Math.round(a[1]);
      return out
    }

    var scale_1 = scale;

    /**
     * Scales a vec2 by a scalar number
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec2} out
     */
    function scale(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        return out
    }

    var scaleAndAdd_1 = scaleAndAdd;

    /**
     * Adds two vec2's after scaling the second operand by a scalar value
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec2} out
     */
    function scaleAndAdd(out, a, b, scale) {
        out[0] = a[0] + (b[0] * scale);
        out[1] = a[1] + (b[1] * scale);
        return out
    }

    var distance_1 = distance;

    /**
     * Calculates the euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance(a, b) {
        var x = b[0] - a[0],
            y = b[1] - a[1];
        return Math.sqrt(x*x + y*y)
    }

    var dist = distance_1;

    var squaredDistance_1 = squaredDistance;

    /**
     * Calculates the squared euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} squared distance between a and b
     */
    function squaredDistance(a, b) {
        var x = b[0] - a[0],
            y = b[1] - a[1];
        return x*x + y*y
    }

    var sqrDist = squaredDistance_1;

    var length_1 = length;

    /**
     * Calculates the length of a vec2
     *
     * @param {vec2} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length(a) {
        var x = a[0],
            y = a[1];
        return Math.sqrt(x*x + y*y)
    }

    var len = length_1;

    var squaredLength_1 = squaredLength;

    /**
     * Calculates the squared length of a vec2
     *
     * @param {vec2} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    function squaredLength(a) {
        var x = a[0],
            y = a[1];
        return x*x + y*y
    }

    var sqrLen = squaredLength_1;

    var negate_1 = negate;

    /**
     * Negates the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to negate
     * @returns {vec2} out
     */
    function negate(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        return out
    }

    var normalize_1 = normalize;

    /**
     * Normalize a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to normalize
     * @returns {vec2} out
     */
    function normalize(out, a) {
        var x = a[0],
            y = a[1];
        var len = x*x + y*y;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
        }
        return out
    }

    var dot_1 = dot;

    /**
     * Calculates the dot product of two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1]
    }

    var cross_1 = cross;

    /**
     * Computes the cross product of two vec2's
     * Note that the cross product must by definition produce a 3D vector
     *
     * @param {vec3} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec3} out
     */
    function cross(out, a, b) {
        var z = a[0] * b[1] - a[1] * b[0];
        out[0] = out[1] = 0;
        out[2] = z;
        return out
    }

    var lerp_1 = lerp$1;

    /**
     * Performs a linear interpolation between two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec2} out
     */
    function lerp$1(out, a, b, t) {
        var ax = a[0],
            ay = a[1];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        return out
    }

    var random_1 = random;

    /**
     * Generates a random vector with the given scale
     *
     * @param {vec2} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec2} out
     */
    function random(out, scale) {
        scale = scale || 1.0;
        var r = Math.random() * 2.0 * Math.PI;
        out[0] = Math.cos(r) * scale;
        out[1] = Math.sin(r) * scale;
        return out
    }

    var transformMat2_1 = transformMat2;

    /**
     * Transforms the vec2 with a mat2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat2(out, a, m) {
        var x = a[0],
            y = a[1];
        out[0] = m[0] * x + m[2] * y;
        out[1] = m[1] * x + m[3] * y;
        return out
    }

    var transformMat2d_1 = transformMat2d;

    /**
     * Transforms the vec2 with a mat2d
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2d} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat2d(out, a, m) {
        var x = a[0],
            y = a[1];
        out[0] = m[0] * x + m[2] * y + m[4];
        out[1] = m[1] * x + m[3] * y + m[5];
        return out
    }

    var transformMat3_1 = transformMat3;

    /**
     * Transforms the vec2 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat3} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat3(out, a, m) {
        var x = a[0],
            y = a[1];
        out[0] = m[0] * x + m[3] * y + m[6];
        out[1] = m[1] * x + m[4] * y + m[7];
        return out
    }

    var transformMat4_1 = transformMat4;

    /**
     * Transforms the vec2 with a mat4
     * 3rd vector component is implicitly '0'
     * 4th vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat4(out, a, m) {
        var x = a[0], 
            y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        return out
    }

    var forEach_1 = forEach;

    var vec = create_1();

    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    function forEach(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i];
            vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0];
            a[i+1] = vec[1];
        }
        
        return a
    }

    var limit_1 = limit;

    /**
     * Limit the magnitude of this vector to the value used for the `max`
     * parameter.
     *
     * @param  {vec2} the vector to limit
     * @param  {Number} max the maximum magnitude for the vector
     * @returns {vec2} out
     */
    function limit(out, a, max) {
      var mSq = a[0] * a[0] + a[1] * a[1];

      if (mSq > max * max) {
        var n = Math.sqrt(mSq);
        out[0] = a[0] / n * max;
        out[1] = a[1] / n * max;
      } else {
        out[0] = a[0];
        out[1] = a[1];
      }

      return out;
    }

    var glVec2 = {
      EPSILON: epsilon
      , create: create_1
      , clone: clone_1
      , fromValues: fromValues_1
      , copy: copy_1
      , set: set_1
      , equals: equals_1
      , exactEquals: exactEquals_1
      , add: add_1
      , subtract: subtract_1
      , sub: sub
      , multiply: multiply_1
      , mul: mul
      , divide: divide_1
      , div: div
      , inverse: inverse_1
      , min: min_1
      , max: max_1
      , rotate: rotate_1
      , floor: floor_1
      , ceil: ceil_1
      , round: round_1
      , scale: scale_1
      , scaleAndAdd: scaleAndAdd_1
      , distance: distance_1
      , dist: dist
      , squaredDistance: squaredDistance_1
      , sqrDist: sqrDist
      , length: length_1
      , len: len
      , squaredLength: squaredLength_1
      , sqrLen: sqrLen
      , negate: negate_1
      , normalize: normalize_1
      , dot: dot_1
      , cross: cross_1
      , lerp: lerp_1
      , random: random_1
      , transformMat2: transformMat2_1
      , transformMat2d: transformMat2d_1
      , transformMat3: transformMat3_1
      , transformMat4: transformMat4_1
      , forEach: forEach_1
      , limit: limit_1
    };

    var vec2 = /*@__PURE__*/getDefaultExportFromCjs(glVec2);

    /* src/Character.svelte generated by Svelte v3.59.1 */

    function create_fragment$2(ctx) {
    	let text_1;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let text_1_props = { fontSize: 8, baseline: "top" };
    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	/*text_1_binding*/ ctx[13](text_1);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousedown", /*handleMouseDown*/ ctx[2], false, false, false, false),
    					listen_dev(window, "mouseup", /*handleMouseUp*/ ctx[3], false, false, false, false),
    					listen_dev(window, "mousemove", /*handleMouseMove*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};
    			text_1.$set(text_1_changes);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*text_1_binding*/ ctx[13](null);
    			destroy_component(text_1, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function lerp(min, max, t) {
    	return min * (1 - t) + max * t;
    }

    function damp(a, b, lambda, dt) {
    	return lerp(a, b, 1 - Math.exp(-lambda * dt));
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $height;
    	let $width;
    	validate_store(height, 'height');
    	component_subscribe($$self, height, $$value => $$invalidate(19, $height = $$value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, $$value => $$invalidate(20, $width = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Character', slots, ['default']);
    	let { color = '#ffe554' } = $$props;
    	let { size = 10 } = $$props;
    	let { thickness = 3 } = $$props;
    	let { startX = $width / 2 } = $$props;
    	let { startY = $height / 2 } = $$props;
    	let { moveSpeed = 0.2 } = $$props;
    	let { maxVelocity = 5 } = $$props;
    	let text;
    	let x = startX;
    	let y = startY;
    	const velocity = [0, 0];
    	let mouse = null;
    	let pointer;
    	let mouseDown = false;

    	renderable((props, dt) => {
    		const { context, width, height } = props;
    		let position = [x, y];

    		if (mouseDown) {
    			const delta = vec2.sub([], mouse, position);
    			const len = vec2.length(delta);

    			if (len > size * 2) {
    				vec2.normalize(delta, delta);
    				vec2.scaleAndAdd(velocity, velocity, delta, moveSpeed);
    			}
    		}

    		if (x < 0 || x > width) {
    			x = Math.max(0, Math.min(width, x));
    			velocity[0] *= -1;
    		}

    		if (y < 0 || y > height) {
    			y = Math.max(0, Math.min(height, y));
    			velocity[1] *= -1;
    		}

    		velocity[0] = Math.max(-maxVelocity, Math.min(maxVelocity, velocity[0]));
    		velocity[1] = Math.max(-maxVelocity, Math.min(maxVelocity, velocity[1]));
    		velocity[0] *= 0.98;
    		velocity[1] *= 0.98;
    		x += velocity[0];
    		y += velocity[1];
    		position[0] = x;
    		position[1] = y;
    		context.lineCap = 'round';
    		context.beginPath();
    		context.fillStyle = color;
    		context.strokeStyle = color;
    		context.lineWidth = thickness;
    		context.arc(x, y, size, 0, Math.PI * 2);
    		context.stroke();

    		if (vec2.squaredLength(velocity) > 0) {
    			const normal = vec2.normalize([], velocity);
    			context.lineWidth = thickness;
    			drawNormal(context, position, normal, size);
    		}

    		// We use this to make sure the text is in sync with the character
    		// Because regular prop reactivity happens a frame too late
    		text.$set({
    			text: `(${position.map(n => Math.round(n)).join(', ')})`,
    			x,
    			y: y + size + 10
    		});
    	});

    	function drawNormal(context, position, normal, length) {
    		const point = vec2.scaleAndAdd([], position, normal, length);
    		context.beginPath();
    		context.moveTo(position[0], position[1]);
    		context.lineTo(point[0], point[1]);
    		context.stroke();
    	}

    	function handleMouseMove({ clientX, clientY }) {
    		mouse = [clientX, clientY];
    	}

    	function handleMouseDown(ev) {
    		handleMouseMove(ev);
    		mouseDown = true;
    	}

    	function handleMouseUp(ev) {
    		handleMouseMove(ev);
    		mouseDown = false;
    	}

    	const writable_props = ['color', 'size', 'thickness', 'startX', 'startY', 'moveSpeed', 'maxVelocity'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Character> was created with unknown prop '${key}'`);
    	});

    	function text_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			text = $$value;
    			$$invalidate(0, text);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('size' in $$props) $$invalidate(5, size = $$props.size);
    		if ('thickness' in $$props) $$invalidate(6, thickness = $$props.thickness);
    		if ('startX' in $$props) $$invalidate(7, startX = $$props.startX);
    		if ('startY' in $$props) $$invalidate(8, startY = $$props.startY);
    		if ('moveSpeed' in $$props) $$invalidate(9, moveSpeed = $$props.moveSpeed);
    		if ('maxVelocity' in $$props) $$invalidate(10, maxVelocity = $$props.maxVelocity);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		renderable,
    		width,
    		height,
    		Text,
    		vec2,
    		color,
    		size,
    		thickness,
    		startX,
    		startY,
    		moveSpeed,
    		maxVelocity,
    		text,
    		x,
    		y,
    		velocity,
    		mouse,
    		pointer,
    		mouseDown,
    		drawNormal,
    		handleMouseMove,
    		handleMouseDown,
    		handleMouseUp,
    		lerp,
    		damp,
    		$height,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('size' in $$props) $$invalidate(5, size = $$props.size);
    		if ('thickness' in $$props) $$invalidate(6, thickness = $$props.thickness);
    		if ('startX' in $$props) $$invalidate(7, startX = $$props.startX);
    		if ('startY' in $$props) $$invalidate(8, startY = $$props.startY);
    		if ('moveSpeed' in $$props) $$invalidate(9, moveSpeed = $$props.moveSpeed);
    		if ('maxVelocity' in $$props) $$invalidate(10, maxVelocity = $$props.maxVelocity);
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('mouse' in $$props) mouse = $$props.mouse;
    		if ('pointer' in $$props) pointer = $$props.pointer;
    		if ('mouseDown' in $$props) mouseDown = $$props.mouseDown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		handleMouseMove,
    		handleMouseDown,
    		handleMouseUp,
    		color,
    		size,
    		thickness,
    		startX,
    		startY,
    		moveSpeed,
    		maxVelocity,
    		$$scope,
    		slots,
    		text_1_binding
    	];
    }

    class Character extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			color: 4,
    			size: 5,
    			thickness: 6,
    			startX: 7,
    			startY: 8,
    			moveSpeed: 9,
    			maxVelocity: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Character",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get color() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thickness() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thickness(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startX() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startX(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startY() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startY(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get moveSpeed() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set moveSpeed(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxVelocity() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxVelocity(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/FPS.svelte generated by Svelte v3.59.1 */

    function create_fragment$1(ctx) {
    	let text_1;
    	let t;
    	let current;

    	text_1 = new Text({
    			props: {
    				text: /*text*/ ctx[0],
    				fontSize: "12",
    				fontFamily: "Courier New",
    				align: "left",
    				baseline: "top",
    				x: 20,
    				y: 20
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};
    			if (dirty & /*text*/ 1) text_1_changes.text = /*text*/ ctx[0];
    			text_1.$set(text_1_changes);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FPS', slots, ['default']);
    	let text = '';
    	let elapsed = 0;
    	let frames = 0;
    	let prevTime = performance.now();

    	renderable((state, dt) => {
    		let time = performance.now();
    		frames++;

    		if (time >= prevTime + 1000) {
    			const fps = frames * 1000 / (time - prevTime);
    			$$invalidate(0, text = `${fps.toFixed(1)} FPS`);
    			prevTime = time;
    			frames = 0;
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FPS> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		time,
    		renderable,
    		text,
    		elapsed,
    		frames,
    		prevTime
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('elapsed' in $$props) elapsed = $$props.elapsed;
    		if ('frames' in $$props) frames = $$props.frames;
    		if ('prevTime' in $$props) prevTime = $$props.prevTime;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, $$scope, slots];
    }

    class FPS extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FPS",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.1 */

    // (13:1) <Background color='hsl(0, 0%, 10%)'>
    function create_default_slot_1(ctx) {
    	let dotgrid;
    	let current;

    	dotgrid = new DotGrid({
    			props: {
    				divisions: 30,
    				color: "hsla(0, 0%, 100%, 0.5)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dotgrid.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dotgrid, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dotgrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dotgrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dotgrid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(13:1) <Background color='hsl(0, 0%, 10%)'>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Canvas>
    function create_default_slot(ctx) {
    	let background;
    	let t0;
    	let character;
    	let t1;
    	let text_1;
    	let t2;
    	let fps;
    	let current;

    	background = new Background({
    			props: {
    				color: "hsl(0, 0%, 10%)",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	character = new Character({ props: { size: 10 }, $$inline: true });

    	text_1 = new Text({
    			props: {
    				text: "Click and drag around the page to move the character.",
    				fontSize: 12,
    				align: "right",
    				baseline: "bottom",
    				x: /*$width*/ ctx[0] - 20,
    				y: /*$height*/ ctx[1] - 20
    			},
    			$$inline: true
    		});

    	fps = new FPS({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(background.$$.fragment);
    			t0 = space();
    			create_component(character.$$.fragment);
    			t1 = space();
    			create_component(text_1.$$.fragment);
    			t2 = space();
    			create_component(fps.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(background, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(character, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(text_1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(fps, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const background_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				background_changes.$$scope = { dirty, ctx };
    			}

    			background.$set(background_changes);
    			const text_1_changes = {};
    			if (dirty & /*$width*/ 1) text_1_changes.x = /*$width*/ ctx[0] - 20;
    			if (dirty & /*$height*/ 2) text_1_changes.y = /*$height*/ ctx[1] - 20;
    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			transition_in(character.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			transition_in(fps.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			transition_out(character.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			transition_out(fps.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(background, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(character, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(text_1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(fps, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:0) <Canvas>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let canvas;
    	let current;

    	canvas = new Canvas({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(canvas.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvas, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const canvas_changes = {};

    			if (dirty & /*$$scope, $width, $height*/ 7) {
    				canvas_changes.$$scope = { dirty, ctx };
    			}

    			canvas.$set(canvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvas, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $width;
    	let $height;
    	validate_store(width, 'width');
    	component_subscribe($$self, width, $$value => $$invalidate(0, $width = $$value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, $$value => $$invalidate(1, $height = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		width,
    		height,
    		Canvas,
    		Background,
    		DotGrid,
    		Character,
    		Text,
    		FPS,
    		$width,
    		$height
    	});

    	return [$width, $height];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
