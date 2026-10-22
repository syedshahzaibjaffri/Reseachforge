import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSourceQuality } from './sourceQuality.ts';
import { evaluateClaimStatus, getVerificationMeta } from './claimVerification.ts';
import { formatRegionLabel, formatTimeRangeLabel } from './countries.ts';
import { generateMarkdownReport } from './exportUtils.ts';
import type { ResearchSource, ResearchProject } from '../types/research.ts';

test('sourceQuality assigns peer-reviewed academic badges correctly', () => {
  const academicSource: ResearchSource = {
    id: 'src-1',
    title: 'Adversarial Machine Learning in Critical Infrastructure',
    publisher: 'IEEE Transactions on Dependable and Secure Computing',
    publishDate: '2025-06-12',
    url: 'https://ieee.org/sample',
    sourceType: 'academic',
    reliabilityIndicator: 'Peer-Reviewed Academic',
    isOfficial: true,
    crossCheckCount: 3,
    primaryOrSecondary: 'primary',
  };

  const evalResult = evaluateSourceQuality(academicSource);
  assert.equal(evalResult.sourceTypeLabel, 'Peer-Reviewed Academic Source');
  assert.equal(evalResult.canStandAloneAsProof, true);
  assert.equal(evalResult.corroborationBadge, 'Cross-checked by 3 additional sources');
});

test('sourceQuality flags social media as non-standalone signal', () => {
  const socialSource: ResearchSource = {
    id: 'src-social',
    title: 'Incident alert thread regarding zero-day exploit',
    publisher: 'Security Researcher on Mastodon / X',
    publishDate: '2026-03-01',
    url: 'https://example.org/social',
    sourceType: 'social_media',
    reliabilityIndicator: 'Social Signal',
    isOfficial: false,
    crossCheckCount: 0,
    primaryOrSecondary: 'signal',
  };

  const evalResult = evaluateSourceQuality(socialSource);
  assert.equal(evalResult.canStandAloneAsProof, false);
  assert.equal(evalResult.isPrimaryEvidence, false);
});

test('claimVerification classifies conflicting sources accurately', () => {
  const supporting: ResearchSource[] = [
    {
      id: 's1',
      title: 'Study A',
      publisher: 'ACM',
      publishDate: '2024',
      url: 'https://acm.org',
      sourceType: 'academic',
      reliabilityIndicator: 'Academic',
      isOfficial: true,
      crossCheckCount: 1,
      primaryOrSecondary: 'primary',
    },
  ];
  const conflicting: ResearchSource[] = [
    {
      id: 'c1',
      title: 'Study B',
      publisher: 'IEEE',
      publishDate: '2025',
      url: 'https://ieee.org',
      sourceType: 'academic',
      reliabilityIndicator: 'Academic',
      isOfficial: true,
      crossCheckCount: 1,
      primaryOrSecondary: 'primary',
    },
  ];

  const result = evaluateClaimStatus(supporting, conflicting);
  assert.equal(result.status, 'CONFLICTING EVIDENCE');
  assert.ok(result.neutralSummary?.includes('Sources present divergent findings'));
});

test('claimVerification identifies supported claims with high corroboration', () => {
  const supporting: ResearchSource[] = [
    {
      id: 's1',
      title: 'NIST Special Publication 800-63B',
      publisher: 'NIST',
      publishDate: '2024',
      url: 'https://nist.gov',
      sourceType: 'government',
      reliabilityIndicator: 'Government Standard',
      isOfficial: true,
      crossCheckCount: 3,
      primaryOrSecondary: 'primary',
    },
    {
      id: 's2',
      title: 'CISA Operational Directive',
      publisher: 'CISA',
      publishDate: '2025',
      url: 'https://cisa.gov',
      sourceType: 'official_advisory',
      reliabilityIndicator: 'Official Advisory',
      isOfficial: true,
      crossCheckCount: 3,
      primaryOrSecondary: 'primary',
    },
  ];

  const result = evaluateClaimStatus(supporting, []);
  assert.equal(result.status, 'SUPPORTED');
});

test('countries formatter handles custom and standard regions', () => {
  assert.equal(formatRegionLabel('US'), 'United States');
  assert.equal(formatRegionLabel('GLOBAL'), 'Global / Worldwide');
  assert.equal(formatRegionLabel('CUSTOM', 'Germany, France, Japan'), 'Germany, France, Japan');
  assert.equal(formatTimeRangeLabel('last_6_months'), 'Last 6 Months');
  assert.equal(formatTimeRangeLabel('custom', '2025 - 2026'), '2025 - 2026');
});

