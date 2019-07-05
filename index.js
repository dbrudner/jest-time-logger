const fs = require("fs");
const path = require("path");
const differenceInMilliseconds = require("date-fns/difference_in_milliseconds");

module.exports = class JestTimeLogger {
	getLogPath() {
		return path.resolve(__dirname, "./jest-time-log.json");
	}

	getLog() {
		try {
			return JSON.parse(fs.readFileSync(this.getLogPath(), "utf-8"));
		} catch (err) {
			throw new Error(
				"No log file found. Run a test to create a log file."
			);
		}
	}

	apply(jestHooks) {
		jestHooks.onTestRunComplete(({ startTime }) => {
			const start = new Date(startTime);
			const finish = new Date();

			if (differenceInMilliseconds(finish, start) < 1000) {
				return;
			}

			const newTestLog = {
				start,
				finish
			};

			let log = {};

			try {
				const { tests } = this.getLog();

				log.tests = [...tests, newTestLog];
			} catch (err) {
				log.tests = [newTestLog];
			}

			fs.writeFileSync(this.getLogPath(), JSON.stringify(log), "utf-8");
		});
	}

	getUsageInfo() {
		return {
			key: "d",
			prompt: "get metrics from jest-time-logger"
		};
	}

	run() {
		let log;

		try {
			log = this.getLog();
		} catch (err) {
			console.warn(`\n\n${err.message}\n\n`);

			return new Promise(function(resolve, reject) {
				resolve(false);
			});
		}

		const totalTimeMs = log.tests.reduce(
			(total, { start, finish }) =>
				total + differenceInMilliseconds(finish, start),
			0
		);

		let milliseconds = parseInt((totalTimeMs % 1000) / 10);
		let seconds = Math.floor((totalTimeMs / 1000) % 60);
		let minutes = Math.floor((totalTimeMs / (1000 * 60)) % 60);
		let hours = Math.floor((totalTimeMs / (1000 * 60 * 60)) % 24);

		hours = hours < 10 ? `0${hours}` : hours;
		minutes = minutes < 10 ? `0${minutes}` : minutes;
		seconds = seconds < 10 ? `0${seconds}` : seconds;

		const formattedTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
		const numberOfTests = log.tests.length;
		const averageTestTime = `${(totalTimeMs / numberOfTests / 1000).toFixed(
			2
		)} seconds`;

		const longestTest =
			log.tests.reduce((longestTimeTime, { start, finish }) => {
				const diff = differenceInMilliseconds(finish, start);
				return diff > longestTimeTime ? diff : longestTimeTime;
			}, 0) / 1000;

		console.table({
			"Total time spent running tests (hh:mm:ss)": formattedTime,
			"Total test runs logged": numberOfTests,
			"Average test run time": averageTestTime,
			"Longest test run time": `${longestTest.toFixed(2)} seconds`
		});

		return new Promise(function(resolve, reject) {
			resolve(false);
		});
	}
};
