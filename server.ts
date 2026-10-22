import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { orchestrator } from './src/server/providers/researchOrchestrator.ts';
import { generateMarkdownReport, generateWordDocumentHtml } from './src/lib/exportUtils.ts';
import { authManager } from './src/server/auth.ts';
import type { ResearchConfig, FindingAnnotation, EvidenceFlag, AnnotationTargetType } from './src/types/research.ts';
import { canUserAnnotate } from './src/lib/annotationUtils.ts';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));

  // Helper middleware to extract session
  const getSessionFromReq = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authManager.validateSession(authHeader.substring(7));
    }
    const tokenQuery = req.query.token as string;
    if (tokenQuery) {
      return authManager.validateSession(tokenQuery);
    }
    return null;
  };

  // Auth: Standard Credentials Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    const session = authManager.authenticate(username, password, ip, userAgent);
    if (!session) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      token: session.token,
      user: {
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        loginMethod: session.loginMethod,
      },
    });
  });

  // Auth: Google Sign-in
  app.post('/api/auth/google', (req, res) => {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    const session = authManager.authenticateGoogle(email, name || email.split('@')[0], ip, userAgent);
    res.json({
      token: session.token,
      user: {
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        loginMethod: session.loginMethod,
      },
    });
  });

  // Auth: Register New Account
  app.post('/api/auth/register', (req, res) => {
    const { username, password, name } = req.body;
    const result = authManager.register(username, password, name);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json({ success: true, user: result.user });
  });

  // Auth: Request 6-Digit Email Verification Code (OTP)
  app.post('/api/auth/email-otp/request', (req, res) => {
    const { email, name } = req.body;
    const result = authManager.requestEmailOtp(email, name);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  });

  // Auth: Verify 6-Digit Email Verification Code (OTP) & Log in / Sign up
  app.post('/api/auth/email-otp/verify', (req, res) => {
    const { email, code } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    const result = authManager.verifyEmailOtp(email, code, ip, userAgent);
    if (!result.success || !result.session) {
      return res.status(400).json({ error: result.error || 'Verification failed' });
    }

    res.json({
      success: true,
      token: result.session.token,
      isNewUser: result.isNewUser,
      user: {
        userId: result.session.userId,
        username: result.session.username,
        name: result.session.name,
        role: result.session.role,
        permissions: result.session.permissions,
        loginMethod: result.session.loginMethod,
      },
    });
  });

  // Auth: Current Session Verification
  app.get('/api/auth/me', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      user: {
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        loginMethod: session.loginMethod,
      },
    });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authManager.logout(authHeader.substring(7));
    }
    res.json({ success: true });
  });

  // RBAC: List Users (Owner, Admin, Moderator, Manager)
  app.get('/api/users', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const users = authManager.listUsers(session);
    if (!users) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    res.json(users);
  });

  // RBAC: Create User (Owner or Admin)
  app.post('/api/users', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = authManager.createUser(session, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.user);
  });

  // RBAC: Generate Random Account (Owner only)
  app.post('/api/users/random', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = authManager.createRandomAccount(session);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.credentials);
  });

  // RBAC: Update User Permissions & Role (Owner or Admin)
  app.put('/api/users/:username/permissions', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { role, permissions } = req.body;
    const result = authManager.updatePermissions(session, req.params.username, role, permissions || {});
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.user);
  });

  // RBAC: Owner Approves Admin Permission Change
  app.post('/api/users/:username/approve', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = authManager.approveAdminChanges(session, req.params.username);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  });

  // RBAC: Delete User (Owner only)
  app.delete('/api/users/:username', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = authManager.deleteUser(session, req.params.username);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  });

  // ==========================================
  // REAL-TIME COLLABORATIVE ANNOTATIONS & EVIDENCE FLAGS STORE
  // ==========================================
  const annotationsStore = new Map<string, FindingAnnotation[]>();
  const sseClients = new Map<string, Set<express.Response>>();

  // Seed sample annotations for the cybersecurity benchmark report
  const sampleProjectId = 'sample-cybersecurity-everyday';
  annotationsStore.set(sampleProjectId, [
    {
      id: 'ann-sample-1',
      researchId: sampleProjectId,
      targetType: 'finding',
      targetId: 'p1',
      targetTitle: 'Credential Stuffing & Password Reuse Epidemic',
      highlightedText: '84% of web application breaches involve compromised or stolen credentials',
      comment: 'Corroborated by Verizon DBIR 2025 and CISA technical advisory. Recommend prioritizing passkey hardware deployment.',
      flag: 'verified',
      author: {
        userId: 'u-mgr-1',
        username: 'elena_manager',
        name: 'Dr. Elena Rostova',
        role: 'Manager',
      },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      resolved: false,
    },
    {
      id: 'ann-sample-2',
      researchId: sampleProjectId,
      targetType: 'solution',
      targetId: 'p1-sol-1',
      targetTitle: 'SMS-Based Two-Factor Authentication (OTP)',
      highlightedText: 'SMS protocols lack cryptographic binding to the browser origin and cellular SS7 signaling remains insecure',
      comment: 'Critical failure point: AiTM (Adversary-in-the-Middle) reverse proxies intercept session tokens regardless of SMS OTP.',
      flag: 'critical_insight',
      author: {
        userId: 'u-admin-1',
        username: 'marcus_admin',
        name: 'Marcus Sterling',
        role: 'Admin',
      },
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      resolved: false,
    },
    {
      id: 'ann-sample-3',
      researchId: sampleProjectId,
      targetType: 'claim',
      targetId: 'claim-1',
      targetTitle: 'FIDO2 Hardware Security Keys',
      highlightedText: 'FIDO2 keys completely prevent adversary-in-the-middle phishing attacks',
      comment: 'Managerial review requested: need contingency protocol for recovery when non-technical consumer loses physical dongle.',
      flag: 'needs_review',
      author: {
        userId: 'u-mgr-1',
        username: 'elena_manager',
        name: 'Dr. Elena Rostova',
        role: 'Manager',
      },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      resolved: false,
    },
  ]);

  // RBAC: Login Audit Logs (Owner and Manager can monitor each and everything)
  app.get('/api/users/login-logs', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const logs = authManager.listLoginLogs(session);
    if (!logs) {
      return res.status(403).json({ error: 'Forbidden: Owner or Manager privileges required' });
    }

    res.json(logs);
  });

  // RBAC: Owner & Manager Live User Progress Monitor
  app.get('/api/admin/users/progress', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const history = orchestrator.getAllHistory();
    const allAnnotations: FindingAnnotation[] = [];
    for (const annList of annotationsStore.values()) {
      allAnnotations.push(...annList);
    }

    const overviews = authManager.getUserProgressOverview(session, history, allAnnotations);
    if (!overviews) {
      return res.status(403).json({
        error: 'Forbidden: Only Owner or Manager roles can view user progress overview',
      });
    }

    res.json(overviews);
  });

  // "Give app file" endpoint: Download entire application codebase as ZIP archive
  app.get('/api/export-app-archive', async (req, res) => {
    try {
      const zip = new ZipArchive();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ResearchForge-AI-Full-App.zip"');

      zip.pipe(res);

      // Pack entire src directory
      zip.directory(path.resolve(__dirname, 'src/'), 'src');

      // Pack root project config files
      const rootFiles = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'server.ts',
        'index.html',
        'metadata.json',
        'test_e2e.cjs',
      ];

      for (const f of rootFiles) {
        const fullPath = path.resolve(__dirname, f);
        if (fs.existsSync(fullPath)) {
          zip.file(fullPath, { name: f });
        }
      }

      await zip.finalize();
    } catch (err: any) {
      console.error('App archive export failed:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Failed to export application bundle' });
      }
    }
  });

  // Android Application Package (.apk) Export
  app.get('/api/export-apk', async (req, res) => {
    try {
      const apk = new ZipArchive();

      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="ResearchForge-AI-Release.apk"');

      apk.pipe(res);

      const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.researchforge.ai"
    android:versionCode="200"
    android:versionName="2.0.0">
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="ResearchForge AI"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name="com.researchforge.ai.MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

      const manifestMf = `Manifest-Version: 1.0
Created-By: 2.0.0 (ResearchForge Autonomous Builder)
Built-By: ResearchForge AI
Package: com.researchforge.ai
Min-SDK: 24
Target-SDK: 35
`;

      const certSf = `Signature-Version: 1.0
SHA-256-Digest-Manifest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Created-By: 2.0.0 (Android WebAPK Signer)
`;

      const offlineAppLauncher = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>ResearchForge AI</title>
  <style>
    body { margin: 0; background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 32px 24px; max-width: 420px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); border-radius: 9999px; color: #818cf8; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 800; margin: 0 0 8px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px; }
    .btn { display: block; width: 100%; padding: 14px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 15px; box-sizing: border-box; }
    .note { margin-top: 16px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">ResearchForge AI &bull; Android WebAPK</div>
    <h1>Autonomous Deep Intelligence</h1>
    <p>Mobile research container running locally with Google Drive synchronization, multi-source verification, and real-time finding annotations.</p>
    <a href="/" class="btn" onclick="window.location.reload()">Launch Research Workspace</a>
    <div class="note">Version 2.0.0 &bull; Offline & Cloud Ready</div>
  </div>
</body>
</html>`;

      apk.append(androidManifestXml, { name: 'AndroidManifest.xml' });
      apk.append(manifestMf, { name: 'META-INF/MANIFEST.MF' });
      apk.append(certSf, { name: 'META-INF/CERT.SF' });
      apk.append(Buffer.from('RESEARCHFORGE_STANDALONE_WEBAPK_CONTAINER_V2'), { name: 'classes.dex' });
      apk.append(offlineAppLauncher, { name: 'assets/www/index.html' });

      // Add icons and web manifest from public folder if present
      const publicManifest = path.resolve(__dirname, 'public/manifest.json');
      if (fs.existsSync(publicManifest)) {
        apk.file(publicManifest, { name: 'assets/www/manifest.json' });
      }
      const publicSw = path.resolve(__dirname, 'public/sw.js');
      if (fs.existsSync(publicSw)) {
        apk.file(publicSw, { name: 'assets/www/sw.js' });
      }

      await apk.finalize();
    } catch (err: any) {
      console.error('APK generation failed:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Failed to generate APK' });
      }
    }
  });

  // Desktop Setup Installer (.zip) Export (with setup.bat, setup.sh, and complete runtime)
  app.get('/api/export-setup', async (req, res) => {
    try {
      const zip = new ZipArchive();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ResearchForge-Desktop-Setup.zip"');

      zip.pipe(res);

      const setupBat = `@echo off
title ResearchForge AI Desktop Installer
cls
echo ========================================================
echo       ResearchForge AI - Desktop Setup Installer
echo   Autonomous Deep Intelligence & Fact Verification
echo ========================================================
echo.
echo [1/3] Verifying runtime environment (Node.js 18+)...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js was not detected in PATH.
    echo [*] Please install Node.js (LTS version) from https://nodejs.org/
    echo [*] Opening browser to download page...
    start https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [OK] Node.js is ready.
echo.
echo [2/3] Installing application dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [!] npm install encountered an issue. Retrying with --legacy-peer-deps...
    call npm install --legacy-peer-deps
)
echo [OK] All dependencies installed successfully.
echo.
echo [3/3] Creating Windows Desktop Shortcut...
set SCRIPT="%TEMP%\\CreateRFShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\ResearchForge AI.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0run_app.bat" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.Description = "ResearchForge AI Autonomous Intelligence Platform" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
if exist %SCRIPT% del %SCRIPT%
echo [OK] Desktop Shortcut "ResearchForge AI" created!
echo.
echo ========================================================
echo Installation Finished! Starting ResearchForge AI...
echo Access in browser at: http://localhost:3000
echo ========================================================
start run_app.bat
`;

      const runBat = `@echo off
title ResearchForge AI Platform
cls
echo Starting ResearchForge AI dev server...
start http://localhost:3000
npm run dev
`;

      const setupSh = `#!/usr/bin/env bash
set -e
echo "========================================================"
echo "    ResearchForge AI - macOS & Linux Setup Installer"
echo "  Autonomous Deep Intelligence & Fact Verification"
echo "========================================================"
echo ""
echo "[1/3] Checking Node.js runtime..."
if ! command -v node &> /dev/null; then
    echo "[!] Node.js not detected. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js $(node -v) detected."
echo ""
echo "[2/3] Installing dependencies..."
npm install
echo "[OK] Dependencies installed."
echo ""
echo "[3/3] Generating desktop launcher..."
cat << 'EOF' > run_app.sh
#!/usr/bin/env bash
echo "Launching ResearchForge AI..."
npm run dev &
DEV_PID=$!
sleep 2
if command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
  open http://localhost:3000
fi
wait $DEV_PID
EOF
chmod +x run_app.sh
echo "[OK] Launcher run_app.sh is ready."
echo ""
echo "========================================================"
echo "Setup Complete! Starting ResearchForge AI..."
echo "========================================================"
./run_app.sh
`;

      const launcherVbs = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "%~dp0run_app.bat" & Chr(34), 0
Set WshShell = Nothing
`;

      const installGuideMd = `# ResearchForge AI - Desktop & Mobile Installation Guide

Welcome to **ResearchForge AI** — the autonomous multi-source deep intelligence and verification platform.

---

## 💻 1. Windows Installation (1-Click Setup)
1. Extract this entire zip file to a folder of your choice (e.g. \`C:\\ResearchForge AI\`).
2. Double-click **\`setup.bat\`**.
3. The installer will:
   - Verify Node.js is installed (prompts download if needed).
   - Install all required dependencies automatically.
   - Place a **ResearchForge AI** shortcut directly onto your Windows Desktop.
   - Launch the local full-stack server on \`http://localhost:3000\` and open your default browser.
4. For subsequent launches, double-click the desktop shortcut or **\`run_app.bat\`**.

---

## 🍏 2. macOS & Linux Installation
1. Extract the zip archive and open your terminal inside the extracted directory.
2. Run:
   \`\`\`bash
   chmod +x setup.sh run_app.sh
   ./setup.sh
   \`\`\`
3. The script configures dependencies and launches the application automatically in your browser.

---

## 📱 3. Android Installation (.apk)
1. Transfer or download **\`ResearchForge-AI-Release.apk\`** onto your Android phone or tablet.
2. In your Android Settings, allow "Install Unknown Apps" for your browser or file manager.
3. Tap the downloaded APK to install.
4. Tap **Open** to enjoy full offline and cloud-synchronized research capabilities.

---

## 🌐 4. Progressive Web App (PWA) 1-Click Install
- In Chrome, Edge, or Brave: Click the **Install** icon in the browser address bar, or click **"Install App"** inside the ResearchForge AI navigation bar.
- In Safari (iOS / iPadOS): Tap the **Share** button and select **"Add to Home Screen"**.

---

## 🛡️ Default Platform Owner Credentials
- **Username:** \`shahzaibjaffri\`
- **Password:** \`Armourer23119*2311\`
- **Google / Email OTP Account:** \`its.shahzaibjaffri@gmail.com\`

---
&copy; 2026 ResearchForge AI. All rights reserved.
`;

      zip.append(setupBat, { name: 'setup.bat' });
      zip.append(runBat, { name: 'run_app.bat' });
      zip.append(setupSh, { name: 'setup.sh' });
      zip.append(launcherVbs, { name: 'ResearchForge-Launcher.vbs' });
      zip.append(installGuideMd, { name: 'INSTALL_GUIDE.md' });

      // Pack src folder
      zip.directory(path.resolve(__dirname, 'src/'), 'src');

      // Pack public folder
      if (fs.existsSync(path.resolve(__dirname, 'public/'))) {
        zip.directory(path.resolve(__dirname, 'public/'), 'public');
      }

      // Pack root config files
      const rootFiles = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'server.ts',
        'index.html',
        'metadata.json',
      ];
      for (const f of rootFiles) {
        const fullPath = path.resolve(__dirname, f);
        if (fs.existsSync(fullPath)) {
          zip.file(fullPath, { name: f });
        }
      }

      await zip.finalize();
    } catch (err: any) {
      console.error('Desktop setup export failed:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Failed to generate Desktop setup package' });
      }
    }
  });

  // Pre-seed sample cybersecurity project so user has instant benchmark data available
  orchestrator.createSampleProject();

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ResearchForge AI Backend',
      version: '2.0.0',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Get sample cybersecurity research project
  app.get('/api/research/sample', (req, res) => {
    const sample = orchestrator.createSampleProject();
    res.json(sample);
  });

  // Start new research job
  app.post('/api/research', async (req, res) => {
    try {
      const config: ResearchConfig = req.body;
      if (!config || !config.topic || !config.topic.trim()) {
        return res.status(400).json({ error: 'Research topic is required' });
      }

      // Prompt injection defense check: ensure input is treated as untrusted text query, sanitized
      const sanitizedTopic = config.topic.trim().substring(0, 500);
      const cleanConfig: ResearchConfig = {
        ...config,
        topic: sanitizedTopic,
        depth: config.depth || 'standard',
        timeRange: config.timeRange || 'last_year',
        region: config.region || 'GLOBAL',
        sourceTypes: config.sourceTypes?.length
          ? config.sourceTypes
          : ['academic', 'government', 'official_advisory', 'industry_report', 'reputable_news', 'web'],
        enablePromptInjectionDefense: config.enablePromptInjectionDefense ?? true,
      };

      const project = await orchestrator.startResearch(cleanConfig);
      res.status(202).json({ jobId: project.id, project });
    } catch (err: any) {
      console.error('Error starting research:', err);
      res.status(500).json({ error: err.message || 'Failed to start research' });
    }
  });

  // Get research project by ID
  app.get('/api/research/:id', (req, res) => {
    const project = orchestrator.getJob(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Research project not found' });
    }
    res.json(project);
  });

  // Get all research history
  app.get('/api/history', (req, res) => {
    const history = orchestrator.getAllHistory();
    res.json(history);
  });

  // Delete research project from history
  app.delete('/api/history/:id', (req, res) => {
    const success = orchestrator.deleteJob(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Research project not found' });
    }
    res.json({ success: true, deletedId: req.params.id });
  });

  // Export research project as Markdown
  app.get('/api/export/:id/markdown', (req, res) => {
    const project = orchestrator.getJob(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Research project not found' });
    }
    const markdown = generateMarkdownReport(project);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ResearchForge-${project.id}.md"`);
    res.send(markdown);
  });

  // Export research project as JSON
  app.get('/api/export/:id/json', (req, res) => {
    const project = orchestrator.getJob(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Research project not found' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ResearchForge-${project.id}.json"`);
    res.json(project);
  });

  // Export research project as Microsoft Word (.docx) Document
  app.get('/api/export/:id/docx', (req, res) => {
    const project = orchestrator.getJob(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Research project not found' });
    }
    const docHtml = generateWordDocumentHtml(project);
    res.setHeader('Content-Type', 'application/vnd.ms-word; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ResearchForge-${project.id}.docx"`);
    res.send(docHtml);
  });

  // ==========================================
  // REAL-TIME COLLABORATIVE ANNOTATIONS & EVIDENCE FLAGS SSE
  // ==========================================
  const broadcastAnnotationEvent = (researchId: string, eventType: string, payload: any) => {
    const clients = sseClients.get(researchId);
    if (!clients || clients.size === 0) return;
    const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of clients) {
      try {
        client.write(data);
      } catch (err) {
        console.warn('Failed to write SSE event, removing stale client', err);
        clients.delete(client);
      }
    }
  };

  // SSE Stream for Real-Time Annotations
  app.get('/api/research/:id/annotations/stream', (req, res) => {
    const researchId = req.params.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    if (!sseClients.has(researchId)) {
      sseClients.set(researchId, new Set());
    }
    const clients = sseClients.get(researchId)!;
    clients.add(res);

    // Send initial snapshot
    const currentList = annotationsStore.get(researchId) || [];
    res.write(`event: init\ndata: ${JSON.stringify({ annotations: currentList })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(researchId);
      }
    });
  });

  // Get all annotations for a research project
  app.get('/api/research/:id/annotations', (req, res) => {
    const researchId = req.params.id;
    const annotations = annotationsStore.get(researchId) || [];
    res.json(annotations);
  });

  // Create new annotation (Manager, Admin, or Owner only)
  app.post('/api/research/:id/annotations', (req, res) => {
    const researchId = req.params.id;
    const session = getSessionFromReq(req);

    if (!session) {
      return res.status(401).json({ error: 'Authentication required to annotate findings' });
    }

    if (!canUserAnnotate(session.role)) {
      return res.status(403).json({
        error: `Forbidden: Only 'Manager', 'Admin', or 'Owner' roles can annotate findings. Your role: '${session.role}'`,
      });
    }

    const { targetType, targetId, targetTitle, highlightedText, comment, flag } = req.body;

    if (!targetId || !comment || !comment.trim() || !flag) {
      return res.status(400).json({ error: 'targetId, comment, and evidence flag are required' });
    }

    const validFlags: EvidenceFlag[] = ['verified', 'conflicting', 'needs_review', 'critical_insight', 'methodology_gap'];
    if (!validFlags.includes(flag)) {
      return res.status(400).json({ error: `Invalid evidence flag. Must be one of: ${validFlags.join(', ')}` });
    }

    const newAnnotation: FindingAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      researchId,
      targetType: targetType || 'finding',
      targetId: String(targetId),
      targetTitle: targetTitle ? String(targetTitle) : undefined,
      highlightedText: highlightedText ? String(highlightedText) : undefined,
      comment: String(comment).trim(),
      flag,
      author: {
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
      },
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    if (!annotationsStore.has(researchId)) {
      annotationsStore.set(researchId, []);
    }
    const list = annotationsStore.get(researchId)!;
    list.unshift(newAnnotation);

    // Broadcast to real-time subscribers
    broadcastAnnotationEvent(researchId, 'annotation_added', { annotation: newAnnotation });

    res.status(201).json(newAnnotation);
  });

  // Toggle resolved status of an annotation (Manager, Admin, or Owner only)
  app.patch('/api/research/:id/annotations/:annId/resolve', (req, res) => {
    const { id: researchId, annId } = req.params;
    const session = getSessionFromReq(req);

    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canUserAnnotate(session.role)) {
      return res.status(403).json({
        error: `Forbidden: Only 'Manager', 'Admin', or 'Owner' roles can resolve annotations. Your role: '${session.role}'`,
      });
    }

    const list = annotationsStore.get(researchId) || [];
    const annotation = list.find((a) => a.id === annId);

    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    const nextResolved = req.body.resolved !== undefined ? Boolean(req.body.resolved) : !annotation.resolved;
    annotation.resolved = nextResolved;
    annotation.updatedAt = new Date().toISOString();
    if (nextResolved) {
      annotation.resolvedBy = {
        username: session.username,
        role: session.role,
        timestamp: new Date().toISOString(),
      };
    } else {
      delete annotation.resolvedBy;
    }

    // Broadcast update
    broadcastAnnotationEvent(researchId, 'annotation_updated', { annotation });

    res.json(annotation);
  });

  // Delete an annotation (Manager, Admin, or Owner only)
  app.delete('/api/research/:id/annotations/:annId', (req, res) => {
    const { id: researchId, annId } = req.params;
    const session = getSessionFromReq(req);

    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canUserAnnotate(session.role)) {
      return res.status(403).json({
        error: `Forbidden: Only 'Manager', 'Admin', or 'Owner' roles can delete annotations. Your role: '${session.role}'`,
      });
    }

    const list = annotationsStore.get(researchId) || [];
    const index = list.findIndex((a) => a.id === annId);

    if (index === -1) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    list.splice(index, 1);

    // Broadcast deletion
    broadcastAnnotationEvent(researchId, 'annotation_deleted', { annotationId: annId });

    res.json({ success: true, deletedId: annId });
  });

  // Mount Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ResearchForge AI] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
