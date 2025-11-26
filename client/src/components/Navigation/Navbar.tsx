import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../store';


export default function NavbarComponent() {
	const {showSidebar, setShowSidebar, title} = useContext(AppContext);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 1030); // Example breakpoint

    useEffect(() => {
        const handleResize = () => {
          	setIsMobile(window.innerWidth <= 1030); // Update state based on new width
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
          	window.removeEventListener('resize', handleResize);
        };
	// Empty dependency array ensures this runs only once on mount and unmount
    }, []);

	useEffect(() => {
		setShowSidebar(!isMobile);
		console.log("IsMobile: ", isMobile);
	}, [isMobile])

	return (
		<>
			<nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 w-full z-200">
				<div className="flex gap-4 h-12 justify-start items-center">
					<i className='pi pi-bars font-normal! hover:cursor-pointer rounded-lg p-3 hover:bg-blue-300 active:ring-1 active:outline-none active:ring-blue-300 dark:active:ring-blue-800'
						onClick={() => setShowSidebar(!showSidebar)} />
					{/* <Button label="" className="w-12" severity='secondary' text icon="pi pi-bars"/> */}
					{/* <img className="h-auto w-42 items-center" src={`/tristar-logo.png`} alt=""
						onError={(e) => (e.currentTarget.src = '/Image-not-found.png')} /> */}
					<h2 className='text-2xl font-medium'>{title}</h2>
					{/* {ClientRoutes.map(({ name, dest }, idx) => (
						<NavLink to={dest} className='nav-NavLink' key={idx}>
							<Button text  className="text-black!">{name}</Button>
						</NavLink>
					))} */}
				</div>
			</nav>
		</>
	);
}
