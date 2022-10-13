// https://docs.cypress.io/api/introduction/api.html

it('can access page', () => {
  cy.visit('/');
  cy.contains('h1', 'Timed Report!');
});

it('can create and start a new task', () => {
  cy.get('[aria-label="Add Task"]').click();

  cy.get('#card-1').find('.eta').contains('00:00:00');
  cy.get('#card-1').contains('Task description');
  cy.get('#card-1').contains('Project name');
  cy.get('#card-1').contains('Full description');
  cy.get('#card-1').contains('todo');
  cy.get('#card-1').find('.timer').contains('00:00:00');

  // starts the timer
  cy.get('#card-1').click();

  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');

  cy.wait(1000);
  cy.get('#card-1').find('.timer').contains('00:00:01');
  cy.wait(1000);
  cy.get('#card-1').find('.timer').contains('00:00:02');
});
