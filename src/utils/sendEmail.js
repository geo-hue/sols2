import { SendMailClient } from "zeptomail";
import { ZEPTOMAIL_TOKEN } from "../config/config.js";

// Initialize ZeptoMail client
const zeptoClient = new SendMailClient({
  url: "https://api.zeptomail.com/",
  token:
    "Zoho-enczapikey wSsVR61++UT1Dvp6nWX4dOdpmwgBBFP2HRsvjVCp4nf1H6rG9cc4xRbOAgLyHPRNRWJuF2cbpL8qmUoC02UIhoguzV1VDyiF9mqRe1U4J3x17qnvhDzDXmtdkROLK4wJxgVom2VlFMol+g==",
});

// export const sendEmail = async (to, subject, templateKey, dynamicData) => {
//   if (!subject || subject.trim() === "") {
//     throw new Error("Subject cannot be empty");
//   }

  // Log the token being used (remove this in production)
  // console.log('ZeptoMail Token:', ZEPTOMAIL_TOKEN);

//   try {
//     const response = await zeptoClient.sendMail({
//       bounce_address: "bounce@ysolace.com.ng",
//       from: {
//         address: "paul@solace.com.ng",
//         name: "Solace",
//       },
//       to: [
//         {
//           email_address: {
//             address: to,
//             name: to,
//           },
//         },
//       ],
//       subject: subject,
//       template: {
//         key: templateKey,
//         merge_info: {
//           body: dynamicData,
//         },
//       },
//     });

//     console.log(`Email sent to ${to} successfully. Response:`, response);
//     return response;
//   } catch (error) {
//     console.error(`Error sending email to ${to}:`);
//     console.error("Full error object:", JSON.stringify(error, null, 2));

//     if (error.error && error.error.code === "TM_4001") {
//       throw new Error(
//         "Access Denied: Please check your ZeptoMail API token and account permissions."
//       );
//     }

//     throw error;
//   }
// };


export const sendEmail = async (to, subject, templateKey, dynamicData) => {
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

    console.log(`Email sent to ${to} successfully. Response:`, response);
    return response;
  } catch (error) {
    console.error(`Error sending email to ${to}:`);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    if (error.error && error.error.code === "TM_4001") {
      throw new Error(
        "Access Denied: Please check your ZeptoMail API token and account permissions."
      );
    }

    throw error;
  }
};