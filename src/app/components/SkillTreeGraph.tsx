import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { AriaGraphResponse, AriaNode } from "../services/backend-api";

const TYPE_COLORS: Record<string, string> = {
  skill: "#22c55e",
  course: "#f59e0b",
  concept: "#a855f7",
  event: "#06b6d4",
  role: "#f43f5e",
  program: "#6366f1",
  professor: "#64748b",
};

const STATE_OPACITY: Record<string, number> = {
  unlocked: 1.0,
  in_progress: 0.85,
  available_next: 0.55,
  locked: 0.22,
};

const RING_RADII = [180, 330, 490, 680];
const RING_LABELS = ["Unlocked", "In Progress", "Available Next", "Locked"];
const STATE_ORDER = ["unlocked", "in_progress", "available_next", "locked"];

type PositionedNode = {
  node: AriaNode;
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
};

function nodeRadius(n: AriaNode): number {
  return Math.max(10, Math.min(30, 10 + n.unlocksCount * 2));
}

function computeLayout(nodes: AriaNode[]): PositionedNode[] {
  const groups: Record<string, AriaNode[]> = {
    unlocked: [],
    in_progress: [],
    available_next: [],
    locked: [],
  };
  for (const n of nodes) groups[n.state]?.push(n);

  for (const state of STATE_ORDER) {
    groups[state].sort((a, b) => {
      const ro: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const rd = (ro[a.relevance] ?? 2) - (ro[b.relevance] ?? 2);
      if (rd !== 0) return rd;
      return b.unlocksCount - a.unlocksCount;
    });
  }

  const out: PositionedNode[] = [];
  for (let ri = 0; ri < STATE_ORDER.length; ri++) {
    const state = STATE_ORDER[ri];
    const ring = groups[state];
    const radius = RING_RADII[ri];
    const count = ring.length;
    if (count === 0) continue;
    const offset = ri * 0.4;
    for (let i = 0; i < count; i++) {
      const angle = offset + (i / count) * 2 * Math.PI - Math.PI / 2;
      const n = ring[i];
      out.push({
        node: n,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        r: nodeRadius(n),
        color: TYPE_COLORS[n.type] || "#64748b",
        opacity: STATE_OPACITY[n.state] || 0.22,
      });
    }
  }
  return out;
}

