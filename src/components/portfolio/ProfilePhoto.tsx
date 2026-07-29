import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Variant = "hero" | "featured";

export function ProfilePhoto({
    src,
    alt,
    variant,
    className = "",
}: {
    src: string;
    alt: string;
    variant: Variant;
    className?: string;
}) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const scanBarRef = useRef<HTMLDivElement>(null);
    const vignetteRef = useRef<HTMLDivElement>(null);

    // --- reveal animation: clip-path wipe + traveling scan bar -----------
    useEffect(() => {
        const frame = frameRef.current;
        const bar = scanBarRef.current;
        if (!frame || !bar) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            gsap.set(frame, { clipPath: "inset(0% 0% 0% 0%)" });
            gsap.set(bar, { opacity: 0 });
            return;
        }

        const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.inOut" },
        });

        tl.set(frame, { clipPath: "inset(0% 0% 100% 0%)" })
            .set(bar, { top: "0%", opacity: 1 })
            .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 }, 0)
            .to(bar, { top: "100%", duration: 1.1 }, 0)
            .to(bar, { opacity: 0, duration: 0.25 }, 0.9);

        if (variant === "hero") {
            const t = gsap.delayedCall(0.35, () => tl.play());
            return () => {
                t.kill();
                tl.kill();
            };
        }

        const st = ScrollTrigger.create({
            trigger: wrapRef.current,
            start: "top 85%",
            once: true,
            onEnter: () => tl.play(),
        });

        return () => {
            st.kill();
            tl.kill();
        };
    }, [variant]);

    // --- magnetic cursor-tracking tilt (featured variant only) -----------
    useEffect(() => {
        if (variant !== "featured") return;
        const wrap = wrapRef.current;
        const frame = frameRef.current;
        if (!wrap || !frame) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;

        const rotateX = gsap.quickTo(frame, "rotateX", {
            duration: 0.5,
            ease: "power3.out",
        });
        const rotateY = gsap.quickTo(frame, "rotateY", {
            duration: 0.5,
            ease: "power3.out",
        });
        const scale = gsap.quickTo(frame, "scale", {
            duration: 0.4,
            ease: "power3.out",
        });

        const onMove = (e: PointerEvent) => {
            const rect = wrap.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            rotateY(px * 14);
            rotateX(-py * 14);
        };
        const onEnter = () => scale(1.02);
        const onLeave = () => {
            rotateX(0);
            rotateY(0);
            scale(1);
        };

        wrap.addEventListener("pointermove", onMove);
        wrap.addEventListener("pointerenter", onEnter);
        wrap.addEventListener("pointerleave", onLeave);
        return () => {
            wrap.removeEventListener("pointermove", onMove);
            wrap.removeEventListener("pointerenter", onEnter);
            wrap.removeEventListener("pointerleave", onLeave);
        };
    }, [variant]);

    // --- hover: ease off the vignette to let more true color breathe -----
    useEffect(() => {
        if (variant !== "featured") return;
        const wrap = wrapRef.current;
        const vignette = vignetteRef.current;
        if (!wrap || !vignette) return;

        const onEnter = () => gsap.to(vignette, { opacity: 0.35, duration: 0.4 });
        const onLeave = () => gsap.to(vignette, { opacity: 1, duration: 0.5 });

        wrap.addEventListener("pointerenter", onEnter);
        wrap.addEventListener("pointerleave", onLeave);
        return () => {
            wrap.removeEventListener("pointerenter", onEnter);
            wrap.removeEventListener("pointerleave", onLeave);
        };
    }, [variant]);

    const isFeatured = variant === "featured";

    return (
        <div
            ref={wrapRef}
            className={`relative select-none ${className}`}
            style={{ perspective: isFeatured ? "900px" : undefined }}
        >
            {isFeatured && (
                <>
                    {/* soft glow blob behind the card for depth */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-40 blur-3xl"
                        style={{ background: "var(--accent)" }}
                    />
                    {/* offset accent frame peeking out behind the card */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 rounded-lg border-2 translate-x-3 translate-y-3"
                        style={{ borderColor: "var(--accent)", opacity: 0.5 }}
                    />
                </>
            )}

            <div
                ref={frameRef}
                className="relative h-full w-full overflow-hidden rounded-lg hair-border accent-glow"
                style={{
                    clipPath: "inset(0% 0% 100% 0%)",
                    transformStyle: isFeatured ? "preserve-3d" : undefined,
                    willChange: "transform",
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="block w-full h-full object-cover"
                    style={{ filter: "saturate(1.08) contrast(1.05)" }}
                    draggable={false}
                />

                {/* soft accent-colored vignette at the edges only — real photo
            color stays untouched in the center */}
                <div
                    ref={vignetteRef}
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 60%, transparent 45%, color-mix(in oklab, var(--accent) 35%, transparent) 130%)",
                    }}
                />

                {/* faint targeting/scan grid, reinforces the recon theme */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* bottom gradient so any caption/label text stays legible */}
                {isFeatured && (
                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                        style={{
                            background:
                                "linear-gradient(to top, rgba(11,14,20,0.65), transparent)",
                        }}
                    />
                )}

                {/* traveling scan bar shown during the reveal animation */}
                <div
                    ref={scanBarRef}
                    className="pointer-events-none absolute left-0 right-0 h-[3px] opacity-0"
                    style={{
                        background: "var(--accent)",
                        boxShadow: "0 0 16px 2px var(--accent)",
                    }}
                />

                {/* corner reticle marks, viewfinder-style */}
                {isFeatured && <CornerMarks />}
            </div>

            {isFeatured && (
                <div className="mt-3 flex items-center justify-between font-mono-tech text-[11px] text-muted">
                    <span>subject: ismail_murtaza.jpg</span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "var(--accent)" }}
                        />
                        verified
                    </span>
                </div>
            )}
        </div>
    );
}

function CornerMarks() {
    const base =
        "pointer-events-none absolute h-4 w-4 border-[var(--accent)] opacity-70";
    return (
        <>
            <span className={`${base} top-2 left-2 border-t-2 border-l-2`} />
            <span className={`${base} top-2 right-2 border-t-2 border-r-2`} />
            <span className={`${base} bottom-2 left-2 border-b-2 border-l-2`} />
            <span className={`${base} bottom-2 right-2 border-b-2 border-r-2`} />
        </>
    );
}
