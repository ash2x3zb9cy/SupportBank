const moment = require('moment-msdate');

class Person {
	constructor(name='', balance=0) {
		this.name = name;
		this.balance = balance;
		this.transactions = [];
	}
}

class Transaction {
	constructor(date, from, to, narrative, amount) {
		this.date = date;
		this.from = from;
		this.to = to;
		this.narrative = narrative;
		this.amount = amount;
	}

	static fromCSV(csvParsedObj) {
		return new Transaction(
			csvParsedObj.Date,
			csvParsedObj.From,
			csvParsedObj.To,
			csvParsedObj.Narrative,
			csvParsedObj.Amount
		);
	}

	static fromOldJSON(jsonParsedObj) {
		return new Transaction(
			moment(jsonParsedObj.Date),
			jsonParsedObj.FromAccount, jsonParsedObj.ToAccount,
			jsonParsedObj.Narrative,
			Number(jsonParsedObj.Amount)
		);
	}

	static fromXML(xmlParsedObj) {
		return new Transaction(
			moment.fromOADate(xmlParsedObj._attributes.Date),
			xmlParsedObj.Parties.From._text,
			xmlParsedObj.Parties.To._text,
			xmlParsedObj.Description._text,
			Number(xmlParsedObj.Value._text)
		);
	}
}

// TODO: Reimplmement .people using a plain object
class BankDB {
	constructor() {
		this.people = new Map();
	}

	// get or create
	getPerson(name) {
		let returnValue = this.people.get(name);
		if(returnValue === undefined) {
			returnValue = new Person(name);
			this.people.set(name, returnValue);
		}
		return returnValue;
	}

	// input: Transaction object
	addTransaction(trans) {
		const from = this.getPerson(trans.from);
		const to = this.getPerson(trans.to);
		from.balance -= trans.amount;
		to.balance += trans.amount;

		from.transactions.push(trans);
		to.transactions.push(trans);
	}

	getAllTransactions() {
		const list = [];
		this.people.forEach((person, name, _) => {
			person.transactions.forEach(trans => {
				// Due to the way we are storing transactions (on People),
				// Each transaction is listed twice, on the sender and reciever
				// So, we need to only select each on once, by arbitrarily choosing
				// to only read those to this user or from them
				if(name === trans.to) {
					list.push(trans);
				}
			})
		});
		return list;
	}
}

exports.Person = Person;
exports.Transaction = Transaction;
exports.BankDB = BankDB;
