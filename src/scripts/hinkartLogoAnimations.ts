/**
 * Hinkart logo animations (GSAP 3)
 *
 * 5 loading loops + 5 idle loops for the Hinkart SVG logo.
 * Works with the logo markup as-is: it finds the badge circle, the #logo group,
 * the two pillars, the drop and the shared filter by structure, so ids can be
 * suffixed per instance.
 *
 *   const anim = createLogoAnimator(svgEl);
 *   anim.play("inkDrip");      // loading loop
 *   await anim.finish();       // let the current loop land on its rest pose
 *   anim.play("lineBoil");     // idle loop
 *
 * Every loop starts and ends on the untouched logo, so finish() can always
 * hand over to the next animation without a jump.
 */
import { gsap } from "gsap";

export const LOADING_ANIMATIONS = ["inkDrip", "needleBuzz", "stampPress", "splitSeal", "inkFill"] as const;
export const IDLE_ANIMATIONS = ["lineBoil", "breathe", "dropSway", "hover", "sheen"] as const;

export type LoadingAnimation = (typeof LOADING_ANIMATIONS)[number];
export type IdleAnimation = (typeof IDLE_ANIMATIONS)[number];
export type LogoAnimation = LoadingAnimation | IdleAnimation;

export interface LogoAnimatorOptions {
	/** Defaults to the user's prefers-reduced-motion setting. */
	reducedMotion?: boolean;
}

export interface LogoAnimator {
	/** Stops whatever is running and starts `name`. */
	play(name: LogoAnimation): gsap.core.Timeline;
	/** Plays the current loop to its rest pose (fast-forwarding if longer than maxDuration seconds), then stops. */
	finish(maxDuration?: number): Promise<void>;
	/** Stops immediately and snaps back to the static logo. */
	stop(): void;
	readonly current: LogoAnimation | null;
}

/* ------------------------------------------------------------------ */
/* Internals                                                           */
/* ------------------------------------------------------------------ */

const SVG_NS = "http://www.w3.org/2000/svg";

interface Offset {
	el: SVGFEOffsetElement;
	dx: number;
	dy: number;
}

interface Parts {
	svg: SVGSVGElement;
	badge: SVGElement;
	logo: SVGGElement;
	left: SVGElement;
	right: SVGElement;
	/** Dark outline drop + coloured drop; always moved together. */
	drop: SVGElement[];
	/** Badge + logo group: the two filtered layers. */
	whole: SVGElement[];
	turbulence: SVGFETurbulenceElement | null;
	displacement: SVGFEDisplacementMapElement | null;
	offsets: Offset[];
	deepest: { dx: number; dy: number };
	maskId: string | null;
	base: { seed: string; scale: string };
}

type OnDispose = (fn: () => void) => void;
type Builder = (p: Parts, onDispose: OnDispose) => gsap.core.Timeline;

function getParts(svg: SVGSVGElement): Parts {
	const badge = svg.querySelector<SVGElement>(":scope > circle");
	const logo = svg.querySelector<SVGGElement>(":scope > g");
	const dropOutline = logo?.querySelector<SVGElement>(":scope > use");
	const inner = logo?.querySelector<SVGGElement>(":scope > g");
	const [left, right, dropFill] = inner ? Array.from(inner.querySelectorAll<SVGElement>(":scope > use")) : [];

	if (!badge || !logo || !dropOutline || !left || !right || !dropFill) {
		throw new Error("hinkartLogoAnimations: logo markup not recognised");
	}

	const filter = svg.getElementsByTagNameNS(SVG_NS, "filter")[0];
	const turbulence = (filter?.getElementsByTagNameNS(SVG_NS, "feTurbulence")[0] as SVGFETurbulenceElement) ?? null;
	const displacement = (filter?.getElementsByTagNameNS(SVG_NS, "feDisplacementMap")[0] as SVGFEDisplacementMapElement) ?? null;
	const offsets: Offset[] = filter
		? Array.from(filter.getElementsByTagNameNS(SVG_NS, "feOffset")).map((el) => ({
				el: el as SVGFEOffsetElement,
				dx: Number(el.getAttribute("dx") ?? 0),
				dy: Number(el.getAttribute("dy") ?? 0),
			}))
		: [];
	const deepest = offsets.reduce((m, o) => (o.dx + o.dy > m.dx + m.dy ? { dx: o.dx, dy: o.dy } : m), { dx: 0, dy: 0 });
	const mask = svg.getElementsByTagNameNS(SVG_NS, "mask")[0];

	return {
		svg,
		badge,
		logo,
		left,
		right,
		drop: [dropOutline, dropFill],
		whole: [badge, logo],
		turbulence,
		displacement,
		offsets,
		deepest,
		maskId: mask?.id || null,
		base: {
			seed: turbulence?.getAttribute("seed") ?? "0",
			scale: displacement?.getAttribute("scale") ?? "2",
		},
	};
}

