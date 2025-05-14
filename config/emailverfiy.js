const nodemailer = require('nodemailer')
const { smtphost, smtpport, smtppass, smtpmail } = require('../utils/')
const transpoter = nodemailer.createTransport({
    host:smtphost,
    port:smtpport,
    secure:true,
    requireTLS:true,
    auth:{
        user:smtpmail,
        pass:smtppass,
    }
})
const emailMail = async (email,subject,content)=>{
    try {
        var mailOption={
            from:smtpmail,
            to:email,
            subject:subject,
            html:content
        }
        transpoter.sendMail(mailOption,(err,info)=>{
            if(err){
                return console.log(err)
            }
            // console.log('Send Verification account',info.messageId)
        })
    } catch (error) {
        console.log(error)
    }
}
module.exports={
    emailMail
}