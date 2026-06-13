/** Animated aurora background: drifting blurred orbs over a masked grid. */
export function Background() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 800px at 80% -10%, #1b1146 0%, transparent 55%), radial-gradient(1000px 700px at -10% 110%, #07294d 0%, transparent 50%), linear-gradient(160deg, #060814 0%, #0a0a1f 50%, #060912 100%)",
      }}
    >
      <span
        className="animate-drift absolute -left-20 -top-28 h-[460px] w-[460px] rounded-full opacity-50 blur-[70px] mix-blend-screen"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent 65%)" }}
      />
      <span
        className="animate-drift absolute -bottom-40 -right-28 h-[520px] w-[520px] rounded-full opacity-50 blur-[70px] mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #fb5fa0, transparent 65%)",
          animationDelay: "-6s",
        }}
      />
      <span
        className="animate-drift absolute left-[55%] top-[40%] h-[380px] w-[380px] rounded-full opacity-50 blur-[70px] mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #7c3aed, transparent 65%)",
          animationDelay: "-11s",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, #000 35%, transparent 78%)",
        }}
      />
    </div>
  );
}
