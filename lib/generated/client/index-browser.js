
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  role: 'role',
  mfaSecret: 'mfaSecret',
  mfaEnabled: 'mfaEnabled',
  hasUsedDemo: 'hasUsedDemo',
  password: 'password',
  orgId: 'orgId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.InvitationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  role: 'role',
  invitedBy: 'invitedBy',
  organizationId: 'organizationId',
  expires: 'expires',
  createdAt: 'createdAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  key: 'key',
  value: 'value',
  description: 'description',
  isSecret: 'isSecret',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sections: 'sections',
  timestamp: 'timestamp'
};

exports.Prisma.ControlScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  controlType: 'controlType',
  owner: 'owner',
  controlRisk: 'controlRisk',
  evidenceRequirements: 'evidenceRequirements',
  confidence: 'confidence',
  llmProvenance: 'llmProvenance',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.FrameworkScalarFieldEnum = {
  id: 'id',
  name: 'name',
  version: 'version',
  jurisdiction: 'jurisdiction',
  description: 'description'
};

exports.Prisma.FrameworkRequirementScalarFieldEnum = {
  id: 'id',
  frameworkId: 'frameworkId',
  requirementId: 'requirementId',
  title: 'title',
  description: 'description',
  category: 'category',
  priority: 'priority',
  createdAt: 'createdAt'
};

exports.Prisma.FrameworkMappingScalarFieldEnum = {
  id: 'id',
  controlId: 'controlId',
  frameworkId: 'frameworkId',
  frameworkControlId: 'frameworkControlId',
  requirementId: 'requirementId',
  description: 'description',
  confidence: 'confidence',
  mappingSource: 'mappingSource',
  createdAt: 'createdAt'
};

exports.Prisma.RiskScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  likelihood: 'likelihood',
  impact: 'impact',
  score: 'score',
  category: 'category',
  narrative: 'narrative',
  drivers: 'drivers',
  recommendedActions: 'recommendedActions',
  status: 'status',
  controlId: 'controlId',
  owner: 'owner',
  llmConfidence: 'llmConfidence',
  llmProvenance: 'llmProvenance',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  criticality: 'criticality',
  services: 'services',
  riskScore: 'riskScore',
  status: 'status',
  contactEmail: 'contactEmail',
  lastAssessmentDate: 'lastAssessmentDate',
  owner: 'owner',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.VendorAssessmentScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  assessmentDate: 'assessmentDate',
  assessor: 'assessor',
  questionsAsked: 'questionsAsked',
  questionsAnswered: 'questionsAnswered',
  riskScore: 'riskScore',
  findings: 'findings',
  recommendations: 'recommendations',
  status: 'status'
};

exports.Prisma.EvidenceScalarFieldEnum = {
  id: 'id',
  controlId: 'controlId',
  riskId: 'riskId',
  vendorId: 'vendorId',
  requirementId: 'requirementId',
  evidenceType: 'evidenceType',
  source: 'source',
  auditPeriod: 'auditPeriod',
  description: 'description',
  fileUrl: 'fileUrl',
  fileName: 'fileName',
  extractedData: 'extractedData',
  summary: 'summary',
  verificationStatus: 'verificationStatus',
  status: 'status',
  reviewer: 'reviewer',
  reviewedAt: 'reviewedAt',
  reviewNotes: 'reviewNotes',
  nextReviewDate: 'nextReviewDate',
  uploadedBy: 'uploadedBy',
  timestamp: 'timestamp',
  organizationId: 'organizationId',
  integrationId: 'integrationId'
};

