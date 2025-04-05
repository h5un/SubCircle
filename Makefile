.PHONY: all install test clean deploy start-backend start-frontend start

# Default target
all: install test

# Install all dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cd frontend && npm install
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
	rm -rf frontend/node_modules
	rm -rf build
	rm -rf frontend/build
	rm -rf cache
	rm -rf out
	@echo "Clean completed"

# Deploy smart contracts
deploy:
	@echo "Deploying smart contracts..."
	forge script script/DeploySubscription.s.sol:DeploySubscription --rpc-url $(ARBITRUM_SEPOLIA_RPC) --broadcast
	@echo "Deployment completed"

# Start backend server
start-backend:
	@echo "Starting backend server..."
	npm start

# Start frontend development server
start-frontend:
	@echo "Starting frontend server..."
	cd frontend && npm start

# Start both servers
start:
	@echo "Starting all servers..."
	$(MAKE) start-backend & $(MAKE) start-frontend

# Setup development environment
setup: install
	@echo "Setting up development environment..."
	cp -n .env.example .env || true
	@echo "Setup completed. Please update .env with your configuration"

# Help
help:
	@echo "Available targets:"
	@echo "  make install        - Install all dependencies"
	@echo "  make test          - Run all tests"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make deploy        - Deploy smart contracts"
	@echo "  make start         - Start both backend and frontend servers"
	@echo "  make start-backend - Start only backend server"
	@echo "  make start-frontend- Start only frontend server"
	@echo "  make setup         - Initial project setup"
	@echo "  make help          - Show this help message" 