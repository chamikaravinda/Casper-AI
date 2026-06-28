"use client";

import { useCallback } from "react";
import { LayoutTemplate, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates";
import { CanvasNode } from "@/types/canvas";

// ─── SVG preview viewport ─────────────────────────────────────────────────────

const PREVIEW_W = 260;
const PREVIEW_H = 160;
const PREVIEW_PAD = 12;

/**
 * Compute a bounding box from template nodes, then return a scale+offset
 * transform that fits all nodes into the preview viewport with padding.
 */
function computePreviewTransform(nodes: CanvasNode[]): {
  scale: number;
  dx: number;
  dy: number;
} {
  if (nodes.length === 0) return { scale: 1, dx: 0, dy: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const w = parseFloat(n.style?.width as string) || 120;
    const h = parseFloat(n.style?.height as string) || 50;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + w);
    maxY = Math.max(maxY, n.position.y + h);
  }

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  const availW = PREVIEW_W - PREVIEW_PAD * 2;
  const availH = PREVIEW_H - PREVIEW_PAD * 2;

  const scale = Math.min(availW / contentW, availH / contentH, 1);

  const scaledW = contentW * scale;
  const scaledH = contentH * scale;

  const dx = PREVIEW_PAD + (availW - scaledW) / 2 - minX * scale;
  const dy = PREVIEW_PAD + (availH - scaledH) / 2 - minY * scale;

  return { scale, dx, dy };
}

/**
 * Lightweight SVG preview — no React Flow instance needed.
 * Draws edges as lines between node centers, nodes as colored rectangles/shapes.
 */
function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { scale, dx, dy } = computePreviewTransform(template.nodes);

  // Build a quick lookup: nodeId → center coords in preview space
  const centers: Record<string, { x: number; y: number }> = {};
  for (const n of template.nodes) {
    const w = parseFloat(n.style?.width as string) || 120;
    const h = parseFloat(n.style?.height as string) || 50;
    centers[n.id] = {
      x: (n.position.x + w / 2) * scale + dx,
      y: (n.position.y + h / 2) * scale + dy,
    };
  }

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="rounded-xl"
      style={{ background: "#080809" }}
    >
      {/* Edges first so nodes render on top */}
      {template.edges.map((e) => {
        const src = centers[e.source];
        const tgt = centers[e.target];
        if (!src || !tgt) return null;
        return (
          <line
            key={e.id}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke="rgba(248,250,252,0.18)"
            strokeWidth={1}
            strokeLinecap="round"
          />
        );
      })}

      {/* Nodes */}
      {template.nodes.map((n) => {
        const w = parseFloat(n.style?.width as string) || 120;
        const h = parseFloat(n.style?.height as string) || 50;
        const sx = n.position.x * scale + dx;
        const sy = n.position.y * scale + dy;
        const sw = w * scale;
        const sh = h * scale;
        const fill = (n.data.color as string) || "#1F1F1F";
        const stroke = (n.data.textColor as string) || "#EDEDED";
        const shape = n.data.shape || "rectangle";
        const cx = sx + sw / 2;
        const cy = sy + sh / 2;

        const shapeEl = (() => {
          if (shape === "circle") {
            const r = Math.min(sw, sh) / 2;
            return (
              <ellipse cx={cx} cy={cy} rx={r} ry={r} fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
            );
          }
          if (shape === "pill") {
            return (
              <rect x={sx} y={sy} width={sw} height={sh} rx={sh / 2} ry={sh / 2}
                fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
            );
          }
          if (shape === "diamond") {
            const pts = `${cx},${sy} ${sx + sw},${cy} ${cx},${sy + sh} ${sx},${cy}`;
            return (
              <polygon points={pts} fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
            );
          }
          if (shape === "hexagon") {
            const rx2 = sw / 2;
            const ry2 = sh / 2;
            const pts = [0, 60, 120, 180, 240, 300]
              .map((deg) => {
                const rad = ((deg - 30) * Math.PI) / 180;
                return `${cx + rx2 * Math.cos(rad)},${cy + ry2 * Math.sin(rad)}`;
              })
              .join(" ");
            return (
              <polygon points={pts} fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
            );
          }
          if (shape === "cylinder") {
            const rx2 = sw / 2;
            const ry2 = Math.max(3, sh * 0.12);
            return (
              <>
                <rect x={sx} y={sy + ry2} width={sw} height={sh - ry2 * 2}
                  fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
                <ellipse cx={cx} cy={sy + sh - ry2} rx={rx2} ry={ry2}
                  fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
                <ellipse cx={cx} cy={sy + ry2} rx={rx2} ry={ry2}
                  fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
              </>
            );
          }
          // Default: rectangle
          return (
            <rect x={sx} y={sy} width={sw} height={sh} rx={4} ry={4}
              fill={fill} stroke={`${stroke}60`} strokeWidth={0.8} />
          );
        })();

        return <g key={n.id}>{shapeEl}</g>;
      })}
    </svg>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border-default bg-bg-elevated overflow-hidden transition-all duration-200 hover:border-border-subtle hover:shadow-xl hover:shadow-black/30">
      {/* Preview */}
      <div className="p-3 pb-0">
        <div className="rounded-xl overflow-hidden">
          <TemplatePreview template={template} />
        </div>
      </div>

      {/* Card footer */}
      <div className="flex flex-col gap-2 p-4">
        <div className="h-15 overflow-hidden">
          <h3 className="text-sm font-semibold text-text-primary">{template.name}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{template.description}</p>
        </div>

        <Button
          size="sm"
          onClick={() => onImport(template)}
          className="w-full gap-1.5 bg-accent-primary text-bg-base hover:bg-accent-primary/90 text-xs font-medium h-8 rounded-lg transition-all hover:scale-[1.01]"
        >
          Import
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = useCallback(
    (template: CanvasTemplate) => {
      onImport(template);
      onClose();
    },
    [onImport, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-4xl lg:max-w-5xl p-0 rounded-3xl border border-border-default bg-bg-surface overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim">
              <LayoutTemplate className="h-4 w-4 text-accent-primary" />
            </div>
            <DialogTitle className="text-base font-semibold text-text-primary">
              Starter Templates
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6">
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              Choose a template to start your canvas. Importing a template will
              replace the current canvas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CANVAS_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onImport={handleImport}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
