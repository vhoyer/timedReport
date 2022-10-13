// https://docs.cypress.io/api/introduction/api.html

describe('TimedReport', () => {
  before(() => {
    cy.visit('/');
  });

  it('visits the app root url', () => {
    cy.contains('h1', ' Timed Report! ');
  });

  describe('when user creates a task', () => {
    it('visits the app root url', () => {
      cy.contains('h1', ' Timed Report! ');
    });
  });
});
