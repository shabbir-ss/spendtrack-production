import nodemailer from "nodemailer";
import twilio from "twilio";
import { formatIndianCurrency } from "../client/src/lib/indian-financial-year";

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// SMS configuration (Twilio)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && 
                     process.env.TWILIO_AUTH_TOKEN && 
                     process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Alternative SMS service (TextLocal for India)
const TEXTLOCAL_API_KEY = process.env.TEXTLOCAL_API_KEY;
const TEXTLOCAL_SENDER = (process.env.TEXTLOCAL_SENDER || "SPNTRK").slice(0, 6).toUpperCase();

interface NotificationData {
  user: {
    name: string;
    email: string;
    mobile: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  bill: {
    name: string;
    amount: string;
    dueDate: string;
    category: string;
  };
  type: "due_tomorrow" | "overdue";
}

export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  if (!data.user.emailNotifications || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false;
  }

  try {
    const subject = data.type === "due_tomorrow" 
      ? `Bill Reminder: ${data.bill.name} due tomorrow`
      : `Overdue Bill: ${data.bill.name}`;

    const html = generateEmailTemplate(data);

    await emailTransporter.sendMail({
      from: `"SpendTrack" <${process.env.SMTP_USER}>`,
      to: data.user.email,
      subject,
      html,
    });

    console.log(`Email sent to ${data.user.email} for bill: ${data.bill.name}`);
    return true;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}

export async function sendSMSNotification(data: NotificationData): Promise<boolean> {
  if (!data.user.smsNotifications) {
    return false;
  }

  const message = generateSMSMessage(data);

  // Try Twilio first
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${data.user.mobile}`,
      });
      console.log(`SMS sent via Twilio to ${data.user.mobile} for bill: ${data.bill.name}`);
      return true;
    } catch (error) {
      console.error("Twilio SMS error:", error);
    }
  }

  // Fallback to TextLocal (popular in India)
  if (TEXTLOCAL_API_KEY) {
    try {
      const tlNumber = data.user.mobile.startsWith('91') ? data.user.mobile : `91${data.user.mobile}`;
      const response = await fetch("https://api.textlocal.in/send/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          apikey: TEXTLOCAL_API_KEY,
          numbers: tlNumber, // Must be 91-prefixed without plus sign
          message: message,
          sender: TEXTLOCAL_SENDER,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        console.log(`SMS sent via TextLocal to ${data.user.mobile} for bill: ${data.bill.name}`);
        return true;
      } else {
        console.error("TextLocal SMS error:", result);
      }
    } catch (error) {
      console.error("TextLocal SMS error:", error);
    }
  }

  console.log("SMS notification skipped - no service configured");
  return false;
}

function generateEmailTemplate(data: NotificationData): string {
  const { user, bill, type } = data;
  const amount = formatIndianCurrency(parseFloat(bill.amount));
  const dueDate = new Date(bill.dueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isOverdue = type === "overdue";
  const statusColor = isOverdue ? "#ef4444" : "#f59e0b";
  const statusText = isOverdue ? "OVERDUE" : "DUE TOMORROW";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SpendTrack Bill Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SpendTrack</h1>
        <p style="color: #e2e8f0; margin: 5px 0 0 0;">Your Financial Assistant</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a202c; margin-top: 0;">Hello ${user.name}!</h2>
        
        <div style="background: ${isOverdue ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${statusText}</span>
          </div>
          <h3 style="margin: 10px 0; color: #1a202c;">${bill.name}</h3>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: ${statusColor};">${amount}</p>
          <p style="margin: 5px 0; color: #64748b;">Due Date: ${dueDate}</p>
          <p style="margin: 5px 0; color: #64748b;">Category: ${bill.category}</p>
        </div>
        
        ${isOverdue 
          ? `<p style="color: #dc2626; font-weight: bold;">⚠️ This bill is overdue. Please make the payment as soon as possible to avoid late fees.</p>`
          : `<p style="color: #d97706; font-weight: bold;">⏰ This bill is due tomorrow. Don't forget to make the payment!</p>`
        }
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1a202c;">Quick Actions:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Log into your SpendTrack account to mark this bill as paid</li>
            <li>Set up automatic reminders for future bills</li>
            <li>Review your financial dashboard for better planning</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open SpendTrack
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          You're receiving this because you have bill notifications enabled.<br>
          To change your notification preferences, visit your account settings.
        </p>
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} SpendTrack. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateSMSMessage(data: NotificationData): string {
  const { user, bill, type } = data;
  const amount = formatIndianCurrency(parseFloat(bill.amount));
  const dueDate = new Date(bill.dueDate).toLocaleDateString("en-IN");

  if (type === "overdue") {
    return `SpendTrack Alert: Your ${bill.name} bill of ${amount} was due on ${dueDate} and is now OVERDUE. Please make payment ASAP. - SpendTrack`;
  } else {
    return `SpendTrack Reminder: Your ${bill.name} bill of ${amount} is due tomorrow (${dueDate}). Don't forget to pay! - SpendTrack`;
  }
}

export async function sendBillNotification(data: NotificationData): Promise<{
  emailSent: boolean;
  smsSent: boolean;
}> {
  const [emailSent, smsSent] = await Promise.all([
    sendEmailNotification(data),
    sendSMSNotification(data),
  ]);

  return { emailSent, smsSent };
}

// Test notification function
export async function testNotifications(userEmail: string): Promise<boolean> {
  try {
    const testData: NotificationData = {
      user: {
        name: "Test User",
        email: userEmail,
        mobile: "9999999999",
        emailNotifications: true,
        smsNotifications: false, // Only test email
      },
      bill: {
        name: "Test Bill",
        amount: "1000.00",
        dueDate: new Date().toISOString().split('T')[0],
        category: "utilities",
      },
      type: "due_tomorrow",
    };

    const result = await sendEmailNotification(testData);
    return result;
  } catch (error) {
    console.error("Test notification error:", error);
    return false;
  }
}