import axios from 'axios';

const agent = axios.create({
  baseURL: 'https://domain.com',
  headers: {
    'Content-type': 'application/json;charset=UTF-8',
    'Authorization': `Bearer ${process.env.API_TOKEN}`, 
  },
});

const endpoints = {
  index: '/patterns/indexes',
  connector: '/actions/connectors',
  space: '/spaces',
}

export default {
  action: {
    async find(params) {
      return agent({
        method: 'GET',
        url: `/s/${params.spaceId}/api${endpoints[params.feature]}/find`,
      });
    },
    async update(params) {
      return agent({
        method: 'PUT',
        url: `/s/${params.spaceId}/api${endpoints[params.feature]}/${params.id}`,
        data: params.data,
      });
    },
    async create(params) {
      return agent({
        method: 'POST',
        url: `/s/${params.spaceId}/api${endpoints[params.feature]}/${params.id}`,
        data: params.data,
      });
    },
    async delete(params) {
      return agent({
        method: 'DELETE',
        url: `/s/${params.spaceId}/api${endpoints[params.feature]}/${params.id}`,
      });
    },
  },
};
