module.exports = {
	toBeEmpty: function(util, customEqualityTesters) {
		return {
			compare: function(actual, expected) {
				if (expected === undefined) {
					expected = '';
				}

				var result = {};

				result.pass = util.equals(Object.keys(actual).length, 0, customEqualityTesters);

				if(result.pass)	{
					result.message = "Object is empty";
				}
				else {
					result.message = "Expected " + actual + " to be empty";
				}

				return result;
			}
		}
	}
}