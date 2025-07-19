# CrittrCove Deployment Scripts

This directory contains scripts to automate the deployment process from staging to production.

## Quick Start

To deploy from staging to production with a single command:

```bash
./deploy-staging-to-production.sh
```

This will:
1. **Confirm deployment** - Ask for user confirmation
2. **Validate staging** - Confirm staging has been tested
3. **Check IP access** - Verify current IP is allowed for EC2
4. **Copy files** - Backend and frontend from staging to production
5. **Update configuration** - Package.json for production settings
6. **Commit changes** - Push both backend and frontend to GitHub
7. **Deploy backend** - To EC2 (if IP is allowed)
8. **Deploy frontend** - To GitHub Pages with conflict resolution

## Scripts Overview

### `deploy-staging-to-production.sh`
- Main deployment script with detailed logging
- Handles all copying, configuration, and deployment steps
- **Usage**: `./deploy-staging-to-production.sh`

### `test-frontend-deploy.sh`
- Test script to verify frontend deployment process
- Runs without affecting production
- **Usage**: `./test-frontend-deploy.sh`

### `deploy-crittrcove-production.sh`
- Existing backend deployment script
- Deploys backend to EC2 server
- **Usage**: `./deploy-crittrcove-production.sh [EC2_IP] [SSH_KEY_PATH]`

## Directory Structure

```
/Users/mattaertker/Documents/Github/
├── CrittrCoveStaging/           # Staging repository
│   ├── backend/                 # Staging backend
│   └── CrittrCoveStaging/      # Staging frontend
└── CrittrCove/                 # Production repository
    ├── backend/                 # Production backend
    ├── ZenExoticsMobile/       # Production frontend
    └── deploy-staging-to-production.sh
```

## What the Script Does

### 1. Backup
- Creates timestamped backup of current production files
- Backup location: `backup_YYYYMMDD_HHMMSS/`

### 2. Copy Files
- **Backend**: Copies from `CrittrCoveStaging/backend/` to `CrittrCove/backend/`
- **Frontend**: Copies from `CrittrCoveStaging/CrittrCoveStaging/` to `CrittrCove/ZenExoticsMobile/`

### 3. Update Configuration
- Updates `package.json` homepage from `staging.crittrcove.com` to `crittrcove.com`
- Updates build scripts for production environment
- Ensures proper NODE_ENV settings

### 4. IP Access Validation
- Checks current IP address against allowed list
- Allowed IPs: `185.236.200.245`, `73.3.158.185`
- Skips backend deployment if IP not allowed
- Provides instructions for updating EC2 security group

### 5. Commit and Push Changes
- Commits backend changes to git
- Commits frontend changes to git
- Pushes to GitHub main branch
- Ensures deployment scripts have latest code

### 6. Deploy Backend
- Runs `deploy-crittrcove-production.sh` if IP is allowed
- Deploys to EC2 server at `18.118.88.49`
- Handles database migrations, static files, and service restart

### 7. Deploy Frontend
- Installs dependencies with `npm install --legacy-peer-deps`
- Builds for production with `npm run build`
- Uses git worktree for clean deployment
- Force pushes to gh-pages branch to avoid conflicts

## Prerequisites

1. **Staging Repository**: Must exist at `/Users/mattaertker/Documents/Github/CrittrCoveStaging`
2. **Production Repository**: Must exist at `/Users/mattaertker/Documents/Github/CrittrCove`
3. **SSH Key**: Must have access to EC2 server
4. **GitHub Access**: Must have push access to gh-pages branch
5. **Node.js**: Must be installed for frontend build

## Environment Files

The script expects:
- `backend/zenexotics_backend/.env.production` - Production environment variables
- Proper SSH key configuration for EC2 access

## Error Handling

- Script exits on any error (`set -e`)
- Creates backup before making changes
- Provides colored output for different message types
- Handles script interruption gracefully

## Recovery

If deployment fails:
1. Check the backup directory: `backup_YYYYMMDD_HHMMSS/`
2. Restore files from backup if needed
3. Check logs for specific error messages

## Manual Steps (if needed)

If you need to run steps manually:

```bash
# 1. Copy backend
cp -r /Users/mattaertker/Documents/Github/CrittrCoveStaging/backend/ /Users/mattaertker/Documents/Github/CrittrCove/

# 2. Copy frontend
cp -r /Users/mattaertker/Documents/Github/CrittrCoveStaging/CrittrCoveStaging/ /Users/mattaertker/Documents/Github/CrittrCove/ZenExoticsMobile/

# 3. Update package.json (manually edit homepage and build scripts)

# 4. Commit and push backend changes
cd /Users/mattaertker/Documents/Github/CrittrCove
git add backend/
git commit -m "Update backend from staging"
git push origin main

# 5. Deploy backend
./deploy-crittrcove-production.sh

# 6. Deploy frontend
cd /Users/mattaertker/Documents/Github/CrittrCove/ZenExoticsMobile
npm install --legacy-peer-deps
npm run deploy:full
```

## Troubleshooting

### Common Issues

1. **Directory not found**: Ensure staging repository exists and paths are correct
2. **SSH connection failed**: Check SSH key and EC2 server status
3. **Build failed**: Check Node.js version and dependencies
4. **Deploy failed**: Check GitHub access and branch permissions

### Logs

The script provides detailed colored output:
- 🔵 Blue: Information messages
- 🟢 Green: Success messages
- 🟡 Yellow: Warning messages
- 🔴 Red: Error messages

## Security Notes

- Script creates backups before making changes
- Uses existing deployment scripts with proven security
- No sensitive data is logged or stored
- SSH keys should be properly secured

## Support

If you encounter issues:
1. Check the backup directory for recovery
2. Review the colored output for specific error messages
3. Verify all prerequisites are met
4. Check server logs if backend deployment fails 