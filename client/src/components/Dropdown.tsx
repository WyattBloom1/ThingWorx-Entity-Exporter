import { useContext, useEffect } from "react";
import { Dropdown } from 'primereact/dropdown';
import { SourceControlContext } from "../store/SourceControlContext";
import type { Server } from "../typescript/interfaces";
import { Button } from "primereact/button";

export default function DropdownComponent() {
    const { servers, getServers, getEntities, selectedServer, setServer } = useContext(SourceControlContext);

    useEffect(() => {
        getServers();
    }, []);

    function handleSelection(e: Server) {
        setServer(e);
    }

    return (
        <>
            <label htmlFor="dropdown">TW Server:</label>
            <Dropdown 
                pt={{
                    select: { 'id': 'dropdown' },
                    // root: { className: 'my-custom-dropdown-root' },
                    // input: { 'data-testid': 'dropdown-input-field', style: { backgroundColor: '#f0f0f0' } },
                    // panel: { className: 'my-custom-dropdown-panel' },
                    // item: ({ option, index }) => ({
                    //     className: `dropdown-item-${index}`,
                    //     onClick: () => console.log(`Clicked ${option.label}`),
                    // }),
                }}
            
                value={selectedServer} onChange={(e) => handleSelection(e.value)} options={servers} optionLabel="DisplayName" 
                placeholder="Select a URL" className="w-full" />                
        </>
    )
}