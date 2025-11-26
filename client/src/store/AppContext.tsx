import React, { useState, type JSX } from "react";

export const AppContext = React.createContext({
    user: { name: 'Guest' },
    setUser: () => {},
    theme: 'light',
    setTheme: () => {},
    title: '',
    setTitle: (_Title: string) => {},
    showSidebar: true,
    setShowSidebar: (Value: boolean) => {}
})

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function AppContextProvider(props: Props): JSX.Element {
	const [user, setUser] = useState<object>({});
	const [theme, setTheme] = useState<string>('');
	const [title, setTitle] = useState<string>('');
    const [showSidebar, setShowSidebar] = useState<boolean>(true);

    const context = {
        user,
        setUser,
        theme,
        setTheme,
        title,
        setTitle,
        showSidebar,
        setShowSidebar
    };

    return (
        <AppContext.Provider value={context}>
            {props.children}
        </AppContext.Provider>
    );
}