// https://docs.cypress.io/api/introduction/api.html

it('can access page', () => {
  cy.visit('/');
  cy.contains('h1', 'Timed Report!');
});
