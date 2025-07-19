#!/bin/bash

# Script to check the current state of gh-pages branch

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

echo "🔍 Checking gh-pages branch status"
echo "=================================="

# Check current branch
print_status "Current branch:"
git branch --show-current

# Check gh-pages branch status
print_status "gh-pages branch status:"
git log --oneline -3 origin/gh-pages

# Check if gh-pages worktree exists
print_status "Checking for existing gh-pages worktree:"
if git worktree list | grep gh-pages; then
    print_warning "gh-pages worktree exists"
    git worktree list
else
    print_success "No gh-pages worktree found"
fi

# Check if web-build exists
print_status "Checking web-build directory:"
if [ -d "ZenExoticsMobile/web-build" ]; then
    print_success "web-build directory exists"
    ls -la ZenExoticsMobile/web-build/ | head -5
else
    print_warning "web-build directory not found"
fi

# Check CNAME file
print_status "Checking CNAME file:"
if [ -f "CNAME" ]; then
    print_success "CNAME file exists: $(cat CNAME)"
else
    print_warning "CNAME file not found"
fi

# Check remote status
print_status "Remote status:"
git remote -v

echo "=================================="
print_status "gh-pages branch check completed" 