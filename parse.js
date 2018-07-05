const csv_parse = require('csv-parse/lib/sync');
const xmljs = require('xml-js');
const moment = require('moment-msdate');

const fs = require('fs');

const bank = require('./bank');

const parseFile = exports.parseFile = (name, extension, db) => {
	switch(extension) {
		case 'csv':
			readCSV(`${name}.${extension}`, db);
			break;
		case 'json':
			readJSON(`${name}.${extension}`, db);
			break;
		case 'xml':
			readXML(`${name}.${extension}`, db);
			break;
		default:
			console.error('unrecognised file type');
			break;
	}
}

function readJSON(filename, db) {
	fs.readFile(filename, (error, data) => {
		if(error) {
			throw error;
		}
		JSON.parse(data).forEach(e => {
			db.addTransaction(bank.Transaction.fromOldJSON(e));
		});
	})
}

function readCSV(filename, db) {
	fs.readFile(filename, (error, data)=>{
		if(error) {
			throw error;
		}
		const res = csv_parse(data, {
			cast: (arg, context) => {
				switch(context.column) {
					case 'Amount':
						let num = Number(arg);
						if(isNaN(num)) {
							console.error('parse error on line %d, column %s', context.lines, context.column);
							return 0;
						}
						return num;
					case 'Date':
						return moment(arg, 'DD/MM/Y');
					default:
						return arg; 
				}
			},

			columns: true,
		});

		res.forEach(e => {
			db.addTransaction(bank.Transaction.fromCSV(e));
		});

	});
}

function readXML(filename, db) {
	fs.readFile(filename, (error, data)=>{
		if(error) {
			throw error;
		}
		const obj = xmljs.xml2js(data, {compact:true, spaces:1});

		obj.TransactionList.SupportTransaction.forEach(e => {
			let trans = bank.Transaction.fromXML(e);
			db.addTransaction(trans);
		})

	});
}
