import { useContext, useEffect, useState } from "react";
import { SourceControlContext } from "../store/SourceControlContext";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { AppContext } from "../store/AppContext";
import DateTimeComponent from "./TimePicker";
import Entities from "./Entities";
import Header from "../containers/Header";

export default function SelectedServer() {
    const { entities, setEntities, getEntities, servers, selectedServer, setServer, getServerById, downloadEntities } = useContext(SourceControlContext);
    const {displayName} = useParams();
    const { setTitle } = useContext(AppContext);
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState<Date>(new Date(0, 0, 0, 8));

    async function downloadSourceControl() {
        let formattedStartDate = '';
        if(startDate)
            formattedStartDate = formatStartDate(startDate);

        downloadEntities(formattedStartDate);
    }

    function padTwoDigits(num: number) {
		return num.toString().padStart(2, "0");
	}
	const formatStartDate = (date: Date) => {
		// LastDate is stored in UTC time in TW and converts the input date to UTC. 
		// To account for this time conversion, we need to subtract the offset the input time by what it will get converted to in UTC (the current offset)
		const offset = new Date().getTimezoneOffset() / 60;

		date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime.getHours() + offset, startTime.getMinutes());
		const formattedStartDate = (
			[
				date.getFullYear(),
				padTwoDigits(date.getMonth() + 1),
				padTwoDigits(date.getDate()),
			].join("-") +
			"T" +
			[
				padTwoDigits(date.getHours()),
				padTwoDigits(date.getMinutes()),
				"00.000Z"
			].join(":")
		);

		
		return formattedStartDate;
	}

    useEffect(() => {
        setEntities();
        if(!selectedServer) {
            if(servers.length == 0) {
                getServerById(displayName?? '');
            }
            else {
                let foundServer = servers.find(row => row.DisplayName == displayName);
                if(foundServer) {
                    setServer(foundServer);
                }
                else 
                    console.log("Not found", servers, displayName)
            }
        }
        setTitle('Servers / ' + displayName);
    }, []);
    
    const _getEntities = () => {
        let formattedStartDate = '';
        if(startDate)
            formattedStartDate = formatStartDate(startDate);
        getEntities(formattedStartDate);
        // navigate(`Entities`)
    }

    // useState(getEntities)

    return (
        <div className="max-w-5xl mx-auto">
            <Header Header={displayName?? ""} />

            <div className="px-10 flex flex-col gap-3">
                <DateTimeComponent CalendarLabel="Start Date:" PlaceHolder="Select Start Date" startDate={startDate} setStartDate={setStartDate}
                    startTime={startTime} setStartTime={setStartTime} />

                <div className="flex gap-2">
                    <Button className="border grow bg-white! text-black! border-gray-300! rounded-md p-4 flex items-center hover:bg-gray-100! justify-cente group/server hover:cursor-pointer"
                        onClick={_getEntities}>
                            Get Entities
                    </Button>

                    <Button className="border grow bg-white! text-black! border-gray-300! rounded-md p-4 flex items-center hover:bg-gray-100! justify-cente group/server hover:cursor-pointer"
                        onClick={downloadSourceControl}>
                            Download Entities
                    </Button>
                </div>

                {entities && entities.length > 0 && <Entities />}
            </div>
        </div>
    )
}