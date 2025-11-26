import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import type { Server, serverInterfaceKeys } from "../typescript/interfaces";

interface Props {
    showModal: boolean;
    setModal: (Value: boolean) => void;
    EditServer: Server;
}

interface InputTextInterface {
    type: string;
    name: keyof typeof serverInterfaceKeys; 
    label: string;
    class?: string | undefined;
    value?: string;
    onChange?: () => {};
}

export default function EditServer(props: Props) {
    const [formData, setFormData] = useState<Server>({
        DisplayName: '',
        ProjectName: '',
        CoverImage: '',
        Logo: '',
        AppKey: '',
        BaseURL: ''
    });
    
    useEffect(() => {
        console.log("Props: ", props.EditServer);
        if (props.EditServer) {
            setFormData({...props.EditServer});
        }
    }, []);


    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    function handleSubmit(e: { preventDefault: () => void; target: any; }) {
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);

        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
    }

    const inputText = (Input: InputTextInterface) => {
        if(!Input.class)
            Input.class = "w-full";

        return (
            <span>
                <label htmlFor={Input.name}>{Input.label}</label>
                <InputText className={Input.class}
                    id={Input.name}
                    type={Input.type}
                    name={Input.name}
                    value={formData[Input.name]}
                    onChange={handleChange}
                />
            </span>
        )
    };

    return (
        <div>
            {/* <Dialog visible={props.showModal} modal header={headerElement} footer={footerContent} style={{ width: '50rem' }} onHide={() => {if (!props.showModal) return; props.setModal(false) }}> */}
                <form method="post" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        {inputText({"name":"DisplayName", "type":"text", label: "Display Name:"})}
                        {inputText({"name":"BaseURL", "type":"text", label: "Base URL:"})}
                        {inputText({"name":"AppKey", "type":"text", label: "App Key:"})}
                        {inputText({"name":"ProjectName", "type":"text", label: "Project Name:"})}
                    </div>
                </form>
            {/* </Dialog> */}
        </div>
    )
}