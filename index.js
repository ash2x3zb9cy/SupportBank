const moment = require('moment');
const csv_parse = require('csv-parse/lib/sync');
const csv_stringify = require('csv-stringify/lib/sync');

const log4js = require('log4js');
log4js.configure({
	appenders: {
		file: { type: 'fileSync', filename: 'debug.log' },
	},
	categories: {
		default: { appenders: ['file'], level: 'debug' }
	},
});
const logger = log4js.getLogger('file');
logger.level = 'debug';
const xmljs = require('xml-js');

const fs = require('fs');
const rl = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout,
});

const bank = require('./bank');
const db = new bank.BankDB();
const {formatCurrency} = require('./utility');

const commands = [
	{regex: /^List All$/, action: (_)=>listAll(db)},
	{regex: /^List (.+)$/, action: (groups)=>listPerson(db, groups[1])},
	{regex: /^Import File (.+)\.(.+)$/, action: (groups)=>parseFile(groups[1], groups[2])},
	{regex: /^Export File (.+)\.(.+)$/, action: (groups)=>exportFile(groups[1], groups[2])},
	{regex: /.?/, action: (_)=>console.error('unrecognised command')},
];

function listAll(db) {
	db.people.forEach((v, k, _)=>{
			console.log('%s: %s', k, formatCurrency(v.balance));
	});
}

function listPerson(db, name) {
	const person = db.getPerson(name);
	if(person === undefined) {
		console.error('Person does not exist');
		return;
	};
	for(let i = 0; i < person.transactions.length; i++) {
		let trans = person.transactions[i];
		
		// "to x" / "from x"
		toText = (trans.from === name)
			// outgoing
			? `${formatCurrency(-trans.amount)} to ${trans.to}`
			: `${formatCurrency(trans.amount)} from ${trans.from}`;

		console.log('%s: %s for "%s"',
			trans.date.format('DD/MM/Y'),
			toText,
			trans.narrative
		);
	}
}

function parseFile(name, extension) {
	rl.pause();
	switch(extension) {
		case 'csv':
			readCSV(name+'.'+extension);
			break;
		case 'json':
			readJSON(name+'.'+extension);
			break;
		case 'xml':
			readXML(name+'.'+extension);
			break;
		default:
			console.error('unrecognised file type');
			break;
	}
}

function exportFile(name, extension) {
	const list = db.getAllTransactions();
	switch(extension) {
		// TODO
		case 'csv':
		case 'json':
		case 'xml':
		default:
			console.error('unrecognised file type');
			break;
	}
}

function startPrompt() {
	rl.setPrompt('SupportBank>');
	rl.prompt();
	rl.on('line', (answer)=> {
		for(let i = 0; i < commands.length; i++) {
			let command = commands[i];
			let match = answer.match(command.regex);
			if(match === null) {
				continue;
			}
			command.action(match);
			break;
		}

		rl.prompt();
	});
}

function readJSON(filename) {
	fs.readFile(filename, (e, d)=> {
		if(e) {
			throw e;
		}
		let data = JSON.parse(d);
		for(let i = 0; i < data.length; i++) {
			let datum = data[i];
			db.addTransaction(bank.Transaction.fromOldJSON(datum));
		}
		rl.resume();
	})
}

function readCSV(filename) {
	fs.readFile(filename, (e, d)=>{
		if(e) {
			throw e;
		}
		const res = csv_parse(d, {
			cast: (arg, context) => {
				switch(context.column) {
					// amount
					case 'Amount':
						let num = Math.round(arg*100);
						if(isNaN(num)) {
							console.error('parse error on line %d, column %s', context.lines, context.column);
							return 0;
						}
						return Math.round(arg*100);
					case 'Date':
						return moment(arg, 'DD/MM/Y');
					default:
						return arg; 
				}
			},

			columns: true,
		});

		for(let i = 0; i < res.length; i++) {
			db.addTransaction(bank.Transaction.fromCSV(res[i]));
		}

		rl.resume();

	});
}

function readXML(filename) {
	fs.readFile(filename, (e, d)=>{
		if(e) {
			throw e;
		}
		const obj = xmljs.xml2js(d, {compact:true, spaces:1});
		const arr = obj.TransactionList.SupportTransaction
		for(let i = 0; i < arr.length; i++) {
			let trans = bank.Transaction.fromXML(arr[i]);
			db.addTransaction(trans);
		}

		rl.resume();
	});
}

startPrompt();

readXML('Transactions2012.xml');
