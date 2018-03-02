
let ClassCreater = function(){
	let classMap = new Map();

	let create = function(Clazz) {
		debugger;
		if (classMap.get(Clazz.className)) {
			return classMap.get(Clazz.className)
		}
		let clazz = new Clazz();
		classMap.set(Clazz.className, clazz);
		return clazz;
	}

	return {
		create: create
	}
}();

module.exports = ClassCreater;