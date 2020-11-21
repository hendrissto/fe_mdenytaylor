export class DateTimezoneService {
	convertUtctoLocalTimezone(dateUtc) {
		const offset = (new Date().getTimezoneOffset() * -1);
		dateUtc.setMinutes(dateUtc.getMinutes() + offset);
		return dateUtc;
	}
}
