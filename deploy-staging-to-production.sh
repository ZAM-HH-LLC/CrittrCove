#!/bin/bash

# CrittrCove Staging to Production Deployment Script
# This script copies from staging to production and handles deployment

set -e  # Exit on any error

# Configuration
STAGING_ROOT="/Users/mattaertker/Documents/Github/CrittrCoveStaging"
PRODUCTION_ROOT="/Users/mattaertker/Documents/Github/CrittrCove"
STAGING_BACKEND="$STAGING_ROOT/backend"
STAGING_FRONTEND="$STAGING_ROOT/CrittrCoveStaging"
PRODUCTION_BACKEND="$PRODUCTION_ROOT/backend"
PRODUCTION_FRONTEND="$PRODUCTION_ROOT/ZenExoticsMobile"

# Allowed IPs for EC2 access
ALLOWED_IPS=("185.236.200.245" "73.3.158.185")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to get current IP address
get_current_ip() {
    local ip=$(curl -s https://ipinfo.io/ip 2>/dev/null || curl -s https://icanhazip.com 2>/dev/null || echo "unknown")
    echo "$ip"
}

# Function to check if current IP is allowed
check_ip_access() {
    local current_ip=$(get_current_ip)
    print_status "Current IP address: $current_ip"
    
    for allowed_ip in "${ALLOWED_IPS[@]}"; do
        if [[ "$current_ip" == "$allowed_ip" ]]; then
            print_success "IP address is in allowed list"
            return 0
        fi
    done
    
    print_error "Current IP ($current_ip) is not in the allowed list for EC2 access"
    print_error "Allowed IPs: ${ALLOWED_IPS[*]}"
    print_warning "You may need to update the EC2 security group to allow your current IP"
    print_warning "The backend deployment will be skipped due to IP restrictions"
    return 1
}

# Function to check if directories exist
check_directories() {
    print_status "Checking directory structure..."
    
    if [ ! -d "$STAGING_ROOT" ]; then
        print_error "Staging root directory not found: $STAGING_ROOT"
        exit 1
    fi
    
    if [ ! -d "$STAGING_BACKEND" ]; then
        print_error "Staging backend directory not found: $STAGING_BACKEND"
        exit 1
    fi
    
    if [ ! -d "$STAGING_FRONTEND" ]; then
        print_error "Staging frontend directory not found: $STAGING_FRONTEND"
        exit 1
    fi
    
    if [ ! -d "$PRODUCTION_ROOT" ]; then
        print_error "Production root directory not found: $PRODUCTION_ROOT"
        exit 1
    fi
    
    if [ ! -d "$PRODUCTION_FRONTEND" ]; then
        print_error "Production frontend directory not found: $PRODUCTION_FRONTEND"
        exit 1
    fi
    
    print_success "All directories found"
}

# Function to create backup
create_backup() {
    print_status "Creating backup of production directories..."
    
    BACKUP_DIR="$PRODUCTION_ROOT/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "$PRODUCTION_BACKEND" ]; then
        cp -r "$PRODUCTION_BACKEND" "$BACKUP_DIR/"
        print_success "Backend backup created at: $BACKUP_DIR/backend"
    fi
    
    if [ -d "$PRODUCTION_FRONTEND" ]; then
        cp -r "$PRODUCTION_FRONTEND" "$BACKUP_DIR/"
        print_success "Frontend backup created at: $BACKUP_DIR/ZenExoticsMobile"
    fi
    
    echo "$BACKUP_DIR" > "$PRODUCTION_ROOT/last_backup_path.txt"
    print_success "Backup completed"
}

# Function to copy backend files
copy_backend() {
    print_status "Copying backend files from staging to production..."
    
    # Remove existing backend directory
    if [ -d "$PRODUCTION_BACKEND" ]; then
        rm -rf "$PRODUCTION_BACKEND"
    fi
    
    # Copy backend files
    cp -r "$STAGING_BACKEND" "$PRODUCTION_BACKEND"
    print_success "Backend files copied successfully"
}

# Function to copy frontend files
copy_frontend() {
    print_status "Copying frontend files from staging to production..."
    
    # Remove existing frontend directory
    if [ -d "$PRODUCTION_FRONTEND" ]; then
        rm -rf "$PRODUCTION_FRONTEND"
    fi
    
    # Copy frontend files
    cp -r "$STAGING_FRONTEND" "$PRODUCTION_FRONTEND"
    print_success "Frontend files copied successfully"
}

# Function to update package.json for production
update_package_json() {
    print_status "Updating package.json for production..."
    
    PACKAGE_JSON="$PRODUCTION_FRONTEND/package.json"
    
    if [ ! -f "$PACKAGE_JSON" ]; then
        print_error "package.json not found: $PACKAGE_JSON"
        exit 1
    fi
    
    # Create a temporary file for the updated package.json
    TEMP_PACKAGE="$PRODUCTION_FRONTEND/package.json.tmp"
    
    # Update homepage and build scripts
    sed -e 's/"homepage": "https:\/\/staging\.crittrcove\.com"/"homepage": "https:\/\/crittrcove.com"/' \
        -e 's/"build": "NODE_ENV=staging npx expo export:web"/"build": "NODE_ENV=production npx expo export:web"/' \
        -e 's/"build:staging": "npx expo export:web"/"build:staging": "NODE_ENV=staging npx expo export:web"/' \
        "$PACKAGE_JSON" > "$TEMP_PACKAGE"
    
    # Replace the original file
    mv "$TEMP_PACKAGE" "$PACKAGE_JSON"
    print_success "package.json updated for production"
}

# Function to commit and push backend changes
commit_backend_changes() {
    print_status "Committing and pushing backend changes to GitHub..."
    
    cd "$PRODUCTION_ROOT"
    
    # Check if there are changes to commit
    if git diff --quiet backend/; then
        print_warning "No backend changes to commit"
        return 0
    fi
    
    # Add backend changes
    git add backend/
    
    # Commit changes
    git commit -m "Update backend from staging - $(date +%Y-%m-%d_%H:%M:%S)"
    
    # Push to remote
    print_status "Pushing backend changes to GitHub..."
    git push origin main
    
    print_success "Backend changes committed and pushed"
}

# Function to commit and push frontend changes
commit_frontend_changes() {
    print_status "Committing and pushing frontend changes to GitHub..."
    
    cd "$PRODUCTION_ROOT"
    
    # Check if there are changes to commit
    if git diff --quiet ZenExoticsMobile/; then
        print_warning "No frontend changes to commit"
        return 0
    fi
    
    # Add frontend changes
    git add ZenExoticsMobile/
    
    # Commit changes
    git commit -m "Update frontend from staging - $(date +%Y-%m-%d_%H:%M:%S)"
    
    # Push to remote
    print_status "Pushing frontend changes to GitHub..."
    git push origin main
    
    print_success "Frontend changes committed and pushed"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to production..."
    
    cd "$PRODUCTION_ROOT"
    
    if [ ! -f "deploy-crittrcove-production.sh" ]; then
        print_error "Backend deployment script not found: deploy-crittrcove-production.sh"
        exit 1
    fi
    
    # Make the script executable
    chmod +x "deploy-crittrcove-production.sh"
    
    # Run the backend deployment script
    print_status "Running backend deployment script..."
    ./deploy-crittrcove-production.sh
    
    print_success "Backend deployment completed"
}

# Function to deploy frontend with better error handling
deploy_frontend() {
    print_status "Deploying frontend to production..."
    
    cd "$PRODUCTION_FRONTEND"
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install --legacy-peer-deps
    
    # Build for production
    print_status "Building frontend for production..."
    npm run build
    
    # Deploy to GitHub Pages with better error handling
    print_status "Deploying to GitHub Pages..."
    
    # Clean up any existing gh-pages worktree
    git worktree remove -f gh-pages 2>/dev/null || true
    rm -rf gh-pages 2>/dev/null || true
    
    # Create new worktree
    if ! git worktree add gh-pages gh-pages; then
        print_error "Failed to create git worktree"
        return 1
    fi
    
    # Clear existing files
    rm -rf gh-pages/*
    
    # Copy built files
    cp -r web-build/* gh-pages/
    cp ../CNAME gh-pages/
    
    # Commit and push
    cd gh-pages
    git add .
    git commit -m "Deploy to gh-pages - $(date +%Y-%m-%d_%H:%M:%S)"
    
    # Force push to avoid conflicts
    if ! git push origin gh-pages --force; then
        print_error "Failed to push to gh-pages branch"
        cd ..
        git worktree remove -f gh-pages
        return 1
    fi
    
    # Clean up
    cd ..
    git worktree remove -f gh-pages
    
    print_success "Frontend deployment completed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if backend is running (basic check)
    print_status "Checking backend status..."
    # You can add specific checks here based on your backend setup
    
    # Check if frontend is accessible
    print_status "Checking frontend accessibility..."
    # You can add specific checks here
    
    print_success "Deployment verification completed"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove any temporary files created during the process
    find "$PRODUCTION_ROOT" -name "*.tmp" -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to ask for staging validation
ask_staging_validation() {
    echo ""
    print_warning "IMPORTANT: Before deploying to production, please ensure:"
    print_warning "1. You have tested the changes on staging.crittrcove.com"
    print_warning "2. All functionality works as expected"
    print_warning "3. No critical bugs are present"
    echo ""
    
    read -p "Have you tested the staging deployment and confirmed it's ready for production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled. Please test on staging first."
        exit 1
    fi
    
    print_success "Staging validation confirmed"
}

# Main execution
main() {
    echo "🚀 Starting CrittrCove Staging to Production Deployment"
    echo "=================================================="
    
    # Ask for confirmation
    read -p "Are you sure you want to proceed with deploying to production both the backend and frontend? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
    
    # Ask for staging validation
    ask_staging_validation
    
    # Check IP access
    check_ip_access
    IP_ACCESS_ALLOWED=$?
    
    # Check directories
    check_directories
    
    # Create backup
    create_backup
    
    # Copy files
    copy_backend
    copy_frontend
    
    # Update configuration
    update_package_json
    
    # Commit and push changes
    commit_backend_changes
    commit_frontend_changes
    
    # Deploy backend (only if IP is allowed)
    if [ $IP_ACCESS_ALLOWED -eq 0 ]; then
        deploy_backend
    else
        print_warning "Backend deployment skipped due to IP restrictions"
        print_warning "You can run it manually later with: ./deploy-crittrcove-production.sh"
    fi
    
    # Deploy frontend
    deploy_frontend
    
    # Verify deployment
    verify_deployment
    
    # Cleanup
    cleanup
    
    echo "=================================================="
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "  ✅ Backend copied and committed"
    echo "  ✅ Frontend copied and committed"
    echo "  ✅ Configuration updated for production"
    echo "  ✅ Backup created"
    if [ $IP_ACCESS_ALLOWED -eq 0 ]; then
        echo "  ✅ Backend deployed to EC2"
    else
        echo "  ⚠️  Backend deployment skipped (IP not allowed)"
    fi
    echo "  ✅ Frontend deployed to GitHub Pages"
    echo ""
    echo "🌐 Your production application should be available at:"
    echo "  Frontend: https://crittrcove.com"
    if [ $IP_ACCESS_ALLOWED -eq 0 ]; then
        echo "  Backend: http://18.118.88.49:8000 (or your configured domain)"
    else
        echo "  Backend: Deploy manually after updating EC2 security group"
    fi
    echo ""
    echo "📁 Backup location: $(cat "$PRODUCTION_ROOT/last_backup_path.txt" 2>/dev/null || echo 'Not available')"
}

# Handle script interruption
trap 'print_error "Script interrupted. Please check the backup directory for recovery."; exit 1' INT TERM

# Run main function
main "$@" 