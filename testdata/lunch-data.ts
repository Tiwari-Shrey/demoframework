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
};
