import { Button } from "primereact/button";
import DropdownComponent from "../components/Dropdown";
import DateTimeComponent from "../components/TimePicker";
import { useContext, useState } from "react";
import { axiosInstance } from "../services/constants";
import { Calendar } from "primereact/calendar";
import { SourceControlContext } from "../store/SourceControlContext";
import CreateServerPopupComponent from "../components/CreateServerPopup";
import Entities from "../components/Entities";

export default function SourceControlComponent() {
	// const [entities, setEntities] = useState([]);
	const { entities, getEntities, selectedServer } = 
		useContext(SourceControlContext);
	const [startDate, setStartDate] = useState<Date>();
	const [startTime, setStartTime] = useState(new Date(0, 0, 0, 8));
	const [showModal, setModal] = useState(false);
	// const [selectedServer, setSelectedServer] = useState<Server | null>(null);

	async function downloadSourceControl() {
		let formattedStartDate = '';
		if(startDate)
			formattedStartDate = formatStartDate(startDate);

		const response = await axiosInstance.get(`/SourceControl`, {
			responseType: 'blob',
			params: {
				"ProjectName": selectedServer?.ProjectName,
				"StartDate": formattedStartDate,
				"ServerName": selectedServer?.DisplayName,
				"FileRepository": "SystemRepository"
			}
		});

		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(response.data);
		link.download = response.headers["content-disposition"].split("filename=")[1];
		link.click();
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

    return (
		<div className={"h-full grow grid " + (entities.length > 0 ? 'grid-rows-[auto_1fr]' : 'grid-rows-[1fr] items-center')}>
			<div className="mb-4 overflow-auto">
				<div className="flex flex-col gap-4 w-full p-2 border-gray-300 rounded-lg dark:border-gray-600 h-fit">
					<div className="grid grid-cols-5 w-0 px-2 min-w-full gap-4">
						<span className="col-span-3 items-end flex gap-2">
							<div className="text-left w-0 grow">
								<DropdownComponent/>
							</div>
							<div className="card flex justify-content-center">
								<Button icon="pi pi-plus" outlined onClick={() => { setModal(true); }} />
							</div>
						</span>
						<DateTimeComponent CalendarLabel="Start Date:" PlaceHolder="Select Start Date" StartDate={startDate} setValue={(e) => setStartDate(e.value) } />
						<span className="flex flex-col">
							<label htmlFor="startTime">Start Time:</label>
							<Calendar id="startTime" value={startTime} onChange={(e) => setStartTime(e.value) } timeOnly hourFormat="12" />
						</span>
					</div>
					<span className="w-full flex grow gap-2 p-2 text-left">
						<Button onClick={getEntities} className="" icon="pi pi-refresh" label="Get Entities"></Button>
						<Button onClick={downloadSourceControl} className="" icon="pi pi-download" label="Download Entities"></Button>
						<Button onClick={downloadSourceControl} className="" icon="pi pi-external-link" label="Export to Source Control"></Button>
					</span>
				</div>
			</div>
			<Entities />
			<CreateServerPopupComponent showModal={showModal} setModal={setModal}></CreateServerPopupComponent>
		</div>
    )
}
