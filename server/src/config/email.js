import nodemailer from 'nodemailer';
import { env } from './environment.js';

export const mailTransport = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
});
