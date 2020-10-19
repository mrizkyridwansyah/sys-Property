if(process.env.NODE_ENV !== 'production') require('dotenv').config()
const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLID, GraphQLBoolean, GraphQLSkipDirective } = require("graphql");
const Agent = require('../../models/agent')
const Customer = require('../../models/customer')
const Unit = require("../../models/unit")
const Contract = require("../../models/contract")
const User = require("../../models/user")
const Role = require("../../models/role")
const Page = require("../../models/page")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { agentObjType, customerObjType, unitObjType, contractObjType, userObjType, roleObjType, tokenObjType } = require("../query/child");
const { getDataById ,saveData, deleteData, getAllData, generateAccessToken } = require('../../routes')

const rootMutationObjType = new GraphQLObjectType({
    name: 'RootMutation',
    description: 'Root Mutation',
    fields: () => ({
        addAgent: {
            type: agentObjType,
            description: 'Add new Agent',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                sales_code: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const newAgent = new Agent ({
                    name: args.name,
                    sales_code: args.sales_code,
                    create_at: args.create_at
                })
                return await saveData(newAgent)
            }         
        },
        addCustomer: {
            type: customerObjType,
            description: 'Add new Customer',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                customer_code: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const newCustomer = new Customer({
                    name: args.name,
                    customer_code: args.customer_code
                })
                return await saveData(newCustomer)
            }
        },
        addUnit: {
            type: unitObjType,
            description: 'Add new Unit',
            args: {
                unit_number: { type: GraphQLNonNull(GraphQLString)},
                surface_area: { type: GraphQLNonNull(GraphQLInt)},
                building_area: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const newUnit = new Unit({
                    unit_number: args.unit_number,
                    surface_area: args.surface_area,
                    building_area: args.building_area
                })
                return await saveData(newUnit)
            }
        },
        addContract: {
            type: contractObjType,
            description: 'Add new Contract',
            args: {
                contract_number: { type: GraphQLNonNull(GraphQLString)},
                agent_id: { type: GraphQLNonNull(GraphQLID)},
                customer_id: { type: GraphQLNonNull(GraphQLID)},
                unit_id: { type: GraphQLNonNull(GraphQLID)},
                contract_date: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                /* check unit available or not */                
                const unit = await getDataById(Unit ,args.unit_id)
                if(unit.available){
                    try{
                        const newContract = new Contract({
                        contract_number: args.contract_number,
                        agent_id: args.agent_id,
                        customer_id: args.customer_id,
                        unit_id: args.unit_id,
                        contract_date: new Date(args.contract_date).toISOString()
                        })
                        unit.available = false
                        await saveData(unit)
                        return await saveData(newContract)
                    } catch(err) {
                        return new Error(err.message)
                    }
                }   
                return new Error("Unit Not Available")             
            }
        },
        addRole: {
            type: roleObjType,
            description: 'Add new Role',
            args: {
                name: { type: GraphQLString } 
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const newRole = new Role({ name: args.name })
                return await saveData(newRole)
            }
        },
        addUser: {
            type: userObjType,
            description: 'Add new User',
            args: {
                email: { type: GraphQLNonNull(GraphQLString)},
                password: { type: GraphQLNonNull(GraphQLString)},
                role_id: { type: GraphQLNonNull(GraphQLID)},
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const salt = await bcrypt.genSalt(10)
                const passwordHash = await bcrypt.hash(args.password, salt)
                const newUser = new User({
                    email: args.email,
                    password: passwordHash,
                    role_id: args.role_id
                })
                
                return await saveData(newUser)                
            }
        },
        updateAgent: {
            type: agentObjType,
            description: 'Update Agent',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                name: { type: GraphQLString },
                sales_code: { type: GraphQLString }
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const agent = await getDataById(Agent ,args.id)                
                if(!agent) return new Error("No Data Agent. Data maybe has been deleted")
                if(args.name !== null && args.name !== undefined) agent.name = args.name
                if(args.sales_code !== null && args.sales_code !== undefined) agent.sales_code = args.sales_code
                return await saveData(agent)
            }
        },
        updateCustomer: {
            type: customerObjType,
            description: 'Update Customer',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                name: { type: GraphQLString },
                customer_code: { type: GraphQLString },
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const customer = await getDataById(Customer,args.id)
                if(!customer) return new Error("No Data Customer. Data maybe has been deleted")                    
                if(args.name !== null && args.name !== undefined) customer.name = args.name
                if(args.customer_code !== null && args.customer_code !== undefined) customer.customer_code= args.customer_code
                return await saveData(customer)
            }
        },
        updateUnit: {
            type: unitObjType,
            description: 'Update Unit',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                unit_number: { type: GraphQLString },
                surface_area: { type: GraphQLInt },
                building_area: { type: GraphQLInt },
                available: { type: GraphQLBoolean }
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const unit = await getDataById(Unit, args.id)
                if(!unit) return new Error("No Data Unit. Data maybe has been deleted")
                if(args.unit_number !== null && args.unit_number !== undefined) unit.unit_number = args.unit_number
                if(args.surface_area !== null && args.surface_area !== undefined) unit.surface_area = args.surface_area
                if(args.building_area !== null && args.building_area !== undefined) unit.building_area = args.building_area
                if(args.available !== null && args.available !== undefined) unit.available = args.available
                return await saveData(unit)
            }
        },
        updateContract: {
            type: contractObjType,
            description: 'Update Contract',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                agent_id: { type: GraphQLID},
                customer_id: { type: GraphQLID},
                unit_id: { type: GraphQLID},
                contract_date : { type: GraphQLString}
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const contract = await getDataById(Contract, args.id)
                if(!contract) return new Error("No Data Contract. Data maybe has been deleted")
                const newUnit = await getDataById(Unit, args.unit_id)
                if(!newUnit) return new Error("No Data Next Unit. Data maybe has been deleted")
                if(args.agent_id !== null && args.agent_id !== undefined) contract.agent_id = args.agent_id
                if(args.contract_date !== null && args.contract_date !== undefined) contract.contract_date = new Date(args.contract_date).toISOString()
                if(args.customer_id !== null && args.customer_id !== undefined) contract.customer_id = args.customer_id
                if( args.unit_id !== null && 
                    args.unit_id !== undefined && 
                    args.unit_id !== contract.unit_id && 
                    newUnit.available)
                    {                    
                    const oldUnit = await getDataById(Unit, contract.unit_id)
                    if(!oldUnit) return new Error("No Data Previous Unit. Data maybe has been deleted")
                    oldUnit.available = true
                    newUnit.available = false
                    contract.unit_id = args.unit_id
                    await saveData(oldUnit)
                    await saveData(newUnit)
                } else {
                    return new Error("Unit Not Available")
                }

                return await saveData(contract)
            }
        },
        updateRole: {
            type: roleObjType,
            description: 'Update Role',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                name: { type: GraphQLNonNull(GraphQLString) } 
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const role = await getDataById(Role, args.id)
                if(!role) return new Error("No Data Role. Data maybe has been deleted")
                role.name = args.name
                role.update_at = Date.now()
                return await saveData(role)
            }
        },
        updateUser: {
            type: userObjType,
            description: 'Update User',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                email: { type: GraphQLString},
                password: { type: GraphQLString},
                role_id: { type: GraphQLID},
                active: { type: GraphQLBoolean}
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const user = await getDataById(User, args.id)
                if(!user) return new Error("No Data User. Data maybe has been deleted")
                if(args.email !== null && args.email !== undefined) user.email= args.email
                if(args.password !== null && args.password !== undefined) {
                    const salt = await bcrypt.genSalt(10)
                    const passwordHash = await bcrypt.hash(args.password, salt)
                    user.password= passwordHash
                } 
                if(args.role_id !== null && args.role_id !== undefined) user.role_id= args.role_id
                if(args.active !== null && args.active !== undefined) user.is_active= args.active
                user.update_at = Date.now()
                return await saveData(user)                
            }
        },
        deleteAgent: {
            type: agentObjType,
            description: "Delete Agent",
            args: {
                id: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve: async(parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                const agent = await getDataById(Agent, args.id)
                if(!agent) return new Error("No Data Agent. Data maybe has been deleted")
                return await deleteData(agent)
            }
        },
        deleteCustomer: {
            type: customerObjType,
            description: "Delete Customer",
            args: {
                id: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve: async(parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                const customer = await getDataById(Customer, args.id)
                if(!customer) return new Error("No Data Customer. Data maybe has been deleted")
                return await deleteData(customer)
            }
        },
        deleteUnit: {
            type: unitObjType,
            description: "Delete Unit",
            args: {
                id: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const unit = await getDataById(Unit, args.id)
                if(!unit) return new Error("No Data Unit. Data maybe has been deleted")
                if(!unit.available) return new Error("Unit Has Contract")
                return await deleteData(unit)
            }
        },
        deleteContract: {
            type: contractObjType,
            description: "Delete Contract",
            args: {
                id: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                const contract = await getDataById(Contract, args.id)
                if(!contract) return new Error("No Data Contract. Data maybe has been deleted")
                const unit = await getDataById(Unit, contract.unit_id)
                unit.available = true
                await saveData(unit)
                return await deleteData(contract)                
            }
        },
        deleteRole: {
            type: roleObjType,
            description: "Delete Role",
            args: {
                id: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                const role = await getDataById(Role, args.id)
                if(!role) return new Error("No Data Role. Data maybe has been deleted")
                return await deleteData(role)                
            }
        },
        deleteUser: {
            type: userObjType,
            description: "Delete User",
            args: {
                id: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                const user = await getDataById(User, args.id)
                if(!user) return new Error("No Data User. Data maybe has been deleted")
                return await deleteData(user)                
            }
        },
        login: {
            type: tokenObjType,
            description: 'Login',
            args: {
                email: { type: GraphQLNonNull(GraphQLString)},
                password: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args) => {                                
                const users = await getAllData(User, { email: args.email})
                if(users.length === 0) return new Error("Log In Failed! Email not registered")                
                const user = users[0]
                if(!user.is_active) return new Error("Log In Failed! User has been blocked")
                if(user.access_token && user.refresh_token) return new Error("Log In Failed! User has been logged in")
                let messageError = ""     
                if(await bcrypt.compare(args.password, user.password)) {
                    const dataUser = {
                        email: user.email,
                        role_id: user.role_id
                    }
                    user.access_token = await generateAccessToken(dataUser)
                    user.refresh_token = await jwt.sign(dataUser, process.env.REFRESH_TOKEN_SECRET)
                    user.wrong_password = 0
                } else {
                    user.wrong_password = user.wrong_password + 1
                    messageError = `Password wrong ${user.wrong_password} times.`
                    if(user.wrong_password == 3) { 
                        user.is_active = false
                        messageError = `Password wrong 3 times. User has been Blocked`
                    }                                    
                }

                await saveData(user)
                
                if(user.access_token !== null && user.access_token !== undefined){
                    return { access_token: user.access_token, refresh_token: user.refresh_token }
                } else {
                    console.log(user)
                    return new Error(`Log In Failed! ${messageError}`)
                }
            }
        },
        logout: {
            type: tokenObjType,
            description: 'Log Out',
            args: {
                token: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args) => {
                let isLogOut = false
                let messageError = ""
                await jwt.verify(args.token, process.env.REFRESH_TOKEN_SECRET, async (err, data) => {
                    if(err) return messageError = "FORBIDDEN!"
                    const users = await getAllData(User, { email: data.email})
                    if(users.length === 0) return messageError = "Log Out Failed! User not found"
                    const user = users[0]
                    if(user.refresh_token !== args.token) return messageError = "FORBIDDEN!"
                    user.access_token = null
                    user.refresh_token = null
                    await saveData(user)
                    isLogOut = true
                })
                
                return isLogOut ? { access_token: "", refresh_token: "" } : new Error(messageError)
            }
        },
        setNewToken: {
            type: tokenObjType,
            description: 'Set new Access Token after expired',
            args: {
                token: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args) => {
                let access_token = ""
                let messageError = ""
                await jwt.verify(args.token, process.env.REFRESH_TOKEN_SECRET, async (err, data) => {
                    if(err) return messageError = "FORBIDDEN!"
                    const users = await getAllData(User, {email: data.email})
                    if(users.length === 0) return messageError = "Set New Token Failed. User not found"
                    const user = users[0]
                    if(user.refresh_token !== args.token) return messageError = "FORBIDDEN!"
                    const dataUser = {
                        email: user.email,
                        role_id: user.role_id
                    }
                    user.access_token = await generateAccessToken(dataUser)
                    access_token = user.access_token
                    await saveData(user)
                })

                if(access_token !== "") {
                    return { access_token: access_token, refresh_token: args.token }
                } else {
                    return new Error(messageError)
                }
            }
        }
    })
})

module.exports = rootMutationObjType