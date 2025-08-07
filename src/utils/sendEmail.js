import sgMail from '@sendgrid/mail';


export const sendEmail = async (to, subject, text) => {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to, // recipient email
        from: process.env.SENDGRID_SENDER_EMAIL, // verified sender email', 
        subject, subject,
        text, // plain text body
        html: `<strong>${text}</strong>`, // HTML body
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
};