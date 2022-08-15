// --- React Methods
import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';

type OrbisGetPostResponse = {
	data?: string | undefined;
	status?: string | undefined;
	error?: string | undefined;
};

type OrbisCreatePostResponse = {
	doc?: string | undefined;
	status?: number | string | undefined;
	error?: string | undefined;
};

const startingOrbisGetPost: OrbisGetPostResponse = {
	data: undefined,
	status: undefined,
	error: undefined,
};

const startingOrbisCreatePost: OrbisCreatePostResponse = {
	doc: undefined,
	status: undefined,
	error: undefined,
};

export interface UserContextState {
	address: string | undefined;
	setAddress: Dispatch<SetStateAction<string>>;
	handleConnection: (newAddres: string) => void;
	orbisContextConnect: () => void;
	orbisContextLogout: () => void;
	orbisCreatePost: (
		body: string,
		context?: string
	) => Promise<OrbisCreatePostResponse>;
	orbisGetPosts: (context: string) => Promise<OrbisGetPostResponse>;
	userDid: string | undefined;
	setLoggedIn: Dispatch<SetStateAction<boolean>>;
	loggedIn: boolean;
	setPassportScore: Dispatch<SetStateAction<number>>;
	isVerifiedPassport: boolean | undefined;
}

const startingState: UserContextState = {
	address: undefined,
	setAddress: () => {},
	handleConnection: (newAddress: string) => {},
	orbisContextConnect: async () => {},
	orbisContextLogout: async () => {},
	orbisCreatePost: async (body: string, context?: string) =>
		startingOrbisCreatePost,
	orbisGetPosts: async (context: string) => startingOrbisGetPost,
	userDid: undefined,
	setLoggedIn: () => {},
	loggedIn: false,
	setPassportScore: () => {},
	isVerifiedPassport: undefined,
};

/** Import Orbis SDK */
import { Orbis } from '@orbisclub/orbis-sdk';

/**
 * Initialize the Orbis class object:
 * - You can make this object available on other components by passing it as
 * a prop or by using a context.
 */
let orbis = new Orbis();

// create our app context
export const UserContext = createContext(startingState);

export const UserContextProvider = ({ children }: { children: any }) => {
	const [loggedIn, setLoggedIn] = useState(false);

	const [address, setAddress] = useState<string>('');
	const [userDid, setUserDid] = useState<string | undefined>();
	const [isVerifiedPassport, setIsVerifiedPassport] = useState<boolean>(false);
	const [passportScore, setPassportScore] = useState<number>(0);

	//update passport verified status
	useEffect(() => {
		console.log('score ', passportScore);
		// Default score requirement set to 0.5 so user only needs one valid stamp
		if (passportScore >= 0.5) {
			console.log('updated passport score');
			setIsVerifiedPassport(true);
		} else {
			setIsVerifiedPassport(false);
		}
	}, [userDid, address, loggedIn]);

	useEffect(() => {
		if (address) {
			setUserDid(address);
		}
	}, []);

	// Toggle connect/disconnect
	const handleConnection = async (newAddress: string) => {
		if (!newAddress) {
			setAddress('');
		} else {
			setAddress(newAddress);
		}
	};

	const orbisContextConnect = async () => {
		console.log('connecting now');
		let res = await orbis.connect();
		/** Check if connection is successful or not */
		if (res.status == 200) {
			setUserDid(res.did);
		} else {
			console.log('Error connecting to Ceramic: ', res);
			alert('Error connecting to Ceramic.');
		}
	};
	const orbisContextLogout = async () => {
		let res = await orbis.logout();
		if (res.status == 200) {
			setUserDid(undefined);
			setIsVerifiedPassport(false);
			setPassportScore(0);
			console.log('score logged out');
		}
	};
	const orbisCreatePost = async (body: string, context?: string) => {
		let res = { data: undefined, error: undefined, status: undefined };
		if (isVerifiedPassport) {
			res = await orbis.createPost({
				body: body,
				context: context || undefined,
			});
		}
		return res;
	};
	const orbisGetPosts = async (context: string) => {
		let res = { data: undefined, error: undefined, status: undefined };
		if (isVerifiedPassport) {
			res = await orbis.getPosts({ context: context });
		}
		return res;
	};

	const stateMemo = useMemo(
		() => ({
			address,
			setAddress,
			handleConnection,
			orbisContextConnect,
			orbisContextLogout,
			orbisCreatePost,
			orbisGetPosts,
			userDid,
			setLoggedIn,
			loggedIn,
			setPassportScore,
			isVerifiedPassport,
		}),
		[address, userDid, isVerifiedPassport]
	);

	// use props as a way to pass configuration values
	const providerProps = {
		address,
		setAddress,
		handleConnection,
		orbisContextConnect,
		orbisContextLogout,
		orbisCreatePost,
		orbisGetPosts,
		userDid,
		setLoggedIn,
		loggedIn,
		setPassportScore,
		isVerifiedPassport,
	};

	return (
		<UserContext.Provider value={providerProps}>
			{children}
		</UserContext.Provider>
	);
};
