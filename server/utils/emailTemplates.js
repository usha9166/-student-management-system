export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #3b82f6;">Student Management System - 🔒 Password Reset Request</h2>
      <p style="color: #6b7280;">Secure your account in just one step</p>
    </div>

    <p style="font-size: 16px;">Hello User,</p>
    <p style="font-size: 16px;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetPasswordUrl}" 
         style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
         Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <hr />

    <p style="text-align: center; font-size: 12px; color: #9ca3af;">
      © 2026 Your Company. All rights reserved.
    </p>
  </div>
  `;
}