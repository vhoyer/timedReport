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

it('can create and edit another task while the other is running', () => {
  cy.get('[aria-label="Add Task"]').click();

  cy.get('.task-card').should('have.length', 2);

  // keep the other one running
  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');

  // edit it
  cy.get('#card-2')
    .find('.card-title')
    .dblclick()
    // dblclick enables edition
    .should('have.attr', 'contenteditable', 'true')
    .type('A new hope{enter}')
    // when user {enter}s set editable false
    .should('have.attr', 'contenteditable', 'false')
    // leave the content behind
    .contains('A new hope');

  // keep the other one running
  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');
});
