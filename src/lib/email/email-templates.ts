// Email Templates for Compliance Reminders
// This is a simplified implementation for MVP - in production, use Cloud Functions

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailData {
  recipientEmail: string;
  recipientName: string;
  companyName?: string;
  projectName: string;
  dueDate: string;
  overdueBy?: number;
}

// Email template generator functions
export class EmailTemplates {
  
  // First Monday of month - Proactive reminder
  static generateProactiveReminder(data: EmailData): EmailTemplate {
    const subject = `Reminder: Monthly Safety Report Due - ${data.projectName}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Safety Report Reminder</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc;">
          <p>Dear ${data.recipientName},</p>
          
          <p>This is a friendly reminder that your monthly safety report for <strong>${data.projectName}</strong> is due by <strong>${data.dueDate}</strong>.</p>
          
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0277bd; margin-top: 0;">Required Submissions:</h3>
            <ul style="color: #0277bd;">
              <li>Monthly safety metrics (11 required fields)</li>
              <li>Daily Hazard Assessments (FLRA/PWHA)</li>
              <li>Safety Inspection Reports</li>
              <li>Toolbox Talk Attendance Sheet</li>
              <li>Equipment Pre-Use Inspection Forms</li>
              <li>Incident Investigation Report (if incidents occurred)</li>
            </ul>
          </div>
          
          <p>Please log into the Compliance Management Platform to submit your report:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Portal
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please contact your assigned advisor.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="color: #64748b; font-size: 12px;">
            This is an automated reminder from the Compliance Management Platform.<br>
            ${data.companyName ? `Company: ${data.companyName}` : ''}
          </p>
        </div>
      </div>
    `;
    
    const textBody = `
Safety Report Reminder

Dear ${data.recipientName},

This is a friendly reminder that your monthly safety report for ${data.projectName} is due by ${data.dueDate}.

Required Submissions:
- Monthly safety metrics (11 required fields)
- Daily Hazard Assessments (FLRA/PWHA)
- Safety Inspection Reports
- Toolbox Talk Attendance Sheet
- Equipment Pre-Use Inspection Forms
- Incident Investigation Report (if incidents occurred)

Please log into the Compliance Management Platform to submit your report:
${process.env.NEXT_PUBLIC_APP_URL}/login

If you have any questions or need assistance, please contact your assigned advisor.

---
This is an automated reminder from the Compliance Management Platform.
${data.companyName ? `Company: ${data.companyName}` : ''}
    `;
    
    return { subject, htmlBody, textBody };
  }

  // 15th of month - Action required for overdue
  static generateOverdueNotice(data: EmailData): EmailTemplate {
    const subject = `ACTION REQUIRED: Overdue Safety Report - ${data.projectName}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⚠️ ACTION REQUIRED</h1>
          <p style="margin: 5px 0 0 0;">Overdue Safety Report</p>
        </div>
        
        <div style="padding: 30px; background-color: #fef2f2;">
          <p>Dear ${data.recipientName},</p>
          
          <p><strong style="color: #dc2626;">Your monthly safety report for ${data.projectName} is now overdue by ${data.overdueBy || 0} days.</strong></p>
          
          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Immediate Action Required:</h3>
            <p style="color: #991b1b; margin-bottom: 0;">
              Please submit your safety report immediately to maintain compliance. 
              Continued delays may result in project compliance issues.
            </p>
          </div>
          
          <p>To submit your report:</p>
          <ol>
            <li>Log into the Compliance Management Platform</li>
            <li>Complete the monthly safety metrics form</li>
            <li>Upload all required documents</li>
            <li>Submit your report</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Submit Report Now
            </a>
          </div>
          
          <p>If you need assistance or have encountered technical issues, please contact your advisor immediately.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #fca5a5;">
          
          <p style="color: #991b1b; font-size: 12px;">
            This is an automated overdue notice from the Compliance Management Platform.<br>
            ${data.companyName ? `Company: ${data.companyName}` : ''}
          </p>
        </div>
      </div>
    `;
    
    const textBody = `
ACTION REQUIRED: Overdue Safety Report

Dear ${data.recipientName},

Your monthly safety report for ${data.projectName} is now overdue by ${data.overdueBy || 0} days.

IMMEDIATE ACTION REQUIRED:
Please submit your safety report immediately to maintain compliance. 
Continued delays may result in project compliance issues.

To submit your report:
1. Log into the Compliance Management Platform
2. Complete the monthly safety metrics form
3. Upload all required documents
4. Submit your report

Access Portal: ${process.env.NEXT_PUBLIC_APP_URL}/login

If you need assistance or have encountered technical issues, please contact your advisor immediately.

---
This is an automated overdue notice from the Compliance Management Platform.
${data.companyName ? `Company: ${data.companyName}` : ''}
    `;
    
    return { subject, htmlBody, textBody };
  }

