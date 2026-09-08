import { Firm, UserProfile, FormTemplate, ClientCase, AuditLogEntry, EmailNotification, AppNotification } from "../types";

export const INITIAL_FIRMS: Firm[] = [
  {
    id: "firm-apex",
    name: "Apex Advisory & Legal LLP",
    slug: "apex-advisory",
    logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80",
    primaryColor: "#0066FF",
    secondaryColor: "#0A1C30",
    contactEmail: "intake@apexadvisory.com",
    phone: "+1 (555) 349-2900",
    address: "450 Lexington Ave, Suite 2400, New York, NY 10017",
    industry: "Law & Legal",
    plan: "starter",
    billingCycle: "monthly",
    planActivatedAt: "2026-01-15T09:00:00Z",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "firm-vanguard",
    name: "Vanguard CPA Partners",
    slug: "vanguard-cpa",
    logoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&auto=format&fit=crop&q=80",
    primaryColor: "#059669",
    secondaryColor: "#064E3B",
    contactEmail: "onboarding@vanguardcpa.com",
    phone: "+1 (555) 782-1144",
    address: "100 Montgomery St, San Francisco, CA 94104",
    industry: "Accounting & CA",
    plan: "professional",
    billingCycle: "annual",
    planActivatedAt: "2026-02-01T10:30:00Z",
    createdAt: "2026-02-01T10:30:00Z",
  }
];

export const INITIAL_USERS: UserProfile[] = [
  // Apex Users
  {
    id: "user-apex-admin",
    email: "admin@apexadvisory.com",
    name: "Eleanor Vance (Partner / Admin)",
    role: "Admin",
    firmId: "firm-apex",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
    title: "Senior Partner & Practice Lead",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "user-apex-cm",
    email: "casemanager@apexadvisory.com",
    name: "Marcus Sterling (Case Manager)",
    role: "CaseManager",
    firmId: "firm-apex",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80",
    title: "Onboarding Case Manager",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "user-apex-staff",
    email: "staff@apexadvisory.com",
    name: "Chloe Zhao (Staff Associate)",
    role: "Staff",
    firmId: "firm-apex",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&auto=format&fit=crop&q=80",
    title: "Compliance & Intake Associate",
    createdAt: "2026-01-18T14:30:00Z",
  },
  {
    id: "user-apex-client-1",
    email: "david@luminahealth.io",
    name: "David Chen (Lumina Health)",
    role: "Client",
    firmId: "firm-apex",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&auto=format&fit=crop&q=80",
    title: "CEO, Lumina Health Inc.",
    createdAt: "2026-02-10T11:00:00Z",
  },
  // Vanguard Users
  {
    id: "user-vanguard-admin",
    email: "admin@vanguardcpa.com",
    name: "Arthur Pendelton (CPA Admin)",
    role: "Admin",
    firmId: "firm-vanguard",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&auto=format&fit=crop&q=80",
    title: "Managing CPA Partner",
    createdAt: "2026-02-01T10:30:00Z",
  }
];

