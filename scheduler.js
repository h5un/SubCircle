import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { createBundlerClient } from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import fs from 'node:fs'
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts'
import { getContract } from 'viem'
import { eip2612Permit } from './permit-helpers.js'
import { parseErc6492Signature } from 'viem'
import { encodePacked } from 'viem'
import dotenv from 'dotenv'

dotenv.config()

const INTERVAL = 60 * 1000 // Check every minute

// Initialize clients
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARBITRUM_SEPOLIA_RPC),
})

const ARBITRUM_SEPOLIA_BUNDLER = `https://public.pimlico.io/v2/${arbitrumSepolia.id}/rpc`
const bundlerClient = createBundlerClient({
  client,
  transport: http(ARBITRUM_SEPOLIA_BUNDLER),
})

// Constants
const ARBITRUM_SEPOLIA_USDC = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
const ARBITRUM_SEPOLIA_PAYMASTER = '0x31BE08D380A21fc740883c0BC434FcFc88740b58'
const MAX_GAS_USDC = 1000000n // 1 USDC

// Create contract instances
const subscriptionContract = getContract({
  client,
  address: process.env.SUBSCRIPTION_CONTRACT_ADDRESS,
  abi: [
    // Add subscription contract ABI here
  ],
})

async function processSubscriptions() {
  try {
    // Get all active subscriptions
    const activeSubscriptions = [] // TODO: Implement method to get active subscriptions

    for (const subscription of activeSubscriptions) {
      try {
        const owner = privateKeyToAccount(fs.readFileSync('.owner_private_key', 'utf8'))
        const account = await toEcdsaKernelSmartAccount({
          client,
          owners: [owner],
          version: '0.3.1',
        })

        // Execute payment
        const calls = [{
          to: subscriptionContract.address,
          abi: subscriptionContract.abi,
          functionName: 'executePayment',
          args: [subscription.subscriber],
        }]

        // Get permit signature
        const permitData = await eip2612Permit({
          token: usdc,
          chain: arbitrumSepolia,
          ownerAddress: account.address,
          spenderAddress: ARBITRUM_SEPOLIA_PAYMASTER,
          value: MAX_GAS_USDC,
        })

        const wrappedPermitSignature = await account.signTypedData(permitData)
        const { signature: permitSignature } = parseErc6492Signature(wrappedPermitSignature)

        // Prepare paymaster data
        const paymasterData = encodePacked(
          ['uint8', 'address', 'uint256', 'bytes'],
          [
            0n,
            ARBITRUM_SEPOLIA_USDC,
            MAX_GAS_USDC,
            permitSignature,
          ],
        )

        // Send transaction
        const userOpHash = await bundlerClient.sendUserOperation({
          account,
          calls,
          callGasLimit: 100000n,
          preVerificationGas: 100000n,
          verificationGasLimit: 500000n,
          paymaster: ARBITRUM_SEPOLIA_PAYMASTER,
          paymasterData,
          paymasterVerificationGasLimit: 500000n,
          paymasterPostOpGasLimit: 10000n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
        })

        console.log(`Processed subscription payment for ${subscription.subscriber}:`, userOpHash)
      } catch (error) {
        console.error(`Error processing subscription for ${subscription.subscriber}:`, error)
      }
    }
  } catch (error) {
    console.error('Error in processSubscriptions:', error)
  }
}

// Start the scheduler
setInterval(processSubscriptions, INTERVAL)
console.log('Subscription scheduler started') 