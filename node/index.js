import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { createBundlerClient } from 'viem/account-abstraction'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import fs from 'node:fs'
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts'
import { getContract, erc20Abi, formatUnits } from 'viem'
import { eip2612Abi } from './permit-helpers.js'
import { parseErc6492Signature } from 'viem'
import { eip2612Permit } from './permit-helpers.js'
import { encodePacked } from 'viem'
import { hexToBigInt, encodeFunctionData, parseAbi } from 'viem'
import { createRequire } from 'module'
import { watchEvent } from 'viem/actions'
import { log } from 'node:console'

const require = createRequire(import.meta.url)
const subscriptionJson = require('../out/Subscription.sol/Subscription.json')
const subscriptionAbi = subscriptionJson.abi

// Create and populate the code entrypoint. 
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
})

const block = await client.getBlockNumber()
console.log('Connected to network, latest block is', block)

// Create an RPC client to connect to the bundler.
const ARBITRUM_SEPOLIA_BUNDLER = `https://public.pimlico.io/v2/${arbitrumSepolia.id}/rpc`

const bundlerClient = createBundlerClient({
  client,
  transport: http(ARBITRUM_SEPOLIA_BUNDLER),
})

// Create or load an externally owned account (EOA) 
// to serve as the signer for the smart wallet.
const owner = privateKeyToAccount(
    fs.existsSync('.owner_private_key')
      ? fs.readFileSync('.owner_private_key', 'utf8')
      : (() => {
          const privateKey = generatePrivateKey()
          fs.writeFileSync('.owner_private_key', privateKey)
          return privateKey
        })(),
  )

//   Create the smart wallet.
const account = await toEcdsaKernelSmartAccount({
    client,
    owners: [owner],
    version: '0.3.1',
  })
  
  console.log('Owner address:', owner.address)
  console.log('Smart wallet address:', account.address)

//   create the instance of the USDC
const ARBITRUM_SEPOLIA_USDC = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'

const usdc = getContract({
  client,
  address: ARBITRUM_SEPOLIA_USDC,
  abi: [...erc20Abi, ...eip2612Abi],
})

const usdcBalance = await usdc.read.balanceOf([account.address])

if (usdcBalance === 0n) {
  console.log(
    'Visit https://faucet.circle.com/ to fund the smart wallet address above ' +
      '(not the owner address) with some USDC on Arbitrum Sepolia, ' +
      'then return here and run the script again.',
  )
  process.exit()
} else {
  console.log(`Smart wallet has ${formatUnits(usdcBalance, 6)} USDC`)
}

// Connect to the contract 
const SUBSCRIPTION_CONTRACT = '0x9D0B6961A18Eef1E4F2741c1f09d50937242cDA7'; // The Timer
const subscriptionContract = getContract({
  client,
  address: SUBSCRIPTION_CONTRACT,
  abi: subscriptionAbi
})

// Listen to performUpkeep
watchEvent(client, {
  address: SUBSCRIPTION_CONTRACT,
  abi: subscriptionAbi,
  eventName: 'Ping',
  onLogs: async (logs) => {
    console.log('Ping Received', logs)
    await triggerPerformUpkeep()
  }
})

// import the helper and sign the permit
const ARBITRUM_SEPOLIA_PAYMASTER = '0x31BE08D380A21fc740883c0BC434FcFc88740b58'

// The max amount allowed to be paid per user op
const MAX_GAS_USDC = 1000000n // 1 USDC

console.log('Constructing and signing permit...')

const permitData = await eip2612Permit({
  token: usdc,
  chain: arbitrumSepolia,
  ownerAddress: account.address,
  spenderAddress: ARBITRUM_SEPOLIA_PAYMASTER,
  value: MAX_GAS_USDC,
})

const wrappedPermitSignature = await account.signTypedData(permitData)
const { signature: permitSignature } = parseErc6492Signature(
  wrappedPermitSignature,
)

console.log('Permit signature:', permitSignature)

