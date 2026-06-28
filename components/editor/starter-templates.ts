import { CanvasNode, CanvasEdge, NODE_COLORS } from "@/types/canvas";
import { MarkerType } from "@xyflow/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// ─── Palette shortcuts ────────────────────────────────────────────────────────

const C = NODE_COLORS;
const neutral = C[0]; // #1F1F1F / #EDEDED
const blue = C[1];    // #10233D / #52A8FF
const purple = C[2];  // #2E1938 / #BF7AF0
const orange = C[3];  // #331B00 / #FF990A
const red = C[4];     // #3C1618 / #FF6166
const green = C[6];   // #0F2E18 / #62C073
const teal = C[7];    // #062822 / #0AC7B4

// ─── Helpers ──────────────────────────────────────────────────────────────────

function node(
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: (typeof NODE_COLORS)[number],
  shape: CanvasNode["data"]["shape"] = "rectangle"
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color: color.fill, textColor: color.text, shape },
    style: { width: `${width}px`, height: `${height}px` },
  } as CanvasNode;
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label: label ?? "" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "rgba(248,250,252,0.35)",
      width: 16,
      height: 16,
    },
  } as CanvasEdge;
}

// ─── Template 1 — Microservices ───────────────────────────────────────────────

const microservicesTemplate: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API gateway routing to independent services backed by isolated databases.",
  nodes: [
    node("client",       "Client",         300,  20,  120, 50,  neutral, "pill"),
    node("gateway",      "API Gateway",    270,  120, 180, 56,  blue,    "rectangle"),
    node("auth",         "Auth Service",    60,  240, 140, 56,  purple,  "rectangle"),
    node("orders",       "Order Service",  250,  240, 140, 56,  orange,  "rectangle"),
    node("products",     "Product Service",440,  240, 140, 56,  green,   "rectangle"),
    node("db-auth",      "Auth DB",         60,  360, 120, 52,  purple,  "cylinder"),
    node("db-orders",    "Orders DB",      250,  360, 120, 52,  orange,  "cylinder"),
    node("db-products",  "Products DB",    440,  360, 120, 52,  green,   "cylinder"),
  ],
  edges: [
    edge("e-c-g",   "client",   "gateway"),
    edge("e-g-a",   "gateway",  "auth",     "authenticate"),
    edge("e-g-o",   "gateway",  "orders",   "route"),
    edge("e-g-p",   "gateway",  "products", "route"),
    edge("e-a-db",  "auth",     "db-auth"),
    edge("e-o-db",  "orders",   "db-orders"),
    edge("e-p-db",  "products", "db-products"),
  ],
};

// ─── Template 2 — CI/CD Pipeline ─────────────────────────────────────────────

const cicdTemplate: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "Automated build, test, and deploy pipeline from commit to production.",
  nodes: [
    node("repo",     "Git Repo",      20,  80,  130, 52,  neutral,  "rectangle"),
    node("ci",       "CI Server",    200,  80,  130, 52,  blue,     "rectangle"),
    node("build",    "Build",        380,  20,  120, 52,  orange,   "pill"),
    node("test",     "Test Suite",   380, 110,  120, 52,  red,      "pill"),
    node("registry", "Registry",     560,  80,  130, 52,  purple,   "cylinder"),
    node("staging",  "Staging",      560, 200,  130, 52,  teal,     "rectangle"),
    node("gate",     "Approval",     380, 200,  120, 60,  orange,   "diamond"),
    node("prod",     "Production",   560, 310,  130, 52,  green,    "rectangle"),
  ],
  edges: [
    edge("e-r-ci",   "repo",     "ci",       "push"),
    edge("e-ci-b",   "ci",       "build"),
    edge("e-ci-t",   "ci",       "test"),
    edge("e-b-reg",  "build",    "registry", "push image"),
    edge("e-reg-st", "registry", "staging",  "deploy"),
    edge("e-st-g",   "staging",  "gate",     "e2e pass"),
    edge("e-g-pr",   "gate",     "prod",     "approved"),
  ],
};

// ─── Template 3 — Event-Driven System ────────────────────────────────────────

const eventDrivenTemplate: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Producers publish events to a message bus; consumers process them independently.",
  nodes: [
    node("web",       "Web App",        60,  160, 130, 52,  blue,     "rectangle"),
    node("mobile",    "Mobile App",      60,  260, 130, 52,  purple,   "rectangle"),
    node("bus",       "Message Bus",    270,  200, 140, 60,  orange,   "hexagon"),
    node("notif",     "Notification",   470,  80,  140, 52,  teal,     "rectangle"),
    node("analytics", "Analytics",      470,  200, 140, 52,  green,    "rectangle"),
    node("billing",   "Billing",        470,  320, 140, 52,  red,      "rectangle"),
    node("dw",        "Data Warehouse", 670,  200, 140, 52,  neutral,  "cylinder"),
  ],
  edges: [
    edge("e-w-bus",   "web",      "bus",       "event"),
    edge("e-m-bus",   "mobile",   "bus",       "event"),
    edge("e-bus-n",   "bus",      "notif",     "notify"),
    edge("e-bus-a",   "bus",      "analytics", "track"),
    edge("e-bus-b",   "bus",      "billing",   "charge"),
    edge("e-a-dw",    "analytics","dw",        "batch"),
  ],
};

// ─── Template 4 — Serverless ─────────────────────────────────────────────────

const serverlessTemplate: CanvasTemplate = {
  id: "serverless",
  name: "Serverless",
  description:
    "Function-based backend triggered by API gateway with managed storage and auth.",
  nodes: [
    node("client",  "Client",        290,  20,  120, 50,  neutral,  "pill"),
    node("gateway", "API Gateway",   260,  120, 180, 56,  blue,     "rectangle"),
    node("fn-auth", "Auth Lambda",    80,  240, 140, 52,  purple,   "rectangle"),
    node("fn-data", "Data Lambda",   260,  240, 140, 52,  orange,   "rectangle"),
    node("fn-proc", "Process Lambda",440,  240, 140, 52,  green,    "rectangle"),
    node("cognito", "Auth Provider",  80,  360, 130, 52,  purple,   "cylinder"),
    node("dynamo",  "DynamoDB",      260,  360, 130, 52,  orange,   "cylinder"),
    node("s3",      "S3 Bucket",     440,  360, 130, 52,  teal,     "cylinder"),
  ],
  edges: [
    edge("e-c-g",  "client",  "gateway"),
    edge("e-g-fa", "gateway", "fn-auth"),
    edge("e-g-fd", "gateway", "fn-data"),
    edge("e-g-fp", "gateway", "fn-proc"),
    edge("e-fa-cg","fn-auth", "cognito"),
    edge("e-fd-dy","fn-data", "dynamo"),
    edge("e-fp-s3","fn-proc", "s3"),
  ],
};

// ─── Exported array ───────────────────────────────────────────────────────────

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservicesTemplate,
  cicdTemplate,
  eventDrivenTemplate,
  serverlessTemplate,
];
