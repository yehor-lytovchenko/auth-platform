import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// for expandability
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;

  const templatePath = path.join(
    process.cwd(),
    "src/templates/verifyEmail.hbs",
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateSource);

  const html = template({
    email,
    link: verificationUrl,
  });

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html,
  });
};