test('markdown report generation produces well-structured output', () => {
  const dummyProject: ResearchProject = {
    id: 'proj-1',
    title: 'Everyday Cybersecurity Test',
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
    config: {
      topic: 'Cybersecurity',
      depth: 'standard',
      timeRange: 'last_year',
      region: 'GLOBAL',
      sourceTypes: ['academic', 'government'],
      enablePromptInjectionDefense: true,
    },
    status: 'completed',
    progress: {
      currentStageId: 'report',
      percentage: 100,
      stages: [],
      recentLogs: [],
      discoveredSourceCount: 1,
      identifiedProblemCount: 1,
    },
    executiveSummary: 'This is a test executive summary.',
    problems: [
      {
        id: 'p-1',
        shortTitle: 'Credential Stuffing Vulnerability',
        oneSentenceSummary: 'Automated password reuse attacks across consumer accounts.',
        category: 'Identity',
        evidenceLevel: 'High',
        evidenceCount: 4,
        affectedSystems: ['Consumer email', 'Banking portals'],
        overview: {
          whatIsIt: 'Credential stuffing is an automated assault.',
          rootCauses: ['Password reuse'],
          mechanismOfOccurrence: 'Botnets replay leaked credentials.',
          whyItMatters: 'Massive account takeovers occur daily.',
        },
        realWorldImpact: {
          whoIsAffected: ['Everyday internet users'],
          systemsAffected: ['Web login endpoints'],
          consequences: ['Identity theft', 'Financial loss'],
          keyStatistics: [
            {
              stat: '84% of breaches involve stolen credentials',
              sourceId: 's-1',
              context: 'DBIR 2025',
            },
          ],
        },
        existingSolutions: [
          {
            id: 'sol-1',
            name: 'SMS OTP 2FA',
            type: 'Out-of-band authentication',
            howItWorks: 'Sends 6-digit code via SMS',
            whoUsesIt: 'Consumer banks',
            addressedProblem: 'Stolen passwords',
            evidenceOfExistence: 'Widespread consumer deployment',
            sourceIds: ['s-1'],
            limitations: {
              technical: 'Vulnerable to SS7 interception and SIM swapping',
              humanFactor: 'Users suffer authentication fatigue',
            },
            failurePoint: {
              conditionWorks: 'casual opportunistic attacker',
              conditionFails: 'targeted SIM swap or adversary-in-the-middle proxy',
              detailedExplanation: 'SMS protocols lack cryptographic binding to the browser origin.',
            },
          },
        ],
        unsolvedGaps: [
          {
            id: 'gap-1',
            title: 'Phishing-Resistant MFA Usability for Non-Technical Demographics',
            description: 'FIDO2 keys are cryptographically secure but have high recovery friction.',
            classification: 'poorly_solved',
            whyItStillExists: 'Backup key management is error-prone for non-experts.',
            evidenceBasis: 'Usable Security Research 2025',
            supportingSourceIds: ['s-1'],
          },
        ],
        improvementOpportunities: ['Passkey auto-sync across OS ecosystems'],
        innovationConcepts: [
          {
            id: 'inno-1',
            ideaName: 'Zero-Knowledge Biometric Vault Anchor',
            problemAddressed: 'Key recovery without phishing risk',
            coreConcept: 'Decentralized multi-party recovery using threshold cryptography',
            mechanismOfAction: 'Splits passkey seed into verifiable shares',
            improvementAdvantage: 'Eliminates single point of failure in key loss',
            targetedLimitation: 'Complex physical security key recovery',
            requiredTechnologies: ['Threshold ECDSA', 'WebAuthn PRF Extension'],
            potentialUsers: ['Elderly and everyday banking users'],
            implementationChallenges: ['Client compute overhead', 'Browser standard support'],
            risks: ['Social engineering of recovery guardians'],
            experimentalValidationNeeds: ['User recovery completion rates without support tickets'],
            feasibilityCheck: {
              isTechnicallyPlausible: true,
              plausibilityRationale: 'Threshold MPC primitives are mature in academic literature.',
              differentiators: 'No proprietary cloud key store required.',
              similarExistingSolutions: ['Turnkey MPC', 'iCloud Keychain sync'],
              criticalAssumptions: ['Browser supports WebAuthn PRF extension reliably'],
            },
            disclaimer: 'AI-generated innovation concept — not established or clinically/operationally validated',
          },
        ],
        technicalTerms: [
          {
            term: 'SIM Swapping',
            beginnerDefinition: 'When a criminal tricks your phone company into moving your number.',
            technicalDefinition: 'Fraudulent porting of IMSI to an adversary SIM card.',
            whyItMatters: 'Bypasses SMS-based two-factor authentication.',
            realWorldExample: 'Attacker calls carrier pretending to be the victim.',
            relatedConcepts: ['SS7 attack', '2FA interception'],
          },
        ],
        sourceIds: ['s-1'],
      },
    ],
    crossProblemPatterns: [],
    claims: [],
    sources: [
      {
        id: 's-1',
        title: '2025 Data Breach Investigations Report',
        publisher: 'Verizon / CISA',
        publishDate: '2025',
        url: 'https://example.com/dbir',
        sourceType: 'industry_report',
        reliabilityIndicator: 'Industry Benchmark',
        isOfficial: true,
        crossCheckCount: 5,
        primaryOrSecondary: 'primary',
      },
    ],
    globalTechnicalGlossary: [],
    allInnovationConcepts: [],
    metadata: {
      totalSourcesAnalyzed: 1,
      corroboratedClaimsRatio: '100%',
      regionsCovered: ['Global'],
      timeframe: 'Last Year',
      sourcesByType: {
        academic: 0,
        government: 0,
        official_advisory: 0,
        industry_report: 1,
        reputable_news: 0,
        social_media: 0,
        web: 0,
      },
    },
  };

  const md = generateMarkdownReport(dummyProject);
  assert.ok(md.includes('# Everyday Cybersecurity Test'));
  assert.ok(md.includes('Credential Stuffing Vulnerability'));
  assert.ok(md.includes('CRITICAL FAILURE POINT'));
  assert.ok(md.includes('AI-Generated Innovation Concept'));
});

