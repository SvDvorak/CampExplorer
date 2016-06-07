module.exports = function(tag, page) {
	var options = {
	method: "POST",
	uri: "https://bandcamp.com/api/discover/2/get",
	headers: { "Content-Type": "application/json;charset=UTF-8" },
	json: {
    	"s": "top",
		"p": page,
		"t": tag
		}
	};

	return options;
};