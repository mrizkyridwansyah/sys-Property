const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLBoolean } = require("graphql");
const { agentObjType, customerObjType, unitObjType, contractObjType, userObjType, roleObjType, pageObjType } = require('./child')
const Agent = require('../../models/agent')
const Customer = require('../../models/customer')
const Unit = require('../../models/unit')
const Contract = require('../../models/contract')
const User = require('../../models/user')
const Role = require('../../models/role')
const Page = require('../../models/page')
const { getAllData } = require('../../routes')

const rootQueryObjType = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root Query',
    fields: () => ({
        agents: {
            type: GraphQLList(agentObjType),
            description: 'Get Agents',
            args: {
                search: { type: GraphQLString },
            },
            resolve: async (parent, args, req) => {                
                if(!req.auth) return new Error("Unauthorized")
                let search = {
                    $or: [
                        { name: new RegExp(args.search,'i') },
                        { sales_code: new RegExp(args.search,'i')}
                    ]
                }      
                return await getAllData(Agent,search) 
            }
        },
        customers: {
            type: GraphQLList(customerObjType),
            description: 'Get Customers',
            args: {
                search: { type: GraphQLString}
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                let search = {
                    $or: [
                        { name: new RegExp(args.search, 'i') },
                        { customer_code: new RegExp(args.search, 'i') }
                    ]
                }
                return await getAllData(Customer,search)
            }
        },
        units: {
            type: GraphQLList(unitObjType),
            description: 'Get Units',
            args: {
                search: { type: GraphQLString},
                available: { type: GraphQLBoolean}
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                let search = { $and: [ { unit_number: new RegExp(args.search, 'i') } ] }
                if(args.available !== undefined && args.available !== null) search.$and.push({ available: args.available })
                return await getAllData(Unit,search)
            }
        },
        contracts: {
            type: GraphQLList(contractObjType),
            description: 'List of Contracts',
            args: {
                search: { type: GraphQLString}, 
                active: { type: GraphQLBoolean},
                dateFrom: { type: GraphQLString},
                dateTo: { type: GraphQLString}        
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                let search = { $or: [ ]}
                search.$or.push({ contract_number: new RegExp(args.search, 'i')})
                
                if(args.active !== null && args.active !== undefined) {
                    search.$or.push({ is_active: args.active})
                }
                if(args.dateFrom !== null && args.dateTo !== null && args.dateFrom !== "" && args.dateFrom !== "" && args.dateFrom !== undefined && args.dateTo !== undefined) 
                {
                    search.$or.push({ 
                        contract_date: {
                            $gte: new Date(args.dateFrom).toISOString(),
                            $lt: new Date(args.dateTo).toISOString()
                        }
                    })
                }
                return await getAllData(Contract,search)
            }
        },
        users: {
            type: GraphQLList(userObjType),
            description: 'Get Users',
            args: {
                email: { type: GraphQLString },
                active: { type: GraphQLBoolean}
            },
            resolve: async (parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                let search = { $or: [{ email: new RegExp(args.email, 'i') }] }
                if(args.active !== null && args.active !== undefined) search.$or.push({ is_active: args.active})
                return await getAllData(User, search)
            }
        },
        roles: {
            type: GraphQLList(roleObjType),
            description: 'Get Roles',
            args: {
                name: { type: GraphQLString }
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                return await getAllData(Role, { name: new RegExp(args.name, 'i')} )                
            }
        },
        pages: {
            type: GraphQLList(pageObjType),
            description: 'Get Pages',
            args: {
                name: { type: GraphQLString },
                type: { type: GraphQLString },
                entry_point: { type: GraphQLString }
            },
            resolve: async(parent, args, req) => {
                if(!req.auth) return new Error("Unauthorized")
                const search = { $or: 
                                    [ 
                                        { name: new RegExp(args.name, 'i') }, 
                                        { type: new RegExp(args.type, 'i') }, 
                                        { entry_point: new RegExp(args.entry_point, 'i') } 
                                    ] 
                                }
                return await getAllData(Page, search)
            }
        }
    })
})

module.exports = rootQueryObjType