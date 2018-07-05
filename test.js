const moment = require('moment');

const bank = require('./bank');

test('BankDB::getPerson default', () => {
	const db = new bank.BankDB();
	const ash = db.getPerson('Ash');
	expect(ash.balance).toBe(0);
	expect(ash.transactions).toEqual([]);
	expect(ash.name).toBe('Ash');
});

test('BankDB::addTransaction', () => {
	const db = new bank.BankDB();
	const trans = new bank.Transaction(
		moment(),
		'Ash',
		'Not Ash',
		'Testing',
		10
	);

	db.addTransaction(trans);

	const ash = db.getPerson('Ash');
	const nash = db.getPerson('Not Ash');

	expect(ash.balance).toBe(-10);
	expect(nash.balance).toBe(10);

	expect(ash.transactions).toEqual([trans]);
	expect(nash.transactions).toEqual([trans]);
});

test('BankDB::getAllTransactions', () => {
	const db = new bank.BankDB();
	const a = new bank.Transaction(
		moment(),
		'Ash',
		'Not Ash',
		'Testing',
		10
	);
	const b = new bank.Transaction(
		moment(),
		'Ash',
		'Still Not Ash',
		'Testing',
		100
	);
	db.addTransaction(a);
	db.addTransaction(b);
	const transList = db.getAllTransactions();
	expect(transList).toHaveLength(2);
	expect(transList).toContain(a);
	expect(transList).toContain(b);
});

test('Transaction.fromCSV', () => {
	const date = moment();
	const correctTrans = new bank.Transaction(
		date,
		'Ash',
		'Not Ash',
		'Testing',
		100
	);
	const csvtrans = {
		Date: date,
		From: 'Ash',
		To: 'Not Ash',
		Narrative: 'Testing',
		Amount: 100
	};
	expect(bank.Transaction.fromCSV(csvtrans)).toEqual(correctTrans);
});

test('Transaction.fromOldJSON', () => {
	const date = moment('2018-04-02T00:00:00');
	const correctTrans = new bank.Transaction(
		date,
		'Ash',
		'Not Ash',
		'Testing',
		100
	);
	const jsontrans = JSON.parse(`{
    "Date": "2018-04-02T00:00:00",
    "FromAccount": "Ash",
    "ToAccount": "Not Ash",
    "Narrative": "Testing",
    "Amount": 100
}`);
	expect(bank.Transaction.fromOldJSON(jsontrans)).toEqual(correctTrans);
});
