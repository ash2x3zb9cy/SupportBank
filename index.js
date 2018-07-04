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

const fs = require('fs');
const rl = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout,
});

const parse = require('./parse');
const exportDB = require('./export');
const bank = require('./bank');
const db = new bank.BankDB();
const {formatCurrency} = require('./utility');

const commands = [
	{regex: /^List All$/, action: (_)=>listAll(db)},
	{regex: /^List (.+)$/, action: (groups)=>listPerson(db, groups[1])},
	{regex: /^Import File (.+)\.(.+)$/, action: (groups)=>parse.parseFile(groups[1], groups[2], db)},
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

function exportFile(name, extension) {
	const list = db.getAllTransactions();
	switch(extension) {
		// TODO
		case 'csv':
			exportDB.exportCSV(name+'.'+extension, db);
			break;
		case 'json':
			exportDB.exportJSON(name+'.'+extension, db);
			break;
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
parse.parseFile('Transactions2014', 'csv', db);
startPrompt();
