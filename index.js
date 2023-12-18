const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const serverless = require("serverless");

require("dotenv/config");
app.use(cors());
app.use(bodyParser.json());

function readContentsOfFile(callback) {
	fs.readFile("./data.json", "utf8", (error, data) => {
		if (error) return callback(error);
		callback(null, data);
	});
}

// Get all tickets
app.get(`/`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		res.send(JSON.parse(content));
	});
});

// Update the ticket status (open/close + adding user details)
app.put(`/`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		const response = JSON.parse(content);
		const newState = response.map((seat) => {
			if (seat.id === req.body.id) {
				return { ...seat, user: req.body.user, booked: true };
			}
			return seat;
		});
		let newData = JSON.stringify(newState, null, 2);
		fs.writeFile("./data.json", newData, (err) => {
			if (err) throw err;
			console.log("Data written to file");
		});
		res.send({ message: "Ticket Booked" });
	});
});

// Get all tickets (Open/Closed)
app.get(`/tickets/:status`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		const response = JSON.parse(content);
		const result = response.filter((seat) =>
			req.params.status === "open" ? seat.booked == true : seat.booked == false
		);
		res.send(result);
	});
});

// View Ticket status
app.get(`/ticket/:id/status`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		const response = JSON.parse(content);
		const result = response.find((seat) => seat.id == req.params.id);
		res.send({ booked: result.booked });
	});
});

// View Details of the person owning the ticket
app.get(`/ticket/:id/user`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		const response = JSON.parse(content);
		const result = response.find((seat) => seat.id == req.params.id);
		res.send(result.user);
	});
});

// Reset Tickets
app.post(`/admin/reset`, async (req, res) => {
	const data = [];
	const tickets = 40;
	for (let i = 0; i < tickets; i++) {
		data.push({ id: i + 1, booked: false, user: {} });
	}
	let newData = JSON.stringify(data, null, 2);
	fs.writeFile("./data.json", newData, (err) => {
		if (err) throw err;
		console.log("Data written to file");
	});
	res.send(JSON.parse(newData));
});

// Delete Booking
app.put(`/ticket/delete`, async (req, res) => {
	readContentsOfFile(function (err, content) {
		const response = JSON.parse(content);
		const newState = response.map((seat) => {
			if (seat.id === req.body.id) {
				return { ...seat, user: {}, booked: false };
			}
			return seat;
		});
		let newData = JSON.stringify(newState, null, 2);
		fs.writeFile("./data.json", newData, (err) => {
			if (err) throw err;
			console.log("Data written to file");
		});
		res.send({ message: "Ticket Booked" });
	});
});

export const handler = serverless(app);
