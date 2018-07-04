const moment = require('moment');

const {index} = require('./index');
const bank = require('./bank');

test('Adding a person', ()=>{
	const person = new bank.Person('Ash', 99);
	const db = new bank.BankDB();
	db.addPerson(person);
	expect(db.getPerson('Ash')).toBe(person);
});

test('Transaction', ()=>{
	const ash = new bank.Person('Ash', 0);
	const ash2 = new bank.Person('ash2', 1000);
	const db = new bank.BankDB();
	db.addPerson(ash);
	db.addPerson(ash2);

	const trans = new bank.Transaction(moment(), 'Ash', 'ash2', 'For testing', 100);
	db.addTransaction(trans);

	expect(db.getPerson('Ash').balance).toBe(-100);
	expect(db.getPerson('ash2').balance).toBe(1100);
});
