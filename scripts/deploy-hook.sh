#!/bin/bash
# =============================================================================
# scripts/deploy-hook.sh
#
# Git post-receive hook for the theme repo.
# Install this on the server to auto-deploy when you push to main.
#
# SETUP (run once on server):
#   1. Create a bare git repo on the server:
#      mkdir -p /var/repo/winds-and-echoes-theme.git
#      cd /var/repo/winds-and-echoes-theme.git
#      git init --bare
#
#   2. Copy this script to the hooks folder:
#      cp scripts/deploy-hook.sh /var/repo/winds-and-echoes-theme.git/hooks/post-receive
#      chmod +x /var/repo/winds-and-echoes-theme.git/hooks/post-receive
#
#   3. Add the server as a remote on your Mac:
#      git remote add production skghost@159.65.100.97:/var/repo/winds-and-echoes-theme.git
#
#   4. Deploy by pushing:
#      git push production main
#
# =============================================================================

set -e

THEME_DIR="/var/www/ghost/content/themes/winds-and-echoes"
REPO_DIR="/var/repo/winds-and-echoes-theme.git"
BRANCH="main"

echo "=== Winds & Echoes theme deploy ==="
echo "Time: $(date)"

# Read pushed refs
while read oldrev newrev refname; do
  PUSHED_BRANCH=$(git rev-parse --symbolic --abbrev-ref "$refname")

  if [ "$PUSHED_BRANCH" != "$BRANCH" ]; then
    echo "Skipping branch: $PUSHED_BRANCH (only deploying $BRANCH)"
    continue
  fi

  echo "Deploying branch: $BRANCH"

  # Check out latest to theme directory
  mkdir -p "$THEME_DIR"
  git --work-tree="$THEME_DIR" --git-dir="$REPO_DIR" checkout -f "$BRANCH"

  echo "Theme files updated at $THEME_DIR"

  # Restart Ghost to pick up theme changes
  cd /var/www/ghost
  ghost restart

  echo "Ghost restarted"
  echo "=== Deploy complete ==="
done
