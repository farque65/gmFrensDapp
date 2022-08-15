import React, { useContext, useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Nav from '../components/nav';

//Context
import { UserContext } from '../context/UserContext';

const Home: NextPage = () => {
	const {
		userDid,
		orbisCreatePost,
		orbisGetPosts,
		loggedIn,
		isVerifiedPassport,
	} = useContext(UserContext);

	/**
	 * If the user is connected we show a textarea and submit button
	 * to allow users to share content on Orbis.
	 * The 'orbis' object must be passed as a parameter to maintain the connection.
	 */
	function Share() {
		const [loading, setLoading] = useState(false);
		const [text, setText] = useState<any>();

		/** We are calling the Orbis SDK to share a new post from this user */
		async function share() {
			setLoading(true);
			/**
			 * The createPost() function accept a JSON object that must contain a body
			 * which is the actual content of the post being shared.
			 */
			let res = await orbisCreatePost(
				text,
				'https://nftmarketplace/collections/azuki/5060'
			);
			/** Check if post was shared with success or not */
			if (res.status == 200) {
				console.log('Shared post with stream_id: ', res.doc);
				alert('Post shared with stream id: ' + res.doc);
				setText('');
			} else {
				console.log('Error sharing post: ', res);
				alert('Error sharing post, look at the logs.');
			}

			setLoading(false);
		}

		return (
			<div className='flex w-full justify-center items-end'>
				<div className='relative mr-4 lg:w-full xl:w-1/2 w-2/4 md:w-full text-left'>
					<input
						value={text}
						onChange={(e) => {
							setText(e.target.value);
						}}
						placeholder='Share your post here...'
						type='text'
						id='hero-field'
						name='hero-field'
						className='w-full bg-white bg-opacity-50 rounded focus:ring-2 focus:ring-indigo-200 focus:bg-transparent border border-gray-300 focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out'
					/>
				</div>

				{loading ? (
					<button>Loading...</button>
				) : (
					<button
						onClick={() => share()}
						className='inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg'
					>
						Post
					</button>
				)}
			</div>
		);
	}

	/**
	 * We will use this component to display the posts shared in the context of this specific
	 * webpage url: "https://nftmarketplace/collections/azuki/5060".
	 * This example could be used to build a decentralized commenting system for example.
	 */
	function Posts() {
		const [posts, setPosts] = useState<any>([]);
		const [loadingPosts, setLoadingPosts] = useState(false);

		/** Use the Orbis SDK to retrieve the posts shared in this context */
		async function loadPosts() {
			setLoadingPosts(true);
			let { data, error, status } = await orbisGetPosts(
				'https://nftmarketplace/collections/azuki/5060'
			);

			if (data) {
				/** If the query is successful we save the results returned in our posts array. */
				setPosts(data);
				setLoadingPosts(false);
			}
		}

		/** When the component mounts we start loading the posts from this context. */
		useEffect(() => {
			loadPosts();
		}, []);

		if (loadingPosts && loggedIn) {
			return <p>Loading posts...</p>;
		}

		/** Display the results returned from query */
		if (posts && posts.length > 0) {
			return posts.map((post: any, key: any) => {
				return (
					<div className='p-4 w-full' key={key}>
						<div className='flex flex-wrap rounded-lg h-full bg-gray-100 p-8 flex-col'>
							<div className='flex items-center mb-3'>
								<div className='w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0'>
									<svg
										fill='none'
										stroke='currentColor'
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										className='w-5 h-5'
										viewBox='0 0 24 24'
									>
										<path d='M22 12h-4l-3 9L9 3l-3 9H2'></path>
									</svg>
								</div>
								<h2 className='text-gray-900 text-lg title-font font-medium'>
									<b>Shared by: {post.creator}</b>
								</h2>
							</div>
							<div className='flex-grow'>
								<p className='leading-relaxed text-base mx-10'>
									{post.content?.body}
								</p>
							</div>
						</div>
					</div>
				);
			});
		} else {
			return <p className='mx-10'>Unable to load posts</p>;
		}
	}

	return (
		<div className='flex flex-col h-screen'>
			<Head>
				<title> GM Frens </title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Nav />
			<section className='text-gray-600 body-font'>
				<div className='container px-5 py-24 mx-auto'>
					<div className='flex flex-wrap -m-4'>
						<div className='p-4 w-full'>
							<div className='flex rounded-lg h-full bg-gray-100 p-8 flex-col border-2 border-gray-900'>
								<p className='mb-2 font-bold'>GM start posting</p>
								{userDid && loggedIn && isVerifiedPassport ? (
									<div>
										<div className='flex items-center mb-3'>
											<div className='w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0'>
												<svg
													fill='none'
													stroke='currentColor'
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													className='w-5 h-5'
													viewBox='0 0 24 24'
												>
													<path d='M22 12h-4l-3 9L9 3l-3 9H2'></path>
												</svg>
											</div>
											<h2 className='text-gray-900 text-lg title-font font-medium'>
												Connected with: {userDid?.toLowerCase()}
											</h2>
										</div>
										<Share />
									</div>
								) : (
									// <button onClick={() => connect()}>Connect</button>
									<span>Connect Wallet</span>
								)}
							</div>
						</div>

						<Posts />
					</div>
				</div>
			</section>

			<footer className='flex h-24 w-full items-center justify-center border-t'>
				<span className='flex items-center justify-center gap-2'>
					Powered by 🛠 🧠 🤍
				</span>
			</footer>
		</div>
	);
};

export default Home;
