import { SendMailClient } from "zeptomail";
import { ZEPTOMAIL_TOKEN } from "../config/config.js";

// Initialize ZeptoMail client
const zeptoClient = new SendMailClient({
  url: "https://api.zeptomail.com/",
  token: ZEPTOMAIL_TOKEN || "default_token",
});

export const sendEmail = async (
  to: string,
  subject: string,
  templateKey: string,
  dynamicData: Record<string, any>
): Promise<any> => {
  if (!subject || subject.trim() === "") {
    throw new Error("Subject cannot be empty");
  }

  try {
    const response = await zeptoClient.sendMail({
      bounce_address: "bounce@ysolace.com.ng",
      from: {
        address: "paul@solace.com.ng",
        name: "Solace",
      },
      to: [
        {
          email_address: {
            address: to,
            name: to,
          },
        },
      ],
      subject: subject,
      template_key: templateKey,
      merge_info: dynamicData,
    });

    console.log(`Email sent to ${to} successfully.`);
    return response;
  } catch (error: any) {
    console.error(`Error sending email to ${to}:`);

    if (error.error && error.error.code === "TM_4001") {
      throw new Error(
        "Access Denied: Please check your ZeptoMail API token and account permissions."
      );
    }

    throw error;
  }
};