test('authManager authenticates Owner credentials correctly and enforces RBAC', async () => {
  const { authManager } = await import('../server/auth.ts');
  
  // Test valid Owner authentication
  const ownerSession = authManager.authenticate('shahzaibjaffri', 'Armourer23119*2311');
  assert.ok(ownerSession, 'Owner session should be created');
  assert.equal(ownerSession?.role, 'Owner');
  assert.equal(ownerSession?.username, 'shahzaibjaffri');
  assert.equal(ownerSession?.permissions.canManageUsers, true);
  assert.equal(ownerSession?.permissions.canApprovePermissions, true);

  // Test invalid password rejection
  const badLogin = authManager.authenticate('shahzaibjaffri', 'WrongPassword123');
  assert.equal(badLogin, null);

  // Owner can create new user
  const createRes = authManager.createUser(ownerSession!, {
    username: 'testanalyst',
    password: 'SecurePassword2026!',
    name: 'Test Research Analyst',
    role: 'Researcher',
  });
  assert.equal(createRes.success, true);
  assert.equal(createRes.user?.username, 'testanalyst');

  // New user can authenticate
  const analystSession = authManager.authenticate('testanalyst', 'SecurePassword2026!');
  assert.ok(analystSession);
  assert.equal(analystSession?.role, 'Researcher');

  // Researcher CANNOT create another user (RBAC protected)
  const forbiddenCreate = authManager.createUser(analystSession!, {
    username: 'unauthorized_user',
    password: 'Password999!',
  });
  assert.equal(forbiddenCreate.success, false);
  assert.ok(forbiddenCreate.error?.includes('Unauthorized'));

  // Test Google authentication
  const googleSession = authManager.authenticateGoogle('analyst@example.com', 'Google User');
  assert.ok(googleSession);
  assert.equal(googleSession.loginMethod, 'google');

  // Test Random Account Generation by Owner
  const randomRes = authManager.createRandomAccount(ownerSession!);
  assert.equal(randomRes.success, true);
  assert.ok(randomRes.credentials?.username);
  assert.ok(randomRes.credentials?.password);
});

test('generateWordDocumentHtml produces valid Microsoft Word HTML with styled headers and sections', async () => {
  const { generateWordDocumentHtml } = await import('./exportUtils.ts');
  const { CYBERSECURITY_BENCHMARK_PROBLEMS, CYBERSECURITY_BENCHMARK_SOURCES, CYBERSECURITY_BENCHMARK_HIGHLIGHTS, CYBERSECURITY_BENCHMARK_STRATEGIES } = await import('../server/providers/mockResearchDatabase.ts');

  const testProject: ResearchProject = {
    id: 'test-doc-1',
    title: 'Word Export Verification Test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      topic: 'Cybersecurity Testing',
      depth: 'deep',
      timeRange: 'last_year',
      region: 'GLOBAL',
    },
    status: 'completed',
    progress: {
      currentStageId: 'report',
      percentage: 100,
      stages: [],
      recentLogs: [],
      discoveredSourceCount: 1,
      identifiedProblemCount: 1,
    },
    articleHighlights: CYBERSECURITY_BENCHMARK_HIGHLIGHTS,
    problemStrategies: CYBERSECURITY_BENCHMARK_STRATEGIES,
    problems: CYBERSECURITY_BENCHMARK_PROBLEMS,
    crossProblemPatterns: [],
    claims: [],
    sources: CYBERSECURITY_BENCHMARK_SOURCES,
    globalTechnicalGlossary: [],
    allInnovationConcepts: [],
    generatedVisuals: [],
    metadata: {
      totalSourcesAnalyzed: 5,
      corroboratedClaimsRatio: '88%',
      regionsCovered: ['Global'],
      timeframe: 'Past 12 Months',
      sourcesByType: {},
    },
  };

  const doc = generateWordDocumentHtml(testProject);
  assert.ok(doc.includes("urn:schemas-microsoft-com:office:word"));
  assert.ok(doc.includes('Word Export Verification Test'));
  assert.ok(doc.includes('Verified Articles & Source Takeaways'));
});

