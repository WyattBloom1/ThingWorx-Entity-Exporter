import { type Entity, type Server } from '.';

export interface Context {
  entities: Entity[];
  setEntities: () => void;
  servers: Server[];
  selectedServer: Server | null;
  setServer: (Server: Server) => void;
  getServers: () => void;
  getServerById: (ServerName: string) => Server | void;
  getEntities: (StartDate: string) => void;
  downloadEntities: (StartDate: String) => void;
  downloadEntityByID: (Entity: Entity) => void;
}