export const LUNCH_DATA = {
  pageTitle: 'Daily Feast – Book Your Lunch',
  // An ID that is not registered in the system — used for negative login checks.
  unregisteredEmployeeId: '999999',
  // A registered employee who has ALREADY booked lunch today, so login goes
  // straight to the Leaderboard instead of Today's Menu (DFTC-22).
  bookedEmployee: {
    id: '1132',
    name: 'Achyut Krishna Sharma',
  },
  employeeIdPlaceholder: 'e.g. 1034',
  messages: {
    emptyEmployeeId: 'Please enter your Employee ID.',
    unregisteredEmployeeId: (id: string) =>
      `Employee ID ${id} not registered. Please contact Admin.`,
    loggedOut: 'Logged out successfully.',
    alreadyBooked: (name: string) =>
      `Hey ${name}! You've already booked today. Check your score! 🎉`,
  },
  leaderboardBanner: /🏆 Top Food Smashers · \d{4} 🏆/,
  maxRankingRows: 25,
  logoutDialog: {
    title: 'Logging out?',
    message: "Are you sure you want to sign out? You'll need to log in again to book lunch.",
    cancelButton: 'Wait, no!',
    confirmButton: 'Yes, Bye! 👋',
  },
};
