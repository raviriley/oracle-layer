export default function Landing() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
        Querying APIs to Generate Custom Oracles
      </h1>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Oracles are essential instruments built into blockchains that indicate
        off-chain data on-chain. In our experiment, we created an oracle that
        any user can deploy on Eigenlayer easily by entering the API and what
        data they want to extract.
      </p>

      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-12">
        The Intersection of AVS and Custom Oracles
      </h2>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        By using the WebAssembly System Interface (WASI), Actively Validated
        Services (AVS) bring a new level of sophistication to how custom oracles
        validate data, processing complex services off-chain. This means that
        oracles only bring to-chain data, which is heavily processed and
        established on-chain as reliable. Through AVS, custom oracles can access
        Ethereum's strong security litmus through protocols like EigenLayer.
        Using this mechanism, oracles can then restake ETH, thus securing their
        operation with Ethereum's socio-economic security. As a result, oracles
        can deliver high-fidelity and reliable data feeds to dApps without an
        obligation to create and run their independent validator networks.
        Moreover, AVS supports the creation of decentralized oracle networks,
        which will integrate real-world data into blockchain ecosystems. An
        example of this is Eoracle, which is an oracle network built on
        EigenLayer within the Ethereum ecosystem that provides a way for dApps
        to access off-chain data transparently and securely. In conclusion, the
        combination of AVS and authorized oracles patches mitigates
        vulnerabilities by making the connection between oracle services and
        smart contracts without complicating their communication process. This
        makes them much more secure for broader use in a chain environment.
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
          data from entering the system and thus corrupting the smart contracts
          with false information.
        </li>
        <li>
          <strong>Enhanced Flexibility</strong>: Oracles can be customized to
          support different types of data formats and interfaces with widely
          disparate APIs for a variety of use cases.
        </li>
      </ul>

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8">
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

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Conclusion</h3>

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
    </div>
  );
}
