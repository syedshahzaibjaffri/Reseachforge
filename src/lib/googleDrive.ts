import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import type { ResearchProject, FindingAnnotation, GoogleDriveSaveResult } from '../types/research.ts';
import { generateMarkdownReport, generateWordDocumentHtml } from './exportUtils.ts';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const driveProvider = new GoogleAuthProvider();
// Least privilege Google Drive scope authorized by user
driveProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage as per Workspace skill)
let cachedDriveAccessToken: string | null = null;
let cachedDriveUser: User | null = null;

export const getCachedDriveToken = () => cachedDriveAccessToken;
export const getCachedDriveUser = () => cachedDriveUser;

export const setCachedDriveToken = (token: string | null) => {
  cachedDriveAccessToken = token;
};

/**
 * Sign in and request Google Drive permissions
 */
export async function connectGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token was not returned.');
    }

    cachedDriveAccessToken = credential.accessToken;
    cachedDriveUser = result.user;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Drive connection error:', error);
    throw error;
  }
}

/**
 * Disconnect Google Drive token from memory
 */
export async function disconnectGoogleDrive() {
  cachedDriveAccessToken = null;
  cachedDriveUser = null;
  await auth.signOut();
}

/**
 * Find or create dedicated ResearchForge folder in Google Drive
 */
async function getOrCreateResearchForgeFolder(accessToken: string): Promise<string | null> {
  try {
    const query = encodeURIComponent("name = 'ResearchForge AI - Reports & Evidence' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ResearchForge AI - Reports & Evidence',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Auto-saved verified research reports, evidence flags, and innovation concepts from ResearchForge AI',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
    return null;
  } catch (err) {
    console.warn('Could not create Google Drive folder, uploading to root:', err);
    return null;
  }
}

/**
 * Save Research Report directly into user's Google Drive
 */
export async function saveReportToGoogleDrive({
  project,
  accessToken,
  format = 'word',
}: {
  project: ResearchProject;
  accessToken: string;
  format?: 'word' | 'markdown' | 'json';
}): Promise<GoogleDriveSaveResult> {
  const folderId = await getOrCreateResearchForgeFolder(accessToken);
  const safeTitle = project.title.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 60);

  let fileName = `ResearchForge - ${safeTitle}.docx`;
  let mimeType = 'application/vnd.ms-word';
  let content = '';

  if (format === 'markdown') {
    fileName = `ResearchForge - ${safeTitle}.md`;
    mimeType = 'text/markdown';
    content = generateMarkdownReport(project);
  } else if (format === 'json') {
    fileName = `ResearchForge - ${safeTitle}.json`;
    mimeType = 'application/json';
    content = JSON.stringify(project, null, 2);
  } else {
    fileName = `ResearchForge - ${safeTitle}.docx`;
    mimeType = 'application/vnd.ms-word';
    content = generateWordDocumentHtml(project);
  }

  // Construct multipart body for Google Drive API v3 upload
  const boundary = '-------ResearchForgeDriveBoundary' + Math.random().toString(36).substring(2);
  const metadata: any = {
    name: fileName,
    mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    `\r\n` +
    `--${boundary}--`;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errorText}`);
  }

  const result = await uploadRes.json();

  return {
    fileId: result.id,
    fileName: result.name || fileName,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    savedAt: new Date().toISOString(),
    format,
  };
}

/**
 * Save Collaborative Annotations & Evidence Flags directly into Google Drive
 */
export async function saveAnnotationsToGoogleDrive({
  project,
  annotations,
  accessToken,
}: {
  project: ResearchProject;
  annotations: FindingAnnotation[];
  accessToken: string;
}): Promise<GoogleDriveSaveResult> {
  const folderId = await getOrCreateResearchForgeFolder(accessToken);
  const safeTitle = project.title.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 60);
  const fileName = `ResearchForge - Evidence Flags & Annotations - ${safeTitle}.md`;

  let content = `# Collaborative Evidence Flags & Annotations\n`;
  content += `**Project:** ${project.title}\n`;
  content += `**Exported At:** ${new Date().toLocaleString()}\n`;
  content += `**Total Annotations:** ${annotations.length}\n\n`;
  content += `---\n\n`;

  annotations.forEach((ann, i) => {
    content += `### ${i + 1}. [${ann.flag.toUpperCase()}] ${ann.targetTitle || 'Finding'}\n`;
    content += `- **Status:** ${ann.resolved ? 'RESOLVED' : 'ACTIVE REVIEW'}\n`;
    content += `- **Author:** ${ann.author.name} (${ann.author.role})\n`;
    content += `- **Timestamp:** ${ann.createdAt}\n`;
    if (ann.highlightedText) {
      content += `> "${ann.highlightedText}"\n\n`;
    }
    content += `**Shared Note / Evidence:**\n${ann.comment}\n\n`;
    if (ann.resolved && ann.resolvedBy) {
      content += `*Addressed by ${ann.resolvedBy.username} (${ann.resolvedBy.role}) on ${ann.resolvedBy.timestamp}*\n\n`;
    }
    content += `---\n\n`;
  });

  const boundary = '-------ResearchForgeDriveBoundary' + Math.random().toString(36).substring(2);
  const metadata: any = {
    name: fileName,
    mimeType: 'text/markdown',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/markdown; charset=UTF-8\r\n\r\n` +
    content +
    `\r\n` +
    `--${boundary}--`;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errorText}`);
  }

  const result = await uploadRes.json();

  return {
    fileId: result.id,
    fileName: result.name || fileName,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    savedAt: new Date().toISOString(),
    format: 'markdown',
  };
}

/**
 * Auto-Save Preference helpers
 */
export function isDriveAutoSaveEnabled(): boolean {
  try {
    return localStorage.getItem('rf_gdrive_autosave') === 'true';
  } catch {
    return false;
  }
}

export function setDriveAutoSaveEnabled(enabled: boolean) {
  try {
    localStorage.setItem('rf_gdrive_autosave', enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}
