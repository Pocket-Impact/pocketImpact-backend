import sgMail from '@sendgrid/mail';


export const sendEmail = async (to, subject, text) => {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to, // recipient email
        from: 'mugishawenge1@gmail.com', 
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