// Construct the user op
function sendUSDC(to, amount) {
    return {
      to: usdc.address,
      abi: usdc.abi,
      functionName: 'transfer',
      args: [to, amount],
    }
  }

  // send or subscribe
  const mode = process.argv[2] ?? 'send' // default to send 
  const recipient = mode === 'send'
  ? '0x61e9bD39B1c4A08b1Acf6050189De1dc05869869'
  : '0xYOUR_DEPLOYED_CONTRACT';

  // const recipient = privateKeyToAccount(generatePrivateKey()).address
  const calls = [sendUSDC(recipient, 10000n)] // $0.01 USDC
  
  const paymaster = ARBITRUM_SEPOLIA_PAYMASTER
  const paymasterData = encodePacked(
    ['uint8', 'address', 'uint256', 'bytes'],
    [
      0n, // Reserved for future use
      usdc.address, // Token address
      MAX_GAS_USDC, // Max spendable gas in USDC
      permitSignature, // EIP-2612 permit signature
    ],
  )
// const paymasterData = "0x"

//   Estimate the gas fees for the post operation of the user op.
const additionalGasCharge = hexToBigInt(
    (
      await client.call({
        to: paymaster,
        data: encodeFunctionData({
          abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
          functionName: 'additionalGasCharge',
        }),
      })
    ).data,
  )
  
  console.log(
    'Additional gas charge (paymasterPostOpGasLimit):',
    additionalGasCharge,
  )

//   Estimate the priority fee for the user op. 
const { standard: fees } = await bundlerClient.request({
    method: 'pimlico_getUserOperationGasPrice',
  })
  
  const maxFeePerGas = hexToBigInt(fees.maxFeePerGas)
  const maxPriorityFeePerGas = hexToBigInt(fees.maxPriorityFeePerGas)
  
  console.log('Max fee per gas:', maxFeePerGas)
  console.log('Max priority fee per gas:', maxPriorityFeePerGas)
  console.log('Estimating user op gas limits...')

  const callGasLimit = 100000n
  const preVerificationGas = 100000n
  const verificationGasLimit = 500000n
  const paymasterPostOpGasLimit = 10000n
  const paymasterVerificationGasLimit = 500000n

  
  console.log('Call gas limit:', callGasLimit)
  console.log('Pre-verification gas:', preVerificationGas)
  console.log('Verification gas limit:', verificationGasLimit)
  console.log('Paymaster post op gas limit:', paymasterPostOpGasLimit)
  console.log('Paymaster verification gas limit:', paymasterVerificationGasLimit)

//   Submit the user op. 
console.log('Sending user op...')

const userOpHash = await bundlerClient.sendUserOperation({
  account,
  calls,
  callGasLimit,
  preVerificationGas,
  verificationGasLimit,
  paymaster,
  paymasterData,
  paymasterVerificationGasLimit,
  // Make sure that `paymasterPostOpGasLimit` is always at least
  // `additionalGasCharge`, regardless of what the bundler estimated.
  paymasterPostOpGasLimit: Math.max(
    Number(paymasterPostOpGasLimit),
    Number(additionalGasCharge),
  ),
  maxFeePerGas,
  maxPriorityFeePerGas,
})

console.log('Submitted user op:', userOpHash)
console.log('Waiting for execution...')

const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
  hash: userOpHash,
})

console.log('Done! Details:')
console.log('  success:', userOpReceipt.success)
console.log('  actualGasUsed:', userOpReceipt.actualGasUsed)
console.log(
  '  actualGasCost:',
  formatUnits(userOpReceipt.actualGasCost, 18),
  'ETH',
)
console.log('  transaction hash:', userOpReceipt.receipt.transactionHash)
console.log('  transaction gasUsed:', userOpReceipt.receipt.gasUsed)

const usdcBalanceAfter = await usdc.read.balanceOf([account.address])
const usdcConsumed = usdcBalance - usdcBalanceAfter

console.log(' Total USDC deducted from smart wallet:', formatUnits(usdcConsumed, 6))

