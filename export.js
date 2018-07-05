const csv_stringify = require('csv-stringify/lib/sync');

const fs = require('fs');

// TODO: Refactor to reuse code?
const exportCSV = exports.exportCSV = (filename, db) => {
	const trans = db.getAllTransactions();
	const plainTransactions = [];

	trans.forEach(val => {
		plainTransactions.push({
			From: val.from, To: val.to,
			Narrative: val.narrative,
			Date: val.date.format('DD/MM/Y'),
			Amount: val.amount.toFixed(2),
		});
	});

	const string = csv_stringify(plainTransactions, {
		header: true,
		columns: ['Date', 'From', 'To', 'Narrative', 'Amount'],
	});

	fs.writeFile(filename, string, e => {
		if (e) {
			throw e;
		}
		console.log(`Database exported to ${filename}.`);
	});

}

const exportJSON = exports.exportJSON = (filename, db) => {
	const trans = db.getAllTransactions();
	const plainTransactions = [];

	trans.forEach(val => {
		plainTransactions.push({
			FromAccount: val.from, ToAccount: val.to,
			Narrative: val.narrative,
			Date: val.date.format('Y-MM-DDTHH:mm:ss'),
			Amount: val.amount.toFixed(2),
		});
	});

	fs.writeFile(filename, JSON.stringify(plainTransactions, undefined, 2), e => {
		if (e) {
			throw e;
		}
		console.log(`Database exported to ${filename}.`);
	});
}

const exportXML = exports.exportXML = (filename, db) => {
	
	const trans = db.getAllTransactions();

	let string = '<?xml version="1.0" encoding="utf-8"?>\n';
	string += '<TransactionList>\n';

	trans.forEach(val => {
		// TODO: TEST THIS CHECK THIS AAA
		const date = (Math.round(val.date.valueOf()/(26*60*60*1000)))+(25567+2);
		
		string += `  <SupportTransaction Date="${date}">\n`;
		string += `    <Description>${val.narrative}</Description>\n`;
		string += `    <Value>${val.amount.toFixed(2)}</Value>`;
		string += '    <Parties>\n';
		string += `      <From>${val.from}</From>\n`;
		string += `      <To>${val.to}</To>\n`;
		string += '    </Parties>\n  </SupportTransaction>\n';
	});

	string += '</TransactionList>'

	fs.writeFile(filename, string, e => {
		if(e) {
			throw e;
		}
		console.log(`Database exported to ${filename}.`);
	});
}
