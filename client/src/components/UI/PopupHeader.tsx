// export default function PopupHeader() {
//     headerElement = (HeaderLabel: string) => {

import { Button } from "primereact/button";
import type { SetStateAction } from "react";

//         <div className="inline-flex align-items-center justify-content-center gap-2">
//             <span className="font-bold white-space-nowrap">{HeaderLabel}</span>
//         </div>
//     };

// }


export const headerElement = (HeaderLabel: string, handleModal: SetStateAction<boolean>) => {
    return (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            <span className="font-bold text-2xl white-space-nowrap">{HeaderLabel}</span>
        </div>
    )
};

export const footerElement = (handleModal: SetStateAction<boolean>) => {
    return (
        <div>
            <Button label="Add" onClick={() => handleModal(false)} autoFocus />
        </div>
    );
}