exports.Prisma.EvidenceFileScalarFieldEnum = {
  id: 'id',
  evidenceId: 'evidenceId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  fileType: 'fileType',
  uploadedBy: 'uploadedBy',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.AttestationScalarFieldEnum = {
  id: 'id',
  controlId: 'controlId',
  statement: 'statement',
  attestedBy: 'attestedBy',
  attestedAt: 'attestedAt',
  validUntil: 'validUntil',
  signature: 'signature',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.PlaybookScalarFieldEnum = {
  id: 'id',
  scenario: 'scenario',
  description: 'description',
  steps: 'steps',
  llmModel: 'llmModel',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.RiskControlScalarFieldEnum = {
  id: 'id',
  riskId: 'riskId',
  controlId: 'controlId',
  effectiveness: 'effectiveness',
  residualRisk: 'residualRisk',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncidentRiskScalarFieldEnum = {
  id: 'id',
  incidentId: 'incidentId',
  riskId: 'riskId',
  impactType: 'impactType',
  createdAt: 'createdAt'
};

exports.Prisma.VendorRiskScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  riskId: 'riskId',
  riskType: 'riskType',
  createdAt: 'createdAt'
};

exports.Prisma.ActionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  description: 'description',
  playbook: 'playbook',
  status: 'status',
  priority: 'priority',
  assignedTo: 'assignedTo',
  dueDate: 'dueDate',
  controlId: 'controlId',
  incidentId: 'incidentId',
  owner: 'owner',
  parentType: 'parentType',
  parentId: 'parentId',
  expectedRiskReduction: 'expectedRiskReduction',
  createdAt: 'createdAt',
  completedAt: 'completedAt',
  updatedAt: 'updatedAt',
  riskId: 'riskId',
  organizationId: 'organizationId'
};

exports.Prisma.PolicyScalarFieldEnum = {
  id: 'id',
  title: 'title',
  version: 'version',
  content: 'content',
  scope: 'scope',
  status: 'status',
  owner: 'owner',
  reviewDate: 'reviewDate',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.IncidentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  severity: 'severity',
  status: 'status',
  reportedBy: 'reportedBy',
  assignedTo: 'assignedTo',
  rootCause: 'rootCause',
  remediation: 'remediation',
  createdAt: 'createdAt',
  resolvedAt: 'resolvedAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.ChangeScalarFieldEnum = {
  id: 'id',
  changeNumber: 'changeNumber',
  title: 'title',
  description: 'description',
  justification: 'justification',
  changeType: 'changeType',
  category: 'category',
  priority: 'priority',
  impactLevel: 'impactLevel',
  urgency: 'urgency',
  complexity: 'complexity',
  riskScore: 'riskScore',
  requestedDate: 'requestedDate',
  plannedStartDate: 'plannedStartDate',
  plannedEndDate: 'plannedEndDate',
  actualStartDate: 'actualStartDate',
  actualEndDate: 'actualEndDate',
  implementationPlan: 'implementationPlan',
  backoutPlan: 'backoutPlan',
  testingPlan: 'testingPlan',
  affectedSystems: 'affectedSystems',
  affectedUsers: 'affectedUsers',
  status: 'status',
  currentStage: 'currentStage',
  requestedBy: 'requestedBy',
  assignedTo: 'assignedTo',
  implementedBy: 'implementedBy',
  reviewedBy: 'reviewedBy',
  requiresCAB: 'requiresCAB',
  cabMeetingDate: 'cabMeetingDate',
  approvalStatus: 'approvalStatus',
  implementationNotes: 'implementationNotes',
  actualImpact: 'actualImpact',
  lessonsLearned: 'lessonsLearned',
  success: 'success',
  complianceChecked: 'complianceChecked',
  securityReviewed: 'securityReviewed',
  parentChangeId: 'parentChangeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.ChangeApprovalScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  approverRole: 'approverRole',
  approverEmail: 'approverEmail',
  approverName: 'approverName',
  decision: 'decision',
  comments: 'comments',
  conditions: 'conditions',
  approvedAt: 'approvedAt'
};

exports.Prisma.ChangeTaskScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  taskNumber: 'taskNumber',
  description: 'description',
  assignedTo: 'assignedTo',
  status: 'status',
  dueDate: 'dueDate',
  completedAt: 'completedAt',
  notes: 'notes'
};

exports.Prisma.ChangeRiskScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  riskId: 'riskId',
  description: 'description',
  likelihood: 'likelihood',
  impact: 'impact',
  mitigation: 'mitigation',
  status: 'status',
  impactType: 'impactType',
  createdAt: 'createdAt'
};

