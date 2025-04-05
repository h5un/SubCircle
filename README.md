# SubCircle

SubCircle is a decentralized subscription payment platform built on Arbitrum, enabling gasless USDC transfer and subscription payments using Account Abstraction and Circle's Paymaster.

## Features

- **Gasless Transactions**: Users don't need ETH for gas fees
- **USDC Payments**: Stable and widely accepted payment method
- **Account Abstraction**: Enhanced user experience with smart accounts
- **Automated Payments**: Reliable subscription management
- **User-Friendly Interface**: Simple and intuitive UI

## Tech Stack

- **Smart Contracts**: Solidity + Foundry
- **Account Abstraction**: ERC-4337
- **Backend**: Node.js + Express
- **Blockchain**: Arbitrum Sepolia
- **Token**: Circle USDC

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Foundry (forge, anvil, cast)
- MetaMask or compatible Web3 wallet

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/subcircle.git
cd subcircle
```

2. Install dependencies:
```bash
make install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Deploy smart contracts:
```bash
make deploy
```

## Available Commands

- `make install` - Install all dependencies
- `make test` - Run all tests
- `make clean` - Clean build artifacts
- `make deploy` - Deploy smart contracts
- `make help` - Show this help message

## Project Structure

```
subcircle/
├── src/              # Smart contract source files
├── script/           # Deployment scripts
├── test/             # Test files
├── node/             # Backend scripts and utilities
├── .env.example      # Environment variables template
└── Makefile          # Project automation
```

## Smart Contracts

- **Subscription.sol**: Main contract handling subscription logic
- Deployed on Arbitrum Sepolia: `0x3Fe0bDf6f50b5506D583b93d2aCb3456Bd0267a3`

## Testing

```bash
# Run all tests
make test

# Run contract tests
make test-contracts

# Run backend tests
make test-backend
```

## Security

- **Smart Contract Security**:
  - Uses OpenZeppelin contracts for battle-tested implementations
  - Implements permit2 for gasless approvals
  - Follows best practices for secure smart contract development
  - Note: Smart contracts are currently unaudited. Use at your own risk.

## License

MIT

## ETH Taipei Hackathon 2025

This project was built during ETH Taipei Hackathon 2025. It aims to solve the recurring payment challenges in web3 by enabling gasless USDC subscriptions through Account Abstraction and Circle's Paymaster.