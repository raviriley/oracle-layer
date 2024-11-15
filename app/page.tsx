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
    position: { x: 0, y: 450 },
    data: { label: "AVS Validates & Processes JSON Response Off-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "E",
    position: { x: 0, y: 600 },
    data: { label: "Operators Update Oracle Data On-Chain" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "F",
    position: { x: 0, y: 750 },
    data: { label: "Smart Contracts & dApps Use Updated Oracle Data" },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
];

const initialEdges = [
  { id: "e1", source: "A", target: "B", animated: true },
  { id: "e2", source: "B", target: "C", animated: true },
  { id: "e3", source: "C", target: "D", animated: true },
  { id: "e4", source: "D", target: "E", animated: true },
  { id: "e5", source: "E", target: "F", animated: true },
  { id: "e6", source: "F", target: "C", animated: true, type: "smoothstep" },
];

export default function Landing() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Connection) =>
    setEdges((eds) => addEdge(params, eds));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1
        id="introduction"
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8"
      >
        Querying APIs to Generate Custom Oracles
      </h1>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Oracles are essential instruments built into blockchains that indicate
        off-chain data on-chain. In our project, we created a method for any
        user to deploy an oracle on Eigenlayer by providing the API.
      </p>

      <h2
        id="actively-validated-oracles"
        className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-12"
      >
        The Intersection of AVS and Custom Oracles
      </h2>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        By using Web Assembly System Interface (WASI), Actively Validated
        Services (AVS) bring a new level of sophistication to how custom oracles
        validate data, processing complex services off-chain. Through AVS,
        custom oracles undergo a validation mechanism that allows operators to
        verify the integrity of potential on-chain data. Oracles can deliver
        high-fidelity and reliable data feeds to dApps without an obligation to
        create and run their independent validator networks. Moreover, AVS
        supports creating decentralized oracle networks, which will integrate
        real-world data into blockchain ecosystems. The combination of AVS and
        authorized oracles patches mitigates vulnerabilities by making the
        connection between oracle services and smart contracts without
        complicating their communication process. This makes them much more
        secure for broader use in a chain-based environment.
      </p>

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8">
        Advantages of AVS Integration
      </h3>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <strong>Advanced-Data Validation Off-chain</strong>: AVS can perform
          smart checks and calculations on off-chain data fetched from
          third-party APIs before finally submitting to the chain.
        </li>
        <li>
          <strong>Enhance Efficiency</strong>: Offload complex processing from
          the blockchain to an AVS, optimizing resource use and lowering
          on-chain gas costs.
        </li>
        <li>
          <strong>Enhanced Security</strong>: AVS can prevent wrong or malicious
          data from entering the system and thus corput the smart contracts
          with false information.
        </li>
        <li>
          <strong>Enhanced Flexibility</strong>: Oracles can be customized to
          support different types of data formats and interfaces with widely
          disparate APIs for a variety of use cases.
        </li>
      </ul>

      <h3
        id="network-participants"
        className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8"
      >
        Network Participants
      </h3>

      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold">Role</th>
              <th className="border px-4 py-2 text-left font-bold">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Restakers</td>
              <td className="border px-4 py-2">
                Earn an additional yield by using EigenLayer to stake ETH and
                help secure these oracles, in turn enhancing the reliability of
                the system.
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Operators</td>
              <td className="border px-4 py-2">
                Operate off-chain infrastructure that pulls and processes
                external data through AVS. Operators must validate data using
                the provided requirements and submit these confirmed values to
                the on-chain oracle.
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Developers</td>
              <td className="border px-4 py-2">
                Developers configure the custom oracle parameters (e.g., API
                endpoints, data processing logic) and design the validation
                rules implemented by AVS.
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">End Users</td>
              <td className="border px-4 py-2">
                Decentralized applications and the users of those applications
                need accurate, tested data to execute functions from financial
                transactions to predictions.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="flow-chart" className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Oracle Creation Flow</h3>

        <div className="h-[800px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      <div id="conclusion" className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Purpose</h3>

        <p className="mb-4">
          The incorporation of Actively Validated Services (AVS) within a custom
          oracle enhances the quality and trustiness of off-chain data on-chain.
          AVS supports off-chain validation and processing for indisputable
          facts, giving smart contracts concrete data that passes the test of
          trust, improving security and efficiency for decentralized
          applications. Restakers, operators, developers and end-users all
          benefit from this system working together seamlessly to create a
          stronger and more flexible blockchain data ecosystem.
        </p>

        <p className="mb-4">
          Future enhancements include enabling the execution of arbitrary
          WASM-compiled code off-chain, further expanding the capabilities of
          AVS-powered oracles. This would allow developers to implement highly
          specialized data processing logic and complex validation
          methodologies, ensuring the data on-chain remains both dynamic and
          trustworthy for a wide range of blockchain applications.
        </p>
      </div>

      <div id="personal-experience" className="mt-12">
        <h3 className="text-2xl font-bold mb-4">
          Personal Experience and Feedback
        </h3>
        <p className="mb-4">
          In order to deploy AVS, we had to access the Layer testnet but while
          implementing curl commands with the RPC links, we encountered a 504
          error, entailing that our request could not be completed due to the
          lack of a timely response to our server. This was due to one of the
          Layer repos having outdated urls for the curl commands.
        </p>
        <p className="mb-4">
          Another roadblock we encountered was while we were trying to access
          the faucet for funds to deploy on testnet. We used the Layer docs to
          implement the Faucet API function code but upon using it, we found out
          that the API in the Layer SDK does not have funds and that the only
          way to access faucet funds was through a game on a telegram bot. The
          docs were misleading for this reason.
        </p>
        <p className="mb-4">
          We also had an issue passing multiple environment variables using the
          CLI when deploying a WASI component. There is not any specific
          documentation regarding this exact syntax.
        </p>
        <p className="mb-4">
          Overall, through our developer experience, we enjoyed building with
          Layer and integrating AVS into our project. We do believe that our
          experience and the experiences of other developers would be improved
          if the repos and docs had consistent links and functions that would
          allow us to access the testnet easier. Additionally, if the telegram
          bot is the preferred method to access faucet funds, we believe that it
          would helpful if the information for that method was provided on the
          docs.
        </p>
      </div>
    </div>
  );
}