exports.Prisma.ChangeImpactScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  impactArea: 'impactArea',
  description: 'description',
  severity: 'severity',
  affectedCount: 'affectedCount'
};

exports.Prisma.ChangeCommentScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  authorEmail: 'authorEmail',
  authorName: 'authorName',
  comment: 'comment',
  commentType: 'commentType',
  createdAt: 'createdAt'
};

exports.Prisma.ChangeAttachmentScalarFieldEnum = {
  id: 'id',
  changeId: 'changeId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  uploadedBy: 'uploadedBy',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.CABMemberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  role: 'role',
  department: 'department',
  expertise: 'expertise',
  active: 'active',
  createdAt: 'createdAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  securitySettings: 'securitySettings',
  plan: 'plan',
  subscriptionStatus: 'subscriptionStatus',
  billingCycle: 'billingCycle',
  nextBillingDate: 'nextBillingDate',
  assessmentLimit: 'assessmentLimit',
  assessmentsUsed: 'assessmentsUsed',
  storageLimit: 'storageLimit',
  storageUsed: 'storageUsed',
  features: 'features'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userName: 'userName',
  userEmail: 'userEmail',
  resource: 'resource',
  resourceId: 'resourceId',
  action: 'action',
  changes: 'changes',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  integrityHash: 'integrityHash',
  organizationId: 'organizationId',
  timestamp: 'timestamp'
};

exports.Prisma.TrustRequestScalarFieldEnum = {
  id: 'id',
  email: 'email',
  company: 'company',
  reason: 'reason',
  status: 'status',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.LLMUsageScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  model: 'model',
  tokensIn: 'tokensIn',
  tokensOut: 'tokensOut',
  cost: 'cost',
  feature: 'feature',
  timestamp: 'timestamp'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  provider: 'provider',
  name: 'name',
  status: 'status',
  encryptedCredentials: 'encryptedCredentials',
  config: 'config',
  lastSyncAt: 'lastSyncAt',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LLMCacheScalarFieldEnum = {
  id: 'id',
  promptHash: 'promptHash',
  response: 'response',
  model: 'model',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  planId: 'planId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  lemonSqueezyCustomerId: 'lemonSqueezyCustomerId',
  lemonSqueezySubscriptionId: 'lemonSqueezySubscriptionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  amount: 'amount',
  currency: 'currency',
  lemonSqueezyOrderId: 'lemonSqueezyOrderId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RiskHistoryScalarFieldEnum = {
  id: 'id',
  riskId: 'riskId',
  score: 'score',
  likelihood: 'likelihood',
  impact: 'impact',
  calculatedAt: 'calculatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.AuditScalarFieldEnum = {
  id: 'id',
  title: 'title',
  auditType: 'auditType',
  framework: 'framework',
  scope: 'scope',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  auditorName: 'auditorName',
  auditorOrg: 'auditorOrg',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.AuditFindingScalarFieldEnum = {
  id: 'id',
  auditId: 'auditId',
  controlId: 'controlId',
  severity: 'severity',
  title: 'title',
  description: 'description',
  recommendation: 'recommendation',
  status: 'status',
  dueDate: 'dueDate',
  remediationPlan: 'remediationPlan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ControlTestScalarFieldEnum = {
  id: 'id',
  auditId: 'auditId',
  controlId: 'controlId',
  testDate: 'testDate',
  testProcedure: 'testProcedure',
  sampleSize: 'sampleSize',
  result: 'result',
  notes: 'notes',
  evidenceId: 'evidenceId',
  createdAt: 'createdAt'
};

exports.Prisma.PolicyControlScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  controlId: 'controlId',
  relationship: 'relationship',
  createdAt: 'createdAt'
};

exports.Prisma.PolicyVersionScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  version: 'version',
  content: 'content',
  changes: 'changes',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.PolicyAttestationScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  userId: 'userId',
  attestedAt: 'attestedAt',
  signature: 'signature'
};

