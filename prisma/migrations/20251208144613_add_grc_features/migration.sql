-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "controlType" TEXT NOT NULL,
    "owner" TEXT,
    "controlRisk" TEXT,
    "evidenceRequirements" TEXT,
    "confidence" REAL,
    "llmProvenance" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "FrameworkMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "frameworkControlId" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "mappingSource" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FrameworkMapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FrameworkMapping_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT,
    "controlId" TEXT,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "drivers" TEXT NOT NULL,
    "recommendedActions" TEXT NOT NULL,
    "llmConfidence" REAL,
    "llmProvenance" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Risk_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT,
    "riskId" TEXT,
    "vendorId" TEXT,
    "evidenceType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "fileHash" TEXT,
    "extractedData" TEXT,
    "summary" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "uploadedBy" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evidence_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evidence_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attestation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "attestedBy" TEXT NOT NULL,
    "attestedAt" DATETIME NOT NULL,
    "validUntil" DATETIME,
    "signature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "contactEmail" TEXT,
    "riskScore" INTEGER,
    "lastAssessmentDate" DATETIME,
    "nextReviewDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VendorAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "questionnaire" TEXT NOT NULL,
    "gaps" TEXT,
    "rating" TEXT,
    "remediationPlan" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorAssessment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "controlId" TEXT,
    "owner" TEXT NOT NULL,
    "assignee" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'open',
    "severity" TEXT NOT NULL,
    "playbook" TEXT,
    "linkedTicket" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT
);

-- CreateIndex
CREATE INDEX "Control_controlType_idx" ON "Control"("controlType");

-- CreateIndex
CREATE INDEX "Control_owner_idx" ON "Control"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_name_key" ON "Framework"("name");

-- CreateIndex
CREATE INDEX "Framework_name_idx" ON "Framework"("name");

-- CreateIndex
CREATE INDEX "FrameworkMapping_controlId_idx" ON "FrameworkMapping"("controlId");

-- CreateIndex
CREATE INDEX "FrameworkMapping_frameworkId_idx" ON "FrameworkMapping"("frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkMapping_controlId_frameworkId_frameworkControlId_key" ON "FrameworkMapping"("controlId", "frameworkId", "frameworkControlId");

-- CreateIndex
CREATE INDEX "Risk_controlId_idx" ON "Risk"("controlId");

-- CreateIndex
CREATE INDEX "Risk_status_idx" ON "Risk"("status");

-- CreateIndex
CREATE INDEX "Risk_category_idx" ON "Risk"("category");

-- CreateIndex
CREATE INDEX "Risk_score_idx" ON "Risk"("score");

-- CreateIndex
CREATE INDEX "Evidence_controlId_idx" ON "Evidence"("controlId");

-- CreateIndex
CREATE INDEX "Evidence_riskId_idx" ON "Evidence"("riskId");

-- CreateIndex
CREATE INDEX "Evidence_vendorId_idx" ON "Evidence"("vendorId");

-- CreateIndex
CREATE INDEX "Evidence_evidenceType_idx" ON "Evidence"("evidenceType");

-- CreateIndex
CREATE INDEX "Attestation_controlId_idx" ON "Attestation"("controlId");

-- CreateIndex
CREATE INDEX "Attestation_status_idx" ON "Attestation"("status");

-- CreateIndex
CREATE INDEX "Vendor_criticality_idx" ON "Vendor"("criticality");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_riskScore_idx" ON "Vendor"("riskScore");

-- CreateIndex
CREATE INDEX "VendorAssessment_vendorId_idx" ON "VendorAssessment"("vendorId");

-- CreateIndex
CREATE INDEX "VendorAssessment_assessmentType_idx" ON "VendorAssessment"("assessmentType");

-- CreateIndex
CREATE INDEX "Action_controlId_idx" ON "Action"("controlId");

-- CreateIndex
CREATE INDEX "Action_owner_idx" ON "Action"("owner");

-- CreateIndex
CREATE INDEX "Action_assignee_idx" ON "Action"("assignee");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE INDEX "Action_severity_idx" ON "Action"("severity");

-- CreateIndex
CREATE INDEX "AuditPack_generatedBy_idx" ON "AuditPack"("generatedBy");

-- CreateIndex
CREATE INDEX "AuditPack_generatedAt_idx" ON "AuditPack"("generatedAt");
