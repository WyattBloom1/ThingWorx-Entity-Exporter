import { Button } from "primereact/button";
import { useContext, useEffect, useState } from "react";
import { SourceControlContext } from "../store/SourceControlContext";
import type { Server } from "../typescript/interfaces";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import EditServer from "./EditServer";
import { Dialog } from "primereact/dialog";

export default function Server(prop: Server) {
    const { setServer } = useContext(SourceControlContext);
    const { setTitle } = useContext(AppContext);
    const [ editServer, setEditServer ] = useState<Server>({
        DisplayName: '',
        ProjectName: '',
        CoverImage: '',
        Logo: '',
        AppKey: '',
        BaseURL: ''
    });
    const [ showEdit, setShowEdit ] = useState(false);
    
    const navigate = useNavigate();

    const toggleEdit = () => {
        setEditServer({...prop, AppKey: ''});
        setShowEdit(true);
    }

    function handleSelection(e: Server) {
        setServer(e);
        setTitle(`Servers / ${prop.DisplayName}`);
        navigate(`/Servers/${prop.DisplayName}`);
    }

    function coverImage() {
        return (
            <div className="h-42 overflow-hidden rounded-t-lg items-center flex">
                <img className="rounded-t-lg w-full" src={`/api/Servers/${prop.DisplayName}/CoverImage.jpg`} alt=""
                    onError={(e) => (e.currentTarget.src = '/Image-not-found.png')}
                />
            </div>
        );
    }

    const cardHeader = () => {
        return (
            <span className="flex items-center">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{prop.DisplayName}</h5>
                <a href="#" className="ml-auto px-1 rounded-md hover:bg-blue-300 active:ring-1 active:outline-none active:ring-blue-300 dark:active:ring-blue-800"
                    onClick={() => toggleEdit()}>
                    <i className="pi pi-pencil" />
                </a>
            </span>
        );
    }

    const viewEntitiesButton = () => {
        return (
            <Button size="small" className="py-2! px-3!"
                onClick={() => handleSelection(prop)}>
                <span className="inline-flex items-center text-base text-center">
                    View Entities
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </span>
            </Button>
        );
    }

    const headerElement = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            <span className="font-bold white-space-nowrap">Edit Server</span>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Add" onClick={() => console.log("Clicked")} autoFocus />
        </div>
    );

    return (
        <>
            <div className="w-sm min-w-3xs bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                {coverImage()}
                <div className="p-4 flex flex-col gap-1">
                    {cardHeader()}
                    <p className="text-sm font-normal text-gray-700 dark:text-gray-400">Project: {prop.ProjectName}</p>
                    <span className="pt-2 max-w-xl">
                    {viewEntitiesButton()}
                    </span>
                </div>

                <Dialog visible={showEdit} modal header={headerElement} footer={footerContent} style={{ width: '50rem' }} onHide={() => {if (!showEdit) return; setShowEdit(false) }}>
                    <EditServer showModal={showEdit} setModal={setShowEdit} EditServer={editServer} />
                </Dialog>

            </div>

        </>
    )
}