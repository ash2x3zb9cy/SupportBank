const moment = require('moment');
const {getJsDateFromExcel} = require('excel-date-to-js');

// a class is not strictly necessary here -
// could just make our personDB map from String->Number
class Person {
	constructor(name='', balance=0) {
		this.name = name;
		this.balance = balance;
		this.transactions = [];
	}
}

class Transaction {
	constructor(date, from, to, narrative, amount) {
		this.date = date; this.from = from; this.to = to; this.narrative = narrative; this.amount = amount;
	}

	static fromCSV(o) {
		return new Transaction(o.Date, o.From, o.To, o.Narrative, o.Amount);
	}

	static fromOldJSON(j) {
		return new Transaction(
			moment(j.Date),
			j.FromAccount, j.ToAccount,
			j.Narrative,
			Math.round(Number(j.Amount)*100)
		);
	}

	static fromXML(x) {
		return new Transaction(
			moment(getJsDateFromExcel(x._attributes.Date)),
			x.Parties.To._text,
			x.Parties.From._text,
			x.Description._text,
			Math.round(Number(x.Value._text)*100)
		);
	}
}

class BankDB {
	constructor() {
		this.people = new Map();
	}

	// get or create
	getPerson(name) {
		let r = this.people.get(name);
		if(r === undefined) {
			r = new Person(name, 0);
			this.people.set(name, r);
		}
		return r;
	}

	addPerson(person) {
		this.people.set(person.name, person);
	}

	addTransaction(trans) {
		const from = this.getPerson(trans.from);
		const to = this.getPerson(trans.to);
		from.balance -= trans.amount;
		to.balance += trans.amount;

		from.transactions.push(trans);
		to.transactions.push(trans);
	}
}

exports.Person = Person;
exports.Transaction = Transaction;
exports.BankDB = BankDB;
