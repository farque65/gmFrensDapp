/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	webpack: function (config, options) {
		config.experiments = { asyncWebAssembly: true, layers: true };
		return config;
	},
};
