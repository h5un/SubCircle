# SubCircle

SubCircle is a decentralized subscription payment platform built on Arbitrum, enabling gasless USDC subscription payments using Account Abstraction and Circle's USDC.

## 🌟 Features

- **Gasless Transactions**: Users don't need ETH for gas fees
- **USDC Payments**: Stable and widely accepted payment method
- **Account Abstraction**: Enhanced user experience with smart accounts
- **Automated Payments**: Reliable subscription management
- **User-Friendly Interface**: Simple and intuitive UI

## 🛠 Tech Stack

- **Smart Contracts**: Solidity + Foundry
- **Account Abstraction**: ERC-4337
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Blockchain**: Arbitrum Sepolia
- **Token**: Circle USDC

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/subcircle.git
cd subcircle
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Foundry dependencies
forge install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers:
```bash
# Start backend server
npm start

# Start frontend development server
cd frontend
npm start
```

## 📝 Smart Contracts

- **Subscription.sol**: Main contract handling subscription logic
- Deployed on Arbitrum Sepolia: `0x3Fe0bDf6f50b5506D583b93d2aCb3456Bd0267a3`

## 🧪 Testing

```bash
# Run contract tests
forge test

# Run backend tests
npm test
```

## 🔒 Security

- Smart contract audited by [Pending]
- Uses OpenZeppelin contracts
- Implements permit2 for gasless approvals

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 ETH Taipei Hackathon 2024

This project was built during ETH Taipei Hackathon 2024. It aims to solve the problem of recurring payments in web3 by leveraging Account Abstraction and Circle's USDC. 