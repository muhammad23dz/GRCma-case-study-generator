
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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
  status: 'status',
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
  tester: 'tester',
  testType: 'testType',
  testProcedure: 'testProcedure',
  sampleSize: 'sampleSize',
  result: 'result',
  findings: 'findings',
  recommendations: 'recommendations',
  notes: 'notes',
  evidenceId: 'evidenceId',
  evidenceLinks: 'evidenceLinks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\ncc-grc-app\\lib\\generated\\client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\ncc-grc-app\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n  output          = \"../lib/generated/client\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// Next-Auth Models\nmodel Account {\n  id                String  @id @default(cuid())\n  userId            String\n  type              String\n  provider          String\n  providerAccountId String\n  refresh_token     String?\n  access_token      String?\n  expires_at        Int?\n  token_type        String?\n  scope             String?\n  id_token          String?\n  session_state     String?\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n}\n\nmodel Session {\n  id           String   @id @default(cuid())\n  sessionToken String   @unique\n  userId       String\n  expires      DateTime\n  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel User {\n  id            String    @id @default(cuid())\n  name          String?\n  email         String?   @unique\n  emailVerified DateTime?\n  image         String?\n  role          String? // admin, manager, analyst, user. Null = Admin Fallback\n  mfaSecret     String? // AES-256-GCM encrypted TOTP secret\n  mfaEnabled    Boolean   @default(false)\n  hasUsedDemo   Boolean   @default(false)\n  password      String? // Hashed password for credentials login\n  orgId         String?\n\n  accounts     Account[]\n  sessions     Session[]\n  reports      Report[]\n  settings     SystemSetting[]\n  organization Organization?   @relation(fields: [orgId], references: [id])\n  llmUsage     LLMUsage[]\n  subscription Subscription?\n  createdAt    DateTime        @default(now())\n  updatedAt    DateTime        @default(now()) @updatedAt\n\n  @@index([orgId])\n  @@index([role])\n}\n\nmodel VerificationToken {\n  identifier String\n  token      String   @unique\n  expires    DateTime\n\n  @@unique([identifier, token])\n}\n\nmodel Invitation {\n  id             String        @id @default(cuid())\n  email          String        @unique\n  role           String        @default(\"user\") // admin, manager, user\n  invitedBy      String // Email of inviter\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n  expires        DateTime\n  createdAt      DateTime      @default(now())\n\n  @@index([email])\n  @@index([organizationId])\n}\n\nmodel SystemSetting {\n  id          String   @id @default(cuid())\n  userId      String\n  key         String\n  value       String\n  description String?\n  isSecret    Boolean  @default(false)\n  updatedAt   DateTime @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, key])\n}\n\nmodel Report {\n  id        String   @id @default(cuid())\n  userId    String\n  sections  Json // JSON string of report sections\n  timestamp DateTime @default(now())\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n}\n\n// ============================================\n// FEATURE 1: CONTROL LIBRARY & FRAMEWORK MAPPING\n// ============================================\n\nmodel Control {\n  id                   String   @id @default(cuid())\n  title                String\n  description          String\n  controlType          String // preventive, detective, corrective, directive\n  owner                String?\n  controlRisk          String? // low, medium, high, critical\n  evidenceRequirements String?\n  confidence           Float? // LLM mapping confidence 0-1\n  llmProvenance        Json? // JSON: {prompt, model, temperature, timestamp}\n  status               String   @default(\"draft\") // draft, implemented, retired\n  createdAt            DateTime @default(now())\n  updatedAt            DateTime @updatedAt\n\n  mappings         FrameworkMapping[]\n  evidences        Evidence[]\n  risks            Risk[]\n  actions          Action[]\n  riskControls     RiskControl[] // Added for Risk-Control relationship\n  auditFindings    AuditFinding[] // NEW: Link to audit findings\n  controlTests     ControlTest[] // NEW: Link to control testing\n  policyControls   PolicyControl[] // NEW: Link to policies that enforce this control\n  incidentControls IncidentControl[] // NEW: Link to incidents that bypassed this control\n  assetControls    AssetControl[] // NEW: Link to assets\n  organizationId   String?\n  organization     Organization?      @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([controlType])\n  @@index([owner])\n}\n\nmodel Framework {\n  id           String  @id @default(cuid())\n  name         String  @unique // ISO27001, NIST_CSF, SOC2, GDPR, PCI_DSS\n  version      String\n  jurisdiction String?\n  description  String?\n\n  mappings     FrameworkMapping[]\n  requirements FrameworkRequirement[]\n\n  @@index([name])\n}\n\nmodel FrameworkRequirement {\n  id            String   @id @default(cuid())\n  frameworkId   String\n  requirementId String // e.g., \"A.5.1\", \"CC6.1\", \"PR.AC-1\"\n  title         String\n  description   String\n  category      String? // Control domain/category\n  priority      String   @default(\"medium\") // critical, high, medium, low\n  createdAt     DateTime @default(now())\n\n  framework Framework          @relation(fields: [frameworkId], references: [id], onDelete: Cascade)\n  mappings  FrameworkMapping[]\n  evidences Evidence[]\n\n  @@unique([frameworkId, requirementId])\n  @@index([frameworkId])\n  @@index([category])\n}\n\nmodel FrameworkMapping {\n  id                 String   @id @default(cuid())\n  controlId          String\n  frameworkId        String\n  frameworkControlId String // e.g., \"AC-2\" for NIST, \"A.9.2.1\" for ISO\n  requirementId      String? // Link to specific requirement\n  description        String?\n  confidence         Float? // LLM mapping confidence\n  mappingSource      String? // manual, llm\n  createdAt          DateTime @default(now())\n\n  control     Control               @relation(fields: [controlId], references: [id], onDelete: Cascade)\n  framework   Framework             @relation(fields: [frameworkId], references: [id], onDelete: Cascade)\n  requirement FrameworkRequirement? @relation(fields: [requirementId], references: [id])\n\n  @@unique([controlId, frameworkId, frameworkControlId])\n  @@index([controlId])\n  @@index([frameworkId])\n}\n\n// ============================================\n// FEATURE 2: RISK ASSESSMENT\n// ============================================\n\nmodel Risk {\n  id                 String   @id @default(cuid())\n  assetId            String?\n  likelihood         Int // 1-5 scale\n  impact             Int // 1-5 scale\n  score              Int // likelihood × impact\n  category           String // e.g., \"privacy\", \"security\", \"operational\"\n  narrative          String // LLM-generated risk description\n  drivers            Json? // JSON string of risk drivers\n  recommendedActions Json? // JSON string of recommended actions\n  status             String   @default(\"open\") // open, mitigated, accepted, transferred\n  controlId          String?\n  owner              String?\n  llmConfidence      Float?\n  llmProvenance      Json? // JSON string\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n\n  control        Control?       @relation(fields: [controlId], references: [id])\n  evidences      Evidence[]\n  riskControls   RiskControl[] // Added for Risk-Control relationship\n  incidentRisks  IncidentRisk[] // Added for Incident-Risk relationship\n  vendorRisks    VendorRisk[] // Added for Vendor-Risk relationship\n  changeRisks    ChangeRisk[] // Added for Change-Risk relationship\n  actions        Action[] // Added for Action-Risk relationship\n  history        RiskHistory[] // Added for Predictive Analytics\n  assetRisks     AssetRisk[] // NEW: Link to assets\n  organizationId String?\n  organization   Organization?  @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([category])\n  @@index([status])\n  @@index([score])\n  @@index([owner])\n}\n\n// ============================================\n// FEATURE 3: THIRD-PARTY RISK (VENDOR MANAGEMENT)\n// ============================================\n\nmodel Vendor {\n  id                 String    @id @default(cuid())\n  name               String\n  category           String    @default(\"Service\") // Infrastructure, Service, Software, etc.\n  criticality        String    @default(\"medium\") // critical, high, medium, low\n  services           String?\n  riskScore          Int       @default(0)\n  status             String // active, suspended, terminated\n  contactEmail       String?\n  lastAssessmentDate DateTime?\n  owner              String?\n  createdAt          DateTime  @default(now())\n  updatedAt          DateTime  @updatedAt\n\n  assessments    VendorAssessment[]\n  evidences      Evidence[]\n  vendorRisks    VendorRisk[] // Added for Vendor-Risk relationship\n  organizationId String?\n  organization   Organization?      @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([category])\n  @@index([status])\n  @@index([riskScore])\n  @@index([owner])\n}\n\nmodel VendorAssessment {\n  id                String   @id @default(cuid())\n  vendorId          String\n  assessmentDate    DateTime\n  assessor          String\n  questionsAsked    Json // JSON array\n  questionsAnswered Json // JSON array\n  riskScore         Int // 0-100\n  findings          String? // LLM summary\n  recommendations   String? // LLM suggestions\n  status            String   @default(\"draft\") // draft, final, approved\n\n  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)\n\n  @@index([vendorId])\n  @@index([assessmentDate])\n}\n\n// ============================================\n// FEATURE 4: EVIDENCE & COMPLIANCE\n// ============================================\n\nmodel Evidence {\n  id                 String  @id @default(cuid())\n  controlId          String?\n  riskId             String?\n  vendorId           String?\n  requirementId      String? // Link to framework requirement\n  evidenceType       String // document, screenshot, log, certification\n  source             String  @default(\"manual\") // manual, automated, auditor\n  auditPeriod        String? // e.g., \"Q4 2025\" - STRICT time boxing\n  description        String?\n  fileUrl            String?\n  fileName           String?\n  extractedData      Json? // Structured data from connector\n  summary            String? // LLM-generated summary\n  verificationStatus String  @default(\"pending\") // pending, verified, rejected\n\n  // Review Workflow\n  status         String    @default(\"draft\") // draft, under_review, approved, rejected\n  reviewer       String?\n  reviewedAt     DateTime?\n  reviewNotes    String?\n  nextReviewDate DateTime?\n\n  uploadedBy String\n  timestamp  DateTime @default(now())\n\n  control        Control?              @relation(fields: [controlId], references: [id])\n  risk           Risk?                 @relation(fields: [riskId], references: [id])\n  vendor         Vendor?               @relation(fields: [vendorId], references: [id])\n  requirement    FrameworkRequirement? @relation(fields: [requirementId], references: [id])\n  controlTests   ControlTest[] // NEW: Control tests using this evidence\n  organizationId String?\n  organization   Organization?         @relation(fields: [organizationId], references: [id])\n  integrationId  String?\n  integration    Integration?          @relation(fields: [integrationId], references: [id])\n\n  @@index([organizationId])\n  @@index([integrationId])\n  @@index([controlId])\n  @@index([riskId])\n  @@index([vendorId])\n  @@index([requirementId])\n  @@index([evidenceType])\n  @@index([uploadedBy])\n  @@index([status])\n}\n\nmodel EvidenceFile {\n  id         String   @id @default(cuid())\n  evidenceId String\n  fileName   String\n  fileUrl    String\n  fileSize   Int // bytes\n  fileType   String // mime type\n  uploadedBy String\n  uploadedAt DateTime @default(now())\n\n  @@index([evidenceId])\n}\n\nmodel Attestation {\n  id         String    @id @default(cuid())\n  controlId  String\n  statement  String // LLM-drafted attestation\n  attestedBy String\n  attestedAt DateTime\n  validUntil DateTime?\n  signature  String? // digital signature or approval hash\n  status     String    @default(\"active\") // active, expired, revoked\n  createdAt  DateTime  @default(now())\n\n  @@index([controlId])\n  @@index([status])\n}\n\n// ============================================\n// FEATURE 5: PLAYBOOKS & RUNBOOKS\n// ============================================\n\nmodel Playbook {\n  id          String   @id @default(cuid())\n  scenario    String // e.g., \"data breach\", \"system outage\"\n  description String\n  steps       Json // JSON array of action steps\n  llmModel    String? // Model used to generate\n  createdBy   String\n  createdAt   DateTime @default(now())\n\n  @@index([scenario])\n}\n\n// ============================================\n// FEATURE 6: ACTION TRACKING\n// ============================================\n\n// Risk-Control Relationship (Many-to-Many)\nmodel RiskControl {\n  id            String   @id @default(cuid())\n  riskId        String\n  controlId     String\n  effectiveness String   @default(\"partial\") // effective, partial, ineffective\n  residualRisk  Int? // calculated: inherent risk - control effectiveness\n  notes         String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  risk    Risk    @relation(fields: [riskId], references: [id], onDelete: Cascade)\n  control Control @relation(fields: [controlId], references: [id], onDelete: Cascade)\n\n  @@unique([riskId, controlId])\n  @@index([riskId])\n  @@index([controlId])\n  @@index([effectiveness])\n}\n\n// Incident-Risk Relationship\nmodel IncidentRisk {\n  id         String   @id @default(cuid())\n  incidentId String\n  riskId     String\n  impactType String   @default(\"realized\") // identified, realized, escalated\n  createdAt  DateTime @default(now())\n\n  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  risk     Risk     @relation(fields: [riskId], references: [id], onDelete: Cascade)\n\n  @@unique([incidentId, riskId])\n  @@index([incidentId])\n  @@index([riskId])\n}\n\n// Vendor-Risk Relationship\nmodel VendorRisk {\n  id        String   @id @default(cuid())\n  vendorId  String\n  riskId    String\n  riskType  String // availability, security, compliance, financial\n  createdAt DateTime @default(now())\n\n  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)\n  risk   Risk   @relation(fields: [riskId], references: [id], onDelete: Cascade)\n\n  @@unique([vendorId, riskId])\n  @@index([vendorId])\n  @@index([riskId])\n}\n\nmodel Action {\n  id          String    @id @default(cuid())\n  title       String\n  type        String    @default(\"corrective\") // corrective, detective, preventive\n  description String?\n  playbook    Json? // JSON string of generated steps\n  status      String    @default(\"open\") // open, in_progress, completed, cancelled\n  priority    String    @default(\"medium\") // low, medium, high, critical\n  assignedTo  String?\n  dueDate     DateTime?\n  controlId   String?\n  incidentId  String?\n  owner       String?\n\n  // Parent Relationship (Action originates from Risk, Control, Incident, or Finding)\n  parentType            String? // Risk, Control, Incident, Finding\n  parentId              String?\n  expectedRiskReduction Int? // Expected risk score reduction\n\n  createdAt   DateTime  @default(now())\n  completedAt DateTime?\n  updatedAt   DateTime  @updatedAt\n\n  control        Control?      @relation(fields: [controlId], references: [id])\n  incident       Incident?     @relation(fields: [incidentId], references: [id])\n  risk           Risk?         @relation(fields: [riskId], references: [id])\n  riskId         String?\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([assignedTo])\n  @@index([dueDate])\n  @@index([priority])\n  @@index([owner])\n}\n\n// ============================================\n// FEATURE 7: POLICY MANAGEMENT\n// ============================================\n\nmodel Policy {\n  id         String    @id @default(cuid())\n  title      String\n  version    String    @default(\"1.0\")\n  content    String // Full policy text\n  scope      String? // NEW: Applicability scope\n  status     String    @default(\"draft\") // draft, active, archived\n  owner      String\n  reviewDate DateTime?\n  approvedBy String?\n  approvedAt DateTime?\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n\n  policyControls  PolicyControl[] // NEW: Controls enforced by policy\n  versions        PolicyVersion[] // NEW: Version history\n  attestations    PolicyAttestation[] // NEW: Employee attestations\n  acknowledgments PolicyAcknowledgment[] // NEW: Employee acknowledgments\n  organizationId  String?\n  organization    Organization?          @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([owner])\n}\n\n// ============================================\n// FEATURE 8: INCIDENT MANAGEMENT\n// ============================================\n\nmodel Incident {\n  id          String    @id @default(cuid())\n  title       String\n  description String\n  severity    String // low, medium, high, critical\n  status      String    @default(\"open\") // open, investigating, resolved, closed\n  reportedBy  String\n  assignedTo  String?\n  rootCause   String?\n  remediation String?\n  createdAt   DateTime  @default(now())\n  resolvedAt  DateTime?\n  updatedAt   DateTime  @updatedAt\n\n  actions          Action[]\n  incidentRisks    IncidentRisk[] // Added for Incident-Risk relationship\n  incidentControls IncidentControl[] // NEW: Controls bypassed during incident\n  organizationId   String?\n  organization     Organization?     @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([severity])\n  @@index([reportedBy])\n  @@index([assignedTo])\n}\n\n// ============================================\n// FEATURE 9: CHANGE MANAGEMENT\n// ============================================\n\nmodel Change {\n  id            String @id @default(cuid())\n  changeNumber  String @unique // CHG-2025-001\n  title         String\n  description   String\n  justification String // Business reason\n\n  // Classification\n  changeType String // standard, normal, emergency\n  category   String // infrastructure, application, security, data, process\n  priority   String // critical, high, medium, low\n\n  // Risk Assessment\n  impactLevel String // high, medium, low\n  urgency     String // critical, high, medium, low\n  complexity  String // simple, moderate, complex\n  riskScore   Int // Calculated: impact × urgency × complexity\n\n  // Scheduling\n  requestedDate    DateTime\n  plannedStartDate DateTime?\n  plannedEndDate   DateTime?\n  actualStartDate  DateTime?\n  actualEndDate    DateTime?\n\n  // Implementation Details\n  implementationPlan String // Step-by-step plan\n  backoutPlan        String // Rollback procedure\n  testingPlan        String? // Testing approach\n  affectedSystems    Json // JSON array of systems\n  affectedUsers      String? // Estimated user impact\n\n  // Workflow\n  status       String @default(\"draft\") // draft, submitted, reviewing, approved, scheduled, implementing, completed, cancelled, failed\n  currentStage String @default(\"request\") // request, assessment, approval, implementation, review, closure\n\n  // Ownership\n  requestedBy   String\n  assignedTo    String?\n  implementedBy String?\n  reviewedBy    String?\n\n  // Approval\n  requiresCAB    Boolean   @default(false)\n  cabMeetingDate DateTime?\n  approvalStatus String    @default(\"pending\") // pending, approved, rejected, conditional\n\n  // Outcomes\n  implementationNotes String?\n  actualImpact        String? // Post-implementation review\n  lessonsLearned      String?\n  success             Boolean?\n\n  // Compliance\n  complianceChecked Boolean @default(false)\n  securityReviewed  Boolean @default(false)\n\n  // Relationships\n  parentChangeId String? // For related changes\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  approvals    ChangeApproval[]\n  tasks        ChangeTask[]\n  risks        ChangeRisk[]\n  impacts      ChangeImpact[]\n  comments     ChangeComment[]\n  attachments  ChangeAttachment[]\n  parentChange Change?            @relation(\"ChangeHierarchy\", fields: [parentChangeId], references: [id])\n  childChanges Change[]           @relation(\"ChangeHierarchy\")\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([changeType])\n  @@index([category])\n  @@index([requestedBy])\n  @@index([plannedStartDate])\n}\n\nmodel ChangeApproval {\n  id            String   @id @default(cuid())\n  changeId      String\n  approverRole  String // requester_manager, cab_member, security_team, compliance_team\n  approverEmail String\n  approverName  String\n  decision      String // approved, rejected, conditional\n  comments      String?\n  conditions    String? // If conditional approval\n  approvedAt    DateTime @default(now())\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n\n  @@index([changeId])\n  @@index([approverEmail])\n}\n\nmodel ChangeTask {\n  id          String    @id @default(cuid())\n  changeId    String\n  taskNumber  Int // 1, 2, 3...\n  description String\n  assignedTo  String\n  status      String    @default(\"pending\") // pending, in_progress, completed, failed\n  dueDate     DateTime?\n  completedAt DateTime?\n  notes       String?\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n\n  @@index([changeId])\n  @@index([status])\n}\n\nmodel ChangeRisk {\n  id          String   @id @default(cuid())\n  changeId    String\n  riskId      String? // Link to existing risk if applicable\n  description String\n  likelihood  Int // 1-5\n  impact      Int // 1-5\n  mitigation  String // How to mitigate\n  status      String   @default(\"identified\") // identified, mitigated, accepted\n  impactType  String   @default(\"potential\")\n  createdAt   DateTime @default(now())\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n  risk   Risk?  @relation(fields: [riskId], references: [id])\n\n  // Note: We already have a ChangeRisk model defined earlier in the file (lines 376-389). \n  // I will MERGE them to avoid duplication. This block is replacing the comprehensive one.\n\n  @@index([changeId])\n  @@index([riskId])\n}\n\nmodel ChangeImpact {\n  id            String @id @default(cuid())\n  changeId      String\n  impactArea    String // system, users, security, compliance, performance\n  description   String\n  severity      String // high, medium, low\n  affectedCount Int? // Number of users/systems affected\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n\n  @@index([changeId])\n}\n\nmodel ChangeComment {\n  id          String   @id @default(cuid())\n  changeId    String\n  authorEmail String\n  authorName  String\n  comment     String\n  commentType String   @default(\"general\") // general, approval, technical, risk\n  createdAt   DateTime @default(now())\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n\n  @@index([changeId])\n  @@index([createdAt])\n}\n\nmodel ChangeAttachment {\n  id         String   @id @default(cuid())\n  changeId   String\n  fileName   String\n  fileUrl    String\n  fileType   String // implementation_plan, test_results, approval_doc\n  uploadedBy String\n  uploadedAt DateTime @default(now())\n\n  change Change @relation(fields: [changeId], references: [id], onDelete: Cascade)\n\n  @@index([changeId])\n}\n\nmodel CABMember {\n  id         String   @id @default(cuid())\n  email      String   @unique\n  name       String\n  role       String // chair, member, observer\n  department String\n  expertise  Json // stored as string/JSON in SQLite as arrays aren't native\n  active     Boolean  @default(true)\n  createdAt  DateTime @default(now())\n\n  @@index([active])\n}\n\nmodel Organization {\n  id               String   @id @default(cuid())\n  name             String\n  createdAt        DateTime @default(now())\n  securitySettings Json? // { sessionTtl, mfaRequired, passwordPolicy }\n\n  users User[]\n\n  // Subscription & Billing\n  plan               String    @default(\"FREE\") // FREE, SOLO, BUSINESS, ENTERPRISE\n  subscriptionStatus String    @default(\"ACTIVE\") // ACTIVE, PAST_DUE, CANCELED\n  billingCycle       String    @default(\"MONTHLY\")\n  nextBillingDate    DateTime?\n\n  // Usage Limits\n  assessmentLimit Int @default(5)\n  assessmentsUsed Int @default(0)\n  storageLimit    Int @default(100) // MB\n  storageUsed     Int @default(0)\n\n  // Feature Flags\n  features     Json          @default(\"[]\") // JSON string of enabled features\n  Control      Control[]\n  Risk         Risk[]\n  Vendor       Vendor[]\n  Evidence     Evidence[]\n  Action       Action[]\n  Policy       Policy[]\n  Incident     Incident[]\n  Change       Change[]\n  integrations Integration[]\n  riskHistory  RiskHistory[] // Added for Predictive Analytics\n  audits       Audit[] // NEW: Audit management\n  gaps         Gap[] // NEW: Gap analysis\n\n  // Gigachad GRC Integration Relations\n  bcdrPlans         BCDRPlan[]\n  assets            Asset[]\n  businessProcesses BusinessProcess[]\n  questionnaires    Questionnaire[]\n  employees         Employee[]\n  trainingCourses   TrainingCourse[]\n  runbooks          Runbook[]\n  invitations       Invitation[]\n  auditLogs         AuditLog[]\n\n  // Enterprise GRC Features\n  auditorAccess     AuditorAccess[]\n  auditRequests     AuditRequest[]\n  trustCenterConfig TrustCenterConfig?\n  knowledgeBase     KnowledgeBaseEntry[]\n}\n\n// ============================================\n// PREMIUM FEATURE: AUDIT TRAIL\n// ============================================\n\nmodel AuditLog {\n  id             String        @id @default(cuid())\n  userId         String\n  userName       String\n  userEmail      String\n  resource       String // Maps to 'entity'\n  resourceId     String? // NEW: Optional link to specific instance\n  action         String\n  changes        String\n  ipAddress      String?\n  userAgent      String?\n  integrityHash  String? // HMAC signature for tamper evidence\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n  timestamp      DateTime      @default(now())\n\n  @@index([userId])\n  @@index([organizationId])\n  @@index([resource])\n  @@index([resourceId])\n  @@index([timestamp])\n}\n\n// ============================================\n// FEATURE 9: PUBLIC TRUST CENTER\n// ============================================\n\nmodel TrustRequest {\n  id        String   @id @default(cuid())\n  email     String\n  company   String?\n  reason    String? // e.g., \"Vendor Assessment\", \"Internal Review\", \"Partnership\"\n  status    String   @default(\"pending\") // pending, approved, rejected\n  ipAddress String?\n  createdAt DateTime @default(now())\n\n  @@index([email])\n  @@index([status])\n}\n\n// ============================================\n// FEATURE 10: LLM COST MANAGEMENT (STRATEGIC MODEL 1)\n// ============================================\n\nmodel LLMUsage {\n  id        String   @id @default(cuid())\n  userId    String\n  model     String\n  tokensIn  Int\n  tokensOut Int\n  cost      Float // Mean cost in USD\n  feature   String // e.g., \"report_generation\", \"risk_assessment\"\n  timestamp DateTime @default(now())\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([timestamp])\n}\n\n// ============================================\n// FEATURE 11: CONTINUOUS MONITORING (CCM)\n// ============================================\n\nmodel Integration {\n  id             String @id @default(cuid())\n  organizationId String\n  provider       String // github, aws, azure, okta\n  name           String // e.g., \"GitHub - Prod\"\n  status         String @default(\"active\") // active, error, disconnected\n\n  // Security: Credentials are AES-256-GCM encrypted\n  encryptedCredentials String\n\n  config       Json? // Non-sensitive config (repo names, regions)\n  lastSyncAt   DateTime?\n  errorMessage String?\n  createdAt    DateTime  @default(now())\n  updatedAt    DateTime  @updatedAt\n\n  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n  evidences    Evidence[] // Evidence collected by this integration\n\n  @@index([organizationId])\n  @@index([provider])\n  @@index([status])\n}\n\nmodel LLMCache {\n  id         String   @id @default(cuid())\n  promptHash String   @unique // SHA-256 hash of the input prompt\n  response   String // Cached completion response\n  model      String\n  createdAt  DateTime @default(now())\n  expiresAt  DateTime // TTL for cache validity\n\n  @@index([promptHash])\n}\n\n// ============================================\n// FEATURE 11: SECURE CMI PAYMENT GATEWAY (STRICT BLUEPRINT)\n// ============================================\n\nmodel Subscription {\n  id                         String    @id @default(cuid())\n  userId                     String    @unique\n  user                       User      @relation(fields: [userId], references: [id])\n  planId                     String // SOLO, BUSINESS, ENTERPRISE\n  status                     String    @default(\"on_trial\") // Lemon Squeezy status (active, on_trial, cancelled, expired)\n  startDate                  DateTime  @default(now())\n  endDate                    DateTime?\n  lemonSqueezyCustomerId     String?   @unique\n  lemonSqueezySubscriptionId String?   @unique\n\n  transactions Transaction[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Transaction {\n  id                  String        @id @default(cuid())\n  subscriptionId      String?\n  subscription        Subscription? @relation(fields: [subscriptionId], references: [id])\n  amount              Decimal       @default(0.00)\n  currency            String        @default(\"usd\")\n  lemonSqueezyOrderId String?       @unique\n  status              String        @default(\"pending\")\n  createdAt           DateTime      @default(now())\n  updatedAt           DateTime      @updatedAt\n\n  @@index([lemonSqueezyOrderId])\n  @@index([status])\n}\n\n// ============================================\n// FEATURE: PREDICTIVE ANALYTICS\n// ============================================\n\nmodel RiskHistory {\n  id             String        @id @default(cuid())\n  riskId         String\n  score          Int           @default(0) // Captured risk score\n  likelihood     Int? // Snapshot\n  impact         Int? // Snapshot\n  calculatedAt   DateTime      @default(now())\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  risk Risk @relation(fields: [riskId], references: [id], onDelete: Cascade)\n\n  @@index([riskId])\n  @@index([calculatedAt])\n  @@index([organizationId])\n}\n\n// ============================================\n// AUDIT MANAGEMENT MODULE (NEW)\n// ============================================\n\nmodel Audit {\n  id          String    @id @default(cuid())\n  title       String\n  auditType   String // internal, external, certification\n  framework   String? // ISO27001, SOC2, PCI-DSS\n  scope       String?\n  startDate   DateTime\n  endDate     DateTime?\n  status      String    @default(\"planning\") // planning, fieldwork, reporting, closed\n  auditorName String\n  auditorOrg  String?\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n\n  findings       AuditFinding[]\n  tests          ControlTest[]\n  organizationId String?\n  organization   Organization?  @relation(fields: [organizationId], references: [id])\n\n  // Auditor Portal\n  auditorAccess AuditorAccess[]\n  auditRequests AuditRequest[]\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([framework])\n  @@index([startDate])\n}\n\nmodel AuditFinding {\n  id              String    @id @default(cuid())\n  auditId         String\n  controlId       String // CRITICAL: Link to failed control\n  severity        String // critical, major, minor, observation\n  title           String\n  description     String\n  recommendation  String?\n  status          String    @default(\"open\") // open, in_progress, resolved, accepted_risk\n  dueDate         DateTime?\n  remediationPlan String?\n  createdAt       DateTime  @default(now())\n  updatedAt       DateTime  @updatedAt\n\n  audit   Audit   @relation(fields: [auditId], references: [id], onDelete: Cascade)\n  control Control @relation(fields: [controlId], references: [id])\n\n  @@index([auditId])\n  @@index([controlId])\n  @@index([status])\n  @@index([severity])\n}\n\nmodel ControlTest {\n  id              String   @id @default(cuid())\n  auditId         String?\n  controlId       String\n  testDate        DateTime\n  tester          String?\n  testType        String?  @default(\"design\") // design, operating\n  testProcedure   String\n  sampleSize      Int?\n  result          String   @default(\"pending\") // pass, fail, partial, pending\n  findings        String?\n  recommendations String?\n  notes           String?\n  evidenceId      String?\n  evidenceLinks   String? // JSON string or URL\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @default(now()) @updatedAt\n\n  audit    Audit?    @relation(fields: [auditId], references: [id])\n  control  Control   @relation(fields: [controlId], references: [id])\n  evidence Evidence? @relation(fields: [evidenceId], references: [id])\n\n  @@index([controlId])\n  @@index([auditId])\n  @@index([testDate])\n}\n\n// ============================================\n// POLICY-CONTROL RELATIONSHIPS (NEW)\n// ============================================\n\nmodel PolicyControl {\n  id           String   @id @default(cuid())\n  policyId     String\n  controlId    String\n  relationship String   @default(\"enforces\") // enforces, supports, references\n  createdAt    DateTime @default(now())\n\n  policy  Policy  @relation(fields: [policyId], references: [id], onDelete: Cascade)\n  control Control @relation(fields: [controlId], references: [id], onDelete: Cascade)\n\n  @@unique([policyId, controlId])\n  @@index([policyId])\n  @@index([controlId])\n}\n\nmodel PolicyVersion {\n  id         String   @id @default(cuid())\n  policyId   String\n  version    String\n  content    String\n  changes    String?\n  approvedBy String\n  approvedAt DateTime\n  createdAt  DateTime @default(now())\n\n  policy Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)\n\n  @@index([policyId])\n  @@index([createdAt])\n}\n\nmodel PolicyAttestation {\n  id         String   @id @default(cuid())\n  policyId   String\n  userId     String\n  attestedAt DateTime @default(now())\n  signature  String?\n\n  policy Policy @relation(fields: [policyId], references: [id])\n\n  @@unique([policyId, userId])\n  @@index([policyId])\n  @@index([userId])\n}\n\n// ============================================\n// INCIDENT-CONTROL RELATIONSHIPS (NEW)\n// ============================================\n\nmodel IncidentControl {\n  id         String   @id @default(cuid())\n  incidentId String\n  controlId  String\n  bypassType String // failed, circumvented, not_implemented\n  notes      String?\n  createdAt  DateTime @default(now())\n\n  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  control  Control  @relation(fields: [controlId], references: [id])\n\n  @@unique([incidentId, controlId])\n  @@index([incidentId])\n  @@index([controlId])\n}\n\n// ============================================\n// FEATURE 12: GAP ANALYSIS & REMEDIATION\n// ============================================\n\nmodel Gap {\n  id              String  @id @default(cuid())\n  title           String\n  description     String\n  severity        String  @default(\"medium\") // critical, high, medium, low\n  framework       String? // e.g., ISO 27001\n  impact          String? // Business impact\n  remediationPlan String? // High-level plan\n  effort          String? // high, medium, low\n  timeline        String? // e.g., \"30 days\"\n  status          String  @default(\"open\") // open, in_progress, resolved, accepted\n  owner           String?\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  remediationSteps RemediationStep[]\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([severity])\n  @@index([owner])\n}\n\nmodel RemediationStep {\n  id          String    @id @default(cuid())\n  gapId       String\n  stepNumber  Int\n  description String\n  assignedTo  String?\n  dueDate     DateTime?\n  status      String    @default(\"pending\") // pending, completed\n\n  gap Gap @relation(fields: [gapId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([gapId])\n  @@index([status])\n}\n\n// ==========================================\n// GIGACHAD GRC INTEGRATION: NEW MODULES\n// ==========================================\n\n// BCDR: Business Continuity & Disaster Recovery\nmodel BCDRPlan {\n  id           String    @id @default(cuid())\n  title        String\n  type         String // BCP, DRP, COOP, Crisis\n  status       String    @default(\"draft\") // draft, active, review, archived\n  description  String?\n  rto          Int? // Recovery Time Objective (hours)\n  rpo          Int? // Recovery Point Objective (hours)\n  mtpd         Int? // Maximum Tolerable Period of Disruption (hours)\n  owner        String\n  lastTested   DateTime?\n  nextTestDate DateTime?\n  version      String    @default(\"1.0\")\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  tests     DRTest[]\n  processes BusinessProcess[]\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([type])\n  @@index([owner])\n}\n\nmodel DRTest {\n  id        String   @id @default(cuid())\n  planId    String\n  title     String\n  testDate  DateTime\n  type      String // tabletop, walkthrough, functional, full-scale\n  status    String   @default(\"scheduled\") // scheduled, in_progress, completed, failed\n  results   String?\n  findings  String?\n  attendees String? // JSON array of attendee names\n  duration  Int? // Duration in minutes\n  passRate  Float? // Percentage of objectives met\n\n  plan BCDRPlan @relation(fields: [planId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([planId])\n  @@index([status])\n  @@index([testDate])\n}\n\n// Assets Management\nmodel Asset {\n  id              String    @id @default(cuid())\n  name            String\n  type            String // hardware, software, data, personnel, facility\n  category        String? // server, workstation, application, database, etc.\n  status          String    @default(\"active\") // active, inactive, decommissioned\n  criticality     String    @default(\"medium\") // low, medium, high, critical\n  owner           String\n  location        String?\n  description     String?\n  purchaseDate    DateTime?\n  endOfLife       DateTime?\n  value           Float? // Monetary value\n  confidentiality String? // public, internal, confidential, restricted\n  integrity       String? // low, medium, high\n  availability    String? // low, medium, high\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  risks    AssetRisk[]\n  controls AssetControl[]\n\n  @@index([organizationId])\n  @@index([type])\n  @@index([criticality])\n  @@index([owner])\n}\n\nmodel AssetRisk {\n  id      String @id @default(cuid())\n  assetId String\n  riskId  String\n  asset   Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)\n  risk    Risk   @relation(fields: [riskId], references: [id], onDelete: Cascade)\n\n  @@unique([assetId, riskId])\n}\n\nmodel AssetControl {\n  id        String  @id @default(cuid())\n  assetId   String\n  controlId String\n  asset     Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)\n  control   Control @relation(fields: [controlId], references: [id], onDelete: Cascade)\n\n  @@unique([assetId, controlId])\n}\n\n// Business Processes\nmodel BusinessProcess {\n  id           String  @id @default(cuid())\n  name         String\n  description  String?\n  owner        String\n  criticality  String  @default(\"medium\") // low, medium, high, critical\n  status       String  @default(\"active\")\n  rto          Int? // Recovery Time Objective (hours)\n  rpo          Int? // Recovery Point Objective (hours)\n  dependencies String? // JSON array of dependent process IDs\n  stakeholders String? // JSON array of stakeholder names\n\n  bcdrPlanId String?\n  bcdrPlan   BCDRPlan? @relation(fields: [bcdrPlanId], references: [id])\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([organizationId])\n  @@index([criticality])\n  @@index([owner])\n}\n\n// Questionnaires & Assessments\nmodel Questionnaire {\n  id          String  @id @default(cuid())\n  title       String\n  description String?\n  type        String // vendor, internal, compliance, security\n  status      String  @default(\"draft\") // draft, active, archived\n  version     String  @default(\"1.0\")\n  owner       String\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  questions Question[]\n  responses QuestionnaireResponse[]\n\n  @@index([organizationId])\n  @@index([type])\n  @@index([status])\n}\n\nmodel Question {\n  id              String  @id @default(cuid())\n  questionnaireId String\n  text            String\n  type            String // text, single_choice, multi_choice, yes_no, rating, file\n  options         String? // JSON array for choice questions\n  required        Boolean @default(true)\n  order           Int\n  weight          Float   @default(1.0) // For scoring\n\n  questionnaire Questionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)\n  answers       Answer[]\n\n  @@index([questionnaireId])\n}\n\nmodel QuestionnaireResponse {\n  id              String    @id @default(cuid())\n  questionnaireId String\n  respondentEmail String\n  respondentName  String?\n  status          String    @default(\"in_progress\") // in_progress, submitted, reviewed\n  score           Float?\n  submittedAt     DateTime?\n  reviewedBy      String?\n  reviewedAt      DateTime?\n  notes           String?\n\n  questionnaire Questionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)\n  answers       Answer[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([questionnaireId])\n  @@index([respondentEmail])\n  @@index([status])\n}\n\nmodel Answer {\n  id         String @id @default(cuid())\n  questionId String\n  responseId String\n  value      String // The answer value\n  score      Float? // Calculated score for this answer\n\n  question Question              @relation(fields: [questionId], references: [id], onDelete: Cascade)\n  response QuestionnaireResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)\n\n  @@index([questionId])\n  @@index([responseId])\n}\n\n// Employee Compliance\nmodel Employee {\n  id               String    @id @default(cuid())\n  email            String\n  name             String\n  department       String?\n  role             String?\n  manager          String?\n  status           String    @default(\"active\") // active, on_leave, terminated\n  hireDate         DateTime?\n  lastTrainingDate DateTime?\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  trainings  TrainingAssignment[]\n  policyAcks PolicyAcknowledgment[]\n\n  @@unique([email, organizationId])\n  @@index([organizationId])\n  @@index([department])\n  @@index([status])\n}\n\nmodel PolicyAcknowledgment {\n  id             String   @id @default(cuid())\n  employeeId     String\n  policyId       String\n  acknowledgedAt DateTime\n  version        String // Policy version acknowledged\n\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n  policy   Policy   @relation(fields: [policyId], references: [id], onDelete: Cascade)\n\n  @@unique([employeeId, policyId, version])\n  @@index([employeeId])\n  @@index([policyId])\n}\n\n// Training Module\nmodel TrainingCourse {\n  id           String  @id @default(cuid())\n  title        String\n  description  String?\n  type         String // security_awareness, compliance, technical, onboarding\n  duration     Int? // Duration in minutes\n  mandatory    Boolean @default(false)\n  content      String? // Rich text content or URL\n  passingScore Float   @default(80.0)\n  status       String  @default(\"active\") // draft, active, archived\n  frequency    String? // one_time, annual, quarterly, monthly\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  assignments TrainingAssignment[]\n\n  @@index([organizationId])\n  @@index([type])\n  @@index([mandatory])\n}\n\nmodel TrainingAssignment {\n  id          String    @id @default(cuid())\n  employeeId  String\n  courseId    String\n  assignedAt  DateTime  @default(now())\n  dueDate     DateTime?\n  startedAt   DateTime?\n  completedAt DateTime?\n  score       Float?\n  attempts    Int       @default(0)\n  status      String    @default(\"assigned\") // assigned, in_progress, completed, overdue\n\n  employee Employee       @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n  course   TrainingCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)\n\n  @@unique([employeeId, courseId])\n  @@index([employeeId])\n  @@index([courseId])\n  @@index([status])\n  @@index([dueDate])\n}\n\n// Training Certificates - Auto-generated on completion\nmodel TrainingCertificate {\n  id           String @id @default(cuid())\n  assignmentId String @unique\n  employeeId   String\n  courseId     String\n\n  certificateNumber String    @unique // Unique verification ID (e.g., CERT-2024-ABC123)\n  issuedAt          DateTime  @default(now())\n  expiresAt         DateTime? // For courses requiring renewal\n\n  employeeName String // Snapshot at time of issue\n  courseName   String // Snapshot at time of issue\n  score        Float // Final score achieved\n\n  pdfUrl          String? // Generated PDF storage path\n  verificationUrl String? // Public verification URL\n\n  isValid       Boolean   @default(true)\n  revokedAt     DateTime?\n  revokedReason String?\n\n  organizationId String?\n\n  @@index([employeeId])\n  @@index([courseId])\n  @@index([certificateNumber])\n  @@index([organizationId])\n}\n\n// ============================================\n// FEATURE: PHISHING SIMULATION\n// Security awareness campaigns\n// ============================================\n\nmodel PhishingCampaign {\n  id          String  @id @default(cuid())\n  name        String\n  description String?\n\n  templateId String? // Reference to email template\n  status     String  @default(\"draft\") // draft, scheduled, running, completed, cancelled\n\n  // Scheduling\n  scheduledAt DateTime?\n  startedAt   DateTime?\n  completedAt DateTime?\n\n  // Targeting\n  targetType   String  @default(\"all\") // all, department, role, custom\n  targetFilter String? // JSON filter for custom targeting\n\n  // Settings\n  sendingRate        Int     @default(10) // Emails per minute\n  trackClicks        Boolean @default(true)\n  trackSubmissions   Boolean @default(true)\n  collectCredentials Boolean @default(false)\n\n  // Results (denormalized for quick access)\n  totalTargets  Int @default(0)\n  emailsSent    Int @default(0)\n  emailsOpened  Int @default(0)\n  linksClicked  Int @default(0)\n  dataSubmitted Int @default(0)\n\n  createdBy      String\n  organizationId String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  template PhishingTemplate? @relation(fields: [templateId], references: [id])\n  targets  PhishingTarget[]\n\n  @@index([organizationId])\n  @@index([status])\n  @@index([scheduledAt])\n}\n\nmodel PhishingTemplate {\n  id              String  @id @default(cuid())\n  name            String\n  subject         String\n  senderName      String\n  senderEmail     String\n  htmlContent     String // Email body HTML\n  landingPageHtml String? // Phishing page content\n\n  difficulty String @default(\"medium\") // easy, medium, hard\n  category   String // credential_harvest, malware_link, data_disclosure, urgent_request\n\n  isActive       Boolean @default(true)\n  createdBy      String\n  organizationId String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  campaigns PhishingCampaign[]\n\n  @@index([organizationId])\n  @@index([category])\n}\n\nmodel PhishingTarget {\n  id         String @id @default(cuid())\n  campaignId String\n  employeeId String\n  email      String\n\n  // Tracking\n  emailSentAt     DateTime?\n  emailOpenedAt   DateTime?\n  linkClickedAt   DateTime?\n  dataSubmittedAt DateTime?\n\n  // Reported as phish\n  reportedAt DateTime?\n\n  // Training follow-up\n  trainingAssigned  Boolean @default(false)\n  trainingCompleted Boolean @default(false)\n\n  campaign PhishingCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)\n\n  @@unique([campaignId, employeeId])\n  @@index([campaignId])\n  @@index([employeeId])\n  @@index([email])\n}\n\n// Runbooks\nmodel Runbook {\n  id               String  @id @default(cuid())\n  title            String\n  description      String?\n  type             String // incident_response, change_management, maintenance, security\n  status           String  @default(\"active\") // draft, active, archived\n  version          String  @default(\"1.0\")\n  owner            String\n  triggerCondition String? // When to execute this runbook\n  estimatedTime    Int? // Estimated execution time in minutes\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  steps      RunbookStep[]\n  executions RunbookExecution[]\n\n  @@index([organizationId])\n  @@index([type])\n  @@index([status])\n}\n\nmodel RunbookStep {\n  id          String  @id @default(cuid())\n  runbookId   String\n  stepNumber  Int\n  title       String\n  description String?\n  action      String // manual, automated, approval\n  assignee    String?\n  estimated   Int? // Estimated time in minutes\n  critical    Boolean @default(false)\n\n  runbook Runbook @relation(fields: [runbookId], references: [id], onDelete: Cascade)\n\n  @@index([runbookId])\n}\n\nmodel RunbookExecution {\n  id          String    @id @default(cuid())\n  runbookId   String\n  triggeredBy String\n  triggeredAt DateTime  @default(now())\n  status      String    @default(\"in_progress\") // in_progress, completed, failed, cancelled\n  completedAt DateTime?\n  notes       String?\n  currentStep Int       @default(1)\n\n  runbook Runbook @relation(fields: [runbookId], references: [id], onDelete: Cascade)\n\n  @@index([runbookId])\n  @@index([status])\n  @@index([triggeredAt])\n}\n\n// ============================================\n// FEATURE: AUDITOR PORTAL\n// External auditor access for SOC 2/ISO audits\n// ============================================\n\nmodel AuditorAccess {\n  id             String    @id @default(cuid())\n  auditId        String\n  accessCode     String    @unique // Secure random code for auditor login\n  auditorEmail   String\n  auditorName    String\n  firmName       String?\n  expiresAt      DateTime\n  isActive       Boolean   @default(true)\n  lastAccessedAt DateTime?\n  accessCount    Int       @default(0)\n\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n  audit          Audit         @relation(fields: [auditId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  requests AuditRequest[]\n\n  @@index([auditId])\n  @@index([accessCode])\n  @@index([organizationId])\n}\n\nmodel AuditRequest {\n  id              String  @id @default(cuid())\n  auditId         String\n  auditorAccessId String?\n\n  title       String\n  description String\n  category    String // control_documentation, policy_review, evidence, interview, system_access, walkthrough\n  priority    String @default(\"medium\") // low, medium, high, critical\n  status      String @default(\"open\") // open, in_progress, submitted, under_review, approved, rejected\n\n  assignedTo  String?\n  dueDate     DateTime?\n  submittedAt DateTime?\n  reviewedAt  DateTime?\n  reviewedBy  String?\n\n  controlId     String?\n  requirementId String?\n\n  notes           String?\n  auditorComments String?\n\n  organizationId String?\n  organization   Organization?  @relation(fields: [organizationId], references: [id])\n  audit          Audit          @relation(fields: [auditId], references: [id], onDelete: Cascade)\n  auditorAccess  AuditorAccess? @relation(fields: [auditorAccessId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  attachments AuditRequestAttachment[]\n\n  @@index([auditId])\n  @@index([status])\n  @@index([assignedTo])\n  @@index([organizationId])\n}\n\nmodel AuditRequestAttachment {\n  id         String @id @default(cuid())\n  requestId  String\n  fileName   String\n  fileUrl    String\n  fileSize   Int\n  mimeType   String\n  uploadedBy String\n\n  request AuditRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@index([requestId])\n}\n\n// ============================================\n// FEATURE: TRUST CENTER\n// Public-facing security & compliance portal\n// ============================================\n\nmodel TrustCenterConfig {\n  id             String @id @default(cuid())\n  organizationId String @unique\n\n  // Branding\n  companyName  String\n  logoUrl      String?\n  primaryColor String  @default(\"#006233\")\n  accentColor  String  @default(\"#C1272D\")\n  description  String?\n\n  // Settings\n  isPublished  Boolean @default(false)\n  customDomain String? @unique\n  slug         String  @unique // e.g., \"company-name\" for /trust/company-name\n\n  // Contact\n  contactEmail  String?\n  securityEmail String?\n\n  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  sections TrustCenterSection[]\n\n  @@index([slug])\n  @@index([isPublished])\n}\n\nmodel TrustCenterSection {\n  id       String @id @default(cuid())\n  configId String\n\n  sectionType  String // overview, certifications, controls, policies, updates, contact, faq\n  title        String\n  content      String // Rich text/markdown content\n  displayOrder Int     @default(0)\n  isVisible    Boolean @default(true)\n  icon         String? // Lucide icon name\n\n  config TrustCenterConfig @relation(fields: [configId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([configId])\n  @@index([sectionType])\n}\n\n// ============================================\n// FEATURE: KNOWLEDGE BASE\n// Reusable Q&A library for security questionnaires\n// ============================================\n\nmodel KnowledgeBaseEntry {\n  id String @id @default(cuid())\n\n  question String // The security question\n  answer   String // The approved answer\n  category String // security, privacy, compliance, infrastructure, governance, etc.\n  tags     String[] // For search and filtering\n\n  // Metadata\n  status     String    @default(\"draft\") // draft, approved, archived\n  approvedBy String?\n  approvedAt DateTime?\n  version    Int       @default(1)\n\n  // Linking\n  controlId   String? // Link to related control\n  policyId    String? // Link to related policy\n  frameworkId String? // Link to framework requirement\n\n  // AI/Confidence\n  confidenceScore Float? // 0-1 confidence in answer accuracy\n  lastUsedAt      DateTime?\n  usageCount      Int       @default(0)\n\n  owner          String\n  organizationId String?\n  organization   Organization? @relation(fields: [organizationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([organizationId])\n  @@index([category])\n  @@index([status])\n}\n",
  "inlineSchemaHash": "af4198bd69d486eb23329fc9fe156cde4ec6371a3113b9a3908313f8845597ae",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"provider\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerAccountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refresh_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"access_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"token_type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"id_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"session_state\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"}],\"dbName\":null},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sessionToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SessionToUser\"}],\"dbName\":null},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mfaSecret\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mfaEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"hasUsedDemo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"orgId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToUser\"},{\"name\":\"reports\",\"kind\":\"object\",\"type\":\"Report\",\"relationName\":\"ReportToUser\"},{\"name\":\"settings\",\"kind\":\"object\",\"type\":\"SystemSetting\",\"relationName\":\"SystemSettingToUser\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToUser\"},{\"name\":\"llmUsage\",\"kind\":\"object\",\"type\":\"LLMUsage\",\"relationName\":\"LLMUsageToUser\"},{\"name\":\"subscription\",\"kind\":\"object\",\"type\":\"Subscription\",\"relationName\":\"SubscriptionToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"VerificationToken\":{\"fields\":[{\"name\":\"identifier\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Invitation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"invitedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"InvitationToOrganization\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"SystemSetting\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isSecret\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SystemSettingToUser\"}],\"dbName\":null},\"Report\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sections\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ReportToUser\"}],\"dbName\":null},\"Control\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlRisk\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"evidenceRequirements\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"confidence\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"llmProvenance\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"mappings\",\"kind\":\"object\",\"type\":\"FrameworkMapping\",\"relationName\":\"ControlToFrameworkMapping\"},{\"name\":\"evidences\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"ControlToEvidence\"},{\"name\":\"risks\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"ControlToRisk\"},{\"name\":\"actions\",\"kind\":\"object\",\"type\":\"Action\",\"relationName\":\"ActionToControl\"},{\"name\":\"riskControls\",\"kind\":\"object\",\"type\":\"RiskControl\",\"relationName\":\"ControlToRiskControl\"},{\"name\":\"auditFindings\",\"kind\":\"object\",\"type\":\"AuditFinding\",\"relationName\":\"AuditFindingToControl\"},{\"name\":\"controlTests\",\"kind\":\"object\",\"type\":\"ControlTest\",\"relationName\":\"ControlToControlTest\"},{\"name\":\"policyControls\",\"kind\":\"object\",\"type\":\"PolicyControl\",\"relationName\":\"ControlToPolicyControl\"},{\"name\":\"incidentControls\",\"kind\":\"object\",\"type\":\"IncidentControl\",\"relationName\":\"ControlToIncidentControl\"},{\"name\":\"assetControls\",\"kind\":\"object\",\"type\":\"AssetControl\",\"relationName\":\"AssetControlToControl\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"ControlToOrganization\"}],\"dbName\":null},\"Framework\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"jurisdiction\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mappings\",\"kind\":\"object\",\"type\":\"FrameworkMapping\",\"relationName\":\"FrameworkToFrameworkMapping\"},{\"name\":\"requirements\",\"kind\":\"object\",\"type\":\"FrameworkRequirement\",\"relationName\":\"FrameworkToFrameworkRequirement\"}],\"dbName\":null},\"FrameworkRequirement\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"frameworkId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requirementId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"priority\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"framework\",\"kind\":\"object\",\"type\":\"Framework\",\"relationName\":\"FrameworkToFrameworkRequirement\"},{\"name\":\"mappings\",\"kind\":\"object\",\"type\":\"FrameworkMapping\",\"relationName\":\"FrameworkMappingToFrameworkRequirement\"},{\"name\":\"evidences\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"EvidenceToFrameworkRequirement\"}],\"dbName\":null},\"FrameworkMapping\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"frameworkId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"frameworkControlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requirementId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"confidence\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"mappingSource\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToFrameworkMapping\"},{\"name\":\"framework\",\"kind\":\"object\",\"type\":\"Framework\",\"relationName\":\"FrameworkToFrameworkMapping\"},{\"name\":\"requirement\",\"kind\":\"object\",\"type\":\"FrameworkRequirement\",\"relationName\":\"FrameworkMappingToFrameworkRequirement\"}],\"dbName\":null},\"Risk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assetId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"likelihood\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"impact\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"narrative\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"drivers\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"recommendedActions\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"llmConfidence\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"llmProvenance\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToRisk\"},{\"name\":\"evidences\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"EvidenceToRisk\"},{\"name\":\"riskControls\",\"kind\":\"object\",\"type\":\"RiskControl\",\"relationName\":\"RiskToRiskControl\"},{\"name\":\"incidentRisks\",\"kind\":\"object\",\"type\":\"IncidentRisk\",\"relationName\":\"IncidentRiskToRisk\"},{\"name\":\"vendorRisks\",\"kind\":\"object\",\"type\":\"VendorRisk\",\"relationName\":\"RiskToVendorRisk\"},{\"name\":\"changeRisks\",\"kind\":\"object\",\"type\":\"ChangeRisk\",\"relationName\":\"ChangeRiskToRisk\"},{\"name\":\"actions\",\"kind\":\"object\",\"type\":\"Action\",\"relationName\":\"ActionToRisk\"},{\"name\":\"history\",\"kind\":\"object\",\"type\":\"RiskHistory\",\"relationName\":\"RiskToRiskHistory\"},{\"name\":\"assetRisks\",\"kind\":\"object\",\"type\":\"AssetRisk\",\"relationName\":\"AssetRiskToRisk\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToRisk\"}],\"dbName\":null},\"Vendor\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"criticality\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"services\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskScore\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"contactEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastAssessmentDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"assessments\",\"kind\":\"object\",\"type\":\"VendorAssessment\",\"relationName\":\"VendorToVendorAssessment\"},{\"name\":\"evidences\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"EvidenceToVendor\"},{\"name\":\"vendorRisks\",\"kind\":\"object\",\"type\":\"VendorRisk\",\"relationName\":\"VendorToVendorRisk\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToVendor\"}],\"dbName\":null},\"VendorAssessment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"vendorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assessmentDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"assessor\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questionsAsked\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"questionsAnswered\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"riskScore\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"findings\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"recommendations\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"vendor\",\"kind\":\"object\",\"type\":\"Vendor\",\"relationName\":\"VendorToVendorAssessment\"}],\"dbName\":null},\"Evidence\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"vendorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requirementId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"evidenceType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"source\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditPeriod\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"extractedData\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"summary\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"verificationStatus\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewer\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reviewNotes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nextReviewDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"uploadedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToEvidence\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"EvidenceToRisk\"},{\"name\":\"vendor\",\"kind\":\"object\",\"type\":\"Vendor\",\"relationName\":\"EvidenceToVendor\"},{\"name\":\"requirement\",\"kind\":\"object\",\"type\":\"FrameworkRequirement\",\"relationName\":\"EvidenceToFrameworkRequirement\"},{\"name\":\"controlTests\",\"kind\":\"object\",\"type\":\"ControlTest\",\"relationName\":\"ControlTestToEvidence\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"EvidenceToOrganization\"},{\"name\":\"integrationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"integration\",\"kind\":\"object\",\"type\":\"Integration\",\"relationName\":\"EvidenceToIntegration\"}],\"dbName\":null},\"EvidenceFile\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"evidenceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileSize\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"fileType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploadedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploadedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Attestation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"statement\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"attestedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"attestedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"validUntil\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"signature\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Playbook\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scenario\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"steps\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"llmModel\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"RiskControl\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"effectiveness\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"residualRisk\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"RiskToRiskControl\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToRiskControl\"}],\"dbName\":null},\"IncidentRisk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"impactType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToIncidentRisk\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"IncidentRiskToRisk\"}],\"dbName\":null},\"VendorRisk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"vendorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"vendor\",\"kind\":\"object\",\"type\":\"Vendor\",\"relationName\":\"VendorToVendorRisk\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"RiskToVendorRisk\"}],\"dbName\":null},\"Action\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"playbook\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"priority\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expectedRiskReduction\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ActionToControl\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"ActionToIncident\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"ActionToRisk\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"ActionToOrganization\"}],\"dbName\":null},\"Policy\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"approvedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"policyControls\",\"kind\":\"object\",\"type\":\"PolicyControl\",\"relationName\":\"PolicyToPolicyControl\"},{\"name\":\"versions\",\"kind\":\"object\",\"type\":\"PolicyVersion\",\"relationName\":\"PolicyToPolicyVersion\"},{\"name\":\"attestations\",\"kind\":\"object\",\"type\":\"PolicyAttestation\",\"relationName\":\"PolicyToPolicyAttestation\"},{\"name\":\"acknowledgments\",\"kind\":\"object\",\"type\":\"PolicyAcknowledgment\",\"relationName\":\"PolicyToPolicyAcknowledgment\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToPolicy\"}],\"dbName\":null},\"Incident\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"severity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reportedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rootCause\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"remediation\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"resolvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"actions\",\"kind\":\"object\",\"type\":\"Action\",\"relationName\":\"ActionToIncident\"},{\"name\":\"incidentRisks\",\"kind\":\"object\",\"type\":\"IncidentRisk\",\"relationName\":\"IncidentToIncidentRisk\"},{\"name\":\"incidentControls\",\"kind\":\"object\",\"type\":\"IncidentControl\",\"relationName\":\"IncidentToIncidentControl\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"IncidentToOrganization\"}],\"dbName\":null},\"Change\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"justification\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"priority\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"impactLevel\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"urgency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"complexity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskScore\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"requestedDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"plannedStartDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"plannedEndDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"actualStartDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"actualEndDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"implementationPlan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"backoutPlan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"testingPlan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"affectedSystems\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"affectedUsers\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"currentStage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requestedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"implementedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requiresCAB\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"cabMeetingDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"approvalStatus\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"implementationNotes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"actualImpact\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lessonsLearned\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"success\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"complianceChecked\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"securityReviewed\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"parentChangeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"approvals\",\"kind\":\"object\",\"type\":\"ChangeApproval\",\"relationName\":\"ChangeToChangeApproval\"},{\"name\":\"tasks\",\"kind\":\"object\",\"type\":\"ChangeTask\",\"relationName\":\"ChangeToChangeTask\"},{\"name\":\"risks\",\"kind\":\"object\",\"type\":\"ChangeRisk\",\"relationName\":\"ChangeToChangeRisk\"},{\"name\":\"impacts\",\"kind\":\"object\",\"type\":\"ChangeImpact\",\"relationName\":\"ChangeToChangeImpact\"},{\"name\":\"comments\",\"kind\":\"object\",\"type\":\"ChangeComment\",\"relationName\":\"ChangeToChangeComment\"},{\"name\":\"attachments\",\"kind\":\"object\",\"type\":\"ChangeAttachment\",\"relationName\":\"ChangeToChangeAttachment\"},{\"name\":\"parentChange\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeHierarchy\"},{\"name\":\"childChanges\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeHierarchy\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"ChangeToOrganization\"}],\"dbName\":null},\"ChangeApproval\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approverRole\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approverEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approverName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"decision\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"comments\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"conditions\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeApproval\"}],\"dbName\":null},\"ChangeTask\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"taskNumber\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeTask\"}],\"dbName\":null},\"ChangeRisk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"likelihood\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"impact\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"mitigation\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"impactType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeRisk\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"ChangeRiskToRisk\"}],\"dbName\":null},\"ChangeImpact\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"impactArea\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"severity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"affectedCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeImpact\"}],\"dbName\":null},\"ChangeComment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"authorEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"authorName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"comment\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"commentType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeComment\"}],\"dbName\":null},\"ChangeAttachment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploadedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploadedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToChangeAttachment\"}],\"dbName\":null},\"CABMember\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"department\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expertise\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Organization\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"securitySettings\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"users\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"OrganizationToUser\"},{\"name\":\"plan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"subscriptionStatus\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"billingCycle\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nextBillingDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"assessmentLimit\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"assessmentsUsed\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"storageLimit\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"storageUsed\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"features\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"Control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToOrganization\"},{\"name\":\"Risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"OrganizationToRisk\"},{\"name\":\"Vendor\",\"kind\":\"object\",\"type\":\"Vendor\",\"relationName\":\"OrganizationToVendor\"},{\"name\":\"Evidence\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"EvidenceToOrganization\"},{\"name\":\"Action\",\"kind\":\"object\",\"type\":\"Action\",\"relationName\":\"ActionToOrganization\"},{\"name\":\"Policy\",\"kind\":\"object\",\"type\":\"Policy\",\"relationName\":\"OrganizationToPolicy\"},{\"name\":\"Incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToOrganization\"},{\"name\":\"Change\",\"kind\":\"object\",\"type\":\"Change\",\"relationName\":\"ChangeToOrganization\"},{\"name\":\"integrations\",\"kind\":\"object\",\"type\":\"Integration\",\"relationName\":\"IntegrationToOrganization\"},{\"name\":\"riskHistory\",\"kind\":\"object\",\"type\":\"RiskHistory\",\"relationName\":\"OrganizationToRiskHistory\"},{\"name\":\"audits\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToOrganization\"},{\"name\":\"gaps\",\"kind\":\"object\",\"type\":\"Gap\",\"relationName\":\"GapToOrganization\"},{\"name\":\"bcdrPlans\",\"kind\":\"object\",\"type\":\"BCDRPlan\",\"relationName\":\"BCDRPlanToOrganization\"},{\"name\":\"assets\",\"kind\":\"object\",\"type\":\"Asset\",\"relationName\":\"AssetToOrganization\"},{\"name\":\"businessProcesses\",\"kind\":\"object\",\"type\":\"BusinessProcess\",\"relationName\":\"BusinessProcessToOrganization\"},{\"name\":\"questionnaires\",\"kind\":\"object\",\"type\":\"Questionnaire\",\"relationName\":\"OrganizationToQuestionnaire\"},{\"name\":\"employees\",\"kind\":\"object\",\"type\":\"Employee\",\"relationName\":\"EmployeeToOrganization\"},{\"name\":\"trainingCourses\",\"kind\":\"object\",\"type\":\"TrainingCourse\",\"relationName\":\"OrganizationToTrainingCourse\"},{\"name\":\"runbooks\",\"kind\":\"object\",\"type\":\"Runbook\",\"relationName\":\"OrganizationToRunbook\"},{\"name\":\"invitations\",\"kind\":\"object\",\"type\":\"Invitation\",\"relationName\":\"InvitationToOrganization\"},{\"name\":\"auditLogs\",\"kind\":\"object\",\"type\":\"AuditLog\",\"relationName\":\"AuditLogToOrganization\"},{\"name\":\"auditorAccess\",\"kind\":\"object\",\"type\":\"AuditorAccess\",\"relationName\":\"AuditorAccessToOrganization\"},{\"name\":\"auditRequests\",\"kind\":\"object\",\"type\":\"AuditRequest\",\"relationName\":\"AuditRequestToOrganization\"},{\"name\":\"trustCenterConfig\",\"kind\":\"object\",\"type\":\"TrustCenterConfig\",\"relationName\":\"OrganizationToTrustCenterConfig\"},{\"name\":\"knowledgeBase\",\"kind\":\"object\",\"type\":\"KnowledgeBaseEntry\",\"relationName\":\"KnowledgeBaseEntryToOrganization\"}],\"dbName\":null},\"AuditLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"resource\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"resourceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"integrityHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"AuditLogToOrganization\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"TrustRequest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"company\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"LLMUsage\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"model\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tokensIn\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"tokensOut\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"cost\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"feature\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"LLMUsageToUser\"}],\"dbName\":null},\"Integration\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"provider\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"encryptedCredentials\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"config\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"lastSyncAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"IntegrationToOrganization\"},{\"name\":\"evidences\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"EvidenceToIntegration\"}],\"dbName\":null},\"LLMCache\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"promptHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"response\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"model\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Subscription\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SubscriptionToUser\"},{\"name\":\"planId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lemonSqueezyCustomerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lemonSqueezySubscriptionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"transactions\",\"kind\":\"object\",\"type\":\"Transaction\",\"relationName\":\"SubscriptionToTransaction\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Transaction\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"subscriptionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"subscription\",\"kind\":\"object\",\"type\":\"Subscription\",\"relationName\":\"SubscriptionToTransaction\"},{\"name\":\"amount\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"currency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lemonSqueezyOrderId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"RiskHistory\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"likelihood\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"impact\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"calculatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToRiskHistory\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"RiskToRiskHistory\"}],\"dbName\":null},\"Audit\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"framework\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorOrg\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"findings\",\"kind\":\"object\",\"type\":\"AuditFinding\",\"relationName\":\"AuditToAuditFinding\"},{\"name\":\"tests\",\"kind\":\"object\",\"type\":\"ControlTest\",\"relationName\":\"AuditToControlTest\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"AuditToOrganization\"},{\"name\":\"auditorAccess\",\"kind\":\"object\",\"type\":\"AuditorAccess\",\"relationName\":\"AuditToAuditorAccess\"},{\"name\":\"auditRequests\",\"kind\":\"object\",\"type\":\"AuditRequest\",\"relationName\":\"AuditToAuditRequest\"}],\"dbName\":null},\"AuditFinding\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"severity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"recommendation\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"remediationPlan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"audit\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToAuditFinding\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"AuditFindingToControl\"}],\"dbName\":null},\"ControlTest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"testDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"tester\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"testType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"testProcedure\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sampleSize\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"result\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"findings\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"recommendations\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"evidenceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"evidenceLinks\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"audit\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToControlTest\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToControlTest\"},{\"name\":\"evidence\",\"kind\":\"object\",\"type\":\"Evidence\",\"relationName\":\"ControlTestToEvidence\"}],\"dbName\":null},\"PolicyControl\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"relationship\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"policy\",\"kind\":\"object\",\"type\":\"Policy\",\"relationName\":\"PolicyToPolicyControl\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToPolicyControl\"}],\"dbName\":null},\"PolicyVersion\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"policy\",\"kind\":\"object\",\"type\":\"Policy\",\"relationName\":\"PolicyToPolicyVersion\"}],\"dbName\":null},\"PolicyAttestation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"attestedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"signature\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policy\",\"kind\":\"object\",\"type\":\"Policy\",\"relationName\":\"PolicyToPolicyAttestation\"}],\"dbName\":null},\"IncidentControl\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bypassType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToIncidentControl\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"ControlToIncidentControl\"}],\"dbName\":null},\"Gap\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"severity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"framework\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"impact\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"remediationPlan\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"effort\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timeline\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"GapToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"remediationSteps\",\"kind\":\"object\",\"type\":\"RemediationStep\",\"relationName\":\"GapToRemediationStep\"}],\"dbName\":null},\"RemediationStep\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"gapId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stepNumber\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"gap\",\"kind\":\"object\",\"type\":\"Gap\",\"relationName\":\"GapToRemediationStep\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"BCDRPlan\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rto\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"rpo\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"mtpd\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastTested\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"nextTestDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"BCDRPlanToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"tests\",\"kind\":\"object\",\"type\":\"DRTest\",\"relationName\":\"BCDRPlanToDRTest\"},{\"name\":\"processes\",\"kind\":\"object\",\"type\":\"BusinessProcess\",\"relationName\":\"BCDRPlanToBusinessProcess\"}],\"dbName\":null},\"DRTest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"planId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"testDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"results\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"findings\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"attendees\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"duration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"passRate\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"plan\",\"kind\":\"object\",\"type\":\"BCDRPlan\",\"relationName\":\"BCDRPlanToDRTest\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Asset\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"criticality\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"location\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"purchaseDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endOfLife\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"confidentiality\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"integrity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"availability\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"AssetToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"risks\",\"kind\":\"object\",\"type\":\"AssetRisk\",\"relationName\":\"AssetToAssetRisk\"},{\"name\":\"controls\",\"kind\":\"object\",\"type\":\"AssetControl\",\"relationName\":\"AssetToAssetControl\"}],\"dbName\":null},\"AssetRisk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assetId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"riskId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"asset\",\"kind\":\"object\",\"type\":\"Asset\",\"relationName\":\"AssetToAssetRisk\"},{\"name\":\"risk\",\"kind\":\"object\",\"type\":\"Risk\",\"relationName\":\"AssetRiskToRisk\"}],\"dbName\":null},\"AssetControl\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assetId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"asset\",\"kind\":\"object\",\"type\":\"Asset\",\"relationName\":\"AssetToAssetControl\"},{\"name\":\"control\",\"kind\":\"object\",\"type\":\"Control\",\"relationName\":\"AssetControlToControl\"}],\"dbName\":null},\"BusinessProcess\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"criticality\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rto\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"rpo\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"dependencies\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stakeholders\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bcdrPlanId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bcdrPlan\",\"kind\":\"object\",\"type\":\"BCDRPlan\",\"relationName\":\"BCDRPlanToBusinessProcess\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"BusinessProcessToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Questionnaire\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToQuestionnaire\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"questions\",\"kind\":\"object\",\"type\":\"Question\",\"relationName\":\"QuestionToQuestionnaire\"},{\"name\":\"responses\",\"kind\":\"object\",\"type\":\"QuestionnaireResponse\",\"relationName\":\"QuestionnaireToQuestionnaireResponse\"}],\"dbName\":null},\"Question\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questionnaireId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"text\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"options\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"required\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"weight\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"questionnaire\",\"kind\":\"object\",\"type\":\"Questionnaire\",\"relationName\":\"QuestionToQuestionnaire\"},{\"name\":\"answers\",\"kind\":\"object\",\"type\":\"Answer\",\"relationName\":\"AnswerToQuestion\"}],\"dbName\":null},\"QuestionnaireResponse\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questionnaireId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"respondentEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"respondentName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"submittedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reviewedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questionnaire\",\"kind\":\"object\",\"type\":\"Questionnaire\",\"relationName\":\"QuestionnaireToQuestionnaireResponse\"},{\"name\":\"answers\",\"kind\":\"object\",\"type\":\"Answer\",\"relationName\":\"AnswerToQuestionnaireResponse\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Answer\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"responseId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"question\",\"kind\":\"object\",\"type\":\"Question\",\"relationName\":\"AnswerToQuestion\"},{\"name\":\"response\",\"kind\":\"object\",\"type\":\"QuestionnaireResponse\",\"relationName\":\"AnswerToQuestionnaireResponse\"}],\"dbName\":null},\"Employee\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"department\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"manager\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"hireDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastTrainingDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"EmployeeToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"trainings\",\"kind\":\"object\",\"type\":\"TrainingAssignment\",\"relationName\":\"EmployeeToTrainingAssignment\"},{\"name\":\"policyAcks\",\"kind\":\"object\",\"type\":\"PolicyAcknowledgment\",\"relationName\":\"EmployeeToPolicyAcknowledgment\"}],\"dbName\":null},\"PolicyAcknowledgment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employeeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"acknowledgedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employee\",\"kind\":\"object\",\"type\":\"Employee\",\"relationName\":\"EmployeeToPolicyAcknowledgment\"},{\"name\":\"policy\",\"kind\":\"object\",\"type\":\"Policy\",\"relationName\":\"PolicyToPolicyAcknowledgment\"}],\"dbName\":null},\"TrainingCourse\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"duration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"mandatory\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"passingScore\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"frequency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToTrainingCourse\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"assignments\",\"kind\":\"object\",\"type\":\"TrainingAssignment\",\"relationName\":\"TrainingAssignmentToTrainingCourse\"}],\"dbName\":null},\"TrainingAssignment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employeeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"courseId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"attempts\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employee\",\"kind\":\"object\",\"type\":\"Employee\",\"relationName\":\"EmployeeToTrainingAssignment\"},{\"name\":\"course\",\"kind\":\"object\",\"type\":\"TrainingCourse\",\"relationName\":\"TrainingAssignmentToTrainingCourse\"}],\"dbName\":null},\"TrainingCertificate\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignmentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employeeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"courseId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"certificateNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"issuedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"employeeName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"courseName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"score\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"pdfUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"verificationUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isValid\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"revokedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"revokedReason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"PhishingCampaign\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"templateId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scheduledAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"targetType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"targetFilter\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sendingRate\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"trackClicks\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"trackSubmissions\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"collectCredentials\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"totalTargets\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"emailsSent\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"emailsOpened\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"linksClicked\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"dataSubmitted\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"template\",\"kind\":\"object\",\"type\":\"PhishingTemplate\",\"relationName\":\"PhishingCampaignToPhishingTemplate\"},{\"name\":\"targets\",\"kind\":\"object\",\"type\":\"PhishingTarget\",\"relationName\":\"PhishingCampaignToPhishingTarget\"}],\"dbName\":null},\"PhishingTemplate\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"subject\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"senderName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"senderEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"htmlContent\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"landingPageHtml\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"difficulty\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"campaigns\",\"kind\":\"object\",\"type\":\"PhishingCampaign\",\"relationName\":\"PhishingCampaignToPhishingTemplate\"}],\"dbName\":null},\"PhishingTarget\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"campaignId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"employeeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailSentAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"emailOpenedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"linkClickedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dataSubmittedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reportedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"trainingAssigned\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"trainingCompleted\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"campaign\",\"kind\":\"object\",\"type\":\"PhishingCampaign\",\"relationName\":\"PhishingCampaignToPhishingTarget\"}],\"dbName\":null},\"Runbook\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"triggerCondition\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"estimatedTime\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToRunbook\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"steps\",\"kind\":\"object\",\"type\":\"RunbookStep\",\"relationName\":\"RunbookToRunbookStep\"},{\"name\":\"executions\",\"kind\":\"object\",\"type\":\"RunbookExecution\",\"relationName\":\"RunbookToRunbookExecution\"}],\"dbName\":null},\"RunbookStep\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"runbookId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stepNumber\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignee\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"estimated\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"critical\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"runbook\",\"kind\":\"object\",\"type\":\"Runbook\",\"relationName\":\"RunbookToRunbookStep\"}],\"dbName\":null},\"RunbookExecution\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"runbookId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"triggeredBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"triggeredAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"currentStep\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"runbook\",\"kind\":\"object\",\"type\":\"Runbook\",\"relationName\":\"RunbookToRunbookExecution\"}],\"dbName\":null},\"AuditorAccess\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accessCode\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"firmName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"lastAccessedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"accessCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"AuditorAccessToOrganization\"},{\"name\":\"audit\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToAuditorAccess\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"requests\",\"kind\":\"object\",\"type\":\"AuditRequest\",\"relationName\":\"AuditRequestToAuditorAccess\"}],\"dbName\":null},\"AuditRequest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorAccessId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"priority\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignedTo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"submittedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reviewedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reviewedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requirementId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"auditorComments\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"AuditRequestToOrganization\"},{\"name\":\"audit\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToAuditRequest\"},{\"name\":\"auditorAccess\",\"kind\":\"object\",\"type\":\"AuditorAccess\",\"relationName\":\"AuditRequestToAuditorAccess\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"attachments\",\"kind\":\"object\",\"type\":\"AuditRequestAttachment\",\"relationName\":\"AuditRequestToAuditRequestAttachment\"}],\"dbName\":null},\"AuditRequestAttachment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requestId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fileSize\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"mimeType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploadedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"request\",\"kind\":\"object\",\"type\":\"AuditRequest\",\"relationName\":\"AuditRequestToAuditRequestAttachment\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"TrustCenterConfig\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"companyName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"logoUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"primaryColor\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accentColor\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isPublished\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"customDomain\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"contactEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"securityEmail\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"OrganizationToTrustCenterConfig\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"sections\",\"kind\":\"object\",\"type\":\"TrustCenterSection\",\"relationName\":\"TrustCenterConfigToTrustCenterSection\"}],\"dbName\":null},\"TrustCenterSection\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"configId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sectionType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"displayOrder\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"isVisible\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"icon\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"config\",\"kind\":\"object\",\"type\":\"TrustCenterConfig\",\"relationName\":\"TrustCenterConfigToTrustCenterSection\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"KnowledgeBaseEntry\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"question\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"answer\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tags\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"approvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"controlId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"frameworkId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"confidenceScore\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastUsedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"usageCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organizationId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"organization\",\"kind\":\"object\",\"type\":\"Organization\",\"relationName\":\"KnowledgeBaseEntryToOrganization\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