  // Last Monday of month - Final notice
  static generateFinalNotice(data: EmailData): EmailTemplate {
    const subject = `FINAL NOTICE: Safety Report Overdue - ${data.projectName}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7c2d12; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 FINAL NOTICE</h1>
          <p style="margin: 5px 0 0 0;">Safety Report Overdue</p>
        </div>
        
        <div style="padding: 30px; background-color: #fef7ed;">
          <p>Dear ${data.recipientName},</p>
          
          <p><strong style="color: #c2410c;">This is a FINAL NOTICE regarding your overdue safety report for ${data.projectName}, which is now ${data.overdueBy || 0} days overdue.</strong></p>
          
          <div style="background-color: #fed7aa; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0;">
            <h3 style="color: #9a3412; margin-top: 0;">Critical Compliance Issue:</h3>
            <ul style="color: #9a3412; margin-bottom: 0;">
              <li>Your project is now at risk of non-compliance</li>
              <li>Further delays may result in project suspension</li>
              <li>Administrative action may be required</li>
              <li>This may affect future project assignments</li>
            </ul>
          </div>
          
          <p><strong>You must submit your safety report within 24 hours of receiving this notice.</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              SUBMIT IMMEDIATELY
            </a>
          </div>
          
          <p>If you are unable to submit within 24 hours, you must contact your advisor immediately to explain the circumstances and arrange alternative compliance measures.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #fdba74;">
          
          <p style="color: #9a3412; font-size: 12px;">
            This is a final automated notice from the Compliance Management Platform.<br>
            ${data.companyName ? `Company: ${data.companyName}` : ''}<br>
            Further action will be escalated to project management.
          </p>
        </div>
      </div>
    `;
    
    const textBody = `
FINAL NOTICE: Safety Report Overdue

Dear ${data.recipientName},

This is a FINAL NOTICE regarding your overdue safety report for ${data.projectName}, which is now ${data.overdueBy || 0} days overdue.

CRITICAL COMPLIANCE ISSUE:
- Your project is now at risk of non-compliance
- Further delays may result in project suspension
- Administrative action may be required
- This may affect future project assignments

You must submit your safety report within 24 hours of receiving this notice.

Access Portal: ${process.env.NEXT_PUBLIC_APP_URL}/login

If you are unable to submit within 24 hours, you must contact your advisor immediately to explain the circumstances and arrange alternative compliance measures.

---
This is a final automated notice from the Compliance Management Platform.
${data.companyName ? `Company: ${data.companyName}` : ''}
Further action will be escalated to project management.
    `;
    
    return { subject, htmlBody, textBody };
  }
}

// Email scheduling utility (simplified for MVP)
export class EmailScheduler {
  
  // In production, this would integrate with Cloud Functions and a proper email service
  static async scheduleReminders() {
    console.log("Email scheduling would be implemented with Cloud Functions");
    
    // Mock implementation for MVP demonstration
    return {
      proactiveReminders: "Scheduled for first Monday of each month",
      overdueNotices: "Scheduled for 15th of each month", 
      finalNotices: "Scheduled for last Monday of each month"
    };
  }
  
  // Send immediate email (mock implementation)
  static async sendEmail(template: EmailTemplate, recipientEmail: string) {
    console.log("Sending email to:", recipientEmail);
    console.log("Subject:", template.subject);
    
    // In production, integrate with SendGrid, AWS SES, or similar service
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      message: "Email sent successfully (mock implementation)"
    };
  }
}

export default EmailTemplates;