import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	parseISO,
} from "date-fns";

const computeFriendlyDifferenceByDate = (startDate, finalDate) => {
	const hours = differenceInHours(startDate, finalDate);
	let message = hours === 1 ? "hora" : "horas";

	if (hours === 0) {
		const minutes = differenceInMinutes(startDate, finalDate);
		message = minutes === 1 ? "minuto" : "minutos";

		return `${minutes} ${message}`;
	}

	if (hours < 24) {
		return `${hours} ${message}`;
	}

	const days = differenceInDays(startDate, finalDate);
	message = days === 1 ? "dia" : "dias";

	return `${days} ${message}`;
};

export const computeFriendlyDifferenceFromNow = (date) => {
	if (!date) {
		return "...";
	}

	const parsedDate = parseISO(date);
	const today = new Date();

	return computeFriendlyDifferenceByDate(today, parsedDate);
};
