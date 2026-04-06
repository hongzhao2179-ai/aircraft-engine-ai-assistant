import api from '.';

export const getGraphData = async (entity: string) => {
  return api.get('/graph/query', {
    params: { entity },
  });
};
