export const LUNCH_DATA = {
  pageTitle: 'Daily Feast – Book Your Lunch',
  // An ID that is not registered in the system — used for negative login checks.
  unregisteredEmployeeId: '999999',
  messages: {
    emptyEmployeeId: 'Please enter your Employee ID.',
    unregisteredEmployeeId: (id: string) =>
      `Employee ID ${id} not registered. Please contact Admin.`,
    loggedOut: 'Logged out successfully.',
  },
  logoutDialog: {
    title: 'Logging out?',
    message: "Are you sure you want to sign out? You'll need to log in again to book lunch.",
    cancelButton: 'Wait, no!',
    confirmButton: 'Yes, Bye! 👋',
  },
};