test('annotationUtils enforces role permissions for Manager and Admin', async () => {
  const { canUserAnnotate, getEvidenceFlagMeta, filterAnnotations, groupAnnotationsByTarget } = await import('./annotationUtils.ts');

  // Permissions check
  assert.equal(canUserAnnotate('Owner'), true, 'Owner must be able to annotate');
  assert.equal(canUserAnnotate('Admin'), true, 'Admin must be able to annotate');
  assert.equal(canUserAnnotate('Manager'), true, 'Manager must be able to annotate');
  assert.equal(canUserAnnotate('Researcher'), false, 'Researcher should have read-only access');
  assert.equal(canUserAnnotate('Moderator'), false, 'Moderator cannot annotate research findings');
  assert.equal(canUserAnnotate(null), false, 'Unauthenticated users cannot annotate');

  // Flag metadata check
  const verifiedMeta = getEvidenceFlagMeta('verified');
  assert.equal(verifiedMeta.label, 'Verified Evidence');
  assert.ok(verifiedMeta.badgeClass.includes('emerald'));

  const conflictingMeta = getEvidenceFlagMeta('conflicting');
  assert.equal(conflictingMeta.label, 'Conflicting Evidence');
  assert.ok(conflictingMeta.badgeClass.includes('amber'));

  // Filtering and grouping check
  const testAnnotations = [
    {
      id: 'ann-1',
      researchId: 'proj-1',
      targetType: 'finding' as const,
      targetId: 'problem-101',
      targetTitle: 'Credential Stuffing Vulnerability',
      highlightedText: '84% of breaches involve stolen credentials',
      comment: 'Verified with CISA and Verizon 2025 DBIR datasets.',
      flag: 'verified' as const,
      author: {
        userId: 'u1',
        username: 'manager_sarah',
        name: 'Sarah Chen (Lead Manager)',
        role: 'Manager' as const,
      },
      createdAt: '2026-10-21T10:00:00Z',
      resolved: false,
    },
    {
      id: 'ann-2',
      researchId: 'proj-1',
      targetType: 'finding' as const,
      targetId: 'problem-101',
      targetTitle: 'Credential Stuffing Vulnerability',
      highlightedText: 'SMS OTP 2FA failure points',
      comment: 'Conflicting claims on SS7 feasibility across legacy carriers.',
      flag: 'conflicting' as const,
      author: {
        userId: 'u2',
        username: 'admin_alex',
        name: 'Alex Vance (Security Admin)',
        role: 'Admin' as const,
      },
      createdAt: '2026-10-21T11:00:00Z',
      resolved: true,
    },
    {
      id: 'ann-3',
      researchId: 'proj-1',
      targetType: 'claim' as const,
      targetId: 'claim-201',
      targetTitle: 'Passkey adoption rate',
      comment: 'Review needed before executive briefing.',
      flag: 'needs_review' as const,
      author: {
        userId: 'u1',
        username: 'manager_sarah',
        name: 'Sarah Chen (Lead Manager)',
        role: 'Manager' as const,
      },
      createdAt: '2026-10-21T12:00:00Z',
      resolved: false,
    },
  ];

  // Test filter by active status
  const activeOnly = filterAnnotations(testAnnotations, { status: 'active' });
  assert.equal(activeOnly.length, 2);

  // Test filter by flag
  const conflictingOnly = filterAnnotations(testAnnotations, { flag: 'conflicting' });
  assert.equal(conflictingOnly.length, 1);
  assert.equal(conflictingOnly[0].id, 'ann-2');

  // Test query search
  const queryResult = filterAnnotations(testAnnotations, { query: 'CISA' });
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].id, 'ann-1');

  // Test group by target
  const grouped = groupAnnotationsByTarget(testAnnotations);
  assert.equal(grouped['problem-101'].length, 2);
  assert.equal(grouped['claim-201'].length, 1);
});
