/*
 * Copyright 2021, Offchain Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-env node */
"use strict";

import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

import dotenv from "dotenv";
import {
  EthBridger,
  InboxTools,
  Erc20Bridger,
  L1Network,
  L2Network,
  getL1Network,
  getL2Network,
  addCustomNetwork,
} from "@arbitrum/sdk";
import { BigNumber, Signer } from "ethers";
import { AdminErc20Bridger } from "@arbitrum/sdk/dist/lib/assetBridger/erc20Bridger";
import { execSync } from "child_process";
import { Bridge__factory } from "@arbitrum/sdk/dist/lib/abi/factories/Bridge__factory";
import { RollupAdminLogic__factory } from "@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory";
import { deployErc20AndInit } from "./deployBridge";
import * as path from "path";
import * as fs from "fs";
import { ArbSdkError } from "@arbitrum/sdk/dist/lib/dataEntities/errors";
import { parseEther } from "ethers/lib/utils";
import { l1Networks, l2Networks } from "@arbitrum/sdk/dist/lib/dataEntities/networks";

dotenv.config();

export const config = {
  arbUrl: process.env["ARB_URL"] as string,
  ethUrl: process.env["ETH_URL"] as string,

  arbKey: process.env["ARB_KEY"] as string,
  ethKey: process.env["ETH_KEY"] as string,
};

function getDeploymentData(): string {
  const dockerNames = [
    'nitro_sequencer_1',
    'nitro-sequencer-1',
    'nitro-testnode-sequencer-1',
    'nitro-testnode_sequencer_1',
  ]
  for (const dockerName of dockerNames) {
    try {
      return execSync(
        'docker exec ' + dockerName + ' cat /config/deployment.json'
      ).toString()
    } catch {
      // empty on purpose
    }
  }
  throw new Error('nitro-testnode sequencer not found')
}

export const getCustomNetworks = async (
  l1Url: string,
  l2Url: string
): Promise<{
  l1Network: L1Network;
  l2Network: Omit<L2Network, "tokenBridge">;
}> => {
  const l1Provider = new JsonRpcProvider(l1Url);
  const l2Provider = new JsonRpcProvider(l2Url);
  const deploymentData = getDeploymentData();
  const parsedDeploymentData = JSON.parse(deploymentData) as {
    bridge: string;
    inbox: string;
    ["sequencer-inbox"]: string;
    rollup: string;
  };

  const rollup = RollupAdminLogic__factory.connect(parsedDeploymentData.rollup, l1Provider);
  const confirmPeriodBlocks = await rollup.confirmPeriodBlocks();

  const bridge = Bridge__factory.connect(parsedDeploymentData.bridge, l1Provider);
  const outboxAddr = await bridge.allowedOutboxList(0);

  const l1NetworkInfo = await l1Provider.getNetwork();
  const l2NetworkInfo = await l2Provider.getNetwork();

  const l1Network: L1Network = {
    blockTime: 10,
    chainID: l1NetworkInfo.chainId,
    explorerUrl: "",
    isCustom: true,
    name: "EthLocal",
    partnerChainIDs: [l2NetworkInfo.chainId],
    isArbitrum: false,
  };

  const l2Network: Omit<L2Network, "tokenBridge"> = {
    chainID: l2NetworkInfo.chainId,
    confirmPeriodBlocks: confirmPeriodBlocks.toNumber(),
    ethBridge: {
      bridge: parsedDeploymentData.bridge,
      inbox: parsedDeploymentData.inbox,
      outbox: outboxAddr,
      rollup: parsedDeploymentData.rollup,
      sequencerInbox: parsedDeploymentData["sequencer-inbox"],
    },
    explorerUrl: "",
    isArbitrum: true,
    isCustom: true,
    name: "ArbLocal",
    partnerChainID: l1NetworkInfo.chainId,
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    blockTime: 0.25,
    partnerChainIDs: []
  };
  return {
    l1Network,
    l2Network,
  };
};

export const setupNetworks = async (
  l1Deployer: Signer,
  l2Deployer: Signer,
  l1Url: string,
  l2Url: string
) => {
  const { l1Network, l2Network: coreL2Network } = await getCustomNetworks(l1Url, l2Url);
  const { l1: l1Contracts, l2: l2Contracts } = await deployErc20AndInit(
    l1Deployer,
    l2Deployer,
    coreL2Network.ethBridge.inbox
  );
  const l2Network: L2Network = {
    ...coreL2Network,
    tokenBridge: {
      l1CustomGateway: l1Contracts.customGateway.address,
      l1ERC20Gateway: l1Contracts.standardGateway.address,
      l1GatewayRouter: l1Contracts.router.address,
      l1MultiCall: l1Contracts.multicall.address,
      l1ProxyAdmin: l1Contracts.proxyAdmin.address,
      l1Weth: l1Contracts.weth.address,
      l1WethGateway: l1Contracts.wethGateway.address,

      l2CustomGateway: l2Contracts.customGateway.address,
      l2ERC20Gateway: l2Contracts.standardGateway.address,
      l2GatewayRouter: l2Contracts.router.address,
      l2Multicall: l2Contracts.multicall.address,
      l2ProxyAdmin: l2Contracts.proxyAdmin.address,
      l2Weth: l2Contracts.weth.address,
      l2WethGateway: l2Contracts.wethGateway.address,
    },
  };

  addCustomNetwork({
    customL1Network: l1Network,
    customL2Network: l2Network,
  });

  // also register the weth gateway
  // we add it here rather than in deployBridge because
  // we have access to an adminerc20bridger
  const adminErc20Bridger = new AdminErc20Bridger(l2Network);
  await (
    await (
      await adminErc20Bridger.setGateways(l1Deployer, l2Deployer.provider!, [
        {
          gatewayAddr: l2Network.tokenBridge.l1WethGateway,
          tokenAddr: l2Network.tokenBridge.l1Weth,
        },
      ])
    ).wait()
  ).waitForL2(l2Deployer);

  return {
    l1Network,
    l2Network,
  };
};

