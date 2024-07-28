const db = require('../../../../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../../../../utlility/mail');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM USERS_TABLE WHERE email = $1';
  const values = [email];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function deleteUserByEmail(email) {
  const query = 'DELETE FROM USERS_TABLE WHERE email = $1';
  const values = [email];
  await db.query(query, values);
}

async function insertUser(username, password, email, verification_code) {
  const query = `INSERT INTO USERS_TABLE(username, password, email, createdat, updatedat, verification_code) 
                 VALUES ($1, $2, $3, $4, $5, $6)`;
  const values = [username, password, email, new Date(), new Date(), verification_code];
  await db.query(query, values);
}

module.exports = {
  loginUser: async (args) => {
    try {
      const fetchuser = await findUserByEmail(args.email);
      if (!fetchuser) {
        return { success: false, message: "User Not Found!" };
      }
      if (!fetchuser.is_verified) {
        return { success: false, message: "User is not Verified!" };
      }
      const verifypassword = await bcrypt.compare(args.password, fetchuser.password);
      if (!verifypassword) {
        return { success: false, message: "Invalid Password!" };
      }
      const token = jwt.sign({ userobj: fetchuser }, process.env.SECRET_KEY, { expiresIn: '24h' });
      return { success: true, message: "User Login Successfully!", token };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Something Went Wrong!" };
    }
  },

  registerUser: async (args) => {
    try {
      // Check if user already exists
      let fetchuser = await findUserByEmail(args.email);
      if (fetchuser) {
        return { success: false, message: "Email Already Exists!" };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(args.password, 12);

      // Insert new user into the database
      const query = `INSERT INTO USERS_TABLE(username, password, email, createdat, updatedat, is_verified) 
                     VALUES ($1, $2, $3, $4, $5, $6)`;
      const values = [args.username, hashedPassword, args.email, new Date(), new Date(), true];
      await db.query(query, values);

      return { success: true, message: "User Registered Successfully!" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Something Went Wrong!" };
    }
  },

  // registerUser: async (args) => {
  //   try {
  //     let fetchuser = await findUserByEmail(args.email);
  //     if (fetchuser) {
  //       if (!fetchuser.is_verified) {
  //         await deleteUserByEmail(args.email);
  //       } else {
  //         return { success: false, message: "Email Already Exists!" };
  //       }
  //     }
  //     const hashedPassword = await bcrypt.hash(args.password, 12);
  //     const verification_code = crypto.randomBytes(12).toString('hex').slice(0, 12);
  //     await insertUser(args.username, hashedPassword, args.email, verification_code);

  //     setTimeout(() => deleteUserByEmail(args.email), 300000);

  //     const html = `
  //       <html>
  //       <body>
  //         <div>
  //           <h1>Welcome to Rudra</h1>
  //           <p>Thank you for joining us. Click the button below to get verified:</p>
  //           <a href="${process.env.BASE_URL}/${verification_code}" class="button">Verify Email</a>
  //           <div>© 2024 Rudra. All rights reserved.</div>
  //         </div>
  //       </body>
  //       </html>`;
  //     sendMail(args.email, `Welcome to Rudra - ${args.username}`, html);

  //     return { success: true, message: "Please Check Your Email & Verify!" };
  //   } catch (error) {
  //     console.error(error);
  //     return { success: false, message: "Something Went Wrong!" };
  //   }
  // },

  verifyUser: async (args) => {
    try {
      const query = 'SELECT id, email, is_verified FROM USERS_TABLE WHERE verification_code = $1';
      const values = [args.verifytoken];
      const fetchuser = await db.query(query, values);

      if (!fetchuser.rows.length) {
        return "Token Expired!";
      }
      await db.query('UPDATE USERS_TABLE SET is_verified = true, verification_code = NULL WHERE verification_code = $1', values);
      return "Verification Successful!";
    } catch (error) {
      console.error(error);
      return "Something Went Wrong!";
    }
  },

  fetchUsers: async (args, req) => {
    try {
      if (!req.isAuth) {
        return { message: "UnAuthorized!" };
      }
      const fetchuser = await db.query('SELECT * FROM USERS_TABLE');
      return { message: "Success", UserResponse: fetchuser.rows };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Something Went Wrong!" };
    }
  },

  forgetPassword: async (args) => {
    try {
      const fetchuser = await findUserByEmail(args.email);
      if (!fetchuser) {
        return "User Not Found!";
      }
      if (!fetchuser.is_verified) {
        return "User is not Verified!";
      }
      const generateotp = generateOTP();
      const query = 'UPDATE USERS_TABLE SET otp = $1 WHERE email = $2';
      const values = [generateotp, args.email];
      await db.query(query, values);

      setTimeout(async () => {
        await db.query('UPDATE USERS_TABLE SET otp = NULL WHERE email = $1', [args.email]);
      }, 300000);

      sendMail(args.email, `OTP For Password Reset - ${fetchuser.username}`, `<div>Your OTP for Password Reset is ${generateotp}</div>`);
      return "OTP Generated Successfully!";
    } catch (error) {
      console.error(error);
      return "Something Went Wrong!";
    }
  },

  resetPassword: async (args) => {
    try {
      const query = 'SELECT * FROM USERS_TABLE WHERE email = $1 AND otp = $2';
      const values = [args.email, args.otp];
      const fetchuser = await db.query(query, values);

      if (!fetchuser.rows.length) {
        return "Invalid OTP!";
      }
      if (!fetchuser.is_verified) {
        return "User is not Verified!";
      }
      const hashedPassword = await bcrypt.hash(args.password, 12);
      await db.query('UPDATE USERS_TABLE SET password = $1, otp = NULL WHERE email = $2', [hashedPassword, args.email]);
      return "Password Reset Successfully!";
    } catch (error) {
      console.error(error);
      return "Something Went Wrong!";
    }
  }
};
