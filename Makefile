.PHONY: all install test clean deploy help

# Default target
all: install test

# Install all dependencies
install:
	@echo "Installing dependencies..."
	npm install
	forge install
	@echo "Dependencies installed successfully"

# Run all tests
test: test-contracts test-backend

# Run smart contract tests
test-contracts:
	@echo "Running smart contract tests..."
	forge test -vv

# Run backend tests
test-backend:
	@echo "Running backend tests..."
	npm test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf build
	rm -rf cache
	rm -rf out
	rm -rf .env
	@echo "Clean completed"

# Deploy smart contracts
deploy:
	@echo "Deploying smart contracts..."
	forge script script/DeploySubscription.s.sol:DeploySubscription --rpc-url $(ARBITRUM_SEPOLIA_RPC) --broadcast
	@echo "Deployment completed"

# Help
help:
	@echo "Available targets:"
	@echo "  make install  - Install all dependencies"
	@echo "  make test    - Run all tests"
	@echo "  make clean   - Clean build artifacts"
	@echo "  make deploy  - Deploy smart contracts"
	@echo "  make help    - Show this help message" 