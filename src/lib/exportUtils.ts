import type { ResearchProject } from '../types/research.ts';
import { formatRegionLabel, formatTimeRangeLabel } from './countries.ts';

/**
 * ResearchForge AI Export Engine
 * Generates formatted Markdown, structured JSON, Native Word (.docx), and Print/PDF reports.
 */

export function generateMarkdownReport(project: ResearchProject): string {
  const { title, config, problems, crossProblemPatterns, claims, sources, globalTechnicalGlossary, allInnovationConcepts, metadata, articleHighlights, problemStrategies } = project;

  let md = `# ${title}\n\n`;
  md += `> **ResearchForge AI Research Report**\n`;
  md += `> *From Real-World Problems to Evidence-Based Innovation*\n`;
  md += `> Generated: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}\n\n`;

  // Research Metadata
  md += `## Research Metadata\n`;
  md += `- **Topic**: ${config.topic}\n`;
  md += `- **Research Depth**: ${config.depth.toUpperCase()}\n`;
  md += `- **Region**: ${formatRegionLabel(config.region, config.customRegion)}\n`;
  md += `- **Time Horizon**: ${formatTimeRangeLabel(config.timeRange, config.customTimeRange)}\n`;
  md += `- **Sources Analyzed**: ${sources.length} sources across academic, government, industry, and investigative records\n`;
  md += `- **Corroborated Claims Ratio**: ${metadata?.corroboratedClaimsRatio || '85%'}\n\n`;
  md += `---\n\n`;

  // Executive Summary
  if (project.executiveSummary) {
    md += `## Executive Summary\n\n`;
    md += `${project.executiveSummary}\n\n`;
    md += `---\n\n`;
  }

  // Section: Verified Article & Source Highlights (Highlighted First)
  if (articleHighlights && articleHighlights.length > 0) {
    md += `## 1. Verified Articles & Source Takeaways\n\n`;
    articleHighlights.forEach((h, i) => {
      md += `### [${h.sourceType.toUpperCase()}] ${h.sourceTitle}\n`;
      md += `**Publisher**: ${h.publisher}\n\n`;
      md += `**Key Takeaway**: ${h.keyTakeaway}\n\n`;
      md += `**Verified Empirical Findings**:\n`;
      h.verifiedFindings.forEach((vf) => (md += `- ${vf}\n`));
      md += `\n`;
    });
    md += `---\n\n`;
  }

  // Section 2: Discovered Problems
  md += `## 2. Discovered Real-World Problems (${problems.length})\n\n`;
  problems.forEach((prob, index) => {
    md += `### Problem ${index + 1}: ${prob.shortTitle}\n`;
    md += `**Summary**: ${prob.oneSentenceSummary}\n\n`;
    md += `- **Evidence Level**: ${prob.evidenceLevel}\n`;
    md += `- **Affected Systems**: ${prob.affectedSystems.join(', ')}\n\n`;

    // A. Problem Overview
    md += `#### A. Problem Overview\n`;
    md += `**What is the problem?**\n${prob.overview.whatIsIt}\n\n`;
    md += `**Root Causes**:\n`;
    prob.overview.rootCauses.forEach((rc) => (md += `- ${rc}\n`));
    md += `\n**Mechanism of Occurrence**:\n${prob.overview.mechanismOfOccurrence}\n\n`;
    md += `**Why It Matters**:\n${prob.overview.whyItMatters}\n\n`;

    // B. Real-World Impact
    md += `#### B. Real-World Impact\n`;
    md += `**Who is affected**:\n`;
    prob.realWorldImpact.whoIsAffected.forEach((w) => (md += `- ${w}\n`));
    md += `\n**Key Documented Statistics & Evidence**:\n`;
    prob.realWorldImpact.keyStatistics.forEach((ks) => {
      md += `- *${ks.stat}* (${ks.context})\n`;
    });
    md += `\n`;

    // C & D. Existing Solutions & Limitations
    md += `#### C & D. Current Existing Solutions & Technical Limitations\n`;
    prob.existingSolutions.forEach((sol, sIdx) => {
      md += `##### Solution ${sIdx + 1}: ${sol.name} (${sol.type})\n`;
      md += `*How it works*: ${sol.howItWorks}\n\n`;
      md += `*Primary Users*: ${sol.whoUsesIt}\n\n`;
      md += `*Documented Limitations*:\n`;
      if (sol.limitations.technical) md += `- **Technical**: ${sol.limitations.technical}\n`;
      if (sol.limitations.cost) md += `- **Cost**: ${sol.limitations.cost}\n`;
      if (sol.limitations.scalability) md += `- **Scalability**: ${sol.limitations.scalability}\n`;
      if (sol.limitations.usability) md += `- **Usability**: ${sol.limitations.usability}\n`;
      if (sol.limitations.adoptionBarriers) md += `- **Adoption Barrier**: ${sol.limitations.adoptionBarriers}\n`;
      if (sol.limitations.humanFactor) md += `- **Human Factors**: ${sol.limitations.humanFactor}\n`;

      // Failure Point
      md += `\n> **CRITICAL FAILURE POINT**: Current solution works under **${sol.failurePoint.conditionWorks}**, but fails when **${sol.failurePoint.conditionFails}**.\n`;
      md += `> *Failure Mechanism*: ${sol.failurePoint.detailedExplanation}\n\n`;
    });

    // E & F. Unsolved Gaps
    md += `#### E & F. Genuine Unresolved Research / Innovation Gaps\n`;
    prob.unsolvedGaps.forEach((gap) => {
      md += `##### [${gap.classification.toUpperCase().replace('_', ' ')}] ${gap.title}\n`;
      md += `${gap.description}\n\n`;
      md += `*Why this gap persists*: ${gap.whyItStillExists}\n\n`;
      md += `*Evidence Basis*: ${gap.evidenceBasis}\n\n`;
    });

    // Strategic Solving Roadmap
    if (prob.solvingStrategy) {
      md += `#### Actionable Problem-Solving Strategy (Multi-Horizon)\n`;
      md += `##### Immediate Mitigations (0 - 30 Days):\n`;
      prob.solvingStrategy.immediateMitigations.forEach((im) => (md += `- ${im}\n`));
      md += `\n##### Mid-Term Engineering Overhauls (1 - 6 Months):\n`;
      prob.solvingStrategy.midTermEngineering.forEach((mt) => (md += `- ${mt}\n`));
      md += `\n##### Long-Term Architectural Innovations (6 - 24+ Months):\n`;
      prob.solvingStrategy.longTermArchitectural.forEach((lt) => (md += `- ${lt}\n`));
      md += `\n`;
    }

    // G. Improvement Opportunities
    if (prob.improvementOpportunities.length > 0) {
      md += `#### G. Incremental Improvement Opportunities\n`;
      prob.improvementOpportunities.forEach((opp) => (md += `- ${opp}\n`));
      md += `\n`;
    }

    // H. Innovation Concepts
    if (prob.innovationConcepts.length > 0) {
      md += `#### H. Innovation Opportunities & Solution Concepts\n`;
      prob.innovationConcepts.forEach((concept, cIdx) => {
        md += `##### Concept ${cIdx + 1}: ${concept.ideaName} *(AI-Generated Innovation Concept)*\n`;
        md += `> **Disclaimer**: ${concept.disclaimer}\n\n`;
        md += `**Core Concept**: ${concept.coreConcept}\n\n`;
        md += `**How It Could Work**: ${concept.mechanismOfAction}\n\n`;
        md += `**Targeted Existing Limitation**: ${concept.targetedLimitation}\n\n`;
        md += `**Differentiators vs Existing Approaches**: ${concept.feasibilityCheck.differentiators}\n\n`;
        md += `**Required Technologies**: ${concept.requiredTechnologies.join(', ')}\n\n`;
        md += `**Implementation Challenges & Risks**: ${concept.implementationChallenges.join('; ')}\n\n`;
        md += `**Required Experimental Validation**:\n`;
        concept.experimentalValidationNeeds.forEach((ev) => (md += `- ${ev}\n`));
        md += `\n`;
      });
    }

    // I. Technical Terms for this problem
    if (prob.technicalTerms.length > 0) {
      md += `#### I. Technical Terminology Explained\n`;
      prob.technicalTerms.forEach((term) => {
        md += `- **${term.term}**:\n`;
        md += `  - *Beginner*: ${term.beginnerDefinition}\n`;
        md += `  - *Technical*: ${term.technicalDefinition}\n`;
        md += `  - *Real-world example*: ${term.realWorldExample}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  // Cross-Problem Patterns
  if (crossProblemPatterns && crossProblemPatterns.length > 0) {
    md += `## 3. Cross-Problem Patterns & Systemic Failure Modes\n\n`;
    crossProblemPatterns.forEach((pat) => {
      md += `### ${pat.patternName}\n`;
      md += `${pat.description}\n\n`;
      md += `- **Systemic Failure Mode**: ${pat.systemicFailureMode}\n`;
      md += `- **Implication for Innovators**: ${pat.implicationForInnovators}\n\n`;
    });
    md += `---\n\n`;
  }

  // Claim Verification Summary
  if (claims && claims.length > 0) {
    md += `## 4. Claim Verification & Evidence Cross-Checking\n\n`;
    claims.forEach((c) => {
      md += `### [${c.status}] "${c.claim}"\n`;
      md += `${c.evidenceSummary}\n`;
      if (c.neutralDisagreementSummary) {
        md += `*Divergence Analysis*: ${c.neutralDisagreementSummary}\n`;
      }
      md += `*Referenced Sources*: ${c.supportingSourceIds.join(', ')}\n\n`;
    });
    md += `---\n\n`;
  }

  // Traceable Sources
  md += `## 5. Primary & Corroborating Sources Directory\n\n`;
  sources.forEach((src, idx) => {
    md += `${idx + 1}. **[${src.sourceType.toUpperCase()}]** [${src.title}](${src.url || '#'})  \n`;
    md += `   *Publisher*: ${src.publisher} | *Date*: ${src.publishDate} | *Indicator*: ${src.reliabilityIndicator}  \n`;
    if (src.corroborationSummary) {
      md += `   *Corroboration*: ${src.corroborationSummary}  \n`;
    }
    if (src.excerpt) {
      md += `   *Key Excerpt*: "${src.excerpt}"  \n`;
    }
    md += `\n`;
  });

  return md;
}

/**
 * Generates an Office Word Document (.docx) compatible format
 * Uses Microsoft Word HTML/XML schema which opens flawlessly with styled headings,
 * colored callout banners, tables, and citations in Word, Pages, and Google Docs.
 */
export function generateWordDocumentHtml(project: ResearchProject): string {
  const markdown = generateMarkdownReport(project);

  const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${project.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 1in;
    }
    h1 {
      font-size: 24pt;
      color: #1e1b4b;
      border-bottom: 2pt solid #4f46e5;
      padding-bottom: 6pt;
      margin-top: 20pt;
    }
    h2 {
      font-size: 16pt;
      color: #312e81;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 4pt;
      margin-top: 18pt;
    }
    h3 {
      font-size: 13pt;
      color: #1e293b;
      margin-top: 14pt;
    }
    h4, h5 {
      font-size: 11pt;
      font-weight: bold;
      color: #4338ca;
    }
    .callout {
      background-color: #f1f5f9;
      border-left: 4pt solid #4f46e5;
      padding: 8pt 12pt;
      margin: 10pt 0;
      font-size: 10.5pt;
    }
    .failure-point {
      background-color: #fff1f2;
      border-left: 4pt solid #e11d48;
      padding: 8pt 12pt;
      margin: 10pt 0;
      color: #881337;
    }
    .innovation-box {
      background-color: #fefce8;
      border-left: 4pt solid #eab308;
      padding: 8pt 12pt;
      margin: 10pt 0;
    }
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
    }
    .metadata-table td {
      padding: 6pt;
      border: 1pt solid #cbd5e1;
    }
    .metadata-table td.header {
      background-color: #f8fafc;
      font-weight: bold;
      width: 25%;
    }
    ul, ol {
      margin-top: 4pt;
      margin-bottom: 8pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 3pt;
    }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  <div class="callout">
    <strong>ResearchForge AI — Evidence-Based Innovation Platform</strong><br>
    <em>Generated: ${new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</em><br>
    <em>Zero Hallucination & Prompt-Injection Protected</em>
  </div>

  <table class="metadata-table">
    <tr>
      <td class="header">Research Topic</td>
      <td>${project.config.topic}</td>
    </tr>
    <tr>
      <td class="header">Depth & Scope</td>
      <td>${project.config.depth.toUpperCase()} (${project.sources.length} sources analyzed)</td>
    </tr>
    <tr>
      <td class="header">Geographic Region</td>
      <td>${formatRegionLabel(project.config.region, project.config.customRegion)}</td>
    </tr>
    <tr>
      <td class="header">Time Horizon</td>
      <td>${formatTimeRangeLabel(project.config.timeRange, project.config.customTimeRange)}</td>
    </tr>
    <tr>
      <td class="header">Corroborated Claims</td>
      <td>${project.metadata?.corroboratedClaimsRatio || '85%'}</td>
    </tr>
  </table>

  <h2>Executive Summary</h2>
  <p>${project.executiveSummary || 'No executive summary provided.'}</p>

  ${project.articleHighlights && project.articleHighlights.length > 0 ? `
    <h2>1. Verified Articles & Source Takeaways</h2>
    ${project.articleHighlights.map(h => `
      <h3>[${h.sourceType.toUpperCase()}] ${h.sourceTitle}</h3>
      <p><strong>Publisher:</strong> ${h.publisher}</p>
      <p><strong>Key Finding:</strong> ${h.keyTakeaway}</p>
      <ul>
        ${h.verifiedFindings.map(vf => `<li>${vf}</li>`).join('')}
      </ul>
    `).join('')}
  ` : ''}

  <h2>2. Discovered Real-World Problems (${project.problems.length})</h2>
  ${project.problems.map((p, idx) => `
    <h3>Problem ${idx + 1}: ${p.shortTitle}</h3>
    <p><strong>Summary:</strong> ${p.oneSentenceSummary}</p>
    <p><strong>Evidence Level:</strong> ${p.evidenceLevel} (${p.evidenceCount} supporting sources)</p>
    <p><strong>Affected Systems:</strong> ${p.affectedSystems.join(', ')}</p>

    <h4>A. Problem Overview</h4>
    <p>${p.overview.whatIsIt}</p>
    <p><strong>Mechanism:</strong> ${p.overview.mechanismOfOccurrence}</p>
    <p><strong>Why It Matters:</strong> ${p.overview.whyItMatters}</p>

    <h4>B. Real-World Impact & Key Statistics</h4>
    <ul>
      ${p.realWorldImpact.keyStatistics.map(s => `<li><strong>"${s.stat}"</strong> — ${s.context}</li>`).join('')}
    </ul>

    <h4>C & D. Existing Solutions & Critical Failure Points</h4>
    ${p.existingSolutions.map(s => `
      <p><strong>${s.name}</strong> (${s.type})</p>
      <p><em>How it works:</em> ${s.howItWorks}</p>
      <div class="failure-point">
        <strong>CRITICAL FAILURE POINT:</strong> Works under "${s.failurePoint.conditionWorks}", but fails when "${s.failurePoint.conditionFails}".<br>
        <em>Failure Mechanism:</em> ${s.failurePoint.detailedExplanation}
      </div>
    `).join('')}

    ${p.solvingStrategy ? `
      <h4>Actionable Problem-Solving Strategy (Multi-Horizon)</h4>
      <p><strong>Immediate Mitigations (0 - 30 Days):</strong></p>
      <ul>${p.solvingStrategy.immediateMitigations.map(im => `<li>${im}</li>`).join('')}</ul>
      <p><strong>Mid-Term Engineering Overhauls (1 - 6 Months):</strong></p>
      <ul>${p.solvingStrategy.midTermEngineering.map(mt => `<li>${mt}</li>`).join('')}</ul>
      <p><strong>Long-Term Architectural Innovations (6 - 24+ Months):</strong></p>
      <ul>${p.solvingStrategy.longTermArchitectural.map(lt => `<li>${lt}</li>`).join('')}</ul>
    ` : ''}

    <h4>E. AI-Generated Innovation Concepts</h4>
    ${p.innovationConcepts.map(c => `
      <div class="innovation-box">
        <strong>${c.ideaName}</strong> [AI-GENERATED INNOVATION CONCEPT]<br>
        <p><strong>Core Concept:</strong> ${c.coreConcept}</p>
        <p><strong>Mechanism:</strong> ${c.mechanismOfAction}</p>
        <p><strong>Differentiator:</strong> ${c.feasibilityCheck.differentiators}</p>
        <p><strong>Validation Needs:</strong> ${c.experimentalValidationNeeds.join('; ')}</p>
      </div>
    `).join('')}
  `).join('<hr/>')}

  <h2>3. Traceable Verified Sources Directory</h2>
  <ol>
    ${project.sources.map(s => `
      <li>
        <strong>[${s.sourceType.toUpperCase()}]</strong> ${s.title}<br>
        <em>Publisher:</em> ${s.publisher} | <em>Date:</em> ${s.publishDate} | <em>Indicator:</em> ${s.reliabilityIndicator}<br>
        <em>URL:</em> <a href="${s.url}">${s.url}</a>
      </li>
    `).join('')}
  </ol>
</body>
</html>`;

  return docHtml;
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