export const INITIAL_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "tmpl-corporate-intake",
    firmId: "firm-apex",
    title: "Corporate Legal Intake & KYC Form",
    description: "Standard comprehensive intake questionnaire for corporate counsel, entity registration, and beneficial ownership.",
    category: "Corporate Legal",
    createdAt: "2026-01-16T11:00:00Z",
    updatedAt: "2026-02-01T15:20:00Z",
    fields: [
      {
        id: "field_company_legal_name",
        label: "Legal Entity Name",
        type: "text",
        placeholder: "e.g. Lumina Health Inc.",
        helpText: "Enter the registered legal name matching your state formation document.",
        required: true,
      },
      {
        id: "field_entity_type",
        label: "Entity Formation Type",
        type: "dropdown",
        helpText: "Select your organizational structure.",
        required: true,
        options: ["Corporation (C-Corp / S-Corp)", "Limited Liability Company (LLC)", "Partnership", "Sole Proprietorship", "Non-Profit 501(c)(3)"],
      },
      {
        id: "field_ein_number",
        label: "Employer Identification Number (EIN / Tax ID)",
        type: "text",
        placeholder: "XX-XXXXXXX",
        helpText: "Required for corporations and registered LLCs.",
        required: true,
        condition: {
          triggerFieldId: "field_entity_type",
          operator: "contains",
          value: "Corporation",
        },
      },
      {
        id: "field_jurisdiction_state",
        label: "State / Jurisdiction of Incorporation",
        type: "dropdown",
        required: true,
        options: ["Delaware", "New York", "California", "Texas", "Florida", "Nevada", "Other State / International"],
      },
      {
        id: "field_foreign_ownership",
        label: "Does any foreign individual or foreign entity hold >25% beneficial ownership?",
        type: "yesno",
        helpText: "Helps assess FinCEN BOI reporting and cross-border compliance.",
        required: true,
      },
      {
        id: "field_foreign_details",
        label: "Foreign Beneficial Ownership Details & Countries",
        type: "textarea",
        placeholder: "Please describe countries of citizenship and ownership percentages...",
        required: true,
        condition: {
          triggerFieldId: "field_foreign_ownership",
          operator: "equals",
          value: "Yes",
        },
      },
      {
        id: "field_annual_revenue",
        label: "Estimated Annual Gross Revenue (USD)",
        type: "number",
        placeholder: "e.g. 2500000",
        required: false,
      },
      {
        id: "field_primary_contact_date",
        label: "Target Legal Closing Date / Fiscal Year End",
        type: "date",
        required: false,
      },
      {
        id: "field_attestation_agree",
        label: "I certify that all information provided is accurate and complete to the best of my knowledge.",
        type: "checkbox",
        required: true,
      }
    ]
  },
  {
    id: "tmpl-tax-onboarding",
    firmId: "firm-vanguard",
    title: "Annual Tax Preparation & Accounting Intake",
    description: "Intake form for business and high net worth individual tax preparation.",
    category: "Tax & Accounting",
    createdAt: "2026-02-02T14:00:00Z",
    updatedAt: "2026-02-02T14:00:00Z",
    fields: [
      {
        id: "tax_filer_type",
        label: "Tax Filing Type",
        type: "dropdown",
        required: true,
        options: ["Business (Form 1120 / 1065)", "Individual 1040 with Schedule C", "Estate or Trust 1041"],
      },
      {
        id: "tax_accounting_software",
        label: "Primary Bookkeeping Software",
        type: "dropdown",
        required: true,
        options: ["QuickBooks Online", "Xero", "NetSuite", "Manual Spreadsheets / Excel"],
      },
      {
        id: "tax_has_crypto",
        label: "Did you engage in cryptocurrency or digital asset transactions this fiscal year?",
        type: "yesno",
        required: true,
      }
    ]
  }
];

