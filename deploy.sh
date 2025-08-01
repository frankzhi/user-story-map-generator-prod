#!/bin/bash

# Deploy script for User Story Map Generator
# This script commits changes to GitHub and deploys to Vercel

echo "🚀 Starting deployment process..."

# Check if there are any changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Changes detected, committing to GitHub..."
    
    # Add all changes
    git add .
    
    # Get commit message from user or use default
    if [ -z "$1" ]; then
        echo "Please provide a commit message:"
        read commit_message
    else
        commit_message="$1"
    fi
    
    # Commit changes
    git commit -m "$commit_message"
    
    # Push to GitHub
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub"
    else
        echo "❌ Failed to push to GitHub"
        exit 1
    fi
else
    echo "📋 No changes to commit"
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to Vercel"
    echo "🎉 Deployment complete! Both GitHub and Vercel are updated."
else
    echo "❌ Failed to deploy to Vercel"
    exit 1
fi 