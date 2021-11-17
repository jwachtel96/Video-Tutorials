const jwt_decode = require("jwt-decode");
const tutorial = require("../models/Tutorial");

module.exports = function (req, res) {
	let context = {};
	let jwtDetails;
	if (req.cookies.user != undefined) {
		let jwtToken = req.cookies.user;
		jwtDetails = jwt_decode(jwtToken);
		context.loggedIn = true;
	}
	let fields = req.body;
	context.firstName = jwtDetails.firstName;
	context.id = fields.id;
	context.title = fields.title;
	context.description = fields.description;
	context.imageURL = fields.imageURL;
	if (fields.isPublic == undefined) {
		fields.isPublic = "off";
	}
	fields.creationDate = new Date();
	let descriptionRegex = new RegExp(/[\w\W+]{20,}/g);
	let titleRegex = new RegExp(/[a-zA-Z]{4,20}/);
	let imageRegex = new RegExp(/^(http|https):\/\//);
	let titleGood = false;
	let descriptionGood = false;
	let imageGood = false;

	if (!titleRegex.test(fields.title)) {
		context.titleError = "titleError";
		context.titleMessage = "Title must be 4 to 20 characters";
		titleGood = false;
	} else {
		context.titleError = "";
		titleGood = true;
	}
	if (!descriptionRegex.test(fields.description)) {
		context.descriptionError = "descriptionError";
		context.descriptionMessage = "Description must be 20 characters long";
		titleGood = false;
	} else {
		context.descriptionError = "";
		descriptionGood = true;
	}
	if (!imageRegex.test(fields.imageURL)) {
		context.imageError = "imageError";
		context.imageMessage = "Image URL must begin with http:// or https://";
		imageGood = false;
	} else {
		context.imageError = "";
		imageGood = true;
	}
	if (titleGood == false || descriptionGood == false || imageGood == false) {
		res.render("createTutorial", context);
	} else {
		new tutorial({
			title: fields.title,
			imageURL: fields.imageURL,
			videoURL: fields.videoURL,
			description: fields.description,
			isPublic: fields.isPublic,
			creationDate: fields.creationDate,
			createdBy: jwtDetails.username,
		})
			.save()
			.then((tutorial) => {
				res.status(201);
				res.cookie("status", {
					type: "success",
					message: "Tutorial created successfully",
				});
				res.redirect("/");
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
