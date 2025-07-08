import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { env } from "../config/env";
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
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
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
      from: env.SMTP_FROM || '"Todo-Webapp" <todo@example.com>',
      to: options.to,
      subject: options.subject,
      html,
      text: options.body.replace(/<[^>]*>?/gm, ""),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error: any) {
      // Fehlerbehandlung: interner Empfänger @knoep.de unbekannt, Fehler ignorieren
      if (
        error.code === "EENVELOPE" &&
        error.responseCode === 550 &&
        typeof error.response === "string" &&
        error.response.includes("Recipient address rejected: User unknown")
      ) {
        console.warn("Empfängeradresse unbekannt, Fehler wird ignoriert, Mail gilt als gesendet.");
        return { messageId: "ignored-error-unknown-recipient" };
      }
      console.error("Error sending email:", error);
      throw error;
    }
  }

}

export default new EmailService();
