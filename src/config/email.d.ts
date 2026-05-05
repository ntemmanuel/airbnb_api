import nodemailer from 'nodemailer';
declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
export declare function sendEmail({ to, subject, html, }: {
    to: string;
    subject: string;
    html: string;
}): Promise<void>;
export default transporter;
//# sourceMappingURL=email.d.ts.map