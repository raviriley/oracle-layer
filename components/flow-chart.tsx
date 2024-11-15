"use client";

import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Connection,
  BackgroundVariant,
  NodeProps,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatedSvgEdge } from "./animated-svg-edge";
import { ReactNode } from "react";

const CustomNode = ({ data }: NodeProps) => {
  return (
    <div className="p-2.5 text-xl border bg-card text-card-foreground rounded">
      {data.label as ReactNode}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: "A",
    type: "custom",
    position: { x: 0, y: 0 },
    data: { label: "User Configures Request & Response Parameters" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "B",
    type: "custom",
    position: { x: 0, y: 150 },
    data: {
      label: "API Compiles and Deploys On-Chain Oracle",
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "C",
    type: "custom",
    position: { x: 0, y: 300 },
    data: { label: "Operators Monitor & Fetch Data" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "D",
    type: "custom",
    position: { x: -75, y: 450 },
    data: { label: "AVS Validates & Processes JSON Response Off-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "E",
    type: "custom",
    position: { x: -75, y: 600 },
    data: { label: "Operators Update Oracle Data On-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "F",
    type: "custom",
    position: { x: 75, y: 750 },
    data: { label: "Smart Contracts & dApps Use Updated Oracle Data" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
];

const initialEdges = [
  { id: "e1", source: "A", target: "B", animated: true, type: "animated" },
  { id: "e2", source: "B", target: "C", animated: true, type: "animated" },
  { id: "e3", source: "C", target: "D", animated: true, type: "animated" },
  { id: "e4", source: "D", target: "E", animated: true, type: "animated" },
  { id: "e5", source: "E", target: "F", animated: true, type: "animated" },
  { id: "e6", source: "F", target: "C", animated: true, type: "animated" },
];

export default function FlowChart() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Connection) =>
    setEdges((eds) => addEdge(params, eds));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      edgeTypes={{ animated: AnimatedSvgEdge }}
      nodeTypes={nodeTypes}
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
}
