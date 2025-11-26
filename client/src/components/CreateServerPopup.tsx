import { Button } from "primereact/button";
import { useState } from "react";
// import { axiosInstance } from "../services/constants";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import axios from "axios";

interface Props {
    showModal: boolean,
    setModal: (Value: boolean) => void,
    refresh: (Value: boolean) => void
}

export default function CreateServerPopupComponent(props: Props){
    const [result, setResult] = useState("");
    const [displayName, setDisplayName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [appKey, setAppKey] = useState('');
    const [projectName, setProjectName] = useState('');

    const createServerEntry = async () => {
        try {
            const params = {
                "ServerName": displayName,
                "BaseURL": baseURL,
                "AppKey": appKey,
                "ProjectName": projectName
            };
            const response = await axios.post('/api/Servers', params);
            setResult(response.data);
            props.refresh(true);
            console.log("Result: ", result);
        } catch(err) {
            console.error(err);
        }
    };

    const onUpload = () => { console.log('Uploaded'); };
    const fileUploadTemplate = () => {
        return (
            <div style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>/ 1 MB</span>
                </div>
            </div>
        );
    };
    
    const headerElement = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            {/* <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" /> */}
            <span className="font-bold white-space-nowrap">Add new server</span>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Add" onClick={createServerEntry} autoFocus />
        </div>
    );

    return (
        <>
        <Dialog visible={props.showModal} modal header={headerElement} footer={footerContent} style={{ width: '50rem' }} onHide={() => {if (!props.showModal) return; props.setModal(false) }}>
            <div className="justify-content-center flex flex-col gap-4">
                <span>
                    <label htmlFor="DisplayName">Display Name:</label>
                    <InputText className="w-full" id="DisplayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </span>
                
                <span>
                    <label htmlFor="BaseURL">Base URL:</label>
                    <InputText className="w-full" id="BaseURL" value={baseURL} onChange={(e) => setBaseURL(e.target.value)} />
                </span>

                <span>
                    <label htmlFor="ProjectName">Project Name:</label>
                    <InputText className="w-full" id="ProjectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </span>

                <span>
                    <label htmlFor="AppKey">App Key:</label>
                    <InputText className="w-full" id="AppKey" value={appKey} onChange={(e) => setAppKey(e.target.value)} />
                </span>

                <span className="flex gap-4">
                    <div className="card justify-content-center">
                    <label htmlFor="Logo">Logo:</label>
                        <FileUpload id="Logo" mode="basic" name="demo[]" url="/api/upload" accept="image/*" maxFileSize={1000000} onUpload={onUpload} />
                    </div>  

                    <div  className="card justify-content-center">
                        <label htmlFor="CoverImage">Cover Image:</label>
                        <FileUpload id="CoverImage" mode="basic" name="demo[]" url="/api/upload" accept="image/*" maxFileSize={1000000} onUpload={onUpload} />
                    </div>  
                </span>
            </div>
        </Dialog>
        </>
    )
}