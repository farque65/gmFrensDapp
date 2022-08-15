// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
	score: number;
};

async function scorer(address: string | undefined) {
	const { PassportScorer } = await import('@gitcoinco/passport-sdk-scorer');
	const criteria = [
		{
			provider: 'Ens',
			issuer: process.env.ISSUER_DID || '',
			score: 0.5,
		},
		{
			provider: 'Poh',
			issuer: process.env.ISSUER_DID || '',
			score: 0.5,
		},
	];
	let passportScore = 999999999999999999999999;
	if (address) {
		const scorer = new PassportScorer(criteria);
		passportScore = await scorer.getScore(address);
		console.log('view passport ', passportScore);
	}
	return passportScore;
}

export default async function passportsdkScorer(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	const address: string | undefined = req.query.address
		?.toString()
		.toLowerCase();
	const result = await scorer(address);
	res.status(200).json({ score: result });
}