export const getSigner = (provider: JsonRpcProvider, key?: string) => {
  if (!key && !provider) throw new ArbSdkError("Provide at least one of key or provider.");
  if (key) return new Wallet(key).connect(provider);
  else return provider.getSigner(0);
};

export const testSetup = async (): Promise<{
  l1Network: L1Network;
  l2Network: L2Network;
  l1Signer: Signer;
  l2Signer: Signer;
  erc20Bridger: Erc20Bridger;
  ethBridger: EthBridger;
  adminErc20Bridger: AdminErc20Bridger;
  inboxTools: InboxTools;
  l1Deployer: Signer;
  l2Deployer: Signer;
}> => {
  const { l1Network, l1Provider, l2Network, l2Provider } = await getProvidersAndSetupNetworks({
    l1Url: config.ethUrl,
    l2Url: config.arbUrl,
    networkFilename: "files/local/network.json",
  });

  const l1Deployer = getSigner(l1Provider, config.ethKey);
  const l2Deployer = getSigner(l2Provider, config.arbKey);

  const seed = Wallet.createRandom();
  const l1Signer = seed.connect(l1Provider);
  const l2Signer = seed.connect(l2Provider);

  const erc20Bridger = new Erc20Bridger(l2Network);
  const adminErc20Bridger = new AdminErc20Bridger(l2Network);
  const ethBridger = new EthBridger(l2Network);
  const inboxTools = new InboxTools(l1Signer, l2Network);

  return {
    l1Signer,
    l2Signer,
    l1Network,
    l2Network,
    erc20Bridger,
    adminErc20Bridger,
    ethBridger,
    inboxTools,
    l1Deployer,
    l2Deployer,
  };
};

export const getProvidersAndSetupNetworks = async (setupConfig: {
  l1Url: string;
  l2Url: string;
  networkFilename?: string;
}): Promise<{
  l1Network: L1Network;
  l2Network: L2Network;
  l1Provider: JsonRpcProvider;
  l2Provider: JsonRpcProvider;
}> => {
  const l1Provider = new JsonRpcProvider(setupConfig.l1Url);
  const l2Provider = new JsonRpcProvider(setupConfig.l2Url);

  if (setupConfig.networkFilename) {
    // check if theres an existing network available
    const localNetworkFile = path.join(__dirname, "..", setupConfig.networkFilename);
    if (fs.existsSync(localNetworkFile)) {
      const { l1Network, l2Network } = JSON.parse(fs.readFileSync(localNetworkFile).toString()) as {
        l1Network: L1Network;
        l2Network: L2Network;
      };

      const existingL1Network = l1Networks[l1Network.chainID.toString()];
      const existingL2Network = l2Networks[l2Network.chainID.toString()];
      if (!existingL2Network) {
        addCustomNetwork({
          // dont add the l1 network if it's already been added
          customL1Network: existingL1Network ? undefined : l1Network,
          customL2Network: l2Network,
        });
      }

      return {
        l1Network,
        l1Provider,
        l2Network,
        l2Provider,
      };
    } else throw Error(`Missing file ${localNetworkFile}`);
  } else {
    return {
      l1Network: await getL1Network(l1Provider),
      l1Provider,
      l2Network: await getL2Network(l2Provider),
      l2Provider,
    };
  }
};

export const preFundAmount = parseEther("0.1");

const fund = async (signer: Signer, amount?: BigNumber, fundingKey?: string) => {
  const wallet = getSigner(signer.provider! as JsonRpcProvider, fundingKey);
  await (
    await wallet.sendTransaction({
      to: await signer.getAddress(),
      value: amount || preFundAmount,
    })
  ).wait();
};

export const fundL1 = async (l1Signer: Signer, amount?: BigNumber): Promise<void> => {
  await fund(l1Signer, amount, config.ethKey);
};

export const fundL2 = async (l2Signer: Signer, amount?: BigNumber): Promise<void> => {
  await fund(l2Signer, amount, config.arbKey);
};