export const INITIAL_CASES: ClientCase[] = [
  {
    id: "case-101",
    firmId: "firm-apex",
    clientName: "David Chen",
    clientEmail: "david@luminahealth.io",
    clientCompany: "Lumina Health Inc.",
    title: "Series A Financing & Corporate Governance Intake",
    status: "Under Review",
    formTemplateId: "tmpl-corporate-intake",
    formResponses: {
      field_company_legal_name: "Lumina Health Technologies Inc.",
      field_entity_type: "Corporation (C-Corp / S-Corp)",
      field_ein_number: "88-4920193",
      field_jurisdiction_state: "Delaware",
      field_foreign_ownership: "Yes",
      field_foreign_details: "28% owned by Lumina Global Holdings Ltd. (United Kingdom)",
      field_annual_revenue: 3800000,
      field_primary_contact_date: "2026-10-31",
      field_attestation_agree: true
    },
    formSubmittedAt: "2026-02-18T16:45:00Z",
    assignedTo: "user-apex-cm",
    assignedToName: "Marcus Sterling",
    portalToken: "pt-lumina-9941a",
    createdAt: "2026-02-10T11:00:00Z",
    updatedAt: "2026-02-20T14:15:00Z",
    checklist: [
      {
        id: "chk-1",
        name: "Certificate of Incorporation (Delaware Secretary of State)",
        description: "Official stamped copy including any filed amendments.",
        required: true,
        status: "Approved",
        approvedAt: "2026-02-19T10:30:00Z",
        approvedBy: "Marcus Sterling",
        versions: [
          {
            version: 1,
            fileName: "Lumina_Health_Delaware_Cert_Inc.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: 1420500,
            fileType: "application/pdf",
            uploadedAt: "2026-02-18T16:50:00Z",
            uploadedBy: "David Chen"
          }
        ],
        extraction: {
          documentType: "Corporate Formation Document",
          confidence: 96,
          extractedAt: "2026-02-18T16:50:30Z",
          fields: [
            { label: "Entity Legal Name", value: "Lumina Health Technologies Inc.", status: "match" },
            { label: "Filing Jurisdiction", value: "Delaware", status: "match" },
            { label: "Filing Date", value: "2026-02-15", status: "unverified" },
            { label: "Registered Agent", value: "Corporate Services Inc.", status: "unverified" },
          ],
          crossCheckSummary: "2 of 2 verifiable fields matched form responses",
        },
      },
      {
        id: "chk-2",
        name: "Government ID / Passport of Primary Officers",
        description: "Clear color scan of valid passport or driver's license for KYC verification.",
        required: true,
        status: "Rejected",
        rejectionReason: "The uploaded passport scan has significant glare over the expiration date and MRZ barcode. Please re-upload a clear, non-cropped scan.",
        versions: [
          {
            version: 1,
            fileName: "david_chen_passport_scan_v1.jpg",
            fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
            fileSize: 845200,
            fileType: "image/jpeg",
            uploadedAt: "2026-02-18T16:52:00Z",
            uploadedBy: "David Chen"
          }
        ],
        extraction: {
          documentType: "Government ID",
          confidence: 58,
          extractedAt: "2026-02-18T16:52:30Z",
          fields: [
            { label: "Full Legal Name", value: "David J. Chen", status: "mismatch" },
            { label: "Date of Birth", value: "04/12/1985", status: "unverified" },
            { label: "ID / Document Number", value: "71-4820193", status: "unverified" },
            { label: "Issuing Authority", value: "U.S. Department of State", status: "unverified" },
          ],
          crossCheckSummary: "0 of 1 verifiable field matched form responses — 1 flagged for review",
        },
      },
      {
        id: "chk-3",
        name: "Cap Table & Stockholder Register",
        description: "Latest Carta export or signed equity capitalization spreadsheet.",
        required: true,
        status: "Uploaded",
        versions: [
          {
            version: 1,
            fileName: "Lumina_Health_CapTable_Feb2026.docx",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: 420000,
            fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            uploadedAt: "2026-02-19T09:12:00Z",
            uploadedBy: "David Chen"
          }
        ]
      },
      {
        id: "chk-4",
        name: "Prior 2 Years Audited Financial Statements or Tax Returns",
        description: "Consolidated balance sheet and profit & loss statements.",
        required: false,
        status: "Not Started",
        versions: []
      }
    ]
  },
  {
    id: "case-102",
    firmId: "firm-apex",
    clientName: "Elena Rostova",
    clientEmail: "elena@vortextrading.com",
    clientCompany: "Vortex Algorithmic Capital",
    title: "Hedge Fund Regulatory Setup & Partner Intake",
    status: "Documents Pending",
    formTemplateId: "tmpl-corporate-intake",
    formResponses: {
      field_company_legal_name: "Vortex Algorithmic Capital LLC",
      field_entity_type: "Limited Liability Company (LLC)",
      field_jurisdiction_state: "Delaware",
      field_foreign_ownership: "No",
      field_annual_revenue: 12500000,
      field_attestation_agree: true
    },
    formSubmittedAt: "2026-02-21T09:30:00Z",
    assignedTo: "user-apex-cm",
    assignedToName: "Marcus Sterling",
    portalToken: "pt-vortex-8821b",
    createdAt: "2026-02-15T14:00:00Z",
    updatedAt: "2026-02-22T11:00:00Z",
    checklist: [
      {
        id: "chk-102-1",
        name: "LLC Operating Agreement & Amendments",
        required: true,
        status: "Uploaded",
        versions: [
          {
            version: 1,
            fileName: "Vortex_Operating_Agreement_Executed.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: 2890000,
            fileType: "application/pdf",
            uploadedAt: "2026-02-21T10:00:00Z",
            uploadedBy: "Elena Rostova"
          }
        ]
      },
      {
        id: "chk-102-2",
        name: "Bank Letter of Good Standing & Wire Authorization",
        required: true,
        status: "Not Started",
        versions: []
      }
    ]
  },
  {
    id: "case-103",
    firmId: "firm-apex",
    clientName: "Jonathan Hayes",
    clientEmail: "jhayes@solarisbio.com",
    clientCompany: "Solaris Biosystems Inc.",
    title: "Patent Portfolio Assignment & Clean-Up",
    status: "Approved",
    formTemplateId: "tmpl-corporate-intake",
    formResponses: {
      field_company_legal_name: "Solaris Biosystems Inc.",
      field_entity_type: "Corporation (C-Corp / S-Corp)",
      field_ein_number: "47-9201882",
      field_jurisdiction_state: "California",
      field_foreign_ownership: "No",
      field_annual_revenue: 5600000,
      field_attestation_agree: true
    },
    formSubmittedAt: "2026-02-05T10:00:00Z",
    assignedTo: "user-apex-admin",
    assignedToName: "Eleanor Vance",
    portalToken: "pt-solaris-3319c",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-14T17:00:00Z",
    checklist: [
      {
        id: "chk-103-1",
        name: "USPTO Assignment Records",
        required: true,
        status: "Approved",
        approvedAt: "2026-02-10T14:00:00Z",
        approvedBy: "Eleanor Vance",
        versions: [
          {
            version: 1,
            fileName: "Solaris_Patent_Assignments_Recorded.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: 1850000,
            fileType: "application/pdf",
            uploadedAt: "2026-02-06T11:20:00Z",
            uploadedBy: "Jonathan Hayes"
          }
        ]
      }
    ]
  },
  {
    id: "case-104",
    firmId: "firm-apex",
    clientName: "Maya Lin",
    clientEmail: "mlin@apex-client-demo.com",
    clientCompany: "Lin & Co Architectural Studio",
    title: "Partnership Agreement Restructuring",
    status: "Invited",
    formTemplateId: "tmpl-corporate-intake",
    formResponses: {},
    assignedTo: "user-apex-staff",
    assignedToName: "Chloe Zhao",
    portalToken: "pt-lin-7744d",
    createdAt: "2026-02-25T11:00:00Z",
    updatedAt: "2026-02-25T11:00:00Z",
    checklist: [
      {
        id: "chk-104-1",
        name: "Current Partnership Agreement",
        required: true,
        status: "Not Started",
        versions: []
      },
      {
        id: "chk-104-2",
        name: "Proof of Identity for All Partners",
        required: true,
        status: "Not Started",
        versions: []
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    firmId: "firm-apex",
    caseId: "case-101",
    caseTitle: "Series A Financing & Corporate Governance Intake",
    timestamp: "2026-02-10T11:00:00Z",
    actorId: "user-apex-cm",
    actorName: "Marcus Sterling",
    actorRole: "CaseManager",
    action: "Case Created & Invited",
    targetEntity: "David Chen (Lumina Health Inc.)",
    details: "Case initiated with Corporate Legal Intake template and 4 checklist items. Secure portal invite sent."
  },
  {
    id: "log-2",
    firmId: "firm-apex",
    caseId: "case-101",
    caseTitle: "Series A Financing & Corporate Governance Intake",
    timestamp: "2026-02-18T16:45:00Z",
    actorId: "user-apex-client-1",
    actorName: "David Chen",
    actorRole: "Client",
    action: "Form Submitted",
    targetEntity: "Corporate Legal Intake & KYC Form",
    details: "Client completed all 9 form fields including foreign ownership disclosures."
  },
  {
    id: "log-3",
    firmId: "firm-apex",
    caseId: "case-101",
    caseTitle: "Series A Financing & Corporate Governance Intake",
    timestamp: "2026-02-18T16:50:00Z",
    actorId: "user-apex-client-1",
    actorName: "David Chen",
    actorRole: "Client",
    action: "Document Uploaded",
    targetEntity: "Lumina_Health_Delaware_Cert_Inc.pdf (v1)",
    details: "Uploaded to Certificate of Incorporation requirement (1.42 MB)."
  },
  {
    id: "log-4",
    firmId: "firm-apex",
    caseId: "case-101",
    caseTitle: "Series A Financing & Corporate Governance Intake",
    timestamp: "2026-02-19T10:30:00Z",
    actorId: "user-apex-cm",
    actorName: "Marcus Sterling",
    actorRole: "CaseManager",
    action: "Document Approved",
    targetEntity: "Certificate of Incorporation",
    details: "Delaware certified copy verified and approved."
  },
  {
    id: "log-5",
    firmId: "firm-apex",
    caseId: "case-101",
    caseTitle: "Series A Financing & Corporate Governance Intake",
    timestamp: "2026-02-19T10:32:00Z",
    actorId: "user-apex-cm",
    actorName: "Marcus Sterling",
    actorRole: "CaseManager",
    action: "Document Rejected",
    targetEntity: "david_chen_passport_scan_v1.jpg",
    details: "Rejection Reason: The uploaded passport scan has significant glare over expiration date. Re-upload requested."
  }
];

export const INITIAL_EMAILS: EmailNotification[] = [
  {
    id: "email-1",
    firmId: "firm-apex",
    to: "david@luminahealth.io",
    recipientName: "David Chen",
    subject: "Action Required: Complete your onboarding with Apex Advisory & Legal LLP",
    bodyText: "Dear David Chen, Welcome to Apex Advisory & Legal LLP. Please access your secure onboarding portal to submit your corporate KYC information and required documents.",
    type: "invitation",
    sentAt: "2026-02-10T11:00:00Z",
    status: "delivered",
    metadata: { caseId: "case-101", portalLink: "/portal/apex-advisory/case-101" }
  },
  {
    id: "email-2",
    firmId: "firm-apex",
    to: "david@luminahealth.io",
    recipientName: "David Chen",
    subject: "Update on Document: Government ID / Passport scan rejected",
    bodyText: "Dear David, Marcus Sterling reviewed your uploaded Government ID and noted: 'The uploaded passport scan has significant glare over the expiration date. Please re-upload a clear scan.' Please log in to your portal to re-upload.",
    type: "doc_rejected",
    sentAt: "2026-02-19T10:32:00Z",
    status: "delivered",
    metadata: { caseId: "case-101", docName: "Government ID / Passport of Primary Officers" }
  },
  {
    id: "email-3",
    firmId: "firm-apex",
    to: "casemanager@apexadvisory.com",
    recipientName: "Marcus Sterling",
    subject: "New Form Submission: David Chen submitted Corporate Legal Intake",
    bodyText: "Client David Chen (Lumina Health Inc.) has submitted their intake form for Case #case-101. Review the answers in your dashboard.",
    type: "form_submitted",
    sentAt: "2026-02-18T16:45:00Z",
    status: "delivered",
    metadata: { caseId: "case-101" }
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    firmId: "firm-apex",
    type: "form_submitted",
    title: "Intake form submitted",
    message: "David Chen submitted their intake questionnaire for \"Series A Financing & Corporate Governance Intake\".",
    caseId: "case-101",
    read: true,
    createdAt: "2026-02-18T16:45:00Z",
  },
  {
    id: "notif-2",
    firmId: "firm-apex",
    type: "doc_approved",
    title: "Document approved",
    message: "Marcus Sterling approved \"Certificate of Incorporation (Delaware Secretary of State)\" for David Chen.",
    caseId: "case-101",
    read: true,
    createdAt: "2026-02-19T10:30:00Z",
  },
  {
    id: "notif-3",
    firmId: "firm-apex",
    type: "extraction_flagged",
    title: "AI extraction flagged an issue",
    message: "\"Government ID / Passport of Primary Officers\" on David Chen's case needs manual review — 0 of 1 verifiable field matched form responses — 1 flagged for review.",
    caseId: "case-101",
    read: false,
    createdAt: "2026-02-18T16:52:30Z",
  },
  {
    id: "notif-4",
    firmId: "firm-apex",
    type: "doc_rejected",
    title: "Document rejected",
    message: "Marcus Sterling rejected \"Government ID / Passport of Primary Officers\" for David Chen.",
    caseId: "case-101",
    read: false,
    createdAt: "2026-02-19T10:32:00Z",
  },
  {
    id: "notif-5",
    firmId: "firm-apex",
    type: "case_assigned",
    title: "New case assigned to you",
    message: "You've been assigned \"Partnership Agreement Restructuring\" for Maya Lin.",
    caseId: "case-104",
    read: false,
    createdAt: "2026-02-25T11:00:00Z",
  },
];
