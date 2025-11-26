import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useContext, useEffect } from "react";
import { SourceControlContext } from "../store/SourceControlContext";
import type { Entity } from "../typescript/interfaces";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Entities() {
    const { entities, downloadEntityByID } = useContext(SourceControlContext);

	const formatDate = (value: Date) => {
        return value.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
        });
    };

    const dateBodyTemplate = (rowData: Entity) => {
        return formatDate(new Date(rowData.lastModifiedDate));
    };

    const typeBodyTemplate = (rowData: Entity) => {
        const type = rowData.type;

        let img;
        switch(type.toLowerCase()) {
            case 'thing':
            case 'things':
                img = 'pi pi-file'
                break;
            case 'mashup':
            case 'mashups':
                img = 'pi pi-desktop' 
                break;
        }

        return (
            <div className="flex justify-center gap-2">
                <i className={img}></i>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Entity) => {
        return <Button type="button" icon="pi pi-download" text severity="secondary" rounded onClick={() => downloadIndividualEntity(rowData)}></Button>;
    };

    function downloadIndividualEntity(Entity: Entity) {
        console.log(Entity.name, Entity.parentType);
        downloadEntityByID(Entity);
    }

    const headerTemplate = (data: Entity) => {
        return (
            <div className="">
                <span className="font-bold">{data.parentType}</span>
            </div>
        );
    };

    return (
        <div className={"flex flex-col overflow-auto rounded-lg border-gray-300 dark:border-gray-600"}>
            <DataTable value={entities} className="h-full overflow-auto" pt={{wrapper: 'border border-gray-200 rounded-lg'}} scrollable scrollHeight="100%"
                rowGroupMode="subheader" groupRowsBy="parentType" rowGroupHeaderTemplate={headerTemplate}>
                <Column field="type" header="Type" align="center" body={typeBodyTemplate}></Column>
                <Column field="name" header="Name"></Column>
                <Column field="lastModifiedDate" dataType="date" body={dateBodyTemplate} header="Last Modified Date"></Column>
                <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
        </div>
    )
}