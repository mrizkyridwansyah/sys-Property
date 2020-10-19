const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt, GraphQLInputObjectType, GraphQLList, GraphQLBoolean, GraphQLSkipDirective } = require("graphql");
const Agent = require('../../models/agent')
const Customer = require('../../models/customer')
const Unit = require('../../models/unit')
const Contract = require('../../models/contract')
const User = require('../../models/user')
const Role = require('../../models/role')
const Page = require('../../models/page')
const { getAllData, getDataById } = require('../../routes')

const userObjType = new GraphQLObjectType({
    name: 'Users',
    description: 'List of Users',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID)},
        email: { type: GraphQLNonNull(GraphQLString)},
        role_id: { type: GraphQLNonNull(GraphQLID)},
        wrong_password: { type: GraphQLNonNull(GraphQLInt)},
        is_active: { type: GraphQLNonNull(GraphQLBoolean)},
        create_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (user) => { return user.create_at.toISOString().split('T')[0] }
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (user) => { return user.update_at.toISOString().split('T')[0] }
        }
    }
})

const roleObjType = new GraphQLObjectType({
    name: 'Roles',
    description: 'List of Roles',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID)},
        name: { type: GraphQLNonNull(GraphQLString)},
        create_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (role) => { return role.create_at.toISOString().split('T')[0] }
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (role) => { return role.update_at.toISOString().split('T')[0] }
        }
    }
})

const pageObjType = new GraphQLObjectType({
    name: 'Pages',
    description: 'List of Pages',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID)},
        name: { type: GraphQLNonNull(GraphQLString)},
        type: { type: GraphQLNonNull(GraphQLString)},
        entry_point: { type: GraphQLNonNull(GraphQLString)},
        role_id: { type: GraphQLNonNull(GraphQLString)},
        roles: {
            type: GraphQLList(roleObjType),
            resolve: async (page) => {
                const search = { id: { $in: [page.role.id] } }                
                return await getAllData(Role, search)
            }
        },
        create_at: { type: GraphQLNonNull(GraphQLString)},
        update_at: { type: GraphQLNonNull(GraphQLString)},
    }
})

const agentObjType = new GraphQLObjectType({
    name: 'Agents',
    description: 'List of Agents',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID)},
        sales_code: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        create_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (agent) => { return agent.create_at.toISOString().split('T')[0]} 
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (agent) => { return agent.update_at.toISOString().split('T')[0]} 
        },
        create_by: { type: GraphQLNonNull(GraphQLID) },
        update_by: { type: GraphQLNonNull(GraphQLID) },
        user_create: {
            type: userObjType,
            resolve: async (agent) => {
                const search = { id: agent.create_by} 
                return await getAllData(User,search)  
            }
        },
        user_update: {
            type: userObjType,
            resolve: async (agent) => {
                const search = { id: agent.update_by} 
                return await getAllData(User,search)  
            }
        },
        contracts: {
            type: GraphQLList(contractObjType),
            resolve: async (agent) => {
                const search = { agent_id: agent.id} 
                return await getAllData(Contract,search)                 
            }
        }
    })
})

const customerObjType = new GraphQLObjectType({
    name: 'Customers',
    description: 'List of Customers',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString)},
        customer_code: { type: GraphQLNonNull(GraphQLString)},
        create_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (customer) => { return customer.create_at.toISOString().split('T')[0]} 
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (customer) => { return customer.update_at.toISOString().split('T')[0]} 
        },
        contracts: {
            type: GraphQLList(contractObjType),
            resolve: async (customer) => {
                const search = { customer_id: customer.id} 
                return await getAllData(Contract,search)                 
            }
        },
        create_by: { type: GraphQLNonNull(GraphQLID) },
        update_by: { type: GraphQLNonNull(GraphQLID) },
        user_create: {
            type: userObjType,
            resolve: async (customer) => {
                const search = { id: customer.create_by} 
                return await getAllData(User,search)  
            }
        },
        user_update: {
            type: userObjType,
            resolve: async (customer) => {
                const search = { id: customer.update_by} 
                return await getAllData(User,search)  
            }
        }
    })
})

const unitObjType = new GraphQLObjectType({
    name: 'Units',
    description: 'List of Units',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID)},
        unit_number: { type: GraphQLNonNull(GraphQLString)},
        available: { type: GraphQLNonNull(GraphQLBoolean)},
        surface_area: { type: GraphQLNonNull(GraphQLInt)},
        building_area: { type: GraphQLNonNull(GraphQLInt)},
        create_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (unit) => { return unit.create_at.toISOString().split('T')[0]} 
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString), 
            resolve: (unit) => { return unit.update_at.toISOString().split('T')[0]} 
        },
        contracts: {
            type: GraphQLList(contractObjType),
            resolve: async (unit) => {
                const search = { unit_id: unit.id} 
                return await getAllData(Contract,search)              
            }
        },
        create_by: { type: GraphQLNonNull(GraphQLID) },
        update_by: { type: GraphQLNonNull(GraphQLID) },
        user_create: {
            type: userObjType,
            resolve: async (unit) => {
                const search = { id: unit.create_by} 
                return await getAllData(User,search)  
            }
        },
        user_update: {
            type: userObjType,
            resolve: async (unit) => {
                const search = { id: unit.update_by} 
                return await getAllData(User,search)  
            }
        }
    })
})

const contractObjType = new GraphQLObjectType({
    name: 'Contracts',
    description: 'List of Contracts',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID)},
        contract_number: { type: GraphQLNonNull(GraphQLString)},
        is_active: { type: GraphQLNonNull(GraphQLBoolean)},
        agent_id: { type: GraphQLNonNull(GraphQLID)},
        agent: {
            type: agentObjType,
            resolve: async (contract) => {
                return await getDataById(Agent,contract.agent_id) 
            }
        },
        customer_id: { type: GraphQLNonNull(GraphQLID)},
        customer: {
            type: customerObjType,
            resolve: async (contract) => {
                return await getDataById(Customer,contract.customer_id)                 
            }
        },
        unit_id: { type: GraphQLNonNull(GraphQLID)},
        unit: {
            type: unitObjType,
            resolve: async (contract) => {
                return await getDataById(Unit,contract.unit_id) 
            }            
        },
        contract_date: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (contract) => { return contract.contract_date.toISOString().split('T')[0]}
        },
        create_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (contract) => { return contract.create_at.toISOString().split('T')[0]}
        },
        update_at: { 
            type: GraphQLNonNull(GraphQLString),
            resolve: (contract) => { return contract.update_at.toISOString().split('T')[0]}
        },
        create_by: { type: GraphQLNonNull(GraphQLID) },
        update_by: { type: GraphQLNonNull(GraphQLID) },
        user_create: {
            type: userObjType,
            resolve: async (contract) => {
                const search = { id: contract.create_by} 
                return await getAllData(User,search)  
            }
        },
        user_update: {
            type: userObjType,
            resolve: async (contract) => {
                const search = { id: contract.update_by} 
                return await getAllData(User,search)  
            }
        }
    })
})

const tokenObjType = new GraphQLObjectType({
    name: 'Token',
    fields: () => ({
        access_token: { type: GraphQLNonNull(GraphQLString)},
        refresh_token: { type: GraphQLNonNull(GraphQLString)},
    })
})
module.exports = { agentObjType, customerObjType, unitObjType, contractObjType, userObjType, roleObjType, pageObjType, tokenObjType }