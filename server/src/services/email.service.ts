import nodemailer from "nodemailer";
import env from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  from: env.SMTP_FROM,
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"AGL" <${env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  await sendEmail(
    email,
    "Welcome to AGL",
    `
      <div>
        <h1>Welcome to AGL, ${firstName.toUpperCase()}!</h1>

        <p>
          Your Africa Global League account has been created successfully.
        </p>

        <p>
          You can now view matches and tournaments,
          follow matches and track results.
        </p>

        <p>
          Welcome to AGL.
        </p>
      </div>
    `,
  );
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetUrl: string,
) => {
  await sendEmail(
    email,
    "Reset your AGL password",
    `
      <div>
        <h1>Password Reset</h1>

        <p>Hello ${firstName.toUpperCase()},</p>

        <p>
          We received a request to reset your AGL password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <p>
          <a href="${resetUrl}">
            Reset Password
          </a>
        </p>

        <p>
          This link expires in 15 minutes.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  );
};
