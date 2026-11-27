export const LUNCH_DATA = {
  pageTitle: 'Daily Feast – Book Your Lunch',
  // An ID that is not registered in the system — used for negative login checks.
  unregisteredEmployeeId: '999999',
  // Registered employee used by DFTC-22. If they already booked today, login goes
  // straight to the Leaderboard; otherwise to Today's Menu. The test handles both.
  bookedEmployee: {
    id: '1132',
    name: 'Achyut Krishna Sharma',
  },
  employeeIdPlaceholder: 'e.g. 1034',
  employeeIdHint: 'Enter your SDET Technologies employee number.',
  messages: {
    emptyEmployeeId: 'Please enter your Employee ID.',
    unregisteredEmployeeId: (id: string) =>
      `Employee ID ${id} not registered. Please contact Admin.`,
    loggedOut: 'Logged out successfully.',
    loggedOutFull: 'Logged out successfully. See you tomorrow! 👋',
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