exports.Prisma.IncidentControlScalarFieldEnum = {
  id: 'id',
  incidentId: 'incidentId',
  controlId: 'controlId',
  bypassType: 'bypassType',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.GapScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  severity: 'severity',
  framework: 'framework',
  impact: 'impact',
  remediationPlan: 'remediationPlan',
  effort: 'effort',
  timeline: 'timeline',
  status: 'status',
  owner: 'owner',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RemediationStepScalarFieldEnum = {
  id: 'id',
  gapId: 'gapId',
  stepNumber: 'stepNumber',
  description: 'description',
  assignedTo: 'assignedTo',
  dueDate: 'dueDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BCDRPlanScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  status: 'status',
  description: 'description',
  rto: 'rto',
  rpo: 'rpo',
  mtpd: 'mtpd',
  owner: 'owner',
  lastTested: 'lastTested',
  nextTestDate: 'nextTestDate',
  version: 'version',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DRTestScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  title: 'title',
  testDate: 'testDate',
  type: 'type',
  status: 'status',
  results: 'results',
  findings: 'findings',
  attendees: 'attendees',
  duration: 'duration',
  passRate: 'passRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssetScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  category: 'category',
  status: 'status',
  criticality: 'criticality',
  owner: 'owner',
  location: 'location',
  description: 'description',
  purchaseDate: 'purchaseDate',
  endOfLife: 'endOfLife',
  value: 'value',
  confidentiality: 'confidentiality',
  integrity: 'integrity',
  availability: 'availability',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssetRiskScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  riskId: 'riskId'
};

exports.Prisma.AssetControlScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  controlId: 'controlId'
};

exports.Prisma.BusinessProcessScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  owner: 'owner',
  criticality: 'criticality',
  status: 'status',
  rto: 'rto',
  rpo: 'rpo',
  dependencies: 'dependencies',
  stakeholders: 'stakeholders',
  bcdrPlanId: 'bcdrPlanId',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionnaireScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  status: 'status',
  version: 'version',
  owner: 'owner',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  questionnaireId: 'questionnaireId',
  text: 'text',
  type: 'type',
  options: 'options',
  required: 'required',
  order: 'order',
  weight: 'weight'
};

exports.Prisma.QuestionnaireResponseScalarFieldEnum = {
  id: 'id',
  questionnaireId: 'questionnaireId',
  respondentEmail: 'respondentEmail',
  respondentName: 'respondentName',
  status: 'status',
  score: 'score',
  submittedAt: 'submittedAt',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnswerScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  responseId: 'responseId',
  value: 'value',
  score: 'score'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  department: 'department',
  role: 'role',
  manager: 'manager',
  status: 'status',
  hireDate: 'hireDate',
  lastTrainingDate: 'lastTrainingDate',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PolicyAcknowledgmentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  policyId: 'policyId',
  acknowledgedAt: 'acknowledgedAt',
  version: 'version'
};

exports.Prisma.TrainingCourseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  duration: 'duration',
  mandatory: 'mandatory',
  content: 'content',
  passingScore: 'passingScore',
  status: 'status',
  frequency: 'frequency',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingAssignmentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  courseId: 'courseId',
  assignedAt: 'assignedAt',
  dueDate: 'dueDate',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  score: 'score',
  attempts: 'attempts',
  status: 'status'
};

