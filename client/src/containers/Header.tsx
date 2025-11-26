import { useContext } from "react"
import { AppContext } from "../store/AppContext";

export default function Header(prop: { Header: string }) {
    const { title } = useContext(AppContext);

    return (
        <div className="flex flex-col w-full pt-4 px-10 pb-4 mt-4">
            <div className="my-0 mx-auto w-full max-w-5xl justify-center">
                <h2 className="text-2xl text-gray-600 font-semibold">{prop.Header}</h2>
            <hr className="h-px my-4 bg-gray-300 border-0" />
            </div>
        </div>
    )
}