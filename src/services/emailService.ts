import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  body: string; // das ist dein "innerHTML"
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private buildHtmlTemplate(innerContent: string) {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
              background-color: #f8fafc;
              color: #111827;
              padding: 2rem;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 2rem;
            }
            h1 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
              color: #0f172a;
            }
            p {
              margin-bottom: 1rem;
              line-height: 1.5;
            }
            a {
              color: #3b82f6;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${innerContent}
          </div>
        </body>
      </html>
    `;
  }

  async sendMail(options: EmailOptions) {
    const html = this.buildHtmlTemplate(options.body);

    const mailOptions = {
      from: process.env.SMTP_FROM || '"No Reply" <noreply@example.com>',
      to: options.to,
      subject: options.subject,
      html,
      text: options.body.replace(/<[^>]*>?/gm, ""), // einfacher Text-Fallback
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailService();
