import axios, { AxiosError, type AxiosResponse } from "axios";
import { createContext, useRef, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { type Context, type Entity, type Server } from "../typescript/interfaces";
import { Toast } from "primereact/toast";

export const SourceControlContext = createContext<Context>({
	entities: [],
	setEntities: () => {},
	servers: [],
	selectedServer: null,
	setServer: () => {},
	getServers: () => {},
	getServerById: () => {},
	getEntities: () => {},
	downloadEntities: () => {},
	downloadEntityByID: () => {},
});

interface ServerReturn {
	Server: string; 
	Config: { 
		BaseURL: string;
		TokenExpiration: string;
		ProjectName: string; 
		ServerDisplayName: string;
		Logo: string;
		CoverImage: string;
	};
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function SourceControlContextProvider(props: Props): JSX.Element {
	const [servers, setServers] = useState<Server[]>([]);
	const [entities, setEntities] = useState<Entity[]>([]);
	const [selectedServer, setSelectedServer] = useState<Server | null>();
    const toast = useRef(null);

	const history = useNavigate();

	const redirectOnError = async (err: AxiosError) => {
        console.log('Error: ', err.response?.status);


        if(toast && toast.current) {
            let messageText = err.response?.data;
            if(typeof err.response?.data == "object")
                messageText = await err.response.data?.text();

            toast.current.show({severity:'error', summary: `${err.response?.status} Error`, detail: messageText, life: 6000});
        }
		// history('/');//.push('/');
	};

	const getServers = (): void => {
		axios
			.get<ServerReturn[]>('/api/Servers')
			.then(res => {
				setServers(res.data.map((row: ServerReturn) => {
					return {
						DisplayName: row.Server,
						TWXBaseURL: row.Config.BaseURL,
						ProjectName: row.Config.ProjectName,
						TokenExpiration: row.Config.TokenExpiration,
						Logo: row.Config.Logo,
						CoverImage: row.Config.CoverImage
					}
				}));
			})
			.catch(err => { console.log(err); redirectOnError(err); });
	};

	const getServerById = (ServerName: String): void => {
		axios
			.get<ServerReturn[]>(`/api/Servers/${ServerName}`)
			.then(res => {
				let mappedReturn = res.data.map((row: ServerReturn) => {
					console.log("Row: ", row);
					return {
						DisplayName: row.Server,
						TWXBaseURL: row.Config.BaseURL,
						ProjectName: row.Config.ProjectName,
						TokenExpiration: row.Config.TokenExpiration
					}
				});

				setServer(mappedReturn[0]);
			})
			.catch(err => { console.log(err); redirectOnError(err); });

	}

	const getEntities = (StartDate: string): void => {
		if(selectedServer) {
			axios
				.get<{"$limit": Number, "$count": Number, "$offset": Number, data: Entity[]}>(`/api/Servers/${selectedServer.DisplayName}/Entities`, {
					params: {
						StartDate: StartDate
					}
				})
				.then(res => { console.log("Setting: ", res.data); setEntities(res.data.data) })
				.catch(err => redirectOnError(err));
		}
	};

	const downloadEntities = (StartDate: string): void => {
		if(selectedServer) {
			axios
				.get(`/api/Servers/${selectedServer.DisplayName}/DownloadEntities`, 
					{ 
						responseType: 'blob',
						params: {
							"ProjectName": selectedServer?.ProjectName,
							"StartDate": StartDate,
							"ServerName": selectedServer?.DisplayName,
							"FileRepository": "SystemRepository"
						}
					})
				// .then(res => { console.log("Downloading: "); downloadResponse(res) } )
				.catch(err => { console.log(err); redirectOnError(err) });
		}
	}

	const downloadEntityByID = (Entity: Entity): void => {
		if(selectedServer && Entity) {
			axios
				.get(`/api/Servers/${selectedServer.DisplayName}/Entities/${Entity.parentType}/${Entity.name}`, 
                    { 
                        responseType: 'blob' 
                    }
                )
				// .then(res => { console.log("Downloading:"); downloadResponse(res) })
				.catch(err => { console.log(err); redirectOnError(err) });
		}
	}

	const setServer = (selectedServer: Server): void => {
		if (selectedServer ) {
			setSelectedServer(selectedServer);
			return;
		}
	};

	const context = {
		entities,
		setEntities,
		servers,
		selectedServer,
		setServer,
		getServerById,
		getServers,
		getEntities,
		downloadEntities,
		downloadEntityByID
	};

	return (
		<SourceControlContext.Provider value={context}>
            <Toast ref={toast} />
		{props.children}
		</SourceControlContext.Provider>
	);

}

function downloadResponse(Response: AxiosResponse): void {
	console.log(Response);
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(Response.data);
	link.download = Response.headers["content-disposition"].split("filename=")[1];
	link.click();
}