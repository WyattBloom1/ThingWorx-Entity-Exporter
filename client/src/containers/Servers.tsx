import { useContext, useEffect, useState } from "react"
import { SourceControlContext } from "../store/SourceControlContext";
import Server from "../components/Server";
import CreateServerPopupComponent from "../components/CreateServerPopup";
import { Button } from "primereact/button";
import { AppContext } from "../store";

export default function Servers() {
    const {servers, getServers, selectedServer} = useContext(SourceControlContext);
    const [showModal, setModal ] = useState(false);
    const { setTitle } = useContext(AppContext);

    function _getServers() {
        getServers();
        setModal(false);
        getServersDiv();
    }

    useEffect(() => {
        console.log("HERE");
        setTitle('Servers');
    }, []);

    function getServersDiv() {
        return (
            servers.map(row => (
                <Server key={row.DisplayName} {...row} />
            ))
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
        <span className="flex">
            <div className="flex w-full pt-4 px-10 pb-12 mt-4">
                <div className="flex gap-2 text-2xl text-gray-600 font-semibold my-0 mr-auto max-w-5xl items-center">
                    <i className="pi pi-server" style={{ fontSize: '1.7rem' }}></i>
                    <h2 className="text-3xl">Servers</h2>
                </div>
                <Button label="Add New" icon="pi pi-plus" size="small" color="primary" 
                    onClick={() => setModal(true)}/>
            </div>

        </span>
            <div className="flex flex-wrap justify-center w-full gap-4 px-2">
                {getServersDiv()}
            </div>

			<CreateServerPopupComponent showModal={showModal} setModal={(Value: boolean) => setModal(Value)} refresh={_getServers}></CreateServerPopupComponent>
        </div>
    )
}