# Git Push Guide - GitHub Authentication

Your code is committed locally but needs authentication to push to GitHub.

## Option 1: Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: `sports-odds-dashboard`
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using Token

Run this command (it will prompt for password - paste your token):

```bash
cd /home/neoflash/Desktop/sports-odds-dashboard
git push -u origin main
```

When prompted:
- **Username**: `neoflashx`
- **Password**: Paste your Personal Access Token (not your GitHub password)

---

## Option 2: GitHub CLI (gh)

### Install GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# Or download from: https://cli.github.com/
```

### Authenticate

```bash
gh auth login
```

Follow the prompts:
- Choose **GitHub.com**
- Choose **HTTPS**
- Authenticate via browser

### Push

```bash
cd /home/neoflash/Desktop/sports-odds-dashboard
git push -u origin main
```

---

## Option 3: SSH Key (For Future)

### Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept default location.

### Add to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to: https://github.com/settings/keys
3. Click **New SSH key**
4. Paste the key
5. Click **Add SSH key**

### Update Remote and Push

```bash
cd /home/neoflash/Desktop/sports-odds-dashboard
git remote set-url origin git@github.com:neoflashx/sports-odds-dashboard-aura.git
git push -u origin main
```

---

## Quick Command Reference

Your code is already committed. You just need to push:

```bash
cd /home/neoflash/Desktop/sports-odds-dashboard
git push -u origin main
```

**If using Personal Access Token:**
- Username: `neoflashx`
- Password: Your Personal Access Token

---

## Verify Push

After pushing, check your repository:
https://github.com/neoflashx/sports-odds-dashboard-aura

You should see all your files!

---

## Troubleshooting

### "Authentication failed"
- Make sure you're using a Personal Access Token, not your GitHub password
- Token must have `repo` scope

### "Repository not found"
- Verify repository exists: https://github.com/neoflashx/sports-odds-dashboard-aura
- Check you have write access

### "Permission denied"
- Verify your GitHub username is correct
- Check token has correct permissions