exports.Prisma.TrainingCertificateScalarFieldEnum = {
  id: 'id',
  assignmentId: 'assignmentId',
  employeeId: 'employeeId',
  courseId: 'courseId',
  certificateNumber: 'certificateNumber',
  issuedAt: 'issuedAt',
  expiresAt: 'expiresAt',
  employeeName: 'employeeName',
  courseName: 'courseName',
  score: 'score',
  pdfUrl: 'pdfUrl',
  verificationUrl: 'verificationUrl',
  isValid: 'isValid',
  revokedAt: 'revokedAt',
  revokedReason: 'revokedReason',
  organizationId: 'organizationId'
};

exports.Prisma.PhishingCampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  templateId: 'templateId',
  status: 'status',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  targetType: 'targetType',
  targetFilter: 'targetFilter',
  sendingRate: 'sendingRate',
  trackClicks: 'trackClicks',
  trackSubmissions: 'trackSubmissions',
  collectCredentials: 'collectCredentials',
  totalTargets: 'totalTargets',
  emailsSent: 'emailsSent',
  emailsOpened: 'emailsOpened',
  linksClicked: 'linksClicked',
  dataSubmitted: 'dataSubmitted',
  createdBy: 'createdBy',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PhishingTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subject: 'subject',
  senderName: 'senderName',
  senderEmail: 'senderEmail',
  htmlContent: 'htmlContent',
  landingPageHtml: 'landingPageHtml',
  difficulty: 'difficulty',
  category: 'category',
  isActive: 'isActive',
  createdBy: 'createdBy',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PhishingTargetScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  employeeId: 'employeeId',
  email: 'email',
  emailSentAt: 'emailSentAt',
  emailOpenedAt: 'emailOpenedAt',
  linkClickedAt: 'linkClickedAt',
  dataSubmittedAt: 'dataSubmittedAt',
  reportedAt: 'reportedAt',
  trainingAssigned: 'trainingAssigned',
  trainingCompleted: 'trainingCompleted'
};

exports.Prisma.RunbookScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  status: 'status',
  version: 'version',
  owner: 'owner',
  triggerCondition: 'triggerCondition',
  estimatedTime: 'estimatedTime',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RunbookStepScalarFieldEnum = {
  id: 'id',
  runbookId: 'runbookId',
  stepNumber: 'stepNumber',
  title: 'title',
  description: 'description',
  action: 'action',
  assignee: 'assignee',
  estimated: 'estimated',
  critical: 'critical'
};

exports.Prisma.RunbookExecutionScalarFieldEnum = {
  id: 'id',
  runbookId: 'runbookId',
  triggeredBy: 'triggeredBy',
  triggeredAt: 'triggeredAt',
  status: 'status',
  completedAt: 'completedAt',
  notes: 'notes',
  currentStep: 'currentStep'
};