// We need to manually exit the process, since viem leaves some promises on the
// event loop for features we're not using.
// process.exit()


async function triggerPerformUpkeep() {
  const calls = [{
    to: subscriptionContract.address,
    abi: subscriptionContract.abi,
    functionName: 'performUpkeep',
    args: ['0x'], // 根據合約定義無參數
  }]

  console.log("PerformUpkeep Triggered.")
  // 下面這段邏輯複製你原本的 userOp 建構、permit 簽名、sendUserOperation 的流程即可
  // 包括 permit、paymasterData、estimate gas、send user op...
  const recipient = subscriptionContract.address

  const paymaster = ARBITRUM_SEPOLIA_PAYMASTER
  const paymasterData = encodePacked(
    ['uint8', 'address', 'uint256', 'bytes'],
    [
      0n, // Reserved for future use
      usdc.address, // Token address
      MAX_GAS_USDC, // Max spendable gas in USDC
      permitSignature, // EIP-2612 permit signature
    ],
  )
// const paymasterData = "0x"

//   Estimate the gas fees for the post operation of the user op.
const additionalGasCharge = hexToBigInt(
    (
      await client.call({
        to: paymaster,
        data: encodeFunctionData({
          abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
          functionName: 'additionalGasCharge',
        }),
      })
    ).data,
  )
  
  console.log(
    'Additional gas charge (paymasterPostOpGasLimit):',
    additionalGasCharge,
  )

//   Estimate the priority fee for the user op. 
const { standard: fees } = await bundlerClient.request({
    method: 'pimlico_getUserOperationGasPrice',
  })
  
  const maxFeePerGas = hexToBigInt(fees.maxFeePerGas)
  const maxPriorityFeePerGas = hexToBigInt(fees.maxPriorityFeePerGas)
  
  console.log('Max fee per gas:', maxFeePerGas)
  console.log('Max priority fee per gas:', maxPriorityFeePerGas)
  console.log('Estimating user op gas limits...')

  const callGasLimit = 100000n
  const preVerificationGas = 100000n
  const verificationGasLimit = 500000n
  const paymasterPostOpGasLimit = 10000n
  const paymasterVerificationGasLimit = 500000n

  
  console.log('Call gas limit:', callGasLimit)
  console.log('Pre-verification gas:', preVerificationGas)
  console.log('Verification gas limit:', verificationGasLimit)
  console.log('Paymaster post op gas limit:', paymasterPostOpGasLimit)
  console.log('Paymaster verification gas limit:', paymasterVerificationGasLimit)

//   Submit the user op. 
console.log('Sending user op...')

const userOpHash = await bundlerClient.sendUserOperation({
  account,
  calls,
  callGasLimit,
  preVerificationGas,
  verificationGasLimit,
  paymaster,
  paymasterData,
  paymasterVerificationGasLimit,
  // Make sure that `paymasterPostOpGasLimit` is always at least
  // `additionalGasCharge`, regardless of what the bundler estimated.
  paymasterPostOpGasLimit: Math.max(
    Number(paymasterPostOpGasLimit),
    Number(additionalGasCharge),
  ),
  maxFeePerGas,
  maxPriorityFeePerGas,
})

console.log('Submitted user op:', userOpHash)
console.log('Waiting for execution...')

const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
  hash: userOpHash,
})

console.log('Done! Details:')
console.log('  success:', userOpReceipt.success)
console.log('  actualGasUsed:', userOpReceipt.actualGasUsed)
console.log(
  '  actualGasCost:',
  formatUnits(userOpReceipt.actualGasCost, 18),
  'ETH',
)
console.log('  transaction hash:', userOpReceipt.receipt.transactionHash)
console.log('  transaction gasUsed:', userOpReceipt.receipt.gasUsed)

const usdcBalanceAfter = await usdc.read.balanceOf([account.address])
const usdcConsumed = usdcBalance - usdcBalanceAfter

console.log(' Total USDC deducted from smart wallet:', formatUnits(usdcConsumed, 6))
}
