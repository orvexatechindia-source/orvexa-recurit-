export type NotificationType =
  | 'APPLICATION_CONFIRMATION'
  | 'INTERVIEW_INVITATION'
  | 'OFFER_LETTER'
  | 'PASSWORD_RESET'
  | 'RECRUITER_NOTIFICATION'
  | 'SYSTEM_NOTIFICATION';

export interface EmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  tenantId: string;
}

// Generates Orvexatech Branded HTML wrapper
export function getEmailWrapper(contentHtml: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
            margin: 0;
            padding: 0;
            color: #0B1220;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #FFFFFF;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #0B1220;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #FFFFFF;
            font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
            font-size: 16px;
          }
          .footer {
            background-color: #F8FAFC;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
          }
          .button {
            display: inline-block;
            background-color: #2563EB;
            color: #FFFFFF !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Orvexa Recruit</h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>Sent by Orvexa Recruit (Orvexatech.io) — The AI-Powered ATS.</p>
            <p>This is an automated transactional message related to your account or application.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Application Confirmation
export function getApplicationConfirmationTemplate(candidateName: string, jobTitle: string, companyName: string): EmailPayload {
  const content = `
    <h2>Application Received!</h2>
    <p>Hi ${candidateName},</p>
    <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We are thrilled that you're interested in joining our team.</p>
    <p>Our talent acquisition team is currently reviewing your profile. If your skills and background align with our needs, we will reach out to schedule an interview.</p>
    <p>Best regards,<br>The ${companyName} Recruiting Team</p>
  `;
  return {
    to: '',
    subject: `Application Confirmed: ${jobTitle} at ${companyName}`,
    bodyHtml: getEmailWrapper(content, 'Application Confirmation'),
    bodyText: `Hi ${candidateName}, Thank you for applying for the ${jobTitle} position at ${companyName}. Our team is reviewing your profile.`,
    tenantId: '',
  };
}

// 2. Interview Invitation
export function getInterviewInvitationTemplate(candidateName: string, jobTitle: string, companyName: string, scheduleUrl: string): EmailPayload {
  const content = `
    <h2>Interview Invitation</h2>
    <p>Hi ${candidateName},</p>
    <p>We are impressed by your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>, and we would love to invite you to a virtual interview.</p>
    <p>Please click the button below to select a time slot that works best for you:</p>
    <p style="text-align: center;">
      <a href="${scheduleUrl}" class="button">Schedule Interview</a>
    </p>
    <p>We look forward to speaking with you!</p>
  `;
  return {
    to: '',
    subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
    bodyHtml: getEmailWrapper(content, 'Interview Invitation'),
    bodyText: `Hi ${candidateName}, We'd like to invite you for an interview for the ${jobTitle} position at ${companyName}. Schedule here: ${scheduleUrl}`,
    tenantId: '',
  };
}

// 3. Offer Letter
export function getOfferLetterTemplate(candidateName: string, jobTitle: string, companyName: string, offerUrl: string): EmailPayload {
  const content = `
    <h2>Official Job Offer</h2>
    <p>Hi ${candidateName},</p>
    <p>Congratulations! We are excited to offer you the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    <p>We believe your experience, skills, and energy will make a significant impact on our team. To review and sign your offer letter, please click the link below:</p>
    <p style="text-align: center;">
      <a href="${offerUrl}" class="button">View & Sign Offer Letter</a>
    </p>
    <p>If you have any questions, please do not hesitate to contact your recruiter.</p>
  `;
  return {
    to: '',
    subject: `Job Offer: ${jobTitle} at ${companyName}`,
    bodyHtml: getEmailWrapper(content, 'Job Offer'),
    bodyText: `Hi ${candidateName}, Congratulations! We're offering you the ${jobTitle} position at ${companyName}. View offer: ${offerUrl}`,
    tenantId: '',
  };
}

// 4. Password Reset
export function getPasswordResetTemplate(userName: string, resetUrl: string): EmailPayload {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${userName},</p>
    <p>We received a request to reset the password for your Orvexa Recruit account. Click the button below to set a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p>If you did not request this change, you can safely ignore this email.</p>
  `;
  return {
    to: '',
    subject: `Reset Your Password - Orvexa Recruit`,
    bodyHtml: getEmailWrapper(content, 'Password Reset'),
    bodyText: `Hi ${userName}, Reset your password here: ${resetUrl}`,
    tenantId: '',
  };
}

// 5. Rejection Letter
export function getRejectionTemplate(candidateName: string, jobTitle: string, companyName: string): EmailPayload {
  const content = `
    <h2>Application Status Update</h2>
    <p>Hi ${candidateName},</p>
    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position and for speaking with us about your background.</p>
    <p>Unfortunately, after careful consideration, we have decided to move forward with other candidates whose experience more closely matches the requirements of this role.</p>
    <p>We appreciate your interest in <strong>${companyName}</strong> and wish you the best in your job search.</p>
    <p>Best regards,<br>The ${companyName} Recruiting Team</p>
  `;
  return {
    to: '',
    subject: `Update on your application for ${jobTitle} at ${companyName}`,
    bodyHtml: getEmailWrapper(content, 'Application Update'),
    bodyText: `Hi ${candidateName}, Thank you for your interest in ${jobTitle} at ${companyName}. We've decided to move forward with other candidates.`,
    tenantId: '',
  };
}

// 6. Application Screening Status Update
export function getScreeningTemplate(candidateName: string, jobTitle: string, companyName: string): EmailPayload {
  const content = `
    <h2>Application Status Update: Screening</h2>
    <p>Hi ${candidateName},</p>
    <p>We wanted to let you know that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been moved to our active <strong>Screening</strong> review stage.</p>
    <p>Our team is currently evaluating your qualifications, and we will update you as soon as next steps are determined.</p>
    <p>Best regards,<br>The ${companyName} Recruiting Team</p>
  `;
  return {
    to: '',
    subject: `Application Update: Screening stage for ${jobTitle} at ${companyName}`,
    bodyHtml: getEmailWrapper(content, 'Application Screening'),
    bodyText: `Hi ${candidateName}, Your application for ${jobTitle} at ${companyName} has moved to the Screening stage.`,
    tenantId: '',
  };
}

// 7. Welcome Hired Onboarding Status
export function getWelcomeTemplate(candidateName: string, jobTitle: string, companyName: string): EmailPayload {
  const content = `
    <h2>Welcome to the Team!</h2>
    <p>Hi ${candidateName},</p>
    <p>A huge congratulations on officially accepting our job offer as the new <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!</p>
    <p>We are absolutely thrilled to welcome you to the company and look forward to an amazing journey together. Our HR onboarding team will reach out shortly with onboarding details, scheduling, and portal setups.</p>
    <p>Welcome aboard!<br>The ${companyName} Team</p>
  `;
  return {
    to: '',
    subject: `Congratulations & Welcome to ${companyName}!`,
    bodyHtml: getEmailWrapper(content, 'Welcome Onboard'),
    bodyText: `Hi ${candidateName}, Congratulations and welcome to the team as ${jobTitle} at ${companyName}!`,
    tenantId: '',
  };
}

