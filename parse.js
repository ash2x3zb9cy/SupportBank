const csv_parse = require('csv-parse/lib/sync');
const xmljs = require('xml-js');
const moment = require('moment');

const fs = require('fs');

const bank = require('./bank');

const parseFile = exports.parseFile = (name, extension, db) => {
	switch(extension) {
		case 'csv':
			readCSV(name+'.'+extension, db);
			break;
		case 'json':
			readJSON(name+'.'+extension, db);
			break;
		case 'xml':
			readXML(name+'.'+extension, db);
			break;
		default:
			console.error('unrecognised file type');
			break;
	}
}

function readJSON(filename, db) {
	fs.readFile(filename, (e, d)=> {
		if(e) {
			throw e;
		}
		let data = JSON.parse(d);
		for(let i = 0; i < data.length; i++) {
			let datum = data[i];
			db.addTransaction(bank.Transaction.fromOldJSON(datum));
		}
	})
}

function readCSV(filename, db) {
	fs.readFile(filename, (e, d)=>{
		if(e) {
			throw e;
		}
		const res = csv_parse(d, {
			cast: (arg, context) => {
				switch(context.column) {
					// amount
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

		for(let i = 0; i < res.length; i++) {
			db.addTransaction(bank.Transaction.fromCSV(res[i]));
		}

	});
}

function readXML(filename, db) {
	fs.readFile(filename, (e, d)=>{
		if(e) {
			throw e;
		}
		const obj = xmljs.xml2js(d, {compact:true, spaces:1});
		console.log(obj);
		const arr = obj.TransactionList.SupportTransaction
		for(let i = 0; i < arr.length; i++) {
			let trans = bank.Transaction.fromXML(arr[i]);
			db.addTransaction(trans);
		}

	});
}