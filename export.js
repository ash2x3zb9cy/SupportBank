const csv_stringify = require('csv-stringify/lib/sync');

const fs = require('fs');

const exportCSV = exports.exportCSV = (filename, db) => {
	const trans = db.getAllTransactions();
	const plainTransactions = [];

	trans.forEach(val => {
		plainTransactions.push({
			Date: val.date,
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
