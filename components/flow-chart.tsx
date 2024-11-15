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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatedSvgEdge } from "./animated-svg-edge";

const initialNodes = [
  {
    id: "A",
    position: { x: 0, y: 0 },
    data: { label: "User Configures Request & Response Parameters" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "B",
    position: { x: 0, y: 150 },
    data: { label: "Oracle Configuration Deployed On-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "C",
    position: { x: 0, y: 300 },
    data: { label: "Operators Monitor & Fetch Data" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "D",
    position: { x: -75, y: 450 },
    data: { label: "AVS Validates & Processes JSON Response Off-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "E",
    position: { x: -75, y: 600 },
    data: { label: "Operators Update Oracle Data On-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "F",
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
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
}
