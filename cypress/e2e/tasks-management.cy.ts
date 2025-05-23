// https://docs.cypress.io/api/introduction/api.html

const clearLocalStorage: Partial<Cypress.VisitOptions> = {
  onBeforeLoad(win) {
    win.localStorage.clear();
  },
};

it('can access page', () => {
  cy.visit('/', clearLocalStorage);
  cy.contains('h1', 'Timed Report!');
  cy.matchImage();
});

it('can create and start a new task', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate();

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

  // eslint-disable-next-line
  cy.wait(1000);
  cy.get('#card-1').find('.timer').contains('00:00:01');
  // eslint-disable-next-line
  cy.wait(1000);
  cy.get('#card-1').find('.timer').contains('00:00:02');

  cy.matchImage();
});

it('can create and edit another task while the other is running', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate({ time: '00:00:02' })
    .click();
  cy.taskCreate();

  cy.get('.task-card').should('have.length', 2);

  // keep the other one running
  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');

  cy.get('#card-2')
    .taskFieldEdit('title', 'A new hope');

  // keep the other one running
  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');

  cy.matchImage();
});

it('click task2 stops task1; click task2 again stops itself', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate({ time: '00:00:02' })
    .wait(1000)
    .click();
  cy.taskCreate({ title: 'A new hope' });

  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'true');

  cy.get('#card-2')
    .click()
    .should('have.attr', 'aria-selected', 'true');

  cy.get('#card-1')
    .should('have.attr', 'aria-selected', 'false');

  // eslint-disable-next-line
  cy.get('#card-2')
    .find('.timer')
    .contains('00:00:00')
    .wait(1000)
    .contains('00:00:01')
    .wait(1000)
    .contains('00:00:02')
    .click() // stop timer
    .wait(1000)
    .contains('00:00:02'); // timer is stopped

  cy.matchImage();
});

it('stops timer while editing time, but not other fields', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate({ time: '00:00:02' });
  cy.taskCreate({ title: 'A new hope', time: '00:00:02' });

  cy.get('#card-2')
    .should('have.attr', 'aria-selected', 'false')
    .find('.timer')
    .contains('00:00:02')

  // eslint-disable-next-line
  cy.get('#card-2')
    .click() // start timer
    .should('have.attr', 'aria-selected', 'true')
    .find('.card-subtitle')
    .dblclick()
    .type('Star Wars IV')
    .wait(1000)
    .type('{enter}')

  // eslint-disable-next-line
  cy.get('#card-2')
    .find('.timer')
    .contains('00:00:03') // time kept running while editing subtitle
    .dblclick()
    .type('01:00:00')
    .wait(1000)
    .type('{enter}')
    .contains('01:00:00')

  cy.matchImage();
});

it('change task status; done sets progress to 100%', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate({ time: '00:00:02' });
  cy.taskCreate({
    title: 'A new hope',
    project: 'Star Wars IV',
    time: '01:00:00'
  }).click();

  cy.get('#card-2')
    .findByRole('progressbar')
    .should('have.attr', 'aria-valuenow', '0')

  cy.get('#card-2')
    .rightclick()
    .get('#context-menu')
    .findByText('doing')
    .click()

  cy.get('#card-2')
    .findByText('todo')
    .should('not.exist')
    .get('#card-2')
    .findByText('doing')
    .should('exist')
    .get('#card-2')
    .findByRole('progressbar')
    .should('have.attr', 'aria-valuenow', '0')

  cy.get('#card-1')
    .findByRole('progressbar')
    .should('have.attr', 'aria-valuenow', '0')

  cy.get('#card-1')
    .rightclick()
    .get('#context-menu')
    .findByText('done')
    .click()
    .get('#card-1')
    .findByText('done')
    .should('exist')
    .get('#card-1')
    .findByRole('progressbar')
    .should('have.attr', 'aria-valuenow', '100')

  cy.matchImage();
});

it('can delete tasks', () => {
  cy.visit('/', clearLocalStorage);
  cy.taskCreate();
  cy.taskCreate();

  cy.get('.task-card').should('have.length', 2);

  cy.get('#card-1')
    .findByLabelText('Delete Task')
    .click()

  cy.get('.task-card').should('have.length', 1);

  // create two cards
  cy.taskCreate();
  cy.taskCreate();

  cy.get('.task-card').should('have.length', 3);

  cy.findByText('Clear Cards')
    .click();

  cy.get('.task-card').should('have.length', 0);

  cy.matchImage();
});

it('can change manually progress of the task', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      clearLocalStorage.onBeforeLoad?.(win);
      cy.stub(win, 'prompt').returns('69');
    },
  });

  cy.taskCreate();

  cy.get('#card-1')
    .findByText('0%')
    .click() // opens prompt with custom stub
    .get('#percentageInput')
    .type('69{enter}')
    .get('#card-1')
    .findByRole('progressbar')
    .should('have.attr', 'aria-valuenow', '69') // nice

  cy.matchImage();
});

it('can edit all field', () => {
  cy.visit('/', clearLocalStorage);

  cy.taskCreate({
    eta: '02:20:00',
    title: 'Revenge of the Sith',
    project: 'Star Wars: Episode III',
    description: 'Star Wars: Episode III – Revenge of the Sith is a 2005 American epic space opera film written and directed by George Lucas.',
    status: 'doing',
    time: '01:00:00',
  });

  cy.matchImage();
});