export default function SkillTreeGraph({ data }: { data: AriaGraphResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [vb, setVb] = useState({ x: -820, y: -820, w: 1640, h: 1640 });
  const [dragging, setDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ mx: 0, my: 0, vx: 0, vy: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const positioned = useMemo(() => computeLayout(data.skillTree.nodes), [data]);

  const posMap = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    for (const p of positioned) m.set(p.node.id, p);
    return m;
  }, [positioned]);

  const visibleEdges = useMemo(
    () => data.skillTree.edges.filter((e) => posMap.has(e.source) && posMap.has(e.target)),
    [data, posMap],
  );

  const connectedIds = useMemo(() => {
    const focus = hovered || selected;
    if (!focus) return new Set<string>();
    const ids = new Set<string>([focus]);
    for (const e of data.skillTree.edges) {
      if (e.source === focus) ids.add(e.target);
      if (e.target === focus) ids.add(e.source);
    }
    return ids;
  }, [hovered, selected, data]);

  const containerSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { w: 800, h: 700 };
    return { w: el.clientWidth || 800, h: el.clientHeight || 700 };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setDragging(true);
      setDragOrigin({ mx: e.clientX, my: e.clientY, vx: vb.x, vy: vb.y });
    },
    [vb],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const cs = containerSize();
      const dx = ((e.clientX - dragOrigin.mx) / cs.w) * vb.w;
      const dy = ((e.clientY - dragOrigin.my) / cs.h) * vb.h;
      setVb((prev) => ({ ...prev, x: dragOrigin.vx - dx, y: dragOrigin.vy - dy }));
    },
    [dragging, dragOrigin, vb.w, vb.h, containerSize],
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.08 : 1 / 1.08;
      setVb((prev) => {
        const nw = Math.max(400, Math.min(6000, prev.w * factor));
        const nh = Math.max(400, Math.min(6000, prev.h * factor));
        return {
          x: prev.x - (nw - prev.w) / 2,
          y: prev.y - (nh - prev.h) / 2,
          w: nw,
          h: nh,
        };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const resetView = () => setVb({ x: -820, y: -820, w: 1640, h: 1640 });

  const focusNode = hovered || selected;
  const focusData = focusNode ? posMap.get(focusNode) : null;

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden" style={{ height: 720 }}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="w-full h-full bg-[#0c1222] cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
        </defs>

        {/* Center glow */}
        <circle cx={0} cy={0} r={140} fill="url(#center-glow)" />

        {/* Ring boundaries */}
        {RING_RADII.map((radius, i) => (
          <g key={`ring-${i}`}>
            <circle
              cx={0}
              cy={0}
              r={radius}
              fill="none"
              stroke="rgba(148,163,184,0.08)"
              strokeWidth={1}
              strokeDasharray="6 4"
            />
            <text
              x={0}
              y={-radius + 14}
              textAnchor="middle"
              fill="rgba(148,163,184,0.3)"
              fontSize={12}
              fontWeight={500}
            >
              {RING_LABELS[i]}
            </text>
          </g>
        ))}

        {/* Center label */}
        <text x={0} y={-6} textAnchor="middle" fill="rgba(148,163,184,0.35)" fontSize={22} fontWeight={700}>
          Skill Tree
        </text>
        <text x={0} y={16} textAnchor="middle" fill="rgba(148,163,184,0.2)" fontSize={11}>
          {data.skillTree.nodes.length} nodes · {data.skillTree.edges.length} edges
        </text>

        {/* Edges */}
        <g>
          {visibleEdges.map((edge, i) => {
            const s = posMap.get(edge.source)!;
            const t = posMap.get(edge.target)!;
            const isLit =
              focusNode !== null && connectedIds.has(edge.source) && connectedIds.has(edge.target);
            const mx = (s.x + t.x) * 0.3;
            const my = (s.y + t.y) * 0.3;
            return (
              <path
                key={`e-${i}`}
                d={`M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`}
                fill="none"
                stroke={isLit ? s.color : "rgba(148,163,184,0.06)"}
                strokeWidth={isLit ? 1.8 : 0.4}
                opacity={isLit ? 0.9 : 1}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {positioned.map((p) => {
            const isHov = hovered === p.node.id;
            const isSel = selected === p.node.id;
            const isConn = connectedIds.has(p.node.id);
            const dimmed = focusNode !== null && !isConn;
            const showLabel =
              p.node.state !== "locked" || isHov || isSel || p.node.relevance === "high";
            const effectiveOpacity = dimmed ? 0.07 : p.opacity;
            const rad = isHov || isSel ? p.r + 4 : p.r;

            return (
              <g
                key={p.node.id}
                transform={`translate(${p.x},${p.y})`}
                onPointerEnter={() => setHovered(p.node.id)}
                onPointerLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((prev) => (prev === p.node.id ? null : p.node.id));
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Outer glow ring for hovered/selected */}
                {(isHov || isSel) && (
                  <circle r={rad + 6} fill="none" stroke={p.color} strokeWidth={2} opacity={0.3} />
                )}
                {/* Main circle */}
                <circle
                  r={rad}
                  fill={p.color}
                  opacity={effectiveOpacity}
                  stroke={isHov || isSel ? "#fff" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isHov || isSel ? 2 : 0.5}
                  filter={isHov || isSel ? "url(#node-glow)" : undefined}
                />
                {/* Unlocks count */}
                {p.node.unlocksCount > 0 && rad >= 14 && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.95)"
                    fontSize={rad > 20 ? 11 : 9}
                    fontWeight={700}
                    style={{ pointerEvents: "none" }}
                  >
                    {p.node.unlocksCount}
                  </text>
                )}
                {/* Label */}
                {showLabel && (
                  <text
                    y={rad + 14}
                    textAnchor="middle"
                    fill={dimmed ? "rgba(255,255,255,0.06)" : `rgba(255,255,255,${effectiveOpacity * 0.85})`}
                    fontSize={rad >= 18 ? 10 : 8}
                    fontWeight={isHov || isSel ? 600 : 400}
                    style={{ pointerEvents: "none" }}
                  >
                    {p.node.label.length > 22 ? p.node.label.slice(0, 20) + "…" : p.node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Minimap */}
      <div className="absolute top-3 right-3 w-[130px] h-[130px] bg-[#0c1222]/90 rounded-lg border border-slate-700/60 overflow-hidden backdrop-blur-sm">
        <svg viewBox="-820 -820 1640 1640" className="w-full h-full">
          {RING_RADII.map((r, i) => (
            <circle key={i} cx={0} cy={0} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={2} />
          ))}
          {positioned.map((p) => (
            <circle key={p.node.id} cx={p.x} cy={p.y} r={5} fill={p.color} opacity={p.opacity * 0.7} />
          ))}
          <rect
            x={vb.x}
            y={vb.y}
            width={vb.w}
            height={vb.h}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={6}
            rx={4}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-[#0c1222]/90 rounded-lg border border-slate-700/60 p-3 backdrop-blur-sm">
        <p className="text-[10px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">Node Types</p>
        <div className="space-y-1.5">
          {(["skill", "course", "concept", "event", "role"] as const).map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: TYPE_COLORS[t] }} />
              <span className="text-[11px] text-slate-300 capitalize">{t}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700/60 mt-2 pt-2">
          <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">State</p>
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>● Bright = Unlocked</span>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>◐ Medium = In Progress</span>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>○ Dim = Locked</span>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={resetView}
        className="absolute top-3 left-3 bg-[#0c1222]/90 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 hover:bg-slate-800 transition-colors backdrop-blur-sm"
      >
        Reset View
      </button>

      {/* Tooltip */}
      {focusData && (
        <div className="absolute bottom-3 right-3 w-[220px] bg-[#0c1222]/95 rounded-lg border border-slate-700/60 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ background: focusData.color }} />
            <span className="text-sm font-semibold text-white truncate">{focusData.node.label}</span>
          </div>
          <div className="flex gap-1.5 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
              {focusData.node.type}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
              {focusData.node.state.replace("_", " ")}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
              {focusData.node.relevance}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>Unlocks: {focusData.node.unlocksCount} nodes</p>
            <p>Prerequisites: {focusData.node.prerequisites.length}</p>
            {focusData.node.prerequisites.length > 0 && (
              <p className="text-slate-500 truncate">
                ← {focusData.node.prerequisites.map((p) => posMap.get(p)?.node.label || p).join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
