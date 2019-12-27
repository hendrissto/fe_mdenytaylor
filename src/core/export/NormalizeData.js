import * as _ from 'lodash';

export default class NormalizeData {
    removeObjectByFilter(data = [], filter = {}) {
			const newData = [];
			const cleanFilter = this.removeFalseValue(filter);

			for(let i = 0; i < data.length; i++) {
				newData.push(_.pick(data[i], cleanFilter))
			}

			return newData;
		}

		removeFalseValue(data) {
			let finalValue = Object.keys(data).filter(function(x) {
				return data[x] !== false
			})

			return finalValue;
		}
}