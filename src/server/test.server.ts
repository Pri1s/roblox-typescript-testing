const startTimer = (minutes: number, seconds: number): void => {
	let totalSeconds = minutes * 60 + seconds;

	const countdown = () => {
		if (totalSeconds <= 0) {
			print("Timer finished!");
			return;
		}

		print(`Time left: ${totalSeconds} seconds`);
		totalSeconds--;

		task.delay(1, countdown);
	};

	countdown();
};

// Example usage: Start a timer for 1 minute and 30 seconds
startTimer(1, 30);