exports.Prisma.AuditorAccessScalarFieldEnum = {
  id: 'id',
  auditId: 'auditId',
  accessCode: 'accessCode',
  auditorEmail: 'auditorEmail',
  auditorName: 'auditorName',
  firmName: 'firmName',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  lastAccessedAt: 'lastAccessedAt',
  accessCount: 'accessCount',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditRequestScalarFieldEnum = {
  id: 'id',
  auditId: 'auditId',
  auditorAccessId: 'auditorAccessId',
  title: 'title',
  description: 'description',
  category: 'category',
  priority: 'priority',
  status: 'status',
  assignedTo: 'assignedTo',
  dueDate: 'dueDate',
  submittedAt: 'submittedAt',
  reviewedAt: 'reviewedAt',
  reviewedBy: 'reviewedBy',
  controlId: 'controlId',
  requirementId: 'requirementId',
  notes: 'notes',
  auditorComments: 'auditorComments',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditRequestAttachmentScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  uploadedBy: 'uploadedBy',
  createdAt: 'createdAt'
};

exports.Prisma.TrustCenterConfigScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  companyName: 'companyName',
  logoUrl: 'logoUrl',
  primaryColor: 'primaryColor',
  accentColor: 'accentColor',
  description: 'description',
  isPublished: 'isPublished',
  customDomain: 'customDomain',
  slug: 'slug',
  contactEmail: 'contactEmail',
  securityEmail: 'securityEmail',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrustCenterSectionScalarFieldEnum = {
  id: 'id',
  configId: 'configId',
  sectionType: 'sectionType',
  title: 'title',
  content: 'content',
  displayOrder: 'displayOrder',
  isVisible: 'isVisible',
  icon: 'icon',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KnowledgeBaseEntryScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  category: 'category',
  tags: 'tags',
  status: 'status',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  version: 'version',
  controlId: 'controlId',
  policyId: 'policyId',
  frameworkId: 'frameworkId',
  confidenceScore: 'confidenceScore',
  lastUsedAt: 'lastUsedAt',
  usageCount: 'usageCount',
  owner: 'owner',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  User: 'User',
  VerificationToken: 'VerificationToken',
  Invitation: 'Invitation',
  SystemSetting: 'SystemSetting',
  Report: 'Report',
  Control: 'Control',
  Framework: 'Framework',
  FrameworkRequirement: 'FrameworkRequirement',
  FrameworkMapping: 'FrameworkMapping',
  Risk: 'Risk',
  Vendor: 'Vendor',
  VendorAssessment: 'VendorAssessment',
  Evidence: 'Evidence',
  EvidenceFile: 'EvidenceFile',
  Attestation: 'Attestation',
  Playbook: 'Playbook',
  RiskControl: 'RiskControl',
  IncidentRisk: 'IncidentRisk',
  VendorRisk: 'VendorRisk',
  Action: 'Action',
  Policy: 'Policy',
  Incident: 'Incident',
  Change: 'Change',
  ChangeApproval: 'ChangeApproval',
  ChangeTask: 'ChangeTask',
  ChangeRisk: 'ChangeRisk',
  ChangeImpact: 'ChangeImpact',
  ChangeComment: 'ChangeComment',
  ChangeAttachment: 'ChangeAttachment',
  CABMember: 'CABMember',
  Organization: 'Organization',
  AuditLog: 'AuditLog',
  TrustRequest: 'TrustRequest',
  LLMUsage: 'LLMUsage',
  Integration: 'Integration',
  LLMCache: 'LLMCache',
  Subscription: 'Subscription',
  Transaction: 'Transaction',
  RiskHistory: 'RiskHistory',
  Audit: 'Audit',
  AuditFinding: 'AuditFinding',
  ControlTest: 'ControlTest',
  PolicyControl: 'PolicyControl',
  PolicyVersion: 'PolicyVersion',
  PolicyAttestation: 'PolicyAttestation',
  IncidentControl: 'IncidentControl',
  Gap: 'Gap',
  RemediationStep: 'RemediationStep',
  BCDRPlan: 'BCDRPlan',
  DRTest: 'DRTest',
  Asset: 'Asset',
  AssetRisk: 'AssetRisk',
  AssetControl: 'AssetControl',
  BusinessProcess: 'BusinessProcess',
  Questionnaire: 'Questionnaire',
  Question: 'Question',
  QuestionnaireResponse: 'QuestionnaireResponse',
  Answer: 'Answer',
  Employee: 'Employee',
  PolicyAcknowledgment: 'PolicyAcknowledgment',
  TrainingCourse: 'TrainingCourse',
  TrainingAssignment: 'TrainingAssignment',
  TrainingCertificate: 'TrainingCertificate',
  PhishingCampaign: 'PhishingCampaign',
  PhishingTemplate: 'PhishingTemplate',
  PhishingTarget: 'PhishingTarget',
  Runbook: 'Runbook',
  RunbookStep: 'RunbookStep',
  RunbookExecution: 'RunbookExecution',
  AuditorAccess: 'AuditorAccess',
  AuditRequest: 'AuditRequest',
  AuditRequestAttachment: 'AuditRequestAttachment',
  TrustCenterConfig: 'TrustCenterConfig',
  TrustCenterSection: 'TrustCenterSection',
  KnowledgeBaseEntry: 'KnowledgeBaseEntry'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
