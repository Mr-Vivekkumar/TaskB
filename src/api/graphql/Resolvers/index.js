//This is Graphql Resolver File Where We Import All Function fro Other Respected Resolver File
const UserResolver = require('./userResolver')
module.exports = {
    Query:{
        loginUser:(_,args) => UserResolver.loginUser(args),
        fetchUsers:(_,args,req) => UserResolver.fetchUsers(args,req)
    },
    Mutation:{
        registerUser:(_,args) => UserResolver.registerUser(args),
        verifyUser:(_,args) => UserResolver.verifyUser(args),
        forgetPassword:(_,args) => UserResolver.forgetPassword(args),
        resetPassword:(_,args) => UserResolver.resetPassword(args)
    }
}