/** Scales the 6-step extrusion. 1 = original, 0 = flat, >1 = deeper. */
function setDepth(p: Parts, depth: number) {
	for (const o of p.offsets) {
		o.el.setAttribute("dx", String(o.dx * depth));
		o.el.setAttribute("dy", String(o.dy * depth));
	}
}

function depthProxy(p: Parts) {
	const proxy = { v: 1 };
	return { proxy, apply: () => setDepth(p, proxy.v) };
}

function reset(p: Parts) {
	const moved = [...p.whole, p.left, p.right, ...p.drop];
	gsap.killTweensOf(moved);
	gsap.set(moved, { clearProps: "transform,opacity" });
	setDepth(p, 1);
	p.turbulence?.setAttribute("seed", p.base.seed);
	p.displacement?.setAttribute("scale", p.base.scale);
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
	const node = document.createElementNS(SVG_NS, tag);
	for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
	return node;
}

/** A layer clipped to the logo silhouette via the existing #hk-mask. */
function maskedOverlay(p: Parts, onDispose: OnDispose) {
	const g = svgEl("g", { mask: `url(#${p.maskId})`, "pointer-events": "none" });
	p.svg.appendChild(g);
	onDispose(() => g.remove());
	return g;
}

/** Ink surface: flat body with a sine top edge, period 55 so an x shift of -55 loops seamlessly. */
function wavePath() {
	const half = 27.5;
	let d = `M -60 0 Q ${-60 + half / 2} -5 ${-60 + half} 0`;
	for (let x = -60 + half * 2; x <= 235; x += half) d += ` T ${x} 0`;
	return `${d} L 235 260 L -60 260 Z`;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

/** The drop evaporates, falls back in from above, splashes and settles. */
const inkDrip: Builder = (p) =>
	gsap
		.timeline({ repeat: -1 })
		.set(p.drop, { transformOrigin: "50% 100%" })
		.to(p.drop, { scale: 0, duration: 0.3, ease: "back.in(2)" })
		.set(p.drop, { y: -95, scaleX: 0.75, scaleY: 1.3, opacity: 0 })
		.to(p.drop, { y: 0, duration: 0.5, ease: "power2.in" })
		.to(p.drop, { opacity: 1, duration: 0.12 }, "<")
		.to(p.drop, { scaleX: 1.3, scaleY: 0.68, duration: 0.08, ease: "power1.out" })
		.to([p.left, p.right], { y: 4, duration: 0.08, ease: "power1.out" }, "<")
		.to(p.drop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" })
		.to([p.left, p.right], { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }, "<")
		.to({}, { duration: 0.35 });

/** Coil-machine rhythm: two buzzing bursts, the extrusion pressed flat while it runs. */
const needleBuzz: Builder = (p) => {
	const { proxy, apply } = depthProxy(p);
	const tl = gsap.timeline({ repeat: -1 });
	const burst = () => {
		tl.to(proxy, { v: 0.55, duration: 0.12, ease: "power2.out", onUpdate: apply })
			.to(p.logo, { x: "random(-1.6, 1.6)", y: "random(-1.6, 1.6)", duration: 0.035, repeat: 11, repeatRefresh: true, ease: "none" }, "<")
			.to(p.drop, { scale: 1.08, transformOrigin: "50% 50%", duration: 0.21, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
			.to(p.logo, { x: 0, y: 0, duration: 0.06 })
			.to(proxy, { v: 1, duration: 0.3, ease: "back.out(3)", onUpdate: apply }, "<");
	};
	burst();
	tl.to({}, { duration: 0.15 });
	burst();
	tl.to({}, { duration: 0.55 });
	return tl;
};

/** Pressed like a rubber stamp: the logo sinks onto its own extrusion, then springs back past rest. */
const stampPress: Builder = (p) => {
	const { proxy } = depthProxy(p);
	const { dx, dy } = p.deepest;
	const apply = () => {
		setDepth(p, proxy.v);
		gsap.set(p.whole, { x: dx * (1 - proxy.v), y: dy * (1 - proxy.v) });
	};
	return gsap
		.timeline({ repeat: -1 })
		.to(proxy, { v: 0, duration: 0.32, ease: "power3.in", onUpdate: apply })
		.to({}, { duration: 0.18 })
		.to(proxy, { v: 1, duration: 0.75, ease: "back.out(2.5)", onUpdate: apply })
		.to({}, { duration: 0.4 });
};

/** Pillars swing open, the drop flips, everything slams shut and the badge takes the hit. */
const splitSeal: Builder = (p) => {
	const { proxy, apply } = depthProxy(p);
	return gsap
		.timeline({ repeat: -1 })
		.set(p.left, { transformOrigin: "100% 100%" })
		.set(p.right, { transformOrigin: "0% 100%" })
		.set(p.drop, { transformOrigin: "50% 50%" })
		.set(p.badge, { transformOrigin: "50% 50%" })
		.to(p.left, { x: -12, rotation: -5, duration: 0.45, ease: "power2.inOut" })
		.to(p.right, { x: 12, rotation: 5, duration: 0.45, ease: "power2.inOut" }, "<")
		.to(p.drop, { y: -14, scale: 1.12, duration: 0.45, ease: "power2.out" }, "<")
		.to(p.drop, { rotation: 360, duration: 0.6, ease: "power2.inOut" }, "<0.1")
		.to([p.left, p.right], { x: 0, rotation: 0, duration: 0.22, ease: "power4.in" })
		.to(p.drop, { y: 0, scale: 1, duration: 0.22, ease: "power4.in" }, "<")
		.to(p.badge, { scale: 1.05, duration: 0.08, ease: "power1.out" })
		.to(proxy, { v: 0.6, duration: 0.08, onUpdate: apply }, "<")
		.to(p.badge, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" })
		.to(proxy, { v: 1, duration: 0.45, ease: "elastic.out(1, 0.4)", onUpdate: apply }, "<")
		.to({}, { duration: 0.25 });
};

/** Dark ink rises through the silhouette with a rolling surface, then drains. */
const inkFill: Builder = (p, onDispose) => {
	const tl = gsap.timeline({ repeat: -1 });
	if (!p.maskId) return tl;
	const wave = svgEl("path", { d: wavePath() });
	wave.style.fill = "var(--color-daintree-1000)";
	maskedOverlay(p, onDispose).appendChild(wave);
	gsap.set(wave, { y: 228 });

	return tl
		.to(wave, { x: -55, duration: 0.675, repeat: 3, ease: "none" }, 0)
		.to(wave, { y: -12, duration: 1.3, ease: "power1.inOut" }, 0)
		.to(wave, { y: 228, duration: 1.1, ease: "power2.in" }, 1.6);
};

/* ------------------------------------------------------------------ */
/* Idle                                                                */
/* ------------------------------------------------------------------ */

export interface BoilOptions {
	/** Multiplier for the displacement scale while boiling. */
	scaleBoost?: number;
	/** Number of seeds cycled per loop. */
	frames?: number;
	/** Seconds per frame; 0.12 ≈ animating on twos. */
	step?: number;
	/** Defaults to the user's prefers-reduced-motion setting. */
	reducedMotion?: boolean;
}

/**
 * Hand-drawn "boil" for any SVG filter with an feTurbulence (+ optional feDisplacementMap):
 * the wobble noise re-seeds on twos, like a flash sheet come alive.
 * Returns a looping timeline; kill() restores the filter's original seed and scale.
 */
export function boilFilter(filter: SVGFilterElement, options: BoilOptions = {}): gsap.core.Timeline {
	const { scaleBoost = 1.5, frames = 3, step = 0.12 } = options;
	const reduced =
		options.reducedMotion ??
		(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	const tl = gsap.timeline({ repeat: -1 });
	const t = filter.getElementsByTagNameNS(SVG_NS, "feTurbulence")[0] as SVGFETurbulenceElement | undefined;
	if (!t || reduced) return tl;
	const d = filter.getElementsByTagNameNS(SVG_NS, "feDisplacementMap")[0] as SVGFEDisplacementMapElement | undefined;

	const seed = t.getAttribute("seed") ?? "0";
	const scale = d?.getAttribute("scale") ?? "0";
	const base = Number(seed) || 0;
	d?.setAttribute("scale", String(Number(scale) * scaleBoost));
	tl.eventCallback("onInterrupt", () => {
		t.setAttribute("seed", seed);
		d?.setAttribute("scale", scale);
	});

	for (let i = 0; i < frames; i++) {
		tl.call(() => t.setAttribute("seed", String(base + i + 1)), undefined, 0.001 + i * step);
	}
	return tl.to({}, { duration: frames * step }, 0);
}

const lineBoil: Builder = (p) => {
	const filter = p.svg.getElementsByTagNameNS(SVG_NS, "filter")[0] as SVGFilterElement | undefined;
	return filter ? boilFilter(filter, { reducedMotion: false }) : gsap.timeline({ repeat: -1 });
};

/** Slow inhale: the badge swells a touch, the extrusion deepens, the drop lifts. */
const breathe: Builder = (p) => {
	const { proxy, apply } = depthProxy(p);
	return gsap
		.timeline({ repeat: -1, defaults: { duration: 2.4, ease: "sine.inOut" } })
		.set(p.whole, { svgOrigin: "55 108" })
		.to(p.whole, { scale: 1.03 }, 0)
		.to(proxy, { v: 1.3, onUpdate: apply }, 0)
		.to(p.drop, { y: -3 }, 0)
		.to(p.whole, { scale: 1 }, 2.4)
		.to(proxy, { v: 1, onUpdate: apply }, 2.4)
		.to(p.drop, { y: 0 }, 2.4);
};

/** The drop hangs from its tip and swings with a damped pendulum. */
const dropSway: Builder = (p) =>
	gsap
		.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
		.set(p.drop, { transformOrigin: "50% 0%" })
		.to(p.drop, { rotation: 6, duration: 1.3 })
		.to(p.drop, { rotation: -4.5, duration: 1.9 })
		.to(p.drop, { rotation: 2.5, duration: 1.5 })
		.to(p.drop, { rotation: 0, duration: 1.1 })
		.to({}, { duration: 1.6 });

/** Floats off the page: lifts and tilts while the extrusion stretches to stay grounded. */
const hover: Builder = (p) => {
	const { proxy, apply } = depthProxy(p);
	return gsap
		.timeline({ repeat: -1, defaults: { duration: 2, ease: "sine.inOut" } })
		.set(p.whole, { svgOrigin: "55 108" })
		.to(p.whole, { y: -5, rotation: -1.2 }, 0)
		.to(proxy, { v: 1.4, onUpdate: apply }, 0)
		.to(p.whole, { y: 0, rotation: 0 }, 2)
		.to(proxy, { v: 1, onUpdate: apply }, 2)
		.to(p.whole, { y: -3, rotation: 1 }, 4)
		.to(proxy, { v: 1.25, onUpdate: apply }, 4)
		.to(p.whole, { y: 0, rotation: 0 }, 6)
		.to(proxy, { v: 1, onUpdate: apply }, 6);
};

/** A double glint sweeps across the fresh ink every few seconds. */
const sheen: Builder = (p, onDispose) => {
	const tl = gsap.timeline({ repeat: -1 });
	if (!p.maskId) return tl;
	const tilt = svgEl("g", { transform: "rotate(24 55 108)" });
	const band = svgEl("rect", { x: -92, y: -80, width: 16, height: 380, fill: "#fff", "fill-opacity": 0.5 });
	const thin = svgEl("rect", { x: -68, y: -80, width: 5, height: 380, fill: "#fff", "fill-opacity": 0.4 });
	tilt.append(band, thin);
	maskedOverlay(p, onDispose).appendChild(tilt);

	return tl.to([band, thin], { x: 265, duration: 0.85, ease: "power2.inOut" }).to({}, { duration: 3.2 });
};

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

const gentlePulse: Builder = (p) =>
	gsap
		.timeline({ repeat: -1, defaults: { duration: 0.9, ease: "sine.inOut" } })
		.to(p.whole, { opacity: 0.5 })
		.to(p.whole, { opacity: 1 });

const still: Builder = () => gsap.timeline();

const BUILDERS: Record<LogoAnimation, Builder> = {
	inkDrip,
	needleBuzz,
	stampPress,
	splitSeal,
	inkFill,
	lineBoil,
	breathe,
	dropSway,
	hover,
	sheen,
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function createLogoAnimator(svg: SVGSVGElement, options: LogoAnimatorOptions = {}): LogoAnimator {
	const p = getParts(svg);
	const reduced =
		options.reducedMotion ??
		(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

	let active: { name: LogoAnimation; tl: gsap.core.Timeline; disposers: (() => void)[] } | null = null;
	let finishing: { tween: gsap.core.Tween; resolve: () => void } | null = null;

	const stop = () => {
		if (finishing) {
			finishing.tween.kill();
			finishing.resolve();
			finishing = null;
		}
		if (!active) return;
		active.tl.kill();
		active.disposers.forEach((fn) => fn());
		active = null;
		reset(p);
	};

	const play = (name: LogoAnimation) => {
		stop();
		const isLoading = (LOADING_ANIMATIONS as readonly string[]).includes(name);
		const builder = reduced ? (isLoading ? gentlePulse : still) : BUILDERS[name];
		const disposers: (() => void)[] = [];
		const tl = builder(p, (fn) => disposers.push(fn));
		active = { name, tl, disposers };
		return tl;
	};

	const finish = (maxDuration = 1.2) =>
		new Promise<void>((resolve) => {
			if (!active) return resolve();
			if (finishing) finishing.tween.kill();
			const run = active;
			const tl = run.tl;
			tl.pause();
			const remaining = Math.max(0, tl.duration() - tl.time());
			const tween = gsap.to(tl, {
				time: tl.duration(),
				duration: Math.min(remaining, maxDuration),
				ease: "none",
				onComplete: () => {
					finishing = null;
					if (active === run) stop();
					resolve();
				},
			});
			finishing = { tween, resolve };
		});

	return {
		play,
		finish,
		stop,
		get current() {
			return active?.name ?? null;
		},
	};
}
