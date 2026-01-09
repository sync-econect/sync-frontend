import { api } from '@/lib/axios';
import type {
  EndpointConfig,
  ModuleType,
  FieldSchema,
  Environment,
} from '@/types';

// Tipos para o backend (IDs numéricos)
export interface EndpointConfigResponse {
  id: number;
  module: ModuleType;
  endpoint: string;
  method: string;
  description?: string;
  ambiente: Environment;
  active: boolean;
  fieldSchema?: FieldSchema;
  createdAt: string;
}

export interface CreateEndpointConfigPayload {
  module: ModuleType;
  endpoint: string;
  method?: string;
  description?: string;
  ambiente?: Environment;
  active?: boolean;
  fieldSchema?: FieldSchema;
}

export interface UpdateEndpointConfigPayload
  extends Partial<CreateEndpointConfigPayload> {}

// Mapeia resposta do backend para o tipo do frontend
const mapEndpointConfigResponse = (
  config: EndpointConfigResponse
): EndpointConfig => ({
  ...config,
  id: String(config.id),
});

export const endpointConfigsService = {
  async getAll(): Promise<EndpointConfig[]> {
    const { data } = await api.get<EndpointConfigResponse[]>(
      '/endpoint-configs'
    );
    return data.map(mapEndpointConfigResponse);
  },

  async getById(id: number): Promise<EndpointConfig> {
    const { data } = await api.get<EndpointConfigResponse>(
      `/endpoint-configs/${id}`
    );
    return mapEndpointConfigResponse(data);
  },

  async create(payload: CreateEndpointConfigPayload): Promise<EndpointConfig> {
    const { data } = await api.post<EndpointConfigResponse>(
      '/endpoint-configs',
      payload
    );
    return mapEndpointConfigResponse(data);
  },

  async update(
    id: number,
    payload: UpdateEndpointConfigPayload
  ): Promise<EndpointConfig> {
    const { data } = await api.patch<EndpointConfigResponse>(
      `/endpoint-configs/${id}`,
      payload
    );
    return mapEndpointConfigResponse(data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/endpoint-configs/${id}`);
  },
};
