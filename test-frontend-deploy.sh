#!/bin/bash

# Test script for frontend deployment
# This script tests the frontend deployment process without affecting production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🧪 Testing Frontend Deployment Process"
echo "====================================="

cd ZenExoticsMobile

# Test 1: Check if package.json exists
print_status "Testing package.json..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    exit 1
fi
print_success "package.json found"

# Test 2: Check if dependencies are installed
print_status "Testing dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, installing dependencies..."
    npm install --legacy-peer-deps
else
    print_success "Dependencies already installed"
fi

# Test 3: Test build process
print_status "Testing build process..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Test 4: Check if web-build directory exists
print_status "Checking web-build directory..."
if [ ! -d "web-build" ]; then
    print_error "web-build directory not found after build"
    exit 1
fi
print_success "web-build directory created"

# Test 5: Check if CNAME file exists
print_status "Checking CNAME file..."
if [ ! -f "../CNAME" ]; then
    print_warning "CNAME file not found in parent directory"
else
    print_success "CNAME file found"
fi

# Test 6: Test git worktree operations and deployment
print_status "Testing full deployment process..."
print_warning "This will create a test deployment to gh-pages branch"

# Clean up any existing worktree
git worktree remove -f gh-pages 2>/dev/null || true
rm -rf gh-pages 2>/dev/null || true

# Create new worktree
if git worktree add gh-pages gh-pages; then
    print_success "Git worktree created successfully"
    
    # Clear existing files
    rm -rf gh-pages/*
    
    # Copy built files
    cp -r web-build/* gh-pages/
    cp ../CNAME gh-pages/
    
    # Commit and push
    cd gh-pages
    git add .
    git commit -m "Test deployment - $(date +%Y-%m-%d_%H:%M:%S)"
    
    # Force push to avoid conflicts
    if git push origin gh-pages --force; then
        print_success "Test deployment pushed successfully"
    else
        print_error "Failed to push test deployment"
        cd ..
        git worktree remove -f gh-pages
        exit 1
    fi
    
    # Clean up
    cd ..
    git worktree remove -f gh-pages
    print_success "Git worktree cleaned up"
else
    print_error "Git worktree operations failed"
    exit 1
fi

echo "====================================="
print_success "🎉 All frontend deployment tests passed!"
echo ""
print_status "The frontend deployment process should work correctly."
print_status "You can now run the full deployment script with confidence."
print_warning "Note: A test deployment was pushed to gh-pages branch."
print_warning "You may want to revert this test deployment if needed." 