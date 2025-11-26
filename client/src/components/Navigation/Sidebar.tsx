import { Button } from "primereact/button";
import { NavLink } from "react-router-dom";
import routes from './routes.json';
import type { Route } from "../../typescript/interfaces";
import { useContext, useEffect } from "react";
import { SourceControlContext } from "../../store/SourceControlContext";
import { AppContext } from "../../store/AppContext";

export default function SideBarComp() {
	const ClientRoutes = routes.routes as Route[];
    const { setTitle } = useContext(AppContext);
    const { servers, getServers } = useContext(SourceControlContext);
	const { showSidebar, setShowSidebar } = useContext(AppContext);

    useEffect(() => {
        getServers();
    }, []);

    return (
        <>
            <div className={`h-full p-4 bg-white w-64 max-w-64 min-w-64 border-r border-gray-200 z-200 fixed lg:relative ${showSidebar ? 'translate-x-0 inline' : 'translate-x-0 hidden'}`}>
                <div className="flex gap-1 flex-col justify-start items-left">
                    {ClientRoutes.map(({ name, dest, title }, idx) => (
                        <NavLink to={dest} onClick={() => setTitle(title)} className='nav-NavLink w-full' key={idx}>
                            <Button text className="text-black! w-full ring-blue-400 hover:bg-blue-300! focus:ring-0! active:ring-2!">{name}</Button>
                        </NavLink>
                    ))}
                    <h2 className="mt-4">Servers:</h2>
                    {servers.map((row, idx) => (
                        <NavLink to={`Servers/${row.DisplayName}`} onClick={() => setTitle('Servers / ' + row.DisplayName)} className='nav-NavLink w-full' key={idx}>
                            <Button text className="text-black! w-full hover:bg-blue-400! focus:ring-0! active:ring-2!">{row.DisplayName}</Button>
                        </NavLink>
                    ))}
                </div>
            </div>
        </>
    )
}