import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
})

export async function sendPasswordResetEmail(to, token) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Attendance App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your password",
    html: `<p>Reset your password using the link below. It expires in 30 minutes.</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendTempPasswordEmail(to, tempPassword) {
  await transporter.sendMail({
    from: `"Attendance App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your attendance app account",
    html: `<p>An account has been created for you.</p>
           <p>Temporary password: <strong>${tempPassword}</strong></p>
           <p>Log in with it — you'll be asked to set a new password right away.</p>`,
  });
}
