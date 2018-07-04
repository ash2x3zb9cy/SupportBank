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
			Amount: val.amount/100,
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
			Amount: val.amount/100,
		});
	});

	fs.writeFile(filename, JSON.stringify(plainTransactions, undefined, 2), e => {
		if (e) {
			throw e;
		}
		console.log(`Database exported to ${filename}.`);
	});
}