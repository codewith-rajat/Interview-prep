import sendEmail from "../utils/sendEmail.js";

const BASE_URL = process.env.CLIENT_URL;

/*
=====================================
INTERVIEW ACCEPTED
=====================================
*/
export const sendAcceptedEmail = async (interview, interviewee) => {

  const joinLink = `${BASE_URL}/start-interview/${interview._id}`;

  await sendEmail(
    interviewee.email,
    "Your Interview Has Been Accepted",
    `
Your interview has been accepted!

Scheduled At: ${interview.scheduledAt}

Click below to join:
${joinLink}
    `
  );
};

/*
=====================================
INTERVIEW REJECTED
=====================================
*/
export const sendRejectedEmail = async (interview, interviewee) => {

  await sendEmail(
    interviewee.email,
    "Your Interview Was Rejected",
    `
Unfortunately, your interview request has been rejected.

Scheduled At: ${interview.scheduledAt}
    `
  );
};

/*
=====================================
INTERVIEW CANCELLED
=====================================
*/
export const sendCancelledEmail = async (interview, user) => {

  await sendEmail(
    user.email,
    "Interview Cancelled",
    `
Your interview scheduled at ${interview.scheduledAt} has been cancelled.
    `
  );
};

/*
=====================================
INTERVIEW EXPIRED
=====================================
*/
export const sendExpiredEmail = async (interview, user) => {

  await sendEmail(
    user.email,
    "Interview Expired",
    `
Your interview request has expired due to no action.
    `
  );
};

/*
=====================================
EXPIRY REMINDER
=====================================
*/
export const sendExpiryReminder = async (interview, user) => {

  await sendEmail(
    user.email,
    "Interview Expiry Reminder",
    `
Your pending interview will expire in 24 hours.
Please take action.
    `
  );
};

/*
=====================================
1 HOUR BEFORE REMINDER
=====================================
*/
export const sendInterviewReminder = async (interview, user) => {

  const joinLink = `${BASE_URL}/start-interview/${interview._id}`;

  await sendEmail(
    user.email,
    "Interview Starting Soon",
    `
Your interview starts in 1 hour.

Join here:
${joinLink}
    `
  );
};

export default {
  sendAcceptedEmail,
  sendRejectedEmail,
  sendCancelledEmail,
  sendExpiredEmail,
  sendExpiryReminder,
  sendInterviewReminder
};