#!/bin/bash

# Navigate to the repository (optional if already in the correct directory)
cd /workspaces/Semester-IV || { echo "Failed to navigate to /workspaces/Semester-IV"; exit 1; }

# Check if a remote repository is configured
if ! git remote | grep -q origin; then
    echo "No remote repository configured. Adding default remote..."
    git remote add origin https://github.com/hamnasz/GenProject || { echo "Failed to add remote repository"; exit 1; }
fi

# Stash any unstaged changes
git stash push -m "Temporary stash by push_all.sh" || { echo "Failed to stash changes"; exit 1; }

# Pull the latest changes from the remote repository
git pull origin main --rebase || { echo "Failed to pull changes from remote repository"; git stash pop; exit 1; }

# Reapply stashed changes
git stash pop || { echo "Failed to reapply stashed changes"; exit 1; }

# Stage all changes
git add . || { echo "Failed to stage changes"; exit 1; }

# Commit the changes with a default message
commit_time=$(TZ=Asia/Karachi date)
git commit -m "Commit: $commit_time" || { echo "Failed to commit changes"; exit 1; }

# Push to the remote repository
git push -u origin main || { echo "Failed to push changes to remote repository"; exit 1; }

echo "All changes pushed successfully!"
